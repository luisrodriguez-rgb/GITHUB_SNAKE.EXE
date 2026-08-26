/**
 * Snake State & Logic Manager
 * Administra las coordenadas de la serpiente, historial de interpolación, dirección normalizada y digestión de commits.
 */

class Snake {
  constructor(initialLength = 4, startPos = { x: 0, y: 0 }) {
    this.initialLength = initialLength;
    this.startPos = startPos;
    this.reset();
  }

  reset() {
    this.body = [];
    this.prevBody = [];
    this.length = this.initialLength;
    this.score = 0;
    this.eatenCommits = 0;
    this.direction = { x: 1, y: 0 };
    this.isAlive = true;
    this.particles = [];

    // Inicializar segmentos horizontales
    for (let i = 0; i < this.initialLength; i++) {
      const seg = {
        x: Math.max(0, this.startPos.x - i),
        y: this.startPos.y
      };
      this.body.push(seg);
      this.prevBody.push({ ...seg });
    }
  }

  get head() {
    return this.body[0];
  }

  /**
   * Ejecuta un paso discreto en el grid con normalización de bordes
   */
  moveTo(nextPos, grid, onEatCallback) {
    if (!nextPos) return;

    // Snapshot previo para interpolación LERP
    this.prevBody = this.body.map(seg => ({ ...seg }));

    // Determinar vector de dirección normalizado (corrige salto de 180° / bordes de 52 celdas)
    let dx = nextPos.x - this.head.x;
    let dy = nextPos.y - this.head.y;

    if (dx > 1) dx = -1;       // Teletransporte de 0 a 52 (hacia la izquierda)
    else if (dx < -1) dx = 1;  // Teletransporte de 52 a 0 (hacia la derecha)

    if (dy > 1) dy = -1;       // Teletransporte de 0 a 6 (hacia arriba)
    else if (dy < -1) dy = 1;  // Teletransporte de 6 a 0 (hacia abajo)

    this.direction = { x: dx, y: dy };

    // Insertar nueva cabeza
    this.body.unshift({ x: nextPos.x, y: nextPos.y });

    // Revisar si la celda contenía un commit verde
    const targetCell = grid[nextPos.x] && grid[nextPos.x][nextPos.y];
    if (targetCell && targetCell.level > 0) {
      targetCell.level -= 1;
      this.eatenCommits++;
      this.score += 10;

      if (this.eatenCommits % 3 === 0 && this.length < 14) {
        this.length++;
      }

      this.spawnParticles(nextPos.x, nextPos.y, targetCell.originalLevel);

      if (onEatCallback) {
        onEatCallback(targetCell);
      }
    }

    // Recortar la cola
    while (this.body.length > this.length) {
      this.body.pop();
    }

    while (this.prevBody.length > this.body.length) {
      this.prevBody.pop();
    }
  }

  /**
   * Genera partículas cuánticas y dígitos binarios al devorar commits
   */
  spawnParticles(gridX, gridY, intensity) {
    const count = 6 + intensity * 3;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.8 + 1.2;
      const isDigit = Math.random() > 0.4;
      this.particles.push({
        x: gridX,
        y: gridY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        alpha: 1.0,
        decay: Math.random() * 0.035 + 0.015,
        size: Math.random() * 3 + 2,
        isDigit: isDigit,
        char: Math.random() > 0.5 ? '1' : '0',
        level: intensity
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * 0.05;
      p.y += p.vy * 0.05;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
}

window.Snake = Snake;
