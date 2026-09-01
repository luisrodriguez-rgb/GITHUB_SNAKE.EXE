# Guia de Arquitectura, Despliegue, Seguridad y Analiticas en Produccion

Este documento describe la configuracion profesional recomendada para operar **GITHUB_SNAKE.EXE** con alta disponibilidad, seguridad estricta, proteccion contra limitaciones de tasa (*rate limits*) y analiticas sin impacto en el rendimiento.

---

## 1. Despliegue en Edge (Cloudflare Pages / Vercel)

Para aplicaciones con alto volumen de trafico y nulo costo de mantenimiento, la arquitectura estatica en la red Edge es la opcion optima.

### Configuracion en Cloudflare Pages
1. **Repositorio**: Conectar directamente con `luisrodriguez-rgb/GITHUB_SNAKE.EXE`.
2. **Build Settings**:
   * **Framework preset**: `None`
   * **Build command**: *(Vacio)*
   * **Build output directory**: `/`
3. **Beneficios Clave**:
   * Mas de 300 centros de datos mundiales (latencia media < 30ms).
   * Transferencia y ancho de banda ilimitados sin cobros sorpresa.
   * Certificados SSL/TLS 1.3 automaticos con renovacion sin intervencion.

---

## 2. Cabeceras de Seguridad HTTP (Archivo `_headers`)

El proyecto incluye un archivo [`_headers`](../_headers) listo para produccion que aplica politicas de proteccion de nivel empresarial:

| Cabecera | Valor | Proposito de Seguridad |
| :--- | :--- | :--- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Fuerza conexiones cifradas HTTPS durante 1 ano. |
| `X-Frame-Options` | `SAMEORIGIN` | Previene ataques de Clickjacking impidiendo embebidos no autorizados. |
| `X-Content-Type-Options` | `nosniff` | Impide que los navegadores interpreten tipos MIME erroneos. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Protege la privacidad del usuario en enlaces externos. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Bloquea el acceso a sensores y hardware no utilizados. |
| `Content-Security-Policy` | *(Restringido a dominios oficiales)* | Mitiga ataques de Cross-Site Scripting (XSS) e inyeccion de datos. |

---

## 3. Resolucion del Rate Limit de la API de GitHub (60 req/h)

### El Problema
La API publica de GitHub restringe las consultas no autenticadas a **60 peticiones por hora por direccion IP**. Si tu aplicacion recibe multiples visitas simultaneas, las consultas pueden empezar a fallar con error `403 Rate Limit Exceeded`.

### La Solucion: Cloudflare Edge Worker Proxy
Se incluye el archivo [`server/edge_proxy_worker.js`](../server/edge_proxy_worker.js) que implementa:

1. **Caché Distribuida con Stale-While-Revalidate**:
   * Almacena los perfiles consultados en la memoria Edge durante 1 hora (`max-age=3600`).
   * Si 1,000 usuarios consultan `@midudev` o `@torvalds`, **solo se gasta 1 peticion a GitHub**; las otras 999 se sirven desde la cache en menos de 5ms.
2. **Inyeccion Segura de Tokens**:
   * Permite configurar la variable de entorno `GITHUB_TOKEN` en Cloudflare Workers, aumentando el limite a **5,000 peticiones por hora**.
3. **Rate Limiting por IP**:
   * Puedes activar las reglas WAF de Cloudflare para limitar a maximo 30 solicitudes por minuto por IP para evitar ataques de denegacion de servicio.

---

## 4. Analiticas Ligeras y Privadas (Sin Cookies)

Evita librerias pesadas como Google Analytics (que anaden mas de 50 KB y requieren banners de cookies GDPR molestos).

### Opcion Recomendada: Cloudflare Web Analytics
* **Ventajas**:
  * 100% Gratuito y sin limites de trafico.
  * No utiliza cookies ni almacena direcciones IP (cumplimiento estricto de GDPR, CCPA y ePrivacy).
  * Peso del script: menos de 1 KB, ejecutandose de forma asincrona sin bloquear el renderizado de Canvas.
* **Como activarlo**:
  1. En el panel de Cloudflare, ve a **Web Analytics**.
  2. Haz clic en **Add a site** y copia la etiqueta `<script>` generada antes del cierre `</body>` en tu `index.html`.

### Opcion Alternativa: Umami / Plausible
* Ideal si necesitas medir conversiones de botones especificos (como "Descargar SVG", "Modo Duelo" o "Grabar Clip") manteniendo privacidad absoluta.

---

## 5. Estrategia de Cache Inmutable para Recursos

En el archivo `_headers`, los recursos dentro de `/assets/` estan configurados con `max-age=31536000, immutable`. Esto garantiza que:
* Las imagenes, logos vectoriales y fuentes se descarguen una sola vez y queden guardadas en el disco del usuario.
* En las visitas subsiguientes, la pagina cargue en **0.0 segundos** de forma instantanea desde la memoria cache local.
