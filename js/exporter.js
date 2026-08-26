/**
 * Exporter Engine: Generador de SVG Animado 100% Completo y Workflows de GitHub Actions
 * Simula el recorrido completo hasta devorar la TOTALIDAD de los commits de la matriz sin cortes prematuros.
 */

class ExporterEngine {
  /**
   * Genera un SVG animado donde la serpiente se come el 100% de los commits
   * @param {Array<Array<Object>>} grid - Matriz de contribuciones actual
   * @param {string} username - Nombre de usuario
   */
  exportAnimatedSvg(grid, username = 'developer') {
    if (!grid || grid.length === 0) return;

    const cols = 53;
    const rows = 7;
    const cellSize = 11;
    const cellGap = 3.5;
    const padding = 16;
    const stepSize = cellSize + cellGap;

    const width = (cols * stepSize) + (padding * 2) - cellGap;
    const height = (rows * stepSize) + (padding * 2) - cellGap;

    // 1. Clonar la cuadrícula para simulación
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

    // 2. Ejecutar simulación completa hasta limpiar el 100% de la matriz
    const simSnake = new Snake(4, { x: 0, y: 0 });
    const simPathfinder = new SnakePathfinder(cols, rows);
    const history = [];
    const cellEatenStep = {}; // Registra el paso exacto en que cada celda queda limpia
    const maxSafetySteps = 450; // Límite amplio para garantizar 100% de limpieza

    let step = 0;
    while (hasRemainingCommits() && step < maxSafetySteps) {
      const segments = simSnake.body.map(seg => ({ x: seg.x, y: seg.y }));
      history.push(segments);

      const next = simPathfinder.findNextStep(simSnake, simGrid);
      if (!next) break;

      const key = `${next.x}_${next.y}`;
      if (simGrid[next.x] && simGrid[next.x][next.y].level > 0) {
        if (cellEatenStep[key] === undefined) {
          cellEatenStep[key] = step;
        }
      }

      simSnake.moveTo(next, simGrid);
      step++;
    }

    // Pasos adicionales de patrullaje final para cerrar el ciclo limpiamente
    for (let extra = 0; extra < 12; extra++) {
      const segments = simSnake.body.map(seg => ({ x: seg.x, y: seg.y }));
      history.push(segments);
      const next = simPathfinder.findNextStep(simSnake, simGrid) || {
        x: (simSnake.head.x + 1) % cols,
        y: simSnake.head.y
      };
      simSnake.moveTo(next, simGrid);
      step++;
    }

    const totalSteps = history.length;
    // Duración total calculada a ~8-9 pasos por segundo para máxima fluidez y tiempo justo
    const durationSeconds = Math.max(10, Math.min(45, (totalSteps * 0.12).toFixed(1)));

    // 3. Generar celdas SVG con animaciones de desaparición sincronizadas
    let gridSvg = '';
    let cellKeyframes = '';
    const colorVars = ['var(--c-empty)', 'var(--c-l1)', 'var(--c-l2)', 'var(--c-l3)', 'var(--c-l4)'];

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cell = simGrid[x][y];
        const px = padding + x * stepSize;
        const py = padding + y * stepSize;
        const key = `${x}_${y}`;
        const origLevel = cell.originalLevel || 0;

        if (origLevel > 0 && cellEatenStep[key] !== undefined) {
          const eatenPercent = ((cellEatenStep[key] / totalSteps) * 100).toFixed(2);
          const animName = `eat_${x}_${y}`;

          gridSvg += `<rect class="cell cell-eatable ${animName}" x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" rx="2.5" fill="${colorVars[origLevel]}" />\n`;

          cellKeyframes += `
            .${animName} {
              animation: ${animName} ${durationSeconds}s infinite steps(1);
            }
            @keyframes ${animName} {
              0%, ${Math.max(0, (eatenPercent - 0.5)).toFixed(2)}% { fill: ${colorVars[origLevel]}; }
              ${eatenPercent}%, 100% { fill: var(--c-empty); }
            }
          `;
        } else {
          const fill = colorVars[origLevel] || colorVars[0];
          gridSvg += `<rect class="cell" x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" rx="2.5" fill="${fill}" />\n`;
        }
      }
    }

    // 4. Generar keyframes CSS para cada segmento de la serpiente
    let snakeKeyframes = '';
    const snakeLen = Math.min(6, history[0].length);

    for (let segIdx = 0; segIdx < snakeLen; segIdx++) {
      const animName = `snakeSeg_${segIdx}`;
      let kfContent = '';

      for (let s = 0; s < totalSteps; s++) {
        const pct = ((s / totalSteps) * 100).toFixed(2);
        const seg = history[s][segIdx] || history[s][history[s].length - 1];
        const px = padding + seg.x * stepSize;
        const py = padding + seg.y * stepSize;
        kfContent += `${pct}% { transform: translate(${px}px, ${py}px); }\n`;
      }

      // Cerrar bucle al 100%
      const firstSeg = history[0][segIdx] || history[0][history[0].length - 1];
      kfContent += `100% { transform: translate(${padding + firstSeg.x * stepSize}px, ${padding + firstSeg.y * stepSize}px); }\n`;

      snakeKeyframes += `
        .seg-${segIdx} {
          animation: ${animName} ${durationSeconds}s infinite linear;
        }
        @keyframes ${animName} {
          ${kfContent}
        }
      `;
    }

    // 5. Elementos de la serpiente
    let snakeElements = '';
    for (let segIdx = 0; segIdx < snakeLen; segIdx++) {
      const isHead = (segIdx === 0);
      const fill = isHead ? 'var(--s-head)' : 'var(--s-body)';
      const size = isHead ? cellSize : cellSize * 0.9;
      const offset = isHead ? 0 : (cellSize - size) / 2;
      const glowFilter = isHead ? 'filter="url(#glow)"' : '';

      snakeElements += `<rect class="seg-${segIdx}" x="${offset}" y="${offset}" width="${size}" height="${size}" rx="3" fill="${fill}" ${glowFilter} />\n`;
    }

    // 6. Ensamblado del SVG final completo con soporte Dark/Light Mode
    const svgFinal = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <style>
    :root {
      --bg: #040806;
      --border: rgba(0, 255, 102, 0.15);
      --c-empty: #0a140e;
      --c-l1: #07381b;
      --c-l2: #096831;
      --c-l3: #00b34d;
      --c-l4: #00ff66;
      --s-head: #ffffff;
      --s-body: #00ff66;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #ffffff;
        --border: rgba(31, 35, 40, 0.15);
        --c-empty: #ebedf0;
        --c-l1: #9be9a8;
        --c-l2: #40c463;
        --c-l3: #30a14e;
        --c-l4: #216e39;
        --s-head: #0969da;
        --s-body: #1a7f37;
      }
    }
    .container-bg {
      fill: var(--bg);
      stroke: var(--border);
      stroke-width: 1px;
      rx: 12px;
    }
    ${cellKeyframes}
    ${snakeKeyframes}
  </style>

  <!-- Fondo con esquinas redondeadas -->
  <rect width="100%" height="100%" class="container-bg" />

  <!-- Cuadricula de Contribuciones -->
  <g class="grid-layer">
    ${gridSvg}
  </g>

  <!-- Serpiente Dinamica -->
  <g class="snake-layer">
    ${snakeElements}
  </g>
</svg>`;

    // Descarga del archivo
    const blob = new Blob([svgFinal], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-contribution-grid-snake-${username}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Genera el YAML del workflow de GitHub Actions personalizado
   */
  generateWorkflowYaml(username = 'USUARIO') {
    return `name: Generate Snake Animation

on:
  schedule:
    - cron: "0 0 * * *"
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
        uses: Platane/snk/svg-only@v3
        with:
          github_user_name: ${username}
          outputs: |
            dist/github-contribution-grid-snake.svg
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Deploy to Output Branch
        uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;
  }

  /**
   * Genera el bloque Markdown de imagen para el README.md
   */
  generateReadmeSnippet(username = 'USUARIO') {
    return `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${username}/${username}/output/github-contribution-grid-snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/${username}/${username}/output/github-contribution-grid-snake.svg">
  <img alt="Snake Contribution Grid" src="https://raw.githubusercontent.com/${username}/${username}/output/github-contribution-grid-snake.svg">
</picture>`;
  }
}

window.ExporterEngine = ExporterEngine;
