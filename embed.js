/**
 * GITHUB_SNAKE.EXE Web Component Embed Widget (Pro Edition)
 * Permite insertar la serpiente inteligente con IA y consumo al 100% en cualquier web:
 * <script src="https://.../embed.js"></script>
 * <github-snake user="tu_usuario" theme="dark" speed="5"></github-snake>
 */

class GitHubSnakeElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['user', 'theme', 'speed'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const user = this.getAttribute('user') || 'torvalds';
    const theme = this.getAttribute('theme') || 'dark';
    const speed = parseInt(this.getAttribute('speed'), 10) || 5;

    const isLight = theme === 'light';
    const bg = isLight ? '#ffffff' : '#040806';
    const border = isLight ? 'rgba(31,35,40,0.15)' : 'rgba(0,255,102,0.2)';
    const text = isLight ? '#1f2328' : '#e6fff2';
    const green = isLight ? '#1a7f37' : '#00ff66';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .widget-wrap {
          background: ${bg};
          border: 1px solid ${border};
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          color: ${text};
        }
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .widget-user {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${green};
          text-decoration: none;
        }
        .widget-user img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        .widget-canvas-container {
          display: flex;
          justify-content: center;
          overflow-x: auto;
        }
        canvas {
          display: block;
          max-width: 100%;
          height: auto;
          border-radius: 6px;
        }
      </style>
      <div class="widget-wrap">
        <div class="widget-header">
          <a class="widget-user" href="https://github.com/${user}" target="_blank">
            <img src="https://github.com/${user}.png?size=48" alt="${user}" onerror="this.style.display='none'">
            <span>github.com/${user}</span>
          </a>
          <span style="opacity: 0.6; font-size: 0.75rem; font-family: monospace;">GITHUB_SNAKE.EXE</span>
        </div>
        <div class="widget-canvas-container">
          <canvas id="embedCanvas" width="774" height="130"></canvas>
        </div>
      </div>
    `;

    this.initCanvasSimulation(user, isLight, speed);
  }

  async initCanvasSimulation(user, isLight, speed) {
    const canvas = this.shadowRoot.getElementById('embedCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cols = 53;
    const rows = 7;
    const cellSize = 11;
    const cellGap = 3.5;
    const padding = 12;

    const emptyColor = isLight ? '#ebedf0' : '#0a140e';
    const l1 = isLight ? '#9be9a8' : '#07381b';
    const l2 = isLight ? '#40c463' : '#096831';
    const l3 = isLight ? '#30a14e' : '#00b34d';
    const l4 = isLight ? '#216e39' : '#00ff66';
    const snakeHead = isLight ? '#0969da' : '#ffffff';
    const snakeBody = isLight ? '#1a7f37' : '#00ff66';
    const colorMap = [emptyColor, l1, l2, l3, l4];

    // Intentar obtener contribuciones reales o generar mock
    let grid = [];
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`);
      if (res.ok) {
        const data = await res.json();
        const recent = (data.contributions || []).slice(-371);
        for (let x = 0; x < cols; x++) {
          const col = [];
          for (let y = 0; y < rows; y++) {
            const idx = x * 7 + y;
            const item = recent[idx] || {};
            const lvl = Math.min(4, item.level || (item.count > 0 ? 2 : 0));
            col.push({ x, y, level: lvl });
          }
          grid.push(col);
        }
      }
    } catch (e) {}

    if (grid.length === 0) {
      for (let x = 0; x < cols; x++) {
        const col = [];
        for (let y = 0; y < rows; y++) {
          const lvl = Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;
          col.push({ x, y, level: lvl });
        }
        grid.push(col);
      }
    }

    const snake = [{ x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 0, y: 3 }];
    let dir = { x: 1, y: 0 };

    function findNextStep() {
      const head = snake[0];
      let bestDist = Infinity;
      let target = null;

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          if (grid[x][y].level > 0) {
            const dist = Math.abs(x - head.x) + Math.abs(y - head.y);
            if (dist < bestDist) {
              bestDist = dist;
              target = { x, y };
            }
          }
        }
      }

      if (!target) {
        return { x: (head.x + dir.x + cols) % cols, y: (head.y + dir.y + rows) % rows };
      }

      // Dirección hacia target
      let dx = 0, dy = 0;
      if (target.x !== head.x) dx = target.x > head.x ? 1 : -1;
      else if (target.y !== head.y) dy = target.y > head.y ? 1 : -1;

      return { x: (head.x + dx + cols) % cols, y: (head.y + dy + rows) % rows };
    }

    const renderFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const c = grid[x][y];
          ctx.fillStyle = colorMap[c.level] || emptyColor;
          ctx.fillRect(padding + x * (cellSize + cellGap), padding + y * (cellSize + cellGap), cellSize, cellSize);
        }
      }

      const next = findNextStep();
      snake.unshift(next);

      if (grid[next.x] && grid[next.x][next.y].level > 0) {
        grid[next.x][next.y].level = 0;
      } else {
        snake.pop();
      }

      snake.forEach((seg, i) => {
        ctx.fillStyle = (i === 0) ? snakeHead : snakeBody;
        ctx.fillRect(padding + seg.x * (cellSize + cellGap), padding + seg.y * (cellSize + cellGap), cellSize, cellSize);
      });
    };

    if (this._interval) clearInterval(this._interval);
    this._interval = setInterval(renderFrame, 1000 / speed);
  }

  disconnectedCallback() {
    if (this._interval) {
      clearInterval(this._interval);
    }
  }
}

if (!customElements.get('github-snake')) {
  customElements.define('github-snake', GitHubSnakeElement);
}
