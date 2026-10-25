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
  let dataIsSimulated = false;

  function formatSpeedLabel(speed) {
    if (speed <= 3) return t('speed.relaxed', { speed });
    if (speed <= 6) return t('speed.optimal', { speed });
    return t('speed.fast', { speed });
  }

  function formatSpanishDate(dateStr) {
    if (!dateStr) return t('tooltip.noDate');
    const [year, month, day] = dateStr.split('-');
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    if (I18n.lang === 'en') {
      return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `el ${parseInt(day, 10)} de ${monthName} de ${year}`;
  }

  function showAchievementToast(ach) {
    sound.playShockwave();
    toastTitle.textContent = t(`ach.${ach.id}.title`);
    toastDesc.textContent = t(`ach.${ach.id}.desc`);
    achievementToast.classList.add('show');
    updateAchievementsBadge();
    setTimeout(() => {
      achievementToast.classList.remove('show');
    }, 4500);
  }

  function updateAchievementsBadge() {
    const unlocked = achievements.getUnlockedCount();
    const total = achievements.getTotalCount();
    achievementsLabel.textContent = t('achievements.label', { unlocked, total });
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

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let rainTheme = null;
  let rainColor = '#00ff66';

  function drawMatrixRain() {
    if (reducedMotion.matches) return;

    const theme = document.body.getAttribute('data-theme');
    const isLight = theme === 'light';
    matrixCtx.fillStyle = isLight ? 'rgba(246, 248, 250, 0.15)' : 'rgba(4, 8, 6, 0.08)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    // getComputedStyle fuerza un recálculo de estilos: solo se consulta al cambiar de tema
    if (theme !== rainTheme) {
      rainTheme = theme;
      rainColor = getComputedStyle(document.body).getPropertyValue('--matrix-green').trim() || '#00ff66';
    }

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
          <button class="btn btn-cyber-secondary tool-btn load-dev-btn" data-user="${dev.username}">${t('leaderboard.load')}</button>
        </div>
        <div class="dev-header-flex">
          <img src="${dev.avatar}" alt="${dev.name}" class="dev-avatar-img" onerror="this.src='https://github.com/github.png?size=100'">
          <div class="dev-main-info">
            <h4>${dev.name}</h4>
            <span>@${dev.username}</span>
            <div class="dev-role">${I18n.lang === 'en' ? dev.roleEn : dev.role}</div>
          </div>
        </div>
        <div class="dev-metrics">
          <div class="metric-item">
            <label>${t('leaderboard.location')}</label>
            <value>${I18n.lang === 'en' ? dev.locationEn : dev.location}</value>
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
          <h4>${t(`ach.${ach.id}.title`)}</h4>
          <p>${t(`ach.${ach.id}.desc`)}</p>
        </div>
        <span class="ach-status-badge ${ach.unlocked ? 'unlocked' : 'locked'}">
          ${ach.unlocked ? t('achievements.unlocked') : t('achievements.locked')}
        </span>
      `;
      achievementsListContainer.appendChild(card);
    });
  }

  /** Enlace a la web que abre directamente la cuadrícula de un usuario */
  function profileUrl(username) {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('u', username);
    return url.toString();
  }

  async function loadUserGrid(rawInput) {
    const username = fetcher.sanitizeUsername(rawInput);
    currentUsername = username;
    gameCompleted = false;
    statState.textContent = t('state.decoding');

    // La barra de direcciones queda lista para compartir este perfil
    try {
      history.replaceState(null, '', profileUrl(username));
    } catch (e) {}

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
      // La ubicación la escribe cada usuario en GitHub: va como texto, nunca como HTML
      activeDevLocation.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
      activeDevLocation.append(` ${profile.location}`);
      activeDevRepos.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> ${t('profile.repos', { repos: profile.repos ?? '—' })}`;
    });

    try {
      grid = await fetcher.getContributions(username);
      dataIsSimulated = fetcher.lastSource !== 'api';
      totalCommitsInitial = countRemainingCommits();
      totalPointsInitial = countTotalCommitPoints();
      snake.reset();
      if (isDuelMode && snake2) snake2.reset();

      lastTickTime = performance.now();
      updateHud();
      statState.textContent = isDuelMode ? t('state.duelActive') : (isManualMode ? t('state.manual') : t('state.hunting'));
      if (dataIsSimulated) {
        statState.textContent = t('state.simulatedProfile', { user: username });
      }
    } catch (err) {
      console.error(err);
      statState.textContent = t('state.decodeError');
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
    resP1Eaten.textContent = t('gameover.commits', { count: p1Eaten });
    resP1Percent.textContent = `${p1Pct}%`;

    if (isDuelMode && snake2) {
      resP2Box.style.display = 'flex';
      resP2Score.textContent = `${p2Score} pts`;
      resP2Eaten.textContent = t('gameover.commits', { count: p2Eaten });
      resP2Percent.textContent = `${p2Pct}%`;

      if (p2Score > p1Score) {
        winnerBadge.textContent = t('gameover.p2Wins');
        winnerBadge.style.color = '#00f2fe';
        winnerBadge.style.borderColor = '#00f2fe';
        winnerSummary.textContent = t('gameover.p2WinsSummary', { score: p2Score, eaten: p2Eaten });
      } else if (p1Score > p2Score) {
        winnerBadge.textContent = t('gameover.aiWins');
        winnerBadge.style.color = 'var(--matrix-green)';
        winnerBadge.style.borderColor = 'var(--matrix-green)';
        winnerSummary.textContent = t('gameover.aiWinsSummary', { score: p1Score, eaten: p1Eaten });
      } else {
        winnerBadge.textContent = t('gameover.tie');
        winnerBadge.style.color = '#fcee0a';
        winnerBadge.style.borderColor = '#fcee0a';
        winnerSummary.textContent = t('gameover.tieSummary', { score: p1Score });
      }
    } else {
      resP2Box.style.display = 'none';
      winnerBadge.textContent = t('gameover.cleared');
      winnerBadge.style.color = 'var(--matrix-green)';
      winnerBadge.style.borderColor = 'var(--matrix-green)';
      winnerSummary.textContent = t('gameover.clearedSummary', { user: currentUsername, score: p1Score });
    }

    achievements.unlock('clean_sweep', showAchievementToast);
    modalGameOver.classList.add('visible');
    statState.textContent = t('state.completed');
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
      statState.textContent = t('state.huntingLeft', { remaining }) + (dataIsSimulated ? t('state.simulatedSuffix') : '');
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
      labelP1.textContent = t('hud.p1Duel');
      statP1Score.textContent = `${snake.score} pts`;
      labelP2.textContent = t('hud.p2Duel');
      statP2Score.textContent = `${snake2.score} pts`;

      singleProgressTrack.style.display = 'none';
      dualProgressTrack.style.display = 'flex';

      const totalEaten = Math.max(1, snake.eatenCommits + snake2.eatenCommits);
      const p1Pct = Math.round((snake.eatenCommits / totalEaten) * 100);
      const p2Pct = 100 - p1Pct;

      p1ProgressFill.style.width = `${p1Pct}%`;
      p1ProgressFill.textContent = `${t('hud.ai')}: ${p1Pct}% (${snake.eatenCommits})`;
      p2ProgressFill.style.width = `${p2Pct}%`;
      p2ProgressFill.textContent = `P2: ${p2Pct}% (${snake2.eatenCommits})`;
      progressPercentText.textContent = `${p1Pct}% / ${p2Pct}%`;
    } else {
      labelP1.textContent = isManualMode ? t('hud.p1Manual') : t('hud.p1Ai');
      statP1Score.textContent = `${snake.score} pts`;
      labelP2.textContent = t('hud.length');
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
      applyDirection(dir);
    }
  });

  function applyDirection(dir) {
    if (!dir) return;
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
          modeBtn.textContent = t('btn.modeManual');
          modeBtn.classList.add('active-tool');
          statState.textContent = t('state.manualTouch');
          achievements.unlock('manual_pilot', showAchievementToast);
        }
      }
    }
  }

  // --- Controles Tactiles: Swipe en Canvas ---
  let touchStartX = 0;
  let touchStartY = 0;

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    if (e.changedTouches.length > 0) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const minSwipeDistance = 25;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > minSwipeDistance) {
          applyDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
        }
      } else {
        if (Math.abs(dy) > minSwipeDistance) {
          applyDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
        }
      }
    }
  }, { passive: true });

  // --- Controles Tactiles: D-Pad Virtual en Pantalla ---
  document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sound.playClick();
      const d = btn.getAttribute('data-dir');
      if (d === 'up') applyDirection({ x: 0, y: -1 });
      if (d === 'down') applyDirection({ x: 0, y: 1 });
      if (d === 'left') applyDirection({ x: -1, y: 0 });
      if (d === 'right') applyDirection({ x: 1, y: 0 });
    });
  });

  const dpadActionBtn = document.getElementById('dpadActionBtn');
  if (dpadActionBtn) {
    dpadActionBtn.addEventListener('click', () => {
      sound.playClick();
      modeBtn.click();
      dpadActionBtn.textContent = isManualMode ? 'MANUAL' : 'AUTO';
    });
  }

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
      tooltipCount.textContent = count === 0 ? t('tooltip.none') : (count === 1 ? t('tooltip.one') : t('tooltip.many', { count }));
      tooltipDate.textContent = formatSpanishDate(c.date);
      tooltipLevel.textContent = t('tooltip.level', { level: c.level });

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
    dataIsSimulated = false;
    totalCommitsInitial = countRemainingCommits();
    totalPointsInitial = countTotalCommitPoints();
    snake.reset();
    if (isDuelMode && snake2) snake2.reset();
    lastTickTime = performance.now();
    presetPills.forEach(p => p.classList.remove('active'));
    activeDevName.textContent = t('random.name');
    activeDevUsername.textContent = '@random_matrix';
    activeDevBio.textContent = t('random.bio');
    updateHud();
    statState.textContent = t('state.randomGrid');
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
      modeBtn.textContent = t('btn.modeManual');
      modeBtn.classList.add('active-tool');
      statState.textContent = t('state.manual');
      achievements.unlock('manual_pilot', showAchievementToast);
    } else {
      modeBtn.textContent = t('btn.modeAi');
      modeBtn.classList.remove('active-tool');
      statState.textContent = t('state.hunting');
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
      duelBtn.textContent = t('btn.duelOn');
      duelBtn.classList.add('active-tool');
      statState.textContent = t('state.duelOn');
    } else {
      snake2 = null;
      duelBtn.textContent = t('btn.duelOff');
      duelBtn.classList.remove('active-tool');
      statState.textContent = t('state.duelOff');
    }
    updateHud();
  });

  paintBtn.addEventListener('click', () => {
    sound.playClick();
    isPaintMode = !isPaintMode;
    if (isPaintMode) {
      paintBtn.textContent = t('btn.paintOn');
      paintBtn.classList.add('active-tool');
      canvas.style.cursor = 'crosshair';
    } else {
      paintBtn.textContent = t('btn.paintOff');
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
      dataIsSimulated = false;
      totalCommitsInitial = countRemainingCommits();
      totalPointsInitial = countTotalCommitPoints();
      snake.reset();
      if (isDuelMode && snake2) snake2.reset();
      lastTickTime = performance.now();
      modalTemplates.classList.remove('visible');
      activeDevName.textContent = t('art.name', { text: text.toUpperCase() });
      activeDevUsername.textContent = `@commit_art`;
      activeDevBio.textContent = t('art.bio');
      achievements.unlock('artist', showAchievementToast);
      updateHud();
      statState.textContent = t('state.wordRendered', { text });
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
      dataIsSimulated = false;
      totalCommitsInitial = countRemainingCommits();
      totalPointsInitial = countTotalCommitPoints();
      snake.reset();
      if (isDuelMode && snake2) snake2.reset();
      lastTickTime = performance.now();
      modalTemplates.classList.remove('visible');
      achievements.unlock('artist', showAchievementToast);
      updateHud();
      statState.textContent = t('state.templateLoaded', { tpl: tplKey });
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
    recordBtnText.textContent = t('record.starting');

    const recordingOptions = {
      duration: duration,
      filenamePrefix: `github-snake-${currentUsername}`
    };

    const onProgress = (time) => {
      if (typeof time === 'number') {
        recordBtnText.textContent = t('record.stopIn', { time });
      } else {
        recordBtnText.textContent = t('record.stop');
      }
    };

    const onComplete = (err, info) => {
      recordBtn.classList.remove('active-tool');
      recordBtnText.textContent = t('record.idle');
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

  const shareTwitterBtn = document.getElementById('shareTwitterBtn');
  if (shareTwitterBtn) {
    shareTwitterBtn.addEventListener('click', () => {
      sound.playClick();
      const score = snake.score;
      const user = currentUsername;
      const eaten = snake.eatenCommits + (snake2 ? snake2.eatenCommits : 0);
      const text = dataIsSimulated
        ? t('share.gameSimulated', { score })
        : t('share.game', { eaten, user, score });
      const url = profileUrl(user);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
      analytics.trackEvent('share_twitter', { user, score });
    });
  }

  audioBtn.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    if (!isMuted) {
      audioBtn.textContent = t('btn.audioOn');
      audioBtn.classList.add('active-tool');
      sound.playClick();
    } else {
      audioBtn.textContent = t('btn.audioOff');
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

  // --- Workflow para el perfil: estilo elegido + vista previa ---
  const wfDarkTheme = document.getElementById('wfDarkTheme');
  const wfLightTheme = document.getElementById('wfLightTheme');
  const wfMorph = document.getElementById('wfMorph');
  const wfSpeed = document.getElementById('wfSpeed');
  const wfPause = document.getElementById('wfPause');
  const wfLightField = document.getElementById('wfLightField');
  const wfDarkLabel = document.getElementById('wfDarkLabel');
  const wfPreviewDark = document.getElementById('wfPreviewDark');
  const wfPreviewLight = document.getElementById('wfPreviewLight');
  const wfPreviewLightBox = document.getElementById('wfPreviewLightBox');
  const wfPreviewDarkCaption = document.getElementById('wfPreviewDarkCaption');
  const wfPreviewUrls = {};

  // Las opciones salen de los selectores del exportador SVG para no duplicar listas
  wfDarkTheme.innerHTML = exportThemeSelect.innerHTML;
  wfLightTheme.innerHTML = exportThemeSelect.innerHTML;
  wfMorph.innerHTML = exportMorphSelect.innerHTML;
  wfSpeed.innerHTML = exportSpeedSelect.innerHTML;
  wfPause.innerHTML = exportPauseSelect.innerHTML;
  wfDarkTheme.value = 'dark';
  wfLightTheme.value = 'light';
  wfMorph.value = 'matrix_viper';
  wfSpeed.value = 'normal';
  wfPause.value = 'fast';

  function getWorkflowStyle() {
    return {
      adaptive: document.querySelector('input[name="wfMode"]:checked').value === 'adaptive',
      darkTheme: wfDarkTheme.value,
      lightTheme: wfLightTheme.value,
      morph: wfMorph.value,
      speed: wfSpeed.value,
      pause: wfPause.value
    };
  }

  function setPreview(img, key, options) {
    const svg = exporter.buildAnimatedSvg(grid, options);
    if (!svg) return;
    if (wfPreviewUrls[key]) URL.revokeObjectURL(wfPreviewUrls[key]);
    wfPreviewUrls[key] = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    img.src = wfPreviewUrls[key];
  }

  function updateWorkflowModal() {
    const style = getWorkflowStyle();
    const common = { morph: style.morph, speed: style.speed, pause: style.pause };

    wfLightField.hidden = !style.adaptive;
    wfPreviewLightBox.hidden = !style.adaptive;
    wfDarkLabel.textContent = style.adaptive ? t('wf.darkTheme') : t('wf.theme');
    wfPreviewDarkCaption.textContent = style.adaptive ? t('wf.darkPreview') : t('wf.preview');

    setPreview(wfPreviewDark, 'dark', { ...common, theme: style.darkTheme });
    if (style.adaptive) setPreview(wfPreviewLight, 'light', { ...common, theme: style.lightTheme });

    yamlOutput.value = exporter.generateWorkflowYaml(currentUsername, style);
    readmeOutput.value = exporter.generateReadmeSnippet(currentUsername, style);
  }

  [wfDarkTheme, wfLightTheme, wfMorph, wfSpeed, wfPause, ...document.querySelectorAll('input[name="wfMode"]')]
    .forEach(el => el.addEventListener('change', () => {
      sound.playClick();
      updateWorkflowModal();
    }));

  exportYamlBtn.addEventListener('click', () => {
    sound.playClick();
    updateWorkflowModal();
    modalWorkflow.classList.add('visible');
  });

  closeModalBtn.addEventListener('click', () => {
    sound.playClick();
    modalWorkflow.classList.remove('visible');
  });

  copyYamlBtn.addEventListener('click', () => {
    sound.playClick();
    navigator.clipboard.writeText(yamlOutput.value);
    copyYamlBtn.textContent = t('btn.copied');
    setTimeout(() => { copyYamlBtn.textContent = t('btn.copyYaml'); }, 2000);
  });

  copyReadmeBtn.addEventListener('click', () => {
    sound.playClick();
    navigator.clipboard.writeText(readmeOutput.value);
    copyReadmeBtn.textContent = t('btn.copied');
    setTimeout(() => { copyReadmeBtn.textContent = t('btn.copyMarkdown'); }, 2000);
  });

  playPauseBtn.addEventListener('click', () => {
    sound.playClick();
    isRunning = !isRunning;
    if (isRunning) {
      playIcon.textContent = t('btn.pause');
      playPauseBtn.classList.remove('btn-cyber-secondary');
      playPauseBtn.classList.add('btn-cyber-primary');
      lastTickTime = performance.now();
    } else {
      playIcon.textContent = t('btn.resume');
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
    statState.textContent = t('state.reset');
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

  // Contador Dinamico de Estrellas en GitHub
  async function updateGitHubStarsBadge() {
    try {
      const res = await fetch('https://api.github.com/repos/luisrodriguez-rgb/GITHUB_SNAKE.EXE');
      if (res.ok) {
        const data = await res.json();
        const count = data.stargazers_count !== undefined ? data.stargazers_count : 0;
        const badge = document.querySelector('.github-star-btn .star-badge');
        if (badge) {
          badge.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${count}`;
        }
      }
    } catch (e) {}
  }
  updateGitHubStarsBadge();

  // Inicialización
  updateAchievementsBadge();
  speedValue.textContent = formatSpeedLabel(ticksPerSecond);
  renderLeaderboard();
  // --- Duelo de Perfiles ---
  const duelForm = document.getElementById('duelForm');
  const duelUserA = document.getElementById('duelUserA');
  const duelUserB = document.getElementById('duelUserB');
  const duelStartBtn = document.getElementById('duelStartBtn');
  const duelStatus = document.getElementById('duelStatus');
  const duelArena = document.getElementById('duelArena');
  const duelTimer = document.getElementById('duelTimer');
  const duelSkipBtn = document.getElementById('duelSkipBtn');
  const duelRematchBtn = document.getElementById('duelRematchBtn');
  const duelShareBtn = document.getElementById('duelShareBtn');
  const duelCopyBtn = document.getElementById('duelCopyBtn');
  const duelPlayerEls = [...duelArena.querySelectorAll('.duel-player')];
  let duelResult = null;

  const profileDuel = new ProfileDuel({
    canvases: [...duelArena.querySelectorAll('.duel-canvas')],
    fetcher,
    onUpdate: renderDuelState,
    onFinish: showDuelResult
  });

  function duelUrl(a, b) {
    const url = new URL(profileUrl(a));
    url.searchParams.set('vs', b);
    url.hash = 'duelSection';
    return url.toString();
  }

  function renderDuelState(state) {
    duelTimer.textContent = state.secondsLeft;
    state.players.forEach((p, i) => {
      const el = duelPlayerEls[i];
      el.querySelector('.duel-score').textContent = `${p.score} pts`;
      el.querySelector('.duel-bar-fill').style.width = `${p.percent}%`;
    });
  }

  function setDuelFinishedUi(finished) {
    duelSkipBtn.hidden = finished;
    duelRematchBtn.hidden = !finished;
    duelShareBtn.hidden = !finished;
    duelCopyBtn.hidden = !finished;
  }

  function showDuelResult(state) {
    duelResult = state;
    setDuelFinishedUi(true);
    duelPlayerEls.forEach((el, i) => el.classList.toggle('is-winner', state.winner === state.players[i]));
    renderDuelResultText(state);

    const simulated = state.players.some(p => p.simulated);
    // Con datos inventados no se ofrece presumir del resultado
    duelShareBtn.disabled = simulated;
    duelShareBtn.title = simulated ? t('duel.shareDisabled') : '';
    sound.playShockwave();
    analytics.trackEvent('profile_duel', { a: state.players[0].username, b: state.players[1].username });
  }

  function renderDuelResultText(state) {
    const [a, b] = state.players;
    duelStatus.textContent = state.winner
      ? t('duel.winner', { winner: state.winner.username, score: state.winner.score, percent: state.winner.percent, loserScore: (state.winner === a ? b : a).score })
      : t('duel.tie', { score: a.score });
  }

  async function startProfileDuel(rawA, rawB) {
    const a = fetcher.sanitizeUsername(rawA);
    const b = fetcher.sanitizeUsername(rawB);
    if (!rawB || !rawB.trim()) {
      duelStatus.textContent = t('duel.needRival');
      duelUserB.focus();
      return;
    }
    if (a === b) {
      duelStatus.textContent = t('duel.sameUser');
      return;
    }

    duelUserA.value = a;
    duelUserB.value = b;
    duelStartBtn.disabled = true;
    duelStatus.textContent = t('duel.loading', { a, b });
    try {
      const players = await profileDuel.load([a, b]);
      players.forEach((p, i) => {
        const el = duelPlayerEls[i];
        el.classList.remove('is-winner');
        el.querySelector('.duel-avatar').src = p.profile.avatar;
        el.querySelector('.duel-name').textContent = p.username;
        el.querySelector('.duel-sim').hidden = !p.simulated;
      });
      duelArena.hidden = false;
      setDuelFinishedUi(false);
      duelStatus.textContent = players.some(p => p.simulated)
        ? t('duel.simulatedWarning')
        : t('duel.fight');
      try {
        history.replaceState(null, '', duelUrl(a, b));
      } catch (e) {}
      profileDuel.start();
    } catch (err) {
      console.error(err);
      duelStatus.textContent = t('duel.error');
    } finally {
      duelStartBtn.disabled = false;
    }
  }

  duelForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sound.playClick();
    startProfileDuel(duelUserA.value || currentUsername, duelUserB.value);
  });

  duelSkipBtn.addEventListener('click', () => {
    sound.playClick();
    profileDuel.skipToEnd();
  });

  duelRematchBtn.addEventListener('click', () => {
    sound.playClick();
    duelPlayerEls.forEach(el => el.classList.remove('is-winner'));
    setDuelFinishedUi(false);
    duelStatus.textContent = t('duel.rematch');
    profileDuel.start();
  });

  duelShareBtn.addEventListener('click', () => {
    if (!duelResult) return;
    sound.playClick();
    const [a, b] = duelResult.players;
    const w = duelResult.winner;
    const text = w
      ? t('duel.shareText', { a: a.username, aScore: a.score, b: b.username, bScore: b.score, winner: w.username, percent: w.percent })
      : t('duel.shareTie', { a: a.username, b: b.username, score: a.score });
    const url = duelUrl(a.username, b.username);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    analytics.trackEvent('share_duel', { a: a.username, b: b.username });
  });

  duelCopyBtn.addEventListener('click', async () => {
    if (!duelResult) return;
    sound.playClick();
    const [a, b] = duelResult.players;
    try {
      await navigator.clipboard.writeText(duelUrl(a.username, b.username));
      duelCopyBtn.textContent = t('btn.copied');
    } catch (e) {
      duelCopyBtn.textContent = t('btn.copyFailed');
    }
    setTimeout(() => { duelCopyBtn.textContent = t('btn.copyLink'); }, 2000);
  });

  // --- Cambio de idioma: i18n traduce el HTML estático y la app repinta lo que genera ella ---
  window.addEventListener('languagechange-app', () => {
    updateAchievementsBadge();
    renderLeaderboard();
    renderAchievementsModal();
    speedValue.textContent = formatSpeedLabel(ticksPerSecond);
    modeBtn.textContent = isManualMode ? t('btn.modeManual') : t('btn.modeAi');
    duelBtn.textContent = isDuelMode ? t('btn.duelOn') : t('btn.duelOff');
    paintBtn.textContent = isPaintMode ? t('btn.paintOn') : t('btn.paintOff');
    audioBtn.textContent = sound.isMuted ? t('btn.audioOff') : t('btn.audioOn');
    playIcon.textContent = isRunning ? t('btn.pause') : t('btn.resume');
    if (!recorder.isRecording) recordBtnText.textContent = t('record.idle');
    updateHud();
    if (modalWorkflow.classList.contains('visible')) updateWorkflowModal();
    if (duelResult && profileDuel.finished) renderDuelResultText(duelResult);
    if (dataIsSimulated) statState.textContent = t('state.simulatedProfile', { user: currentUsername });
  });

  // ?u=usuario abre directamente ese perfil (enlaces compartidos)
  // Se leen antes de cargar: loadUserGrid reescribe la URL
  const sharedParams = new URLSearchParams(window.location.search);
  const sharedUser = sharedParams.get('u');
  const sharedRival = sharedParams.get('vs');
  const initialUser = sharedUser ? fetcher.sanitizeUsername(sharedUser) : 'torvalds';
  usernameInput.value = initialUser;
  presetPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-user') === initialUser));
  await loadUserGrid(initialUser);
  animationFrameId = requestAnimationFrame(gameLoop);

  // ?u=a&vs=b abre un duelo de perfiles
  duelUserA.value = initialUser;
  if (sharedRival) {
    document.getElementById('duelSection').scrollIntoView({ behavior: 'smooth' });
    startProfileDuel(initialUser, sharedRival);
  }
});
