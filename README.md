# GITHUB_SNAKE.EXE

Motor de simulacion, edicion y renderizado de la serpiente de contribuciones de GitHub con interpolacion continua a 60 FPS, navegacion autonoma inteligente mediante busqueda en anchura (BFS), modo de juego manual, editor de matriz, sintesis de audio y exportador de SVG y workflows.

---

## Caracteristicas Principales

- **Renderizado Zero-Flicker a 60 FPS**: Desacoplamiento entre la frecuencia de ejecucion logica y la tasa de refresco visual mediante interpolacion lineal continua (LERP) a nivel de sub-pixel.
- **Navegacion Autonoma Inteligente (BFS + Flood Fill)**: Algoritmo de busqueda de ruta mas corta hacia los commits de mayor intensidad, integrando evaluacion de espacio libre para evitar colisiones y encierros.
- **Modo Jugable Manual (WASD / Flechas)**: Control directo de la serpiente con el teclado en tiempo real.
- **Editor Interactivo de Matriz (Modo Pintar)**: Modifica o dibuja contribuciones personalizadas directamente haciendo clic o arrastrando sobre el canvas.
- **Efecto de Ondas Expansivas (Shockwaves)**: Emision de pulsos lumunicos radiales al devorar commits de alta intensidad (niveles 3 y 4).
- **Sintesis de Audio Cyberpunk (Web Audio API)**: Efectos sonoros procedimentales generados con osciladores nativos sin dependencias ni archivos externos (con boton Mute/Unmute).
- **Exportador a SVG Animado y GitHub Actions**:
  - Descarga directa de archivos SVG independientes con animaciones CSS en bucle.
  - Generador automatico de workflows `.github/workflows/snake.yml` y snippets Markdown para el `README.md`.
- **Paletas Multi-Tema**:
  - Matrix Phosphor (Verde fosforo terminal)
  - Modo Claro (Paleta oficial GitHub Light)
  - Cyberpunk Neon (Fucsia y cian)
  - Cyber Cyan (Azul electrico)
  - Amber CRT (Terminal ambar retro)
- **Morfologias de Serpiente**: Cyber Matrix Viper, Neon Capsule, Laser Continuo y Pixel Block.

---

## Arquitectura y Flujo de Datos

```
+-------------------------------------------------------------------------+
|                              CAPA DE ENTRADA                            |
|       Consulta de usuario GitHub  |  Editor Manual  |  Control WASD     |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                         MATRIZ DE CONTRIBUCIONES                        |
|              Estructura normalizada de 53 columnas x 7 filas            |
|              Niveles de actividad: 0 (vacio) a 4 (alta densidad)        |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                     MOTORES LOGICOS (BFS / MANUAL)                      |
|   - Modo IA: Busqueda BFS con lookahead de seguridad Flood Fill         |
|   - Modo Manual: Cola de direcciones con prevencion de giros invalidos  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                     MOTOR DE RENDERIZADO CANVAS 2D                      |
|   - requestAnimationFrame a 60 FPS                                      |
|   - Interpolacion LERP: x(t) = x_prev + (x_next - x_prev) * progreso    |
|   - Ondas de choque (Shockwaves), particulas cuanticas y scanlines      |
+-------------------------------------------------------------------------+
```

---

## Solucion Tecnica al Parpadeo (Anti-Flickering)

Los visualizadores tradicionales mueven la serpiente en pasos discretos directamente de una coordenada entera a otra cada 100 ms, generando un salto visual perceptible como vibracion o parpadeo.

Este motor resuelve el problema calculando la posicion fraccionaria continua:

```
progreso = min(1.0, tiempo_transcurrido_desde_ultimo_tick / duracion_del_tick)

x_render = x_anterior + (x_actual - x_anterior) * progreso
y_render = y_anterior + (y_actual - y_anterior) * progreso
```

Cada fotograma dibuja las capsulas, la cabeza y los ojos en coordenadas exactas de sub-pixel sobre el canvas, logrando un desplazamiento suave continuo.

---

## Estructura del Codigo Fuente

```
.
|-- index.html            # Estructura semantica, HUD, barra de herramientas y modal
|-- style.css             # Sistema de tokens CSS, modos claro/oscuro y componentes
|-- js/
|   |-- audio.js          # Sintetizador procedural Web Audio API
|   |-- exporter.js       # Generador de SVG animado y workflow YAML
|   |-- github.js         # Descarga y formateo de la matriz 53x7 de GitHub
|   |-- pathfinding.js    # Algoritmo BFS, evasion de obstaculos y Flood Fill
|   |-- snake.js          # Maquina de estados, cola de segmentos y particulas
|   |-- renderer.js       # Renderizado Canvas 2D, shockwaves, scanlines y editor
|   `-- app.js            # Bucle maestro, reloj de simulacion y eventos de UI
|-- README.md             # Documentacion tecnica general
`-- snake_link.md         # Especificacion matematica y de algoritmos
```

---

## Ejecucion en Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/luisrodriguez-rgb/GITHUB_SNAKE.EXE.git
   cd GITHUB_SNAKE.EXE
   ```

2. Inicia un servidor web local:
   ```bash
   # Utilizando Python
   python3 -m http.server 3000

   # O utilizando Node.js
   npx serve .
   ```

3. Abre tu navegador en `http://localhost:3000`.

---

## Licencia

Distribuido bajo la Licencia MIT. Codigo abierto para la comunidad.
