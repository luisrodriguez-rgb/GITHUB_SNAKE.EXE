/**
 * Renderiza el SVG de GITHUB_SNAKE.EXE en CI.
 * Uso: node scripts/generate-svg.mjs --user torvalds --out dist
 * Si la API no responde, sale con error: no publica un grafico simulado.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function arg(name, fallback) {
  const args = process.argv.slice(2);
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function loadEngine() {
  const context = vm.createContext({
    console,
    fetch,
    performance: { now: () => Date.now() },
    setTimeout,
    clearTimeout,
    AbortController,
    URL
  });
  context.window = context;
  context.globalThis = context;
  for (const file of ['js/snake.js', 'js/pathfinding.js', 'js/exporter.js', 'js/github.js']) {
    vm.runInContext(readFileSync(join(root, file), 'utf8'), context, { filename: file });
  }
  return context;
}

const username = String(arg('--user', 'torvalds')).replace(/[^A-Za-z0-9-]/g, '').toLowerCase();
const outDir = arg('--out', 'dist');

if (!username) {
  console.error('Falta un usuario valido en --user');
  process.exit(1);
}

const engine = loadEngine();
const fetcher = new engine.GitHubFetcher();
const exporter = new engine.ExporterEngine();
const grid = await fetcher.getContributions(username);

if (!grid || grid.simulated) {
  console.error(`No se publican contribuciones simuladas para @${username}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const light = exporter.exportAnimatedSvg(grid, username, { theme: 'light', download: false });
const dark = exporter.exportAnimatedSvg(grid, username, { theme: 'dark', download: false });

writeFileSync(join(outDir, 'github-contribution-grid-snake.svg'), light);
writeFileSync(join(outDir, 'github-contribution-grid-snake-dark.svg'), dark);
console.log(`SVG de @${username} escrito en ${outDir}`);
