/**
 * GIF89a de paleta fija (64 colores). Suficiente para el tablero y el nombre.
 */
class GifEncoder {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.frames = [];
  }

  addFrame(imageData, delayCs) {
    const pixels = imageData.data;
    const indices = new Uint8Array(this.width * this.height);
    for (let i = 0, p = 0; i < indices.length; i++, p += 4) {
      const r = pixels[p] >> 6;
      const g = pixels[p + 1] >> 6;
      const b = pixels[p + 2] >> 6;
      indices[i] = (r << 4) | (g << 2) | b;
    }
    this.frames.push({ indices, delay: Math.max(1, delayCs || 10) });
  }

  encode() {
    const bytes = [];
    const push = (...vals) => vals.forEach((v) => bytes.push(v & 255));
    const pushStr = (s) => { for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i)); };
    const le = (n) => { bytes.push(n & 255, (n >> 8) & 255); };

    pushStr('GIF89a');
    le(this.width);
    le(this.height);
    push(0xF5, 0, 0);
    for (let i = 0; i < 64; i++) {
      push(((i >> 4) & 3) * 85, ((i >> 2) & 3) * 85, (i & 3) * 85);
    }
    push(0x21, 0xFF, 11);
    pushStr('NETSCAPE2.0');
    push(3, 1, 0, 0, 0);

    for (const frame of this.frames) {
      push(0x21, 0xF9, 4, 0, frame.delay & 255, (frame.delay >> 8) & 255, 0, 0);
      push(0x2C);
      le(0); le(0); le(this.width); le(this.height);
      push(0);
      const lzw = lzwEncode(frame.indices, 6);
      bytes.push(6);
      for (let i = 0; i < lzw.length; i += 255) {
        const size = Math.min(255, lzw.length - i);
        bytes.push(size);
        for (let j = 0; j < size; j++) bytes.push(lzw[i + j]);
      }
      bytes.push(0);
    }
    bytes.push(0x3B);
    return new Uint8Array(bytes);
  }
}

function lzwEncode(indices, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const dict = new Map();
  const out = [];
  let bitBuf = 0;
  let bitCount = 0;

  function writeBits(code, size) {
    bitBuf |= code << bitCount;
    bitCount += size;
    while (bitCount >= 8) {
      out.push(bitBuf & 255);
      bitBuf >>= 8;
      bitCount -= 8;
    }
  }

  function resetDict() {
    dict.clear();
    codeSize = minCodeSize + 1;
    nextCode = eoiCode + 1;
  }

  writeBits(clearCode, codeSize);
  if (!indices.length) {
    writeBits(eoiCode, codeSize);
    if (bitCount) out.push(bitBuf & 255);
    return out;
  }

  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const suffix = indices[i];
    const key = prefix + ',' + suffix;
    if (dict.has(key)) {
      prefix = dict.get(key);
      continue;
    }
    writeBits(prefix, codeSize);
    if (nextCode < 4096) {
      dict.set(key, nextCode);
      nextCode += 1;
      if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
    } else {
      writeBits(clearCode, codeSize);
      resetDict();
    }
    prefix = suffix;
  }
  writeBits(prefix, codeSize);
  writeBits(eoiCode, codeSize);
  if (bitCount) out.push(bitBuf & 255);
  return out;
}

window.GifEncoder = GifEncoder;
