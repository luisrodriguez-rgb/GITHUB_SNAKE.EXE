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
    assert.ok(timing.total >= 10 && timing.total <= 17, `${format}: ${timing.total}s`);
    assert.ok(L.boardLeft >= 0 && L.boardLeft + L.boardWidth <= width, `${format}: rejilla dentro en ancho`);
    // Fondo de las tarjetas de la celebración (mismo cálculo que drawFrame)
    const offset = format === 'vertical' ? 80 : format === 'square' ? 72 : 82;
    const cardsBottom = L.boardY + L.boardHeight + offset * L.unit + 40 * L.unit + 92 * L.unit;
    assert.ok(cardsBottom <= height, `${format}: tarjetas dentro (${Math.round(cardsBottom)} <= ${height})`);
  }
});
