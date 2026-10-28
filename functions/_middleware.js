/**
 * Cloudflare Pages: /og/:user.png y HTML con la tarjeta de ese usuario.
 * En GitHub Pages este archivo no se ejecuta; la partida igual abre por ?user=.
 */
import { buildOgPng } from '../server/og_frame.mjs';
import { injectOg, safeUser } from '../server/og_meta.mjs';

const RESERVED = new Set(['js', 'assets', 'docs', 'server', 'functions', 'og', 'scripts']);

function userFromUrl(url) {
  const queryUser = safeUser(url.searchParams.get('user'));
  if (queryUser) return queryUser;
  const parts = url.pathname.split('/').filter(Boolean);
  const candidate = parts[0];
  if (!candidate || candidate.includes('.') || RESERVED.has(candidate)) return null;
  return safeUser(candidate);
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const ogMatch = url.pathname.match(/\/og\/([a-z0-9][a-z0-9-]{0,38})\.png$/i);
  if (ogMatch) {
    const png = await buildOgPng(ogMatch[1]);
    return new Response(png, {
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=3600'
      }
    });
  }

  const user = userFromUrl(url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const pathUser = user && !url.searchParams.get('user') && pathParts.length === 1 && !pathParts[0].includes('.');

  let response;
  if (pathUser && context.env && context.env.ASSETS) {
    const indexUrl = new URL('/index.html', url.origin);
    response = await context.env.ASSETS.fetch(new Request(indexUrl, context.request));
  } else {
    response = await context.next();
  }

  const type = response.headers.get('content-type') || '';
  if (!user || !type.includes('text/html')) return response;

  const html = injectOg(await response.text(), user, url.toString());
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.set('content-type', 'text/html; charset=utf-8');
  return new Response(html, { status: response.status, headers });
}
