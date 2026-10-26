/**
 * GITHUB_SNAKE.EXE GitHub Action
 * Ejecuta el mismo motor del navegador (pathfinding, serpiente y exportador SVG) en Node.js,
 * sin dependencias, y escribe los SVG animados en las rutas pedidas.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const ENGINE_FILES = ['js/calendar.js', 'js/github.js', 'js/pathfinding.js', 'js/snake.js', 'js/exporter.js', 'shared/snake-core.js'];

/** Carga los scripts del navegador en un contexto aislado y devuelve sus clases */
function loadEngine() {
  const sandbox = { console, Math, Date, Map, Set, URLSearchParams };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const file of ENGINE_FILES) {
    const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
    vm.runInContext(code, sandbox, { filename: file });
  }
  return sandbox;
}

const core = loadEngine().SnakeCore;
const OPTION_VALUES = core.OPTION_VALUES;

function weeksToGrid(weeks, cols, rows) {
  return core.weeksToGrid(weeks, cols, rows);
}

/** Respaldo sin token: API pública de terceros, procesada por el mismo parser que la web */
async function fetchGridFromPublicApi(engine, username) {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`);
  if (!res.ok) {
    throw new Error(`github-contributions-api respondió ${res.status}`);
  }
  const data = await res.json();
  if (!data.contributions || data.contributions.length === 0) {
    throw new Error(`Sin contribuciones para '${username}'`);
  }
  return new engine.GitHubFetcher().parseApiContributions(data.contributions);
}

/**
 * Interpreta líneas tipo "dist/snake.svg?theme=dark&speed=fast".
 * Devuelve [{ file, options }] o lanza un error con la opción no válida.
 */
function parseOutputs(text) {
  const lines = String(text || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error("El input 'outputs' está vacío");
  }

  return lines.map(line => {
    const [file, query = ''] = line.split('?');
    const options = core.parseOptions(query, line);
    if (!file.endsWith('.svg')) {
      throw new Error(`La salida '${file}' debe terminar en .svg`);
    }
    // Objeto del contexto principal: el del sandbox tiene otro prototipo y falla en deepStrictEqual
    return { file, options: { ...options } };
  });
}

async function run({ username, outputs, token, cwd = process.cwd(), log = console.log }) {
  if (!username) {
    throw new Error("Falta el input 'github_user_name'");
  }
  const targets = parseOutputs(outputs);
  const engine = loadEngine();

  let grid;
  if (token) {
    grid = engine.SnakeCore.weeksToGrid(await engine.SnakeCore.fetchCalendarWeeks(username, token, fetch));
    log(`Contribuciones de @${username} leídas desde la API GraphQL de GitHub`);
  } else {
    grid = await fetchGridFromPublicApi(engine, username);
    log(`Contribuciones de @${username} leídas desde github-contributions-api (sin token)`);
  }

  const exporter = new engine.ExporterEngine();
  for (const { file, options } of targets) {
    const svg = exporter.buildAnimatedSvg(grid, { ...options, user: username });
    const fullPath = path.resolve(cwd, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, svg);
    log(`Generado ${file} (${(svg.length / 1024).toFixed(1)} KB)`);
  }
}

module.exports = { loadEngine, weeksToGrid, parseOutputs, run, OPTION_VALUES, ENGINE_FILES };
