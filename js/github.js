/**
 * GitHub Contributions Grid Fetcher & Generator
 * Procesa perfiles completos, avatares, fechas calculadas y gestiona el Ranking de Desarrolladores.
 */

class GitHubFetcher {
  constructor() {
    this.cols = 53;
    this.rows = 7;

    this.topDevelopers = [
      {
        rank: 1,
        name: 'Anthony Fu',
        username: 'antfu',
        avatar: 'https://github.com/antfu.png?size=100',
        role: 'Vue / Vite / Nuxt Core',
        roleKey: 'role_antfu',
        location: 'Tokio, Japon'
      },
      {
        rank: 2,
        name: 'Sindre Sorhus',
        username: 'sindresorhus',
        avatar: 'https://github.com/sindresorhus.png?size=100',
        role: 'Open Source Maintainer',
        roleKey: 'role_sindresorhus',
        location: 'Suecia'
      },
      {
        rank: 3,
        name: 'Evan You',
        username: 'yyx990803',
        avatar: 'https://github.com/yyx990803.png?size=100',
        role: 'Creador de Vue.js & Vite',
        roleKey: 'role_yyx990803',
        location: 'Singapur'
      },
      {
        rank: 4,
        name: 'Linus Torvalds',
        username: 'torvalds',
        avatar: 'https://github.com/torvalds.png?size=100',
        role: 'Creador de Linux & Git',
        roleKey: 'role_torvalds',
        location: 'Portland, EE.UU.'
      },
      {
        rank: 5,
        name: 'Midudev',
        username: 'midudev',
        avatar: 'https://github.com/midudev.png?size=100',
        role: 'FullStack & Open Source',
        roleKey: 'role_midudev',
        location: 'Espana'
      },
      {
        rank: 6,
        name: 'Dan Abramov',
        username: 'gaearon',
        avatar: 'https://github.com/gaearon.png?size=100',
        role: 'Creador de Redux',
        roleKey: 'role_gaearon',
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
          bio: data.bio || (matched ? matched.role : ''),
          location: data.location || '',
          repos: typeof data.public_repos === 'number' ? data.public_repos : null,
          known: true
        };
      }
    } catch (e) {}

    return {
      username: cleanUser,
      name: matched ? matched.name : cleanUser,
      avatar: `https://github.com/${cleanUser}.png?size=100`,
      bio: matched ? matched.role : '',
      location: '',
      repos: null,
      known: false
    };
  }

  computeDateForCoords(col, row) {
    const now = new Date();
    const currentDay = now.getDay();
    const daysAgo = ((52 - col) * 7) + (currentDay - row);
    const targetDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return targetDate.toISOString().split('T')[0];
  }

  async getContributions(rawInput) {
    const username = this.sanitizeUsername(rawInput);
    
    if (username === 'dense_matrix') {
      const dense = this.generateDenseGrid();
      dense.simulated = true;
      return dense;
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
          const grid = this.parseApiContributions(data.contributions);
          grid.simulated = false;
          return grid;
        }
      }
    } catch (err) {
      console.warn(`[GitHubFetcher] Usando generador simulado para '${username}':`, err.message);
    }

    const mock = this.generateRealisticMock(username);
    mock.simulated = true;
    return mock;
  }

  parseApiContributions(contributions) {
    const grid = this.createEmptyGrid();
    const recent = contributions.slice(-371);
    
    for (let i = 0; i < recent.length; i++) {
      const col = Math.floor(i / 7);
      const row = i % 7;
      if (col < this.cols && row < this.rows) {
        const item = recent[i];
        const count = item.count !== undefined ? item.count : 0;
        let level = item.level;
        if (level === undefined) {
          level = count === 0 ? 0 : (count > 10 ? 4 : count > 5 ? 3 : count > 2 ? 2 : 1);
        }

        grid[col][row] = {
          x: col,
          y: row,
          level: Math.min(4, level),
          originalLevel: Math.min(4, level),
          count: count,
          date: item.date || this.computeDateForCoords(col, row)
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
    grid.simulated = true;
    return grid;
  }
}

window.GitHubFetcher = GitHubFetcher;
