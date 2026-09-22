/**
 * Main Application Orchestrator & Loop Controller (Pro Edition)
 * Sistema de Puntuación, Progreso Individual de Jugadores, Duelo, Creador de Palabras Custom, Fin de Partida,
 * Tooltip de Contribuciones y Exportador SVG Avanzado con Opciones Personalizadas.
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
  const leaderboardGrid = document.getElementById('leaderboardGrid');

  // Tooltip
  const matrixTooltip = document.getElementById('matrixTooltip');
  const tooltipCount = document.getElementById('tooltipCount');
  const tooltipDate = document.getElementById('tooltipDate');
  const tooltipLevel = document.getElementById('tooltipLevel');

  // Tarjeta de Perfil Activo
  const activeAvatar = document.getElementById('activeAvatar');
  const activeDevName = document.getElementById('activeDevName');
  const activeDevUsername = document.getElementById('activeDevUsername');
  const activeDevLink = document.getElementById('activeDevLink');
  const activeDevBio = document.getElementById('activeDevBio');
  const activeDevLocation = document.getElementById('activeDevLocation');
  const activeDevRepos = document.getElementById('activeDevRepos');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressPercentText = document.getElementById('progressPercentText');
  const singleProgressTrack = document.getElementById('singleProgressTrack');
  const dualProgressTrack = document.getElementById('dualProgressTrack');
  const p1ProgressFill = document.getElementById('p1ProgressFill');
  const p2ProgressFill = document.getElementById('p2ProgressFill');

  // Herramientas Pro
  const audioBtn = document.getElementById('audioBtn');
  const modeBtn = document.getElementById('modeBtn');
  const duelBtn = document.getElementById('duelBtn');
  const paintBtn = document.getElementById('paintBtn');
  const templateBtn = document.getElementById('templateBtn');
  const recordBtn = document.getElementById('recordBtn');
  const recordBtnText = document.getElementById('recordBtnText');
  const exportSvgBtn = document.getElementById('exportSvgBtn');
  const exportYamlBtn = document.getElementById('exportYamlBtn');
  const achievementsBtn = document.getElementById('achievementsBtn');
  const achievementsLabel = document.getElementById('achievementsLabel');

  // Modal Grabar Video HD / Pantalla
  const modalRecordVideo = document.getElementById('modalRecordVideo');
  const closeRecordModalBtn = document.getElementById('closeRecordModalBtn');
  const recordSourceSelect = document.getElementById('recordSourceSelect');
  const recordDurationSelect = document.getElementById('recordDurationSelect');
  const startRecordingActionBtn = document.getElementById('startRecordingActionBtn');

  // Modal Exportar SVG
  const modalExportSvg = document.getElementById('modalExportSvg');
  const closeExportSvgModalBtn = document.getElementById('closeExportSvgModalBtn');
  const exportSpeedSelect = document.getElementById('exportSpeedSelect');
  const exportThemeSelect = document.getElementById('exportThemeSelect');
  const exportMorphSelect = document.getElementById('exportMorphSelect');
  const exportPauseSelect = document.getElementById('exportPauseSelect');
  const confirmExportSvgBtn = document.getElementById('confirmExportSvgBtn');

  // Modales
  const modalWorkflow = document.getElementById('modalWorkflow');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const copyYamlBtn = document.getElementById('copyYamlBtn');
  const copyReadmeBtn = document.getElementById('copyReadmeBtn');
  const yamlOutput = document.getElementById('yamlOutput');
  const readmeOutput = document.getElementById('readmeOutput');

  const modalTemplates = document.getElementById('modalTemplates');
  const closeTemplatesModalBtn = document.getElementById('closeTemplatesModalBtn');
  const customWordInput = document.getElementById('customWordInput');
  const applyCustomWordBtn = document.getElementById('applyCustomWordBtn');
  const scriptCustomWordBtn = document.getElementById('scriptCustomWordBtn');

  const modalAchievements = document.getElementById('modalAchievements');
  const closeAchModalBtn = document.getElementById('closeAchModalBtn');
  const achievementsListContainer = document.getElementById('achievementsListContainer');

  const modalGameOver = document.getElementById('modalGameOver');
  const closeGameOverBtn = document.getElementById('closeGameOverBtn');
  const winnerBadge = document.getElementById('winnerBadge');
  const winnerSummary = document.getElementById('winnerSummary');
  const resP1Score = document.getElementById('resP1Score');
  const resP1Eaten = document.getElementById('resP1Eaten');
  const resP1Percent = document.getElementById('resP1Percent');
  const resP2Box = document.getElementById('resP2Box');
  const resP2Score = document.getElementById('resP2Score');
  const resP2Eaten = document.getElementById('resP2Eaten');
  const resP2Percent = document.getElementById('resP2Percent');
  const rematchBtn = document.getElementById('rematchBtn');
  const victoryExportSvgBtn = document.getElementById('victoryExportSvgBtn');

  // Toast
  const achievementToast = document.getElementById('achievementToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastDesc = document.getElementById('toastDesc');

  // HUD
  const statRemaining = document.getElementById('statRemaining');
  const statP1Score = document.getElementById('statP1Score');
  const statP2Score = document.getElementById('statP2Score');
  const labelP1 = document.getElementById('labelP1');
  const labelP2 = document.getElementById('labelP2');
  const statState = document.getElementById('statState');

  // Motores
  const fetcher = new GitHubFetcher();
  const pathfinder = new SnakePathfinder();
  const renderer = new SnakeRenderer(canvas);
  const snake = new Snake(4, { x: 0, y: 0 });
  const sound = new SoundEngine();
  const exporter = new ExporterEngine();
  const recorder = new VideoRecorderEngine(canvas);
  const artEngine = new CommitArtEngine();
  const achievements = new AchievementsEngine();
  const analytics = new AnalyticsEngine();

  // Estados
  let grid = [];
  let totalCommitsInitial = 0;
  let totalPointsInitial = 0;
  let isRunning = true;
  let gameCompleted = false;
  let ticksPerSecond = parseFloat(speedSlider.value) || 5;
  let lastTickTime = performance.now();
  let animationFrameId = null;

  let isManualMode = false;
  let isDuelMode = false;
  let snake2 = null;
  let manualNextDir = { x: 1, y: 0 };
  let player2NextDir = { x: -1, y: 0 };
  let isPaintMode = false;
  let isMouseDown = false;
  let currentUsername = 'torvalds';

  function formatSpeedLabel(speed) {
    if (speed <= 3) return `${speed} t/s (Relajado)`;
    if (speed <= 6) return `${speed} t/s (Optimo)`;
    return `${speed} t/s (Rapido)`;
  }

  function formatSpanishDate(dateStr) {
    if (!dateStr) return 'Fecha no disponible';
    const [year, month, day] = dateStr.split('-');
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `el ${parseInt(day, 10)} de ${monthName} de ${year}`;
  }

  function showAchievementToast(ach) {
    sound.playShockwave();
    toastTitle.textContent = ach.title;
    toastDesc.textContent = ach.desc;
    achievementToast.classList.add('show');
    updateAchievementsBadge();
    setTimeout(() => {
      achievementToast.classList.remove('show');
    }, 4500);
  }

  function updateAchievementsBadge() {
    const unlocked = achievements.getUnlockedCount();
    const total = achievements.getTotalCount();
    achievementsLabel.textContent = `Logros: ${unlocked}/${total}`;
  }

  // --- Lluvia Matrix ---
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

  function renderLeaderboard() {
    if (!leaderboardGrid) return;
    leaderboardGrid.innerHTML = '';

    fetcher.topDevelopers.forEach(dev => {
      const card = document.createElement('div');
      card.className = 'leaderboard-card';
      card.innerHTML = `
        <div class="card-top-row">
          <div class="rank-badge">#${dev.rank}</div>
          <button class="btn btn-cyber-secondary tool-btn load-dev-btn" data-user="${dev.username}">Cargar Perfil</button>
        </div>
        <div class="dev-header-flex">
          <img src="${dev.avatar}" alt="${dev.name}" class="dev-avatar-img" onerror="this.src='https://github.com/github.png?size=100'">
          <div class="dev-main-info">
            <h4>${dev.name}</h4>
            <span>@${dev.username}</span>
            <div class="dev-role">${dev.role}</div>
          </div>
        </div>
        <div class="dev-metrics">
          <div class="metric-item">
            <label>Commits Anuales</label>
            <value>${dev.commits}</value>
          </div>
          <div class="metric-item">
            <label>Racha Activa</label>
            <value>${dev.streak}</value>
          </div>
        </div>
      `;

      card.querySelector('.load-dev-btn').addEventListener('click', () => {
        sound.playClick();
        usernameInput.value = dev.username;
        presetPills.forEach(p => p.classList.remove('active'));
        loadUserGrid(dev.username);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      leaderboardGrid.appendChild(card);
    });
  }

  function renderAchievementsModal() {
    if (!achievementsListContainer) return;
    achievementsListContainer.innerHTML = '';

    Object.values(achievements.achievements).forEach(ach => {
      const card = document.createElement('div');
      card.className = `ach-card ${ach.unlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div>
          <h4>${ach.title}</h4>
          <p>${ach.desc}</p>
        </div>
        <span class="ach-status-badge ${ach.unlocked ? 'unlocked' : 'locked'}">
          ${ach.unlocked ? 'DESBLOQUEADO' : 'BLOQUEADO'}
        </span>
      `;
      achievementsListContainer.appendChild(card);
    });
  }

  async function loadUserGrid(rawInput) {
    const username = fetcher.sanitizeUsername(rawInput);
    currentUsername = username;
    gameCompleted = false;
    statState.textContent = 'Decodificando perfil...';

    achievements.profilesLoaded.add(username);
    if (achievements.profilesLoaded.size >= 3) {
      achievements.unlock('profile_hacker', showAchievementToast);
    }

    fetcher.getUserProfile(username).then(profile => {
      activeAvatar.src = profile.avatar;
      activeDevName.textContent = profile.name;
      activeDevUsername.textContent = `@${profile.username}`;
      activeDevLink.href = `https://github.com/${profile.username}`;
      activeDevBio.textContent = profile.bio;
      activeDevLocation.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${profile.location}`;
      activeDevRepos.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> Repos: ${profile.repos}`;
    });

    try {
      grid = await fetcher.getContributions(username);
      totalCommitsInitial = countRemainingCommits();
      totalPointsInitial = countTotalCommitPoints();
      snake.reset();
      if (isDuelMode && snake2) snake2.reset();

      lastTickTime = performance.now();
      updateHud();
      statState.textContent = isDuelMode ? 'Duelo Activo: IA vs Jugador' : (isManualMode ? 'Modo Manual (WASD / Flechas)' : 'Cazando commits (IA)');
    } catch (err) {
      console.error(err);
      statState.textContent = 'Error al decodificar';
    }
  }

  function countTotalCommitPoints() {
    let total = 0;
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        total += (grid[x][y].level || 0) * 10;
      }
    }
    return Math.max(1, total);
  }

  function onCommitEaten(cell, eatingSnake) {
    sound.playEat(cell.originalLevel);
    achievements.unlock('first_bite', showAchievementToast);

    const pts = [0, 10, 25, 50, 100][cell.originalLevel] || 10;
    eatingSnake.score += pts;

    if (snake.eatenCommits >= 50 || (snake2 && snake2.eatenCommits >= 50)) {
      achievements.unlock('hunter_50', showAchievementToast);
    }

    if (cell.originalLevel >= 3) {
      renderer.addShockwave(cell.x, cell.y, cell.originalLevel);
      sound.playShockwave();
    }
    updateHud();
  }

  function triggerGameOver() {
    if (gameCompleted) return;
    gameCompleted = true;
    sound.playShockwave();

    const p1Score = snake.score;
    const p1Eaten = snake.eatenCommits;
    const p2Score = snake2 ? snake2.score : 0;
    const p2Eaten = snake2 ? snake2.eatenCommits : 0;
    const totalEaten = Math.max(1, p1Eaten + p2Eaten);

    const p1Pct = Math.round((p1Eaten / totalEaten) * 100);
    const p2Pct = 100 - p1Pct;

    resP1Score.textContent = `${p1Score} pts`;
    resP1Eaten.textContent = `${p1Eaten} commits`;
    resP1Percent.textContent = `${p1Pct}%`;

    if (isDuelMode && snake2) {
      resP2Box.style.display = 'flex';
      resP2Score.textContent = `${p2Score} pts`;
      resP2Eaten.textContent = `${p2Eaten} commits`;
      resP2Percent.textContent = `${p2Pct}%`;

      if (p2Score > p1Score) {
        winnerBadge.textContent = '¡VICTORIA DEL JUGADOR 2!';
        winnerBadge.style.color = '#00f2fe';
        winnerBadge.style.borderColor = '#00f2fe';
        winnerSummary.textContent = `¡Has superado a la IA con ${p2Score} puntos (${p2Eaten} commits devorados)!`;
      } else if (p1Score > p2Score) {
        winnerBadge.textContent = '¡VICTORIA DE LA IA VERDE!';
        winnerBadge.style.color = 'var(--matrix-green)';
        winnerBadge.style.borderColor = 'var(--matrix-green)';
        winnerSummary.textContent = `La IA ha ganado el duelo con ${p1Score} puntos (${p1Eaten} commits devorados).`;
      } else {
        winnerBadge.textContent = '¡EMPATE TÉCNICO!';
        winnerBadge.style.color = '#fcee0a';
        winnerBadge.style.borderColor = '#fcee0a';
        winnerSummary.textContent = `Ambos obtuvieron ${p1Score} puntos.`;
      }
    } else {
      resP2Box.style.display = 'none';
      winnerBadge.textContent = '¡MATRIZ 100% PURIFICADA!';
      winnerBadge.style.color = 'var(--matrix-green)';
      winnerBadge.style.borderColor = 'var(--matrix-green)';
      winnerSummary.textContent = `Has devorado la totalidad de los commits de @${currentUsername} con un puntaje final de ${p1Score} pts.`;
    }

    achievements.unlock('clean_sweep', showAchievementToast);
    modalGameOver.classList.add('visible');
    statState.textContent = 'Partida Completada al 100%';
  }

  function doLogicalTick() {
    if (!grid || grid.length === 0 || gameCompleted) return;

    let nextStep = null;
    if (isManualMode && !isDuelMode) {
      const head = snake.head;
      const targetX = (head.x + manualNextDir.x + 53) % 53;
      const targetY = (head.y + manualNextDir.y + 7) % 7;
      nextStep = { x: targetX, y: targetY };
    } else {
      nextStep = pathfinder.findNextStep(snake, grid);
    }

    if (nextStep) {
      snake.moveTo(nextStep, grid, (cell) => onCommitEaten(cell, snake));
    }

    if (isDuelMode && snake2) {
      const head2 = snake2.head;
      const targetX2 = (head2.x + player2NextDir.x + 53) % 53;
      const targetY2 = (head2.y + player2NextDir.y + 7) % 7;
      snake2.moveTo({ x: targetX2, y: targetY2 }, grid, (cell) => onCommitEaten(cell, snake2));
    }

    const remaining = countRemainingCommits();
    if (remaining === 0 && !gameCompleted) {
      triggerGameOver();
    } else if (!isManualMode && !isDuelMode) {
      statState.textContent = `Cazando (${remaining} restantes)`;
    }
  }

  function countRemainingCommits() {
    let count = 0;
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        if (grid[x][y].level > 0) count++;
      }
    }
    return count;
  }

  function updateHud() {
    const remaining = countRemainingCommits();
    statRemaining.textContent = remaining;

    if (isDuelMode && snake2) {
      labelP1.textContent = 'P1 (IA Verde)';
      statP1Score.textContent = `${snake.score} pts`;
      labelP2.textContent = 'P2 (Jugador Cian)';
      statP2Score.textContent = `${snake2.score} pts`;

      singleProgressTrack.style.display = 'none';
      dualProgressTrack.style.display = 'flex';

      const totalEaten = Math.max(1, snake.eatenCommits + snake2.eatenCommits);
      const p1Pct = Math.round((snake.eatenCommits / totalEaten) * 100);
      const p2Pct = 100 - p1Pct;

      p1ProgressFill.style.width = `${p1Pct}%`;
      p1ProgressFill.textContent = `IA: ${p1Pct}% (${snake.eatenCommits})`;
      p2ProgressFill.style.width = `${p2Pct}%`;
      p2ProgressFill.textContent = `P2: ${p2Pct}% (${snake2.eatenCommits})`;
      progressPercentText.textContent = `${p1Pct}% / ${p2Pct}%`;
    } else {
      labelP1.textContent = isManualMode ? 'Tu Puntaje (Manual)' : 'Puntaje de Caza (IA)';
      statP1Score.textContent = `${snake.score} pts`;
      labelP2.textContent = 'Longitud de Serpiente';
      statP2Score.textContent = `${snake.length} seg`;

      singleProgressTrack.style.display = 'block';
      dualProgressTrack.style.display = 'none';

      if (totalPointsInitial > 0) {
        const currentPoints = countTotalCommitPoints();
        const eatenPoints = Math.max(0, totalPointsInitial - currentPoints);
        const percent = Math.min(100, Math.round((eatenPoints / totalPointsInitial) * 100));
        progressBarFill.style.width = `${percent}%`;
        progressPercentText.textContent = `${percent}%`;
      }
    }
  }

  function gameLoop(now) {
    drawMatrixRain();

    const tickInterval = 1000 / ticksPerSecond;
    const elapsed = now - lastTickTime;

    if (isRunning && !gameCompleted) {
      if (elapsed >= tickInterval) {
        doLogicalTick();
        lastTickTime = now - (elapsed % tickInterval);
      }
    }

    const currentElapsed = now - lastTickTime;
    const progress = (isRunning && !gameCompleted) ? Math.min(1.0, currentElapsed / tickInterval) : 1.0;

    snake.updateParticles();
    if (isDuelMode && snake2) snake2.updateParticles();

    renderer.updateShockwaves();
    renderer.render(grid, snake, progress, isDuelMode ? snake2 : null);

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // --- Controles de Teclado ---
  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    if (activeEl === usernameInput || activeEl === customWordInput || (activeEl && activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === ' ') {
      playPauseBtn.click();
      return;
    }

    let dir = null;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dir = { x: 0, y: -1 };
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dir = { x: 0, y: 1 };
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dir = { x: -1, y: 0 };
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dir = { x: 1, y: 0 };

    if (dir) {
      if (isDuelMode && snake2) {
        if (snake2.direction.x !== -dir.x || snake2.direction.y !== -dir.y) {
          player2NextDir = dir;
          achievements.unlock('manual_pilot', showAchievementToast);
        }
      } else {
        if (snake.direction.x !== -dir.x || snake.direction.y !== -dir.y) {
          manualNextDir = dir;
          if (!isManualMode) {
            isManualMode = true;
            modeBtn.textContent = 'Control: Manual (WASD)';
            modeBtn.classList.add('active-tool');
            statState.textContent = 'Modo Manual (WASD / Flechas)';
            achievements.unlock('manual_pilot', showAchievementToast);
          }
        }
      }
    }
  });

  // --- Tooltip & Interacción Canvas ---
  function paintCellAt(clientX, clientY) {
    const cellCoords = renderer.getCellFromCoords(clientX, clientY);
    if (cellCoords && grid[cellCoords.x] && grid[cellCoords.x][cellCoords.y]) {
      const cell = grid[cellCoords.x][cellCoords.y];
      cell.level = (cell.level + 1) % 5;
      cell.originalLevel = cell.level;
      cell.count = cell.level * 4;
      sound.playClick();
      achievements.unlock('artist', showAchievementToast);
      updateHud();
    }
  }

  canvas.addEventListener('mousemove', (e) => {
    const cell = renderer.getCellFromCoords(e.clientX, e.clientY);
    renderer.hoverCell = cell;

    if (cell && grid[cell.x] && grid[cell.x][cell.y]) {
      const c = grid[cell.x][cell.y];
      const count = c.count !== undefined ? c.count : (c.level > 0 ? c.level * 3 : 0);
      tooltipCount.textContent = count === 0 ? 'Sin contribuciones' : (count === 1 ? '1 contribucion' : `${count} contribuciones`);
      tooltipDate.textContent = formatSpanishDate(c.date);
      tooltipLevel.textContent = `Nivel de actividad: ${c.level}/4`;

      const tooltipX = e.clientX + 14;
      const tooltipY = e.clientY - 48;
      matrixTooltip.style.left = `${tooltipX}px`;
      matrixTooltip.style.top = `${tooltipY}px`;
      matrixTooltip.classList.add('visible');
    } else {
      matrixTooltip.classList.remove('visible');
    }

    if (isPaintMode && isMouseDown && cell) {
      paintCellAt(e.clientX, e.clientY);
    }
  });

  canvas.addEventListener('mouseleave', () => {
    renderer.hoverCell = null;
    isMouseDown = false;
    matrixTooltip.classList.remove('visible');
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

  // --- Toolbar & Modos ---
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
    gameCompleted = false;
    grid = fetcher.generateRandomGrid();
    totalCommitsInitial = countRemainingCommits();
    totalPointsInitial = countTotalCommitPoints();
    snake.reset();
    if (isDuelMode && snake2) snake2.reset();
    lastTickTime = performance.now();
    presetPills.forEach(p => p.classList.remove('active'));
    activeDevName.textContent = 'Matriz Aleatoria';
    activeDevUsername.textContent = '@random_matrix';
    activeDevBio.textContent = 'Simulacion generativa procedural';
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

  modeBtn.addEventListener('click', () => {
    sound.playClick();
    isManualMode = !isManualMode;
    if (isManualMode) {
      modeBtn.textContent = 'Control: Manual (WASD)';
      modeBtn.classList.add('active-tool');
      statState.textContent = 'Modo Manual (WASD / Flechas)';
      achievements.unlock('manual_pilot', showAchievementToast);
    } else {
      modeBtn.textContent = 'Control: IA Autonoma';
      modeBtn.classList.remove('active-tool');
      statState.textContent = 'Cazando commits (IA)';
    }
    updateHud();
  });

  duelBtn.addEventListener('click', () => {
    sound.playClick();
    isDuelMode = !isDuelMode;
    gameCompleted = false;
    if (isDuelMode) {
      snake2 = new Snake(4, { x: 50, y: 6 });
      player2NextDir = { x: -1, y: 0 };
      duelBtn.textContent = 'Duelo: Activo (IA vs P2)';
      duelBtn.classList.add('active-tool');
      statState.textContent = 'Duelo en curso: Controla P2 con WASD/Flechas';
    } else {
      snake2 = null;
      duelBtn.textContent = 'Modo Duelo (IA vs Jugador)';
      duelBtn.classList.remove('active-tool');
      statState.textContent = 'Modo Duelo desactivado';
    }
    updateHud();
  });

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

  templateBtn.addEventListener('click', () => {
    sound.playClick();
    modalTemplates.classList.add('visible');
  });

  closeTemplatesModalBtn.addEventListener('click', () => {
    sound.playClick();
    modalTemplates.classList.remove('visible');
  });

  applyCustomWordBtn.addEventListener('click', () => {
    const text = customWordInput.value.trim();
    if (text) {
      sound.playClick();
      gameCompleted = false;
      grid = artEngine.generateGridFromText(text);
      totalCommitsInitial = countRemainingCommits();
      totalPointsInitial = countTotalCommitPoints();
      snake.reset();
      if (isDuelMode && snake2) snake2.reset();
      lastTickTime = performance.now();
      modalTemplates.classList.remove('visible');
      activeDevName.textContent = `Texto: "${text.toUpperCase()}"`;
      activeDevUsername.textContent = `@commit_art`;
      activeDevBio.textContent = `Arte en matriz personalizado`;
      achievements.unlock('artist', showAchievementToast);
      updateHud();
      statState.textContent = `Palabra '${text}' renderizada en el mapa`;
    }
  });

  customWordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      applyCustomWordBtn.click();
    }
  });

  scriptCustomWordBtn.addEventListener('click', () => {
    const text = customWordInput.value.trim() || 'DEV';
    sound.playClick();
    const script = artEngine.generateBashScript(text);
    const blob = new Blob([script], { type: 'text/x-sh;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generate-git-art-${text.toLowerCase().replace(/\s+/g, '-')}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  document.querySelectorAll('.load-tpl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      gameCompleted = false;
      const tplKey = btn.getAttribute('data-tpl');
      grid = artEngine.applyTemplate(tplKey);
      totalCommitsInitial = countRemainingCommits();
      totalPointsInitial = countTotalCommitPoints();
      snake.reset();
      if (isDuelMode && snake2) snake2.reset();
      lastTickTime = performance.now();
      modalTemplates.classList.remove('visible');
      achievements.unlock('artist', showAchievementToast);
      updateHud();
      statState.textContent = `Plantilla '${tplKey}' cargada`;
    });
  });

  document.querySelectorAll('.script-tpl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const tplKey = btn.getAttribute('data-tpl');
      const script = artEngine.generateBashScript(tplKey);
      const blob = new Blob([script], { type: 'text/x-sh;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generate-git-art-${tplKey}.sh`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  recordBtn.addEventListener('click', () => {
    sound.playClick();
    if (recorder.isRecording) {
      recorder.stopRecording();
      return;
    }
    modalRecordVideo.classList.add('visible');
  });

  closeRecordModalBtn.addEventListener('click', () => {
    sound.playClick();
    modalRecordVideo.classList.remove('visible');
  });

  startRecordingActionBtn.addEventListener('click', () => {
    sound.playClick();
    const source = recordSourceSelect.value;
    const duration = parseInt(recordDurationSelect.value, 10);
    modalRecordVideo.classList.remove('visible');

    recordBtn.classList.add('active-tool');
    recordBtnText.textContent = 'Iniciando captura...';

    const recordingOptions = {
      duration: duration,
      filenamePrefix: `github-snake-${currentUsername}`
    };

    const onProgress = (time) => {
      if (typeof time === 'number') {
        recordBtnText.textContent = `Detener (${time}s)...`;
      } else {
        recordBtnText.textContent = 'Detener Grabacion (REC)';
      }
    };

    const onComplete = (err, info) => {
      recordBtn.classList.remove('active-tool');
      recordBtnText.textContent = 'Grabar Video (Pantalla / Tablero)';
      if (!err) {
        sound.playShockwave();
        analytics.trackEvent('record_video', { source, duration });
        achievements.unlock('cinematographer', showAchievementToast);
      }
    };

    if (source === 'screen') {
      recorder.startScreenRecording(recordingOptions, onProgress, onComplete);
    } else {
      recorder.startCanvasRecording(recordingOptions, onProgress, onComplete);
    }
  });

  achievementsBtn.addEventListener('click', () => {
    sound.playClick();
    renderAchievementsModal();
    modalAchievements.classList.add('visible');
  });

  closeAchModalBtn.addEventListener('click', () => {
    sound.playClick();
    modalAchievements.classList.remove('visible');
  });

  closeGameOverBtn.addEventListener('click', () => {
    sound.playClick();
    modalGameOver.classList.remove('visible');
  });

  rematchBtn.addEventListener('click', () => {
    sound.playClick();
    modalGameOver.classList.remove('visible');
    loadUserGrid(currentUsername);
  });

  victoryExportSvgBtn.addEventListener('click', () => {
    sound.playClick();
    exportSvgBtn.click();
  });

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

  // Modal de Exportación SVG con Opciones
  exportSvgBtn.addEventListener('click', () => {
    sound.playClick();
    // Sincronizar con el tema actual
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    exportThemeSelect.value = currentTheme;
    modalExportSvg.classList.add('visible');
  });

  closeExportSvgModalBtn.addEventListener('click', () => {
    sound.playClick();
    modalExportSvg.classList.remove('visible');
  });

  confirmExportSvgBtn.addEventListener('click', () => {
    sound.playClick();
    const options = {
      speed: exportSpeedSelect.value,
      theme: exportThemeSelect.value,
      morph: exportMorphSelect.value,
      pause: exportPauseSelect.value
    };
    analytics.trackEvent('export_svg', options);
    exporter.exportAnimatedSvg(grid, currentUsername, options);
    modalExportSvg.classList.remove('visible');
  });

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
      if (isDuelMode && snake2) snake2.updateParticles();
      renderer.updateShockwaves();
      renderer.render(grid, snake, 1.0, isDuelMode ? snake2 : null);
    }
  });

  resetBtn.addEventListener('click', () => {
    sound.playClick();
    gameCompleted = false;
    snake.reset();
    if (isDuelMode && snake2) snake2.reset();
    lastTickTime = performance.now();
    updateHud();
    statState.textContent = 'Protocolo reiniciado';
  });

  speedSlider.addEventListener('input', (e) => {
    ticksPerSecond = parseFloat(e.target.value);
    speedValue.textContent = formatSpeedLabel(ticksPerSecond);
  });

  themeSelect.addEventListener('change', (e) => {
    sound.playClick();
    document.body.setAttribute('data-theme', e.target.value);
  });

  snakeStyleSelect.addEventListener('change', (e) => {
    sound.playClick();
    renderer.snakeStyle = e.target.value;
  });

  // Inicialización
  updateAchievementsBadge();
  speedValue.textContent = formatSpeedLabel(ticksPerSecond);
  renderLeaderboard();
  await loadUserGrid('torvalds');
  animationFrameId = requestAnimationFrame(gameLoop);
});
