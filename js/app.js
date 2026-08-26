/**
 * Main Application Orchestrator & Loop Controller (Pro Edition)
 * Integra Audio Sintético, Control Manual (WASD), Editor de Matriz y Exportador.
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

  // Nuevos Controles Pro
  const audioBtn = document.getElementById('audioBtn');
  const modeBtn = document.getElementById('modeBtn');
  const paintBtn = document.getElementById('paintBtn');
  const exportSvgBtn = document.getElementById('exportSvgBtn');
  const exportYamlBtn = document.getElementById('exportYamlBtn');
  const modalWorkflow = document.getElementById('modalWorkflow');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const copyYamlBtn = document.getElementById('copyYamlBtn');
  const copyReadmeBtn = document.getElementById('copyReadmeBtn');
  const yamlOutput = document.getElementById('yamlOutput');
  const readmeOutput = document.getElementById('readmeOutput');

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
  const sound = new SoundEngine();
  const exporter = new ExporterEngine();

  let grid = [];
  let isRunning = true;
  let ticksPerSecond = parseInt(speedSlider.value, 10) || 12;
  let lastTickTime = performance.now();
  let animationFrameId = null;

  // Estados de control
  let isManualMode = false;
  let manualNextDir = { x: 1, y: 0 };
  let isPaintMode = false;
  let isMouseDown = false;
  let currentUsername = 'torvalds';

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
    currentUsername = username;
    statState.textContent = 'Decodificando commits...';
    try {
      grid = await fetcher.getContributions(username);
      snake.reset();
      lastTickTime = performance.now();
      updateHud();
      statState.textContent = isManualMode ? 'Modo Manual (WASD / Flechas)' : 'Cazando commits (IA)';
    } catch (err) {
      console.error(err);
      statState.textContent = 'Error al decodificar';
    }
  }

  /**
   * Callback al devorar un commit
   */
  function onCommitEaten(cell) {
    sound.playEat(cell.originalLevel);
    if (cell.originalLevel >= 3) {
      renderer.addShockwave(cell.x, cell.y, cell.originalLevel);
      sound.playShockwave();
    }
    updateHud();
  }

  /**
   * Ejecuta un paso de lógica discreta
   */
  function doLogicalTick() {
    if (!grid || grid.length === 0) return;

    let nextStep = null;

    if (isManualMode) {
      // Modo Manual: Calcular siguiente paso con la dirección elegida por el usuario
      const head = snake.head;
      const targetX = (head.x + manualNextDir.x + 53) % 53;
      const targetY = (head.y + manualNextDir.y + 7) % 7;
      nextStep = { x: targetX, y: targetY };
    } else {
      // Modo IA: Búsqueda de rutas BFS
      nextStep = pathfinder.findNextStep(snake, grid);
    }

    if (nextStep) {
      snake.moveTo(nextStep, grid, onCommitEaten);
    }

    const remaining = countRemainingCommits();
    if (remaining === 0) {
      statState.textContent = 'Grid completado al 100%';
    } else if (!isManualMode) {
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
    drawMatrixRain();

    const tickInterval = 1000 / ticksPerSecond;
    const elapsed = now - lastTickTime;

    if (isRunning) {
      if (elapsed >= tickInterval) {
        doLogicalTick();
        lastTickTime = now - (elapsed % tickInterval);
      }
    }

    const currentElapsed = now - lastTickTime;
    const progress = isRunning ? Math.min(1.0, currentElapsed / tickInterval) : 1.0;

    snake.updateParticles();
    renderer.updateShockwaves();
    renderer.render(grid, snake, progress);

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // --- Controles de Teclado (WASD / Flechas para Modo Manual) ---
  window.addEventListener('keydown', (e) => {
    if (document.activeElement === usernameInput) return;

    let dir = null;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dir = { x: 0, y: -1 };
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dir = { x: 0, y: 1 };
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dir = { x: -1, y: 0 };
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dir = { x: 1, y: 0 };

    if (dir) {
      // Evitar giro de 180 grados instantáneo sobre el propio cuello
      if (snake.direction.x !== -dir.x || snake.direction.y !== -dir.y) {
        manualNextDir = dir;
        if (!isManualMode) {
          isManualMode = true;
          modeBtn.textContent = 'Control: Manual (WASD)';
          modeBtn.classList.add('active-tool');
          statState.textContent = 'Modo Manual (WASD / Flechas)';
        }
      }
    }
  });

  // --- Interacción con Canvas (Editor / Pintar Matriz) ---
  function paintCellAt(clientX, clientY) {
    const cellCoords = renderer.getCellFromCoords(clientX, clientY);
    if (cellCoords && grid[cellCoords.x] && grid[cellCoords.x][cellCoords.y]) {
      const cell = grid[cellCoords.x][cellCoords.y];
      // Ciclar nivel: 0 -> 1 -> 2 -> 3 -> 4 -> 0
      cell.level = (cell.level + 1) % 5;
      cell.originalLevel = cell.level;
      cell.count = cell.level * 4;
      sound.playClick();
      updateHud();
    }
  }

  canvas.addEventListener('mousemove', (e) => {
    const cell = renderer.getCellFromCoords(e.clientX, e.clientY);
    renderer.hoverCell = cell;
    if (isPaintMode && isMouseDown && cell) {
      paintCellAt(e.clientX, e.clientY);
    }
  });

  canvas.addEventListener('mouseleave', () => {
    renderer.hoverCell = null;
    isMouseDown = false;
  });

  canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    if (isPaintMode) {
      paintCellAt(e.clientX, e.clientY);
    }
  });

  window.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  // --- Event Listeners Toolbar y Presets ---

  fetchBtn.addEventListener('click', () => {
    const user = usernameInput.value.trim();
    if (user) {
      sound.playClick();
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
    sound.playClick();
    grid = fetcher.generateRandomGrid();
    snake.reset();
    lastTickTime = performance.now();
    presetPills.forEach(p => p.classList.remove('active'));
    updateHud();
    statState.textContent = 'Matriz aleatoria generada';
  });

  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      sound.playClick();
      presetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const user = pill.getAttribute('data-user');
      usernameInput.value = user;
      loadUserGrid(user);
    });
  });

  // Alternar Modo IA / Manual
  modeBtn.addEventListener('click', () => {
    sound.playClick();
    isManualMode = !isManualMode;
    if (isManualMode) {
      modeBtn.textContent = 'Control: Manual (WASD)';
      modeBtn.classList.add('active-tool');
      statState.textContent = 'Modo Manual (WASD / Flechas)';
    } else {
      modeBtn.textContent = 'Control: IA Autonoma';
      modeBtn.classList.remove('active-tool');
      statState.textContent = 'Cazando commits (IA)';
    }
  });

  // Alternar Modo Pintar
  paintBtn.addEventListener('click', () => {
    sound.playClick();
    isPaintMode = !isPaintMode;
    if (isPaintMode) {
      paintBtn.textContent = 'Pintar: Activo';
      paintBtn.classList.add('active-tool');
      canvas.style.cursor = 'crosshair';
    } else {
      paintBtn.textContent = 'Pintar: Inactivo';
      paintBtn.classList.remove('active-tool');
      canvas.style.cursor = 'default';
    }
  });

  // Audio Toggle
  audioBtn.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    if (!isMuted) {
      audioBtn.textContent = 'Audio: ON';
      audioBtn.classList.add('active-tool');
      sound.playClick();
    } else {
      audioBtn.textContent = 'Audio: OFF';
      audioBtn.classList.remove('active-tool');
    }
  });

  // Exportar SVG
  exportSvgBtn.addEventListener('click', () => {
    sound.playClick();
    exporter.exportAnimatedSvg(grid, currentUsername);
  });

  // Exportar Workflow Modal
  exportYamlBtn.addEventListener('click', () => {
    sound.playClick();
    const yaml = exporter.generateWorkflowYaml(currentUsername);
    const readme = exporter.generateReadmeSnippet(currentUsername);
    yamlOutput.value = yaml;
    readmeOutput.value = readme;
    modalWorkflow.classList.add('visible');
  });

  closeModalBtn.addEventListener('click', () => {
    sound.playClick();
    modalWorkflow.classList.remove('visible');
  });

  copyYamlBtn.addEventListener('click', () => {
    sound.playClick();
    navigator.clipboard.writeText(yamlOutput.value);
    copyYamlBtn.textContent = 'Copiado';
    setTimeout(() => { copyYamlBtn.textContent = 'Copiar YAML'; }, 2000);
  });

  copyReadmeBtn.addEventListener('click', () => {
    sound.playClick();
    navigator.clipboard.writeText(readmeOutput.value);
    copyReadmeBtn.textContent = 'Copiado';
    setTimeout(() => { copyReadmeBtn.textContent = 'Copiar Markdown'; }, 2000);
  });

  // Controles de Reproducción
  playPauseBtn.addEventListener('click', () => {
    sound.playClick();
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
    sound.playClick();
    if (!isRunning) {
      doLogicalTick();
      snake.updateParticles();
      renderer.updateShockwaves();
      renderer.render(grid, snake, 1.0);
    }
  });

  resetBtn.addEventListener('click', () => {
    sound.playClick();
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
    sound.playClick();
    document.body.setAttribute('data-theme', e.target.value);
  });

  snakeStyleSelect.addEventListener('change', (e) => {
    sound.playClick();
    renderer.snakeStyle = e.target.value;
  });

  // Carga inicial
  await loadUserGrid('torvalds');
  animationFrameId = requestAnimationFrame(gameLoop);
});
