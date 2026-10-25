/**
 * Exporter Engine Pro: Generador de SVG Animado Ultra Optimizado y Workflows
 * Máxima compresión de keyframes, eliminación de redundancias, sin saltos en bordes y peso reducido al mínimo.
 */

class ExporterEngine {
  constructor() {
    this.themePalettes = {
      dark: {
        bg: '#040806',
        border: 'rgba(0, 255, 102, 0.15)',
        empty: '#0a140e',
        l1: '#07381b',
        l2: '#096831',
        l3: '#00b34d',
        l4: '#00ff66',
        head: '#ffffff',
        body: '#00ff66',
        glow: 'rgba(0, 255, 102, 0.85)',
        spine: '#ffffff'
      },
      light: {
        bg: '#ffffff',
        border: 'rgba(31, 35, 40, 0.15)',
        empty: '#ebedf0',
        l1: '#9be9a8',
        l2: '#40c463',
        l3: '#30a14e',
        l4: '#216e39',
        head: '#0969da',
        body: '#1a7f37',
        glow: 'rgba(26, 127, 55, 0.35)',
        spine: '#ffffff'
      },
      cyberpunk: {
        bg: '#090614',
        border: 'rgba(255, 0, 127, 0.25)',
        empty: '#170d2b',
        l1: '#3b1059',
        l2: '#72128a',
        l3: '#c01ec7',
        l4: '#ff007f',
        head: '#00ffff',
        body: '#ff007f',
        glow: 'rgba(255, 0, 127, 0.85)',
        spine: '#00ffff'
      },
      neon_cyan: {
        bg: '#030a12',
        border: 'rgba(0, 242, 254, 0.25)',
        empty: '#091c2e',
        l1: '#073a54',
        l2: '#08668f',
        l3: '#00aee6',
        l4: '#00f2fe',
        head: '#ffffff',
        body: '#00f2fe',
        glow: 'rgba(0, 242, 254, 0.85)',
        spine: '#ffffff'
      },
      amber_terminal: {
        bg: '#0f0a02',
        border: 'rgba(255, 170, 0, 0.25)',
        empty: '#241806',
        l1: '#4a3006',
        l2: '#855304',
        l3: '#d98200',
        l4: '#ffaa00',
        head: '#ffffff',
        body: '#ffaa00',
        glow: 'rgba(255, 170, 0, 0.85)',
        spine: '#ffffff'
      }
    };
  }

  /**
   * Genera y descarga un SVG animado ultra optimizado
   */
  exportAnimatedSvg(grid, username = 'developer', options = {}) {
    const svgFinal = this.buildAnimatedSvg(grid, options);
    if (!svgFinal) return;

    const blob = new Blob([svgFinal], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-snake-${username}-${options.theme || 'dark'}-${options.speed || 'normal'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Construye el SVG animado como texto. Sin dependencias del DOM: lo usa también la GitHub Action.
   */
  buildAnimatedSvg(grid, options = {}) {
    if (!grid || grid.length === 0) return null;

    const themeKey = options.theme || 'dark';
    const palette = this.themePalettes[themeKey] || this.themePalettes.dark;
    const speedMode = options.speed || 'normal';
    const morphMode = options.morph || 'matrix_viper';
    const pauseMode = options.pause || 'fast';

    const cols = 53;
    const rows = 7;
    const cellSize = 11;
    const cellGap = 3.5;
    const padding = 16;
    const stepSize = cellSize + cellGap;

    const width = (cols * stepSize) + (padding * 2) - cellGap;
    const height = (rows * stepSize) + (padding * 2) - cellGap;

    // 1. Clonar matriz
    const simGrid = [];
    for (let x = 0; x < cols; x++) {
      const col = [];
      for (let y = 0; y < rows; y++) {
        const c = grid[x] && grid[x][y];
        col.push({
          x: x,
          y: y,
          level: c ? c.level : 0,
          originalLevel: c ? c.originalLevel : 0
        });
      }
      simGrid.push(col);
    }

    const hasRemainingCommits = () => {
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          if (simGrid[x][y].level > 0) return true;
        }
      }
      return false;
    };

    // 2. Simulación de trayectoria hasta vaciar la matriz
    const simSnake = new Snake(4, { x: 0, y: 0 });
    const simPathfinder = new SnakePathfinder(cols, rows);
    const history = [];
    const cellBites = {}; // key -> pasos en los que la serpiente quitó un nivel
    let totalLevels = 0;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) totalLevels += simGrid[x][y].level;
    }
    // Margen amplio: cada nivel exige volver a pisar la celda
    const maxSteps = Math.min(8000, 400 + totalLevels * 30);

    let step = 0;
    history.push(simSnake.body.map(seg => ({ x: seg.x, y: seg.y })));
    while (hasRemainingCommits() && step < maxSteps) {
      const next = simPathfinder.findNextStep(simSnake, simGrid);
      if (!next) break;

      step++;
      const key = `${next.x}_${next.y}`;
      if (simGrid[next.x][next.y].level > 0) {
        (cellBites[key] = cellBites[key] || []).push(step);
      }

      simSnake.moveTo(next, simGrid);
      history.push(simSnake.body.map(seg => ({ x: seg.x, y: seg.y })));
    }

    const totalSteps = history.length;

    // Duración según velocidad seleccionada
    let stepDuration = 0.11;
    if (speedMode === 'fast') stepDuration = 0.07;
    else if (speedMode === 'relaxed') stepDuration = 0.16;

    const playDuration = totalSteps * stepDuration;
    let pauseDuration = 0.5;
    if (pauseMode === 'medium') pauseDuration = 1.2;
    else if (pauseMode === 'none') pauseDuration = 0.0;

    const totalDuration = (playDuration + pauseDuration).toFixed(2);
    const activePercent = (playDuration / totalDuration) * 100;
    // Con miles de pasos, un decimal no basta para separar fotogramas consecutivos
    const pctOf = (s) => +((s / totalSteps) * activePercent).toFixed(3);

    // 3. Generación ultra compacta de celdas SVG
    let gridSvg = '';
    let cellKeyframes = '';
    const colorVars = [palette.empty, palette.l1, palette.l2, palette.l3, palette.l4];

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cell = simGrid[x][y];
        const px = Math.round(padding + x * stepSize);
        const py = Math.round(padding + y * stepSize);
        const key = `${x}_${y}`;
        const origLevel = cell.originalLevel || 0;
        const bites = cellBites[key];

        if (origLevel > 0 && bites) {
          const animClass = `c${x}_${y}`;
          let frames = `0%{fill:${colorVars[origLevel]}}`;
          bites.forEach((biteStep, i) => {
            frames += `${pctOf(biteStep)}%{fill:${colorVars[Math.max(0, origLevel - i - 1)]}}`;
          });
          // Al terminar el recorrido la matriz se restaura y la pausa la muestra completa
          frames += `${+activePercent.toFixed(3)}%,100%{fill:${colorVars[origLevel]}}`;

          gridSvg += `<rect class="${animClass}" x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" rx="2.5" fill="${colorVars[origLevel]}"/>`;
          cellKeyframes += `.${animClass}{animation:${animClass} ${totalDuration}s infinite steps(1,end)}@keyframes ${animClass}{${frames}}`;
        } else {
          gridSvg += `<rect x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" rx="2.5" fill="${colorVars[origLevel] || colorVars[0]}"/>`;
        }
      }
    }

    // 4. Keyframes de la serpiente: una sola trayectoria (la de la cabeza) y cada segmento la sigue
    // con un retraso de N pasos. Solo se emiten los giros: la animación lineal interpola los tramos rectos.
    const snakeLen = history.reduce((max, h) => Math.max(max, h.length), 0);
    const toPx = (seg) => `${Math.round(padding + seg.x * stepSize)}px,${Math.round(padding + seg.y * stepSize)}px`;
    const positions = history.map(h => h[0]);
    let kfContent = '';

    for (let s = 0; s < totalSteps; s++) {
      const curr = positions[s];
      const prev = positions[s - 1];
      const next = positions[s + 1];
      const isEdge = !prev || !next;
      const turns = !isEdge && ((curr.x - prev.x) !== (next.x - curr.x) || (curr.y - prev.y) !== (next.y - curr.y));
      if (isEdge || turns) {
        kfContent += `${pctOf(s)}%{transform:translate(${toPx(curr)})}`;
      }
    }

    kfContent += `${+activePercent.toFixed(3)}%{transform:translate(${toPx(positions[totalSteps - 1])})}`;
    // Salto instantáneo al inicio para que no cruce el tablero durante la pausa
    kfContent += `${+(activePercent + 0.001).toFixed(3)}%,100%{transform:translate(${toPx(positions[0])})}`;

    let snakeKeyframes = `.snk{animation:s ${totalDuration}s infinite linear}@keyframes s{${kfContent}}`;
    for (let segIdx = 1; segIdx < snakeLen; segIdx++) {
      // Retraso negativo equivalente a ir segIdx pasos por detrás de la cabeza dentro del bucle
      snakeKeyframes += `.snk-${segIdx}{animation-delay:-${(totalDuration - segIdx * stepDuration).toFixed(2)}s}`;
    }

    // 5. Elementos de la serpiente
    let snakeElements = '';
    // De la cola a la cabeza, para que la cabeza quede dibujada encima
    for (let segIdx = snakeLen - 1; segIdx >= 0; segIdx--) {
      const isHead = (segIdx === 0);
      const fill = isHead ? palette.head : palette.body;
      const size = isHead ? cellSize : cellSize * 0.9;
      const offset = isHead ? 0 : (cellSize - size) / 2;
      const rx = morphMode === 'retro' ? 0 : (morphMode === 'capsule' ? size * 0.45 : 3);

      snakeElements += `<g class="snk snk-${segIdx}"><rect x="${offset - 1}" y="${offset - 1}" width="${size + 2}" height="${size + 2}" rx="${rx}" fill="#000"/><rect x="${offset}" y="${offset}" width="${size}" height="${size}" rx="${rx}" fill="${fill}"/>${!isHead && morphMode === 'matrix_viper' ? `<rect x="${offset + (size - size * 0.4) / 2}" y="${offset + (size - size * 0.4) / 2}" width="${size * 0.4}" height="${size * 0.4}" rx="1" fill="${palette.spine}"/>` : ''}</g>`;
    }

    // 6. SVG Minificado Final
    const svgFinal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><defs><filter id="g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><style>svg{background:${palette.bg};border-radius:12px;border:1px solid ${palette.border}}${cellKeyframes}${snakeKeyframes}</style><g>${gridSvg}</g><g filter="url(#g)">${snakeElements}</g></svg>`;

    return svgFinal;
  }

  generateWorkflowYaml(username = 'USUARIO') {
    return `name: GitHub Snake

on:
  # Se regenera cada dia a medianoche (UTC)
  schedule:
    - cron: "0 0 * * *"
  # Permite ejecutarlo a mano desde la pestana Actions
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  generate:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Generate Snake SVG
        uses: luisrodriguez-rgb/GITHUB_SNAKE.EXE@main
        with:
          github_user_name: ${username}
          outputs: |
            dist/github-snake.svg?theme=light
            dist/github-snake-dark.svg?theme=dark

      - name: Deploy to Output Branch
        uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;
  }

  generateReadmeSnippet(username = 'USUARIO') {
    return `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${username}/${username}/output/github-snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/${username}/${username}/output/github-snake.svg">
  <img alt="GITHUB_SNAKE.EXE contribution animation" src="https://raw.githubusercontent.com/${username}/${username}/output/github-snake.svg">
</picture>`;
  }
}

window.ExporterEngine = ExporterEngine;
