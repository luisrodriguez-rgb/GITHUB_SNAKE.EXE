/**
 * Pathfinding & Snake Navigation Engine
 * Implementa BFS con evasión de colisiones dinámicas y heurística de seguridad (Flood Fill).
 *
 * Las celdas se identifican con un índice numérico (x * rows + y) y las búsquedas reutilizan arrays tipados:
 * con claves de texto ("x,y") y Sets, la simulación del SVG era el 95% del coste de generarlo.
 * Las decisiones son idénticas a las de la versión anterior (mismo orden de objetivos, de vecinos y de desempates),
 * así que un mismo duelo o SVG sigue dando el mismo resultado.
 */

class SnakePathfinder {
  constructor(cols = 53, rows = 7) {
    this.cols = cols;
    this.rows = rows;
    const size = cols * rows;
    this.blocked = new Uint8Array(size);
    this.visitMark = new Uint32Array(size);
    this.visitStamp = 0;
    this.parent = new Int32Array(size);
    this.queue = new Int32Array(size);
    // Vecinos en el orden original: arriba, abajo, izquierda, derecha
    this.bfsDirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    // Patrullaje: derecha (flujo natural en GitHub), abajo, izquierda, arriba
    this.wanderDirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  }

  /**
   * Encuentra el siguiente movimiento óptimo para la serpiente
   * @param {Object} snake - Instancia de la serpiente
   * @param {Array<Array<Object>>} grid - Matriz de celdas
   * @returns {{x: number, y: number}|null} Siguiente coordenada a la cual moverse
   */
  findNextStep(snake, grid) {
    const head = snake.head;
    this.markObstacles(snake);
    const best = this.selectBestTargets(head, grid);

    // Si ya no quedan commits verdes, patrullar de forma segura
    if (best.length === 0) {
      return this.findSafeWanderStep(snake);
    }

    // Probar caminos con BFS a los mejores objetivos
    for (const cell of best) {
      const step = this.firstStepTowards(head, { x: Math.floor(cell / this.rows), y: cell % this.rows });
      // Verificar que el movimiento no encierra a la serpiente (Lookahead)
      if (step && this.isStepSafe(step, snake)) {
        return step;
      }
    }

    // Si ninguna ruta a los objetivos es 100% segura, tomar el movimiento de escape más amplio
    return this.findSafeWanderStep(snake);
  }

  /** Cuerpo de la serpiente como obstáculo, excluyendo la punta de la cola que se moverá en este paso */
  markObstacles(snake) {
    this.blocked.fill(0);
    for (let i = 0; i < snake.body.length - 1; i++) {
      const seg = snake.body[i];
      this.blocked[seg.x * this.rows + seg.y] = 1;
    }
  }

  /**
   * Los 10 mejores objetivos: menor distancia Manhattan; a igualdad, mayor nivel; a igualdad, orden de recorrido
   * (columna a columna). Es el mismo orden que ordenar todas las celdas con un sort estable, pero recorriendo anillos
   * de distancia creciente alrededor de la cabeza y parando en cuanto ningún anillo posterior puede mejorar el top.
   */
  selectBestTargets(head, grid, limit = 10) {
    const { cols, rows } = this;
    const cellCount = cols * rows;
    const keys = [];
    const maxDist = cols + rows;

    const consider = (x, y, d) => {
      const level = grid[x][y].level;
      if (level <= 0) return;
      // Clave única que codifica (distancia, nivel descendente, orden de recorrido)
      const key = (d * 5 + (4 - Math.min(4, level))) * cellCount + (x * rows + y);
      if (keys.length === limit && key >= keys[limit - 1]) return;
      let i = keys.length < limit ? keys.length : limit - 1;
      while (i > 0 && keys[i - 1] > key) {
        keys[i] = keys[i - 1];
        i--;
      }
      keys[i] = key;
    };

    for (let d = 0; d <= maxDist; d++) {
      // En un tablero de 7 filas solo las columnas con |dx| >= d - (rows - 1) tienen celdas a distancia exacta d
      const minAbsDx = Math.max(0, d - (rows - 1));
      for (let dx = -d; dx <= d; dx++) {
        if (Math.abs(dx) < minAbsDx) {
          dx = minAbsDx - 1; // salta al tramo positivo
          continue;
        }
        const x = head.x + dx;
        if (x < 0 || x >= cols) continue;
        const rest = d - Math.abs(dx);
        if (head.y - rest >= 0) consider(x, head.y - rest, d);
        if (rest > 0 && head.y + rest < rows) consider(x, head.y + rest, d);
      }
      // Los anillos siguientes tienen distancia > d: ya no pueden entrar en un top completo
      if (keys.length === limit) break;
    }
    return keys.map(key => key % cellCount);
  }

  nextVisitStamp() {
    this.visitStamp++;
    if (this.visitStamp === 0xffffffff) {
      this.visitMark.fill(0);
      this.visitStamp = 1;
    }
    return this.visitStamp;
  }

  /**
   * BFS desde la cabeza hasta la meta evitando el cuerpo. Devuelve la primera casilla del camino más corto
   * (la misma que path[1] en la versión con reconstrucción completa), o null si no hay camino.
   */
  firstStepTowards(start, goal) {
    const rows = this.rows;
    const startIdx = start.x * rows + start.y;
    const goalIdx = goal.x * rows + goal.y;
    if (startIdx === goalIdx) return null;

    const stamp = this.nextVisitStamp();
    const { visitMark, parent, queue, blocked } = this;
    visitMark[startIdx] = stamp;
    parent[startIdx] = -1;
    let head = 0;
    let tail = 0;
    queue[tail++] = startIdx;

    while (head < tail) {
      const current = queue[head++];
      if (current === goalIdx) {
        let node = current;
        while (parent[node] !== startIdx) node = parent[node];
        return { x: Math.floor(node / rows), y: node % rows };
      }
      const cx = Math.floor(current / rows);
      const cy = current % rows;
      for (const [dx, dy] of this.bfsDirs) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || nx >= this.cols || ny < 0 || ny >= rows) continue;
        const n = nx * rows + ny;
        if (blocked[n] || visitMark[n] === stamp) continue;
        visitMark[n] = stamp;
        parent[n] = current;
        queue[tail++] = n;
      }
    }

    return null; // No hay ruta disponible
  }

  /**
   * Comprueba si una casilla deja suficiente espacio libre para no asfixiar a la serpiente
   */
  isStepSafe(nextStep, snake) {
    const reachableCount = this.floodFillCount(nextStep);
    return reachableCount >= Math.min(snake.body.length + 2, 20);
  }

  /**
   * Conteo de casillas libres conectadas mediante Flood Fill (tope de 30: basta para decidir)
   */
  floodFillCount(start) {
    const rows = this.rows;
    const stamp = this.nextVisitStamp();
    const { visitMark, queue, blocked } = this;
    const startIdx = start.x * rows + start.y;
    visitMark[startIdx] = stamp;
    let head = 0;
    let tail = 0;
    queue[tail++] = startIdx;
    let count = 0;

    while (head < tail && count < 30) {
      const current = queue[head++];
      count++;
      const cx = Math.floor(current / rows);
      const cy = current % rows;
      for (const [dx, dy] of this.bfsDirs) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || nx >= this.cols || ny < 0 || ny >= rows) continue;
        const n = nx * rows + ny;
        if (blocked[n] || visitMark[n] === stamp) continue;
        visitMark[n] = stamp;
        queue[tail++] = n;
      }
    }

    return count;
  }

  /**
   * Movimiento de evasión/patrullaje seguro cuando no hay objetivos o rutas directas
   */
  findSafeWanderStep(snake) {
    const head = snake.head;
    let bestStep = null;
    let maxFreeSpace = -1;

    for (const [dx, dy] of this.wanderDirs) {
      const nx = head.x + dx;
      const ny = head.y + dy;
      if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) continue;
      if (this.blocked[nx * this.rows + ny]) continue;
      const space = this.floodFillCount({ x: nx, y: ny });
      if (space > maxFreeSpace) {
        maxFreeSpace = space;
        bestStep = { x: nx, y: ny };
      }
    }

    return bestStep;
  }
}

window.SnakePathfinder = SnakePathfinder;
