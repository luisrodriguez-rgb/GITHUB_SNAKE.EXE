/**
 * Exporter Engine Pro: Generador de SVG Animado Personalizado y Workflows de GitHub Actions
 * Resuelve el fallo de salto toroidal en CSS, permite personalizar velocidad, tema, morfología y tiempo de reinicio.
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
   * Genera y descarga un SVG animado con opciones personalizadas
   */
  exportAnimatedSvg(grid, username = 'developer', options = {}) {
    if (!grid || grid.length === 0) return;

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

    // 2. Simulación completa de recorrido
    const simSnake = new Snake(4, { x: 0, y: 0 });
    const simPathfinder = new SnakePathfinder(cols, rows);
    const history = [];
    const cellEatenStep = {};
    const maxSteps = 350;

    let step = 0;
    while (hasRemainingCommits() && step < maxSteps) {
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

    // Agregar solo 2 pasos de cierre limpios
    for (let extra = 0; extra < 2; extra++) {
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

    // Duración según velocidad seleccionada
    let stepDuration = 0.12;
    if (speedMode === 'fast') stepDuration = 0.08;
    else if (speedMode === 'relaxed') stepDuration = 0.18;

    const playDuration = totalSteps * stepDuration;
    let pauseDuration = 0.6;
    if (pauseMode === 'medium') pauseDuration = 1.5;
    else if (pauseMode === 'none') pauseDuration = 0.0;

    const totalDuration = (playDuration + pauseDuration).toFixed(2);
    const activePercent = ((playDuration / totalDuration) * 100).toFixed(2);

    // 3. Generar celdas con keyframes
    let gridSvg = '';
    let cellKeyframes = '';
    const colorVars = [palette.empty, palette.l1, palette.l2, palette.l3, palette.l4];

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cell = simGrid[x][y];
        const px = padding + x * stepSize;
        const py = padding + y * stepSize;
        const key = `${x}_${y}`;
        const origLevel = cell.originalLevel || 0;

        if (origLevel > 0 && cellEatenStep[key] !== undefined) {
          const eatenPercent = ((cellEatenStep[key] / totalSteps) * activePercent).toFixed(2);
          const animName = `eat_${x}_${y}`;

          gridSvg += `<rect class="cell ${animName}" x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" rx="2.5" fill="${colorVars[origLevel]}" />\n`;

          cellKeyframes += `
            .${animName} {
              animation: ${animName} ${totalDuration}s infinite steps(1);
            }
            @keyframes ${animName} {
              0%, ${Math.max(0, (eatenPercent - 0.2)).toFixed(2)}% { fill: ${colorVars[origLevel]}; }
              ${eatenPercent}%, ${activePercent}% { fill: ${palette.empty}; }
              ${(parseFloat(activePercent) + 0.1).toFixed(2)}%, 100% { fill: ${colorVars[origLevel]}; }
            }
          `;
        } else {
          const fill = colorVars[origLevel] || colorVars[0];
          gridSvg += `<rect class="cell" x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" rx="2.5" fill="${fill}" />\n`;
        }
      }
    }

    // 4. Generar keyframes de la serpiente SIN fallo de vuelo horizontal en bordes
    let snakeKeyframes = '';
    const snakeLen = Math.min(5, history[0].length);

    for (let segIdx = 0; segIdx < snakeLen; segIdx++) {
      const animName = `snakeSeg_${segIdx}`;
      let kfContent = '';

      for (let s = 0; s < totalSteps; s++) {
        const pct = ((s / totalSteps) * activePercent).toFixed(2);
        const curr = history[s][segIdx] || history[s][history[s].length - 1];
        const px = padding + curr.x * stepSize;
        const py = padding + curr.y * stepSize;

        // Comprobación de salto toroidal con respecto al paso anterior
        if (s > 0) {
          const prev = history[s - 1][segIdx] || history[s - 1][history[s - 1].length - 1];
          if (Math.abs(curr.x - prev.x) > 1 || Math.abs(curr.y - prev.y) > 1) {
            // Salto instantáneo en el borde para evitar que la serpiente cruce toda la pantalla
            const prePct = (((s - 0.01) / totalSteps) * activePercent).toFixed(2);
            const prevPx = padding + prev.x * stepSize;
            const prevPy = padding + prev.y * stepSize;
            kfContent += `${prePct}% { transform: translate(${prevPx}px, ${prevPy}px); opacity: 0; }\n`;
            kfContent += `${pct}% { transform: translate(${px}px, ${py}px); opacity: 1; }\n`;
            continue;
          }
        }

        kfContent += `${pct}% { transform: translate(${px}px, ${py}px); opacity: 1; }\n`;
      }

      // Mantener posición durante la breve pausa final y reiniciar limpio
      kfContent += `${activePercent}%, 100% { transform: translate(${padding + history[0][segIdx].x * stepSize}px, ${padding + history[0][segIdx].y * stepSize}px); opacity: 1; }\n`;

      snakeKeyframes += `
        .seg-${segIdx} {
          animation: ${animName} ${totalDuration}s infinite linear;
        }
        @keyframes ${animName} {
          ${kfContent}
        }
      `;
    }

    // 5. Elementos de la serpiente según morfología seleccionada
    let snakeElements = '';
    for (let segIdx = 0; segIdx < snakeLen; segIdx++) {
      const isHead = (segIdx === 0);
      const fill = isHead ? palette.head : palette.body;
      const size = isHead ? cellSize : cellSize * 0.9;
      const offset = isHead ? 0 : (cellSize - size) / 2;
      const rx = morphMode === 'retro' ? 0 : (morphMode === 'capsule' ? size * 0.45 : 3);

      snakeElements += `
        <g class="seg-${segIdx}">
          <!-- Silueta de alto contraste -->
          <rect x="${offset - 1}" y="${offset - 1}" width="${size + 2}" height="${size + 2}" rx="${rx}" fill="#000000" />
          <!-- Cuerpo neón -->
          <rect x="${offset}" y="${offset}" width="${size}" height="${size}" rx="${rx}" fill="${fill}" />
          ${!isHead && morphMode === 'matrix_viper' ? `<rect x="${offset + (size - size * 0.4) / 2}" y="${offset + (size - size * 0.4) / 2}" width="${size * 0.4}" height="${size * 0.4}" rx="1" fill="${palette.spine}" />` : ''}
        </g>
      `;
    }

    // 6. Ensamblado del SVG final
    const svgFinal = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <style>
    :root {
      --bg: ${palette.bg};
      --border: ${palette.border};
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

  <!-- Fondo -->
  <rect width="100%" height="100%" class="container-bg" />

  <!-- Cuadricula -->
  <g class="grid-layer">
    ${gridSvg}
  </g>

  <!-- Serpiente -->
  <g class="snake-layer" filter="url(#laserGlow)">
    ${snakeElements}
  </g>
</svg>`;

    // Descarga directa
    const blob = new Blob([svgFinal], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-snake-${username}-${themeKey}-${speedMode}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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

  generateReadmeSnippet(username = 'USUARIO') {
    return `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${username}/${username}/output/github-contribution-grid-snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/${username}/${username}/output/github-contribution-grid-snake.svg">
  <img alt="Snake Contribution Grid" src="https://raw.githubusercontent.com/${username}/${username}/output/github-contribution-grid-snake.svg">
</picture>`;
  }
}

window.ExporterEngine = ExporterEngine;
