const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const owner = { uid: 'qTyh5V0bOtewN4P7756FfsTuDMf1', email: 'aline.mazzucatto@imex.com.br' };
function setup(signIn, profile = { email: owner.email, role: 'rh-colaborador', nome: 'Administradora' }) {
  const elements = Object.fromEntries(['lEmail', 'lPass', 'lBtn', 'lLoading', 'lErr', 'loginScreen', 'appShell'].map(id => [id, { value: '', style: { setProperty(k,v) { this[k] = v; } }, disabled: false }]));
  elements.lEmail.value = owner.email;
  elements.lPass.value = '123456';
  const session = new Map();
  const local = new Map();
  const reads = [];
  let signedOut = 0;
  const context = {
    console: { log() {} },
    document: { getElementById: id => elements[id], body: { classList: { add() {}, remove() {} } } },
    sessionStorage: { setItem: (k,v) => session.set(k,v), getItem: k => session.get(k) },
    localStorage: { setItem: (k,v) => local.set(k,v) },
    setTimeout() {}, setInterval() {}, clearInterval() {},
    firebase: { apps: [{}] },
    loginRole: 'rh',
    auth: {
      signInWithEmailAndPassword: async (...args) => {
        const result = await signIn(...args);
        context.auth.currentUser = result.user;
        return result;
      },
      signOut: async () => { signedOut++; context.auth.currentUser = null; }
    },
    db: { collection: name => {
      assert.equal(name, 'users');
      reads.push(name);
      return { doc: uid => {
        assert.equal(uid, owner.uid);
        return { get: async () => ({
          id: uid, exists: Boolean(profile), data: () => profile,
          ref: { parent: { path: 'users' }, update: async () => {} }
        }) };
      } };
    } }
  };
  context.window = context;
  vm.runInNewContext(fs.readFileSync('js/modules/access-policy.js', 'utf8'), context);
  vm.runInNewContext(fs.readFileSync('js/modules/login-auth.js', 'utf8'), context);
  return { context, elements, session, local, reads, signOutCount: () => signedOut };
}

test('falha de rede não cria sessão local para a administradora', async () => {
  const { context, elements, session } = setup(async () => { throw { code: 'auth/network-request-failed' }; });
  await context.doLogin();
  assert.equal(elements.lErr.textContent, 'Sem conexão com a internet.');
  assert.equal(session.size, 0);
  assert.equal(context.currentUserData, undefined);
  assert.equal(elements.lBtn.disabled, false);
  assert.equal(elements.lLoading.style.display, 'none');
  assert.equal(context.__loginEmAndamento, false);
});

test('outras contas são recusadas antes de autenticar ou consultar cadastros', async () => {
  let calls = 0;
  const { context, elements, reads, local } = setup(async () => { calls++; });
  elements.lEmail.value = 'outra-conta@example.invalid';
  await context.doLogin();
  assert.equal(calls, 0);
  assert.equal(reads.length, 0);
  assert.equal(local.size, 0);
  assert.match(elements.lErr.textContent, /somente para a administradora/);
});

test('conta administrativa entra com o perfil users sem cadastro de colaborador', async () => {
  const { context, elements, reads, session } = setup(async () => ({ user: owner }));
  await context.doLogin();
  assert.equal(reads.join(','), 'users');
  assert.equal(context.currentUserData.uid, owner.uid);
  assert.equal(context.currentUserData.collectionPath, 'users');
  assert.equal(session.get('userRole'), 'rh');
  assert.equal(elements.loginScreen.style.display, 'none');
  assert.equal(elements.appShell.style.display, 'flex');
});

test('mesmo e-mail com UID diferente não concede acesso', async () => {
  const { context, elements, reads, local, signOutCount } = setup(async () => ({ user: { ...owner, uid: 'outra-identidade' } }));
  await context.doLogin();
  assert.equal(reads.length, 0);
  assert.equal(local.size, 0);
  assert.ok(signOutCount() >= 1);
  assert.match(elements.lErr.textContent, /não está autorizada/);
});

test('perfil ausente não cria cadastro automaticamente e encerra autenticação', async () => {
  const { context, elements, local, signOutCount } = setup(async () => ({ user: owner }), null);
  await context.doLogin();
  assert.equal(local.size, 0);
  assert.ok(signOutCount() >= 1);
  assert.match(elements.lErr.textContent, /Perfil administrativo não encontrado/);
});

test('sessão de outra conta não é restaurada mesmo com perfil salvo no navegador', async () => {
  const { context, session, reads, signOutCount } = setup();
  session.set('userRole', 'rh');
  session.set('userEmail', 'outra-conta@example.invalid');
  const source = fs.readFileSync('js/legacy/02-legacy.js', 'utf8');
  const match = source.match(/auth\.onAuthStateChanged\((async \(user\) => \{[\s\S]*?\n\})\);/);
  assert.ok(match, 'Listener de restauração deve existir');
  context.otherUser = { uid: 'outra-identidade', email: 'outra-conta@example.invalid' };
  await vm.runInNewContext('(' + match[1] + ')(otherUser)', context);
  assert.equal(signOutCount(), 1);
  assert.equal(reads.length, 0);
  assert.equal(context.currentUserData, undefined);
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
