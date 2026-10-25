const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('index.html carga todo el CSS/JS local con la misma versión anti-caché', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="((?:js\/[\w-]+\.js|style\.css)[^"]*)"/g)].map(m => m[1]);
  assert.ok(refs.length > 5);

  const versions = new Set(refs.map(ref => {
    const match = ref.match(/\?v=([\w.-]+)$/);
    assert.ok(match, `${ref} no lleva ?v=`);
    return match[1];
  }));
  assert.strictEqual(versions.size, 1, `Versiones distintas: ${[...versions].join(', ')}`);

  // Cada script de js/ debe estar referenciado (un archivo nuevo sin cargar rompe la web en silencio)
  const scripts = fs.readdirSync(path.join(__dirname, '..', 'js')).filter(f => f.endsWith('.js'));
  for (const file of scripts) {
    assert.ok(refs.some(ref => ref.startsWith(`js/${file}?`)), `js/${file} no está en index.html`);
  }
});
