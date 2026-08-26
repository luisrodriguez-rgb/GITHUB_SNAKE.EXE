/**
 * GitHub Contributions Grid Fetcher & Generator
 * Procesa o simula la matriz de 53 semanas x 7 días de contribuciones de GitHub.
 */

class GitHubFetcher {
  constructor() {
    this.cols = 53;
    this.rows = 7;
  }

  /**
   * Obtiene la cuadrícula de contribuciones de un usuario
   * @param {string} username - Nombre de usuario de GitHub
   * @returns {Promise<Array<Array<Object>>>} Matriz 53x7 de celdas
   */
  async getContributions(username) {
    const cleanUser = username.trim().toLowerCase();
    
    // Perfiles predefinidos de prueba instantáneos (100% offline o fallback)
    if (cleanUser === 'dense_matrix') {
      return this.generateDenseGrid();
    }

    try {
      // Intentar consultar una API pública de contribuciones de GitHub
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${cleanUser}?y=last`, {
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
      console.warn(`[GitHubFetcher] Usando generador simulado para '${cleanUser}' debido a:`, err.message);
    }

    // Si falla o no hay conexión, generar un mapa determinista realista basado en el nombre de usuario
    return this.generateRealisticMock(cleanUser);
  }

  /**
   * Parsea la respuesta de la API a una matriz 53x7
   */
  parseApiContributions(contributions) {
    const grid = this.createEmptyGrid();
    
    // Tomar los últimos 371 días (53 semanas * 7)
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

  /**
   * Crea una cuadrícula vacía de 53 columnas x 7 filas
   */
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

  /**
   * Generador determinista realista basado en un hash del username
   */
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

    // Probabilidad de actividad según el perfil
    const activityFactor = seedString === 'torvalds' ? 0.45 : seedString === 'antfu' ? 0.75 : 0.35;

    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const rand = pseudoRandom();
        // Los fines de semana (y === 0 o y === 6) suelen tener menos commits
        const isWeekend = (y === 0 || y === 6);
        const threshold = isWeekend ? activityFactor * 0.4 : activityFactor;

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

  /**
   * Generador de matriz densa para pruebas intensivas de pathfinding
   */
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

  /**
   * Generador totalmente aleatorio
   */
  generateRandomGrid() {
    const grid = this.createEmptyGrid();
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const rand = Math.random();
        let level = 0;
        if (rand > 0.65) {
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

// Exportar global para el navegador
window.GitHubFetcher = GitHubFetcher;
