// ===== script: login-real-fix-js =====
(function(){
'use strict';
if(window.__loginRealFix) return;
window.__loginRealFix = true;

var PLBL = {colaborador:'Colaborador', gestor:'Gestor', rh:'RH', 'rh-colaborador':'RH'};
var PDOT = {colaborador:'👤', gestor:'👔', rh:'🏢', 'rh-colaborador':'🏢'};

function log2(msg){ try{ console.log('[login]', msg); }catch(e){} }

// Causa raiz do login travado em "Autenticando..." para sempre: as chamadas
// de rede do Firebase (Auth e Firestore) não tinham nenhum timeout — em
// ambientes com firewall/antivírus/extensão bloqueando esses domínios, a
// Promise nunca resolve nem rejeita, e o await fica pendurado pra sempre
// (nem o catch nem o finally chegam a rodar). Toda chamada de rede usada no
// login passa por este helper para garantir que sempre há um desfecho.
function comTimeout(promise, ms, motivo){
  try{ promise.catch(function(){}); }catch(e){} // evita "unhandled rejection" se resolver tarde
  return Promise.race([
    promise,
    new Promise(function(_, reject){
      setTimeout(function(){ reject(new Error('firestore-timeout:' + motivo)); }, ms);
    })
  ]);
}

window.doLogin = async function(){
  var email = (document.getElementById('lEmail') ? document.getElementById('lEmail').value : '').trim();
  var pass  = (document.getElementById('lPass')  ? document.getElementById('lPass').value  : '').trim();
  var btn   = document.getElementById('lBtn');
  var load  = document.getElementById('lLoading');
  var err   = document.getElementById('lErr');
  function showErr(msg){ if(err){ err.textContent = msg; err.style.display = 'block'; } else { alert(msg); } }
  if(err) err.style.display = 'none';

  if(!email || !pass){ showErr('Preencha e-mail e senha.'); return; }
  if(btn) btn.disabled = true;
  if(load) load.style.display = 'block';

  // Existe um SEGUNDO listener (auth.onAuthStateChanged em 02-legacy.js) que
  // reage à MESMA autenticação de forma independente, usando outra coleção
  // (`users`) e outra lógica de papel — os dois corriam em paralelo e o que
  // terminasse primeiro "vencia", às vezes deixando `window.currentUserData`
  // vazio ou o papel errado (colaborador em vez de rh, etc.), causando
  // oscilações visuais e inconsistências após o login. Esta flag avisa esse
  // outro listener para não fazer nada enquanto ESTE login (a fonte
  // completa e correta) está em andamento.
  window.__loginEmAndamento = true;

  try{
    if(!firebase || !firebase.apps || firebase.apps.length === 0){
      throw new Error('Firebase não inicializado. Verifique sua conexão com a internet.');
    }

    var cred;

    // IMPORTANTE (segurança): a verificação de senha SEMPRE passa pelo
    // Firebase Auth de verdade. Uma versão anterior deste código "liberava"
    // o acesso sem checar a senha quando a rede falhava/travava — isso é uma
    // falha grave num sistema de RH com dados sensíveis (qualquer senha
    // digitada para um e-mail existente entraria). Se a autenticação travar
    // ou falhar por rede, o usuário recebe um erro claro e tenta de novo —
    // nunca entra sem senha validada.
    try{
      log2('Autenticando...');
      cred = await comTimeout(auth.signInWithEmailAndPassword(email, pass), 12000, 'signin');
    }catch(authErr){
      if(String(authErr.message || '').indexOf('firestore-timeout:signin') !== -1){
        throw new Error('Não foi possível conectar ao servidor de autenticação (conexão lenta ou bloqueada). Verifique sua internet/rede e tente novamente.');
      }
      if(authErr.code === 'auth/user-not-found'){
        // Primeiro acesso real: confirma que o e-mail existe na base de
        // colaboradores antes de criar a conta no Firebase Auth — evita que
        // qualquer e-mail aleatório crie conta sem estar cadastrado no RH.
        log2('Conta não existe ainda — verificando cadastro em grh_colabs...');
        var achouCadastro = false;
        try{
          var existe = await comTimeout(db.collection('grh_colabs').where('email','==',email).limit(1).get(), 6000, 'existe-grh');
          if(existe.empty){
            existe = await comTimeout(db.collection('meta_grh_colabs').where('email','==',email).limit(1).get(), 6000, 'existe-meta');
          }
          if(existe.empty){
            existe = await comTimeout(db.collection('xpert_grh_colabs').where('email','==',email).limit(1).get(), 6000, 'existe-xpert');
          }
          achouCadastro = !existe.empty;
        }catch(e){
          // Firestore sem permissão (ou travado por bloqueio de rede) para
          // consulta pré-login — cai para a base local do arquivo antes de
          // desistir.
          log2('Firestore indisponível para verificação (' + e.message + ') — checando base local...');
        }
        if(!achouCadastro && typeof GRH_COLABS_ARQUIVO !== 'undefined'){
          achouCadastro = GRH_COLABS_ARQUIVO.some(function(c){ return c.email === email; });
        }
        if(!achouCadastro){
          throw new Error('E-mail não cadastrado na base de colaboradores.');
        }
        log2('Cadastro encontrado — criando conta de acesso (primeiro login)...');
        cred = await comTimeout(auth.createUserWithEmailAndPassword(email, pass), 12000, 'signup');
      } else {
        throw authErr;
      }
    }

    var uid = cred.user.uid;
    log2('Auth OK — UID: ' + uid);

    var colab = null;
    var colabDoc = null;
    var useLocalDb = false;

    // Se estiver em modo de desenvolvimento (Firebase indisponível), pula direto para base local
    var firestoreTravou = false;
    if(!useLocalDb){
      try{
        var snap = await comTimeout(db.collection('grh_colabs').where('email','==',email).limit(1).get(), 6000, 'colab-grh');
        if(snap.empty) snap = await comTimeout(db.collection('meta_grh_colabs').where('email','==',email).limit(1).get(), 6000, 'colab-meta');
        if(snap.empty) snap = await comTimeout(db.collection('xpert_grh_colabs').where('email','==',email).limit(1).get(), 6000, 'colab-xpert');
        if(!snap.empty){
          colabDoc = snap.docs[0];
          colab = colabDoc.data() || {};
        }
      }catch(e){
        firestoreTravou = String(e.message || '').indexOf('firestore-timeout') !== -1;
        log2('Firestore indisponível (' + e.message + '), buscando na base local...');
      }
    }

    // Se Firestore falhou ou estamos em modo dev, tenta buscar na base local
    if(!colab || Object.keys(colab).length === 0){
      if(typeof GRH_COLABS_ARQUIVO !== 'undefined'){
        var found = GRH_COLABS_ARQUIVO.find(function(c){ return c.email === email; });
        if(found){
          colab = found;
          colabDoc = { id: email, ref: { parent: { path: 'grh_colabs' } }, data: function(){ return found; } };
          log2('Usuário encontrado na base local');
        }
      }
    }

    if(!colab || Object.keys(colab).length === 0){
      if(firestoreTravou){
        throw new Error('Não foi possível conectar ao banco de dados (conexão lenta ou bloqueada). Verifique sua internet/rede e tente novamente.');
      }
      throw new Error('E-mail autenticado, mas não encontrado na base de colaboradores.');
    }
    var perfis = Array.isArray(colab.perfis)
      ? colab.perfis.map(function(p){ return String(p).toLowerCase().trim(); }).filter(Boolean)
      : [String(colab.perfil || colab.roleAcesso || 'colaborador').toLowerCase().trim()];

    var preferido = String((window.loginRole) || sessionStorage.getItem('imexPreferredRole') || 'colaborador').toLowerCase().trim();
    var podeUsar = preferido === 'colaborador' || perfis.indexOf(preferido) !== -1;
    var roleBase = podeUsar ? preferido : (perfis.indexOf('rh') !== -1 ? 'rh' : (perfis.indexOf('gestor') !== -1 ? 'gestor' : 'colaborador'));

    if(!useLocalDb){ try{ await comTimeout(colabDoc.ref.update({ authUid: uid, ultimoAcesso: new Date().toISOString() }), 6000, 'update-acesso'); }catch(e){} }

    // ── CONSOLIDAR ESTADO CENTRALIZADO (se disponível) ──
    if (typeof setUserState === 'function') {
      setUserState('email', email);
      setUserState('role', roleBase);
      setUserState('roleReal', roleBase);
      setUserState('unidade', (colab.unidade || 'meta').toString().toLowerCase().indexOf('xpert') !== -1 ? 'xpert' : 'meta');
      setUserState('isAuthenticated', true);
      setUserState('sessionStartTime', new Date().toISOString());
    }

    // Flag para onAuthStateChanged em 02-legacy.js não executar neste momento
    try { sessionStorage.setItem('__lastLoginTime', Date.now().toString()); } catch(e) {}

    window.role = roleBase;
    // `_roleReal` passa a refletir a VISÃO ATUAL (igual a `role`), não a
    // permissão de fundo da conta — dezenas de funções antigas usam
    // `_roleReal` para decidir o que mostrar/navegar, e contas híbridas
    // (rh + colaborador) ficavam sempre sendo tratadas como RH mesmo
    // escolhendo ver como colaborador. A permissão real continua disponível
    // em window.currentUserData.perfis / hasPerfil('rh'), usada só para
    // exibir o botão de "trocar perfil" — isso não muda com esta linha.
    window._roleReal = roleBase;
    // IMPORTANTE: `role` e `_roleReal` foram declaradas com `let` no topo do
    // arquivo — isso NÃO cria propriedade em `window`. A maioria das funções
    // antigas (isRH(), roleAtual() etc.) lê a variável "pura", não window.role.
    // Sem esta linha, o valor antigo (de uma sessão anterior) fica preso.
    try{ role = roleBase; }catch(e){}
    try{ _roleReal = window._roleReal; }catch(e){}
    window.currentUserData = {
      uid: uid, id: colabDoc.id, docId: colabDoc.id,
      nome: colab.nome || colab.nomeCompleto || email.split('@')[0],
      email: email, role: roleBase, perfis: perfis,
      unidade: (colab.unidade || 'meta').toString().toLowerCase().indexOf('xpert') !== -1 ? 'xpert' : 'meta',
      setor: colab.setor || '', funcao: colab.funcao || colab.cargo || '',
      cargo: colab.cargo || colab.funcao || '', gestor: colab.gestor || '',
      collectionPath: colabDoc.ref.parent.path
    };
    window.currentUnidade = window.currentUserData.unidade;

    try{ sessionStorage.setItem('imexPreferredRole', roleBase); }catch(e){}
    try{ sessionStorage.setItem('imexRoleReal', window._roleReal); }catch(e){}
    sessionStorage.setItem('userRole', roleBase);
    sessionStorage.setItem('userPerfis', JSON.stringify(perfis));
    sessionStorage.setItem('userName', window.currentUserData.nome);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userDocId', colabDoc.id);
    localStorage.setItem('usuarioLogado', JSON.stringify(window.currentUserData));

    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appShell').style.display = 'flex';
    var pLabel = document.getElementById('pLabel'); if(pLabel) pLabel.textContent = PLBL[roleBase] || roleBase;
    var pDot = document.getElementById('pDot'); if(pDot) pDot.textContent = PDOT[roleBase] || '👤';
    document.body.classList.remove('role-rh','role-gestor','role-colaborador');
    document.body.classList.add('role-' + roleBase);

    // Define a tela de destino antes de montar o menu, e força a navegação
    // logo depois — evita que a tela de colaborador apareça por uma fração
    // de segundo antes de trocar para a tela correta do papel logado.
    var destino = roleBase === 'rh' ? 'gestao-rh' : (roleBase === 'gestor' ? 'gestor' : 'intranet');
    function irParaDestino(){
      try{
        if(typeof window.sbNav === 'function') window.sbNav(destino);
        else if(typeof window.switchView === 'function') window.switchView(destino);
      }catch(e){}
    }

    if(typeof window.buildSidebar === 'function') window.buildSidebar();
    // Navegar após buildSidebar estar pronto, com uma única tentativa
    // (múltiplas tentativas causavam oscilação entre views)
    setTimeout(irParaDestino, 100);

    setTimeout(async function(){
      try{ if(typeof window.updateHero === 'function') await window.updateHero(); }catch(e){}
      try{ if(typeof window.renderAll === 'function') await window.renderAll(); }catch(e){}
      try{ if(typeof window.enforcePermissions === 'function') window.enforcePermissions(); }catch(e){}
      if(roleBase === 'colaborador'){ try{ if(typeof window.updateColResumo === 'function') await window.updateColResumo(); }catch(e){} }
      try{ if(typeof window.renderMeuDesenvolvimento === 'function') window.renderMeuDesenvolvimento(); }catch(e){}
    }, 0);

  }catch(e){
    var msgs = {
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-credential': 'E-mail ou senha inválidos.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
      'auth/network-request-failed': 'Sem conexão com a internet.',
      'auth/weak-password': 'Senha muito curta — use ao menos 6 caracteres no primeiro acesso.',
      'auth/email-already-in-use': 'Este e-mail já tem conta — confira a senha digitada.',
      'auth/timeout': 'Autenticação demorou muito. Verifique sua conexão e tente novamente.'
    };
    showErr(msgs[e.code] || e.message || 'Erro desconhecido ao entrar.');
  } finally {
    if(btn) btn.disabled = false;
    if(load) load.style.display = 'none';
    window.__loginEmAndamento = false;
  }
};

// Garante que nenhum patch posterior volte a usar o login fake (enterApp).
window.entrarDemo = window.doLogin;
})();

// ===== script: perfil-estavel-js =====
(function(){
'use strict';
// DESATIVADO: este script capturava o papel ativo UMA VEZ no carregamento
// da página e depois forçava esse valor de volta a cada 150ms para sempre
// (`window.role`/`sessionStorage.userRole`). Se o valor capturado no
// instante do carregamento fosse "colaborador" (ex.: resquício de sessão
// anterior), ele ficava brigando para sempre contra uma sessão de RH
// legítima — essa era a causa real do menu lateral oscilando. Foi criado
// para um diagnóstico (troca de perfil via "Minha Visão") que depois se
// mostrou não ser a causa do bug original; mantido aqui desativado em vez
// de removido, para preservar o histórico.
return;
if(window.__perfilEstavelInit) return;
window.__perfilEstavelInit = true;

// Inicializa com o papel salvo na sessão (login direto), não só com
// trocas de perfil explícitas — protege também quem nunca usou "Minha Visão".
window.__perfilAlvo = (sessionStorage.getItem('imexPreferredRole') || sessionStorage.getItem('userRole') || null);

var origTrocarPerfil = window.trocarPerfil;
window.trocarPerfil = function(){
  var r = (typeof origTrocarPerfil === 'function') ? origTrocarPerfil.apply(this, arguments) : undefined;
  // O role já foi alterado pelas implementações anteriores nesta chamada;
  // capturamos o resultado como o "alvo" que deve ser mantido estável.
  window.__perfilAlvo = String(window.role || '').toLowerCase();
  return r;
};

function reforcarPerfil(){
  if(!window.__perfilAlvo) return;
  var atual = String(window.role || '').toLowerCase();
  if(atual === window.__perfilAlvo) return;
  window.role = window.__perfilAlvo;
  try{ sessionStorage.setItem('userRole', window.__perfilAlvo); }catch(e){}
  try{ sessionStorage.setItem('imexPreferredRole', window.__perfilAlvo); }catch(e){}
  document.body.classList.remove('role-rh','role-gestor','role-colaborador');
  document.body.classList.add('role-' + window.__perfilAlvo);
  var pLabel = document.getElementById('pLabel');
  if(pLabel){
    pLabel.textContent = window.__perfilAlvo === 'rh' ? 'RH' : (window.__perfilAlvo === 'gestor' ? 'Gestor' : 'Colaborador');
  }
  if(typeof window.buildSidebar === 'function'){ try{ window.buildSidebar(); }catch(e){} }
  if(typeof window.aplicarPermissoesPesquisas === 'function'){ try{ window.aplicarPermissoesPesquisas(); }catch(e){} }
}

setInterval(reforcarPerfil, 150);
})();

// ===== script: colab-lock-js =====
(function(){
'use strict';
// DESATIVADO: estava interceptando navegação legítima do colaborador
// (Férias, Benefícios, Gamificação, Conecta AI todos caindo na Intranet).
// Causa real do problema de Pesquisas era outra (variáveis `role`/`_roleReal`
// já corrigidas no login). Mantido aqui desligado em vez de removido.
return;
if(window.__colabLockInit) return;
window.__colabLockInit = true;

function roleReal(){
  return String(sessionStorage.getItem('userRole') || window.role || '').toLowerCase();
}

var RH_VIEWS = ['view-gestao-rh','view-dashboard','view-auditoria','view-usuarios'];

function corrigir(){
  if(roleReal() !== 'colaborador') return; // só protege sessões realmente de colaborador
  var algumaRhVisivel = RH_VIEWS.some(function(id){
    var el = document.getElementById(id);
    return el && window.getComputedStyle(el).display !== 'none';
  });
  if(!algumaRhVisivel) return;

  RH_VIEWS.forEach(function(id){
    var el = document.getElementById(id);
    if(el){
      el.classList.remove('active');
      el.style.setProperty('display','none','important');
    }
  });
  document.querySelectorAll('[id^="sb-"]').forEach(function(sb){
    if(RH_VIEWS.some(function(id){ return id.includes(sb.id.replace('sb-','')); })){
      sb.style.setProperty('display','none','important');
    }
  });

  var intranet = document.getElementById('view-intranet');
  if(intranet){
    intranet.classList.add('active');
    intranet.style.setProperty('display','block','important');
  }
  document.querySelectorAll('.sb-item[id^="sb-"]').forEach(function(sb){
    sb.classList.toggle('active', sb.id === 'sb-intranet');
  });
  var pLabel = document.getElementById('pLabel'); if(pLabel) pLabel.textContent = 'Colaborador';
}

var mo = new MutationObserver(corrigir);
function observarTudo(){
  RH_VIEWS.forEach(function(id){
    var el = document.getElementById(id);
    if(el) mo.observe(el, {attributes:true, attributeFilter:['style','class']});
  });
}
observarTudo();
setInterval(observarTudo, 1000); // cobre views criadas dinamicamente depois do load inicial
setInterval(corrigir, 200);
})();

