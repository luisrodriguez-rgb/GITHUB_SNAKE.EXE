const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadEngine, weeksToGrid } = require('../action/lib');

function loadStudio(engine) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'video-studio.js'), 'utf8'), vm.createContext(engine));
  return engine;
}

function gridWithDays(levels) {
  // levels: array cronológico (columna a columna) de niveles 0-4
  const engine = loadEngine();
  const grid = new engine.GitHubFetcher().createEmptyGrid();
  levels.forEach((level, i) => {
    const cell = grid[Math.floor(i / 7)][i % 7];
    cell.level = cell.originalLevel = level;
    cell.count = level * 2;
  });
  return grid;
}

test('datos de la celebración: total, días activos, mejor día y racha más larga en orden cronológico', () => {
  const engine = loadStudio(loadEngine());
  const studio = new engine.VideoStudio(new engine.ExporterEngine());
  // 3 días seguidos, hueco, 5 días seguidos (racha 5), mejor día de nivel 4
  const grid = gridWithDays([1, 2, 1, 0, 1, 1, 4, 1, 1]);
  const stats = studio.computeStats(grid);
  assert.strictEqual(stats.activeDays, 8);
  assert.strictEqual(stats.longest, 5);
  assert.strictEqual(stats.best.count, 8);
  assert.strictEqual(stats.total, 2 + 4 + 2 + 2 + 2 + 8 + 2 + 2);
  assert.strictEqual(studio.formatNumber(1582, 'es'), '1.582');
  assert.strictEqual(studio.formatNumber(1582, 'en'), '1,582');
});

test('cada formato: duración acotada y rejilla, celebración y tarjetas dentro del fotograma', () => {
  const engine = loadStudio(loadEngine());
  const studio = new engine.VideoStudio(new engine.ExporterEngine());
  const grid = weeksToGrid(require('./action.test.helpers').denseWeeks());
  for (const format of ['landscape', 'square', 'vertical']) {
    const scene = studio.buildScene({ grid, user: 'octocat', lang: 'es', theme: 'cyberpunk', format, shareUrl: 'x' });
    const { width, height, layout: L, timing } = scene;
    assert.strictEqual(width, engine.VIDEO_FORMATS[format].width);
    assert.ok(timing.total >= 9 && timing.total <= 12, `${format}: ${timing.total}s`);
    assert.strictEqual(timing.intro, 0, `${format}: la comida empieza en el primer frame`);
    assert.ok(L.boardLeft >= 0 && L.boardLeft + L.boardWidth <= width, `${format}: rejilla dentro en ancho`);
    // Fondo de las tarjetas de la celebración (mismo cálculo que drawFrame)
    const offset = format === 'vertical' ? 80 : format === 'square' ? 72 : 82;
    const cardsBottom = L.boardY + L.boardHeight + offset * L.unit + 40 * L.unit + 92 * L.unit;
    assert.ok(cardsBottom <= height, `${format}: tarjetas dentro (${Math.round(cardsBottom)} <= ${height})`);
  }
});

test('video del duelo: mismo resultado que DuelSimulator y todo dentro del fotograma en cada formato', () => {
  const engine = loadStudio(loadEngine());
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'duel.js'), 'utf8'), vm.createContext(engine));
  const studio = new engine.VideoStudio(new engine.ExporterEngine());
  const fetcher = new engine.GitHubFetcher();
  const gridA = fetcher.generateRealisticMock('torvalds');
  const gridB = fetcher.generateRealisticMock('antfu');
  const direct = engine.DuelSimulator.run([gridA, gridB]);

  for (const format of ['landscape', 'square', 'vertical']) {
    const scene = studio.buildDuelScene({ players: [{ grid: gridA, user: 'torvalds' }, { grid: gridB, user: 'antfu' }], lang: 'es', theme: 'dark', format, shareUrl: 'x' });
    assert.strictEqual(scene.winner, direct.winner);
    assert.deepStrictEqual(scene.sides.map(s => s.score), direct.players.map(p => p.score));
    const lastBoard = scene.sides[1].layout;
    assert.ok(lastBoard.boardY + lastBoard.boardHeight < scene.height, `${format}: segunda rejilla dentro`);
    assert.ok(Math.min(scene.height - 90 * scene.unit, scene.resultY + 60 * scene.unit) + 42 * scene.unit <= scene.height, `${format}: resultado dentro`);
  }
  // Correr el duelo para el video no altera las matrices originales
  assert.ok(gridA.flat().every(c => c.level === c.originalLevel));
});
