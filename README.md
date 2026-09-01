<p align="center">
  <img src="assets/logo.svg" alt="GITHUB_SNAKE.EXE Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 0 35px rgba(0,255,102,0.5);" />
</p>

# GITHUB_SNAKE.EXE // PRO EDITION v2.0

<p align="center">
  <img src="assets/hero_preview.png" alt="GitHub Snake Matrix Engine Preview" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,255,102,0.25);" />
</p>

<p align="center">
  <a href="https://luisrodriguez-rgb.github.io/GITHUB_SNAKE.EXE/">
    <img src="https://img.shields.io/badge/DEMO_EN_VIVO-PROBAR_EN_EL_NAVEGADOR-00ff66?style=for-the-badge&logo=github&logoColor=black" alt="Demo en Vivo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FPS-60_Zero--Flicker-00ff66?style=for-the-badge" alt="60 FPS Zero-Flicker" />
  <img src="https://img.shields.io/badge/Pathfinding-BFS_%2B_Lookahead-00f2fe?style=for-the-badge" alt="BFS Pathfinding" />
  <img src="https://img.shields.io/badge/Mode-Duel_%26_Manual-ff007f?style=for-the-badge" alt="Duel & Manual Mode" />
  <img src="https://img.shields.io/badge/Audio-Web_Audio_Procedural-fcee0a?style=for-the-badge" alt="Web Audio API" />
  <img src="https://img.shields.io/badge/License-MIT-white?style=for-the-badge" alt="MIT License" />
</p>

---

> [!TIP]
> **Acceso Directo a la Aplicacion Desplegada**:  
> Puedes jugar, simular perfiles y generar tus scripts de Commit Art directamente desde la web en:  
> **https://luisrodriguez-rgb.github.io/GITHUB_SNAKE.EXE/**

---

## Descripcion General

**GITHUB_SNAKE.EXE** es un motor de simulacion interactiva, emulacion de perfiles y videojuego en tiempo real construido sobre Canvas 2D. Utiliza **interpolacion lineal continua (LERP)** para lograr un movimiento a 60 FPS sin saltos ni parpadeos (Zero-Flicker), navegacion autonoma inteligente con **BFS + Flood Fill de seguridad**, modo duelo multijugador, soporte de grabacion de video HD nativo, tooltips interactivos estilo GitHub y un generador de **Commit Art** para transformar texto en scripts de Git listos para pintar tu perfil real de GitHub.

---

## Galeria Visual de Funcionalidades

### 1. Interfaz Principal y Simulacion a 60 FPS
Explora perfiles reales de GitHub (Linus Torvalds, Anthony Fu, Midudev, etc.) o matrices aleatorias densas con renderizado sub-pixel de alta definicion.
<p align="center">
  <img src="assets/hero_preview.png" alt="Dashboard Principal" width="95%" style="border-radius: 10px; border: 1px solid rgba(0,255,102,0.3);" />
</p>

---

### 2. Modo Duelo: IA Verde vs Jugador Cian
Compite contra la inteligencia artificial en tiempo real. La pantalla divide la barra de progreso superior mostrando el porcentaje de mapa conquistado y puntos obtenidos por cada serpiente hasta purificar el 100% de la matriz.
<p align="center">
  <img src="assets/duel_mode.png" alt="Modo Duelo" width="95%" style="border-radius: 10px; border: 1px solid rgba(0,242,254,0.3);" />
</p>

---

### 3. Creador de Texto "Commit Art" & Generador de Scripts Git (.sh)
Escribe cualquier palabra (ej: tu nombre, tu lenguaje favorito o mensaje) y el motor la convertira en una matriz bitmap de GitHub con commits organicos. Descarga el script `.sh` automatizado para pintar ese dibujo en tu perfil real de GitHub.
<p align="center">
  <img src="assets/commit_art.png" alt="Creador de Commit Art" width="95%" style="border-radius: 10px; border: 1px solid rgba(255,0,127,0.3);" />
</p>

---

## Caracteristicas Principales

* **Renderizado Zero-Flicker a 60 FPS**:
  * Desacoplamiento de la logica de ticks y el refresco visual mediante interpolacion continua LERP (`x(t) = x_prev + (x_next - x_prev) * progress`).
  * Contornos de alto contraste y columna vertebral laser blanca para evitar que la serpiente se pierda en fondos oscuros.
  * Transicion toroidal perfecta (Ghost Segments) al cruzar los limites laterales y verticales sin cortes en pantalla.
* **Tooltip Interactivo Estilo GitHub**:
  * Muestra en tiempo real la cantidad exacta de contribuciones (`14 contribuciones`), la fecha formateada en espanol (`el 14 de mayo de 2025`) y el nivel de actividad al pasar el cursor sobre cualquier celda.
* **Sistema de Puntuacion y Pantalla de Fin de Partida**:
  * Puntos proporcionales al nivel de commit: Nivel 1 = 10 pts, Nivel 2 = 25 pts, Nivel 3 = 50 pts, Nivel 4 = 100 pts.
  * Modal de Victoria/Game Over con desglose de porcentaje de tablero conquistado y boton de revancha.
* **Navegacion Autonoma Inteligente (BFS + Flood Fill)**:
  * Busqueda de la ruta mas corta hacia los commits mas densos con lookahead de seguridad para prevenir colisiones y trampas.
* **Creador de Palabras Personalizadas**:
  * Motor tipografico matricial 3x5 y 4x5 que centra cualquier texto y asigna intensidades organicas y realistas.
* **Grabador de Video HD WebM Integrado**:
  * Captura nativa a 60 FPS directamente desde el canvas con MediaRecorder sin necesidad de extensiones externas.
* **Sintesis de Audio Cyberpunk (Web Audio API)**:
  * Generacion procedimental de frecuencias con osciladores y filtros en tiempo real (mordiscos, ondas de choque y clics de interfaz).
* **Exportador de SVG Animado y GitHub Actions**:
  * Exporta SVG con animacion en bucle del 100% de la partida y genera el workflow `.github/workflows/snake.yml`.
* **Componente Web Independiente (`embed.js`)**:
  * Etiqueta `<github-snake user="torvalds" theme="dark"></github-snake>` reutilizable para cualquier pagina o portafolio personal.
* **Sistema de Logros y Medallas**:
  * 7 medallas desbloqueables con notificaciones Cyber Toast y persistencia en LocalStorage.

---

## Arquitectura y Flujo de Datos

```
+-------------------------------------------------------------------------+
|                              CAPA DE ENTRADA                            |
|    GitHub API REST  |  Palabras Commit Art  |  WASD / Flechas Teclado   |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                         MATRIZ DE CONTRIBUCIONES                        |
|              Estructura normalizada de 53 columnas x 7 filas            |
|              Fechas calculadas, conteos dinamicos y niveles 0-4         |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                     MOTORES LOGICOS Y PATHFINDING                       |
|   - IA Verde: Busqueda BFS con lookahead de seguridad Flood Fill        |
|   - P2 Cian: Control manual con normalizacion de direccion toroidal     |
|   - Scoring: Puntos por nivel de intensidad y deteccion de fin de juego |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                     MOTOR DE RENDERIZADO CANVAS 2D                      |
|   - requestAnimationFrame a 60 FPS con LERP sub-pixel                   |
|   - Contorno de alto contraste + Columna vertebral laser brillante      |
|   - Ondas de choque (Shockwaves), particulas de codigo y scanlines      |
|   - Tooltip flotante dinamico sincronizado con coordenadas de mouse     |
+-------------------------------------------------------------------------+
```

---

## Estructura del Proyecto

```
.
|-- index.html            # Estructura semantica, HUD, tooltips, modales y canvas
|-- style.css             # Design tokens, paletas de color, efectos glassmorphism
|-- favicon.svg           # Favicon y logo vectorial SVG oficial de alta resolucion
|-- embed.js              # Web Component autonomo <github-snake> para portafolios
|-- assets/               # Capturas de pantalla, previews y recursos visuales
|   |-- logo.svg          # Logo vectorial oficial del proyecto
|   |-- hero_preview.png  # Captura de interfaz principal
|   |-- duel_mode.png     # Captura del modo duelo IA vs Jugador
|   |-- commit_art.png    # Captura del creador de Commit Art
|   `-- demo_recording.webp # Grabacion de sesion
|-- js/
|   |-- achievements.js   # Sistema de medallas, persistencia y eventos
|   |-- audio.js          # Sintetizador procedural Web Audio API
|   |-- exporter.js       # Exportador SVG con barrido 100% y generador YAML
|   |-- github.js         # API Fetcher, calculo de fechas y ranking de devs
|   |-- pathfinding.js    # Algoritmo BFS y evaluacion de seguridad Flood Fill
|   |-- recorder.js       # Motor de grabacion HD WebM en navegador
|   |-- renderer.js       # Renderizado Canvas 2D con alto contraste y LERP
|   |-- snake.js          # Maquina de estados, segmentos y particulas
|   |-- templates.js      # Rasterizador de fuentes bitmap y scripts Bash Git
|   `-- app.js            # Orquestador maestro, bucle principal y eventos DOM
|-- README.md             # Documentacion tecnica del repositorio
`-- snake_link.md         # Especificacion matematica de algoritmos
```

---

## Ejecucion en Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/luisrodriguez-rgb/GITHUB_SNAKE.EXE.git
   cd GITHUB_SNAKE.EXE
   ```

2. **Iniciar servidor web local**:
   ```bash
   # Opcion A: Python
   python3 -m http.server 3000

   # Opcion B: Node.js
   npx serve .
   ```

3. **Abrir en el navegador**:
   Visita `http://localhost:3000` en tu navegador.

---

## Guia Detallada: Como Integrar la Serpiente en tu Perfil de GitHub

GitHub cuenta con una funcionalidad especial donde el archivo `README.md` de un repositorio con tu mismo nombre de usuario se convierte en la portada principal de tu perfil.

### Paso 1: Crear tu Repositorio Especial
1. Ve a [github.com/new](https://github.com/new).
2. En **Repository name**, escribe exactamente tu nombre de usuario de GitHub (ejemplo: `luisrodriguez-rgb`).
3. Veras un mensaje informativo confirmando que has desbloqueado el repositorio especial.
4. Asegurate de que este configurado como **Public** y marca la casilla **Add a README file**.
5. Haz clic en **Create repository**.

### Paso 2: Habilitar Permisos de Escritura para GitHub Actions
Para que la accion automatizada pueda guardar el archivo SVG generado en tu repositorio sin errores de permisos:
1. En tu repositorio `usuario/usuario`, ve a la pestana **Settings** (Configuracion).
2. En la barra lateral izquierda, entra en **Actions** -> **General**.
3. Baja hasta la seccion **Workflow permissions**.
4. Marca la opcion **Read and write permissions**.
5. Marca la casilla **Allow GitHub Actions to create and approve pull requests**.
6. Haz clic en **Save**.

### Paso 3: Crear el Workflow Automatizado (`snake.yml`)
1. Dentro de tu repositorio especial, crea el archivo en la siguiente ruta:  
   `.github/workflows/snake.yml`
2. Copia y pega la siguiente configuracion (reemplaza `TU_USUARIO` por tu usuario de GitHub):

```yaml
name: Generate Snake Contribution Animation

on:
  # Se ejecuta automaticamente cada 24 horas a medianoche
  schedule:
    - cron: "0 0 * * *"
  # Permite disparar la ejecucion manualmente en cualquier momento
  workflow_dispatch:
  # Se ejecuta al hacer push a la rama principal
  push:
    branches:
      - main

jobs:
  generate:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Generate Snake SVG
        uses: Platane/snk/svg-only@v3
        with:
          github_user_name: TU_USUARIO
          outputs: |
            dist/github-contribution-grid-snake.svg
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Deploy SVG to Output Branch
        uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Paso 4: Ejecutar el Workflow por Primera Vez
1. Ve a la pestana **Actions** de tu repositorio.
2. En el menu izquierdo, selecciona **Generate Snake Contribution Animation**.
3. Haz clic en el boton desplegable **Run workflow** -> **Run workflow**.
4. Una vez completado en verde, se habra creado automaticamente la rama `output` con los graficos generados.

### Paso 5: Mostrar la Animacion en tu Portada
Edita tu `README.md` principal y agrega este bloque para soporte automatico en modo oscuro y claro:

```markdown
### Mi Matriz de Contribuciones

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/TU_USUARIO/TU_USUARIO/output/github-contribution-grid-snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/TU_USUARIO/TU_USUARIO/output/github-contribution-grid-snake.svg">
  <img alt="Snake Contribution Animation" src="https://raw.githubusercontent.com/TU_USUARIO/TU_USUARIO/output/github-contribution-grid-snake.svg">
</picture>
```

### Resolucion de Problemas Frecuentes:
* **Error `Resource not accessible by integration` (403)**: Ocurre si olvidaste aplicar el **Paso 2**. Asegurate de activar `Read and write permissions` en Settings -> Actions -> General.
* **La imagen no se actualiza de inmediato**: GitHub utiliza un CDN de proxy de imagenes (`camo.githubusercontent.com`). Puede tardar unos minutos en refrescar la cache despues de la primera ejecucion.

---

## Licencia

Distribuido bajo la Licencia **MIT**. Disenado y desarrollado como software libre de alto rendimiento para la comunidad de desarrolladores.
