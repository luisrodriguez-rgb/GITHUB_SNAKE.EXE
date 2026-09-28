# Guia de Lanzamiento y Distribucion en Comunidades

Este documento contiene los textos optimizados para publicar en Reddit, Hacker News, Dev.to y LinkedIn para conseguir visitantes, estrellas y feedback técnico calificado.

---

## 1. Reddit: r/webdev y r/javascript (Enfoque Técnico)

* **Subreddits recomendados**: `r/webdev` (post de fin de semana o Showoff Saturday), `r/javascript`, `r/SideProject`.
* **Título**:
  > [Showoff Saturday] I built a 60 FPS GitHub contribution simulation and game in Vanilla JS with BFS pathfinding and Commit Art generation

* **Contenido**:
  ```markdown
  Hey everyone!

  I wanted to turn the static green contribution graph on GitHub into an interactive experience, so I built **GITHUB_SNAKE.EXE**.

  Live Demo: https://luisrodriguez-rgb.github.io/GITHUB_SNAKE.EXE/
  Source Code: https://github.com/luisrodriguez-rgb/GITHUB_SNAKE.EXE

  ### Key Technical Highlights:
  1. **Zero-flicker 60 FPS Game Loop**: The simulation updates at a configurable tick rate (1-9 t/s) while rendering runs decoupled at 60 FPS using sub-pixel linear interpolation (LERP) with continuous toroidal boundary ghost segments.
  2. **Pathfinding AI (BFS + Flood Fill)**: Uses Breadth-First Search to locate the highest-density commit clusters, combined with a spatial Flood Fill safety lookahead so the snake never traps itself in closed pockets.
  3. **Commit Art Creator**: A custom 53x7 bitmap font rasterizer where you can type any word and download a Bash script (.sh) that backdates real Git commits onto your actual GitHub profile.
  4. **Standalone Web Component**: Can be embedded into any developer portfolio using `<github-snake user="torvalds" theme="dark"></github-snake>`.
  5. **No heavy frameworks**: Built with pure Vanilla JavaScript, HTML5 Canvas, Web Audio API, and Cloudflare Pages.

  You can test it directly with your own GitHub username or URL. Would love to hear your feedback or suggestions!
  ```

---

## 2. Hacker News (Show HN)

* **URL para enviar**: [news.ycombinator.com/submit](https://news.ycombinator.com/submit)
* **Title**:
  > Show HN: GITHUB_SNAKE.EXE – Interactive 60 FPS contribution engine and Commit Art generator

* **URL**:
  `https://luisrodriguez-rgb.github.io/GITHUB_SNAKE.EXE/`

* **Primer comentario explicativo**:
  ```text
  Hi HN! I built an interactive Canvas 2D engine that transforms any GitHub user's contribution history into a playable 60 FPS simulation with an AI agent.

  Key features:
  - Breadth-First Search (BFS) combined with Flood Fill safety lookahead.
  - Sub-pixel LERP interpolation to avoid jitter at low tick rates.
  - Interactive Commit Art generator that outputs a .sh script to stamp arbitrary text onto your real contribution grid.
  - Zero dependencies / Vanilla JS.

  Code: https://github.com/luisrodriguez-rgb/GITHUB_SNAKE.EXE
  Any feedback or critique on the pathfinding and rendering loop is welcome!
  ```

---

## 3. LinkedIn (Enfoque de Ingeniería de Software)

* **Texto**:
  > Comparto mi último proyecto de ingeniería frontend y algoritmos: GITHUB_SNAKE.EXE
  >
  > El objetivo fue construir una arquitectura interactiva sobre Canvas 2D desde cero sin depender de frameworks pesados:
  >
  > - Game loop desacoplado a 60 FPS con interpolación lineal sub-píxel (LERP).
  > - Pathfinding inteligente mediante búsqueda en grafos (BFS) con evaluación espacial previa (Flood Fill) para evitar colisiones y bloqueos.
  > - Generador de Commit Art que traduce cadenas de texto a matrices de 53x7 y produce scripts Bash automatizados con fechas relativas de Git.
  > - Componente web nativo reutilizable para portafolios.
  >
  > Demo interactiva: https://luisrodriguez-rgb.github.io/GITHUB_SNAKE.EXE/
  > Código abierto en GitHub: https://github.com/luisrodriguez-rgb/GITHUB_SNAKE.EXE
  >
  > #javascript #frontend #webdevelopment #softwareengineering #algorithms #opensource
