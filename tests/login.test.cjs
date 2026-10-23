const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(signIn) {
  const elements = Object.fromEntries(['lEmail', 'lPass', 'lBtn', 'lLoading', 'lErr', 'loginScreen', 'appShell'].map(id => [id, { value: '', style: {}, disabled: false }]));
  elements.lEmail.value = 'rh@teste.com';
  elements.lPass.value = '123456';
  const session = new Map();
  const context = {
    console: { log() {} },
    document: { getElementById: id => elements[id] },
    sessionStorage: { setItem: (k,v) => session.set(k,v), getItem: k => session.get(k) },
    localStorage: { setItem() { throw Error('Sessão local indevida'); } },
    setTimeout() {}, setInterval() {}, clearInterval() {},
    firebase: { apps: [{}] },
    auth: { signInWithEmailAndPassword: signIn }
  };
  context.window = context;
  vm.runInNewContext(fs.readFileSync('js/modules/login-auth.js', 'utf8'), context);
  return { context, elements, session };
}

test('falha de rede não permite entrar com conta de teste', async () => {
  const { context, elements, session } = setup(async () => { throw { code: 'auth/network-request-failed' }; });
  await context.doLogin();
  assert.equal(elements.lErr.textContent, 'Sem conexão com a internet.');
  assert.equal(session.size, 0);
  assert.equal(context.currentUserData, undefined);
  assert.equal(elements.lBtn.disabled, false);
  assert.equal(elements.lLoading.style.display, 'none');
  assert.equal(context.__loginEmAndamento, false);
});

test('Firebase ausente apresenta erro e libera nova tentativa', async () => {
  const { context, elements } = setup();
  delete context.firebase;
  await context.doLogin();
  assert.match(elements.lErr.textContent, /Firebase não inicializado/);
  assert.equal(elements.lBtn.disabled, false);
});

test('senha é enviada sem remover espaços e clique duplicado não repete login', async () => {
  let calls = 0;
  let reject;
  const { context, elements } = setup((email, password) => {
    calls++;
    assert.equal(password, ' senha com espaços ');
    return new Promise((_, fail) => { reject = fail; });
  });
  elements.lPass.value = ' senha com espaços ';
  const first = context.doLogin();
  await context.doLogin();
  assert.equal(calls, 1);
  reject({ code: 'auth/wrong-password' });
  await first;
  assert.equal(elements.lErr.textContent, 'Senha incorreta.');
});
