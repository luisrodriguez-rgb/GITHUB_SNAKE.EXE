/**
 * Piezas compartidas por los endpoints serverless (SVG y calendario):
 * motor cargado una vez, calendario de GitHub con caché en memoria y envío comprimido.
 */

const zlib = require('zlib');
const { loadEngine } = require('../action/lib');

const USER_RE = /^[a-z\d](?:[a-z\d-]{0,38})$/i;
const engine = loadEngine();

// Las instancias calientes se reutilizan entre peticiones: el calendario de cada usuario se guarda 30 min en memoria.
// Así varios estilos del SVG y el JSON de la web del mismo perfil cuestan una sola consulta a GitHub.
const CALENDAR_TTL_MS = 30 * 60 * 1000;
const CALENDAR_CACHE_MAX = 500;
const calendarCache = new Map();

function getCalendarWeeks(user, token, fetchImpl) {
  const key = user.toLowerCase();
  const hit = calendarCache.get(key);
  if (hit && Date.now() - hit.time < CALENDAR_TTL_MS) return hit.promise;

  // Se guarda la promesa: peticiones simultáneas del mismo usuario comparten la consulta en curso
  const promise = engine.SnakeCore.fetchCalendarWeeks(user, token, fetchImpl);
  calendarCache.set(key, { time: Date.now(), promise });
  promise.catch(() => calendarCache.delete(key));
  if (calendarCache.size > CALENDAR_CACHE_MAX) {
    calendarCache.delete(calendarCache.keys().next().value);
  }
  return promise;
}

/** Envía { status, headers, body } comprimido con brotli (calidad 5, ~2 ms) o gzip según Accept-Encoding */
function sendCompressed(req, res, result) {
  res.statusCode = result.status;
  for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value);

  let body = Buffer.from(result.body);
  const accepted = String((req.headers && req.headers['accept-encoding']) || '');
  res.setHeader('Vary', 'Accept-Encoding');
  if (/\bbr\b/.test(accepted)) {
    body = zlib.brotliCompressSync(body, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } });
    res.setHeader('Content-Encoding', 'br');
  } else if (/\bgzip\b/.test(accepted)) {
    body = zlib.gzipSync(body);
    res.setHeader('Content-Encoding', 'gzip');
  }
  res.setHeader('Content-Length', body.length);
  res.end(req.method === 'HEAD' ? undefined : body);
}

/** Usuario de /api/<usuario>.<ext> (reescrito a ?user=) */
function userFromRequest(req, ext) {
  const url = new URL(req.url, 'http://localhost');
  const fromPath = url.pathname.match(new RegExp(`/([^/]+)\\.${ext}$`));
  return { url, user: url.searchParams.get('user') || (fromPath ? fromPath[1] : '') };
}

module.exports = { engine, USER_RE, calendarCache, getCalendarWeeks, sendCompressed, userFromRequest };
