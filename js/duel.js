/**
 * Profile Duel Engine
 * Dos perfiles reales, la misma IA (BFS + Flood Fill) y el mismo número de ticks.
 * El resultado depende solo de los ticks, no de los FPS: el mismo enlace da el mismo ganador en cualquier equipo.
 */

const DUEL_POINTS = [0, 10, 25, 50, 100];
const DUEL_MAX_TICKS = 60 * 8; // 60 s a 8 ticks/s

/**
 * Reglas del duelo sin dibujo: las usan el duelo de la web y el video del duelo, así ambos dan el mismo ganador.
 */
const DuelSimulator = {
  /** Estado inicial de un jugador sobre su matriz (se reinician los niveles a los originales) */
  createPlayer(grid) {
    let totalLevels = 0;
    grid.forEach(col => col.forEach(c => {
      c.level = c.originalLevel;
      totalLevels += c.originalLevel;
    }));
    return { grid, snake: new Snake(4, { x: 0, y: 0 }), pathfinder: new SnakePathfinder(), bites: 0, totalLevels };
  },

  isCleared(player) {
    return player.bites >= player.totalLevels;
  },

  /** Un tick de un jugador. onBite(cell) se llama por cada nivel comido */
  stepPlayer(player, onBite) {
    if (this.isCleared(player)) return;
    const next = player.pathfinder.findNextStep(player.snake, player.grid);
    if (!next) return;
    player.snake.moveTo(next, player.grid, (cell) => {
      player.bites++;
      player.snake.score += DUEL_POINTS[cell.originalLevel] || 10;
      if (onBite) onBite(cell);
    });
  },

  /**
   * Duelo completo sin pantalla (para el video): copia las matrices, juega hasta el final y devuelve por jugador
   * el cuerpo en cada tick, los mordiscos y la puntuación acumulada.
   */
  run(grids, maxTicks = DUEL_MAX_TICKS) {
    const players = grids.map(grid => {
      const copy = grid.map(col => col.map(c => ({ x: c.x, y: c.y, level: c.originalLevel, originalLevel: c.originalLevel, count: c.count, date: c.date })));
      const player = this.createPlayer(copy);
      player.snake.effects = false;
      player.history = [player.snake.body.map(seg => ({ x: seg.x, y: seg.y }))];
      player.biteLog = [];
      player.scores = [0];
      return player;
    });

    let ticks = 0;
    while (ticks < maxTicks && !players.every(p => this.isCleared(p))) {
      ticks++;
      for (const p of players) {
        this.stepPlayer(p, (cell) => p.biteLog.push({ tick: ticks, x: cell.x, y: cell.y, level: cell.originalLevel }));
        p.history.push(p.snake.body.map(seg => ({ x: seg.x, y: seg.y })));
        p.scores.push(p.snake.score);
      }
    }

    const results = players.map(p => ({
      grid: p.grid, history: p.history, biteLog: p.biteLog, scores: p.scores,
      totalLevels: p.totalLevels, bites: p.bites, score: p.snake.score,
      percent: p.totalLevels ? Math.round((p.bites / p.totalLevels) * 100) : 100
    }));
    const [a, b] = results;
    return { ticks, players: results, winner: a.score === b.score ? -1 : (a.score > b.score ? 0 : 1) };
  }
};

class ProfileDuel {
  constructor({ canvases, fetcher, durationSec = DUEL_MAX_TICKS / 8, ticksPerSecond = 8, onUpdate, onFinish }) {
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
    this.players.forEach(p => Object.assign(p, DuelSimulator.createPlayer(p.grid)));
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
    return this.ticks >= this.maxTicks || this.players.every(p => DuelSimulator.isCleared(p));
  }

  tick() {
    this.players.forEach((p, i) => {
      DuelSimulator.stepPlayer(p, (cell) => {
        if (cell.originalLevel >= 3 && !this.skipping) {
          this.renderers[i].addShockwave(cell.x, cell.y, cell.originalLevel);
        }
      });
    });
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
window.DuelSimulator = DuelSimulator;
