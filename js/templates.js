/**
 * Commit Art & Template Engine
 * Contiene plantillas pixel-art para la matriz de 53x7 y generador de scripts Git.
 */

class CommitArtEngine {
  constructor() {
    this.templates = {
      hire_me: {
        name: 'HIRE ME',
        desc: 'Texto en pixel art para destacar en perfiles de reclutadores',
        pattern: [
          // H
          [1,1],[1,2],[1,3],[1,4],[1,5], [2,3], [3,1],[3,2],[3,3],[3,4],[3,5],
          // I
          [5,1],[6,1],[7,1], [6,2],[6,3],[6,4], [5,5],[6,5],[7,5],
          // R
          [9,1],[9,2],[9,3],[9,4],[9,5], [10,1],[11,1], [11,2], [10,3], [11,4],[11,5],
          // E
          [13,1],[13,2],[13,3],[13,4],[13,5], [14,1],[15,1], [14,3], [14,5],[15,5],
          // Espacio M
          [19,1],[19,2],[19,3],[19,4],[19,5], [20,2], [21,3], [22,2], [23,1],[23,2],[23,3],[23,4],[23,5],
          // E
          [25,1],[25,2],[25,3],[25,4],[25,5], [26,1],[27,1], [26,3], [26,5],[27,5]
        ]
      },
      code: {
        name: '&lt;CODE /&gt;',
        desc: 'Simbolo clasico de desarrollo de software',
        pattern: [
          // <
          [3,3], [4,2],[4,4], [5,1],[5,5],
          // C
          [8,1],[9,1],[10,1], [8,2],[8,3],[8,4], [8,5],[9,5],[10,5],
          // O
          [12,1],[13,1],[14,1], [12,2],[12,3],[12,4], [14,2],[14,3],[14,4], [12,5],[13,5],[14,5],
          // D
          [16,1],[16,2],[16,3],[16,4],[16,5], [17,1],[18,2],[18,3],[18,4],[17,5],
          // E
          [20,1],[20,2],[20,3],[20,4],[20,5], [21,1],[22,1], [21,3], [21,5],[22,5],
          // /
          [25,5], [26,4], [27,3], [28,2], [29,1],
          // >
          [31,1],[31,5], [32,2],[32,4], [33,3]
        ]
      },
      invader: {
        name: 'Space Invader',
        desc: 'Icono retro alienigena de 8 bits',
        pattern: [
          [10,2],[10,3],[10,4], [11,1],[11,3], [12,1],[12,2],[12,3],[12,4],[12,5],
          [13,2],[13,4], [14,1],[14,2],[14,3],[14,4],[14,5], [15,1],[15,3], [16,2],[16,3],[16,4],
          // Repetido al centro
          [24,2],[24,3],[24,4], [25,1],[25,3], [26,1],[26,2],[26,3],[26,4],[26,5],
          [27,2],[27,4], [28,1],[28,2],[28,3],[28,4],[28,5], [29,1],[29,3], [30,2],[30,3],[30,4],
          // Repetido a la derecha
          [38,2],[38,3],[38,4], [39,1],[39,3], [40,1],[40,2],[40,3],[40,4],[40,5],
          [41,2],[41,4], [42,1],[42,2],[42,3],[42,4],[42,5], [43,1],[43,3], [44,2],[44,3],[44,4]
        ]
      },
      heart: {
        name: 'Open Source Heart',
        desc: 'Corazones pixelados en cadena',
        pattern: [
          [8,2],[8,3], [9,1],[9,2],[9,3],[9,4], [10,2],[10,3],[10,4],[10,5], [11,3],[11,4],[11,5],[11,6],
          [12,2],[12,3],[12,4],[12,5], [13,1],[13,2],[13,3],[13,4], [14,2],[14,3],
          // Segundo corazon
          [24,2],[24,3], [25,1],[25,2],[25,3],[25,4], [26,2],[26,3],[26,4],[26,5], [27,3],[27,4],[27,5],[27,6],
          [28,2],[28,3],[28,4],[28,5], [29,1],[29,2],[29,3],[29,4], [30,2],[30,3]
        ]
      }
    };
  }

  /**
   * Aplica una plantilla sobre la matriz
   */
  applyTemplate(templateKey, cols = 53, rows = 7) {
    const tpl = this.templates[templateKey];
    if (!tpl) return null;

    const grid = [];
    for (let x = 0; x < cols; x++) {
      const col = [];
      for (let y = 0; y < rows; y++) {
        col.push({ x, y, level: 0, originalLevel: 0, count: 0 });
      }
      grid.push(col);
    }

    tpl.pattern.forEach(([px, py]) => {
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
   * Genera un script Bash para crear estos commits en un repo real de GitHub
   */
  generateBashScript(templateKey) {
    const tpl = this.templates[templateKey] || this.templates.hire_me;
    return `#!/usr/bin/env bash
# Generador de Commit Art en GitHub
# Repositorio destino recomendado: Un repositorio nuevo y vacio

mkdir -p git-art && cd git-art
git init
echo "# Artwork: ${tpl.name}" > README.md
git add README.md
git commit -m "init artwork"

# Fechas calculadas para la matriz de 53 semanas
YEAR=$(date +%Y)
${tpl.pattern.map(([x, y]) => `GIT_AUTHOR_DATE="$YEAR-01-01T12:00:00 +${x * 7 + y} days" GIT_COMMITTER_DATE="$YEAR-01-01T12:00:00 +${x * 7 + y} days" git commit --allow-empty -m "art pixel [${x},${y}]"`).join('\n')}

echo "Arte generado. Agrega tu remote y haz git push origin main"`;
  }
}

window.CommitArtEngine = CommitArtEngine;
