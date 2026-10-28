/**
 * Frame PNG de un usuario a mitad de partida, para la tarjeta de X.
 * Sin canvas nativo: rectangulos + fuente bitmap + PNG zlib.
 */

const COLS = 53;
const ROWS = 7;
const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  bg: [4, 8, 6],
  empty: [10, 20, 14],
  levels: [
    [10, 20, 14],
    [7, 56, 27],
    [9, 104, 49],
    [0, 179, 77],
    [0, 255, 102]
  ],
  head: [255, 255, 255],
  body: [0, 255, 102],
  text: [0, 255, 102],
  muted: [180, 196, 186],
  warn: [252, 238, 10]
};

const FONT = {
  A: ['01110', '10001', '11111', '10001', '10001'],
  B: ['11110', '10001', '11110', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  F: ['11111', '10000', '11110', '10000', '10000'],
  G: ['01111', '10000', '10111', '10001', '01111'],
  H: ['10001', '10001', '11111', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '11100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001'],
  O: ['01110', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '11110', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10011', '01111'],
  R: ['11110', '10001', '11110', '10010', '10001'],
  S: ['01111', '10000', '01110', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10101', '11011', '10001'],
  X: ['10001', '01010', '00100', '01010', '10001'],
  Y: ['10001', '01010', '00100', '00100', '00100'],
  Z: ['11111', '00010', '00100', '01000', '11111'],
  '0': ['01110', '10011', '10101', '11001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00110', '01000', '11111'],
  '3': ['11110', '00001', '01110', '00001', '11110'],
  '4': ['10010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '11110'],
  '6': ['01110', '10000', '11110', '10001', '01110'],
  '7': ['11111', '00010', '00100', '01000', '01000'],
  '8': ['01110', '10001', '01110', '10001', '01110'],
  '9': ['01110', '10001', '01111', '00001', '01110'],
  '@': ['01110', '10001', '10111', '10000', '01111'],
  '.': ['00000', '00000', '00000', '01100', '01100'],
  '-': ['00000', '00000', '11111', '00000', '00000'],
  '_': ['00000', '00000', '00000', '00000', '11111'],
  ' ': ['00000', '00000', '00000', '00000', '00000']
};

function emptyLevels() {
  return Array.from({ length: COLS }, () => Array(ROWS).fill(0));
}

export function parseContributionLevels(contributions) {
  const levels = emptyLevels();
  const recent = (contributions || []).slice(-371);
  for (let i = 0; i < recent.length; i++) {
    const col = Math.floor(i / 7);
    const row = i % 7;
    if (col >= COLS || row >= ROWS) continue;
    const item = recent[i];
    const count = item.count || 0;
    let level = item.level;
    if (level === undefined) {
      level = count === 0 ? 0 : (count > 10 ? 4 : count > 5 ? 3 : count > 2 ? 2 : 1);
    }
    levels[col][row] = Math.min(4, level);
  }
  return levels;
}

export function midBiteFrame(levels) {
  const grid = levels.map(col => col.slice());
  let snake = [
    { x: 0, y: 3 },
    { x: 0, y: 3 },
    { x: 0, y: 3 },
    { x: 0, y: 3 }
  ];
  const dirs = [[1, 0], [0, 1], [0, -1], [-1, 0]];
  for (let step = 0; step < 40; step++) {
    const head = snake[0];
    let best = null;
    let bestScore = Infinity;
    for (const [dx, dy] of dirs) {
      const x = (head.x + dx + COLS) % COLS;
      const y = (head.y + dy + ROWS) % ROWS;
      if (snake.slice(0, -1).some(seg => seg.x === x && seg.y === y)) continue;
      const level = grid[x][y];
      const score = level > 0 ? -level * 100 + Math.abs(x - head.x) : (dx === 1 ? 2 : 8);
      if (score < bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
    if (!best) break;
    if (grid[best.x][best.y] > 0) grid[best.x][best.y] -= 1;
    snake = [best, ...snake.slice(0, -1)];
  }
  return { levels: grid, snake };
}

function fillRect(rgb, x, y, w, h, color) {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(WIDTH, x + w);
  const y1 = Math.min(HEIGHT, y + h);
  for (let py = y0; py < y1; py++) {
    const row = py * WIDTH * 3;
    for (let px = x0; px < x1; px++) {
      const i = row + px * 3;
      rgb[i] = color[0];
      rgb[i + 1] = color[1];
      rgb[i + 2] = color[2];
    }
  }
}

function drawText(rgb, text, x, y, scale, color) {
  let cursor = x;
  const chars = String(text).toUpperCase();
  for (const ch of chars) {
    const glyph = FONT[ch] || FONT[' '];
    for (let gy = 0; gy < glyph.length; gy++) {
      for (let gx = 0; gx < glyph[gy].length; gx++) {
        if (glyph[gy][gx] === '1') {
          fillRect(rgb, cursor + gx * scale, y + gy * scale, scale, scale, color);
        }
      }
    }
    cursor += 6 * scale;
  }
  return cursor;
}

export function renderFrameRgb(username, levels, snake, simulated) {
  const rgb = new Uint8Array(WIDTH * HEIGHT * 3);
  fillRect(rgb, 0, 0, WIDTH, HEIGHT, COLORS.bg);

  const step = 18;
  const cell = 14;
  const gridW = COLS * step - (step - cell);
  const originX = Math.round((WIDTH - gridW) / 2);
  const originY = 150;

  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      const level = levels[x][y] || 0;
      fillRect(rgb, originX + x * step, originY + y * step, cell, cell, COLORS.levels[level] || COLORS.empty);
    }
  }

  snake.forEach((seg, index) => {
    const color = index === 0 ? COLORS.head : COLORS.body;
    const inset = index === 0 ? 0 : 2;
    fillRect(
      rgb,
      originX + seg.x * step + inset,
      originY + seg.y * step + inset,
      cell - inset * 2,
      cell - inset * 2,
      color
    );
  });

  const label = `@${username}`.slice(0, 22);
  const labelWidth = label.length * 6 * 6;
  drawText(rgb, label, Math.round((WIDTH - labelWidth) / 2), 48, 6, COLORS.text);
  const brand = 'GITHUB_SNAKE.EXE';
  const brandWidth = brand.length * 6 * 3;
  drawText(rgb, brand, Math.round((WIDTH - brandWidth) / 2), 340, 3, COLORS.muted);
  const line = simulated ? 'SIMULATED GRAPH' : 'THE GRAPH IS THE LEVEL';
  const lineWidth = line.length * 6 * 4;
  drawText(rgb, line, Math.round((WIDTH - lineWidth) / 2), 420, 4, simulated ? COLORS.warn : COLORS.text);
  return rgb;
}

function crcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = crcTable();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out[4] = type.charCodeAt(0);
  out[5] = type.charCodeAt(1);
  out[6] = type.charCodeAt(2);
  out[7] = type.charCodeAt(3);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

function adler32(bytes) {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

async function zlibWrap(raw) {
  const stream = new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  const deflated = new Uint8Array(await new Response(stream).arrayBuffer());
  const out = new Uint8Array(2 + deflated.length + 4);
  out[0] = 0x78;
  out[1] = 0x01;
  out.set(deflated, 2);
  const sum = adler32(raw);
  out[out.length - 4] = (sum >>> 24) & 0xff;
  out[out.length - 3] = (sum >>> 16) & 0xff;
  out[out.length - 2] = (sum >>> 8) & 0xff;
  out[out.length - 1] = sum & 0xff;
  return out;
}

export async function encodePng(rgb) {
  const raw = new Uint8Array((WIDTH * 3 + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    const dest = y * (WIDTH * 3 + 1);
    raw[dest] = 0;
    raw.set(rgb.subarray(y * WIDTH * 3, (y + 1) * WIDTH * 3), dest + 1);
  }
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, WIDTH);
  view.setUint32(4, HEIGHT);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const idat = await zlibWrap(raw);
  const signature = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', new Uint8Array())];
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const png = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    png.set(part, offset);
    offset += part.length;
  }
  return png;
}

export async function fetchUserFrame(username) {
  const user = String(username || '').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'torvalds';
  let levels = null;
  let simulated = false;
  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`);
    if (response.ok) {
      const data = await response.json();
      if (data.contributions && data.contributions.length > 0) {
        levels = parseContributionLevels(data.contributions);
      }
    }
  } catch (err) {
    simulated = true;
  }
  if (!levels) {
    simulated = true;
    levels = emptyLevels();
  }
  const frame = midBiteFrame(levels);
  return { user, simulated, ...frame };
}

export async function buildOgPng(username) {
  const frame = await fetchUserFrame(username);
  const rgb = renderFrameRgb(frame.user, frame.levels, frame.snake, frame.simulated);
  return encodePng(rgb);
}
