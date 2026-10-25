/**
 * Profile Duel Engine
 * Dos perfiles reales, la misma IA (BFS + Flood Fill) y el mismo número de ticks.
 * El resultado depende solo de los ticks, no de los FPS: el mismo enlace da el mismo ganador en cualquier equipo.
 */

class ProfileDuel {
  constructor({ canvases, fetcher, durationSec = 60, ticksPerSecond = 8, onUpdate, onFinish }) {
    this.canvases = canvases;
    this.fetcher = fetcher;
    this.ticksPerSecond = ticksPerSecond;
    this.maxTicks = durationSec * ticksPerSecond;
    this.onUpdate = onUpdate || (() => {});
    this.onFinish = onFinish || (() => {});
    this.players = [];
    this.frameId = null;
    // La app lo pone a false cuando el duelo no está en pantalla: los ticks siguen, el dibujo no
    this.visible = true;
    this.renderers = canvases.map(c => new SnakeRenderer(c));
    // Jugador 1 con los colores del tema, jugador 2 en cian para distinguirlos
    this.renderers[1].snakePalette = { snakeHead: '#ffffff', snakeBody: '#00f2fe', snakeGlow: 'rgba(0, 242, 254, 0.95)' };
  }

  /** Carga los dos perfiles. Secuencial: fetcher.lastSource indica si cada matriz es real o simulada */
  async load(usernames) {
    this.stop();
    const players = [];
    for (const username of usernames) {
      const grid = await this.fetcher.getContributions(username);
      const simulated = this.fetcher.lastSource !== 'api';
      const profile = await this.fetcher.getUserProfile(username);
      let totalLevels = 0;
      grid.forEach(col => col.forEach(c => { totalLevels += c.originalLevel; }));
      players.push({ username, grid, simulated, profile, totalLevels });
    }
    this.players = players;
    this.reset();
    this.renderFrame(1);
    return players;
  }

  reset() {
    this.ticks = 0;
    this.finished = false;
    this.players.forEach(p => {
      p.grid.forEach(col => col.forEach(c => { c.level = c.originalLevel; }));
      p.snake = new Snake(4, { x: 0, y: 0 });
      p.pathfinder = new SnakePathfinder();
      p.bites = 0;
    });
  }

  start() {
    if (this.players.length !== 2) return;
    this.stop();
    this.reset();
    this.lastTickTime = performance.now();
    this.frameId = requestAnimationFrame(now => this.loop(now));
  }

  stop() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  /** Termina al instante simulando los ticks restantes */
  skipToEnd() {
    if (this.finished || this.players.length !== 2) return;
    this.stop();
    this.skipping = true;
    while (!this.isOver()) this.tick();
    this.skipping = false;
    this.finish();
  }

  isOver() {
    return this.ticks >= this.maxTicks || this.players.every(p => p.bites >= p.totalLevels);
  }

  tick() {
    const points = [0, 10, 25, 50, 100];
    for (const p of this.players) {
      if (p.bites >= p.totalLevels) continue; // ya limpió su matriz
      const next = p.pathfinder.findNextStep(p.snake, p.grid);
      if (!next) continue;
      p.snake.moveTo(next, p.grid, (cell) => {
        p.bites++;
        p.snake.score += points[cell.originalLevel] || 10;
        if (cell.originalLevel >= 3 && !this.skipping) {
          this.renderers[this.players.indexOf(p)].addShockwave(cell.x, cell.y, cell.originalLevel);
        }
      });
    }
    this.ticks++;
  }

  loop(now) {
    const interval = 1000 / this.ticksPerSecond;
    // Si la pestaña estuvo oculta se recuperan los ticks pendientes, con un tope para no bloquear el frame
    let caughtUp = 0;
    while (now - this.lastTickTime >= interval && !this.isOver() && caughtUp < 40) {
      this.tick();
      this.lastTickTime += interval;
      caughtUp++;
    }
    if (caughtUp === 40) this.lastTickTime = now;

    if (this.visible) this.renderFrame(Math.min(1, (now - this.lastTickTime) / interval));
    this.onUpdate(this.getState());

    if (this.isOver()) {
      this.frameId = null;
      this.finish();
      return;
    }
    this.frameId = requestAnimationFrame(t => this.loop(t));
  }

  renderFrame(progress) {
    this.players.forEach((p, i) => {
      p.snake.updateParticles();
      this.renderers[i].updateShockwaves();
      this.renderers[i].render(p.grid, p.snake, progress);
    });
  }

  getState() {
    return {
      secondsLeft: Math.ceil((this.maxTicks - this.ticks) / this.ticksPerSecond),
      players: this.players.map(p => ({
        username: p.username,
        profile: p.profile,
        simulated: p.simulated,
        score: p.snake.score,
        percent: p.totalLevels ? Math.round((p.bites / p.totalLevels) * 100) : 100
      }))
    };
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    // El último frame queda fijo: sin ondas ni partículas congeladas encima del tablero
    this.renderers.forEach(r => { r.shockwaves = []; });
    this.players.forEach(p => { p.snake.particles = []; });
    this.renderFrame(1);
    const state = this.getState();
    const [a, b] = state.players;
    state.winner = a.score === b.score ? null : (a.score > b.score ? a : b);
    this.onUpdate(state);
    this.onFinish(state);
  }
}

window.ProfileDuel = ProfileDuel;
