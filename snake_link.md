# Motor de Serpiente de Contribuciones de GitHub (Snake Contribution Engine)

Este proyecto implementa desde cero un simulador y motor de animación de la serpiente de contribuciones de GitHub con renderizado a 60 FPS, cero parpadeos (anti-flickering), algoritmo de búsqueda en anchura (BFS) y soporte para Modo Oscuro y Modo Claro.

---

## Como probar la aplicacion

Abre directamente el archivo [index.html](file:///Users/leonfeliperodriguez/Desktop/Trabajos/Snake%20Repostory/index.html) en tu navegador preferido o utilízalo con cualquier servidor local (como `python3 -m http.server 3000`).

---

## Arquitectura del Sistema

```
                        +------------------------------+
                        |       GitHub Fetcher         |
                        |    (API / Simulacion 53x7)   |
                        +--------------+---------------+
                                       |
                                       v
+-------------------------+    +------------------------------+    +-------------------------+
|     UI & Controles      |--->|   Pathfinding Engine (BFS)   |--->|    Snake State (Head,   |
| (Speed, Themes, Inputs) |    |  (Evita colision + FloodFill)|    |   PrevBody, Particles)  |
+-------------------------+    +------------------------------+    +------------+------------+
                                                                                |
                                                                                v
                                                                   +-------------------------+
                                                                   | 60 FPS Canvas Renderer  |
                                                                   | (Sub-pixel LERP & Glow) |
                                                                   +-------------------------+
```

---

## Solucion al Flickering (Anti-Parpadeo)

En las animaciones tradicionales de GitHub Snake (como en archivos GIF de baja tasa de cuadros):
1. La serpiente salta bruscamente de una casilla a la siguiente cada 100 ms.
2. El ojo humano percibe este cambio como un parpadeo constante.

### Interpolacion Lineal Continua (LERP)

El motor desacopla la tasa logica de ticks de la tasa de refresco visual (60 FPS):

Progreso temporal:
t = min(1.0, tiempo_transcurrido / intervalo_tick)

Para cada segmento i de la serpiente:
x_interp = x_prev + (x_actual - x_prev) * t
y_interp = y_prev + (y_actual - y_prev) * t

Al dibujar en coordenadas de sub-pixel dentro de un canvas con requestAnimationFrame, el desplazamiento es fluido y sin saltos.

---

## Algoritmo de Navegacion (Pathfinding)

Ubicado en [js/pathfinding.js](file:///Users/leonfeliperodriguez/Desktop/Trabajos/Snake%20Repostory/js/pathfinding.js):

1. **Deteccion de Objetivos:** Identifica celdas con nivel de contribucion mayor a 0.
2. **Priorizacion Heuristica:** Ordena objetivos por proximidad Manhattan:
   Distancia = |x_cabeza - x_commit| + |y_cabeza - y_commit|
3. **Busqueda en Anchura (BFS):** Encuentra la ruta mas corta evitando el cuerpo de la serpiente.
4. **Verificacion de Seguridad (Flood Fill Lookahead):** Comprueba que el proximo movimiento no encierre a la serpiente en un callejon sin salida.
5. **Modo Patrullaje:** Si no quedan commits activos, realiza un recorrido seguro continuo.

---

## Temas Disponibles

- **Matrix Phosphor (Oscuro):** Estilo terminal hacker con verde fosforo e iluminacion neon.
- **Modo Claro (GitHub Light):** Fondo blanco limpio con la paleta de contribuciones oficial de GitHub y alto contraste.
- **Cyberpunk Neon:** Tonos fucsia y cian de alto impacto.
- **Cyber Cyan:** Estilo azul electrico sobre fondo tecnologico.
- **Amber CRT:** Terminal retro color ambar.

---

## Estructura de Archivos

- [index.html](file:///Users/leonfeliperodriguez/Desktop/Trabajos/Snake%20Repostory/index.html) - Estructura semantica, interfaz de usuario y canvas.
- [style.css](file:///Users/leonfeliperodriguez/Desktop/Trabajos/Snake%20Repostory/style.css) - Tokens de diseno para Modo Claro y Modo Oscuro.
- [js/github.js](file:///Users/leonfeliperodriguez/Desktop/Trabajos/Snake%20Repostory/js/github.js) - Extractor de contribuciones y perfiles muestra.
- [js/pathfinding.js](file:///Users/leonfeliperodriguez/Desktop/Trabajos/Snake%20Repostory/js/pathfinding.js) - Algoritmo BFS y evaluacion de espacio libre.
- [js/snake.js](file:///Users/leonfeliperodriguez/Desktop/Trabajos/Snake%20Repostory/js/snake.js) - Estado de la serpiente, cola de posiciones y particulas.
- [js/renderer.js](file:///Users/leonfeliperodriguez/Desktop/Trabajos/Snake%20Repostory/js/renderer.js) - Motor de renderizado Canvas 2D a 60 FPS.
- [js/app.js](file:///Users/leonfeliperodriguez/Desktop/Trabajos/Snake%20Repostory/js/app.js) - Coordinador del bucle temporal y eventos.
