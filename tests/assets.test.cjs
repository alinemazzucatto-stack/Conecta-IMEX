const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync('index.html', 'utf8');

test('scripts e folhas de estilo locais existem e scripts têm sintaxe válida', () => {
  const errors = [];
  for (const match of html.matchAll(/<(script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["'][^>]*>/gi)) {
    const resource = match[2].split(/[?#]/)[0];
    if (/^(https?:|\/\/|data:)/.test(resource)) continue;
    const file = path.resolve(resource);
    if (!fs.existsSync(file)) { errors.push(`Arquivo ausente: ${resource}`); continue; }
    if (match[1].toLowerCase() === 'script') {
      try { new vm.Script(fs.readFileSync(file, 'utf8'), { filename: resource }); }
      catch (error) { errors.push(error.message + ': ' + resource); }
    }
  }
  assert.deepEqual(errors, []);
});

test('scripts embutidos na página têm sintaxe válida', () => {
  for (const [index, match] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()) {
    if (/\bsrc\s*=|application\/(?:ld\+)?json/i.test(match[1])) continue;
    new vm.Script(match[2], { filename: `index.html script ${index + 1}` });
  }
});

test('página principal não carrega login de desenvolvimento', () => {
  assert.doesNotMatch(html, /src=["'][^"']*000-login-fallback/);
});
