/**
 * Exporter Engine: Generador de SVG Animado y Workflows de GitHub Actions
 */

class ExporterEngine {
  /**
   * Genera y descarga un archivo SVG independiente con animación CSS de la cuadrícula actual
   * @param {Array<Array<Object>>} grid - Matriz de contribuciones
   * @param {string} username - Nombre de usuario
   */
  exportAnimatedSvg(grid, username = 'developer') {
    const cellSize = 12;
    const cellGap = 3.5;
    const padding = 20;
    const cols = grid.length || 53;
    const rows = (grid[0] && grid[0].length) || 7;

    const width = (cols * (cellSize + cellGap)) + (padding * 2);
    const height = (rows * (cellSize + cellGap)) + (padding * 2);

    let cellsSvg = '';
    const colorMap = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cell = grid[x][y];
        const px = padding + x * (cellSize + cellGap);
        const py = padding + y * (cellSize + cellGap);
        const color = colorMap[cell.level] || colorMap[0];
        cellsSvg += `<rect x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" rx="2.5" fill="${color}" />\n`;
      }
    }

    const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    .bg { fill: #040806; }
    .grid-cell { rx: 2.5px; }
    @keyframes snakeMove {
      0% { transform: translate(0px, 0px); }
      25% { transform: translate(120px, 0px); }
      50% { transform: translate(120px, 45px); }
      75% { transform: translate(0px, 45px); }
      100% { transform: translate(0px, 0px); }
    }
    .snake-body {
      animation: snakeMove 8s infinite linear;
      filter: drop-shadow(0 0 6px #00ff66);
    }
  </style>
  <rect width="100%" height="100%" class="bg" rx="12"/>
  <g class="grid">
    ${cellsSvg}
  </g>
  <g class="snake-body">
    <rect x="${padding}" y="${padding}" width="${cellSize}" height="${cellSize}" rx="3" fill="#ffffff" />
    <rect x="${padding - 15}" y="${padding}" width="${cellSize}" height="${cellSize}" rx="3" fill="#00ff66" />
    <rect x="${padding - 30}" y="${padding}" width="${cellSize}" height="${cellSize}" rx="3" fill="#00b34d" />
  </g>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-snake-${username}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Genera el YAML del workflow de GitHub Actions personalizado
   * @param {string} username - Nombre del perfil
   * @returns {string} Código YAML listo para usar
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
