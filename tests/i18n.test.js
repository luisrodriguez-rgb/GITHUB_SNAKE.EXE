const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadI18n() {
  const sandbox = {
    URLSearchParams,
    CustomEvent: class {},
    navigator: { language: 'es-CO' },
    localStorage: { getItem: () => null, setItem() {} },
    document: { addEventListener() {} }
  };
  sandbox.window = sandbox;
  sandbox.window.location = { search: '' };
  vm.createContext(sandbox);
  // const de nivel superior no se exponen en el contexto: se devuelven explícitamente
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'i18n.js'), 'utf8') + '\n;({ STATIC_EN, MESSAGES, I18n });';
  return vm.runInContext(code, sandbox);
}

test('los mensajes de JS tienen las mismas claves y variables en español e inglés', () => {
  const { MESSAGES } = loadI18n();
  assert.deepStrictEqual(Object.keys(MESSAGES.en).sort(), Object.keys(MESSAGES.es).sort());
  const vars = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
  for (const key of Object.keys(MESSAGES.es)) {
    assert.deepStrictEqual(vars(MESSAGES.en[key]), vars(MESSAGES.es[key]), `variables distintas en '${key}'`);
  }
});

test('cada texto estático del diccionario existe en index.html y su traducción es única', () => {
  const { STATIC_EN } = loadI18n();
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rarr;/g, '→').replace(/&copy;/g, '©').replace(/\s+/g, ' ');
  for (const es of Object.keys(STATIC_EN)) {
    assert.ok(html.includes(es), `'${es}' ya no está en index.html (diccionario desactualizado)`);
  }
  // Si dos textos españoles distintos compartieran traducción, volver al español sería ambiguo
  const seen = new Map();
  for (const [es, en] of Object.entries(STATIC_EN)) {
    if (es === en) continue;
    assert.ok(!seen.has(en) || seen.get(en) === es, `'${en}' traduce a la vez '${seen.get(en)}' y '${es}'`);
    seen.set(en, es);
  }
});

test('t() interpola variables y usa el español si falta la clave en inglés', () => {
  const { I18n } = loadI18n();
  I18n.lang = 'en';
  assert.strictEqual(I18n.t('duel.loading', { a: 'x', b: 'y' }), 'Loading x and y...');
  I18n.lang = 'es';
  assert.strictEqual(I18n.t('tooltip.many', { count: 3 }), '3 contribuciones');
  assert.strictEqual(I18n.t('no.existe'), 'no.existe');
});
