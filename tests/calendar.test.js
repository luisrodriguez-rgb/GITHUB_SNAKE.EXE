const test = require('node:test');
const assert = require('node:assert');
const zlib = require('zlib');
const { renderCalendarJson, handler } = require('../server/calendar');
const { calendarCache } = require('../server/common');
const { loadEngine } = require('../action/lib');

const LEVEL_NAMES = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];

function graphqlWeeks() {
  const weeks = [];
  const start = Date.UTC(2025, 9, 26); // domingo
  for (let w = 0; w < 53; w++) {
    weeks.push({
      contributionDays: Array.from({ length: 7 }, (_, d) => {
        const date = new Date(start + (w * 7 + d) * 86400000).toISOString().slice(0, 10);
        return { date, weekday: d, contributionCount: (w + d) % 5, contributionLevel: LEVEL_NAMES[(w + d) % 5] };
      })
    });
  }
  return weeks;
}

const okFetch = async () => ({
  ok: true,
  json: async () => ({ data: { user: { contributionsCollection: { contributionCalendar: { weeks: graphqlWeeks() } } } } })
});

test('devuelve el calendario en el formato que la web ya sabe leer', async () => {
  calendarCache.clear();
  const res = await renderCalendarJson({ user: 'octocat', token: 't', fetchImpl: okFetch });
  assert.strictEqual(res.status, 200);
  assert.match(res.headers['Content-Type'], /^application\/json/);
  assert.strictEqual(res.headers['Access-Control-Allow-Origin'], '*');
  const data = JSON.parse(res.body);
  assert.strictEqual(data.contributions.length, 53 * 7);
  assert.deepStrictEqual(data.contributions[1], { date: '2025-10-27', count: 1, level: 1 });

  // El parser de la web (el mismo que usa con la API de terceros) acepta la respuesta
  const engine = loadEngine();
  const grid = new engine.GitHubFetcher().parseApiContributions(data.contributions);
  assert.strictEqual(grid.length, 53);
});

test('errores como JSON con el código HTTP correcto', async () => {
  calendarCache.clear();
  assert.strictEqual((await renderCalendarJson({ user: '../x', token: 't', fetchImpl: okFetch })).status, 400);
  assert.strictEqual((await renderCalendarJson({ user: 'octocat', token: '', fetchImpl: okFetch })).status, 500);
  calendarCache.clear();
  const missing = await renderCalendarJson({
    user: 'nadie', token: 't',
    fetchImpl: async () => ({ ok: true, json: async () => ({ data: { user: null }, errors: [{ type: 'NOT_FOUND', message: 'x' }] }) })
  });
  assert.strictEqual(missing.status, 404);
  assert.match(JSON.parse(missing.body).error, /nadie/);
});

test('el adaptador HTTP lee /api/calendar/<usuario>.json y comprime', async () => {
  calendarCache.clear();
  const realFetch = global.fetch;
  const realToken = process.env.GITHUB_TOKEN;
  global.fetch = okFetch;
  process.env.GITHUB_TOKEN = 'tkn';
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.body = body; } };
  try {
    await handler({ url: '/api/calendar/octocat.json', method: 'GET', headers: { 'accept-encoding': 'gzip' } }, res);
  } finally {
    global.fetch = realFetch;
    if (realToken === undefined) delete process.env.GITHUB_TOKEN; else process.env.GITHUB_TOKEN = realToken;
  }
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.headers['Content-Encoding'], 'gzip');
  assert.strictEqual(JSON.parse(zlib.gunzipSync(res.body)).user, 'octocat');
});
