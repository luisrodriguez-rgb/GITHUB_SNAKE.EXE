# Especificacion Tecnica: GITHUB_SNAKE.EXE

Documento de referencia tecnica sobre la arquitectura, la logica de algoritmos y el motor de renderizado de la serpiente de contribuciones.

---

## 1. Modelo de Datos de la Matriz

El mapa de contribuciones de GitHub se modela como una matriz bidimensional:
- Columnas: 53 semanas (eje X: 0 a 52).
- Filas: 7 dias de la semana (eje Y: 0 a 6, donde 0 es Domingo y 6 es Sabado).
- Cada celda contiene:
  ```json
  {
    "x": 14,
    "y": 3,
    "level": 3,
    "originalLevel": 3,
    "count": 8,
    "date": "2026-04-15"
  }
  ```

---

## 2. Motores Logicos

### A. Pathfinding Autonomo (BFS con Lookahead)
Ubicado en `js/pathfinding.js`:
1. **Recoleccion de Objetivos**: Filtra todas las celdas donde `level > 0`.
2. **Priorizacion por Distancia**: Ordena los objetivos por distancia Manhattan ponderada:
   `distancia = |x_cabeza - x_meta| + |y_cabeza - y_meta|`
3. **Busqueda en Anchura (BFS)**:
   - Se mantiene un conjunto de obstaculos con las posiciones actuales del cuerpo de la serpiente (excluyendo la punta de la cola que avanzara en el proximo turno).
   - Se expanden los nodos vecinos en las cuatro direcciones cardinales respetando los limites de la matriz (53x7).
4. **Verificacion de Seguridad (Flood Fill Lookahead)**:
   - Se evalua el area conectada restante desde la casilla destino. Si es menor a la longitud de la serpiente + 2, la ruta se descarta.
5. **Modo Patrullaje**: Si no quedan objetivos, realiza un barrido por las casillas con mayor espacio libre.

### B. Modo Jugable Manual
Ubicado en `js/app.js`:
- Escucha eventos de teclado (`WASD` y teclas de direccion).
- Protege contra cambios de sentido inversos inmediatos (no permite girar 180 grados sobre el cuello).
- Aplica teletransportacion toroidal en los bordes de la matriz (53x7).

---

## 3. Renderizado Sub-Pixel, Ondas y Efectos

- **Interpolacion LERP Continua**:
  ```javascript
  const tickInterval = 1000 / ticksPerSecond;
  const elapsed = performance.now() - lastTickTime;
  const progress = Math.min(1.0, elapsed / tickInterval);

  const renderX = prevCoord.x + (currCoord.x - prevCoord.x) * progress;
  const renderY = prevCoord.y + (currCoord.y - prevCoord.y) * progress;
  ```
- **Ondas Expansivas (Shockwaves)**: Al devorar celdas de nivel 3 o 4, se anade un objeto a la cola de ondas que expande un anillo con desvanecimiento alfa.
- **Particulas Cuanticas y Digitos Binarios**: Flotan en el eje Y negativo con decaimiento temporal individual.

---

## 4. Sintesis de Audio y Exportacion

- **Web Audio API (`js/audio.js`)**: Modulacion de frecuencia y envolventes de ganancia exponencial mediante osciladores nativos.
- **Exportador SVG (`js/exporter.js`)**: Generacion de documentos XML/SVG vectoriales con estilos CSS embebidos y keyframes para su insercion en README.md.
- **Generador de Workflows**: Plantillas YAML con acciones de GitHub para programar la ejecucion diaria automatica del scraper.
