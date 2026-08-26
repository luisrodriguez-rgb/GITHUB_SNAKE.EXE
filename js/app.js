/**
 * Main Application Orchestrator & Loop Controller
 * Coordina el reloj de ticks lógicos con la tasa a 60 FPS y la lluvia digital Matrix de fondo.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elementos del DOM
  const canvas = document.getElementById('snakeCanvas');
  const matrixCanvas = document.getElementById('matrixCanvas');
  const usernameInput = document.getElementById('usernameInput');
  const fetchBtn = document.getElementById('fetchBtn');
  const randomGridBtn = document.getElementById('randomGridBtn');
  const presetPills = document.querySelectorAll('.preset-pill');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const stepBtn = document.getElementById('stepBtn');
  const resetBtn = document.getElementById('resetBtn');
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const themeSelect = document.getElementById('themeSelect');
  const snakeStyleSelect = document.getElementById('snakeStyleSelect');

  // Elementos HUD
  const statRemaining = document.getElementById('statRemaining');
  const statEaten = document.getElementById('statEaten');
  const statLength = document.getElementById('statLength');
  const statState = document.getElementById('statState');

  // Instanciar motores
  const fetcher = new GitHubFetcher();
  const pathfinder = new SnakePathfinder();
  const renderer = new SnakeRenderer(canvas);
  const snake = new Snake(4, { x: 0, y: 0 });

  let grid = [];
  let isRunning = true;
  let ticksPerSecond = parseInt(speedSlider.value, 10) || 12;
  let lastTickTime = performance.now();
  let animationFrameId = null;

  // --- Fondo de Lluvia Digital Matrix ---
  const matrixCtx = matrixCanvas.getContext('2d');
  let matrixColumns = 0;
  let drops = [];
  const matrixChars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'.split('');

  function initMatrixRain() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const fontSize = 14;
    matrixColumns = Math.floor(matrixCanvas.width / fontSize);
    drops = Array(matrixColumns).fill(1).map(() => Math.floor(Math.random() * -50));
  }

  function drawMatrixRain() {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    matrixCtx.fillStyle = isLight ? 'rgba(246, 248, 250, 0.15)' : 'rgba(4, 8, 6, 0.08)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    const style = getComputedStyle(document.body);
    const rainColor = style.getPropertyValue('--matrix-green').trim() || '#00ff66';

    matrixCtx.fillStyle = rainColor;
    matrixCtx.font = '12px JetBrains Mono';

    for (let i = 0; i < drops.length; i++) {
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      matrixCtx.fillText(char, i * 14, drops[i] * 14);

      if (drops[i] * 14 > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  window.addEventListener('resize', initMatrixRain);
  initMatrixRain();

  /**
   * Carga el perfil de usuario o mapa
   */
  async function loadUserGrid(username) {
    statState.textContent = 'Decodificando commits...';
    try {
      grid = await fetcher.getContributions(username);
      snake.reset();
      lastTickTime = performance.now();
      updateHud();
      statState.textContent = 'Cazando commits';
    } catch (err) {
      console.error(err);
      statState.textContent = 'Error al decodificar';
    }
  }

  /**
   * Ejecuta un paso de lógica discreta
   */
  function doLogicalTick() {
    if (!grid || grid.length === 0) return;

    const nextStep = pathfinder.findNextStep(snake, grid);
    if (nextStep) {
      snake.moveTo(nextStep, grid, (cell) => {
        updateHud();
      });
    }

    const remaining = countRemainingCommits();
    if (remaining === 0) {
      statState.textContent = 'Grid completado al 100%';
    } else {
      statState.textContent = `Cazando (${remaining} restantes)`;
    }
  }

  /**
   * Cuenta cuántos commits verdes quedan en el grid
   */
  function countRemainingCommits() {
    let count = 0;
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        if (grid[x][y].level > 0) count++;
      }
    }
    return count;
  }

  /**
   * Actualiza el panel HUD de estadísticas
   */
  function updateHud() {
    const remaining = countRemainingCommits();
    statRemaining.textContent = remaining;
    statEaten.textContent = snake.eatenCommits;
    statLength.innerHTML = `${snake.length} <span class="stat-unit">segmentos</span>`;
  }

  /**
   * Bucle principal de renderizado continuo a 60 FPS
   */
  function gameLoop(now) {
    // 1. Renderizar lluvia Matrix ambiental
    drawMatrixRain();

    // 2. Lógica de ticks temporales
    const tickInterval = 1000 / ticksPerSecond;
    const elapsed = now - lastTickTime;

    if (isRunning) {
      if (elapsed >= tickInterval) {
        doLogicalTick();
        lastTickTime = now - (elapsed % tickInterval);
      }
    }

    // 3. Progreso de interpolación continua entre 0.0 y 1.0
    const currentElapsed = now - lastTickTime;
    const progress = isRunning ? Math.min(1.0, currentElapsed / tickInterval) : 1.0;

    // 4. Actualizar partículas de commits
    snake.updateParticles();

    // 5. Renderizar frame
    renderer.render(grid, snake, progress);

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // --- Event Listeners & Controles UI ---

  fetchBtn.addEventListener('click', () => {
    const user = usernameInput.value.trim();
    if (user) {
      presetPills.forEach(p => p.classList.remove('active'));
      loadUserGrid(user);
    }
  });

  usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      fetchBtn.click();
    }
  });

  randomGridBtn.addEventListener('click', () => {
    grid = fetcher.generateRandomGrid();
    snake.reset();
    lastTickTime = performance.now();
    presetPills.forEach(p => p.classList.remove('active'));
    updateHud();
    statState.textContent = 'Matriz aleatoria generada';
  });

  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      presetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const user = pill.getAttribute('data-user');
      usernameInput.value = user;
      loadUserGrid(user);
    });
  });

  playPauseBtn.addEventListener('click', () => {
    isRunning = !isRunning;
    if (isRunning) {
      playIcon.textContent = 'Pausar';
      playPauseBtn.classList.remove('btn-cyber-secondary');
      playPauseBtn.classList.add('btn-cyber-primary');
      lastTickTime = performance.now();
    } else {
      playIcon.textContent = 'Reanudar';
      playPauseBtn.classList.remove('btn-cyber-primary');
      playPauseBtn.classList.add('btn-cyber-secondary');
    }
  });

  stepBtn.addEventListener('click', () => {
    if (!isRunning) {
      doLogicalTick();
      snake.updateParticles();
      renderer.render(grid, snake, 1.0);
    }
  });

  resetBtn.addEventListener('click', () => {
    snake.reset();
    lastTickTime = performance.now();
    updateHud();
    statState.textContent = 'Protocolo reiniciado';
  });

  speedSlider.addEventListener('input', (e) => {
    ticksPerSecond = parseInt(e.target.value, 10);
    speedValue.textContent = `${ticksPerSecond} t/s`;
  });

  themeSelect.addEventListener('change', (e) => {
    document.body.setAttribute('data-theme', e.target.value);
  });

  snakeStyleSelect.addEventListener('change', (e) => {
    renderer.snakeStyle = e.target.value;
  });

  // Carga inicial
  await loadUserGrid('torvalds');
  animationFrameId = requestAnimationFrame(gameLoop);
});
