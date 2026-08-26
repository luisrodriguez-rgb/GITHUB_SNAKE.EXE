/**
 * GitHub Contributions Grid Fetcher & Generator
 * Procesa enlaces completos, nombres de usuario y gestiona el Ranking de Desarrolladores.
 */

class GitHubFetcher {
  constructor() {
    this.cols = 53;
    this.rows = 7;

    // Lista de desarrolladores destacados para el Ranking
    this.topDevelopers = [
      {
        rank: 1,
        name: 'Anthony Fu',
        username: 'antfu',
        role: 'Vue / Vite / Nuxt Core',
        commits: '5,840',
        streak: '365 dias'
      },
      {
        rank: 2,
        name: 'Sindre Sorhus',
        username: 'sindresorhus',
        role: 'Open Source Maintainer',
        commits: '4,210',
        streak: '320 dias'
      },
      {
        rank: 3,
        name: 'Evan You',
        username: 'yyx990803',
        role: 'Creador de Vue.js & Vite',
        commits: '3,450',
        streak: '280 dias'
      },
      {
        rank: 4,
        name: 'Linus Torvalds',
        username: 'torvalds',
        role: 'Creador de Linux & Git',
        commits: '3,290',
        streak: '340 dias'
      },
      {
        rank: 5,
        name: 'Midudev',
        username: 'midudev',
        role: 'FullStack & Open Source',
        commits: '3,120',
        streak: '295 dias'
      },
      {
        rank: 6,
        name: 'Dan Abramov',
        username: 'gaearon',
        role: 'Creador de Redux',
        commits: '2,890',
        streak: '210 dias'
      }
    ];
  }

  /**
   * Limpia y extrae el nombre de usuario incluso si pegan enlaces completos como https://github.com/usuario
   */
  sanitizeUsername(input) {
    if (!input) return 'torvalds';
    let clean = input.trim();
    // Eliminar protocolo y dominio (https://github.com/, http://github.com/, github.com/)
    clean = clean.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '');
    // Eliminar rutas adicionales (/repos, /tab, query params)
    clean = clean.split('/')[0].split('?')[0].split('#')[0];
    // Eliminar arroba inicial si existe
    clean = clean.replace(/^@/, '');
    return clean.toLowerCase().trim() || 'torvalds';
  }

  /**
   * Obtiene la cuadrícula de contribuciones de un usuario o enlace
   */
  async getContributions(rawInput) {
    const username = this.sanitizeUsername(rawInput);
    
    if (username === 'dense_matrix') {
      return this.generateDenseGrid();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.contributions && data.contributions.length > 0) {
          return this.parseApiContributions(data.contributions);
        }
      }
    } catch (err) {
      console.warn(`[GitHubFetcher] Usando generador simulado para '${username}':`, err.message);
    }

    return this.generateRealisticMock(username);
  }

  parseApiContributions(contributions) {
    const grid = this.createEmptyGrid();
    const recent = contributions.slice(-371);
    
    for (let i = 0; i < recent.length; i++) {
      const col = Math.floor(i / 7);
      const row = i % 7;
      if (col < this.cols && row < this.rows) {
        const item = recent[i];
        const level = Math.min(4, item.level || (item.count > 0 ? (item.count > 10 ? 4 : item.count > 5 ? 3 : item.count > 2 ? 2 : 1) : 0));
        grid[col][row] = {
          x: col,
          y: row,
          level: level,
          originalLevel: level,
          count: item.count || (level > 0 ? level * 3 : 0),
          date: item.date
        };
      }
    }

    return grid;
  }

  createEmptyGrid() {
    const grid = [];
    for (let x = 0; x < this.cols; x++) {
      const column = [];
      for (let y = 0; y < this.rows; y++) {
        column.push({
          x: x,
          y: y,
          level: 0,
          originalLevel: 0,
          count: 0
        });
      }
      grid.push(column);
    }
    return grid;
  }

  generateRealisticMock(seedString) {
    const grid = this.createEmptyGrid();
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed << 5) - seed + seedString.charCodeAt(i);
      seed |= 0;
    }

    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const activityFactor = seedString === 'antfu' ? 0.75 : seedString === 'torvalds' ? 0.55 : 0.40;

    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const rand = pseudoRandom();
        const isWeekend = (y === 0 || y === 6);
        const threshold = isWeekend ? activityFactor * 0.45 : activityFactor;

        let level = 0;
        if (rand < threshold) {
          const intensity = pseudoRandom();
          if (intensity > 0.85) level = 4;
          else if (intensity > 0.60) level = 3;
          else if (intensity > 0.35) level = 2;
          else level = 1;
        }

        grid[x][y] = {
          x: x,
          y: y,
          level: level,
          originalLevel: level,
          count: level > 0 ? Math.floor(pseudoRandom() * 8) + (level * 2) : 0
        };
      }
    }

    return grid;
  }

  generateDenseGrid() {
    const grid = this.createEmptyGrid();
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const level = ((x + y) % 5 === 0 || (x * y) % 7 === 0) ? Math.floor(Math.random() * 4) + 1 : 0;
        grid[x][y] = {
          x: x,
          y: y,
          level: level,
          originalLevel: level,
          count: level * 3
        };
      }
    }
    return grid;
  }

  generateRandomGrid() {
    const grid = this.createEmptyGrid();
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const rand = Math.random();
        let level = 0;
        if (rand > 0.60) {
          level = Math.floor(Math.random() * 4) + 1;
        }
        grid[x][y] = {
          x: x,
          y: y,
          level: level,
          originalLevel: level,
          count: level > 0 ? Math.floor(Math.random() * 12) + 1 : 0
        };
      }
    }
    return grid;
  }
}

window.GitHubFetcher = GitHubFetcher;
