/**
 * Endpoint SVG sin configuración: GET /api/<usuario>.svg?theme=...&speed=...&morph=...&pause=...
 * Mismo motor que la web y la GitHub Action. Pensado para una función serverless de Node (Vercel):
 * generar un SVG cuesta ~25-50 ms de CPU, más de lo que permite el plan gratuito de Cloudflare Workers (10 ms).
 */

const { engine, USER_RE, calendarCache, getCalendarWeeks, sendCompressed, userFromRequest } = require('./common');

// GitHub actualiza el calendario a lo largo del día: 6 h de caché en la CDN y 1 día sirviendo la copia vieja mientras se regenera.
// max-age de 4 h para el proxy de imágenes de GitHub (camo): cada recarga del README no llega a Vercel
const CACHE_OK = 'public, max-age=14400, s-maxage=21600, stale-while-revalidate=86400';
const CACHE_ERROR = 'public, max-age=300, s-maxage=300';

// Una sola instancia: memoriza la simulación por matriz, así cada estilo extra de un perfil cuesta solo el SVG
const exporter = new engine.ExporterEngine();

function escapeXml(text) {
  return String(text).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);
}

/** SVG con un mensaje: en un README una imagen rota no explica nada; esto sí */
function messageSvg(text) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="797" height="60" viewBox="0 0 797 60"><rect width="797" height="60" rx="12" fill="#040806" stroke="#00ff66" stroke-opacity=".3"/><text x="398" y="36" text-anchor="middle" font-family="monospace" font-size="15" fill="#e6fff2">GITHUB_SNAKE.EXE: ${escapeXml(text)}</text></svg>`;
}

function svgResponse(status, body, cacheControl) {
  return {
    status,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': cacheControl,
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff'
    },
    body
  };
}

/**
 * Lógica pura del endpoint (testeable sin servidor).
 * @returns {Promise<{status:number, headers:object, body:string}>}
 */
async function renderSnakeSvg({ user, query = '', token, fetchImpl = fetch }) {
  if (!user || !USER_RE.test(user)) {
    return svgResponse(400, messageSvg('usuario de GitHub no válido'), CACHE_ERROR);
  }

  let options;
  try {
    // El parámetro 'user' lo añade la reescritura de la URL, no es una opción del SVG
    const params = new URLSearchParams(query);
    params.delete('user');
    options = { ...engine.SnakeCore.parseOptions(params.toString()) };
  } catch (err) {
    return svgResponse(400, messageSvg(err.message), CACHE_ERROR);
  }

  if (!token) {
    return svgResponse(500, messageSvg('falta GITHUB_TOKEN en el servidor'), 'no-store');
  }

  let weeks;
  try {
    weeks = await getCalendarWeeks(user, token, fetchImpl);
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return svgResponse(404, messageSvg(`no existe el usuario ${user}`), CACHE_ERROR);
    }
    if (err.status === 401) {
      return svgResponse(500, messageSvg('GITHUB_TOKEN del servidor no válido o caducado'), 'no-store');
    }
    return svgResponse(502, messageSvg('GitHub no respondió, inténtalo más tarde'), 'no-store');
  }

  const svg = exporter.buildAnimatedSvg(engine.SnakeCore.weeksToGrid(weeks), { ...options, user });
  return svgResponse(200, svg, CACHE_OK);
}

/** Adaptador para funciones serverless de Node (req/res de Vercel) */
async function handler(req, res) {
  // /api/<usuario>.svg se reescribe a /api/snake?user=<usuario> (vercel.json); también vale ?user= directo
  const { url, user } = userFromRequest(req, 'svg');
  const result = await renderSnakeSvg({ user, query: url.search, token: process.env.GITHUB_TOKEN });
  sendCompressed(req, res, result);
}

module.exports = { renderSnakeSvg, handler, messageSvg, calendarCache };
