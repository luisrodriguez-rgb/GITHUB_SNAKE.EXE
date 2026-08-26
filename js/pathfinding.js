/**
 * Pathfinding & Snake Navigation Engine
 * Implementa BFS con evasión de colisiones dinámicas y heurística de seguridad (Flood Fill).
 */

class SnakePathfinder {
  constructor(cols = 53, rows = 7) {
    this.cols = cols;
    this.rows = rows;
  }

  /**
   * Encuentra el siguiente movimiento óptimo para la serpiente
   * @param {Object} snake - Instancia de la serpiente
   * @param {Array<Array<Object>>} grid - Matriz de celdas
   * @returns {{x: number, y: number}|null} Siguiente coordenada a la cual moverse
   */
  findNextStep(snake, grid) {
    const head = snake.head;
    const targets = this.getAvailableTargets(grid);

    // Si ya no quedan commits verdes, patrullar de forma segura
    if (targets.length === 0) {
      return this.findSafeWanderStep(snake);
    }

    // Ordenar objetivos por distancia Manhattan ponderada
    targets.sort((a, b) => {
      const distA = Math.abs(head.x - a.x) + Math.abs(head.y - a.y);
      const distB = Math.abs(head.x - b.x) + Math.abs(head.y - b.y);
      // Preferir celdas más cercanas, y a igualdad de distancia, mayor nivel de commit
      return distA !== distB ? distA - distB : b.level - a.level;
    });

    // Probar caminos con BFS a los mejores objetivos
    for (const target of targets.slice(0, 10)) {
      const path = this.findBfsPath(head, target, snake);
      if (path && path.length > 1) {
        // Verificar si el movimiento no encierra a la serpiente (Lookahead)
        if (this.isStepSafe(path[1], snake)) {
          return path[1];
        }
      }
    }

    // Si ninguna ruta a los objetivos es 100% segura, tomar el movimiento de escape más amplio
    return this.findSafeWanderStep(snake);
  }

  /**
   * Obtiene todas las celdas que contienen commits pendientes
   */
  getAvailableTargets(grid) {
    const targets = [];
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        if (grid[x][y].level > 0) {
          targets.push(grid[x][y]);
        }
      }
    }
    return targets;
  }

  /**
   * Algoritmo BFS para encontrar la ruta más corta evitando el cuerpo de la serpiente
   */
  findBfsPath(start, goal, snake) {
    const queue = [start];
    const visited = new Set();
    const parentMap = new Map();

    const startKey = `${start.x},${start.y}`;
    visited.add(startKey);

    // Crear mapa de obstáculos con el cuerpo de la serpiente (excluyendo la punta de la cola que se moverá)
    const obstacles = new Set();
    for (let i = 0; i < snake.body.length - 1; i++) {
      const seg = snake.body[i];
      obstacles.add(`${seg.x},${seg.y}`);
    }

    const directions = [
      { x: 0, y: -1 }, // Arriba
      { x: 0, y: 1 },  // Abajo
      { x: -1, y: 0 }, // Izquierda
      { x: 1, y: 0 }   // Derecha
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      const currentKey = `${current.x},${current.y}`;

      if (current.x === goal.x && current.y === goal.y) {
        // Reconstruir camino
        const path = [];
        let curr = currentKey;
        while (curr) {
          const [cx, cy] = curr.split(',').map(Number);
          path.unshift({ x: cx, y: cy });
          curr = parentMap.get(curr);
        }
        return path;
      }

      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        const neighborKey = `${nx},${ny}`;

        // Validar límites del tablero
        if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
          // Validar que no sea obstáculo ni haya sido visitado
          if (!obstacles.has(neighborKey) && !visited.has(neighborKey)) {
            visited.add(neighborKey);
            parentMap.set(neighborKey, currentKey);
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }

    return null; // No hay ruta disponible
  }

  /**
   * Comprueba si una casilla deja suficiente espacio libre para no asfixiar a la serpiente
   */
  isStepSafe(nextStep, snake) {
    const reachableCount = this.floodFillCount(nextStep, snake);
    return reachableCount >= Math.min(snake.body.length + 2, 20);
  }

  /**
   * Conteo de casillas libres conectadas mediante Flood Fill
   */
  floodFillCount(start, snake) {
    const queue = [start];
    const visited = new Set();
    const obstacles = new Set();

    for (let i = 0; i < snake.body.length - 1; i++) {
      const seg = snake.body[i];
      obstacles.add(`${seg.x},${seg.y}`);
    }

    const startKey = `${start.x},${start.y}`;
    visited.add(startKey);
    let count = 0;

    const directions = [
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: -1, y: 0 }, { x: 1, y: 0 }
    ];

    while (queue.length > 0 && count < 30) {
      const current = queue.shift();
      count++;

      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        const nKey = `${nx},${ny}`;

        if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
          if (!obstacles.has(nKey) && !visited.has(nKey)) {
            visited.add(nKey);
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }

    return count;
  }

  /**
   * Movimiento de evasión/patrullaje seguro cuando no hay objetivos o rutas directas
   */
  findSafeWanderStep(snake) {
    const head = snake.head;
    const directions = [
      { x: 1, y: 0 },  // Derecha (flujo natural en GitHub)
      { x: 0, y: 1 },  // Abajo
      { x: -1, y: 0 }, // Izquierda
      { x: 0, y: -1 }  // Arriba
    ];

    const obstacles = new Set();
    for (let i = 0; i < snake.body.length - 1; i++) {
      const seg = snake.body[i];
      obstacles.add(`${seg.x},${seg.y}`);
    }

    let bestStep = null;
    let maxFreeSpace = -1;

    for (const dir of directions) {
      const nx = head.x + dir.x;
      const ny = head.y + dir.y;
      const nKey = `${nx},${ny}`;

      if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
        if (!obstacles.has(nKey)) {
          const space = this.floodFillCount({ x: nx, y: ny }, snake);
          if (space > maxFreeSpace) {
            maxFreeSpace = space;
            bestStep = { x: nx, y: ny };
          }
        }
      }
    }

    return bestStep;
  }
}

window.SnakePathfinder = SnakePathfinder;
