/**
 * Canvas 2D Zero-Flicker 60 FPS Matrix Renderer
 * Renderizado de alta resolución Retina, sub-píxel LERP, ondas expansivas (Shockwaves) y modo editor.
 */

class SnakeRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.cellSize = 12.5;
    this.cellGap = 3.5;
    this.cellRadius = 3;
    this.paddingX = 20;
    this.paddingY = 20;

    this.snakeStyle = 'matrix_viper'; // 'matrix_viper', 'capsule', 'smooth', 'retro'
    this.scanlineX = 0;
    this.time = 0;
    this.shockwaves = [];
    this.hoverCell = null;

    this.setupHighDpi();
  }

  setupHighDpi() {
    const dpr = window.devicePixelRatio || 1;
    const baseWidth = (53 * (this.cellSize + this.cellGap)) + (this.paddingX * 2);
    const baseHeight = (7 * (this.cellSize + this.cellGap)) + (this.paddingY * 2);

    this.canvas.width = baseWidth * dpr;
    this.canvas.height = baseHeight * dpr;
    this.canvas.style.width = `${baseWidth}px`;
    this.canvas.style.height = `${baseHeight}px`;

    this.ctx.scale(dpr, dpr);
  }

  /**
   * Obtiene la celda de la matriz a partir de las coordenadas del ratón en el canvas
   */
  getCellFromCoords(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = (this.canvas.width / (window.devicePixelRatio || 1)) / rect.width;
    const scaleY = (this.canvas.height / (window.devicePixelRatio || 1)) / rect.height;

    const px = (clientX - rect.left) * scaleX - this.paddingX;
    const py = (clientY - rect.top) * scaleY - this.paddingY;

    const step = this.cellSize + this.cellGap;
    const col = Math.floor(px / step);
    const row = Math.floor(py / step);

    if (col >= 0 && col < 53 && row >= 0 && row < 7) {
      // Verificar si el cursor está dentro de la celda y no en el espacio de separación
      const cellPx = col * step;
      const cellPy = row * step;
      if (px >= cellPx && px <= cellPx + this.cellSize && py >= cellPy && py <= cellPy + this.cellSize) {
        return { x: col, y: row };
      }
    }
    return null;
  }

  /**
   * Agrega una onda expansiva lumínica en la coordenada de la celda
   */
  addShockwave(gridX, gridY, intensity = 4) {
    const step = this.cellSize + this.cellGap;
    const px = this.paddingX + gridX * step + this.cellSize / 2;
    const py = this.paddingY + gridY * step + this.cellSize / 2;

    this.shockwaves.push({
      x: px,
      y: py,
      radius: 4,
      maxRadius: 28 + intensity * 8,
      alpha: 1.0,
      decay: 0.04,
      intensity: intensity
    });
  }

  /**
   * Actualiza la animación de las ondas de choque
   */
  updateShockwaves() {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.15 + 0.8;
      sw.alpha -= sw.decay;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  /**
   * Obtiene los colores activos del tema CSS
   */
  getThemeColors() {
    const style = getComputedStyle(document.body);
    return {
      empty: style.getPropertyValue('--cell-empty').trim() || '#0a140e',
      l1: style.getPropertyValue('--cell-l1').trim() || '#07381b',
      l2: style.getPropertyValue('--cell-l2').trim() || '#096831',
      l3: style.getPropertyValue('--cell-l3').trim() || '#00b34d',
      l4: style.getPropertyValue('--cell-l4').trim() || '#00ff66',
      snakeHead: style.getPropertyValue('--snake-head').trim() || '#ffffff',
      snakeBody: style.getPropertyValue('--snake-body').trim() || '#00ff66',
      snakeGlow: style.getPropertyValue('--snake-glow').trim() || 'rgba(0, 255, 102, 0.85)',
      matrixGreen: style.getPropertyValue('--matrix-green').trim() || '#00ff66'
    };
  }

  /**
   * Renderiza el frame con interpolación visual continua
   */
  render(grid, snake, progress = 1.0) {
    this.time += 0.05;
    const colors = this.getThemeColors();
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    this.ctx.clearRect(0, 0, width, height);

    // 1. Dibujar cuadrícula de contribuciones
    this.drawGrid(grid, colors);

    // 2. Dibujar celda en foco de edición si existe
    if (this.hoverCell) {
      this.drawHoverReticle(this.hoverCell, colors);
    }

    // 3. Haz de radar holográfico
    this.drawRadarScanline(width, height, colors);

    // 4. Ondas de choque lumínicas (Shockwaves)
    this.drawShockwaves(colors);

    // 5. Partículas cuánticas y binarias
    this.drawParticles(snake.particles, colors);

    // 6. Dibujar la serpiente
    if (snake.body && snake.body.length > 0) {
      this.drawSnake(snake, progress, colors);
    }
  }

  /**
   * Dibuja los bloques de contribución
   */
  drawGrid(grid, colors) {
    const colorMap = [
      colors.empty,
      colors.l1,
      colors.l2,
      colors.l3,
      colors.l4
    ];

    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        const cell = grid[x][y];
        const px = this.paddingX + x * (this.cellSize + this.cellGap);
        const py = this.paddingY + y * (this.cellSize + this.cellGap);
        const color = colorMap[cell.level] || colors.empty;

        this.ctx.fillStyle = color;
        this.drawRoundedRect(px, py, this.cellSize, this.cellSize, this.cellRadius);

        // Borde fino en celdas vacías
        if (cell.level === 0) {
          this.ctx.strokeStyle = 'rgba(0, 255, 102, 0.05)';
          this.ctx.lineWidth = 1;
          this.drawRoundedRect(px, py, this.cellSize, this.cellSize, this.cellRadius, true);
        }

        // Resplandor en celdas activas
        if (cell.level >= 2) {
          this.ctx.save();
          this.ctx.shadowColor = colors.matrixGreen;
          this.ctx.shadowBlur = cell.level === 4 ? 10 : 5;
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          this.drawRoundedRect(px + 1.5, py + 1.5, this.cellSize - 3, 2, 1);
          this.ctx.restore();
        }
      }
    }
  }

  /**
   * Dibuja un retículo en la celda sobre la que se encuentra el ratón
   */
  drawHoverReticle(cell, colors) {
    const step = this.cellSize + this.cellGap;
    const px = this.paddingX + cell.x * step;
    const py = this.paddingY + cell.y * step;

    this.ctx.save();
    this.ctx.strokeStyle = colors.matrixGreen;
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = colors.matrixGreen;
    this.ctx.shadowBlur = 8;
    this.drawRoundedRect(px - 1.5, py - 1.5, this.cellSize + 3, this.cellSize + 3, this.cellRadius + 1, true);
    this.ctx.restore();
  }

  /**
   * Dibuja las ondas de choque radiales
   */
  drawShockwaves(colors) {
    this.ctx.save();
    for (const sw of this.shockwaves) {
      this.ctx.globalAlpha = Math.max(0, sw.alpha);
      this.ctx.strokeStyle = sw.intensity >= 4 ? '#ffffff' : colors.matrixGreen;
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = colors.matrixGreen;
      this.ctx.shadowBlur = 12;

      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  /**
   * Scanline de radar que barre horizontalmente la cuadrícula
   */
  drawRadarScanline(width, height, colors) {
    this.scanlineX = (this.scanlineX + 1.2) % (width + 60);
    const sx = this.scanlineX - 30;

    const gradient = this.ctx.createLinearGradient(sx - 30, 0, sx + 30, 0);
    gradient.addColorStop(0, 'rgba(0, 255, 102, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 102, 0.06)');
    gradient.addColorStop(1, 'rgba(0, 255, 102, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(sx - 30, this.paddingY - 5, 60, height - (this.paddingY * 2) + 10);
  }

  /**
   * Dibuja la serpiente de forma interpolada
   */
  drawSnake(snake, progress, colors) {
    const { body, prevBody, direction } = snake;
    const stepSize = this.cellSize + this.cellGap;

    const coords = [];
    for (let i = 0; i < body.length; i++) {
      const curr = body[i];
      const prev = prevBody[i] || curr;

      const ix = prev.x + (curr.x - prev.x) * progress;
      const iy = prev.y + (curr.y - prev.y) * progress;

      coords.push({
        x: this.paddingX + ix * stepSize,
        y: this.paddingY + iy * stepSize,
        gridX: ix,
        gridY: iy
      });
    }

    switch (this.snakeStyle) {
      case 'matrix_viper':
        this.drawMatrixViper(coords, direction, colors);
        break;
      case 'smooth':
        this.drawSmoothSnake(coords, colors);
        break;
      case 'retro':
        this.drawRetroSnake(coords, colors);
        break;
      default:
        this.drawCapsuleSnake(coords, direction, colors);
        break;
    }
  }

  /**
   * Estilo Matrix Viper
   */
  drawMatrixViper(coords, direction, colors) {
    const head = coords[0];

    this.ctx.save();
    for (let i = coords.length - 1; i >= 0; i--) {
      const seg = coords[i];
      const isHead = (i === 0);
      const ratio = 1 - (i / coords.length) * 0.35;
      const size = this.cellSize * ratio;
      const offset = (this.cellSize - size) / 2;
      const pulse = Math.sin(this.time * 4 - i * 0.5) * 0.15 + 0.85;

      this.ctx.shadowColor = colors.snakeGlow;
      this.ctx.shadowBlur = isHead ? 16 : 8 * pulse;

      this.ctx.fillStyle = isHead ? colors.snakeHead : colors.snakeBody;
      this.drawRoundedRect(seg.x + offset, seg.y + offset, size, size, size * 0.35);

      if (!isHead) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const innerSize = size * 0.4;
        const innerOffset = (this.cellSize - innerSize) / 2;
        this.drawRoundedRect(seg.x + innerOffset, seg.y + innerOffset, innerSize, innerSize, 2);
      }
    }
    this.ctx.restore();

    this.drawMatrixEyes(head, direction, colors);
  }

  /**
   * Ojos Matrix con visor láser
   */
  drawMatrixEyes(head, direction, colors) {
    const eyeRadius = 2.2;
    const eyeOffset = 3.2;
    const centerX = head.x + this.cellSize / 2;
    const centerY = head.y + this.cellSize / 2;

    let e1x, e1y, e2x, e2y;

    if (direction.x > 0) {
      e1x = centerX + eyeOffset; e1y = centerY - 2.8;
      e2x = centerX + eyeOffset; e2y = centerY + 2.8;
    } else if (direction.x < 0) {
      e1x = centerX - eyeOffset; e1y = centerY - 2.8;
      e2x = centerX - eyeOffset; e2y = centerY + 2.8;
    } else if (direction.y > 0) {
      e1x = centerX - 2.8; e1y = centerY + eyeOffset;
      e2x = centerX + 2.8; e2y = centerY + eyeOffset;
    } else {
      e1x = centerX - 2.8; e1y = centerY - eyeOffset;
      e2x = centerX + 2.8; e2y = centerY - eyeOffset;
    }

    this.ctx.save();
    this.ctx.fillStyle = '#030805';
    this.ctx.beginPath();
    this.ctx.arc(e1x, e1y, eyeRadius, 0, Math.PI * 2);
    this.ctx.arc(e2x, e2y, eyeRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = colors.matrixGreen;
    this.ctx.shadowColor = colors.matrixGreen;
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.arc(e1x + (direction.x * 0.6), e1y + (direction.y * 0.6), eyeRadius * 0.55, 0, Math.PI * 2);
    this.ctx.arc(e2x + (direction.x * 0.6), e2y + (direction.y * 0.6), eyeRadius * 0.55, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Estilo Cápsula
   */
  drawCapsuleSnake(coords, direction, colors) {
    const head = coords[0];
    this.ctx.save();
    this.ctx.shadowColor = colors.snakeGlow;
    this.ctx.shadowBlur = 12;

    for (let i = coords.length - 1; i >= 0; i--) {
      const seg = coords[i];
      const isHead = (i === 0);
      const radiusRatio = Math.max(0.6, 1 - (i / coords.length) * 0.4);
      const size = this.cellSize * radiusRatio;
      const offset = (this.cellSize - size) / 2;

      this.ctx.fillStyle = isHead ? colors.snakeHead : colors.snakeBody;
      this.drawRoundedRect(seg.x + offset, seg.y + offset, size, size, size * 0.4);
    }
    this.ctx.restore();
    this.drawMatrixEyes(head, direction, colors);
  }

  /**
   * Estilo Línea Láser
   */
  drawSmoothSnake(coords, colors) {
    if (coords.length < 2) return;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = this.cellSize * 0.85;
    this.ctx.strokeStyle = colors.snakeBody;
    this.ctx.shadowColor = colors.snakeGlow;
    this.ctx.shadowBlur = 14;

    this.ctx.beginPath();
    const half = this.cellSize / 2;
    this.ctx.moveTo(coords[0].x + half, coords[0].y + half);

    for (let i = 1; i < coords.length; i++) {
      this.ctx.lineTo(coords[i].x + half, coords[i].y + half);
    }
    this.ctx.stroke();

    this.ctx.fillStyle = colors.snakeHead;
    this.ctx.beginPath();
    this.ctx.arc(coords[0].x + half, coords[0].y + half, this.cellSize * 0.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Estilo Retro Pixel
   */
  drawRetroSnake(coords, colors) {
    for (let i = 0; i < coords.length; i++) {
      const seg = coords[i];
      this.ctx.fillStyle = (i === 0) ? colors.snakeHead : colors.snakeBody;
      this.ctx.fillRect(seg.x, seg.y, this.cellSize, this.cellSize);
      this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      this.ctx.strokeRect(seg.x, seg.y, this.cellSize, this.cellSize);
    }
  }

  /**
   * Partículas y dígitos binarios
   */
  drawParticles(particles, colors) {
    const stepSize = this.cellSize + this.cellGap;
    this.ctx.save();

    for (const p of particles) {
      const px = this.paddingX + p.x * stepSize + this.cellSize / 2;
      const py = this.paddingY + p.y * stepSize + this.cellSize / 2;

      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = colors.matrixGreen;
      this.ctx.shadowColor = colors.matrixGreen;
      this.ctx.shadowBlur = 8;

      if (p.isDigit) {
        this.ctx.font = 'bold 10px JetBrains Mono';
        this.ctx.fillText(p.char, px, py);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    this.ctx.restore();
  }

  /**
   * Helper para dibujar rectángulos redondeados
   */
  drawRoundedRect(x, y, w, h, r, strokeOnly = false) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
    if (strokeOnly) {
      this.ctx.stroke();
    } else {
      this.ctx.fill();
    }
  }
}

window.SnakeRenderer = SnakeRenderer;
