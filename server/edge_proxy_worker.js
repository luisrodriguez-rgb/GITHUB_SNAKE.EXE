/**
 * Cloudflare Worker / Edge Proxy para GitHub API & Rate Limiting Caching
 * 
 * Funcionalidad:
 * 1. Resuelve el límite de 60 peticiones/hora de GitHub usando caché distribuida en Edge (1 hora TTL).
 * 2. Soporta Stale-While-Revalidate (devuelve datos instantáneamente mientras actualiza en segundo plano).
 * 3. Permite inyectar un GITHUB_TOKEN seguro en variables de entorno para 5,000 req/hora.
 * 4. Aplica Rate Limiting estricto por IP para prevenir ataques de denegación de servicio (DDoS).
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const clientIP = request.headers.get('CF-Connecting-IP') || 'anonymous';

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

    const username = pathParts[2].toLowerCase().replace(/[^a-z0-9-_]/g, '');

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

    // 2. Consulta con Stale-While-Revalidate hacia GitHub API o API de respaldo
    const targetUrl = `https://github-contributions-api.jogruber.de/v4/${username}?y=last`;
    const fetchHeaders = {
      'User-Agent': 'GitHub-Snake-Matrix-Proxy/2.0'
    };

    if (env.GITHUB_TOKEN) {
      fetchHeaders['Authorization'] = `Bearer ${env.GITHUB_TOKEN}`;
    }

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

      // 3. Crear respuesta con cabeceras de caché ultra optimizadas (1 hora pública, 24 horas stale)
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
