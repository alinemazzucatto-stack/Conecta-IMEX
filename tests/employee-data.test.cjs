const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('bases pessoais embutidas permanecem vazias', () => {
  for (const [file, name] of [
    ['js/legacy/02-legacy.js', 'GRH_COLABS_ARQUIVO'],
    ['js/legacy/35-patch-cirurgico-colaboradores-roadmap.js', 'COLABS_ARQUIVO'],
    ['js/legacy/48-movimentacoes-premium-reais.js', 'movs'],
    ['js/legacy/50-patch-final-observador-movimentacoes-real.js', 'MOVS'],
    ['js/legacy/77-desligamentos-fallback-fixer.js', 'DESL_DEMO']
  ]) {
    assert.match(fs.readFileSync(file, 'utf8'), new RegExp('(?:const|let|var)\\s+' + name + '\\s*=\\s*\\[\\s*\\]'));
  }
});

test('abrir base vazia não dispara importação ou escrita no banco', async () => {
  const source = fs.readFileSync('js/legacy/02-legacy.js', 'utf8');
  const fn = source.slice(source.indexOf('async function grhImportarSeVazio()'), source.indexOf('// ── Hero stats'));
  // Nenhum banco é disponibilizado: qualquer acesso faria este teste falhar.
  await vm.runInNewContext(fn + '\ngrhImportarSeVazio();');
  assert.doesNotMatch(fn, /\.collection\(|\.batch\(|\.commit\(/);
});

test('falha ao ler desligamentos não recria históricos demonstrativos', async () => {
  const source = fs.readFileSync('js/legacy/02-legacy.js', 'utf8');
  const start = source.indexOf('async function grhGetDesl(');
  const end = source.indexOf('// ── Exposições globais', start);
  const context = { _grhDesl: null };
  const result = await vm.runInNewContext(source.slice(start, end) + '\ngrhGetDesl();', context);
  assert.equal(result.length, 0);
});

function storage(entries) {
  const data = new Map(Object.entries(entries));
  return {
    get length() { return data.size; },
    key: i => [...data.keys()][i],
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key)
  };
}

test('limpeza local remove históricos, mantém autenticação e só executa uma vez', () => {
  const local = storage({
    grh_beneficios_backup: 'dados antigos', grh_holerites_backup_meta: 'dados antigos',
    'firebase:authUser:projeto': 'conta preservada', grh_beneficios_catalogo: 'catálogo'
  });
  const session = storage({ grh_mapeamento_cpf_backup: 'dados antigos', userEmail: 'conta preservada' });
  const context = { localStorage: local, sessionStorage: session, console };
  const source = fs.readFileSync('js/modules/000-clear-employee-cache.js', 'utf8');
  vm.runInNewContext(source, context);
  assert.equal(local.getItem('grh_beneficios_backup'), null);
  assert.equal(local.getItem('grh_holerites_backup_meta'), null);
  assert.equal(session.getItem('grh_mapeamento_cpf_backup'), null);
  assert.equal(local.getItem('firebase:authUser:projeto'), 'conta preservada');
  assert.equal(session.getItem('userEmail'), 'conta preservada');
  assert.equal(local.getItem('grh_beneficios_catalogo'), 'catálogo');
  local.setItem('grh_beneficios_backup', 'dados novos');
  vm.runInNewContext(source, context);
  assert.equal(local.getItem('grh_beneficios_backup'), 'dados novos');
});
