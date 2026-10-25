/**
 * Núcleo compartido por la GitHub Action (Node) y el worker del endpoint SVG (Cloudflare):
 * opciones válidas del SVG y conversión del calendario GraphQL de GitHub a la matriz 53x7 del motor.
 * Script plano (sin import/export) para cargarse igual que el resto del motor.
 */

const SnakeCore = {
  LEVELS: { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 },

  OPTION_VALUES: {
    theme: ['dark', 'light', 'cyberpunk', 'neon_cyan', 'amber_terminal'],
    speed: ['normal', 'fast', 'relaxed'],
    morph: ['matrix_viper', 'capsule', 'retro'],
    pause: ['fast', 'medium', 'none']
  },

  CALENDAR_QUERY: `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { date weekday contributionCount contributionLevel } }
      }
    }
  }
}`,

  /** Valida un query string ('theme=dark&speed=fast'); devuelve las opciones o lanza un Error legible */
  parseOptions(query, context = '') {
    const options = {};
    const where = context ? ` en '${context}'` : '';
    for (const [key, value] of new URLSearchParams(query)) {
      if (!this.OPTION_VALUES[key]) {
        throw new Error(`Opción desconocida '${key}'${where}. Válidas: ${Object.keys(this.OPTION_VALUES).join(', ')}`);
      }
      if (!this.OPTION_VALUES[key].includes(value)) {
        throw new Error(`Valor '${value}' no válido para '${key}'${where}. Válidos: ${this.OPTION_VALUES[key].join(', ')}`);
      }
      options[key] = value;
    }
    return options;
  },

  /** Semanas de GraphQL -> matriz 53x7 (la semana actual en la última columna) */
  weeksToGrid(weeks, cols = 53, rows = 7) {
    const recent = weeks.slice(-cols);
    const offset = cols - recent.length;
    const grid = [];

    for (let x = 0; x < cols; x++) {
      const column = [];
      for (let y = 0; y < rows; y++) {
        column.push({ x, y, level: 0, originalLevel: 0, count: 0, date: null });
      }
      grid.push(column);
    }

    recent.forEach((week, i) => {
      for (const day of week.contributionDays) {
        const level = this.LEVELS[day.contributionLevel] ?? 0;
        const cell = grid[offset + i][day.weekday];
        cell.level = level;
        cell.originalLevel = level;
        cell.count = day.contributionCount;
        cell.date = day.date;
      }
    });

    return grid;
  },

  /** Lee el calendario de un usuario con la API GraphQL oficial */
  async fetchCalendarWeeks(username, token, fetchImpl = fetch) {
    const res = await fetchImpl('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'github-snake'
      },
      body: JSON.stringify({ query: this.CALENDAR_QUERY, variables: { login: username } })
    });
    if (!res.ok) {
      const httpError = new Error(`GitHub GraphQL respondió ${res.status} ${res.statusText}`);
      httpError.status = res.status;
      throw httpError;
    }
    const body = await res.json();
    const errors = body.errors || [];
    // GraphQL responde 200 con un error de tipo NOT_FOUND cuando el usuario no existe
    if (errors.some(e => e.type === 'NOT_FOUND') || (!errors.length && body.data && !body.data.user)) {
      const notFound = new Error(`No existe el usuario de GitHub '${username}'`);
      notFound.code = 'NOT_FOUND';
      throw notFound;
    }
    if (errors.length || !body.data || !body.data.user) {
      throw new Error(`GitHub GraphQL: ${errors.map(e => e.message).join('; ') || 'respuesta sin datos'}`);
    }
    return body.data.user.contributionsCollection.contributionCalendar.weeks;
  }
};

window.SnakeCore = SnakeCore;
