/**
 * GITHUB_SNAKE.EXE GitHub Action
 * Ejecuta el mismo motor del navegador (pathfinding, serpiente y exportador SVG) en Node.js,
 * sin dependencias, y escribe los SVG animados en las rutas pedidas.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ENGINE_FILES = ['calendar.js', 'github.js', 'pathfinding.js', 'snake.js', 'exporter.js'];
const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
const OPTION_VALUES = {
  theme: ['dark', 'light', 'cyberpunk', 'neon_cyan', 'amber_terminal'],
  speed: ['normal', 'fast', 'relaxed'],
  morph: ['matrix_viper', 'capsule', 'retro'],
  pause: ['fast', 'medium', 'none']
};

/** Carga los scripts del navegador en un contexto aislado y devuelve sus clases */
function loadEngine() {
  const sandbox = { console, Math, Date, Map, Set, URLSearchParams };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const file of ENGINE_FILES) {
    const code = fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8');
    vm.runInContext(code, sandbox, { filename: file });
  }
  return sandbox;
}

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { date weekday contributionCount contributionLevel } }
      }
    }
  }
}`;

async function fetchCalendarWeeks(username, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'github-snake-action'
    },
    body: JSON.stringify({ query: QUERY, variables: { login: username } })
  });
  if (!res.ok) {
    throw new Error(`GitHub GraphQL respondió ${res.status} ${res.statusText}`);
  }
  const body = await res.json();
  if (body.errors && body.errors.length) {
    throw new Error(`GitHub GraphQL: ${body.errors.map(e => e.message).join('; ')}`);
  }
  if (!body.data || !body.data.user) {
    throw new Error(`No existe el usuario de GitHub '${username}'`);
  }
  return body.data.user.contributionsCollection.contributionCalendar.weeks;
}

/** Convierte las semanas de GraphQL en la matriz 53x7 del motor (la semana actual en la última columna) */
function weeksToGrid(weeks, cols = 53, rows = 7) {
  const recent = weeks.slice(-cols);
  const offset = cols - recent.length;
  const grid = [];

  for (let x = 0; x < cols; x++) {
    const column = [];
    for (let y = 0; y < rows; y++) {
      column.push({ x, y, level: 0, originalLevel: 0, count: 0, date: null });
    }
    grid.push(column);
  }

  recent.forEach((week, i) => {
    for (const day of week.contributionDays) {
      const level = LEVELS[day.contributionLevel] ?? 0;
      const cell = grid[offset + i][day.weekday];
      cell.level = level;
      cell.originalLevel = level;
      cell.count = day.contributionCount;
      cell.date = day.date;
    }
  });

  return grid;
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
    const options = {};
    for (const [key, value] of new URLSearchParams(query)) {
      if (!OPTION_VALUES[key]) {
        throw new Error(`Opción desconocida '${key}' en '${line}'. Válidas: ${Object.keys(OPTION_VALUES).join(', ')}`);
      }
      if (!OPTION_VALUES[key].includes(value)) {
        throw new Error(`Valor '${value}' no válido para '${key}' en '${line}'. Válidos: ${OPTION_VALUES[key].join(', ')}`);
      }
      options[key] = value;
    }
    if (!file.endsWith('.svg')) {
      throw new Error(`La salida '${file}' debe terminar en .svg`);
    }
    return { file, options };
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
    grid = weeksToGrid(await fetchCalendarWeeks(username, token));
    log(`Contribuciones de @${username} leídas desde la API GraphQL de GitHub`);
  } else {
    grid = await fetchGridFromPublicApi(engine, username);
    log(`Contribuciones de @${username} leídas desde github-contributions-api (sin token)`);
  }

  const exporter = new engine.ExporterEngine();
  for (const { file, options } of targets) {
    const svg = exporter.buildAnimatedSvg(grid, options);
    const fullPath = path.resolve(cwd, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, svg);
    log(`Generado ${file} (${(svg.length / 1024).toFixed(1)} KB)`);
  }
}

module.exports = { loadEngine, weeksToGrid, parseOutputs, run, OPTION_VALUES };
