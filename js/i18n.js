/**
 * i18n: español (texto original del HTML) e inglés.
 * - Textos estáticos del HTML: se traducen nodo a nodo con STATIC_EN (clave = texto en español, espacios normalizados).
 * - Textos generados por JS: t('clave', { variables }) con MESSAGES.
 * Al cambiar de idioma se emite el evento 'languagechange-app' para que la app repinte lo dinámico.
 */

const STATIC_EN = {
  // Cabecera y entrada
  'Logros: 0/7': 'Achievements: 0/7',
  'Matrix Phosphor (Oscuro)': 'Matrix Phosphor (Dark)',
  'Modo Claro (GitHub Light)': 'Light Mode (GitHub Light)',
  'Cyberpunk Neon (Fucsia)': 'Cyberpunk Neon (Magenta)',
  'Cyber Cyan (Azul)': 'Cyber Cyan (Blue)',
  'Amber CRT (Terminal)': 'Amber CRT (Terminal)',
  'Ingresa un nombre de usuario o pega el enlace completo de GitHub:': 'Enter a username or paste a full GitHub link:',
  'Ejecutar Caza': 'Start Hunt',
  'Matriz Aleatoria': 'Random Grid',
  'Accesos directos:': 'Quick picks:',
  'Matriz Densa': 'Dense Grid',
  'Creador de Linux & Git': 'Creator of Linux & Git',
  'Portland, EE.UU.': 'Portland, USA',
  'Progreso de Devoracion del Mapa:': 'Grid Devoured:',
  'MODO': 'MODE',

  // Herramientas, HUD y controles
  'Control: IA Autonoma': 'Control: Autonomous AI',
  'Modo Duelo (IA vs Jugador)': 'Duel Mode (AI vs Player)',
  'Pintar: Inactivo': 'Paint: Off',
  'Plantillas Art': 'Art Templates',
  'Grabar Video (Pantalla / Tablero)': 'Record Video (Screen / Board)',
  'Exportar SVG Pro': 'Export SVG Pro',
  'Poner en mi perfil': 'Add to my profile',
  'Commits Restantes': 'Commits Left',
  'P1 (IA Verde) Puntos': 'P1 (Green AI) Points',
  'P2 (Jugador Cian) Puntos': 'P2 (Cyan Player) Points',
  'Estado de la Partida': 'Game Status',
  'Escaneando red...': 'Scanning network...',
  'Pausar': 'Pause',
  'Paso': 'Step',
  'Reiniciar': 'Reset',
  'Frecuencia:': 'Speed:',
  '5 t/s (Optimo)': '5 t/s (Optimal)',
  'Morfologia:': 'Shape:',
  'Laser Continuo': 'Continuous Laser',

  // Duelo de perfiles
  'Duelo de Perfiles': 'Profile Duel',
  'Dos perfiles reales, la misma IA y 60 segundos. Gana el GitHub que mas commits le da de comer a su serpiente.':
    'Two real profiles, the same AI and 60 seconds. The GitHub that feeds its snake the most commits wins.',
  'A pelear': 'Fight',
  'datos simulados': 'simulated data',
  'Ver resultado ya': 'Skip to result',
  'Revancha': 'Rematch',
  'Compartir en X': 'Share on X',
  'Copiar enlace': 'Copy link',

  // Perfiles destacados y documentación
  'Perfiles Destacados': 'Featured Profiles',
  'Carga y devora la matriz de contribuciones real de algunos referentes del Open Source.':
    'Load and devour the real contribution grid of some Open Source leaders.',
  'Renderizado Zero-Flicker a 60 FPS': 'Zero-Flicker 60 FPS Rendering',
  'Calcula la posicion de sub-pixel mediante': 'Computes sub-pixel positions with',
  'interpolacion lineal continua (LERP)': 'continuous linear interpolation (LERP)',
  'entre ticks discretos, eliminando cualquier vibracion o salto abrupto en la pantalla.':
    'between discrete ticks, removing any jitter or sudden jumps on screen.',
  'Ejecuta un arbol de busqueda en anchura que localiza los commits mas ricos energeticamente mientras utiliza un algoritmo de':
    'Runs a breadth-first search to reach the nearest commits while using a',
  'Flood Fill de seguridad': 'safety Flood Fill',
  'para jamas quedar atrapada.': 'check so it never traps itself.',
  'Sincronizacion con GitHub API': 'GitHub API Sync',
  'Parsea la matriz de 53 semanas x 7 dias en tiempo real y reacciona dinamicamente disipando la intensidad de cada commit devorado con particulas cuanticas.':
    'Parses the 53-week x 7-day grid in real time and fades each devoured commit with particle effects.',
  '© GITHUB_SNAKE_MATRIX // CONSTRUIDO CON CANVAS 2D, LERP SUB-PIXEL & VANILLA JS':
    '© GITHUB_SNAKE_MATRIX // BUILT WITH CANVAS 2D, SUB-PIXEL LERP & VANILLA JS',

  // Modal de video
  'Grabacion de Video HD (Pantalla / Tablero)': 'HD Video Recording (Screen / Board)',
  'Que deseas capturar en el video?': 'What do you want to capture?',
  'Pantalla o Pestana Completa (Perfil, avatar, velocidad y juego)': 'Full Screen or Tab (Profile, avatar, speed and game)',
  'Solo el Tablero de Juego (Canvas aislado)': 'Game Board Only (isolated canvas)',
  'Duracion de la Grabacion:': 'Recording Length:',
  '10 segundos (Recomendado para X / Twitter)': '10 seconds (Recommended for X / Twitter)',
  '15 segundos': '15 seconds',
  '20 segundos': '20 seconds',
  'Manual (Hasta que presiones Detener)': 'Manual (until you press Stop)',
  'Ideal para compartir en redes sociales:': 'Great for social media:',
  'Al elegir': 'When you choose',
  'Pantalla o Pestana Completa': 'Full Screen or Tab',
  ', tu navegador te mostrara una ventana para seleccionar que pestana compartir. Elige esta misma pestana y grabara con maxima fluidez a 60 FPS mostrando el usuario activo, avatar, controles de velocidad, estilo y el juego.':
    ', your browser will ask which tab to share. Pick this tab to record a smooth 60 FPS clip with the active user, avatar, speed controls, style and the game.',
  'Iniciar Grabacion': 'Start Recording',

  // Modal de exportar SVG
  'Configuracion de Exportacion SVG Animado': 'Animated SVG Export Settings',
  'Velocidad de Animacion (Pasos por segundo):': 'Animation Speed (steps per second):',
  'Rapida (8 t/s - Animacion agil)': 'Fast (8 t/s - snappy)',
  'Normal (5 t/s - Velocidad recomendada)': 'Normal (5 t/s - recommended)',
  'Relajada (3 t/s - Recorrido pausado)': 'Relaxed (3 t/s - slow tour)',
  'Tema / Paleta de Colores:': 'Theme / Color Palette:',
  'Matrix Phosphor (Oscuro / Verde)': 'Matrix Phosphor (Dark / Green)',
  'Cyberpunk Neon (Fucsia / Neón)': 'Cyberpunk Neon (Magenta / Neon)',
  'Cyber Cyan (Azul Eléctrico)': 'Cyber Cyan (Electric Blue)',
  'Amber CRT (Ámbar Retro)': 'Amber CRT (Retro Amber)',
  'Morfologia de la Serpiente:': 'Snake Shape:',
  'Cyber Matrix Viper (Alto contraste con núcleo láser)': 'Cyber Matrix Viper (high contrast, laser core)',
  'Pausa de Reinicio (Loop):': 'Loop Pause:',
  'Corta (1.5s de celebracion)': 'Short (1.5s celebration)',
  'Larga (2.5s de celebracion)': 'Long (2.5s celebration)',
  'Sin pausa (bucle continuo, sin celebracion)': 'No pause (continuous loop, no celebration)',
  'Descargar Archivo SVG': 'Download SVG File',

  // Fin de partida y logros
  'PARTIDA FINALIZADA // MATRIZ 100% PURIFICADA': 'GAME OVER // GRID 100% CLEARED',
  'VICTORIA DEL JUGADOR': 'PLAYER WINS',
  'Se han devorado todos los commits del perfil.': 'Every commit on the profile has been devoured.',
  'SERPIENTE 1 (IA VERDE)': 'SNAKE 1 (GREEN AI)',
  'Commits devorados:': 'Commits devoured:',
  'Porcentaje del mapa:': 'Share of grid:',
  'SERPIENTE 2 (JUGADOR CIAN)': 'SNAKE 2 (CYAN PLAYER)',
  'Nueva Partida / Revancha': 'New Game / Rematch',
  'Exportar SVG': 'Export SVG',
  '¿Te ha gustado el proyecto? Apóyalo con una estrella:': 'Enjoying the project? Support it with a star:',
  'Star en GitHub ★': 'Star on GitHub ★',
  'LOGRO DESBLOQUEADO': 'ACHIEVEMENT UNLOCKED',
  'Primer Bocado': 'First Bite',
  'Devora tu primer commit de la matriz.': 'Devour your first commit.',
  'Panel de Logros y Medallas': 'Achievements',

  // Commit Art
  'Galeria y Creador de Commit Art': 'Commit Art Gallery & Maker',
  'Escribe tu Propio Texto o Palabra': 'Write Your Own Text',
  'Escribe cualquier palabra o frase (ej: tu nombre, tu lenguaje favorito o mensaje) y se convertira en pixeles de GitHub:':
    'Type any word or phrase (your name, favorite language or a message) and it becomes GitHub pixels:',
  'Pintar en Juego': 'Paint in Game',
  '¿Para que sirve el Script Git (.sh)?': 'What is the Git script (.sh) for?',
  'Al descargar el script': 'Download the',
  ', puedes ejecutarlo en una carpeta vacia de tu computadora para crear esos commits con fechas reales y subirlos a tu cuenta de GitHub, dejando esa palabra pintada en tu perfil real.':
    ' script and run it in an empty folder to create backdated commits; push them to a GitHub repository and the word is painted on your real profile.',
  'Plantillas Rapidas de Iconos y Simbolos:': 'Quick Icon & Symbol Templates:',
  'Texto grande para captar atencion de reclutadores': 'Big text to catch recruiters’ attention',
  'Cargar': 'Load',
  'Etiqueta clasica de codigo de programacion': 'The classic code tag',
  'Icono clasico alienigena retro de 8 bits': 'Classic 8-bit retro alien',
  'Corazones en cadena pixelada de codigo abierto': 'A chain of pixel open source hearts',

  // Modal del workflow
  'Pon la serpiente en tu perfil de GitHub': 'Put the snake on your GitHub profile',
  '1. Elige el estilo:': '1. Pick the style:',
  'Automatico (claro / oscuro segun el visitante)': 'Automatic (light / dark per visitor)',
  'Siempre el mismo estilo': 'Always the same style',
  'Tema en modo oscuro': 'Dark mode theme',
  'Tema en modo claro': 'Light mode theme',
  'Serpiente': 'Snake',
  'Velocidad': 'Speed',
  'Pausa del bucle': 'Loop pause',
  'Modo oscuro': 'Dark mode',
  'Modo claro': 'Light mode',
  '2. Crea': '2. Create',
  'en tu repositorio': 'in your',
  'usuario/usuario': 'username/username',
  '3. Ejecutalo en': '3. Run it from',
  'y pega esto en tu': 'and paste this into your',
  'Copiar YAML': 'Copy YAML',
  'Workflow en tu repositorio': 'Workflow in your repository',
  'Enlace directo (sin configurar nada)': 'Direct link (no setup)',
  '2. Pega esto en tu': '2. Paste this into your',
  '. Se actualiza solo cada pocas horas:': '. It refreshes on its own every few hours:',
  'Metodo': 'Method',
  'Copiar Markdown': 'Copy Markdown',

  // Estudio de video
  'Video para redes': 'Video for social',
  'Clip vertical 9:16. Empieza a comer en el primer segundo.': 'Vertical 9:16 clip. The snake is eating from the first second.',
  'MP4 listo para X, LinkedIn, Instagram, TikTok o YouTube Shorts. Se genera en tu navegador.':
    'MP4 ready for X, LinkedIn, Instagram, TikTok or YouTube Shorts. Rendered in your browser.',
  'Horizontal 16:9': 'Landscape 16:9',
  'Cuadrado 1:1': 'Square 1:1',
  'Tema': 'Theme',
  'Generar video': 'Generate video',
  'Compartir': 'Share',
  'Descargar MP4': 'Download MP4',
  'Abrir X con el texto': 'Open X with the text',
  'Texto sugerido para el post:': 'Suggested post text:',
  'Copiar texto': 'Copy text',
  'Formato': 'Format',
  'Contenido': 'Content',
  'Mi perfil': 'My profile',
  'Último duelo': 'Latest duel',
  'Video del duelo': 'Duel video',
  'Cerrar': 'Close',

  // Atributos (placeholder, title, aria-label, alt)
  'Ver repositorio y dar estrella en GitHub': 'View the repository and star it on GitHub',
  'usuario o enlace (ej: midudev, torvalds, https://github.com/antfu)...': 'username or link (e.g. midudev, torvalds, https://github.com/antfu)...',
  'Arriba': 'Up',
  'Izquierda': 'Left',
  'Derecha': 'Right',
  'Abajo': 'Down',
  'tu usuario': 'your username',
  'Tu usuario de GitHub': 'Your GitHub username',
  'rival (ej: midudev)': 'rival (e.g. midudev)',
  'Usuario rival de GitHub': 'Rival GitHub username',
  'Escribe aqui (ej: LUIS, DEV, REACT, HIRE ME, JS)...': 'Type here (e.g. LUIS, DEV, REACT, HIRE ME, JS)...',
  'Modo de color': 'Color mode',
  'Vista previa del SVG en modo oscuro': 'SVG preview in dark mode',
  'Vista previa del SVG en modo claro': 'SVG preview in light mode'
};

const MESSAGES = {
  es: {
    'achievements.label': 'Logros: {unlocked}/{total}',
    'achievements.unlocked': 'DESBLOQUEADO',
    'achievements.locked': 'BLOQUEADO',
    'leaderboard.load': 'Cargar Perfil',
    'leaderboard.location': 'Ubicacion',
    'profile.repos': 'Repos: {repos}',
    'state.decoding': 'Decodificando perfil...',
    'state.simulatedProfile': 'Datos simulados: no se pudo leer el perfil de @{user}',
    'state.decodeError': 'Error al decodificar',
    'state.duelActive': 'Duelo Activo: IA vs Jugador',
    'state.manual': 'Modo Manual (WASD / Flechas)',
    'state.manualTouch': 'Modo Manual (WASD / Tactil)',
    'state.hunting': 'Cazando commits (IA)',
    'state.huntingLeft': 'Cazando ({remaining} restantes)',
    'state.simulatedSuffix': ' · datos simulados',
    'state.completed': 'Partida Completada al 100%',
    'state.randomGrid': 'Matriz aleatoria generada',
    'state.duelOn': 'Duelo en curso: Controla P2 con WASD/Flechas',
    'state.duelOff': 'Modo Duelo desactivado',
    'state.wordRendered': "Palabra '{text}' renderizada en el mapa",
    'state.templateLoaded': "Plantilla '{tpl}' cargada",
    'state.reset': 'Protocolo reiniciado',
    'gameover.p2Wins': '¡VICTORIA DEL JUGADOR 2!',
    'gameover.p2WinsSummary': '¡Has superado a la IA con {score} puntos ({eaten} commits devorados)!',
    'gameover.aiWins': '¡VICTORIA DE LA IA VERDE!',
    'gameover.aiWinsSummary': 'La IA ha ganado el duelo con {score} puntos ({eaten} commits devorados).',
    'gameover.tie': '¡EMPATE TÉCNICO!',
    'gameover.tieSummary': 'Ambos obtuvieron {score} puntos.',
    'gameover.cleared': '¡MATRIZ 100% PURIFICADA!',
    'gameover.clearedSummary': 'Has devorado la totalidad de los commits de @{user} con un puntaje final de {score} pts.',
    'gameover.commits': '{count} commits',
    'hud.p1Duel': 'P1 (IA Verde)',
    'hud.p2Duel': 'P2 (Jugador Cian)',
    'hud.p1Manual': 'Tu Puntaje (Manual)',
    'hud.p1Ai': 'Puntaje de Caza (IA)',
    'hud.length': 'Longitud de Serpiente',
    'hud.ai': 'IA',
    'speed.relaxed': '{speed} t/s (Relajado)',
    'speed.optimal': '{speed} t/s (Optimo)',
    'speed.fast': '{speed} t/s (Rapido)',
    'btn.modeAi': 'Control: IA Autonoma',
    'btn.modeManual': 'Control: Manual (WASD)',
    'btn.duelOn': 'Duelo: Activo (IA vs P2)',
    'btn.duelOff': 'Modo Duelo (IA vs Jugador)',
    'btn.paintOn': 'Pintar: Activo',
    'btn.paintOff': 'Pintar: Inactivo',
    'btn.audioOn': 'Audio: ON',
    'btn.audioOff': 'Audio: OFF',
    'btn.pause': 'Pausar',
    'btn.resume': 'Reanudar',
    'btn.copied': 'Copiado',
    'btn.copyYaml': 'Copiar YAML',
    'btn.copyMarkdown': 'Copiar Markdown',
    'btn.copyLink': 'Copiar enlace',
    'btn.copyFailed': 'No se pudo copiar',
    'record.starting': 'Iniciando captura...',
    'record.stopIn': 'Detener ({time}s)...',
    'record.stop': 'Detener Grabacion (REC)',
    'record.idle': 'Grabar Video (Pantalla / Tablero)',
    'tooltip.none': 'Sin contribuciones',
    'tooltip.one': '1 contribucion',
    'tooltip.many': '{count} contribuciones',
    'tooltip.level': 'Nivel de actividad: {level}/4',
    'tooltip.noDate': 'Fecha no disponible',
    'random.name': 'Matriz Aleatoria',
    'random.bio': 'Simulacion generativa procedural',
    'art.name': 'Texto: "{text}"',
    'art.bio': 'Arte en matriz personalizado',
    'profile.fallbackBio': 'Desarrollador en GitHub',
    'profile.fallbackLocation': 'Comunidad Global',
    'profile.defaultBio': 'Desarrollador de software',
    'profile.defaultLocation': 'En la red',
    'wf.darkTheme': 'Tema en modo oscuro',
    'wf.theme': 'Tema',
    'wf.darkPreview': 'Modo oscuro',
    'wf.preview': 'Vista previa',
    'share.game': 'Mi serpiente con IA acaba de devorar {eaten} commits de github.com/{user} ({score} pts) en GITHUB_SNAKE.EXE.\nPrueba con tu perfil:',
    'share.gameSimulated': 'Mi serpiente con IA (BFS + Flood Fill) acaba de limpiar una matriz de GitHub con {score} puntos en GITHUB_SNAKE.EXE.\n¿Y tu perfil?',
    'duel.needRival': 'Escribe el usuario de tu rival.',
    'duel.sameUser': 'Elige dos usuarios distintos.',
    'duel.loading': 'Cargando {a} y {b}...',
    'duel.simulatedWarning': 'Aviso: algún perfil no se pudo leer y usa datos simulados.',
    'duel.fight': '¡Pelea!',
    'duel.error': 'No se pudo iniciar el duelo.',
    'duel.rematch': '¡Revancha!',
    'duel.winner': 'Gana {winner}: {score} pts ({percent}% de su GitHub devorado) contra {loserScore} pts.',
    'duel.tie': 'Empate: {score} pts cada uno.',
    'duel.shareDisabled': 'No se pudieron leer los datos reales de algún perfil',
    'duel.shareText': 'Duelo de GitHubs en GITHUB_SNAKE.EXE: {a} ({aScore} pts) vs {b} ({bScore} pts). Gana {winner} con el {percent}% de su grafico devorado por la IA.\n¿Tu GitHub le gana?',
    'duel.shareTie': 'Duelo de GitHubs en GITHUB_SNAKE.EXE: {a} vs {b} terminó en empate ({score} pts).\n¿Tu GitHub les gana?',
    'video.generating': 'Generando video...',
    'video.ready': 'Listo: MP4 de {mb} MB. Compártelo o descárgalo.',
    'video.readyWebm': 'Listo, pero este navegador solo pudo generar WebM y X no lo acepta. Usa Chrome, Edge o Safari para obtener MP4.',
    'video.error': 'No se pudo generar el video en este navegador.',
    'video.shareFailed': 'No se pudo compartir: descárgalo y súbelo a mano.',
    'video.attachHint': 'Se abrió X con el texto: arrastra al post el video descargado.',
    'video.copyText': 'Copiar texto',
    'video.postText': 'Una IA se acaba de comer mi gráfico de GitHub 🐍\n{total} contribuciones y {days} días activos este año.\n¿Tu GitHub le gana al mío? {link}',
    'video.postTextGeneric': 'Una IA que se come gráficos de GitHub 🐍 Pruébalo con tu perfil: {link}',
    'video.duelPostText': 'Duelo de GitHubs 🐍 {a} ({aScore} pts) vs {b} ({bScore} pts): gana {winner}.\nMisma IA, 60 segundos. ¿Tu GitHub le gana? {link}',
    'video.duelPostTie': 'Duelo de GitHubs 🐍 {a} vs {b} terminó en empate.\n¿Tu GitHub les gana? {link}',
    'video.simulatedBlocked': 'No se pudieron leer los datos reales de este perfil (se ven datos simulados): no se genera el video para no publicar algo inventado.',
    'ach.first_bite.title': 'Primer Bocado',
    'ach.first_bite.desc': 'Devora tu primer commit de la matriz.',
    'ach.hunter_50.title': 'Cazador de Commits',
    'ach.hunter_50.desc': 'Devora 50 commits en una sola sesion.',
    'ach.manual_pilot.title': 'Piloto Manual',
    'ach.manual_pilot.desc': 'Toma el control directo con las teclas WASD o flechas.',
    'ach.profile_hacker.title': 'Explorador de Perfiles',
    'ach.profile_hacker.desc': 'Carga y analiza 3 perfiles de desarrolladores.',
    'ach.clean_sweep.title': 'Matriz Purificada',
    'ach.clean_sweep.desc': 'Devora el 100% de los commits de un perfil.',
    'ach.cinematographer.title': 'Director de Cine',
    'ach.cinematographer.desc': 'Graba y descarga un clip de video HD en WebM.',
    'ach.artist.title': 'Artista de Contribuciones',
    'ach.artist.desc': 'Usa el modo pintar o carga una plantilla de Commit Art.'
  },
  en: {
    'achievements.label': 'Achievements: {unlocked}/{total}',
    'achievements.unlocked': 'UNLOCKED',
    'achievements.locked': 'LOCKED',
    'leaderboard.load': 'Load Profile',
    'leaderboard.location': 'Location',
    'profile.repos': 'Repos: {repos}',
    'state.decoding': 'Decoding profile...',
    'state.simulatedProfile': "Simulated data: couldn't read @{user}'s profile",
    'state.decodeError': 'Decoding error',
    'state.duelActive': 'Duel on: AI vs Player',
    'state.manual': 'Manual Mode (WASD / Arrows)',
    'state.manualTouch': 'Manual Mode (WASD / Touch)',
    'state.hunting': 'Hunting commits (AI)',
    'state.huntingLeft': 'Hunting ({remaining} left)',
    'state.simulatedSuffix': ' · simulated data',
    'state.completed': 'Game 100% complete',
    'state.randomGrid': 'Random grid generated',
    'state.duelOn': 'Duel on: control P2 with WASD/Arrows',
    'state.duelOff': 'Duel mode off',
    'state.wordRendered': "Word '{text}' drawn on the grid",
    'state.templateLoaded': "Template '{tpl}' loaded",
    'state.reset': 'Reset complete',
    'gameover.p2Wins': 'PLAYER 2 WINS!',
    'gameover.p2WinsSummary': 'You beat the AI with {score} points ({eaten} commits devoured)!',
    'gameover.aiWins': 'GREEN AI WINS!',
    'gameover.aiWinsSummary': 'The AI won the duel with {score} points ({eaten} commits devoured).',
    'gameover.tie': "IT'S A TIE!",
    'gameover.tieSummary': 'Both scored {score} points.',
    'gameover.cleared': 'GRID 100% CLEARED!',
    'gameover.clearedSummary': "You devoured every commit on @{user}'s grid with a final score of {score} pts.",
    'gameover.commits': '{count} commits',
    'hud.p1Duel': 'P1 (Green AI)',
    'hud.p2Duel': 'P2 (Cyan Player)',
    'hud.p1Manual': 'Your Score (Manual)',
    'hud.p1Ai': 'Hunt Score (AI)',
    'hud.length': 'Snake Length',
    'hud.ai': 'AI',
    'speed.relaxed': '{speed} t/s (Relaxed)',
    'speed.optimal': '{speed} t/s (Optimal)',
    'speed.fast': '{speed} t/s (Fast)',
    'btn.modeAi': 'Control: Autonomous AI',
    'btn.modeManual': 'Control: Manual (WASD)',
    'btn.duelOn': 'Duel: On (AI vs P2)',
    'btn.duelOff': 'Duel Mode (AI vs Player)',
    'btn.paintOn': 'Paint: On',
    'btn.paintOff': 'Paint: Off',
    'btn.audioOn': 'Audio: ON',
    'btn.audioOff': 'Audio: OFF',
    'btn.pause': 'Pause',
    'btn.resume': 'Resume',
    'btn.copied': 'Copied',
    'btn.copyYaml': 'Copy YAML',
    'btn.copyMarkdown': 'Copy Markdown',
    'btn.copyLink': 'Copy link',
    'btn.copyFailed': "Couldn't copy",
    'record.starting': 'Starting capture...',
    'record.stopIn': 'Stop ({time}s)...',
    'record.stop': 'Stop Recording (REC)',
    'record.idle': 'Record Video (Screen / Board)',
    'tooltip.none': 'No contributions',
    'tooltip.one': '1 contribution',
    'tooltip.many': '{count} contributions',
    'tooltip.level': 'Activity level: {level}/4',
    'tooltip.noDate': 'Date unavailable',
    'random.name': 'Random Grid',
    'random.bio': 'Procedural generative simulation',
    'art.name': 'Text: "{text}"',
    'art.bio': 'Custom grid art',
    'profile.fallbackBio': 'Developer on GitHub',
    'profile.fallbackLocation': 'Global Community',
    'profile.defaultBio': 'Software developer',
    'profile.defaultLocation': 'Online',
    'wf.darkTheme': 'Dark mode theme',
    'wf.theme': 'Theme',
    'wf.darkPreview': 'Dark mode',
    'wf.preview': 'Preview',
    'share.game': 'My AI snake just devoured {eaten} commits from github.com/{user} ({score} pts) on GITHUB_SNAKE.EXE.\nTry your profile:',
    'share.gameSimulated': 'My AI snake (BFS + Flood Fill) just cleared a GitHub grid with {score} points on GITHUB_SNAKE.EXE.\nWhat about your profile?',
    'duel.needRival': "Enter your rival's username.",
    'duel.sameUser': 'Pick two different users.',
    'duel.loading': 'Loading {a} and {b}...',
    'duel.simulatedWarning': "Heads up: a profile couldn't be read and uses simulated data.",
    'duel.fight': 'Fight!',
    'duel.error': "Couldn't start the duel.",
    'duel.rematch': 'Rematch!',
    'duel.winner': '{winner} wins: {score} pts ({percent}% of their GitHub devoured) vs {loserScore} pts.',
    'duel.tie': 'Tie: {score} pts each.',
    'duel.shareDisabled': "Couldn't read real data for one of the profiles",
    'duel.shareText': 'GitHub duel on GITHUB_SNAKE.EXE: {a} ({aScore} pts) vs {b} ({bScore} pts). {winner} wins with {percent}% of their graph devoured by the AI.\nCan your GitHub beat it?',
    'duel.shareTie': 'GitHub duel on GITHUB_SNAKE.EXE: {a} vs {b} ended in a tie ({score} pts).\nCan your GitHub beat them?',
    'video.generating': 'Rendering video...',
    'video.ready': 'Ready: {mb} MB MP4. Share it or download it.',
    'video.readyWebm': "Ready, but this browser could only produce WebM and X doesn't accept it. Use Chrome, Edge or Safari to get an MP4.",
    'video.error': "Couldn't render the video in this browser.",
    'video.shareFailed': "Couldn't share: download it and upload it manually.",
    'video.attachHint': 'X opened with the text: drag the downloaded video into the post.',
    'video.copyText': 'Copy text',
    'video.postText': 'An AI snake just devoured my GitHub contribution graph 🐍\n{total} contributions and {days} active days this year.\nCan your GitHub beat mine? {link}',
    'video.postTextGeneric': 'An AI snake that eats GitHub graphs 🐍 Try it with your profile: {link}',
    'video.duelPostText': 'GitHub duel 🐍 {a} ({aScore} pts) vs {b} ({bScore} pts): {winner} wins.\nSame AI, 60 seconds. Can your GitHub beat it? {link}',
    'video.duelPostTie': 'GitHub duel 🐍 {a} vs {b} ended in a tie.\nCan your GitHub beat them? {link}',
    'video.simulatedBlocked': "Couldn't read this profile's real data (simulated data is shown), so no video is generated to avoid publishing made-up numbers.",
    'ach.first_bite.title': 'First Bite',
    'ach.first_bite.desc': 'Devour your first commit.',
    'ach.hunter_50.title': 'Commit Hunter',
    'ach.hunter_50.desc': 'Devour 50 commits in one session.',
    'ach.manual_pilot.title': 'Manual Pilot',
    'ach.manual_pilot.desc': 'Take control with WASD or the arrow keys.',
    'ach.profile_hacker.title': 'Profile Explorer',
    'ach.profile_hacker.desc': 'Load 3 developer profiles.',
    'ach.clean_sweep.title': 'Grid Cleared',
    'ach.clean_sweep.desc': "Devour 100% of a profile's commits.",
    'ach.cinematographer.title': 'Film Director',
    'ach.cinematographer.desc': 'Record and download an HD WebM clip.',
    'ach.artist.title': 'Contribution Artist',
    'ach.artist.desc': 'Use paint mode or load a Commit Art template.'
  }
};

const I18N_STORAGE_KEY = 'gh_snake_lang';
const I18N_ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const STATIC_ES = Object.fromEntries(Object.entries(STATIC_EN).map(([es, en]) => [en, es]));

const I18n = {
  lang: 'es',

  detect() {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl === 'es' || fromUrl === 'en') return fromUrl;
    try {
      const saved = localStorage.getItem(I18N_STORAGE_KEY);
      if (saved === 'es' || saved === 'en') return saved;
    } catch (e) {}
    return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  },

  t(key, vars = {}) {
    const template = (MESSAGES[this.lang] && MESSAGES[this.lang][key]) ?? MESSAGES.es[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (m, name) => (vars[name] !== undefined ? vars[name] : m));
  },

  /** Texto original (español) de un texto en cualquiera de los dos idiomas, o null si no está en el diccionario */
  baseOf(text) {
    if (STATIC_EN[text] !== undefined) return text;
    if (STATIC_ES[text] !== undefined) return STATIC_ES[text];
    return null;
  },

  translateStatic(base) {
    return this.lang === 'en' ? STATIC_EN[base] : base;
  },

  /** Traduce el DOM. Solo toca textos que siguen siendo los del diccionario: lo que la app cambió lo repinta ella */
  applyToDom(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (['SCRIPT', 'STYLE', 'TEXTAREA'].includes(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
    });
    let node;
    while ((node = walker.nextNode())) {
      const raw = node.nodeValue;
      const normalized = raw.replace(/\s+/g, ' ').trim();
      if (!normalized) continue;
      const base = this.baseOf(normalized);
      if (base === null) continue;
      const lead = raw.match(/^\s*/)[0];
      const trail = raw.match(/\s*$/)[0];
      node.nodeValue = lead + this.translateStatic(base) + trail;
    }

    root.querySelectorAll(I18N_ATTRS.map(a => `[${a}]`).join(',')).forEach(el => {
      for (const attr of I18N_ATTRS) {
        const value = el.getAttribute(attr);
        if (!value) continue;
        const base = this.baseOf(value);
        if (base !== null) el.setAttribute(attr, this.translateStatic(base));
      }
    });
  },

  setLang(lang, { persist = true } = {}) {
    this.lang = lang === 'en' ? 'en' : 'es';
    document.documentElement.lang = this.lang;
    if (persist) {
      try { localStorage.setItem(I18N_STORAGE_KEY, this.lang); } catch (e) {}
    }
    this.applyToDom();
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.langBtn === this.lang));
    });
    window.dispatchEvent(new CustomEvent('languagechange-app', { detail: { lang: this.lang } }));
  }
};

window.I18n = I18n;
window.t = (key, vars) => I18n.t(key, vars);

// El idioma se aplica antes que la app (este script se carga primero) para no mostrar un parpadeo en español
I18n.lang = I18n.detect();
document.addEventListener('DOMContentLoaded', () => {
  I18n.setLang(I18n.lang, { persist: false });
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.addEventListener('click', () => I18n.setLang(btn.dataset.langBtn));
  });
});
