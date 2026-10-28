const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadEngine, weeksToGrid, parseOutputs } = require('../action/lib');

const LEVEL_NAMES = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];

/** Calendario GraphQL sintético: semana inicial y final parciales, como devuelve GitHub */
function fakeWeeks() {
  const weeks = [];
  const start = new Date(Date.UTC(2025, 9, 22)); // miércoles
  let week = { contributionDays: [] };
  for (let i = 0; i < 369; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const level = (i * 7) % 5;
    week.contributionDays.push({
      date: d.toISOString().slice(0, 10),
      weekday: d.getUTCDay(),
      contributionCount: level * 3,
      contributionLevel: LEVEL_NAMES[level]
    });
    if (d.getUTCDay() === 6) {
      weeks.push(week);
      week = { contributionDays: [] };
    }
  }
  if (week.contributionDays.length) weeks.push(week);
  return weeks;
}

test('weeksToGrid coloca cada día en su fila y la semana actual en la última columna', () => {
  const weeks = fakeWeeks();
  const grid = weeksToGrid(weeks);
  assert.strictEqual(grid.length, 53);
  const lastDay = weeks.at(-1).contributionDays.at(-1);
  const cell = grid[52][lastDay.weekday];
  assert.strictEqual(cell.date, lastDay.date);
  for (const column of grid) {
    for (const c of column) {
      if (c.date) assert.strictEqual(new Date(c.date + 'T00:00:00Z').getUTCDay(), c.y);
    }
  }
});

test('weeksToGrid rellena con columnas vacías si hay menos de 53 semanas', () => {
  const grid = weeksToGrid(fakeWeeks().slice(-10));
  assert.strictEqual(grid.length, 53);
  assert.ok(grid.slice(0, 43).every(col => col.every(c => c.level === 0 && c.date === null)));
});

test('parseOutputs valida rutas y opciones', () => {
  assert.deepStrictEqual(parseOutputs('dist/a.svg\n  dist/b.svg?theme=light&speed=fast \n'), [
    { file: 'dist/a.svg', options: {} },
    { file: 'dist/b.svg', options: { theme: 'light', speed: 'fast' } }
  ]);
  assert.throws(() => parseOutputs(''), /vacío/);
  assert.throws(() => parseOutputs('dist/a.svg?color=red'), /Opción desconocida 'color'/);
  assert.throws(() => parseOutputs('dist/a.svg?theme=pink'), /no válido para 'theme'/);
  assert.throws(() => parseOutputs('dist/a.png'), /\.svg/);
});

test('el SVG generado anima y vacía todas las celdas con contribuciones', () => {
  const engine = loadEngine();
  const grid = weeksToGrid(fakeWeeks());
  const lit = grid.flat().filter(c => c.level > 0).length;
  const svg = new engine.ExporterEngine().buildAnimatedSvg(grid, { theme: 'dark' });

  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  const cells = [...svg.matchAll(/@keyframes c[\d_]+\{(.*?)\}\}/g)];
  assert.strictEqual(cells.length, lit);
  // El último color antes de restaurar la matriz debe ser el de celda vacía
  for (const [, frames] of cells) {
    const fills = [...frames.matchAll(/fill:(#[0-9a-f]+)/g)].map(m => m[1]);
    assert.strictEqual(fills.at(-2), '#0a140e');
  }
  assert.ok(svg.length < 200 * 1024, `SVG demasiado grande: ${svg.length} bytes`);
});

test('run escribe un archivo por salida (API pública simulada)', async () => {
  const { run } = require('../action/lib');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snake-'));
  const realFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      contributions: fakeWeeks().flatMap(w => w.contributionDays).map(d => ({
        date: d.date, count: d.contributionCount, level: LEVEL_NAMES.indexOf(d.contributionLevel)
      }))
    })
  });
  try {
    await run({ username: 'octocat', outputs: 'out/a.svg\nout/b.svg?theme=light', token: '', cwd: dir, log: () => {} });
  } finally {
    global.fetch = realFetch;
  }
  assert.ok(fs.readFileSync(path.join(dir, 'out/a.svg'), 'utf8').includes('#040806'));
  assert.ok(fs.readFileSync(path.join(dir, 'out/b.svg'), 'utf8').includes('#ffffff'));
});

test('el workflow que genera la web usa salidas que la Action acepta', () => {
  const engine = loadEngine();
  const exporter = new engine.ExporterEngine();
  const outputsOf = (yaml) => yaml.split('outputs: |\n')[1].split('\n\n')[0];

  const adaptive = exporter.generateWorkflowYaml('octocat', {
    adaptive: true, darkTheme: 'cyberpunk', lightTheme: 'light', morph: 'capsule', speed: 'fast', pause: 'none'
  });
  assert.deepStrictEqual(parseOutputs(outputsOf(adaptive)), [
    { file: 'dist/github-snake.svg', options: { theme: 'light', morph: 'capsule', speed: 'fast', pause: 'none' } },
    { file: 'dist/github-snake-dark.svg', options: { theme: 'cyberpunk', morph: 'capsule', speed: 'fast', pause: 'none' } }
  ]);

  const single = exporter.generateWorkflowYaml('octocat', { adaptive: false, darkTheme: 'amber_terminal' });
  assert.deepStrictEqual(parseOutputs(outputsOf(single)), [
    { file: 'dist/github-snake.svg', options: { theme: 'amber_terminal' } }
  ]);
  assert.match(exporter.generateReadmeSnippet('octocat', { adaptive: false }), /^<img [^>]*output\/github-snake\.svg/);
  assert.match(exporter.generateReadmeSnippet('octocat', { adaptive: true }), /github-snake-dark\.svg/);
  assert.match(exporter.generateReadmeSnippet('octocat', { adaptive: false }), /snake eating @octocat contributions by GITHUB_SNAKE\.EXE/);
});

test('el SVG parte de la matriz original aunque la partida ya haya comido celdas', () => {
  const engine = loadEngine();
  const grid = weeksToGrid(fakeWeeks());
  const exporter = new engine.ExporterEngine();
  const before = exporter.buildAnimatedSvg(grid, {});
  grid.flat().forEach(c => { c.level = 0; });
  assert.strictEqual(exporter.buildAnimatedSvg(grid, {}).length, before.length);
});

test('con endpoint configurado, el README apunta a /api/<usuario>.svg con las opciones elegidas', () => {
  const engine = loadEngine();
  const exporter = new engine.ExporterEngine();
  const snippet = exporter.generateReadmeSnippet('octocat', { adaptive: true, darkTheme: 'cyberpunk', lightTheme: 'light', morph: 'capsule' }, 'https://snake.example.dev');
  assert.match(snippet, /srcset="https:\/\/snake\.example\.dev\/api\/octocat\.svg\?theme=cyberpunk&morph=capsule"/);
  assert.match(snippet, /src="https:\/\/snake\.example\.dev\/api\/octocat\.svg\?theme=light&morph=capsule"/);
});

test('la simulación se reutiliza entre estilos y se recalcula si cambia la matriz', () => {
  const engine = loadEngine();
  const exporter = new engine.ExporterEngine();
  const grid = weeksToGrid(fakeWeeks());
  exporter.buildAnimatedSvg(grid, { theme: 'dark' });
  exporter.buildAnimatedSvg(grid, { theme: 'light', morph: 'retro', speed: 'fast' });
  assert.strictEqual(exporter.simulationCache.size, 1);

  // Pintar una celda (modo pintar de la web) cambia originalLevel: nueva simulación, no la vieja
  const cell = grid.flat().find(c => c.originalLevel === 0);
  cell.originalLevel = 4;
  const svg = exporter.buildAnimatedSvg(grid, { theme: 'dark' });
  assert.strictEqual(exporter.simulationCache.size, 2);
  assert.ok(svg.includes(`c${cell.x}_${cell.y}`), 'la celda pintada se anima');
});

test('cabecera: usuario escapado, contribuciones del año con el formato del idioma y celebración solo si se vacía', () => {
  const engine = loadEngine();
  const exporter = new engine.ExporterEngine();
  const grid = weeksToGrid(fakeWeeks());
  const total = grid.flat().reduce((sum, c) => sum + (c.originalLevel > 0 ? c.count : 0), 0);

  const en = exporter.buildAnimatedSvg(grid, { user: 'a<b>', lang: 'en' });
  assert.ok(en.includes('@a&lt;b&gt;'), 'el usuario va escapado');
  assert.ok(!en.includes('@a<b>'));
  assert.ok(en.includes(`${total.toLocaleString('en-US')} contributions in the last year`));
  assert.ok(en.includes('100% DEVOURED'));

  const es = exporter.buildAnimatedSvg(grid, { lang: 'es' });
  assert.ok(es.includes(`${total.toLocaleString('de-DE')} contribuciones en el último año`), 'separador de miles con punto');
  assert.ok(es.includes('100% DEVORADO'));
  assert.ok(!es.includes('">@'), 'sin usuario no hay @ en la cabecera');

  // Sin pausa no hay celebración
  assert.ok(!exporter.buildAnimatedSvg(grid, { pause: 'none' }).includes('DEVOURED'));
});

test('lang es una opción válida de la Action y el generador de la web la incluye en español', () => {
  assert.deepStrictEqual(parseOutputs('dist/a.svg?lang=es'), [{ file: 'dist/a.svg', options: { lang: 'es' } }]);
  assert.throws(() => parseOutputs('dist/a.svg?lang=fr'), /no válido para 'lang'/);
  const engine = loadEngine();
  const yaml = new engine.ExporterEngine().generateWorkflowYaml('octocat', { adaptive: false, darkTheme: 'dark', lang: 'es' });
  assert.match(yaml, /dist\/github-snake\.svg\?theme=dark&lang=es/);
});
