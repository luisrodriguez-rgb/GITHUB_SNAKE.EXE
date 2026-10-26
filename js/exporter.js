/**
 * Exporter Engine Pro: Generador de SVG Animado Ultra Optimizado y Workflows
 * Máxima compresión de keyframes, eliminación de redundancias, sin saltos en bordes y peso reducido al mínimo.
 */

class ExporterEngine {
  constructor() {
    this.themePalettes = {
      dark: {
        text: '#e6fff2',
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
        text: '#1f2328',
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
        text: '#ffd6f5',
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
        text: '#d8fbff',
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
        text: '#ffe2b0',
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
    const lang = options.lang === 'es' ? 'es' : 'en';
    const username = options.user ? String(options.user) : '';

    const cols = 53;
    const rows = 7;
    const cellSize = 11;
    const cellGap = 3.5;
    const padding = 16;
    const headerHeight = 30;
    const stepSize = cellSize + cellGap;

    const width = (cols * stepSize) + (padding * 2) - cellGap;
    const height = (rows * stepSize) + (padding * 2) - cellGap + headerHeight;
    const gridTop = padding + headerHeight;
    const cellX = (x) => Math.round(padding + x * stepSize);
    const cellY = (y) => Math.round(gridTop + y * stepSize);

    // 1-2. Simulación (solo depende de la matriz: se reutiliza entre temas, velocidades y formas)
    const { simGrid, history, cellBites, totalLevels, eatenLevels } = this.simulate(grid, cols, rows);
    const totalSteps = history.length;

    // Duración según velocidad seleccionada
    let stepDuration = 0.11;
    if (speedMode === 'fast') stepDuration = 0.07;
    else if (speedMode === 'relaxed') stepDuration = 0.16;

    // La pausa final aloja la celebración y la ola que vuelve a llenar la matriz
    let pauseDuration = 1.5;
    if (pauseMode === 'medium') pauseDuration = 2.5;
    else if (pauseMode === 'none') pauseDuration = 0.0;

    const playDuration = totalSteps * stepDuration;
    const totalDuration = (playDuration + pauseDuration).toFixed(2);
    const activePercent = (playDuration / totalDuration) * 100;
    // Con miles de pasos, un decimal no basta para separar fotogramas consecutivos
    const pctOf = (step) => +((step / totalSteps) * activePercent).toFixed(3);
    const pctAt = (seconds) => +((seconds / totalDuration) * 100).toFixed(3);
    const active = +activePercent.toFixed(3);
    const waveSeconds = Math.min(1, pauseDuration * 0.6);
    const cleared = totalLevels > 0 && eatenLevels === totalLevels;

    // 3. Celdas: bajan de nivel con cada mordisco y al final reaparecen en ola de izquierda a derecha
    let gridSvg = '';
    let cellKeyframes = '';
    const colorVars = [palette.empty, palette.l1, palette.l2, palette.l3, palette.l4];

    for (let x = 0; x < cols; x++) {
      const restorePct = pctAt(playDuration + (waveSeconds * x) / (cols - 1));
      for (let y = 0; y < rows; y++) {
        const cell = simGrid[x][y];
        const origLevel = cell.originalLevel || 0;
        const bites = cellBites[`${x}_${y}`];

        if (origLevel > 0 && bites) {
          const animClass = `c${x}_${y}`;
          // Sin fotograma 0%: la animación parte del atributo fill de la celda
          let frames = '';
          bites.forEach((biteStep, i) => {
            frames += `${pctOf(biteStep)}%{fill:${colorVars[Math.max(0, origLevel - i - 1)]}}`;
          });
          frames += `${Math.max(restorePct, pctOf(bites[bites.length - 1] + 1))}%,100%{fill:${colorVars[origLevel]}}`;

          gridSvg += `<rect class="${animClass}" x="${cellX(x)}" y="${cellY(y)}" width="${cellSize}" height="${cellSize}" rx="2.5" fill="${colorVars[origLevel]}"/>`;
          cellKeyframes += `.${animClass}{animation:${animClass} ${totalDuration}s infinite steps(1,end)}@keyframes ${animClass}{${frames}}`;
        } else {
          gridSvg += `<rect x="${cellX(x)}" y="${cellY(y)}" width="${cellSize}" height="${cellSize}" rx="2.5" fill="${colorVars[origLevel] || colorVars[0]}"/>`;
        }
      }
    }

    // 4. Trayectoria: una sola (la de la cabeza) y el cuerpo la sigue con retraso.
    // Solo se emiten los giros: la animación lineal interpola los tramos rectos.
    const snakeLen = history.reduce((max, h) => Math.max(max, h.length), 0);
    const toPx = (pos) => `${+(padding + pos.x * stepSize).toFixed(2)}px,${+(gridTop + pos.y * stepSize).toFixed(2)}px`;
    const positions = history.map(h => h[0]);
    const dirAt = (s) => {
      const from = positions[Math.max(0, s - 1)];
      const to = positions[Math.max(1, s)] || from;
      return { x: Math.sign(to.x - from.x), y: Math.sign(to.y - from.y) };
    };
    const isTurn = (s) => {
      const prev = positions[s - 1];
      const next = positions[s + 1];
      const curr = positions[s];
      return (curr.x - prev.x) !== (next.x - curr.x) || (curr.y - prev.y) !== (next.y - curr.y);
    };

    let bodyFrames = '';
    for (let s = 0; s < totalSteps; s++) {
      if (s === 0 || s === totalSteps - 1 || isTurn(s)) {
        bodyFrames += `${pctOf(s)}%{transform:translate(${toPx(positions[s])})}`;
      }
    }
    bodyFrames += `${active}%{transform:translate(${toPx(positions[totalSteps - 1])})}`;
    // Salto instantáneo al inicio para que no cruce el tablero durante la pausa
    bodyFrames += `${+(activePercent + 0.001).toFixed(3)}%,100%{transform:translate(${toPx(positions[0])})}`;

    // Cabeza: se mueve con la animación del cuerpo (sin retraso) y gira aparte: al pasar cada curva rota
    // hacia la nueva dirección durante el primer tercio del paso. Solo giros: pocos bytes.
    const angleOf = (d) => (d.x === 1 ? 0 : d.x === -1 ? 180 : d.y === 1 ? 90 : -90);
    let angle = angleOf(dirAt(1));
    const firstAngle = angle;
    const nearest = (target) => {
      let a = target;
      while (a - angle > 180) a -= 360;
      while (angle - a > 180) a += 360;
      return a;
    };
    let headFrames = `0%{rotate:${angle}deg}`;
    for (let s = 1; s < totalSteps - 1; s++) {
      if (!isTurn(s)) continue;
      const out = { x: positions[s + 1].x - positions[s].x, y: positions[s + 1].y - positions[s].y };
      const next = nearest(angleOf(out));
      if (next === angle) continue;
      headFrames += `${pctOf(s)}%{rotate:${angle}deg}${pctOf(s + 1 / 3)}%{rotate:${next}deg}`;
      angle = next;
    }
    headFrames += `${active}%{rotate:${angle}deg}${+(activePercent + 0.001).toFixed(3)}%,100%{rotate:${firstAngle}deg}`;

    // Cuerpo continuo: un segmento cada medio paso, solapados, estrechándose y desvaneciéndose hacia la cola
    const bodyCount = morphMode === 'retro' ? snakeLen - 1 : (snakeLen - 1) * 2;
    const spacing = morphMode === 'retro' ? 1 : 0.5;
    let snakeKeyframes = `.sb{animation:s ${totalDuration}s infinite linear}@keyframes s{${bodyFrames}}`;
    snakeKeyframes += `.hr{transform-box:view-box;transform-origin:${cellSize / 2}px ${cellSize / 2}px;animation:h ${totalDuration}s infinite linear}@keyframes h{${headFrames}}`;
    // Dos pasadas: primero todos los contornos y luego todos los cuerpos. Con un contorno por segmento,
    // cada uno tapaba al anterior y el cuerpo parecía un collar de cuentas.
    let outlineElements = '';
    let bodyElements = '';
    for (let k = bodyCount; k >= 1; k--) {
      const t = k / bodyCount;
      snakeKeyframes += `.k${k}{animation-delay:-${(totalDuration - k * spacing * stepDuration).toFixed(3)}s}`;
      const size = morphMode === 'retro' ? cellSize * 0.9 : +(12.5 - 5.5 * t).toFixed(2);
      const off = +((cellSize - size) / 2).toFixed(2);
      const rx = morphMode === 'retro' ? 0 : (morphMode === 'capsule' ? size / 2 : 3);
      const opacity = +(1 - 0.45 * t).toFixed(2);
      const core = morphMode === 'matrix_viper'
        ? `<rect x="${+(off + size * 0.32).toFixed(2)}" y="${+(off + size * 0.32).toFixed(2)}" width="${+(size * 0.36).toFixed(2)}" height="${+(size * 0.36).toFixed(2)}" rx="1" fill="${palette.spine}"/>`
        : '';
      outlineElements += `<rect class="sb k${k}" x="${off - 1.2}" y="${off - 1.2}" width="${+(size + 2.4).toFixed(2)}" height="${+(size + 2.4).toFixed(2)}" rx="${rx}" fill="#000" opacity=".6"/>`;
      bodyElements += `<g class="sb k${k}" opacity="${opacity}"><rect x="${off}" y="${off}" width="${size}" height="${size}" rx="${rx}" fill="${palette.body}"/>${core}</g>`;
    }
    let snakeElements = outlineElements + bodyElements;
    // Cabeza mirando hacia +x (el giro la orienta): dos ojos hacia el frente
    const headRx = morphMode === 'retro' ? 0 : (morphMode === 'capsule' ? 6 : 3.5);
    snakeElements += `<g class="sb"><g class="hr"><rect x="-1.5" y="-1.5" width="14" height="14" rx="${headRx}" fill="${palette.head}"/>`
      + `<circle cx="7.6" cy="3.2" r="2" fill="#fff"/><circle cx="7.6" cy="7.8" r="2" fill="#fff"/>`
      + `<circle cx="8.3" cy="3.2" r="1" fill="#000"/><circle cx="8.3" cy="7.8" r="1" fill="#000"/></g></g>`;

    // Ondas expansivas al terminar de comer una celda intensa (nivel 3-4). Van por encima de la serpiente
    // (un destello en la celda quedaba tapado por la cabeza) y un grupo de 4 anillos se reutiliza por turnos.
    const bursts = [];
    for (const [key, bites] of Object.entries(cellBites)) {
      const [bx, by] = key.split('_').map(Number);
      if (simGrid[bx][by].originalLevel >= 3) bursts.push({ step: bites[bites.length - 1], x: bx, y: by });
    }
    bursts.sort((p, q) => p.step - q.step);
    const ringCount = Math.min(4, bursts.length);
    let ringElements = '';
    for (let r = 0; r < ringCount; r++) {
      let frames = '0%{opacity:0}';
      for (let i = r; i < bursts.length; i += ringCount) {
        const { step, x, y } = bursts[i];
        const at = `translate:${+(cellX(x) + cellSize / 2).toFixed(1)}px ${+(cellY(y) + cellSize / 2).toFixed(1)}px`;
        // Colocarlo invisible justo antes, para que no se deslice a la vista desde la onda anterior
        frames += `${pctOf(step - 0.05)}%{${at};scale:.3;opacity:0}${pctOf(step)}%{scale:.3;opacity:1}${pctOf(step + 3)}%{scale:1.9;opacity:0}`;
      }
      snakeKeyframes += `.r${r}{animation:r${r} ${totalDuration}s infinite linear}@keyframes r${r}{${frames}}`;
      ringElements += `<circle class="r${r}" r="8" fill="none" stroke="${palette.head}" stroke-width="2" opacity="0"/>`;
    }

    // Durante la pausa final la serpiente se desvanece: la cabeza vuelve al inicio y el cuerpo, que la sigue
    // con retraso, todavía estaría al final del recorrido
    if (pauseDuration > 0) {
      snakeKeyframes += `.sn{animation:v ${totalDuration}s infinite linear}@keyframes v{0%,${active}%{opacity:1}${pctAt(playDuration + 0.25)}%,99.9%{opacity:0}100%{opacity:1}}`;
    }

    // 5. Cabecera: usuario, contribuciones del año y barra de progreso sincronizada con los mordiscos
    let totalContributions = 0;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const c = grid[x] && grid[x][y];
        if (c && c.originalLevel > 0) totalContributions += c.count || 0;
      }
    }
    const sep = lang === 'es' ? '.' : ',';
    const formatted = String(totalContributions).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    const texts = lang === 'es'
      ? { contributions: `${formatted} contribuciones en el último año`, cleared: '100% DEVORADO' }
      : { contributions: `${formatted} contributions in the last year`, cleared: '100% DEVOURED' };
    const title = [username ? `@${username}` : '', texts.contributions].filter(Boolean).join(' · ');

    const barWidth = 150;
    const barX = width - padding - barWidth;
    const allBites = Object.values(cellBites).flat().sort((p, q) => p - q);
    let progressFrames = '0%{transform:scaleX(0)}';
    let lastEmitted = 0;
    allBites.forEach((biteStep, i) => {
      const fraction = (i + 1) / Math.max(1, totalLevels);
      if (fraction - lastEmitted >= 0.02 || i === allBites.length - 1) {
        progressFrames += `${pctOf(biteStep)}%{transform:scaleX(${+fraction.toFixed(3)})}`;
        lastEmitted = fraction;
      }
    });
    progressFrames += `${active}%,100%{transform:scaleX(${+(eatenLevels / Math.max(1, totalLevels)).toFixed(3)})}`;

    const font = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
    let headerSvg = `<text x="${padding}" y="${padding + 10}" font-family="${font}" font-size="12" font-weight="700" fill="${palette.text}">${this.escapeXml(title)}</text>`
      + `<rect x="${barX}" y="${padding + 2}" width="${barWidth}" height="8" rx="4" fill="${palette.empty}"/>`
      + `<rect class="pb" x="${barX}" y="${padding + 2}" width="${barWidth}" height="8" rx="4" fill="${palette.body}"/>`;
    let headerCss = `.pb{transform-box:fill-box;transform-origin:left;animation:p ${totalDuration}s infinite linear}@keyframes p{${progressFrames}}`;
    if (cleared && pauseDuration > 0) {
      // Celebración durante la pausa: el texto aparece mientras la matriz vuelve a llenarse
      headerSvg += `<text class="dn" x="${barX - 10}" y="${padding + 10}" text-anchor="end" font-family="${font}" font-size="12" font-weight="800" fill="${palette.head}">${texts.cleared}</text>`;
      headerCss += `.dn{opacity:0;animation:d ${totalDuration}s infinite steps(1,end)}@keyframes d{0%{opacity:0}${active}%{opacity:1}${pctAt(playDuration + pauseDuration * 0.92)}%,100%{opacity:0}}`;
    }

    // 6. SVG Minificado Final
    const svgFinal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><defs><filter id="g" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><style>svg{background:${palette.bg};border-radius:12px;border:1px solid ${palette.border}}${headerCss}${cellKeyframes}${snakeKeyframes}</style>${headerSvg}<g>${gridSvg}</g><g class="sn" filter="url(#g)">${snakeElements}</g><g filter="url(#g)">${ringElements}</g></svg>`;

    return svgFinal;
  }

  escapeXml(text) {
    return String(text).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);
  }

  /**
   * Rutas de salida de la Action según el estilo elegido.
   * style: { adaptive, darkTheme, lightTheme, morph, speed, pause }
   * adaptive=false usa solo darkTheme (el estilo único).
   */
  workflowOutputs(style = {}) {
    const query = (theme) => {
      const params = new URLSearchParams({ theme });
      // Solo se escriben las opciones distintas de las de la Action, para que el YAML quede corto
      if (style.morph && style.morph !== 'matrix_viper') params.set('morph', style.morph);
      if (style.speed && style.speed !== 'normal') params.set('speed', style.speed);
      if (style.pause && style.pause !== 'fast') params.set('pause', style.pause);
      if (style.lang && style.lang !== 'en') params.set('lang', style.lang);
      return params.toString();
    };
    const darkTheme = style.darkTheme || 'dark';

    if (style.adaptive === false) {
      return [{ file: 'github-snake.svg', query: query(darkTheme) }];
    }
    return [
      { file: 'github-snake.svg', query: query(style.lightTheme || 'light') },
      { file: 'github-snake-dark.svg', query: query(darkTheme) }
    ];
  }

  /**
   * Recorrido completo de la serpiente sobre la matriz original. El resultado no depende de las opciones del SVG,
   * así que se memoriza por contenido de la matriz: la versión clara y la oscura de un perfil simulan una sola vez.
   * Quien lo use solo debe leerlo.
   */
  simulate(grid, cols = 53, rows = 7) {
    let signature = '';
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const c = grid[x] && grid[x][y];
        signature += c ? c.originalLevel : 0;
      }
    }
    this.simulationCache = this.simulationCache || new Map();
    const cached = this.simulationCache.get(signature);
    if (cached) return cached;

    // Se parte de la matriz original: en la web la partida en curso ya se ha comido celdas
    const simGrid = [];
    let remainingLevels = 0;
    for (let x = 0; x < cols; x++) {
      const col = [];
      for (let y = 0; y < rows; y++) {
        const c = grid[x] && grid[x][y];
        const level = c ? c.originalLevel : 0;
        remainingLevels += level;
        col.push({ x, y, level, originalLevel: level });
      }
      simGrid.push(col);
    }

    // Empieza junto a la primera columna con actividad: en perfiles nuevos no cruza medio tablero vacío
    let start = { x: 0, y: 0 };
    findStart:
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (simGrid[x][y].level > 0) {
          start = { x: Math.max(0, x - 1), y };
          break findStart;
        }
      }
    }
    const totalLevels = remainingLevels;
    const simSnake = new Snake(4, start);
    simSnake.effects = false;
    const simPathfinder = new SnakePathfinder(cols, rows);
    const history = [];
    const cellBites = {}; // key -> pasos en los que la serpiente quitó un nivel
    // Margen amplio: cada nivel exige volver a pisar la celda
    const maxSteps = Math.min(8000, 400 + remainingLevels * 30);

    let step = 0;
    history.push(simSnake.body.map(seg => ({ x: seg.x, y: seg.y })));
    while (remainingLevels > 0 && step < maxSteps) {
      const next = simPathfinder.findNextStep(simSnake, simGrid);
      if (!next) break;

      step++;
      if (simGrid[next.x][next.y].level > 0) {
        const key = `${next.x}_${next.y}`;
        (cellBites[key] = cellBites[key] || []).push(step);
        remainingLevels--;
      }

      simSnake.moveTo(next, simGrid);
      history.push(simSnake.body.map(seg => ({ x: seg.x, y: seg.y })));
    }

    const result = { simGrid, history, cellBites, totalLevels, eatenLevels: totalLevels - remainingLevels };
    this.simulationCache.set(signature, result);
    // Pocas entradas: el endpoint y la web solo alternan entre unas pocas matrices
    if (this.simulationCache.size > 20) {
      this.simulationCache.delete(this.simulationCache.keys().next().value);
    }
    return result;
  }

  generateWorkflowYaml(username = 'USUARIO', style = {}) {
    const outputs = this.workflowOutputs(style)
      .map(o => `            dist/${o.file}?${o.query}`)
      .join('\n');

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
        uses: luisrodriguez-rgb/GITHUB_SNAKE.EXE@v3
        with:
          github_user_name: ${username}
          outputs: |
${outputs}

      - name: Deploy to Output Branch
        uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;
  }

  /**
   * Bloque para el README. Con apiBase apunta al endpoint SVG (sin workflow);
   * sin él, a la rama output que publica la Action.
   */
  generateReadmeSnippet(username = 'USUARIO', style = {}, apiBase = '') {
    const base = `https://raw.githubusercontent.com/${username}/${username}/output`;
    const alt = 'GITHUB_SNAKE.EXE contribution animation';
    const urlFor = (output) => (apiBase ? `${apiBase}/api/${username}.svg?${output.query}` : `${base}/${output.file}`);
    const [light, dark] = this.workflowOutputs(style);

    if (style.adaptive === false) {
      return `<img alt="${alt}" src="${urlFor(light)}" width="100%">`;
    }
    return `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="${urlFor(dark)}">
  <source media="(prefers-color-scheme: light)" srcset="${urlFor(light)}">
  <img alt="${alt}" src="${urlFor(light)}" width="100%">
</picture>`;
  }
}

window.ExporterEngine = ExporterEngine;
