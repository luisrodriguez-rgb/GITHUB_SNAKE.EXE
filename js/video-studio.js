/**
 * Video Studio: genera un MP4 listo para redes (X, LinkedIn, Reels, TikTok, Shorts) a partir de la misma
 * simulación del SVG. No graba la pantalla: dibuja cada fotograma en un canvas y lo codifica con WebCodecs (H.264),
 * así la animación sale perfecta a 30 fps y tarda menos que verla. Si el navegador no tiene WebCodecs,
 * reproduce la escena en tiempo real y la graba con MediaRecorder.
 *
 * Guion (~15 s): intro con usuario y contador -> la serpiente se come el año -> celebración con datos -> llamada a la acción.
 */

const VIDEO_FORMATS = {
  landscape: { width: 1280, height: 720 },
  square: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1920 }
};

const VIDEO_TEXT = {
  en: {
    contributions: 'contributions in the last year',
    devoured: 'devoured',
    cleared: '100% DEVOURED',
    activeDays: 'active days',
    bestDay: 'best day',
    streak: 'longest streak',
    days: 'days',
    cta: 'Can your GitHub beat mine?',
    ctaSub: 'Put the snake on your profile with one line'
  },
  es: {
    contributions: 'contribuciones en el último año',
    devoured: 'devorado',
    cleared: '100% DEVORADO',
    activeDays: 'días activos',
    bestDay: 'mejor día',
    streak: 'racha más larga',
    days: 'días',
    cta: '¿Tu GitHub le gana al mío?',
    ctaSub: 'Pon la serpiente en tu perfil con una línea'
  }
};

const H264_CODECS = ['avc1.640028', 'avc1.4d0028', 'avc1.42001f'];

class VideoStudio {
  constructor(exporter) {
    this.exporter = exporter;
  }

  /** Datos para la celebración: total, días activos, mejor día y racha más larga (en orden cronológico) */
  computeStats(grid) {
    let total = 0;
    let activeDays = 0;
    let best = { count: 0, date: null };
    let streak = 0;
    let longest = 0;
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        const c = grid[x][y];
        const count = c.originalLevel > 0 ? (c.count || c.originalLevel) : 0;
        total += c.originalLevel > 0 ? (c.count || 0) : 0;
        if (count > 0) {
          activeDays++;
          streak++;
          longest = Math.max(longest, streak);
          if (count > best.count) best = { count, date: c.date };
        } else if (c.date) {
          streak = 0;
        }
      }
    }
    return { total, activeDays, best, longest };
  }

  formatNumber(n, lang) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'es' ? '.' : ',');
  }

  formatDate(iso, lang) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' });
  }

  /** Prepara todo lo que no cambia entre fotogramas */
  buildScene({ grid, user, lang, theme, format, shareUrl, avatar }) {
    const size = VIDEO_FORMATS[format] || VIDEO_FORMATS.landscape;
    const palette = this.exporter.themePalettes[theme] || this.exporter.themePalettes.dark;
    const sim = this.exporter.simulate(grid);
    const totalSteps = sim.history.length;

    // La acción dura lo mismo para todos (entre 4 y 10 s): los perfiles muy activos van más rápido
    const timing = { intro: 1.5, play: Math.min(10, Math.max(4, totalSteps * 0.03)), finale: 2.6, outro: 2.4 };
    timing.total = timing.intro + timing.play + timing.finale + timing.outro;

    // Pasos en los que cada celda pierde un nivel y ondas de las celdas intensas
    const bitesByCell = sim.cellBites;
    const bursts = [];
    const allBites = [];
    for (const [key, bites] of Object.entries(bitesByCell)) {
      const [x, y] = key.split('_').map(Number);
      allBites.push(...bites);
      if (sim.simGrid[x][y].originalLevel >= 3) bursts.push({ step: bites[bites.length - 1], x, y });
    }
    allBites.sort((a, b) => a - b);

    // Rejilla: en horizontal, una banda de 53 semanas; en cuadrado y vertical el año se parte en dos bandas
    // de 27 y 26 semanas, con celdas casi el doble de grandes (una sola banda quedaba como una tira finísima)
    // En vertical el texto se ve en un móvil: escala mayor que en los formatos de escritorio
    const unit = format === 'vertical' ? size.width / 560 : Math.min(size.width, size.height) / 720;
    const margin = Math.round(size.width * 0.05);
    const bands = format === 'landscape' ? 1 : 2;
    const perBand = Math.ceil(53 / bands);
    // Altura máxima de la rejilla para que debajo quepan la celebración y las tarjetas
    const maxBoardHeight = format === 'square' ? size.height * 0.4 : format === 'vertical' ? size.height * 0.4 : Infinity;
    const step = Math.min((size.width - margin * 2) / perBand, maxBoardHeight / (7 * bands + 0.9 * (bands - 1)));
    const cell = step * 0.8;
    const bandGap = step * 0.9;
    const boardWidth = step * perBand;
    const boardHeight = step * 7 * bands + bandGap * (bands - 1);
    const boardLeft = (size.width - boardWidth) / 2;
    const boardX = boardLeft + (step - cell) / 2;
    const boardY = Math.round(format === 'vertical' ? size.height * 0.31 : format === 'square' ? size.height * 0.27 : size.height * 0.4);

    return {
      ...size, format, palette, user, lang, avatar, shareUrl,
      text: VIDEO_TEXT[lang] || VIDEO_TEXT.en,
      stats: this.computeStats(grid),
      sim, totalSteps, timing, bursts, allBites, bitesByCell,
      layout: { unit, margin, boardLeft, step, cell, bands, perBand, bandGap, boardWidth, boardHeight, boardX, boardY }
    };
  }

  /** Posición interpolada de la cabeza en el paso fraccionario s */
  headAt(scene, s) {
    const positions = scene.sim.history;
    const clamped = Math.max(0, Math.min(scene.totalSteps - 1, s));
    const i = Math.floor(clamped);
    const a = positions[i][0];
    const b = (positions[i + 1] || positions[i])[0];
    const f = clamped - i;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  /** Esquina superior izquierda de la celda (x, y); x puede ser fraccionario (serpiente en movimiento) */
  cellOrigin(L, x, y) {
    const band = Math.min(L.bands - 1, Math.max(0, Math.floor((x + 0.5) / L.perBand)));
    const localX = x - band * L.perBand;
    return { x: L.boardX + localX * L.step, y: L.boardY + band * (7 * L.step + L.bandGap) + y * L.step };
  }

  /** Nivel de una celda tras los mordiscos hasta el paso s */
  levelAt(scene, x, y, s) {
    const cell = scene.sim.simGrid[x][y];
    const bites = scene.bitesByCell[`${x}_${y}`];
    if (!bites) return cell.originalLevel;
    let eaten = 0;
    for (const b of bites) if (b <= s) eaten++;
    return Math.max(0, cell.originalLevel - eaten);
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /** Tamaño de letra que no supera `size` y cabe en `maxWidth` */
  fitFont(ctx, text, weight, size, maxWidth, family) {
    ctx.font = `${weight} ${size}px ${family}`;
    const width = ctx.measureText(text).width;
    const fitted = width > maxWidth ? size * (maxWidth / width) : size;
    ctx.font = `${weight} ${fitted}px ${family}`;
    return fitted;
  }

  ease(t) {
    const c = Math.max(0, Math.min(1, t));
    return 1 - Math.pow(1 - c, 3);
  }

  /** Dibuja el fotograma del segundo t */
  drawFrame(ctx, scene, t) {
    const { width: W, height: H, palette: P, layout: L, timing: T, text } = scene;
    const font = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    const unit = L.unit;
    const playStart = T.intro;
    const playEnd = T.intro + T.play;
    const finaleEnd = playEnd + T.finale;
    const step = t < playStart ? 0 : t > playEnd ? scene.totalSteps - 1 : ((t - playStart) / T.play) * (scene.totalSteps - 1);
    const colors = [P.empty, P.l1, P.l2, P.l3, P.l4];

    // Fondo con un halo suave del color de la serpiente
    ctx.fillStyle = P.bg;
    ctx.fillRect(0, 0, W, H);
    const halo = ctx.createRadialGradient(W / 2, L.boardY + L.boardHeight / 2, 0, W / 2, L.boardY + L.boardHeight / 2, W * 0.7);
    halo.addColorStop(0, P.glow.replace(/[\d.]+\)$/, '0.16)'));
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    // --- Cabecera: avatar, usuario y contador que sube durante la intro ---
    const introP = this.ease(t / T.intro);
    const titleY = scene.format === 'vertical' ? H * 0.17 : scene.format === 'square' ? H * 0.12 : H * 0.16;
    ctx.globalAlpha = introP;
    const avatarSize = 70 * unit;
    let textX = L.margin;
    if (scene.avatar) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(L.margin + avatarSize / 2, titleY, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(scene.avatar, L.margin, titleY - avatarSize / 2, avatarSize, avatarSize);
      ctx.restore();
      ctx.strokeStyle = P.body;
      ctx.lineWidth = 3 * unit;
      ctx.beginPath();
      ctx.arc(L.margin + avatarSize / 2, titleY, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();
      textX += avatarSize + 22 * unit;
    }
    const bigFont = 40 * unit;
    ctx.fillStyle = P.text;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    const title = scene.user ? `@${scene.user}` : 'GITHUB_SNAKE.EXE';
    this.fitFont(ctx, title, 800, bigFont, W - textX - L.margin, font);
    ctx.fillText(title, textX, titleY - bigFont * 0.1);
    const counter = Math.round(scene.stats.total * this.ease((t - 0.2) / (T.intro + 0.8)));
    const subtitle = `${this.formatNumber(scene.stats.total, scene.lang)} ${text.contributions}`;
    this.fitFont(ctx, subtitle, 700, bigFont * 0.55, W - textX - L.margin, font);
    ctx.fillStyle = P.l4;
    ctx.fillText(subtitle.replace(this.formatNumber(scene.stats.total, scene.lang), this.formatNumber(counter, scene.lang)), textX, titleY + bigFont * 0.75);
    ctx.globalAlpha = 1;

    // --- Barra de progreso sobre la rejilla ---
    const eatenNow = scene.allBites.filter(b => b <= step).length;
    const totalLevels = Math.max(1, scene.sim.totalLevels);
    const progress = t >= playEnd ? scene.sim.eatenLevels / totalLevels : eatenNow / totalLevels;
    const barY = L.boardY - 34 * unit;
    const barW = L.boardWidth;
    ctx.fillStyle = P.empty;
    this.roundRect(ctx, L.boardLeft, barY, barW, 10 * unit, 5 * unit);
    ctx.fill();
    ctx.fillStyle = P.body;
    ctx.shadowColor = P.glow;
    ctx.shadowBlur = 14 * unit;
    this.roundRect(ctx, L.boardLeft, barY, Math.max(10 * unit, barW * progress), 10 * unit, 5 * unit);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = `700 ${20 * unit}px ${font}`;
    ctx.fillStyle = P.text;
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(progress * 100)}% ${text.devoured}`, L.boardLeft + barW, barY - 10 * unit);
    ctx.textAlign = 'left';

    // --- Rejilla: aparece en ola en la intro, baja de nivel con los mordiscos y se rellena en ola al final ---
    for (let x = 0; x < 53; x++) {
      const appear = this.ease((t - 0.15 - (x / 52) * 0.9) / 0.35);
      const refillAt = playEnd + 0.9 + (x / 52) * 0.9;
      for (let y = 0; y < 7; y++) {
        const original = scene.sim.simGrid[x][y].originalLevel;
        let level = t >= refillAt ? original : this.levelAt(scene, x, y, step);
        const { x: px, y: py } = this.cellOrigin(L, x, y);
        ctx.globalAlpha = appear;
        ctx.fillStyle = colors[level] || P.empty;
        this.roundRect(ctx, px, py, L.cell, L.cell, L.cell * 0.2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // --- Ondas al vaciar una celda intensa ---
    for (const burst of scene.bursts) {
      const age = step - burst.step;
      if (age < 0 || age > 4 || t > playEnd) continue;
      const p = age / 4;
      ctx.strokeStyle = P.head;
      ctx.globalAlpha = 1 - p;
      ctx.lineWidth = 3 * unit;
      ctx.shadowColor = P.head;
      ctx.shadowBlur = 12 * unit;
      ctx.beginPath();
      const origin = this.cellOrigin(L, burst.x, burst.y);
      ctx.arc(origin.x + L.cell / 2, origin.y + L.cell / 2, L.cell * (0.4 + p * 1.8), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // --- Serpiente: cuerpo continuo (un círculo cada medio paso) y cabeza con ojos ---
    const snakeAlpha = t < playStart ? this.ease((t - T.intro * 0.6) / (T.intro * 0.4)) : 1 - this.ease((t - playEnd) / 0.4);
    if (snakeAlpha > 0) {
      ctx.globalAlpha = snakeAlpha;
      const snakeLen = scene.sim.history.reduce((m, h) => Math.max(m, h.length), 0);
      const bodyCount = (snakeLen - 1) * 2;
      const center = (pos) => {
        const origin = this.cellOrigin(L, pos.x, pos.y);
        return { x: origin.x + L.cell / 2, y: origin.y + L.cell / 2 };
      };
      const points = [];
      for (let k = bodyCount; k >= 0; k--) points.push({ k, ...center(this.headAt(scene, step - k * 0.5)) });

      for (const pass of ['outline', 'body']) {
        for (const p of points) {
          if (p.k === 0) continue;
          const tt = p.k / bodyCount;
          const r = (L.cell * 0.62 - L.cell * 0.28 * tt) * (pass === 'outline' ? 1.18 : 1);
          ctx.fillStyle = pass === 'outline' ? 'rgba(0,0,0,0.55)' : P.body;
          ctx.globalAlpha = snakeAlpha * (pass === 'outline' ? 1 : 1 - 0.45 * tt);
          if (pass === 'body' && p.k === 1) {
            ctx.shadowColor = P.glow;
            ctx.shadowBlur = 18 * unit;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      const head = center(this.headAt(scene, step));
      const ahead = center(this.headAt(scene, step + 0.35));
      const behind = center(this.headAt(scene, step - 0.35));
      const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) || 0;
      const hs = L.cell * 1.3;
      ctx.globalAlpha = snakeAlpha;
      ctx.save();
      ctx.translate(head.x, head.y);
      ctx.rotate(angle);
      ctx.shadowColor = P.head;
      ctx.shadowBlur = 22 * unit;
      ctx.fillStyle = P.head;
      this.roundRect(ctx, -hs / 2, -hs / 2, hs, hs, hs * 0.32);
      ctx.fill();
      ctx.shadowBlur = 0;
      for (const side of [-1, 1]) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(hs * 0.14, side * hs * 0.22, hs * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(hs * 0.2, side * hs * 0.22, hs * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // --- Celebración: texto grande y tarjetas con datos ---
    if (t >= playEnd && t < finaleEnd + T.outro) {
      const p = this.ease((t - playEnd) / 0.5);
      const fade = t > finaleEnd ? 1 - this.ease((t - finaleEnd) / 0.4) : 1;
      ctx.globalAlpha = p * fade;
      const celebrateY = L.boardY + L.boardHeight + (scene.format === 'vertical' ? 80 : scene.format === 'square' ? 72 : 82) * unit;
      ctx.textAlign = 'center';
      const headline = scene.sim.eatenLevels === scene.sim.totalLevels ? text.cleared : `${Math.round(progress * 100)}%`;
      this.fitFont(ctx, headline, 900, 52 * unit * (0.8 + 0.2 * p), W - L.margin * 2, font);
      ctx.fillStyle = P.head;
      ctx.shadowColor = P.head;
      ctx.shadowBlur = 24 * unit;
      ctx.fillText(headline, W / 2, celebrateY);
      ctx.shadowBlur = 0;

      const cards = [
        [this.formatNumber(scene.stats.activeDays, scene.lang), text.activeDays],
        [`${scene.stats.best.count}`, `${text.bestDay}${scene.stats.best.date ? ` · ${this.formatDate(scene.stats.best.date, scene.lang)}` : ''}`],
        [`${scene.stats.longest} ${text.days}`, text.streak]
      ];
      const cardGap = 14 * unit;
      const cardW = (W - L.margin * 2 - cardGap * 2) / 3;
      const cardH = 92 * unit;
      cards.forEach(([value, label], i) => {
        const appear = this.ease((t - playEnd - 0.35 - i * 0.18) / 0.4);
        const cx = L.margin + i * (cardW + cardGap);
        const cy = celebrateY + 40 * unit + (1 - appear) * 30 * unit;
        ctx.globalAlpha = appear * fade;
        ctx.fillStyle = P.empty;
        ctx.strokeStyle = P.border;
        ctx.lineWidth = 2 * unit;
        this.roundRect(ctx, cx, cy, cardW, cardH, 14 * unit);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = P.l4;
        this.fitFont(ctx, value, 800, cardH * 0.36, cardW * 0.9, font);
        ctx.fillText(value, cx + cardW / 2, cy + cardH * 0.5);
        ctx.fillStyle = P.text;
        this.fitFont(ctx, label, 500, cardH * 0.18, cardW * 0.9, font);
        ctx.fillText(label, cx + cardW / 2, cy + cardH * 0.8);
      });
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }

    // --- Llamada a la acción ---
    if (t >= finaleEnd) {
      const p = this.ease((t - finaleEnd) / 0.45);
      ctx.globalAlpha = p;
      ctx.fillStyle = 'rgba(0,0,0,0.78)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.fillStyle = P.text;
      this.fitFont(ctx, text.cta, 900, 50 * unit, W - L.margin * 2, font);
      ctx.fillText(text.cta, W / 2, H * 0.46);
      ctx.fillStyle = P.l4;
      this.fitFont(ctx, text.ctaSub, 600, 24 * unit, W - L.margin * 2, font);
      ctx.fillText(text.ctaSub, W / 2, H * 0.46 + 62 * unit);
      ctx.fillStyle = P.head;
      this.fitFont(ctx, scene.shareUrl, 700, 22 * unit, W - L.margin * 2, font);
      ctx.fillText(scene.shareUrl, W / 2, H * 0.46 + 120 * unit);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }

    // Marca discreta para que quien vea el clip sepa de dónde sale
    ctx.font = `700 ${14 * unit}px ${font}`;
    ctx.fillStyle = P.text;
    ctx.globalAlpha = 0.55;
    ctx.textAlign = 'right';
    ctx.fillText('GITHUB_SNAKE.EXE', W - L.margin, L.margin * 0.7);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  async pickCodec(width, height) {
    if (typeof VideoEncoder === 'undefined') return null;
    for (const codec of H264_CODECS) {
      try {
        const { supported } = await VideoEncoder.isConfigSupported({ codec, width, height, bitrate: 6e6, framerate: 30 });
        if (supported) return codec;
      } catch (e) {}
    }
    return null;
  }

  /**
   * Genera el video. onProgress(0..1). Devuelve { blob, mimeType, extension, method }.
   */
  async render({ grid, user = '', lang = 'en', theme = 'dark', format = 'landscape', shareUrl = '', avatar = null, fps = 30, onProgress = () => {} }) {
    const scene = this.buildScene({ grid, user, lang, theme, format, shareUrl, avatar });
    const canvas = document.createElement('canvas');
    canvas.width = scene.width;
    canvas.height = scene.height;
    const ctx = canvas.getContext('2d');
    const frameCount = Math.round(scene.timing.total * fps);

    const codec = await this.pickCodec(scene.width, scene.height);
    if (codec && typeof Mp4Muxer !== 'undefined') {
      return this.renderWithWebCodecs({ scene, canvas, ctx, codec, fps, frameCount, onProgress });
    }
    return this.renderRealtime({ scene, canvas, ctx, fps, onProgress });
  }

  async renderWithWebCodecs({ scene, canvas, ctx, codec, fps, frameCount, onProgress }) {
    const muxer = new Mp4Muxer.Muxer({
      target: new Mp4Muxer.ArrayBufferTarget(),
      video: { codec: 'avc', width: scene.width, height: scene.height },
      fastStart: 'in-memory'
    });
    let failure = null;
    const encoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => { failure = e; }
    });
    encoder.configure({ codec, width: scene.width, height: scene.height, bitrate: scene.width * scene.height * 4, framerate: fps });

    const frameDuration = 1e6 / fps;
    for (let i = 0; i < frameCount; i++) {
      if (failure) throw failure;
      this.drawFrame(ctx, scene, i / fps);
      const frame = new VideoFrame(canvas, { timestamp: Math.round(i * frameDuration), duration: Math.round(frameDuration) });
      encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
      frame.close();
      if (encoder.encodeQueueSize > 8) {
        await new Promise(resolve => encoder.addEventListener('dequeue', resolve, { once: true }));
      }
      if (i % 10 === 0) {
        onProgress(i / frameCount);
        // Deja respirar a la interfaz (barra de progreso)
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    await encoder.flush();
    if (failure) throw failure;
    encoder.close();
    muxer.finalize();
    onProgress(1);
    return { blob: new Blob([muxer.target.buffer], { type: 'video/mp4' }), mimeType: 'video/mp4', extension: 'mp4', method: 'webcodecs' };
  }

  /** Alternativa sin WebCodecs: reproduce la escena en tiempo real y la graba (MP4 si el navegador puede, si no WebM) */
  renderRealtime({ scene, canvas, ctx, fps, onProgress }) {
    const candidates = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
    const mimeType = candidates.find(type => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type));
    if (!mimeType) return Promise.reject(new Error('Este navegador no puede generar video'));

    return new Promise((resolve, reject) => {
      const stream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6e6 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      recorder.onerror = (e) => reject(e.error || new Error('Error al grabar'));
      recorder.onstop = () => {
        const isMp4 = mimeType.startsWith('video/mp4');
        resolve({ blob: new Blob(chunks, { type: mimeType }), mimeType, extension: isMp4 ? 'mp4' : 'webm', method: 'realtime' });
      };
      const start = performance.now();
      recorder.start(250);
      const tick = () => {
        const t = (performance.now() - start) / 1000;
        this.drawFrame(ctx, scene, Math.min(t, scene.timing.total));
        onProgress(Math.min(1, t / scene.timing.total));
        if (t < scene.timing.total) requestAnimationFrame(tick);
        else recorder.stop();
      };
      requestAnimationFrame(tick);
    });
  }
}

window.VideoStudio = VideoStudio;
window.VIDEO_FORMATS = VIDEO_FORMATS;
