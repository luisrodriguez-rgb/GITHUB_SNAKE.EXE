/**
 * Commit Art & Custom Text Font Rasterizer Engine
 * Convierte cualquier palabra o frase en píxeles sobre la matriz de 53x7 y genera scripts Git personalizados.
 */

class CommitArtEngine {
  constructor() {
    // Diccionario de fuente Bitmap 3x5 y 4x5 para la cuadrícula de 7 filas
    this.font = {
      'A': [[1,2,3,4],[0,2],[0,2],[1,2,3,4]],
      'B': [[0,1,2,3,4],[0,2,4],[0,2,4],[1,3]],
      'C': [[1,2,3],[0,4],[0,4],[0,4]],
      'D': [[0,1,2,3,4],[0,4],[0,4],[1,2,3]],
      'E': [[0,1,2,3,4],[0,2,4],[0,2,4],[0,4]],
      'F': [[0,1,2,3,4],[0,2],[0,2],[0]],
      'G': [[1,2,3],[0,4],[0,2,4],[0,2,3,4]],
      'H': [[0,1,2,3,4],[2],[2],[0,1,2,3,4]],
      'I': [[0,4],[0,1,2,3,4],[0,4]],
      'J': [[3],[4],[0,4],[0,1,2,3]],
      'K': [[0,1,2,3,4],[2],[1,3],[0,4]],
      'L': [[0,1,2,3,4],[4],[4],[4]],
      'M': [[0,1,2,3,4],[1],[2],[1],[0,1,2,3,4]],
      'N': [[0,1,2,3,4],[1],[2],[3],[0,1,2,3,4]],
      'O': [[1,2,3],[0,4],[0,4],[1,2,3]],
      'P': [[0,1,2,3,4],[0,2],[0,2],[1]],
      'Q': [[1,2,3],[0,4],[0,3,4],[1,2,3,4]],
      'R': [[0,1,2,3,4],[0,2],[0,2],[1,3,4]],
      'S': [[1,4],[0,2,4],[0,2,4],[0,3]],
      'T': [[0],[0],[0,1,2,3,4],[0],[0]],
      'U': [[0,1,2,3],[4],[4],[0,1,2,3]],
      'V': [[0,1,2],[3],[4],[3],[0,1,2]],
      'W': [[0,1,2,3,4],[3],[2],[3],[0,1,2,3,4]],
      'X': [[0,4],[1,3],[2],[1,3],[0,4]],
      'Y': [[0,1],[2],[3,4],[2],[0,1]],
      'Z': [[0,4],[0,3,4],[0,2,4],[0,1,4]],
      '0': [[1,2,3],[0,4],[0,4],[1,2,3]],
      '1': [[1,4],[0,1,2,3,4],[4]],
      '2': [[1,4],[0,3,4],[0,2,4],[1,4]],
      '3': [[0,4],[0,2,4],[0,2,4],[1,3]],
      '4': [[0,1,2],[2],[0,1,2,3,4],[2]],
      '5': [[0,1,2,4],[0,2,4],[0,2,4],[0,3]],
      '6': [[1,2,3],[0,2,4],[0,2,4],[1,3]],
      '7': [[0],[0,3,4],[0,2],[0,1]],
      '8': [[1,3],[0,2,4],[0,2,4],[1,3]],
      '9': [[1,3],[0,2,4],[0,2,4],[1,2,3]],
      '!': [[0,1,2,4]],
      '?': [[1],[0,3,4],[0,2],[1]],
      '<': [[2],[1,3],[0,4]],
      '>': [[0,4],[1,3],[2]],
      '/': [[4],[3],[2],[1],[0]],
      '-': [[2],[2],[2]],
      '+': [[2],[1,2,3],[2]],
      '*': [[1,3],[2],[1,3]],
      '=': [[1,3],[1,3],[1,3]],
      '#': [[1,3],[0,1,2,3,4],[1,3],[0,1,2,3,4],[1,3]],
      '.': [[4]],
      ':': [[1,3]],
      ' ': [[],[]]
    };

    // Plantillas predefinidas
    this.templates = {
      hire_me: {
        name: 'HIRE ME',
        desc: 'Texto en pixel art para destacar en perfiles de reclutadores'
      },
      code: {
        name: '<CODE />',
        desc: 'Simbolo clasico de desarrollo de software'
      },
      invader: {
        name: 'Space Invader',
        desc: 'Icono retro alienigena de 8 bits'
      },
      heart: {
        name: 'Open Source Heart',
        desc: 'Corazones pixelados en cadena'
      }
    };
  }

  /**
   * Convierte un texto personalizado en una lista de coordenadas [x, y]
   * centrado vertical y horizontalmente en la matriz de 53x7.
   */
  textToPattern(text, cols = 53, rows = 7) {
    const cleanText = text.toUpperCase().trim() || 'DEV';
    const letterSpacing = 1;

    // 1. Calcular ancho total necesario
    let totalWidth = 0;
    const glyphs = [];

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const glyph = this.font[char] || this.font['?'];
      glyphs.push(glyph);
      totalWidth += glyph.length;
      if (i < cleanText.length - 1) {
        totalWidth += letterSpacing;
      }
    }

    // 2. Calcular punto de inicio X centrado
    let startX = Math.max(1, Math.floor((cols - totalWidth) / 2));
    const startY = 1; // Centrado vertical en fila 1 (0 a 6)

    const pattern = [];
    let curX = startX;

    for (let g = 0; g < glyphs.length; g++) {
      const glyph = glyphs[g];
      for (let colIdx = 0; colIdx < glyph.length; colIdx++) {
        const x = curX + colIdx;
        const rowsActive = glyph[colIdx];
        if (x < cols) {
          rowsActive.forEach(r => {
            const y = startY + r;
            if (y >= 0 && y < rows) {
              pattern.push([x, y]);
            }
          });
        }
      }
      curX += glyph.length + letterSpacing;
    }

    return pattern;
  }

  /**
   * Genera la matriz de 53x7 con el texto renderizado
   */
  generateGridFromText(text, cols = 53, rows = 7) {
    const pattern = this.textToPattern(text, cols, rows);

    const grid = [];
    for (let x = 0; x < cols; x++) {
      const col = [];
      for (let y = 0; y < rows; y++) {
        col.push({ x, y, level: 0, originalLevel: 0, count: 0 });
      }
      grid.push(col);
    }

    pattern.forEach(([px, py]) => {
      if (px >= 0 && px < cols && py >= 0 && py < rows) {
        grid[px][py] = {
          x: px,
          y: py,
          level: 4,
          originalLevel: 4,
          count: 15
        };
      }
    });

    return grid;
  }

  /**
   * Aplica una plantilla predefinida o texto
   */
  applyTemplate(templateKey, cols = 53, rows = 7) {
    if (templateKey === 'invader') {
      const pattern = [
        [10,2],[10,3],[10,4], [11,1],[11,3], [12,1],[12,2],[12,3],[12,4],[12,5],
        [13,2],[13,4], [14,1],[14,2],[14,3],[14,4],[14,5], [15,1],[15,3], [16,2],[16,3],[16,4],
        [24,2],[24,3],[24,4], [25,1],[25,3], [26,1],[26,2],[26,3],[26,4],[26,5],
        [27,2],[27,4], [28,1],[28,2],[28,3],[28,4],[28,5], [29,1],[29,3], [30,2],[30,3],[30,4],
        [38,2],[38,3],[38,4], [39,1],[39,3], [40,1],[40,2],[40,3],[40,4],[40,5],
        [41,2],[41,4], [42,1],[42,2],[42,3],[42,4],[42,5], [43,1],[43,3], [44,2],[44,3],[44,4]
      ];
      return this.patternToGrid(pattern, cols, rows);
    }

    if (templateKey === 'heart') {
      const pattern = [
        [8,2],[8,3], [9,1],[9,2],[9,3],[9,4], [10,2],[10,3],[10,4],[10,5], [11,3],[11,4],[11,5],[11,6],
        [12,2],[12,3],[12,4],[12,5], [13,1],[13,2],[13,3],[13,4], [14,2],[14,3],
        [24,2],[24,3], [25,1],[25,2],[25,3],[25,4], [26,2],[26,3],[26,4],[26,5], [27,3],[27,4],[27,5],[27,6],
        [28,2],[28,3],[28,4],[28,5], [29,1],[29,2],[29,3],[29,4], [30,2],[30,3]
      ];
      return this.patternToGrid(pattern, cols, rows);
    }

    const tpl = this.templates[templateKey];
    const text = tpl ? tpl.name : templateKey;
    return this.generateGridFromText(text, cols, rows);
  }

  patternToGrid(pattern, cols = 53, rows = 7) {
    const grid = [];
    for (let x = 0; x < cols; x++) {
      const col = [];
      for (let y = 0; y < rows; y++) {
        col.push({ x, y, level: 0, originalLevel: 0, count: 0 });
      }
      grid.push(col);
    }

    pattern.forEach(([px, py]) => {
      if (px >= 0 && px < cols && py >= 0 && py < rows) {
        grid[px][py] = {
          x: px,
          y: py,
          level: 4,
          originalLevel: 4,
          count: 15
        };
      }
    });
    return grid;
  }

  /**
   * Genera un script Bash personalizado para cualquier palabra ingresada
   */
  generateBashScript(textOrKey) {
    let pattern = [];
    let name = textOrKey;

    if (textOrKey === 'invader' || textOrKey === 'heart') {
      const grid = this.applyTemplate(textOrKey);
      for (let x = 0; x < 53; x++) {
        for (let y = 0; y < 7; y++) {
          if (grid[x][y].level > 0) pattern.push([x, y]);
        }
      }
    } else {
      const tpl = this.templates[textOrKey];
      name = tpl ? tpl.name : textOrKey;
      pattern = this.textToPattern(name);
    }

    return `#!/usr/bin/env bash
# Generador de Commit Art en GitHub
# Repositorio destino recomendado: Crea un repositorio NUEVO y VACIO en tu GitHub

mkdir -p git-art-custom && cd git-art-custom
git init
echo "# GitHub Commit Art: ${name}" > README.md
git add README.md
git commit -m "init custom artwork"

YEAR=$(date +%Y)
${pattern.map(([x, y]) => `GIT_AUTHOR_DATE="$YEAR-01-01T12:00:00 +${x * 7 + y} days" GIT_COMMITTER_DATE="$YEAR-01-01T12:00:00 +${x * 7 + y} days" git commit --allow-empty -m "pixel [${x},${y}]"`).join('\n')}

echo "Arte '${name}' generado exitosamente."
echo "Para pintarlo en tu perfil de GitHub:"
echo "1. Crea un repo en github.com"
echo "2. git remote add origin <tu_repo_url>"
echo "3. git push -u origin main"`;
  }
}

window.CommitArtEngine = CommitArtEngine;
