/**
 * Canvas 2D Zero-Flicker 60 FPS Matrix Renderer
 * Renderizado toroidal sin cortes con Ghost Segments en bordes, sub-píxel LERP, shockwaves y editor.
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

    this.snakeStyle = 'matrix_viper';
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
      const cellPx = col * step;
      const cellPy = row * step;
      if (px >= cellPx && px <= cellPx + this.cellSize && py >= cellPy && py <= cellPy + this.cellSize) {
        return { x: col, y: row };
      }
    }
    return null;
  }

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

  render(grid, snake, progress = 1.0) {
    this.time += 0.05;
    const colors = this.getThemeColors();
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    this.ctx.clearRect(0, 0, width, height);

    this.drawGrid(grid, colors);

    if (this.hoverCell) {
      this.drawHoverReticle(this.hoverCell, colors);
    }

    this.drawRadarScanline(width, height, colors);
    this.drawShockwaves(colors);
    this.drawParticles(snake.particles, colors);

    if (snake.body && snake.body.length > 0) {
      this.drawSnake(snake, progress, colors);
    }
  }

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

        if (cell.level === 0) {
          this.ctx.strokeStyle = 'rgba(0, 255, 102, 0.05)';
          this.ctx.lineWidth = 1;
          this.drawRoundedRect(px, py, this.cellSize, this.cellSize, this.cellRadius, true);
        }

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
   * Calcula las coordenadas de cada segmento usando interpolación toroidal continua
   */
  getInterpolatedSegments(snake, progress) {
    const { body, prevBody } = snake;
    const stepSize = this.cellSize + this.cellGap;
    const segments = [];

    for (let i = 0; i < body.length; i++) {
      const curr = body[i];
      const prev = prevBody[i] || curr;

      let vx = prev.x + (curr.x - prev.x) * progress;
      let vy = prev.y + (curr.y - prev.y) * progress;

      // Corrección de salto horizontal (0 <-> 52)
      if (curr.x === 0 && prev.x === 52) {
        vx = 52 + progress;
      } else if (curr.x === 52 && prev.x === 0) {
        vx = -progress;
      }

      // Corrección de salto vertical (0 <-> 6)
      if (curr.y === 0 && prev.y === 6) {
        vy = 6 + progress;
      } else if (curr.y === 6 && prev.y === 0) {
        vy = -progress;
      }

      segments.push({
        main: {
          x: this.paddingX + vx * stepSize,
          y: this.paddingY + vy * stepSize,
          gridX: vx,
          gridY: vy
        },
        // Segmentos fantasma para renderizar entrada y salida simultánea en bordes
        ghost: (vx >= 52 || vx < 0 || vy >= 6 || vy < 0) ? {
          x: this.paddingX + ((vx + 53) % 53) * stepSize,
          y: this.paddingY + ((vy + 7) % 7) * stepSize
        } : null,
        isHead: (i === 0),
        index: i,
        total: body.length
      });
    }

    return segments;
  }

  /**
   * Dibuja la serpiente según la morfología seleccionada
   */
  drawSnake(snake, progress, colors) {
    const segments = this.getInterpolatedSegments(snake, progress);
    const direction = snake.direction;

    switch (this.snakeStyle) {
      case 'matrix_viper':
        this.drawMatrixViper(segments, direction, colors);
        break;
      case 'smooth':
        this.drawSmoothSnake(segments, direction, colors);
        break;
      case 'retro':
        this.drawRetroSnake(segments, colors);
        break;
      default:
        this.drawCapsuleSnake(segments, direction, colors);
        break;
    }
  }

  /**
   * Dibuja un segmento individual con soporte para su clon fantasma en el borde
   */
  renderSegment(segData, drawFn) {
    drawFn(segData.main.x, segData.main.y, segData);
    if (segData.ghost) {
      drawFn(segData.ghost.x, segData.ghost.y, segData);
    }
  }

  drawMatrixViper(segments, direction, colors) {
    const head = segments[0];

    this.ctx.save();
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      const isHead = seg.isHead;
      const ratio = 1 - (i / seg.total) * 0.35;
      const size = this.cellSize * ratio;
      const offset = (this.cellSize - size) / 2;
      const pulse = Math.sin(this.time * 4 - i * 0.5) * 0.15 + 0.85;

      this.ctx.shadowColor = colors.snakeGlow;
      this.ctx.shadowBlur = isHead ? 16 : 8 * pulse;
      this.ctx.fillStyle = isHead ? colors.snakeHead : colors.snakeBody;

      this.renderSegment(seg, (x, y) => {
        this.drawRoundedRect(x + offset, y + offset, size, size, size * 0.35);

        if (!isHead) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          const innerSize = size * 0.4;
          const innerOffset = (this.cellSize - innerSize) / 2;
          this.drawRoundedRect(x + innerOffset, y + innerOffset, innerSize, innerSize, 2);
          this.ctx.fillStyle = colors.snakeBody;
        }
      });
    }
    this.ctx.restore();

    this.drawMatrixEyes(head.main, direction, colors);
    if (head.ghost) {
      this.drawMatrixEyes(head.ghost, direction, colors);
    }
  }

  drawMatrixEyes(headPos, direction, colors) {
    const eyeRadius = 2.2;
    const eyeOffset = 3.2;
    const centerX = headPos.x + this.cellSize / 2;
    const centerY = headPos.y + this.cellSize / 2;

    let e1x = centerX, e1y = centerY, e2x = centerX, e2y = centerY;

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

  drawCapsuleSnake(segments, direction, colors) {
    const head = segments[0];
    this.ctx.save();
    this.ctx.shadowColor = colors.snakeGlow;
    this.ctx.shadowBlur = 12;

    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      const isHead = seg.isHead;
      const radiusRatio = Math.max(0.6, 1 - (i / seg.total) * 0.4);
      const size = this.cellSize * radiusRatio;
      const offset = (this.cellSize - size) / 2;

      this.ctx.fillStyle = isHead ? colors.snakeHead : colors.snakeBody;

      this.renderSegment(seg, (x, y) => {
        this.drawRoundedRect(x + offset, y + offset, size, size, size * 0.4);
      });
    }
    this.ctx.restore();

    this.drawMatrixEyes(head.main, direction, colors);
    if (head.ghost) {
      this.drawMatrixEyes(head.ghost, direction, colors);
    }
  }

  drawSmoothSnake(segments, direction, colors) {
    if (segments.length < 2) return;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = this.cellSize * 0.85;
    this.ctx.strokeStyle = colors.snakeBody;
    this.ctx.shadowColor = colors.snakeGlow;
    this.ctx.shadowBlur = 14;

    const half = this.cellSize / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(segments[0].main.x + half, segments[0].main.y + half);

    for (let i = 1; i < segments.length; i++) {
      const prev = segments[i - 1].main;
      const curr = segments[i].main;

      // Si hay un salto en las coordenadas de la cuadrícula, iniciar un nuevo sub-trazo
      if (Math.abs(curr.gridX - prev.gridX) > 1.5 || Math.abs(curr.gridY - prev.gridY) > 1.5) {
        this.ctx.moveTo(curr.x + half, curr.y + half);
      } else {
        this.ctx.lineTo(curr.x + half, curr.y + half);
      }
    }
    this.ctx.stroke();

    const head = segments[0];
    this.ctx.fillStyle = colors.snakeHead;
    this.ctx.beginPath();
    this.ctx.arc(head.main.x + half, head.main.y + half, this.cellSize * 0.5, 0, Math.PI * 2);
    this.ctx.fill();

    if (head.ghost) {
      this.ctx.beginPath();
      this.ctx.arc(head.ghost.x + half, head.ghost.y + half, this.cellSize * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();

    this.drawMatrixEyes(head.main, direction, colors);
    if (head.ghost) {
      this.drawMatrixEyes(head.ghost, direction, colors);
    }
  }

  drawRetroSnake(segments, colors) {
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      this.ctx.fillStyle = seg.isHead ? colors.snakeHead : colors.snakeBody;
      this.renderSegment(seg, (x, y) => {
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
      });
    }
  }

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
