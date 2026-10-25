/**
 * GitHub Contributions Grid Fetcher & Generator
 * Procesa perfiles completos, avatares, fechas calculadas y gestiona el Ranking de Desarrolladores.
 */

class GitHubFetcher {
  constructor() {
    this.cols = 53;
    this.rows = 7;
    // 'api' | 'mock': origen de la última matriz cargada, para avisar en la UI cuando es simulada
    this.lastSource = 'mock';

    this.topDevelopers = [
      {
        rank: 1,
        name: 'Anthony Fu',
        username: 'antfu',
        avatar: 'https://github.com/antfu.png?size=100',
        role: 'Vue / Vite / Nuxt Core',
        location: 'Tokio, Japon'
      },
      {
        rank: 2,
        name: 'Sindre Sorhus',
        username: 'sindresorhus',
        avatar: 'https://github.com/sindresorhus.png?size=100',
        role: 'Open Source Maintainer',
        location: 'Suecia'
      },
      {
        rank: 3,
        name: 'Evan You',
        username: 'yyx990803',
        avatar: 'https://github.com/yyx990803.png?size=100',
        role: 'Creador de Vue.js & Vite',
        location: 'Singapur'
      },
      {
        rank: 4,
        name: 'Linus Torvalds',
        username: 'torvalds',
        avatar: 'https://github.com/torvalds.png?size=100',
        role: 'Creador de Linux & Git',
        location: 'Portland, EE.UU.'
      },
      {
        rank: 5,
        name: 'Midudev',
        username: 'midudev',
        avatar: 'https://github.com/midudev.png?size=100',
        role: 'FullStack & Open Source',
        location: 'Espana'
      },
      {
        rank: 6,
        name: 'Dan Abramov',
        username: 'gaearon',
        avatar: 'https://github.com/gaearon.png?size=100',
        role: 'Creador de Redux',
        location: 'Londres, Reino Unido'
      }
    ];
  }

  sanitizeUsername(input) {
    if (!input) return 'torvalds';
    let clean = input.trim();
    clean = clean.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '');
    clean = clean.split('/')[0].split('?')[0].split('#')[0];
    clean = clean.replace(/^@/, '');
    return clean.toLowerCase().trim() || 'torvalds';
  }

  async getUserProfile(username) {
    const cleanUser = this.sanitizeUsername(username);
    const matched = this.topDevelopers.find(d => d.username === cleanUser);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://api.github.com/users/${cleanUser}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          username: data.login,
          name: data.name || data.login,
          avatar: data.avatar_url || `https://github.com/${cleanUser}.png?size=100`,
          bio: data.bio || (matched ? matched.role : 'Desarrollador de software'),
          location: data.location || (matched ? matched.location : 'En la red'),
          repos: data.public_repos || 0,
          followers: data.followers || 0
        };
      }
    } catch (e) {}

    return {
      username: cleanUser,
      name: matched ? matched.name : cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
      avatar: `https://github.com/${cleanUser}.png?size=100`,
      bio: matched ? matched.role : 'Desarrollador en GitHub',
      location: matched ? matched.location : 'Comunidad Global',
      repos: null,
      followers: null,
      isFallback: true
    };
  }

  computeDateForCoords(col, row) {
    return ContributionCalendar.isoForCell(col, row);
  }

  async getContributions(rawInput) {
    const username = this.sanitizeUsername(rawInput);
    
    this.lastSource = 'mock';
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
          this.lastSource = 'api';
          return this.parseApiContributions(data.contributions);
        }
      }
    } catch (err) {
      console.warn(`[GitHubFetcher] Usando generador simulado para '${username}':`, err.message);
    }

    return this.generateRealisticMock(username);
  }

  parseApiContributions(contributions) {
    // Se ubica cada día por su fecha: la API no garantiza que el primer elemento sea domingo
    const byDate = new Map(contributions.map(item => [item.date, item]));
    const grid = this.createEmptyGrid();

    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        const cell = grid[col][row];
        const item = byDate.get(cell.date);
        if (!item) continue;

        const count = item.count !== undefined ? item.count : 0;
        let level = item.level;
        if (level === undefined) {
          level = count === 0 ? 0 : (count > 10 ? 4 : count > 5 ? 3 : count > 2 ? 2 : 1);
        }

        cell.level = Math.min(4, level);
        cell.originalLevel = cell.level;
        cell.count = count;
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
          count: 0,
          date: this.computeDateForCoords(x, y)
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
    // Un hash negativo hacía que el generador devolviera siempre valores negativos (todo nivel 1)
    seed = Math.abs(seed) % 233280;

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
        let count = 0;
        if (rand < threshold) {
          const intensity = pseudoRandom();
          if (intensity > 0.85) { level = 4; count = Math.floor(pseudoRandom() * 10) + 12; }
          else if (intensity > 0.60) { level = 3; count = Math.floor(pseudoRandom() * 5) + 6; }
          else if (intensity > 0.35) { level = 2; count = Math.floor(pseudoRandom() * 3) + 3; }
          else { level = 1; count = Math.floor(pseudoRandom() * 2) + 1; }
        }

        grid[x][y] = {
          x: x,
          y: y,
          level: level,
          originalLevel: level,
          count: count,
          date: this.computeDateForCoords(x, y)
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
        const count = level > 0 ? level * 4 : 0;
        grid[x][y] = {
          x: x,
          y: y,
          level: level,
          originalLevel: level,
          count: count,
          date: this.computeDateForCoords(x, y)
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
        let count = 0;
        if (rand > 0.60) {
          level = Math.floor(Math.random() * 4) + 1;
          count = Math.floor(Math.random() * 12) + 1;
        }
        grid[x][y] = {
          x: x,
          y: y,
          level: level,
          originalLevel: level,
          count: count,
          date: this.computeDateForCoords(x, y)
        };
      }
    }
    return grid;
  }
}

window.GitHubFetcher = GitHubFetcher;
