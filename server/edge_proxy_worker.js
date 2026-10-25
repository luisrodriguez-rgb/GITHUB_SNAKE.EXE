/**
 * Cloudflare Worker / Edge Proxy para la API de contribuciones
 *
 * Funcionalidad:
 * 1. Cachea en el edge (Cache API de Cloudflare, 1 hora) la respuesta de github-contributions-api.jogruber.de,
 *    para no repetir la misma consulta por cada visitante.
 * 2. Valida el nombre de usuario y añade cabeceras CORS.
 *
 * No incluye rate limiting por IP: si lo necesitas, configúralo con las reglas de Rate Limiting de Cloudflare.
 * Nunca envíes un GITHUB_TOKEN a esta API: es un servicio de terceros, no api.github.com.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Ruta de consulta de usuario: /api/contributions/:username
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts[0] !== 'api' || pathParts[1] !== 'contributions' || !pathParts[2]) {
      return new Response(JSON.stringify({ error: 'Ruta no valida. Usa /api/contributions/:username' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const username = pathParts[2].toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 39);
    if (!username) {
      return new Response(JSON.stringify({ error: 'Usuario no valido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 1. Verificación de Caché en Edge (Cloudflare Cache API)
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
      // Retornar desde la caché con cabecera de HIT
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Cache-Status', 'HIT');
      return new Response(response.body, {
        status: response.status,
        headers: { ...Object.fromEntries(newHeaders.entries()), ...corsHeaders }
      });
    }

    // 2. Consulta a la API de contribuciones (cache miss)
    const targetUrl = `https://github-contributions-api.jogruber.de/v4/${username}?y=last`;
    const fetchHeaders = {
      'User-Agent': 'GitHub-Snake-Matrix-Proxy/2.0'
    };

    try {
      const apiResponse = await fetch(targetUrl, { headers: fetchHeaders });

      if (!apiResponse.ok) {
        return new Response(JSON.stringify({ error: 'No se pudo obtener el perfil de GitHub' }), {
          status: apiResponse.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const data = await apiResponse.json();
      const bodyString = JSON.stringify(data);

      // 3. Respuesta cacheable 1 hora (stale-while-revalidate lo aplican los navegadores/CDN que lo soporten)
      response = new Response(bodyString, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          'X-Cache-Status': 'MISS',
          ...corsHeaders
        }
      });

      // Guardar en la caché distribuida de Cloudflare Edge
      ctx.waitUntil(cache.put(cacheKey, response.clone()));

      return response;
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Error de conexion en Edge Worker', details: err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};
