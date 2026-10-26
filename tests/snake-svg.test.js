const test = require('node:test');
const assert = require('node:assert');
const zlib = require('zlib');
const { renderSnakeSvg, handler, calendarCache } = require('../server/snake-svg');

const LEVEL_NAMES = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];

function graphqlWeeks() {
  const weeks = [];
  for (let w = 0; w < 53; w++) {
    weeks.push({
      contributionDays: Array.from({ length: 7 }, (_, d) => ({
        date: `2026-01-${String((w % 28) + 1).padStart(2, '0')}`,
        weekday: d,
        contributionCount: (w + d) % 5,
        contributionLevel: LEVEL_NAMES[(w * 3 + d) % 5]
      }))
    });
  }
  return weeks;
}

const okFetch = async () => ({
  ok: true,
  json: async () => ({ data: { user: { contributionsCollection: { contributionCalendar: { weeks: graphqlWeeks() } } } } })
});

test('devuelve el SVG animado con el tema pedido y caché de CDN', async () => {
  calendarCache.clear();
  let sentAuth = null;
  const res = await renderSnakeSvg({
    user: 'octocat',
    query: '?user=octocat&theme=cyberpunk&speed=fast',
    token: 'tkn',
    fetchImpl: async (url, init) => { sentAuth = init.headers.Authorization; return okFetch(); }
  });
  assert.strictEqual(res.status, 200);
  assert.match(res.headers['Content-Type'], /^image\/svg\+xml/);
  assert.match(res.headers['Cache-Control'], /s-maxage=21600/);
  assert.ok(res.body.includes('#090614'), 'usa la paleta cyberpunk');
  assert.strictEqual(sentAuth, 'bearer tkn');
});

test('errores legibles como SVG: usuario inválido, opción mala, sin token, usuario inexistente, GitHub caído', async () => {
  const bad = await renderSnakeSvg({ user: '"><script>', token: 't', fetchImpl: okFetch });
  assert.strictEqual(bad.status, 400);
  assert.ok(!bad.body.includes('<script>'));

  const option = await renderSnakeSvg({ user: 'octocat', query: 'theme=pink', token: 't', fetchImpl: okFetch });
  assert.strictEqual(option.status, 400);
  assert.match(option.body, /theme/);

  const noToken = await renderSnakeSvg({ user: 'octocat', token: '', fetchImpl: okFetch });
  assert.strictEqual(noToken.status, 500);
  assert.strictEqual(noToken.headers['Cache-Control'], 'no-store');

  calendarCache.clear();
  const missing = await renderSnakeSvg({
    user: 'nadie-aqui', token: 't',
    fetchImpl: async () => ({ ok: true, json: async () => ({ data: { user: null }, errors: [{ type: 'NOT_FOUND', message: 'Could not resolve' }] }) })
  });
  assert.strictEqual(missing.status, 404);

  calendarCache.clear();
  const rateLimited = await renderSnakeSvg({
    user: 'octocat', token: 't',
    fetchImpl: async () => ({ ok: true, json: async () => ({ data: null, errors: [{ type: 'RATE_LIMITED', message: 'API rate limit exceeded' }] }) })
  });
  assert.strictEqual(rateLimited.status, 502, 'el límite de la API no es "usuario inexistente"');

  calendarCache.clear();
  const badToken = await renderSnakeSvg({ user: 'octocat', token: 'x', fetchImpl: async () => ({ ok: false, status: 401, statusText: 'Unauthorized' }) });
  assert.strictEqual(badToken.status, 500);
  assert.match(badToken.body, /GITHUB_TOKEN/);

  calendarCache.clear();
  const down = await renderSnakeSvg({ user: 'octocat', token: 't', fetchImpl: async () => ({ ok: false, status: 503, statusText: 'Unavailable' }) });
  assert.strictEqual(down.status, 502);
  assert.strictEqual(down.headers['Cache-Control'], 'no-store');
});

test('el adaptador HTTP lee el usuario de la ruta /api/<usuario>.svg', async () => {
  const realFetch = global.fetch;
  const realToken = process.env.GITHUB_TOKEN;
  global.fetch = okFetch;
  process.env.GITHUB_TOKEN = 'tkn';
  calendarCache.clear();
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.body = body; } };
  const brRes = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.body = body; } };
  try {
    await handler({ url: '/api/octocat.svg?theme=light', method: 'GET', headers: {} }, res);
    await handler({ url: '/api/octocat.svg?theme=light', method: 'GET', headers: { 'accept-encoding': 'gzip, deflate, br' } }, brRes);
  } finally {
    global.fetch = realFetch;
    if (realToken === undefined) delete process.env.GITHUB_TOKEN; else process.env.GITHUB_TOKEN = realToken;
  }
  assert.strictEqual(res.statusCode, 200);
  const plain = res.body.toString();
  assert.ok(plain.startsWith('<svg'));
  assert.ok(plain.includes('#ffffff'), 'usa la paleta light');

  // Con brotli aceptado se comprime y se descomprime al mismo SVG
  assert.strictEqual(brRes.headers['Content-Encoding'], 'br');
  assert.strictEqual(brRes.headers.Vary, 'Accept-Encoding');
  assert.ok(brRes.body.length < plain.length / 4, 'al menos 4 veces más pequeño');
  assert.strictEqual(zlib.brotliDecompressSync(brRes.body).toString(), plain);
});

test('el calendario de un usuario se consulta una sola vez para varios estilos', async () => {
  calendarCache.clear();
  let calls = 0;
  const countingFetch = async () => { calls++; return okFetch(); };
  await Promise.all([
    renderSnakeSvg({ user: 'Octocat', query: 'theme=dark', token: 't', fetchImpl: countingFetch }),
    renderSnakeSvg({ user: 'octocat', query: 'theme=light', token: 't', fetchImpl: countingFetch }),
    renderSnakeSvg({ user: 'octocat', query: 'theme=cyberpunk&morph=retro', token: 't', fetchImpl: countingFetch })
  ]);
  assert.strictEqual(calls, 1);
});
