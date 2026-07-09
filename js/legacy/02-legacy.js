// ===== script: (sem id) =====
// ── CONTROLE DE PERMISSÕES (RBAC) ──
const PERMISSIONS = {
  colaborador: {
    canViewOwnRequests: true,
    canViewAllRequests: false,
    canViewTeamRequests: false,
    canApprove: false,
    canReject: false,
    canViewDashboard: false,
    canViewAudit: false,
    canViewColabs: false
  },
  gestor: {
    canViewOwnRequests: true,
    canViewAllRequests: false,
    canViewTeamRequests: true,
    canApprove: true,
    canReject: false,
    canViewDashboard: true,
    canViewAudit: false,
    canViewColabs: true
  },
  rh: {
    canViewOwnRequests: true,
    canViewAllRequests: true,
    canViewTeamRequests: true,
    canApprove: true,
    canReject: true,
    canViewDashboard: true,
    canViewAudit: true,
    canViewColabs: true
  }
};

function hasPermission(permission) {
  const userPerms = PERMISSIONS[role];
  return userPerms && userPerms[permission] === true;
}

function filterRequestsByRole(requests) {
  if (role === 'rh') return requests; // RH vê tudo
  if (role === 'gestor') {
    // Gestor vê apenas solicitações da sua equipe
    return requests.filter(r => r.nomeGestor === getCurrentUserName());
  }
  if (role === 'colaborador') {
    // Colaborador vê apenas suas próprias solicitações
    return requests.filter(r => r.email === getCurrentUserEmail());
  }
  return [];
}

function getCurrentUserName() {
  // Retorna o nome do usuário logado (pode ser armazenado em sessionStorage)
  return sessionStorage.getItem('userName') || 'Usuário';
}

function getCurrentUserEmail() {
  // Retorna o email do usuário logado
  return sessionStorage.getItem('userEmail') || '';
}

function enforcePermissions() {
  // Esconder elementos baseado em permissões
  const perms = PERMISSIONS[role];
  
  // Esconder menu de dashboard se não tiver permissão
  const dashboardMenu = document.querySelector('[onclick*="showView(\"dashboard\")"');
  if (dashboardMenu && !perms.canViewDashboard) {
    dashboardMenu.style.display = 'none';
  }
  
  // Esconder menu de auditoria se não tiver permissão
  const auditMenu = document.querySelector('[onclick*="showView(\"auditoria\")"');
  if (auditMenu && !perms.canViewAudit) {
    auditMenu.style.display = 'none';
  }
  
  // Esconder menu de colaboradores se não tiver permissão
  const colabsMenu = document.querySelector('[onclick*="showView(\"colaboradores\")"');
  if (colabsMenu && !perms.canViewColabs) {
    colabsMenu.style.display = 'none';
  }
}

// ── PESQUISA DE SATISFAÇÃO ──
let currentSurveyRating = 0;

function setSurveyRating(rating) {
  currentSurveyRating = rating;
  document.querySelectorAll('.star').forEach((s, i) => {
    s.classList.toggle('active', i < rating);
  });
}

async function submitSurvey() {
  const comment = document.getElementById('surveyComment')?.value.trim() || '';
  if (currentSurveyRating === 0) {
    alert('Por favor, selecione uma avaliação com as estrelas.');
    return;
  }
  const survey = {
    id: crypto.randomUUID(),
    rating: currentSurveyRating,
    comment,
    timestamp: new Date().toISOString(),
    userRole: role
  };
  survey.id = crypto.randomUUID();
  await saveSurveyItem(survey);
  log('Pesquisa de satisfação enviada', `Avaliação: ${currentSurveyRating} estrelas`, '⭐');
  closeSurvey();
}

function closeSurvey() {
  const modal = document.getElementById('surveyModal');
  if (modal) modal.classList.remove('active');
}

// ── NOTIFICAÇÕES ──
function toggleNotif() {
  const box = document.getElementById('notifBox');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
  if (box.style.display === 'block') {
    // Marcar como lidas ao abrir
    document.getElementById('notifBadge').style.display = 'none';
  }
}

function addNotif(msg, type = 'info') {
  const list = document.getElementById('notifList');
  const badge = document.getElementById('notifBadge');
  const empty = list.querySelector('div[style*="color:var(--ink-60)"]');
  if (empty) list.innerHTML = '';
  
  const item = document.createElement('div');
  item.style.padding = '10px';
  item.style.borderBottom = '1px solid var(--border)';
  item.style.marginBottom = '5px';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '🔔';
  item.innerHTML = `<div style="font-weight:600; margin-bottom:2px;">${icon} Novo Alerta</div><div style="color:var(--ink-60)">${msg}</div>`;
  list.prepend(item);
  
  badge.innerText = parseInt(badge.innerText || '0') + 1;
  badge.style.display = 'block';
}

// ── CONFIGURAÇÕES DINÂMICAS ──
async function rhSalvarConfig() {
  const ant = parseInt(document.getElementById('cfgAntecedencia').value);
  const min = parseInt(document.getElementById('cfgMinimo').value);
  await saveCfg({antecedencia: ant, minimo: min});
  addNotif('Regras do sistema atualizadas com sucesso!', 'success');
  log('Configuração alterada', `Antecedência: ${ant} dias, Mínimo: ${min} dias`, '⚙️');
}

// ── GESTÃO DE SALDO RH ──
let rhColabAtual = null;
async function rhBuscarColab() {
  const termo = document.getElementById('rhSearchColab').value.toLowerCase();
  if(!termo) return;
  const all = await getR();
  const colab = all.find(r => r.nome.toLowerCase().includes(termo) || r.email.toLowerCase().includes(termo));
  
  if(colab) {
    rhColabAtual = colab;
    document.getElementById('rhColabNome').textContent = colab.nome;
    document.getElementById('rhColabSaldo').textContent = colab.saldo + ' dias';
    document.getElementById('rhNovoSaldo').value = colab.saldo;
    document.getElementById('rhColabResult').style.display = 'block';
  } else {
    alert('Colaborador não encontrado nas solicitações.');
  }
}

async function rhSalvarSaldo() {
  if(!rhColabAtual) return;
  const novo = parseInt(document.getElementById('rhNovoSaldo').value);
  const all = await getR();
  
  // Atualizar o saldo de TODAS as solicitações deste colaborador para manter a consistência
  const up = all.map(r => r.email === rhColabAtual.email ? {...r, saldo: novo} : r);
  
  await saveRAll(up);
  addNotif(`Saldo de ${rhColabAtual.nome} ajustado para ${novo} dias.`, 'success');
  log('Ajuste de saldo', `${rhColabAtual.nome} -> ${novo} dias`, '⚖️');
  
  // Atualizar o campo de saldo no formulário se o colaborador estiver logado
  const fSaldo = document.getElementById('fSaldo');
  if(fSaldo && rhColabAtual.email === currentUserData?.email) {
    fSaldo.value = novo;
    updateResumo();
  }
  
  rhBuscarColab(); // Atualizar view
  renderAll();
}

// ── VALIDAÇÃO DE REGRAS ──
async function validarRegrasFerias(dados) {
  const config = await getCfg();
  const inicio = new Date(dados.inicio + 'T12:00:00');
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  const dias = parseInt(dados.dias);
  const saldo = parseInt(dados.saldo);
  const abono = dados.abono === 'Sim';
  
  // 1. Antecedência mínima dinâmica
  const diffTime = inicio - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < config.antecedencia) {
    return { valida: false, msg: `A solicitação deve ser feita com no mínimo ${config.antecedencia} dias de antecedência.` };
  }
  
  // 2. Saldo disponível
  if (dias > saldo) {
    return { valida: false, msg: "Você não possui saldo de férias suficiente para este período." };
  }
  
  // 3. Regras CLT de Fracionamento e Dias Mínimos
  if (dias < 5) {
    return { valida: false, msg: "Pela CLT, nenhum período de férias pode ser inferior a 5 dias." };
  }

  if (dados.fracao === 'unico' && dias < 14 && saldo >= 14) {
    return { valida: false, msg: "Pela CLT, ao menos um dos períodos deve ter no mínimo 14 dias." };
  }

  // 4. Abono Pecuniário
  if (abono && dias > 20) {
    return { valida: false, msg: "Ao solicitar abono (10 dias), você só pode tirar no máximo 20 dias de descanso." };
  }
  
  return { valida: true };
}

function openSurvey() {
  const modal = document.getElementById('surveyModal');
  if (modal) modal.classList.add('active');
}

// ── CONFIG ──
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1ebvydJcpBt2Esjlk2-vs6TxEa1L-WNozMNIJzjAXSQ5oacQdrsQh8ddaPxCNCZ46/exec';
const PLBL = {colaborador:'Colaborador',gestor:'Gestor',rh:'RH','rh-colaborador':'RH/Colaborador'};
const PDOT = {colaborador:'👤',gestor:'👔',rh:'🏢','rh-colaborador':'🏢'};

// ── ESTADO CENTRALIZADO DO USUÁRIO (FONTE ÚNICA DE VERDADE) ──
// Qualquer mudança aqui é refletida em sessionStorage + window + variáveis locais
window.__IMEX_STATE = {
  user: null,           // Objeto de usuário completo
  email: null,          // Email do usuário
  role: 'colaborador',  // Role: colaborador, gestor, rh
  roleReal: null,       // Role real (salvo em sessionStorage.imexRoleReal)
  unidade: 'meta',      // Unidade: meta, xpert
  isAuthenticated: false,
  sessionStartTime: null,
  lastActivityTime: null
};

// Proxy para manter em sync com sessionStorage
function setUserState(key, value) {
  window.__IMEX_STATE[key] = value;
  sessionStorage.setItem('__IMEX_STATE_' + key, JSON.stringify(value));
  if (key === 'role') sessionStorage.setItem('userRole', String(value));
  if (key === 'email') sessionStorage.setItem('userEmail', String(value));
  if (key === 'roleReal') sessionStorage.setItem('imexRoleReal', String(value));
  if (key === 'unidade') sessionStorage.setItem('imexUnidade', String(value));
}

function getUserState(key) {
  const val = window.__IMEX_STATE[key];
  return val !== undefined ? val : sessionStorage.getItem('__IMEX_STATE_' + key);
}

function syncUserState() {
  // Sincroniza estado do sessionStorage para __IMEX_STATE
  const keys = ['user', 'email', 'role', 'roleReal', 'unidade', 'isAuthenticated'];
  keys.forEach(key => {
    const stored = sessionStorage.getItem('__IMEX_STATE_' + key);
    if (stored) {
      try {
        window.__IMEX_STATE[key] = JSON.parse(stored);
      } catch(e) {
        window.__IMEX_STATE[key] = stored;
      }
    }
  });
}

// Sincronizar ao carregar a página
syncUserState();

let currentUserData = null;
let currentUnidade = null; // 'meta' ou 'xpert'

function userPerfis() {
  if (currentUserData && Array.isArray(currentUserData.perfis)) return currentUserData.perfis;
  try { return JSON.parse(sessionStorage.getItem('userPerfis') || '[]'); } catch(e) { return []; }
}
function hasPerfil(perfil) {
  return userPerfis().includes(perfil);
}
// isRH()/isGestor() controlam o que é exibido (gating de conteúdo) e por
// isso devem refletir a VISÃO ATIVA agora (`role`), não a permissão de
// fundo (`hasPerfil`) — senão uma conta híbrida RH+colaborador continua
// vendo conteúdo de RH mesmo tendo escolhido "ver como colaborador".
// REMOVED: Consolidated in 000-core-functions.js
// function isRH() { return role === 'rh' || role === 'rh-colaborador'; }
// REMOVED: Consolidated in 000-core-functions.js
// function isGestor() { return role === 'gestor'; }

// ── FUNÇÃO CENTRALIZADA DE EMAIL (única implementação) ──
// Consolidada de 3 implementações diferentes (antes havia conflitos)
// Prioridade: estado centralizado > currentUserData > sessionStorage > fallback
function getEmail() {
  if (window.__IMEX_STATE && window.__IMEX_STATE.email) {
    return window.__IMEX_STATE.email;
  }
  if (window.currentUserData && window.currentUserData.email) {
    return window.currentUserData.email;
  }
  const stored = sessionStorage.getItem('userEmail');
  if (stored) return stored;
  return '';
}

// Retorna o prefixo da coleção para a unidade atual
function col(name) {
  if (!currentUnidade) return name;
  return currentUnidade + '_' + name;
}

// Constantes de unidade
const UNIDADES = { meta: '🏢 Meta', xpert: '⚡ Xpert' };
const ADMIN_EMAIL = 'admin@conecta-imex.com'; // email do admin master
const TABS = [
  {id:'solicitacao', label:'🌴 Férias',            roles:['colaborador','gestor','rh','rh-colaborador']},
  {id:'gestor',      label:'👔 Gestor',             roles:['gestor','rh','rh-colaborador']},
  {id:'rh',          label:'🏢 RH',                 roles:['rh','rh-colaborador']},
  {id:'dashboard',   label:'📊 Dashboard',          roles:['gestor','rh','rh-colaborador']},
  {id:'auditoria',   label:'📋 Auditoria',          roles:['rh','rh-colaborador']},
  {id:'usuarios',    label:'🔑 Usuários',           roles:['rh','rh-colaborador']},
  {id:'gestao-rh',   label:'👥 Gestão RH',          roles:['rh','rh-colaborador']},
  {id:'intranet',    label:'📰 Intranet',           roles:['colaborador','gestor','rh','rh-colaborador']},
  {id:'pesquisas',   label:'📝 Pesquisas',          roles:['colaborador','gestor','rh','rh-colaborador']},
  {id:'disc',        label:'🧠 Test DISC',          roles:['colaborador','gestor','rh','rh-colaborador']},
  {id:'pdi',         label:'🎯 PDI',                roles:['colaborador','gestor','rh','rh-colaborador']},
  {id:'cargos',      label:'📌 Descritivo Cargos',  roles:['colaborador','gestor','rh','rh-colaborador']},
  {id:'ouvidoria',   label:'📣 Ouvidoria',          roles:['colaborador','gestor','rh','rh-colaborador']},
];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MSHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

let role = null, loginRole = 'colaborador';
let calY = new Date().getFullYear(), calM = new Date().getMonth();
const mActs = {}, rActs = {};

// ── FIREBASE CONFIG ──
const firebaseConfig = {
  apiKey: "AIzaSyDcLavSmDUhPddZz-ECgk8dDecJErYwGfU",
  authDomain: "sistema-ferias-98f16.firebaseapp.com",
  projectId: "sistema-ferias-98f16",
  storageBucket: "sistema-ferias-98f16.firebasestorage.app",
  messagingSenderId: "157972610485",
  appId: "1:157972610485:web:5ffba923909ab1ca466dfc"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

// ── SANITIZAÇÃO — previne XSS em todo innerHTML dinâmico ──
function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Cache local (evita leituras excessivas)
let _cacheReqs   = null;
let _cacheAudit  = null;
let _cacheNotif  = null;
let _cacheColabs = null;
let _cacheSurveys= null;
let _cacheCfg    = null;

// ── STORAGE — Firestore helpers ──
async function getR() {
  if (_cacheReqs) return _cacheReqs;
  try {
    const snap = await db.collection(col('reqs')).get();
    _cacheReqs = snap.docs.map(d => ({id: d.id, ...d.data()}))
      .sort((a,b) => new Date(b.dataSolicitacao||0) - new Date(a.dataSolicitacao||0));
  } catch(e) {
    console.warn('getR erro:', e.message);
    _cacheReqs = [];
  }
  return _cacheReqs;
}
async function saveRItem(req) {
  await db.collection(col('reqs')).doc(req.id).set(req);
  _cacheReqs = null; // invalida cache
}
async function saveRAll(arr) {
  const batch = db.batch();
  arr.forEach(r => batch.set(db.collection(col('reqs')).doc(r.id), r));
  await batch.commit();
  _cacheReqs = null;
}
async function getA() {
  if (_cacheAudit) return _cacheAudit;
  try {
    const snap = await db.collection(col('audit')).limit(200).get();
    _cacheAudit = snap.docs.map(d => ({id: d.id, ...d.data()}))
      .sort((a,b) => new Date(b.ts||0) - new Date(a.ts||0));
  } catch(e) {
    console.warn('getA erro:', e.message);
    _cacheAudit = [];
  }
  return _cacheAudit;
}
async function saveAItem(entry) {
  await db.collection(col('audit')).doc(entry.id).set(entry);
  _cacheAudit = null;
}
async function getNotif() {
  if (_cacheNotif) return _cacheNotif;
  try {
    const snap = await db.collection(col('notif')).limit(100).get();
    _cacheNotif = snap.docs.map(d => ({id: d.id, ...d.data()}))
      .sort((a,b) => new Date(b.ts||0) - new Date(a.ts||0));
  } catch(e) {
    console.warn('getNotif erro:', e.message);
    _cacheNotif = [];
  }
  return _cacheNotif;
}
// ── BASE ÚNICA DE COLABORADORES ──────────────────────────────────────
// getCols()/saveColsAll()/deleteColItem() liam/escreviam antes numa coleção
// paralela ("colabs") só para o módulo de Férias. Isso duplicava o cadastro
// do colaborador (nome, e-mail, setor, gestor) em dois lugares diferentes.
// Agora tudo aponta para a MESMA base mestra usada pela Gestão de RH
// (coleção "grh_colabs"). Período aquisitivo, saldo e prazos de férias
// passam a ser apenas campos adicionais no mesmo registro do colaborador.
// ── BASE ÚNICA DE COLABORADORES ──────────────────────────────────────
// getCols()/saveColsAll()/deleteColItem() liam/escreviam antes numa coleção
// paralela ("colabs") só para o módulo de Férias. Isso duplicava o cadastro
// do colaborador (nome, e-mail, setor, gestor) em dois lugares diferentes.
// Agora getCols() reaproveita o MESMO cache/coleção da base mestra usada
// pela Gestão de RH (grhGetColabs → "grh_colabs"). Período aquisitivo,
// saldo e prazos de férias passam a ser apenas campos adicionais no mesmo
// registro do colaborador, em vez de um cadastro paralelo.
async function getCols(force = false) {
  const base = (typeof grhGetColabs === 'function') ? await grhGetColabs(force) : [];
  return base.map(data => ({
    id: data._id,
    _id: data._id,
    ...data,
    // Compatibilidade: telas antigas de férias usam nomeGestor/emailGestor;
    // o cadastro mestre usa gestor/gestorEmail. Mantém os dois em sincronia.
    nomeGestor: data.gestor || data.nomeGestor || '',
    emailGestor: data.gestorEmail || data.emailGestor || ''
  }));
}
async function saveColsAll(arr) {
  const batch = db.batch();
  arr.forEach(c => {
    const docId = c.id || c._id;
    if (!docId) return;
    const resto = { ...c };
    delete resto.id; delete resto._id;
    if (resto.nomeGestor && !resto.gestor) resto.gestor = resto.nomeGestor;
    if (resto.emailGestor && !resto.gestorEmail) resto.gestorEmail = resto.emailGestor;
    batch.set(db.collection(col('grh_colabs')).doc(docId), resto, { merge: true });
  });
  await batch.commit();
  _cacheColabs = null;
  if (typeof _grhColabs !== 'undefined') _grhColabs = null;
}
async function deleteColItem(id) {
  // Antes excluía o colaborador da base de férias. Como agora é o mesmo
  // registro mestre usado por Remuneração, Benefícios, Endereços etc.,
  // excluir aqui apagaria o cadastro inteiro do colaborador em todo o
  // sistema. Em vez disso, isso passa a significar "desligar": marca o
  // status como Inativo, que já dispara o registro automático em
  // Desligamentos (mesma regra usada em Colaboradores/Gestão RH).
  await db.collection(col('grh_colabs')).doc(id).update({ status: 'Inativo' });
  _cacheColabs = null;
  if (typeof _grhColabs !== 'undefined') _grhColabs = null;
}
async function getSurveys() {
  if (_cacheSurveys) return _cacheSurveys;
  const snap = await db.collection(col('surveys')).get();
  _cacheSurveys = snap.docs.map(d => ({id: d.id, ...d.data()}));
  return _cacheSurveys;
}
async function saveSurveyItem(s) {
  await db.collection(col('surveys')).doc(s.id).set(s);
  _cacheSurveys = null;
}
async function getCfg() {
  if (_cacheCfg) return _cacheCfg;
  const doc = await db.collection(col('config')).doc('main').get();
  _cacheCfg = doc.exists ? doc.data() : {antecedencia:30, minimo:14};
  return _cacheCfg;
}
async function saveCfg(v) {
  await db.collection(col('config')).doc('main').set(v);
  _cacheCfg = null;
}

// ── NOTIFICAÇÕES ──

async function notify(recipient, name, message, type='info') {
  const n = {id:crypto.randomUUID(), recipient, name, message, type, ts:new Date().toISOString(), read:false};
  await saveNotifItem(n);
  console.log('📧 Notificação para:', recipient, '|', message);
}

async function log(action, detail, icon='📝') {
  const entry = {id:crypto.randomUUID(), action, detail, icon, ts:new Date().toISOString(), role};
  await saveAItem(entry);
}

// ── HELPERS ──
const fmt = d => { if(!d) return '—'; const [y,m,day]=d.split('-'); return `${day}/${m}/${y}`; };
function addDays(ds, n) { const d=new Date(ds+'T12:00:00'); d.setDate(d.getDate()+Number(n)-1); return d.toISOString().split('T')[0]; }
const nearDL = d => { if(!d) return false; const diff=(new Date(d+'T23:59:59')-new Date())/86400000; return diff>=0&&diff<=30; };

function badge(s) {
  const m={'Aguardando gestor':'bp','Em análise pelo RH':'bb','Aprovada':'ba','Reprovada pelo gestor':'br','Reprovada pelo RH':'br','Ajuste solicitado pelo gestor':'bp','Ajuste solicitado pelo RH':'bp'};
  return `<span class="badge ${m[s]||'bp'}">${s||'Aguardando gestor'}</span>`;
}

function hasConflict(req, all) {
  const ns=new Date(req.inicio+'T12:00:00'), ne=new Date(addDays(req.inicio,req.diasFerias||req.dias)+'T12:00:00');
  return all.find(r=>{
    if(!r.inicio||!(r.diasFerias||r.dias)) return false;
    if((r.statusFinal||'').toLowerCase()!=='aprovada') return false;
    if((r.setor||'').toLowerCase()!==(req.setor||'').toLowerCase()) return false;
    if((r.nome||'').toLowerCase()===(req.nome||'').toLowerCase()) return false;
    const rs=new Date(r.inicio+'T12:00:00'), re=new Date(addDays(r.inicio,r.diasFerias||r.dias)+'T12:00:00');
    return ns<=re && rs<=ne;
  });
}

function getImpacto(req, all) {
  const ns = new Date(req.inicio + 'T12:00:00');
  const ne = new Date(addDays(req.inicio, req.diasFerias || req.dias) + 'T12:00:00');
  
  // Filtrar aprovadas no mesmo setor
  const aprovadasSetor = all.filter(r => 
    r.statusFinal === 'Aprovada' && 
    (r.setor || '').toLowerCase() === (req.setor || '').toLowerCase() &&
    r.id !== req.id
  );

  // Contar quantas pessoas estarão de férias simultaneamente em qualquer dia do período solicitado
  let maxSimultaneo = 0;
  let nomesConflito = new Set();

  for (let d = new Date(ns); d <= ne; d.setDate(d.getDate() + 1)) {
    const diaStr = d.toISOString().split('T')[0];
    const noDia = aprovadasSetor.filter(r => {
      const rs = new Date(r.inicio + 'T12:00:00');
      const re = new Date(addDays(r.inicio, r.diasFerias || r.dias) + 'T12:00:00');
      const estaNoDia = d >= rs && d <= re;
      if (estaNoDia) nomesConflito.add(r.nome);
      return estaNoDia;
    });
    if (noDia.length > maxSimultaneo) maxSimultaneo = noDia.length;
  }

  // Regra de negócio: Limite do setor (exemplo: máximo 2 pessoas simultâneas por setor)
  const limiteSetor = 2; 
  
  if (maxSimultaneo >= limiteSetor) {
    return {
      tipo: 'danger',
      icon: '🔴',
      msg: `Limite do setor será ultrapassado (${maxSimultaneo + 1} pessoas simultâneas)`,
      detalhe: `Já existem ${maxSimultaneo} pessoas de férias: ${Array.from(nomesConflito).join(', ')}`
    };
  } else if (maxSimultaneo > 0) {
    return {
      tipo: 'warning',
      icon: '⚠️',
      msg: `Já existem ${maxSimultaneo} pessoa${maxSimultaneo > 1 ? 's' : ''} de férias nesse período`,
      detalhe: `Conflito com: ${Array.from(nomesConflito).join(', ')}`
    };
  } else {
    return {
      tipo: 'success',
      icon: '🟢',
      msg: 'Sem conflito',
      detalhe: 'Nenhum outro colaborador do setor estará de férias neste período.'
    };
  }
}

// ── LOGIN ──
async function selectRole(r, el) {
  loginRole = r;
  try { sessionStorage.setItem('imexPreferredRole', r); } catch(e) {}
  document.querySelectorAll('.role-btn').forEach(b=>b.classList.remove('selected'));
  if (el) el.classList.add('selected');
}

async function updateColResumo() {
  if (role !== 'colaborador' && role !== 'rh') return;
  const email = sessionStorage.getItem('userEmail');
  const allReqs = await getR();
  const allCols = await getCols();
  
  // Tentar achar na base de colaboradores (legada)
  let colData = allCols.find(c => c.email === email);
  
  // Se não achar na legada, buscar na nova base de Gestão de RH
  if (!colData) {
    const grhCols = await grhGetColabs();
    const gc = grhCols.find(c => c.email === email);
    if (gc) {
      colData = {
        nome: gc.nome,
        email: gc.email,
        setor: gc.setor,
        saldo: gc.saldo || 30, // Padrão se não houver
        periodoAquisitivo: gc.periodoAquisitivo || '2023/2024',
        prazoLimite: gc.prazoLimite || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        nomeGestor: gc.nomeGestor || 'RH',
        emailGestor: gc.emailGestor || '',
        tipoContrato: gc.clt === 'Sim' ? 'CLT' : 'PJ'
      };
    }
  }
  
  // Se não achar, tenta pegar da última solicitação
  if (!colData) {
    const lastReq = allReqs.filter(r => r.email === email).sort((a,b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao))[0];
    if (lastReq) {
      colData = {
        nome: lastReq.nome,
        email: lastReq.email,
        setor: lastReq.setor,
        saldo: lastReq.saldo,
        periodoAquisitivo: lastReq.periodoAquisitivo,
        prazoLimite: lastReq.prazoLimite,
        nomeGestor: lastReq.nomeGestor,
        emailGestor: lastReq.emailGestor,
        tipoContrato: lastReq.tipoContrato
      };
    }
  }

  // Nenhum dado encontrado — exibir estado vazio sem inventar informações
  if (!colData) {
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('colResumoSaldo',   '—');
    el('colResumoPeriodo', '—');
    el('colResumoPrazo',   '—');
    el('colResumoUsados',  '0');
    el('colResumoAbono',   '—');
    const statusEl = document.getElementById('colResumoStatus');
    if (statusEl) { statusEl.textContent = 'Cadastro não encontrado'; statusEl.style.color = 'var(--ink-30)'; }
    const sugDiv = document.getElementById('colSugestao');
    if (sugDiv) sugDiv.style.display = 'none';
    // Notificar RH para completar o cadastro
    addNotif('⚠️ Seu cadastro não foi localizado. Solicite ao RH que complete seu registro no sistema.', 'warning');
    return;
  }

  // Calcular dias já utilizados (aprovados)
  const usados = allReqs.filter(r => r.email === email && r.statusFinal === 'Aprovada').reduce((acc, r) => acc + (r.diasFerias || 0), 0);

  // Atualizar Dashboard do Colaborador
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('colResumoSaldo', colData.saldo + ' dias');
  el('colResumoPeriodo', colData.periodoAquisitivo);
  el('colResumoPrazo', fmt(colData.prazoLimite));
  el('colResumoUsados', usados);
  el('colResumoAbono', colData.saldo >= 10 ? '10 dias' : 'Indisponível');
  
  const statusEl = document.getElementById('colResumoStatus');
  if (statusEl) {
    if (colData.saldo <= 0) {
      statusEl.textContent = 'Saldo esgotado';
      statusEl.style.color = 'var(--ink-30)';
    } else if (nearDL(colData.prazoLimite)) {
      statusEl.textContent = '⚠️ Prazo próximo!';
      statusEl.style.color = 'var(--rust)';
    } else {
      statusEl.textContent = 'Disponível para uso';
      statusEl.style.color = 'var(--forest)';
    }
  }

  // Pré-preencher formulário
  const setVal = (id, val) => { const e = document.getElementById(id); if (e && val) e.value = val; };
  setVal('fNome', colData.nome);
  setVal('fEmail', colData.email);
  setVal('fSetor', colData.setor);
  setVal('fContrato', colData.tipoContrato);
  setVal('fPeriodo', colData.periodoAquisitivo);
  setVal('fSaldo', colData.saldo);
  setVal('fNomeGestor', colData.nomeGestor);
  setVal('fEmailGestor', colData.emailGestor);
  
  // Atualizar resumo do formulário
  updateResumo();

  // ── ALERTAS AUTOMÁTICOS ──
  const list = document.getElementById('notifList');
  if (list) {
    // Buscar notificações já persistidas no Firestore para este colaborador
    // para evitar duplicatas entre sessões
    const notifKey = `alertas_${email}`;
    let alertasDisparados = {};
    try {
      const snap = await db.collection(col('alertasEnviados')).doc(email.replace(/[@.]/g,'_')).get();
      alertasDisparados = snap.exists ? snap.data() : {};
    } catch(e) {}

    const hoje = new Date().toISOString().split('T')[0];

    // 1. Alerta de Vencimento (60 dias)
    const d60 = new Date(); d60.setDate(d60.getDate() + 60);
    const d60s = d60.toISOString().split('T')[0];
    if (colData.prazoLimite && colData.prazoLimite <= d60s) {
      const chave = `venc60_${colData.prazoLimite}`;
      if (!alertasDisparados[chave]) {
        addNotif(`⏰ Suas férias vencem em ${Math.max(0,Math.ceil((new Date(colData.prazoLimite+'T23:59:59')-new Date())/86400000))} dias (${fmt(colData.prazoLimite)}). Programe agora!`, 'warning');
        alertasDisparados[chave] = hoje;
      }
    }

    // 2. Alerta de Falta de Programação (saldo disponível e nenhuma férias ativa)
    const temProgramada = allReqs.some(r =>
      r.email === email &&
      ['Aguardando gestor', 'Em análise pelo RH', 'Aprovada'].includes(r.statusFinal)
    );
    if (!temProgramada && colData.saldo >= 15) {
      const chave = `semProgram_${colData.periodoAquisitivo || hoje.slice(0,7)}`;
      if (!alertasDisparados[chave]) {
        addNotif(`📅 Você ainda não programou suas férias e tem ${colData.saldo} dias disponíveis. Que tal planejar seu descanso?`, 'info');
        alertasDisparados[chave] = hoje;
      }
    }

    // 3. Alerta de Aprovação (janela de 7 dias após aprovação)
    const ultimaAprovada = allReqs
      .filter(r => r.email === email && r.statusFinal === 'Aprovada')
      .sort((a,b) => new Date(b.ultimaAtualizacao) - new Date(a.ultimaAtualizacao))[0];
    if (ultimaAprovada) {
      const chave = `aprov_${ultimaAprovada.id || ultimaAprovada.inicio}`;
      if (!alertasDisparados[chave]) {
        addNotif(`🎉 Sua solicitação de férias foi aprovada! Início: ${fmt(ultimaAprovada.inicio)}. Boas férias!`, 'success');
        alertasDisparados[chave] = hoje;
      }
    }

    // Persistir no Firestore para não repetir entre sessões
    try {
      await db.collection(col('alertasEnviados')).doc(email.replace(/[@.]/g,'_')).set(alertasDisparados);
    } catch(e) {}
  }

  // ── SUGESTÃO AUTOMÁTICA ──
  const sugDiv = document.getElementById('colSugestao');
  if (sugDiv) {
    let htmlSug = '';
    if (colData.saldo >= 30) {
      htmlSug = `👉 <strong>Sugestão:</strong> Você pode tirar 20 dias de descanso + vender 10 dias (abono).`;
    } else if (colData.saldo >= 15) {
      htmlSug = `👉 <strong>Sugestão:</strong> Que tal fracionar? Você pode tirar 15 dias agora e guardar o restante.`;
    } else if (colData.saldo > 0) {
      htmlSug = `👉 <strong>Sugestão:</strong> Você tem um saldo curto, aproveite para estender um feriado próximo!`;
    }
    
    if (htmlSug) {
      sugDiv.innerHTML = `<div style="background:var(--pur-soft); border:1px dashed var(--pur); padding:12px; border-radius:10px; font-size:13px; color:var(--pur-dark); margin-top:15px; animation: pulse 2s infinite;">${htmlSug}</div>`;
      sugDiv.style.display = 'block';
    } else {
      sugDiv.style.display = 'none';
    }
  }
}

async function doLogout() {
  try { await log('Logout','Perfil: '+(PLBL&&PLBL[role]||role||''),'🚪'); } catch(e){}
  try { if(typeof auth !== 'undefined' && auth && auth.signOut) await auth.signOut(); } catch(e){}

  // Guarda o último perfil usado antes de limpar a sessão — sem isso, o
  // próximo login sempre cai em "colaborador" (padrão), mesmo para quem é
  // RH, a não ser que clique manualmente no seletor de perfil da tela de
  // login. Mantendo essa preferência, o login seguinte já abre na visão
  // correta automaticamente.
  var ultimoPerfil = null;
  try { ultimoPerfil = sessionStorage.getItem('imexPreferredRole'); } catch(e){}

  // Limpar TODAS as variáveis de estado
  role=null; loginRole=null; currentUserData=null; currentUnidade=null;
  try{ _roleReal=null; }catch(e){}
  window.role=null; window._roleReal=null; window.currentUserData=null; window.currentUnidade=null;

  // Limpar estado centralizado se disponível
  if (window.__IMEX_STATE) {
    window.__IMEX_STATE.user = null;
    window.__IMEX_STATE.email = null;
    window.__IMEX_STATE.role = 'colaborador';
    window.__IMEX_STATE.roleReal = null;
    window.__IMEX_STATE.isAuthenticated = false;
    window.__IMEX_STATE.sessionStartTime = null;
  }

  _cacheReqs=null; _cacheAudit=null; _cacheNotif=null;
  _cacheColabs=null; _cacheSurveys=null; _cacheCfg=null;

  try { sessionStorage.clear(); } catch(e){}
  try { if(ultimoPerfil) sessionStorage.setItem('imexPreferredRole', ultimoPerfil); } catch(e){}
  try { localStorage.removeItem('imexRole'); localStorage.removeItem('imexUser'); } catch(e){}

  // Limpar flags de login
  window.__loginEmAndamento = false;
  window.__restoringSession = false;
  try { sessionStorage.removeItem('__lastLoginTime'); } catch(e){}
  var lEmail=document.getElementById('lEmail'); if(lEmail) lEmail.value='';
  var lPass=document.getElementById('lPass'); if(lPass) lPass.value='';
  var lErr=document.getElementById('lErr'); if(lErr) lErr.style.display='none';
  var ls=document.getElementById('loginScreen'); if(ls) ls.style.display='flex';
  var app=document.getElementById('appShell'); if(app) app.style.display='none';
}

function renderMeuDesenvolvimento() {
  const box = document.getElementById('meu-dev-resumo');
  if (!box) return;
  const u = currentUserData || {};
  const cargo = u.cargo || u.funcao || 'Cargo não informado';
  const setor = u.setor || 'Setor não informado';
  const nome = u.nome || sessionStorage.getItem('userName') || 'Colaborador';
  const proximo = descobrirProximoCargo(cargo, setor);
  box.innerHTML = `<b style="color:#0047FF">${nome}</b><br>
    <b>Cargo atual:</b> ${cargo}<br>
    <b>Setor:</b> ${setor}<br>
    <b>Próximo passo sugerido:</b> ${proximo || 'Fim de trilha ou próximo cargo ainda não cadastrado'}<br>
    <span style="color:#64748b">As recomendações abaixo podem ser alimentadas pelo RH no PDI e pelas trilhas de carreira.</span>`;

  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  set('meu-dev-trilha', `<b>Minha trilha</b><small style="display:block;color:#64748b;margin-top:4px">${cargo}${proximo ? ' → ' + proximo : ''}</small>`);
  set('meu-dev-pdi', '<b>PDI</b><small style="display:block;color:#64748b;margin-top:4px">Metas, prazos e ações de desenvolvimento</small>');
  set('meu-dev-competencias', '<b>Competências</b><small style="display:block;color:#64748b;margin-top:4px">Técnicas, comportamentais e liderança</small>');
  set('meu-dev-feedbacks', '<b>Feedbacks</b><small style="display:block;color:#64748b;margin-top:4px">Acompanhamentos do gestor e RH</small>');
  set('meu-dev-cursos', '<b>Cursos</b><small style="display:block;color:#64748b;margin-top:4px">Recomendações conforme próximo cargo</small>');
  set('meu-dev-evolucao', '<b>Evolução</b><small style="display:block;color:#64748b;margin-top:4px">Histórico de crescimento e conquistas</small>');
}

function descobrirProximoCargo(cargoAtual, setorAtual) {
  try {
    const cargoNorm = String(cargoAtual || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const trilhas = (typeof TRILHAS_CARREIRA !== 'undefined' && Array.isArray(TRILHAS_CARREIRA)) ? TRILHAS_CARREIRA : [];
    for (const trilha of trilhas) {
      const cargos = trilha.cargos || [];
      const idx = cargos.findIndex(c => String(c.nome || c).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'') === cargoNorm);
      if (idx >= 0 && cargos[idx+1]) return cargos[idx+1].nome || cargos[idx+1];
    }
  } catch(e) {}
  return '';
}

// ── APLICA CONTEXTO DE PERFIL NO MÓDULO MEU DESENVOLVIMENTO ──
// Garante que o módulo exibe dados do colaborador correto conforme perfil ativo
function aplicarMeuDesenvolvimentoPorPerfil() {
  // Atualiza o módulo Meu Desenvolvimento com dados do usuário atual
  // (só recarrega se a view estiver visível para não causar piscar)
  const vDev = document.getElementById('view-meu-desenvolvimento');
  if (vDev && vDev.style.display !== 'none') {
    if (typeof AlineCarreira !== 'undefined' && AlineCarreira.renderMeuDesenvolvimento) {
      AlineCarreira.renderMeuDesenvolvimento();
    }
  }
}
const ROLE_ACCESS = {
  // ── COLABORADOR: 8 módulos principais limpos ──
  colaborador: [
    'intranet',
    'estrutura-carreira',
    'desenvolvimento',
    'pesquisas',
    'beneficios',
    'solicitacao',
    'conecta-ai',
    'ouvidoria',
    // sub-módulos acessíveis via HUB (não aparecem no menu principal)
    'organograma',
    'trilhas',
    'experiencia',
    'cargos',
    'disc',
    'meu-desenvolvimento',
  ],

  // ── GESTOR: herda colaborador + painel gestor ──
  gestor: [
    'intranet',
    'estrutura-carreira',
    'desenvolvimento',
    'pesquisas',
    'beneficios',
    'solicitacao',
    'conecta-ai',
    'ouvidoria',
    'gestor',
    'organograma',
    'trilhas',
    'experiencia',
    'cargos',
    'disc',
    'meu-desenvolvimento',
  ],

  // ── RH: 7 módulos principais ──
  rh: [
    'gestao-rh',
    'desenvolvimento-talentos',
    'pesquisas',
    'dashboard',
    'ouvidoria',
    'conecta-ai',
    'auditoria',
    // sub-módulos acessíveis via HUB
    'experiencia',
    'disc',
    'cargos',
    'trilhas',
    'pdi',
    'usuarios',
  ],

  'rh-colaborador': [
    'gestao-rh',
    'desenvolvimento-talentos',
    'pesquisas',
    'dashboard',
    'ouvidoria',
    'conecta-ai',
    'auditoria',
    'experiencia',
    'disc',
    'cargos',
    'trilhas',
    'pdi',
    'usuarios',
  ],
};

const TAB_META = {
  // ── COLABORADOR — 8 módulos principais ──
  intranet:              {icon:'🏠', label:'Intranet'},
  'estrutura-carreira':  {icon:'🏢', label:'Estrutura e Carreira'},
  desenvolvimento:       {icon:'🌱', label:'Desenvolvimento'},
  pesquisas:             {icon:'📋', label:'Pesquisas'},
  beneficios:            {icon:'🎁', label:'Meus Benefícios'},
  solicitacao:           {icon:'🌴', label:'Férias'},
  'conecta-ai':          {icon:'🤖', label:'Conecta AI'},
  ouvidoria:             {icon:'📢', label:'Ouvidoria'},
  // sub-módulos colaborador
  organograma:           {icon:'🏢', label:'Organograma'},
  trilhas:               {icon:'🚀', label:'Trilhas de Carreira'},
  experiencia:           {icon:'📆', label:'Minha Experiência'},
  cargos:                {icon:'📄', label:'Descritivo de Cargos'},
  disc:                  {icon:'🧠', label:'DISC'},
  'meu-desenvolvimento': {icon:'✨', label:'Meu Desenvolvimento'},
  // ── RH — 7 módulos principais ──
  'gestao-rh':              {icon:'🏢', label:'Gestão RH'},
  'desenvolvimento-talentos':{icon:'🌱', label:'Desenvolvimento & Talentos'},
  dashboard:                {icon:'📊', label:'Dashboard RH'},
  'ouvidoria-rh':           {icon:'📢', label:'Ouvidoria RH'},
  'conecta-ai-rh':          {icon:'🤖', label:'Conecta AI RH'},
  auditoria:                {icon:'📝', label:'Auditoria'},
  // sub-módulos RH
  pdi:                   {icon:'🎯', label:'PDI'},
  usuarios:              {icon:'🔑', label:'Gestão de Acessos'},
  // legados
  gestor:                {icon:'👔', label:'Gestor'},
  rh:                    {icon:'🏢', label:'RH'},
  dashboard:             {icon:'📊', label:'Dashboard'},
  colaboradores:         {icon:'👥', label:'Colaboradores'},
};

// ── PERFIL ATIVO (para troca de visão RH ↔ Colaborador) ──
let _roleReal = null;       // role original do usuário
let _roleAtivo = null;      // role atualmente ativo na UI

const RH_ONLY_MODULES_CORE = ['gestao-rh','rh','dashboard','auditoria','usuarios','desenvolvimento-talentos'];

function perfilAtivoSeguro() {
  // Prioridade de leitura: estado centralizado > sessionStorage > DOM > fallback
  let r = null;

  // 1. Tentar estado centralizado
  if (window.__IMEX_STATE && window.__IMEX_STATE.role) {
    r = String(window.__IMEX_STATE.role).toLowerCase().trim();
  }

  // 2. Fallback para sessionStorage
  if (!r || r === 'null') {
    r = String(sessionStorage.getItem('userRole') || '').toLowerCase().trim();
  }

  // 3. Fallback para variável global
  if (!r || r === 'null') {
    r = String(role || '').toLowerCase().trim();
  }

  // 4. Fallback para label visual (último recurso)
  if (!r || r === 'null') {
    const label = (document.getElementById('pLabel')?.textContent || '').toLowerCase();
    if (label.includes('colaborador')) r = 'colaborador';
    else if (label.includes('gestor')) r = 'gestor';
    else if (label.includes('rh')) r = 'rh';
  }

  // Normalizar valores especiais
  if (r === 'rh-colaborador') return 'colaborador';

  // Garantir que é válido
  return ROLE_ACCESS[r] ? r : 'colaborador';
}

function moduloPermitidoParaPerfil(id) {
  const perfil = perfilAtivoSeguro();
  if (perfil !== 'rh' && RH_ONLY_MODULES_CORE.includes(id)) return false;
  return (ROLE_ACCESS[perfil] || ROLE_ACCESS.colaborador).includes(id);
}

function buildSidebar() {
  if (!_roleReal) _roleReal = role;
  _roleAtivo = perfilAtivoSeguro();

  const allowed = ROLE_ACCESS[_roleAtivo] || ROLE_ACCESS.colaborador;
  const sidebar = document.getElementById('sidebar');
  const spacer = sidebar ? sidebar.querySelector('.sb-spacer') : null;

  // Ordem final aprovada:
  // Intranet → Descritivo → Conecta AI → Gestor → Gestão RH → Pesquisas → Gestão de Acessos → Ouvidoria
  // Para colaborador/gestor, Férias aparece logo após Intranet. Para RH, Férias fica apenas dentro da Gestão RH.
  const finalOrder = [
    'intranet',
    'meu-desenvolvimento',
    'solicitacao',
    'gestor',
    'disc',
    'cargos',
    'conecta-ai',
    'gestao-rh',
    'pesquisas',
    'usuarios',
    'ouvidoria',
    'organograma',
    'trilhas',
    'experiencia',
    'beneficios'
  ];

  if (sidebar && spacer) {
    finalOrder.forEach(id => {
      const el = document.getElementById('sb-' + id);
      if (el) sidebar.insertBefore(el, spacer);
    });
  }

  // Mostra apenas os módulos permitidos para o perfil ativo
  Object.keys(TAB_META).forEach(id => {
    const el = document.getElementById('sb-' + id);
    if (el) el.style.display = allowed.includes(id) ? '' : 'none';
  });

  // Oculta definitivamente painéis antigos/duplicados que não fazem parte do menu final
  ['dashboard','auditoria','pdi','rh'].forEach(id => {
    const el = document.getElementById('sb-' + id);
    if (el) el.style.display = 'none';
  });

  // Destaque visual para Gestão RH
  const gestaoRh = document.getElementById('sb-gestao-rh');
  if (gestaoRh) gestaoRh.classList.add('sb-rh-highlight');

  // Ouvidoria sempre por último antes do sair
  const ouvidoria = document.getElementById('sb-ouvidoria');
  if (sidebar && spacer && ouvidoria && allowed.includes('ouvidoria')) {
    sidebar.insertBefore(ouvidoria, spacer);
  }

  if (allowed.length) switchView(_roleAtivo === 'rh' ? allowed[0] : 'intranet');

  aplicarPermissoesUI();
  aplicarMeuDesenvolvimentoPorPerfil();

  const btnTrocar = document.getElementById('btnTrocarPerfil');
  if (btnTrocar) {
    btnTrocar.style.display = (_roleReal === 'rh' || _roleReal === 'gestor' || _roleReal === 'rh-colaborador') ? '' : 'none';
    const lbl = document.getElementById('btnTrocarPerfilLabel');
    if (lbl) lbl.textContent = (role !== 'colaborador') ? '👤 Minha Visão' : ('🏢 Voltar: ' + PLBL[_roleReal]);
  }
}

// ── PROTEÇÃO CONTRA SOBRESCRITA DE buildSidebar ──
// Diversos patches legacies sobrescrevem buildSidebar, causando oscilações.
// Esta versão CONSOLIDADA é a única que deve ser usada.
// Qualquer tentativa de sobrescrita é registrada (logging) mas não permitida.
(function() {
  const originalBuildSidebar = buildSidebar;

  // Não proteger - permitir sobrescrita por patches
  window.buildSidebar = originalBuildSidebar;
  console.log('[SEGURANÇA] buildSidebar definida (permitindo sobrescrita)');
})();

// ── PERMISSÕES DE UI POR PERFIL ──────────────────────────────────────
function aplicarPermissoesUI() {
  const isColab = role === 'colaborador';
  const isRHGestor = role === 'rh' || role === 'gestor';

  // INTRANET: colaborador só lê, não publica
  // Todos podem publicar na intranet
  // const btnPublicar = document.getElementById('intra-btn-publicar');

  // PESQUISAS: colaborador só responde, não cria
  const btnCriarPesq = document.getElementById('pesq-btn-criar');
  if (btnCriarPesq) btnCriarPesq.style.display = isColab ? 'none' : '';
  const descPesq = document.getElementById('pesq-desc-txt');
  if (descPesq) {
    descPesq.textContent = isColab
      ? 'Participe das pesquisas abertas e contribua com o desenvolvimento da equipe.'
      : 'Crie pesquisas e colete respostas da equipe de forma anônima ou identificada.';
  }

  // DESCRITIVO DE CARGOS:
  // Colaborador: só preenche a auto descrição (ocultar painel IA)
  // RH/Gestor: vê tudo
  const cardIA = document.getElementById('cargos-card-ia');
  const cargosGrid = document.getElementById('cargos-grid');
  if (cardIA) cardIA.style.display = isColab ? 'none' : '';
  if (cargosGrid) {
    cargosGrid.style.gridTemplateColumns = isColab ? '1fr' : '1fr 1.15fr';
    cargosGrid.style.maxWidth = isColab ? '680px' : '';
  }

  // Pré-preencher nome do colaborador no campo de auto descrição
  if (isColab) {
    const nome = sessionStorage.getItem('userName') || '';
    const campoColab = document.getElementById('cargo-colab');
    if (campoColab && nome) { campoColab.value = nome; campoColab.readOnly = true; }
    const campoPDIColab = document.getElementById('pdi-colab');
    if (campoPDIColab && nome) { campoPDIColab.value = nome; }
  }
}

function trocarPerfil() {
  if (!_roleReal) return;
  // rh-colaborador alterna entre visão colaborador e visão rh
  const roleRH = _roleReal === 'rh-colaborador' ? 'rh' : _roleReal;
  if (role === 'colaborador') {
    role = roleRH;
  } else {
    role = 'colaborador';
  }
  // Atualiza topbar
  document.getElementById('pLabel').textContent = PLBL[role];
  document.getElementById('pDot').textContent   = PDOT[role];
  const lbl = document.getElementById('btnTrocarPerfilLabel');
  if (lbl) lbl.textContent = (role !== 'colaborador') ? '👤 Minha Visão' : ('🏢 Voltar: ' + PLBL[_roleReal]);

  // Reconstruir sidebar e permissões usando a arquitetura final
  buildSidebar();
  enforcePermissions();
  aplicarPermissoesUI();
  aplicarMeuDesenvolvimentoPorPerfil();

  // Carregar resumo do colaborador se entrou na visão colaborador
  if (role === 'colaborador') {
    setTimeout(() => updateColResumo(), 200);
  }
}

function sbNav(v) {
  switchView(v);
}

function switchView(v) {
  v = String(v || '').trim();
  if (v === 'rh') v = 'gestao-rh';
  if (!moduloPermitidoParaPerfil(v)) v = 'intranet';
  if (perfilAtivoSeguro() !== 'rh' && RH_ONLY_MODULES_CORE.includes(v)) v = 'intranet';

  // Todas as views (incluindo usuarios)
  const allViews = [...(TABS||[]).map(t=>t.id), 'calendario', 'usuarios', 'gestao-rh', 'desenvolvimento-talentos', 'intranet', 'pesquisas', 'disc', 'pdi', 'cargos', 'selecao', 'ouvidoria', 'conecta-ai','meu-desenvolvimento','organograma','trilhas','experiencia','beneficios','estrutura-carreira','desenvolvimento','dashboard','auditoria'];
  allViews.forEach(id=>{
    const el=document.getElementById('view-'+id);
    if(el) el.style.setProperty('display', id===v ? 'block' : 'none', 'important');
    const sb=document.getElementById('sb-'+id);
    if(sb) sb.classList.toggle('active',id===v);
  });
  
  // Controle da visibilidade da caixa HERO
  const hero = document.getElementById('mainHero');
  const viewsWithHero = ['solicitacao', 'gestor', 'rh'];
  if (hero) {
    hero.style.display = viewsWithHero.includes(v) ? 'flex' : 'none';
  }
  const meta=TAB_META[v];
  if(meta){
    const pi=document.getElementById('tPageIcon'); if(pi) pi.textContent=meta.icon;
    const pt=document.getElementById('tPageTitle'); if(pt) pt.textContent=meta.label;
  }
  if(v==='calendario') renderCal();
  if(v==='dashboard' && perfilAtivoSeguro()==='rh')  renderDash();
  if(v==='auditoria' && perfilAtivoSeguro()==='rh')  renderAudit();
  if(v==='gestor')     renderGestor();
  if(v==='rh' && perfilAtivoSeguro()==='rh')         { renderRH(); if(!politicaState) politicaCarregar(); }
  if(v==='colaboradores'){renderColabs();updateColStats();}
  if(v==='usuarios' && perfilAtivoSeguro()==='rh')   carregarUsuarios();
  if(v==='gestao-rh' && perfilAtivoSeguro()==='rh')  gestaoRhCarregar();
  if(v==='intranet')   intraCarregar();
  if(v==='pesquisas')  pesqCarregar();
  if(v==='disc')       discCarregar();
  if(v==='pdi')        pdiCarregar();
  if(v==='cargos')     cargosCarregar();
  if(v==='organograma') orgCarregar();
  if(v==='estrutura-carreira') { /* HUB — AlineCarreira é inicializado por script próprio */ }
  if(v==='desenvolvimento')    { /* HUB — AlineCarreira.go() aciona sub-módulos */ }
  if(v==='meu-desenvolvimento') {
    // Atualiza com dados reais do usuário logado
    if (typeof AlineCarreira !== 'undefined' && typeof AlineCarreira.renderMeuDesenvolvimento === 'function') {
      AlineCarreira.renderMeuDesenvolvimento();
    } else if (typeof renderMeuDesenvolvimento === 'function') {
      renderMeuDesenvolvimento();
    }
  }
  if(v==='desenvolvimento-talentos') { /* HUB RH estático */ }
  if(v==='trilhas')    trilhasCarregar();
  if(v==='experiencia') expCarregar();
  if(v==='beneficios') benCarregar();

  // Reaplicar permissões de UI ao trocar de painel
  if (typeof aplicarPermissoesUI === 'function') aplicarPermissoesUI();
}

// ── PROTEÇÃO CONTRA SOBRESCRITA DE switchView ──
// Alguns patches legacies tentam redefine switchView, causando comportamento impredizível.
(function() {
  const originalSwitchView = switchView;

  // Não proteger - permitir sobrescrita por patches
  window.switchView = originalSwitchView;
  console.log('[SEGURANÇA] switchView definida (permitindo sobrescrita)');
})();

// ── FRACIONAMENTO CLT ──
// ── ABONO ──
let abonoDias = 0;

function selAbono(val, el) {
  document.getElementById('fAbono').value = val;
  document.querySelectorAll('.abono-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  const wrap = document.getElementById('abonoQtdWrap');
  if (val === 'Sim') {
    wrap.style.display = 'block';
    if (abonoDias === 0) { abonoDias = 1; document.getElementById('abonoDiasVal').textContent = 1; }
  } else {
    wrap.style.display = 'none';
    abonoDias = 0;
  }
  document.getElementById('fAbonoDias').value = abonoDias;
  updateFracao();
  updateResumo();
}

function changeAbonoDias(delta) {
  const saldo = Number(document.getElementById('fSaldo')?.value || 30);
  const diasDescansoMin = 14; // CLT mínimo
  const maxAbono = Math.min(10, saldo - diasDescansoMin);
  abonoDias = Math.max(1, Math.min(maxAbono, abonoDias + delta));
  document.getElementById('abonoDiasVal').textContent = abonoDias;
  document.getElementById('fAbonoDias').value = abonoDias;
  updateFracao();
  updateResumo();
}

// ── FRACIONAMENTO ──
let nPeriodos = 1;
let diasPeriodos = [30];

function getDescanso() {
  const saldo = Number(document.getElementById('fSaldo')?.value || 30);
  const abono = document.getElementById('fAbono')?.value === 'Sim' ? abonoDias : 0;
  return saldo - abono;
}

function selFracao(n, el) {
  nPeriodos = n;
  document.getElementById('fNPeriodos').value = n;
  document.querySelectorAll('#fracaoWrap .abono-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  const descanso = getDescanso();
  // Distribuir dias iniciais
  if (n === 1) diasPeriodos = [descanso];
  else if (n === 2) diasPeriodos = [14, descanso - 14];
  else diasPeriodos = [14, Math.ceil((descanso-14)/2), Math.floor((descanso-14)/2)];
  renderPeriodos();
  updateResumo();
}

function changePeriodo(idx, delta) {
  const descanso = getDescanso();
  const old = diasPeriodos[idx];
  let novo = old + delta;
  // Garante que não vai abaixo de 5 (ou 14 para idx 0) e não ultrapassa o total
  const minimo = idx === 0 ? 14 : 5;
  if (novo < minimo) return;
  // Verifica se tem dias disponíveis para redistribuir
  const total = diasPeriodos.reduce((a,b)=>a+b,0);
  if (delta > 0 && total >= descanso) return;
  if (delta < 0 && total <= descanso - (descanso - diasPeriodos.reduce((a,b)=>a+b,0))) {
    // verifica se algum outro período ficaria negativo — só reduz se ok
  }
  diasPeriodos[idx] = novo;
  renderPeriodos();
  updateResumo();
}

function renderPeriodos() {
  const wrap = document.getElementById('periodosWrap');
  const validMsg = document.getElementById('fracaoValidMsg');
  const descanso = getDescanso();
  const total = diasPeriodos.reduce((a,b)=>a+b,0);

  // Update label
  const lbl = document.getElementById('diasDescansoLabel');
  if (lbl) lbl.textContent = descanso;

  // Validação CLT
  const erros = [];
  if (nPeriodos > 1 && Math.max(...diasPeriodos) < 14)
    erros.push('Um dos períodos deve ter no mínimo 14 dias corridos (CLT art. 134).');
  diasPeriodos.forEach((d,i) => { if (d < 5) erros.push(`${i+1}º período não pode ser inferior a 5 dias.`); });
  if (total !== descanso)
    erros.push(`Total dos períodos (${total}) deve ser igual ao saldo de descanso (${descanso} dias).`);

  // Sugestões se inválido
  let sugestoes = '';
  if (erros.length && nPeriodos === 2) {
    const s1 = 14, s2 = descanso - 14;
    if (s2 >= 5) sugestoes = `<button type="button" class="btn btn-g btn-sm" onclick="diasPeriodos=[${s1},${s2}];renderPeriodos();updateResumo()">Sugestão: ${s1} + ${s2} dias</button>`;
  } else if (erros.length && nPeriodos === 3) {
    const s1=14, resto=descanso-14, s2=Math.ceil(resto/2), s3=Math.floor(resto/2);
    if (s2>=5 && s3>=5) sugestoes = `<button type="button" class="btn btn-g btn-sm" onclick="diasPeriodos=[${s1},${s2},${s3}];renderPeriodos();updateResumo()">Sugestão: ${s1} + ${s2} + ${s3} dias</button>`;
  }

  const ordinals = ['1º','2º','3º'];
  let html = '<div style="display:flex;flex-direction:column;gap:12px">';
  diasPeriodos.forEach((d, i) => {
    const minimo = i === 0 ? 14 : 5;
    html += `
      <div style="background:var(--pur-soft);border:1px solid rgba(123,47,247,0.15);border-radius:12px;padding:14px 16px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--pur);margin-bottom:10px">${ordinals[i]} Período</div>
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:8px">
            <button type="button" class="btn btn-g btn-sm" onclick="changePeriodo(${i},-1)" style="width:32px;height:32px;padding:0;font-size:16px;justify-content:center">−</button>
            <span style="font-size:22px;font-weight:800;color:var(--pur);min-width:40px;text-align:center">${d}</span>
            <button type="button" class="btn btn-g btn-sm" onclick="changePeriodo(${i},1)" style="width:32px;height:32px;padding:0;font-size:16px;justify-content:center">+</button>
            <span style="font-size:13px;color:var(--ink-60)">dias</span>
          </div>
          <div style="font-size:12px;color:var(--ink-30)">mín. ${minimo} dias</div>
        </div>
        <div style="margin-top:10px">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-60)">Data de início</label>
          <input type="date" name="periodo${i+1}Ini" id="fPeriodo${i+1}Ini" style="margin-top:4px;max-width:200px" ${i===0?'required':''}/>
        </div>
      </div>`;
  });
  html += '</div>';

  // Total indicator
  const totalOk = total === descanso;
  html += `<div style="margin-top:10px;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:600;background:${totalOk?'var(--g-green-s)':'var(--g-orange-s)'};color:${totalOk?'#1b5e20':'#e65100'}">
    ${totalOk ? '✅' : '⚠️'} Total: ${total} / ${descanso} dias${totalOk ? ' — OK!' : ' — ajuste os períodos'}
  </div>`;

  wrap.innerHTML = html;

  if (erros.length) {
    validMsg.style.display = 'block';
    validMsg.className = 'alert aw';
    validMsg.innerHTML = erros.map(e=>`⚠️ ${e}`).join('<br>') + (sugestoes ? '<br><br>' + sugestoes : '');
  } else {
    validMsg.style.display = 'none';
  }
}

function updateFracao() {
  const descanso = getDescanso();
  // Redistribute dias to match new descanso
  if (nPeriodos === 1) diasPeriodos = [descanso];
  else if (nPeriodos === 2) {
    const d2 = descanso - diasPeriodos[0];
    diasPeriodos[1] = d2;
    if (diasPeriodos[0] > descanso - 5) diasPeriodos[0] = descanso - 5;
    diasPeriodos[1] = descanso - diasPeriodos[0];
  } else {
    const resto = descanso - diasPeriodos[0];
    diasPeriodos[1] = Math.ceil(resto/2);
    diasPeriodos[2] = Math.floor(resto/2);
    if (diasPeriodos[0] > descanso - 10) diasPeriodos[0] = descanso - 10;
    const r2 = descanso - diasPeriodos[0];
    diasPeriodos[1] = Math.ceil(r2/2);
    diasPeriodos[2] = Math.floor(r2/2);
  }
  renderPeriodos();
}

// ── RESUMO ──
function updateResumo() {
  const saldo = Number(document.getElementById('fSaldo')?.value || 30);
  const abonoVal = document.getElementById('fAbono')?.value;
  const ab = abonoVal === 'Sim' ? abonoDias : 0;
  const descanso = saldo - ab;
  const bar = document.getElementById('resumoBar');
  if (!bar) return;

  // Pegar data de início do 1º período
  const ini = document.getElementById('fPeriodo1Ini')?.value || document.getElementById('fIn')?.value;

  if (!ini || descanso <= 0) { bar.style.display='none'; return; }

  // Validação mínimo CLT
  if (descanso < 5) {
    showMsg('❌ Saldo de descanso mínimo é 5 dias.', 'ae');
    bar.style.display='none'; return;
  }
  if (ab > 0 && descanso < 14) {
    showMsg('❌ Com abono, o saldo de descanso não pode ser inferior a 14 dias (CLT).', 'ae');
    bar.style.display='none'; return;
  }

  bar.style.display='flex';
  document.getElementById('rSaldoUtil').textContent = descanso + ' dias descanso';
  document.getElementById('rIn').textContent = fmt(ini);
  document.getElementById('rFim').textContent = fmt(addDays(ini, descanso));
  document.getElementById('rTot').textContent = saldo + ' dias (inclui ' + ab + ' abono)';
  const restante = saldo - descanso - ab;
  document.getElementById('rSal').textContent = restante + ' dias';
  const rSal = document.getElementById('rSal');
  rSal.style.color = restante < 0 ? 'var(--rust)' : 'var(--forest)';
  if (restante < 0) showMsg('❌ Saldo insuficiente para esta solicitação.', 'ae');
}
document.getElementById('fSaldo')?.addEventListener('input',()=>{updateFracao();updateResumo();});
// Initialize fracionamento on load
document.addEventListener('DOMContentLoaded', () => { renderPeriodos(); });


// ── CHECKLIST DINÂMICO ──
function updateChecklist() {
  const dias = Number(document.getElementById('fDias')?.value || 0);
  const saldo = Number(document.getElementById('fSaldo')?.value || 0);
  const inicio = document.getElementById('fIn')?.value;
  
  // Validação 1: Não exceder saldo
  const check1 = dias <= saldo && dias > 0;
  // Validação 2: Tirar todos os dias
  const check2 = dias === saldo && dias > 0;
  // Validação 3: Período mínimo de 14 dias
  const check3 = dias >= 14;
  // Validação 4: Início em dia útil
  const check4 = !inicio || [0,6].indexOf(new Date(inicio).getDay()) === -1;
  
  // Exibir avisos se necessário
  if(!check1 && dias > 0) showMsg('❌ Dias solicitados excedem o saldo disponível.', 'ae');
  if(!check2 && dias > 0 && dias !== saldo) showMsg('⚠️ É necessário tirar todos os dias disponíveis.', 'aw');
  if(!check3 && dias > 0) showMsg('⚠️ O período deve ter no mínimo 14 dias.', 'aw');
}

document.getElementById('fSaldo')?.addEventListener('input',updateChecklist);



async function prevConflict() {
  const ini=document.getElementById('fIn')?.value, dias=Number(document.getElementById('fDias')?.value||0);
  const setor=document.getElementById('fSetor')?.value, nome=document.querySelector('[name="nome"]')?.value;
  const w=document.getElementById('fCW'); if(!w) return;
  if(!ini||!dias||!setor||!nome){w.style.display='none';return;}
  const c=hasConflict({nome,setor,inicio:ini,diasFerias:dias},await getR());
  if(c){w.className='alert ae';w.textContent=`⚠️ ${c.nome} (mesma equipe) já tem férias aprovadas neste período.`;w.style.display='block';}
  else w.style.display='none';
}
document.getElementById('fPeriodo1Ini')?.addEventListener('change',prevConflict);
document.getElementById('fSetor')?.addEventListener('input',prevConflict);
document.querySelector('[name="nome"]')?.addEventListener('input',prevConflict);

// ── FORM SUBMIT ──
document.getElementById('vForm')?.addEventListener('submit',async function(e){
  e.preventDefault();
  const msg=document.getElementById('fMsg'); msg.style.display='none';
  const fd=new FormData(this), data=Object.fromEntries(fd.entries());
  const saldo = Number(data.saldo) || 30;
  const ab = data.abono === 'Sim' ? (abonoDias || 0) : 0;
  const descanso = saldo - ab;
  const nPer = Number(data.nPeriodos) || 1;

  // Sync fIn and fDias from period data
  const ini1 = document.getElementById('fPeriodo1Ini')?.value;
  if (!ini1) { showMsg('❌ Informe a data de início do 1º período.', 'ae'); return; }
  document.getElementById('fIn').value = ini1;
  document.getElementById('fDias').value = descanso;

  // Validação CLT fracionamento
  const totalPeriodos = diasPeriodos.slice(0, nPer).reduce((a,b)=>a+b,0);
  if (totalPeriodos !== descanso) { showMsg('❌ A soma dos períodos deve ser igual ao saldo de descanso (' + descanso + ' dias).', 'ae'); return; }
  if (nPer > 1 && Math.max(...diasPeriodos.slice(0,nPer)) < 14) { showMsg('❌ Um dos períodos deve ter mínimo 14 dias (CLT).', 'ae'); return; }
  if (diasPeriodos.slice(0,nPer).some(d => d < 5)) { showMsg('❌ Nenhum período pode ter menos de 5 dias (CLT).', 'ae'); return; }
  if (ab > 0 && descanso < 14) { showMsg('❌ Com abono, o mínimo de descanso é 14 dias (CLT).', 'ae'); return; }
  if (ab > 10) { showMsg('❌ Abono máximo permitido é 10 dias.', 'ae'); return; }

  const all=await getR();
  if(hasConflict({nome:data.nome,setor:data.setor,inicio:ini1,diasFerias:descanso},all)){showMsg('❌ Conflito com férias aprovadas na equipe.','ae');return;}

  // Build periodos array
  const periodos = diasPeriodos.slice(0, nPer).map((d,i) => ({
    dias: d,
    inicio: document.getElementById(`fPeriodo${i+1}Ini`)?.value || ''
  }));

  const req={
    id:crypto.randomUUID(), nome:data.nome, email:data.email,
    tipoContrato:data.tipoContrato, setor:data.setor, periodoAquisitivo:data.periodo,
    saldo, inicio:ini1, diasFerias:descanso, abono:data.abono, diasAbono:ab,
    totalDias:descanso+ab, nPeriodos:nPer, periodos,
    nomeGestor:data.nomeGestor, emailGestor:data.emailGestor,
    observacoes:data.observacoes,
    statusGestor:'Pendente', statusRH:'Aguardando gestor', statusFinal:'Aguardando gestor',
    parecerGestor:'', parecerRH:'',
    dataSolicitacao:new Date().toISOString(), ultimaAtualizacao:new Date().toISOString()
  };
  await saveRItem(req);
  log('Solicitação criada',`${req.nome} — Início: ${fmt(req.inicio)}, ${req.totalDias} dias`,'📨');
  updateHero(); renderAll();
  if (role === 'colaborador') updateColResumo();
  notify('gestor',req.nomeGestor,`Nova solicitação de férias de ${req.nome} aguarda aprovação.`);
  showMsg('✅ Solicitação enviada! Gestor será notificado.','as');
  setTimeout(() => openSurvey(), 1000);
  this.reset(); clearForm();
});

function showMsg(t,c){const el=document.getElementById('fMsg');el.className='alert '+c;el.textContent=t;el.style.display='block';}

// Fechar pesquisa ao clicar fora do modal
document.getElementById('surveyModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeSurvey();
});

function clearForm(){
  document.getElementById('vForm')?.reset();
  document.querySelectorAll('.abono-opt').forEach((o,i)=>o.classList.toggle('sel',i===0));
  document.getElementById('fAbono').value='Não';
  document.getElementById('fAbonoDias').value='0';
  document.getElementById('abonoQtdWrap').style.display='none';
  abonoDias=0;
  // Reset fracionamento to 1 period
  nPeriodos=1; diasPeriodos=[30];
  document.getElementById('fNPeriodos').value='1';
  document.querySelectorAll('#fracaoWrap .abono-opt').forEach((o,i)=>o.classList.toggle('sel',i===0));
  renderPeriodos();
  const rb=document.getElementById('resumoBar'); if(rb) rb.style.display='none';
  ['fDW','fCW','fMsg'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
}

// ── EMAIL SIMULATION ──
function notify(to,name,msg){
  log(`📧 E-mail → ${PLBL[to]||to}`,`Para: ${name} — "${msg}"`,'📧');
  addNotif(msg, 'info');
}

// ── EXPORTAÇÃO EXCEL ──
async function exportarExcel() {
  const data = await getR();
  if (!data.length) { alert('Não há dados para exportar.'); return; }
  
  const ws = XLSX.utils.json_to_sheet(data.map(r => ({
    'Colaborador': r.nome,
    'E-mail': r.email,
    'Setor': r.setor,
    'Início': fmt(r.inicio),
    'Dias': r.diasFerias,
    'Abono': r.abono,
    'Total': r.totalDias,
    'Status': r.statusFinal,
    'Data Solicitação': fmt(r.dataSolicitacao.split('T')[0])
  })));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Férias");
  XLSX.writeFile(wb, "Conecta IMEX_Relatorio.xlsx");
  addNotif('Relatório Excel gerado com sucesso!', 'success');
}

// ── MINHAS SOLICITAÇÕES ──
async function buscarMinhas(){
  const email=document.getElementById('cEmail').value.trim().toLowerCase();
  const el=document.getElementById('myList');
  if(!email){alert('Informe seu e-mail.');return;}
  const found=(await getR()).filter(r=>(r.email||'').toLowerCase()===email);
  if(!found.length){el.innerHTML='<div class="empty"><div class="ei">🔍</div>Nenhuma solicitação encontrada.</div>';return;}
  
  el.innerHTML=found.sort((a,b)=>new Date(b.dataSolicitacao)-new Date(a.dataSolicitacao)).map(r=>{
    const isAprovada = r.statusFinal === 'Aprovada';
    const isPendente = ['Aguardando gestor','Em análise pelo RH'].includes(r.statusFinal);
    const statusColor = isAprovada ? 'var(--forest)' : isPendente ? 'var(--gold)' : 'var(--rust)';
    
    return `
    <div class="ri-item" style="border-left: 4px solid ${statusColor}">
      <div class="ri-head">
        <div class="ri-name">Período: ${r.periodoAquisitivo||'—'}</div>
        ${badge(r.statusFinal)}
      </div>
      <div style="font-size: 11px; color: var(--ink-30); margin-bottom: 10px;">Solicitado em: ${new Date(r.dataSolicitacao).toLocaleDateString('pt-BR')}</div>
      
      <div class="ri-meta" style="background: var(--bg); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
        <div class="ri-m"><strong>📅 Início:</strong> ${fmt(r.inicio)}</div>
        <div class="ri-m"><strong>🏁 Fim:</strong> ${fmt(addDays(r.inicio,r.diasFerias||r.dias))}</div>
        <div class="ri-m"><strong>⏱️ Duração:</strong> ${r.totalDias} dias ${r.abono === 'Sim' ? '(inclui 10d abono)' : ''}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="font-size: 12px; padding: 8px; background: #f8f9fa; border-radius: 6px;">
          <div style="font-weight: 700; color: var(--ink-60); margin-bottom: 4px; font-size: 10px; text-transform: uppercase;">Parecer Gestor</div>
          <div style="color: var(--ink);">${r.parecerGestor || '<i>Aguardando análise...</i>'}</div>
        </div>
        <div style="font-size: 12px; padding: 8px; background: #f8f9fa; border-radius: 6px;">
          <div style="font-weight: 700; color: var(--ink-60); margin-bottom: 4px; font-size: 10px; text-transform: uppercase;">Parecer RH</div>
          <div style="color: var(--ink);">${r.parecerRH || '<i>Aguardando validação...</i>'}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── RENDER RECENTES ──
let calOffset = 0;

async function renderRecentes(){
  const el=document.getElementById('rList'); if(!el) return;
  const all=await getR();
  const email = sessionStorage.getItem('userEmail');
  const myVacations = all.filter(r => r.email === email && r.statusFinal === 'Aprovada');
  
  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + calOffset, 1);
  const monthName = viewDate.toLocaleString('pt-BR', { month: 'long' });
  const year = viewDate.getFullYear();

  // Gerar Grid do Calendário
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  
  let html = `
    <div class="mini-cal">
      <div class="mini-cal-header">
        <button class="btn btn-g btn-sm" onclick="changeCal(-1)" style="padding:2px 8px">❮</button>
        <span style="text-transform:capitalize">${monthName} ${year}</span>
        <button class="btn btn-g btn-sm" onclick="changeCal(1)" style="padding:2px 8px">❯</button>
      </div>
      <div class="mini-cal-grid">
        ${['D','S','T','Q','Q','S','S'].map(d => `<div class="mini-cal-day-label">${d}</div>`).join('')}
  `;

  // Espaços vazios
  for(let i=0; i<firstDay; i++) html += `<div class="mini-cal-day other-month"></div>`;

  // Dias do mês
  for(let d=1; d<=daysInMonth; d++) {
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === now.toISOString().split('T')[0];
    
    // Verificar se este dia está em algum período de férias
    let vacClass = '';
    myVacations.forEach(v => {
      const start = v.inicio;
      const end = addDays(v.inicio, v.diasFerias || v.dias);
      if (dateStr >= start && dateStr <= end) {
        vacClass = 'vacation';
        if (dateStr === start) vacClass += ' vacation-start';
        if (dateStr === end) vacClass += ' vacation-end';
      }
    });

    html += `<div class="mini-cal-day ${isToday?'today':''} ${vacClass}">${d}</div>`;
  }

  html += `
      </div>
      <div class="mini-cal-legend">
        <div class="leg-item"><div class="leg-dot" style="background:var(--pur-soft); border:1px solid var(--pur)"></div>Hoje</div>
        <div class="leg-item"><div class="leg-dot" style="background:var(--pur)"></div>Férias</div>
      </div>
    </div>
  `;
  
  el.innerHTML = html;
}

function changeCal(offset) {
  calOffset += offset;
  renderRecentes();
}

// ── RENDER GESTOR ──
async function renderGestor(){
  const all=await getR();
  const pend=all.filter(r=>(r.statusFinal||'Aguardando gestor')==='Aguardando gestor');
  const appr=all.filter(r=>r.statusFinal==='Aprovada');
  const near=all.filter(r=>nearDL(r.prazoLimite));
  ['gPend','gAppr','gDead'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=[pend.length,appr.length,near.length][i];});
  const tb=document.getElementById('gTable');
  if(tb) tb.innerHTML=all.length?all.sort((a,b)=>new Date(a.inicio)-new Date(b.inicio)).map(r=>`<tr><td>${escapeHtml(r.nome)}</td><td>${escapeHtml(r.setor)}</td><td>${fmt(r.inicio)}</td><td>${fmt(addDays(r.inicio,r.diasFerias||r.dias))}</td><td>${badge(r.statusFinal)}</td></tr>`).join(''):'<tr><td colspan="5" style="padding:18px 12px;color:var(--ink-60)">Nenhum período.</td></tr>';
  const ml=document.getElementById('gReqList'); if(!ml) return;
  if(!pend.length){ml.innerHTML='<div class="empty"><div class="ei">✅</div>Sem pendências!</div>';return;}
  ml.innerHTML=pend.map(r=>{
    const impacto = getImpacto(r, all);
    const impactoStyle = impacto.tipo === 'danger' ? 'background:#fee2e2; color:#991b1b; border:1px solid #f87171' : 
                         impacto.tipo === 'warning' ? 'background:#fef3c7; color:#92400e; border:1px solid #fbbf24' : 
                         'background:#d1fae5; color:#065f46; border:1px solid #34d399';
    
    return `
    <div class="ri-item">
      <div class="ri-head"><div class="ri-name">${escapeHtml(r.nome)}</div>${badge(r.statusFinal)}</div>
      
      <!-- IMPACTO AUTOMÁTICO -->
      <div style="margin:10px 0; padding:10px; border-radius:8px; font-size:12px; ${impactoStyle}">
        <div style="font-weight:700; margin-bottom:2px">👉 Impacto Automático:</div>
        <div>${escapeHtml(impacto.icon)} ${escapeHtml(impacto.msg)}</div>
        <div style="font-size:11px; opacity:0.8; margin-top:2px">${escapeHtml(impacto.detalhe)}</div>
      </div>

      <div class="ri-meta">
        <div class="ri-m"><strong>Setor:</strong> ${escapeHtml(r.setor)}</div>
        <div class="ri-m"><strong>Início:</strong> ${fmt(r.inicio)}</div>
        <div class="ri-m"><strong>Fim:</strong> ${fmt(addDays(r.inicio,r.diasFerias||r.dias))}</div>
        <div class="ri-m"><strong>Total:</strong> ${escapeHtml(String(r.totalDias))} dias</div>
        ${nearDL(r.prazoLimite)?`<div class="ri-m" style="color:var(--rust)"><strong>⚠️ Prazo:</strong> ${fmt(r.prazoLimite)}</div>`:''}
      </div>
      <div class="actions">
        <button class="btn btn-a btn-sm" onclick="mAct('${r.id}','aprovar')">✔ Aprovar</button>
        <button class="btn btn-g btn-sm" onclick="openBox('m','${r.id}','reprovar')">✖ Reprovar</button>
        <button class="btn btn-g btn-sm" onclick="openBox('m','${r.id}','ajuste')">📝 Ajuste</button>
      </div>
      <div class="act-box" id="mb-${r.id}">
        <textarea id="mn-${r.id}" placeholder="Informe o parecer do gestor..."></textarea>
        <div style="display:flex;gap:7px">
          <button class="btn btn-p btn-sm" onclick="confBox('m','${r.id}')">Confirmar</button>
          <button class="btn btn-g btn-sm" onclick="closeBox('mb-${r.id}')">Cancelar</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── LISTA DE FÉRIAS (Controle RH) ──
var _feriasAll = [];
var _feriasFiltro = 'todos';
var _feriasBusca = '';
var _feriasAba = 'geral';

// Conexão com o cadastro de Colaboradores: identifica quem ainda não tem
// férias agendadas mas está com o prazo se aproximando, calculado a partir
// da data de admissão (e do período aquisitivo do cadastro, se preenchido).
async function getColabsAtivos(){
  if(!window.db) return [];
  try{
    const snap = await db.collection(col('grh_colabs')).get();
    return snap.docs.map(d=>({id:d.id, ...d.data()})).filter(c=>(c.status||'Ativo')!=='Inativo');
  }catch(e){ return []; }
}

function feriasPrazoDoColab(colab){
  const adm = colab.admissao || colab.dataAdmissao;
  if(!adm) return null;
  const admDate = new Date(adm+'T12:00:00');
  if(isNaN(admDate.getTime())) return null;
  const hoje = new Date();
  // Próximo aniversário de admissão = fim do período de gozo do ciclo atual
  // (aproximação: período aquisitivo de 12 meses + prazo de gozo até a
  // próxima virada). Para refinar, dá pra usar colab.ferias.periodoAquisitivo
  // quando estiver preenchido manualmente no cadastro mestre.
  let prazo = new Date(admDate.getTime());
  prazo.setFullYear(hoje.getFullYear());
  if(prazo < hoje) prazo.setFullYear(prazo.getFullYear()+1);
  return prazo.toISOString().slice(0,10);
}

function feriasColabTemSolicitacaoAtiva(colab, reqs){
  const nome=(colab.nome||'').toLowerCase(), email=(colab.email||'').toLowerCase();
  return reqs.some(r=>{
    const st = r.statusFinal||'Aguardando gestor';
    if(['Reprovada pelo gestor','Reprovada pelo RH'].includes(st)) return false;
    const mesmoColab = (r.email||'').toLowerCase()===email || (r.nome||'').toLowerCase()===nome;
    return mesmoColab;
  });
}

// Monta linhas "sintéticas" (sem solicitação ainda) para colaboradores cujo
// prazo de férias está chegando, pra entrarem na aba "A vencer".
function feriasLinhasDoCadastro(colabs, reqs){
  return colabs.filter(c=>!feriasColabTemSolicitacaoAtiva(c, reqs)).map(c=>{
    const prazoLimite = feriasPrazoDoColab(c);
    return {
      id:'colab-'+c.id, nome:c.nome, setor:c.setor, email:c.email,
      inicio:null, totalDias:(c.ferias&&c.ferias.saldo)||30,
      diasFerias:(c.ferias&&c.ferias.saldo)||30,
      prazoLimite, statusFinal:null, _origemCadastro:true
    };
  }).filter(r=>r.prazoLimite && nearDL(r.prazoLimite));
}

function feriasStatusInfo(r){
  const vencer = nearDL(r.prazoLimite);
  // Linha sintética: vem do cadastro de colaboradores, ainda sem solicitação.
  if(r._origemCadastro){
    return {status:'A vencer', dias:r.diasFerias||0, fim:null, emFerias:false, pendente:false, atencao:false, vencer:true, categoria:'a-vencer', concluida:false};
  }
  const status = r.statusFinal || 'Aguardando gestor';
  const dias = r.diasFerias || r.dias || r.totalDias || 0;
  const fim = r.inicio ? addDays(r.inicio, dias) : null;
  const hoje = new Date().toISOString().slice(0,10);
  const pendente = ['Aguardando gestor','Em análise pelo RH'].includes(status);
  const atencao = ['Reprovada pelo gestor','Reprovada pelo RH','Ajuste solicitado pelo gestor','Ajuste solicitado pelo RH'].includes(status);
  const emFerias = status==='Aprovada' && r.inicio && fim && hoje>=r.inicio && hoje<=fim;
  let categoria='aprovadas';
  if(atencao) categoria='atencao';
  else if(emFerias) categoria='em-ferias';
  else if(pendente) categoria='pendentes';
  // Histórico = já concluído (aprovada com período no passado) ou encerrado com reprovação/ajuste.
  const concluida = (categoria==='aprovadas' && fim && fim<hoje) || categoria==='atencao';
  return {status, dias, fim, emFerias, pendente, atencao, vencer, categoria, concluida};
}

function feriasRowHTML(r){
  const info = feriasStatusInfo(r);
  const cores = {pendentes:'#f59e0b', aprovadas:'#22c55e', 'em-ferias':'#3b82f6', atencao:'#ef4444', 'a-vencer':'#f43f5e'};
  const cor = cores[info.categoria] || '#94a3b8';
  const ini = (r.nome||'?').replace(/\s+/g,' ').trim().split(' ').map(w=>w[0]||'').slice(0,2).join('').toUpperCase()||'?';
  return `<div class="fr-row" style="border-left-color:${cor}">
    <div class="fr-avatar" style="background:${cor}1a;color:${cor}">${ini}</div>
    <div class="fr-info">
      <div class="fr-nome">${escapeHtml(r.nome)}</div>
      <div class="fr-cargo">${escapeHtml(r.setor||'—')}</div>
    </div>
    <div class="fr-col">${r.inicio?fmt(r.inicio):'—'}${info.fim?' - '+fmt(info.fim):''}</div>
    <div class="fr-col">${info.dias} dias</div>
    <div class="fr-col">${r.prazoLimite?fmt(r.prazoLimite):'—'}</div>
    <div class="fr-col">${r._origemCadastro?'<span class="fr-badge-vencer">A VENCER</span>':badge(info.status)}</div>
    <div class="fr-acao">${(!r._origemCadastro && info.pendente)?'<button class="fr-acao-btn" onclick="feriasAbrirAcao(\''+r.id+'\',\''+escapeHtml(r.nome)+'\')" title="Analisar">⋯</button>':''}</div>
  </div>`;
}

// ── Aprovar/Reprovar/Ajuste direto na lista (substitui o card separado "Pendentes do RH") ──
window.feriasAbrirAcao=function(id,nome){
  const ov=document.getElementById('gm-overlay')||document.getElementById('fr-acao-overlay');
  const overlay=document.getElementById('fr-acao-overlay');
  if(!overlay)return;
  document.getElementById('fr-acao-nome').textContent=nome||'';
  document.getElementById('fr-acao-id').value=id;
  document.getElementById('fr-acao-nota').value='';
  document.getElementById('fr-acao-nota-wrap').style.display='none';
  overlay.style.display='flex';
};
window.feriasFecharAcao=function(){
  const overlay=document.getElementById('fr-acao-overlay'); if(overlay) overlay.style.display='none';
};
window.feriasAcao=function(tipo){
  const id=document.getElementById('fr-acao-id').value;
  const notaWrap=document.getElementById('fr-acao-nota-wrap');
  const nota=document.getElementById('fr-acao-nota').value.trim();
  if(tipo!=='aprovar' && notaWrap.style.display==='none'){
    notaWrap.style.display='block';
    notaWrap.dataset.tipo=tipo;
    return;
  }
  if(tipo!=='aprovar' && !nota){ alert('Informe o parecer.'); return; }
  rAct(id, tipo, nota);
  window.feriasFecharAcao();
};

function renderFeriasLista(){
  const el = document.getElementById('rTable'); if(!el) return;
  let lista = _feriasAll.slice().filter(r=>feriasStatusInfo(r).concluida === (_feriasAba==='historico'));
  if(_feriasFiltro!=='todos'){
    lista = lista.filter(r=>{
      const info = feriasStatusInfo(r);
      return _feriasFiltro==='a-vencer' ? info.vencer : info.categoria===_feriasFiltro;
    });
  }
  if(_feriasBusca){
    const q=_feriasBusca.toLowerCase();
    lista = lista.filter(r=>(r.nome||'').toLowerCase().includes(q)||(r.setor||'').toLowerCase().includes(q));
  }
  if(!lista.length){ el.innerHTML='<div class="empty"><div class="ei">📭</div>Nenhuma solicitação encontrada.</div>'; return; }
  el.innerHTML = lista.sort((a,b)=>new Date(a.inicio||0)-new Date(b.inicio||0)).map(feriasRowHTML).join('');
}

window.feriasFiltro=function(f,btn){
  _feriasFiltro=f;
  document.querySelectorAll('#fr-pills .fr-pill').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  renderFeriasLista();
};
window.feriasBuscar=function(v){ _feriasBusca=v; renderFeriasLista(); };
window.feriasAba=function(a,btn){
  _feriasAba=a;
  document.querySelectorAll('#fr-subtabs .fr-subtab').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  renderFeriasLista();
};

// ── MODAL: Iniciar novas férias (cadastro direto pelo RH) ──
var _fnPeriodos = 1;
var _fnDiasPeriodos = [30];

window.feriasAbrirNova=function(){
  ['fn-nome','fn-email','fn-setor'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const diasEl=document.getElementById('fn-dias'); if(diasEl) diasEl.value='30';
  const msg=document.getElementById('fr-modal-msg'); if(msg) msg.style.display='none';
  _fnPeriodos = 1; _fnDiasPeriodos = [30];
  document.querySelectorAll('#fr-modal-overlay .abono-opt').forEach(o=>o.classList.remove('sel'));
  const f1=document.getElementById('fn-frac-1'); if(f1) f1.classList.add('sel');
  feriasNovaRenderFracoes();
  const ov=document.getElementById('fr-modal-overlay'); if(ov) ov.style.display='flex';
};
window.feriasFecharModal=function(){
  const ov=document.getElementById('fr-modal-overlay'); if(ov) ov.style.display='none';
};

window.feriasNovaFracao=function(n){
  _fnPeriodos = n;
  document.querySelectorAll('#fr-modal-overlay .abono-opt').forEach(o=>o.classList.remove('sel'));
  const el=document.getElementById('fn-frac-'+n); if(el) el.classList.add('sel');
  const total = parseInt((document.getElementById('fn-dias')||{}).value||30);
  if(n===1) _fnDiasPeriodos=[total];
  else if(n===2) _fnDiasPeriodos=[14, Math.max(5,total-14)];
  else _fnDiasPeriodos=[14, Math.ceil((total-14)/2), Math.floor((total-14)/2)];
  feriasNovaRenderFracoes();
};

window.feriasNovaRenderFracoes=function(){
  const total = parseInt((document.getElementById('fn-dias')||{}).value||30);
  if(_fnDiasPeriodos.length!==_fnPeriodos){
    if(_fnPeriodos===1) _fnDiasPeriodos=[total];
    else if(_fnPeriodos===2) _fnDiasPeriodos=[14, Math.max(5,total-14)];
    else _fnDiasPeriodos=[14, Math.ceil((total-14)/2), Math.floor((total-14)/2)];
  }
  const wrap=document.getElementById('fn-periodos-wrap'); if(!wrap) return;
  wrap.innerHTML = _fnDiasPeriodos.map(function(dias,i){
    return '<div class="fg" style="grid-template-columns:1fr 1fr;margin-bottom:8px">'+
      '<div class="field"><label>Início do período '+(i+1)+'</label><input type="date" id="fn-per-inicio-'+i+'"/></div>'+
      '<div class="field"><label>Dias</label><input type="number" id="fn-per-dias-'+i+'" value="'+dias+'" min="5"/></div>'+
    '</div>';
  }).join('');
};

window.feriasSalvarNova=async function(){
  const nome=(document.getElementById('fn-nome')||{}).value||'';
  const email=(document.getElementById('fn-email')||{}).value||'';
  const setor=(document.getElementById('fn-setor')||{}).value||'';
  const msg=document.getElementById('fr-modal-msg');
  const periodos=[];
  for(let i=0;i<_fnPeriodos;i++){
    const inicio=(document.getElementById('fn-per-inicio-'+i)||{}).value||'';
    const dias=parseInt((document.getElementById('fn-per-dias-'+i)||{}).value||0);
    if(!inicio||!dias){ if(msg){msg.textContent='Preencha a data e os dias de todos os períodos.';msg.style.display='block';} return; }
    periodos.push({inicio,dias});
  }
  if(!nome||!periodos.length){ if(msg){msg.textContent='Preencha nome e os períodos.';msg.style.display='block';} return; }
  try{
    const grupoId = periodos.length>1 ? ('rh-grupo-'+Date.now()) : null;
    for(let i=0;i<periodos.length;i++){
      const id='rh'+Date.now()+'-'+i;
      await saveRItem({
        id, nome, email, setor, inicio:periodos[i].inicio,
        diasFerias: periodos[i].dias, totalDias: periodos[i].dias,
        statusFinal: 'Aprovada',
        dataSolicitacao: new Date().toISOString(),
        origemRH: true,
        grupoFracionamento: grupoId,
        parteFracionamento: periodos.length>1 ? (i+1)+'/'+periodos.length : null
      });
    }
    window.feriasFecharModal();
    if(typeof addNotif==='function') addNotif(`Férias de "${nome}" registradas (${periodos.length} período${periodos.length>1?'s':''}).`, 'success');
    renderRH();
  }catch(e){
    if(msg){msg.textContent='Erro ao registrar: '+e.message;msg.style.display='block';}
  }
};

// ── ACESSOS E PERMISSÕES ──
const AP_DOC = 'configuracoes/acessosPermissoes';
const AP_CAMPOS = {
  gestor: [
    {key:'salario', label:'Salário', tipo:'simnao'},
    {key:'dadosColaboradores', label:'Dados dos colaboradores', tipo:'simnao'},
    {key:'organograma', label:'Organograma', tipo:'simnao'},
    {key:'relatorios', label:'A pessoa gestora poderá visualizar relatórios?', tipo:'simnao'},
    {key:'indicadores', label:'A pessoa gestora poderá visualizar indicadores?', tipo:'simnao'},
    {key:'reuniao1a1', label:'Reunião 1:1', tipo:'simnao'},
    {key:'metas', label:'Metas', tipo:'simnao'},
    {key:'feriasVisualizar', label:'Quais férias pessoas gestoras poderão visualizar?', tipo:'opcoes', opcoes:['Somente de liderados diretos','De liderados diretos e indiretos']},
    {key:'feriasAprovar', label:'Quais férias pessoas gestoras poderão aprovar?', tipo:'opcoes', opcoes:['Somente de liderados diretos','De liderados diretos e indiretos']},
    {key:'solicitarFeriasEmNome', label:'Pessoas gestoras podem solicitar férias em nome de liderados?', tipo:'simnao'},
    {key:'aprovacaoReembolsos', label:'A pessoa gestora participa do fluxo de aprovação de reembolsos?', tipo:'simnao'},
    {key:'pdiEvolucaoCargo', label:'Permitir criação de PDI a partir de evolução ou mudança de cargos', tipo:'simnao'}
  ],
  colaborador: [
    {key:'organograma', label:'Visualizar organograma da empresa', tipo:'simnao'},
    {key:'holeriteProprio', label:'Visualizar próprio holerite/contracheque', tipo:'simnao'},
    {key:'dadosOutrosColaboradores', label:'Visualizar dados básicos de outros colaboradores', tipo:'simnao'},
    {key:'indicadoresSetor', label:'Visualizar indicadores do setor', tipo:'simnao'},
    {key:'solicitarFerias', label:'Solicitar férias', tipo:'simnao'},
    {key:'solicitarReembolsos', label:'Solicitar reembolsos', tipo:'simnao'},
    {key:'politicaBeneficios', label:'Visualizar política de benefícios', tipo:'simnao'},
    {key:'pesquisasEnquetes', label:'Participar de pesquisas e enquetes', tipo:'simnao'},
    {key:'gamificacao', label:'Acessar gamificação e loja de recompensas', tipo:'simnao'},
    {key:'editarCadastro', label:'Editar próprios dados cadastrais (endereço, contato)', tipo:'simnao'}
  ]
};
const AP_PADRAO = {
  gestor: {salario:false, dadosColaboradores:false, organograma:false, relatorios:false, indicadores:false, reuniao1a1:true, metas:false, feriasVisualizar:'De liderados diretos e indiretos', feriasAprovar:'Somente de liderados diretos', solicitarFeriasEmNome:false, aprovacaoReembolsos:false, pdiEvolucaoCargo:false},
  colaborador: {organograma:true, holeriteProprio:true, dadosOutrosColaboradores:false, indicadoresSetor:false, solicitarFerias:true, solicitarReembolsos:true, politicaBeneficios:true, pesquisasEnquetes:true, gamificacao:true, editarCadastro:true}
};
var apState = null;
var apPersonaAtiva = 'gestor';

async function acessosCarregar(){
  const lista = document.getElementById('ap-lista'); if(!lista) return;
  lista.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try{
    const snap = await db.doc(AP_DOC).get();
    apState = snap.exists ? snap.data() : {};
    apState.gestor = Object.assign({}, AP_PADRAO.gestor, apState.gestor||{});
    apState.colaborador = Object.assign({}, AP_PADRAO.colaborador, apState.colaborador||{});
    acessosRenderizar();
  }catch(e){
    lista.innerHTML = `<div class="empty"><div class="ei">❌</div>Erro ao carregar: ${e.message}</div>`;
  }
}

function acessosRenderizar(){
  const lista = document.getElementById('ap-lista'); if(!lista || !apState) return;
  const campos = AP_CAMPOS[apPersonaAtiva];
  const dados = apState[apPersonaAtiva];
  lista.innerHTML = campos.map(function(c){
    if(c.tipo==='simnao'){
      const v = !!dados[c.key];
      return `<div class="ap-item">
        <div class="ap-item-label">${escapeHtml(c.label)}</div>
        <div class="ap-opts">
          <label class="ap-radio"><input type="radio" name="ap-${c.key}" ${v?'checked':''} onchange="acessosSet('${c.key}',true)"/><span>Sim</span></label>
          <label class="ap-radio"><input type="radio" name="ap-${c.key}" ${!v?'checked':''} onchange="acessosSet('${c.key}',false)"/><span>Não</span></label>
        </div>
      </div>`;
    }
    return `<div class="ap-item">
      <div class="ap-item-label">${escapeHtml(c.label)}</div>
      <div class="ap-opts ap-opts-col">
        ${c.opcoes.map(function(op){
          const v = dados[c.key]===op;
          return `<label class="ap-radio"><input type="radio" name="ap-${c.key}" ${v?'checked':''} onchange="acessosSet('${c.key}','${op.replace(/'/g,"\\'")}')"/><span>${escapeHtml(op)}</span></label>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

window.acessosSet=function(key,val){
  if(!apState) return;
  apState[apPersonaAtiva][key] = val;
};

window.acessosPersona=function(p,btn){
  apPersonaAtiva = p;
  document.querySelectorAll('.ap-pills .ap-pill').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  acessosRenderizar();
};

window.acessosTopTab=function(t,btn){
  document.querySelectorAll('.ap-toptabs .ap-toptab').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  const a=document.getElementById('ap-pane-acessos'), p=document.getElementById('ap-pane-permissoes');
  if(a) a.style.display = t==='acessos' ? 'block' : 'none';
  if(p) p.style.display = t==='permissoes' ? 'block' : 'none';
};

window.acessosSalvar=async function(){
  if(!apState) return;
  try{
    await db.doc(AP_DOC).set(apState, {merge:true});
    const msg=document.getElementById('ap-msg');
    if(msg){ msg.textContent='✔ Salvo com sucesso!'; msg.style.display='block'; setTimeout(()=>{msg.style.display='none';},2500); }
    if(typeof addNotif==='function') addNotif('Acessos e Permissões atualizados.', 'success');
  }catch(e){
    alert('Erro ao salvar: '+e.message);
  }
};

// Auto-inicialização: o sistema de abas da Gestão RH é frágil e tem várias
// camadas reescrevendo o conteúdo, então em vez de depender de um callback
// específico, observa quando o painel fica visível e carrega os dados ali.
(function(){
  var apCarregado = false;
  setInterval(function(){
    const pane = document.getElementById('grh-pane-acessos');
    if(pane && window.getComputedStyle(pane).display!=='none' && !apCarregado){
      apCarregado = true;
      acessosCarregar();
    }
    if(pane && window.getComputedStyle(pane).display==='none'){
      apCarregado = false;
    }
  }, 600);
})();

// ── RENDER RH ──
async function renderRH(){
  if (!hasPermission('canViewDashboard')) {
    const el = document.getElementById('rReqList');
    if (el) el.innerHTML = '<div class="empty"><div class="ei">🚫</div>Acesso negado.</div>';
    return;
  }
  const all=await getR();
  const pend=all.filter(r=>(r.statusFinal||'Em análise pelo RH')==='Em análise pelo RH');
  const appr=all.filter(r=>r.statusFinal==='Aprovada');
  const atten=all.filter(r=>['Reprovada pelo RH','Ajuste solicitado pelo RH'].includes(r.statusFinal));
  
  // Cálculo de Passivo Trabalhista (férias vencendo em 30 dias)
  const risk = all.filter(r => nearDL(r.prazoLimite)).length;
  
  ['rPend','rAppr','rAtten','rRisk'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=[pend.length,appr.length,atten.length,risk][i];});
  
  // Carregar configurações nos inputs
  const config = await getCfg();
  if(document.getElementById('cfgAntecedencia')) document.getElementById('cfgAntecedencia').value = config.antecedencia;
  if(document.getElementById('cfgMinimo')) document.getElementById('cfgMinimo').value = config.minimo;

  _feriasAll = all;
  renderFeriasLista();
  getColabsAtivos().then(function(colabs){
    const sintetizadas = feriasLinhasDoCadastro(colabs, all);
    if(sintetizadas.length){
      _feriasAll = all.concat(sintetizadas);
      renderFeriasLista();
    }
  });
  const rl=document.getElementById('rReqList'); if(!rl) return;
  if(!pend.length){rl.innerHTML='<div class="empty"><div class="ei">✅</div>Sem pendências!</div>';return;}
  rl.innerHTML=pend.map(r=>`
    <div class="ri-item">
      <div class="ri-head"><div class="ri-name">${escapeHtml(r.nome)}</div>${badge(r.statusFinal)}</div>
      <div class="ri-meta">
        <div class="ri-m"><strong>Setor:</strong> ${escapeHtml(r.setor)}</div>
        <div class="ri-m"><strong>Gestor:</strong> ${escapeHtml(r.nomeGestor||'—')}</div>
        <div class="ri-m"><strong>Parecer Gestor:</strong> ${escapeHtml(r.parecerGestor||'—')}</div>
        <div class="ri-m"><strong>Início:</strong> ${fmt(r.inicio)}</div>
        <div class="ri-m"><strong>Total:</strong> ${escapeHtml(String(r.totalDias))} dias</div>
        ${nearDL(r.prazoLimite)?`<div class="ri-m" style="color:var(--rust)"><strong>⚠️ Prazo próximo!</strong></div>`:''}
      </div>
      <div class="actions">
        <button class="btn btn-a btn-sm" onclick="rAct('${r.id}','aprovar')">✔ Aprovar</button>
        <button class="btn btn-g btn-sm" onclick="openBox('r','${r.id}','reprovar')">✖ Reprovar</button>
        <button class="btn btn-g btn-sm" onclick="openBox('r','${r.id}','ajuste')">📝 Ajuste</button>
      </div>
      <div class="act-box" id="rb-${r.id}">
        <textarea id="rn-${r.id}" placeholder="Informe o parecer do RH..."></textarea>
        <div style="display:flex;gap:7px">
          <button class="btn btn-p btn-sm" onclick="confBox('r','${r.id}')">Confirmar</button>
          <button class="btn btn-g btn-sm" onclick="closeBox('rb-${r.id}')">Cancelar</button>
        </div>
      </div>
    </div>`).join('');
}

// ── ACTION HELPERS ──
function openBox(prefix,id,action){
  const acts=prefix==='m'?mActs:rActs; acts[id]=action;
  const box=document.getElementById(prefix+'b-'+id), ta=document.getElementById(prefix+'n-'+id);
  if(box) box.style.display='block';
  if(ta)  ta.placeholder=action==='reprovar'?'Motivo da reprovação...':'Descreva o ajuste necessário...';
}
function closeBox(boxId){const b=document.getElementById(boxId);if(b)b.style.display='none';}
function confBox(prefix,id){
  const acts=prefix==='m'?mActs:rActs, action=acts[id];
  const note=document.getElementById(prefix+'n-'+id)?.value.trim();
  if(!note){alert('Informe o parecer.');return;}
  if(prefix==='m') mActWithNote(id,action,note); else rActWithNote(id,action,note);
  closeBox(prefix+'b-'+id); delete acts[id];
}

async function mAct(id,action,note=''){
  const all=await getR();
  const up=all.map(r=>r.id!==id?r:{...r,statusGestor:action==='aprovar'?'Aprovado':action==='reprovar'?'Reprovado':'Ajuste',statusRH:action==='aprovar'?'Pendente':'Não iniciado',statusFinal:action==='aprovar'?'Em análise pelo RH':action==='reprovar'?'Reprovada pelo gestor':'Ajuste solicitado pelo gestor',parecerGestor:note,dataParecerGestor:new Date().toISOString(),ultimaAtualizacao:new Date().toISOString()});
  await saveRAll(up);
  const req=up.find(r=>r.id===id);
  log(action==='aprovar'?'Aprovada pelo gestor':action==='reprovar'?'Reprovada pelo gestor':'Ajuste solicitado',`${req.nome}${note?' — '+note:''}`,action==='aprovar'?'✅':'❌');
  if(action==='aprovar') notify('rh','RH',`Solicitação de ${req.nome} aprovada pelo gestor, aguarda validação.`);
  if(action==='reprovar') notify('colaborador',req.nome,`Solicitação reprovada pelo gestor. Parecer: ${note}`);
  updateHero(); renderAll();
}
function mActWithNote(id,action,note){mAct(id,action,note);}

async function rAct(id,action,note=''){
  const all=await getR();
  const up=all.map(r=>{
    if(r.id !== id) return r;
    const novoSaldo = action === 'aprovar' ? (r.saldo - r.diasFerias) : r.saldo;
    if(action === 'aprovar') all.forEach(item=>{ if(item.email===r.email) item.saldo=novoSaldo; });
    return {...r,statusRH:action==='aprovar'?'Aprovado':action==='reprovar'?'Reprovado':'Ajuste',statusFinal:action==='aprovar'?'Aprovada':action==='reprovar'?'Reprovada pelo RH':'Ajuste solicitado pelo RH',parecerRH:note,dataParecerRH:new Date().toISOString(),ultimaAtualizacao:new Date().toISOString(),saldo:novoSaldo};
  });
  await saveRAll(up);
  const req=up.find(r=>r.id===id);
  if(action==='aprovar'){
    addNotif(`Saldo de ${req.nome} atualizado: ${req.saldo} dias restantes.`,'success');
    const fSaldo=document.getElementById('fSaldo');
    if(fSaldo && req.email===currentUserData?.email){fSaldo.value=req.saldo;updateResumo();}
  }
  log(action==='aprovar'?'Aprovada pelo RH':action==='reprovar'?'Reprovada pelo RH':'Ajuste solicitado pelo RH',`${req.nome}${note?' — '+note:''}`,action==='aprovar'?'✅':'❌');
  const m=action==='aprovar'?`Suas férias foram aprovadas! Início: ${fmt(req.inicio)}.`:`Solicitação ${action==='reprovar'?'reprovada':'com ajuste solicitado'} pelo RH. Parecer: ${note}`;
  notify('colaborador',req.nome,m);
  updateHero(); renderAll();
}
function rActWithNote(id,action,note){rAct(id,action,note);}

// ── HERO ──
async function updateHero(){
  const all=await getR();
  document.getElementById('hTotal').textContent=all.length;
  document.getElementById('hPending').textContent=all.filter(r=>['Aguardando gestor','Em análise pelo RH'].includes(r.statusFinal)).length;
  document.getElementById('hApproved').textContent=all.filter(r=>r.statusFinal==='Aprovada').length;
}

// ── RENDER ALL ──
async function renderAll() {
  const safe = async (fn, name) => { try { await fn(); } catch(e) { console.warn('renderAll ['+name+']:', e.message); } };
  await safe(renderRecentes,       'recentes');
  await safe(renderGestor,         'gestor');
  await safe(renderRH,             'rh');
  await safe(popularSelectSetor,   'selectSetor');
  await safe(popularSelectGestor,  'selectGestor');
  if (role === 'rh' && !politicaState) try { politicaCarregar(); } catch(e) {}
}

// ── CALENDAR ──
function calNav(d){calM+=d;if(calM>11){calM=0;calY++}if(calM<0){calM=11;calY--}renderCal();}
function calGoToday(){calY=new Date().getFullYear();calM=new Date().getMonth();renderCal();}
async function renderCal(){
  document.getElementById('calLbl').textContent=`${MONTHS[calM]} ${calY}`;
  const grid=document.getElementById('calGrid');
  grid.innerHTML=DAYS.map(d=>`<div class="cal-dow">${d}</div>`).join('');
  const first=new Date(calY,calM,1).getDay(), dim=new Date(calY,calM+1,0).getDate();
  const today=new Date().toISOString().split('T')[0], all=await getR();
  
  // Atualizar filtro de setor
  const filterSelect = document.getElementById('calFilterSetor');
  if (filterSelect) {
    const setores = new Set(all.map(r => r.setor).filter(Boolean));
    const currentValue = filterSelect.value;
    filterSelect.innerHTML = '<option value="">Todos os setores</option>' + Array.from(setores).map(s => `<option value="${s}" ${s === currentValue ? 'selected' : ''}>${s}</option>`).join('');
  }
  
  const filtroSetor = filterSelect?.value || '';
  const evMap={};
  all.filter(r => !filtroSetor || r.setor === filtroSetor).forEach(r=>{
    if(!r.inicio) return;
    const s=new Date(r.inicio+'T12:00:00'), e=new Date(addDays(r.inicio,r.diasFerias||r.dias)+'T12:00:00');
    for(let d=new Date(s);d<=e;d.setDate(d.getDate()+1)){
      const k=d.toISOString().split('T')[0];
      if(!evMap[k]) evMap[k]=[];
      if(!evMap[k].find(x=>x.id===r.id)) evMap[k].push(r);
    }
  });
  for(let i=0;i<first;i++) grid.innerHTML+=`<div class="cal-day"></div>`;
  for(let day=1;day<=dim;day++){
    const ds=`${calY}-${String(calM+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const evs=evMap[ds]||[];
    const evH=evs.slice(0,2).map(r=>{
      const s=r.statusFinal||'';
      const c=s==='Aprovada'?'ev-a':s==='Em análise pelo RH'?'ev-r':s.includes('Reprovada')?'ev-x':'ev-p';
      return `<div class="cal-ev ${c}" title="${r.nome} — ${s}">${r.nome.split(' ')[0]}</div>`;
    }).join('');
    const more=evs.length>2?`<div style="font-size:9px;color:var(--ink-30)">+${evs.length-2}</div>`:'';
    grid.innerHTML+=`<div class="cal-day${ds===today?' td':''}"><div class="cal-dn">${day}</div>${evH}${more}</div>`;
  }
}

// ── DASHBOARD ──
async function renderDash(){
  const all=await getR(), appr=all.filter(r=>r.statusFinal==='Aprovada'), pend=all.filter(r=>['Aguardando gestor','Em análise pelo RH'].includes(r.statusFinal)), rej=all.filter(r=>(r.statusFinal||'').includes('Reprovada'));

  // ── CRUZAR COM BASE DE COLABORADORES ──
  const colabs = await getCols();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const d30 = new Date(today); d30.setDate(d30.getDate()+30); const d30s = d30.toISOString().split('T')[0];
  const d60 = new Date(today); d60.setDate(d60.getDate()+60); const d60s = d60.toISOString().split('T')[0];
  const d90 = new Date(today); d90.setDate(d90.getDate()+90); const d90s = d90.toISOString().split('T')[0];
  const d33 = new Date(today); d33.setDate(d33.getDate()+33); const d33s = d33.toISOString().split('T')[0];
  const d7  = new Date(today); d7.setDate(d7.getDate()+7);   const d7s  = d7.toISOString().split('T')[0];

  // Mapa de e-mail → solicitação aprovada mais recente
  const reqPorEmail = {};
  appr.forEach(r => {
    if (!reqPorEmail[r.email] || r.dataSolicitacao > reqPorEmail[r.email].dataSolicitacao)
      reqPorEmail[r.email] = r;
  });

  // Total de colaboradores: prioriza base importada; cai para reqs se vazia
  const totalColabs = colabs.length || all.length;

  // Construir lista unificada de "períodos" (colabs + período 2 se existir)
  const periodos = [];
  if (colabs.length > 0) {
    colabs.forEach(c => {
      if (c.prazoLimite) periodos.push({ email: c.email, nome: c.nome, setor: c.setor, prazo: c.prazoLimite, saldo: Number(c.saldo)||0, situacao: c.situacao1||'A agendar', periodo: c.periodoAquisitivo||'—' });
      if (c.prazoLimite2) periodos.push({ email: c.email, nome: c.nome, setor: c.setor, prazo: c.prazoLimite2, saldo: Number(c.saldo2)||0, situacao: c.situacao2||'A agendar', periodo: c.periodo2||'—' });
    });
  } else {
    // Fallback: usar reqs
    all.forEach(r => { if (r.prazoLimite) periodos.push({ email: r.email, nome: r.nome, setor: r.setor, prazo: r.prazoLimite, saldo: r.saldo||0, situacao: r.statusFinal||'—', periodo: r.periodoAquisitivo||'—' }); });
  }

  // Colaboradores sem nenhuma solicitação ativa (não agendados)
  const emailsComSolicitacao = new Set(all.filter(r => ['Aguardando gestor','Em análise pelo RH','Aprovada'].includes(r.statusFinal)).map(r=>r.email));
  const semAgendamento = colabs.length > 0
    ? colabs.filter(c => !emailsComSolicitacao.has(c.email)).length
    : (all.length - appr.length);

  // Aproveitamento: colaboradores com férias aprovadas / total
  const percentualUtilizado = totalColabs > 0 ? Math.round((appr.length / totalColabs) * 100) : 0;

  // Vencidas: prazo passou e situação != aprovada/agendada
  const situacoesOk = new Set(['Aprovada','Aprovada pelo RH','Agendada','Gozando','Gozadas']);
  const vencidas = periodos.filter(p => p.prazo < todayStr && !situacoesOk.has(p.situacao)).length;

  // Proximas a vencer (30d) — da base de colabs
  const proximasVencer = periodos.filter(p => p.prazo >= todayStr && p.prazo <= d30s && !situacoesOk.has(p.situacao)).length;

  // Em férias agora (aprovadas em reqs cujo periodo cobre hoje)
  const emFerias = appr.filter(r => r.inicio && r.inicio <= todayStr && addDays(r.inicio, r.diasFerias||r.dias) >= todayStr).length;

  // Vencendo em 30/60/90 dias (da base de colabs — exclui situações OK)
  const venc30 = periodos.filter(p => p.prazo >= todayStr && p.prazo <= d30s && !situacoesOk.has(p.situacao)).length;
  const venc60 = periodos.filter(p => p.prazo > d30s && p.prazo <= d60s && !situacoesOk.has(p.situacao)).length;
  const venc90 = periodos.filter(p => p.prazo > d60s && p.prazo <= d90s && !situacoesOk.has(p.situacao)).length;

  // Aviso a emitir (aprovadas com início nos próximos 33 dias)
  const avisoEmitir = appr.filter(r => r.inicio && r.inicio >= todayStr && r.inicio <= d33s).length;

  // Retorno próximo
  const retornoProximo = appr.filter(r => {
    if (!r.inicio) return false;
    const fim = addDays(r.inicio, r.diasFerias||r.dias);
    return fim >= todayStr && fim <= d7s;
  }).length;

  // Saldo médio (da base de colabs se disponível)
  const saldoMedio = colabs.length > 0
    ? Math.round(colabs.reduce((a,c) => a+(Number(c.saldo)||0), 0) / colabs.length)
    : 0;

  // Totais do cabeçalho — usa total de colabs se disponível
  const dTotVal = colabs.length > 0 ? totalColabs : all.length;
  ['dTot','dApp','dPen','dRej'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=[dTotVal,appr.length,pend.length,rej.length][i];});

  // Renderizar alertas de risco
  const alertDiv = document.getElementById('alertasRisco');
  if (alertDiv) {
    const badgeFonte = colabs.length > 0
      ? `<div style="font-size:11px;color:var(--pur-dark);background:var(--pur-mid);border-radius:6px;padding:3px 9px;display:inline-block;margin-bottom:14px;font-weight:600">📊 Base: ${colabs.length} colaboradores importados · ${periodos.length} períodos</div>`
      : '';
    alertDiv.innerHTML = `
      ${badgeFonte}
      <div class="cg" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
        <div class="card"><div class="card-body" style="text-align:center;padding:20px"><div style="font-size:28px;font-weight:700;color:var(--pur);margin-bottom:5px">${totalColabs}</div><div style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em">Total Colaboradores</div></div></div>
        <div class="card"><div class="card-body" style="text-align:center;padding:20px"><div style="font-size:28px;font-weight:700;color:var(--rust);margin-bottom:5px">${vencidas}</div><div style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em">Férias Vencidas</div></div></div>
        <div class="card"><div class="card-body" style="text-align:center;padding:20px"><div style="font-size:28px;font-weight:700;color:#d4a843;margin-bottom:5px">${proximasVencer}</div><div style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em">Próx. Vencer (30d)</div></div></div>
      </div>
      <div class="cg" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
        <div class="card"><div class="card-body" style="text-align:center;padding:20px"><div style="font-size:28px;font-weight:700;color:var(--forest);margin-bottom:5px">${emFerias}</div><div style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em">Em Férias Agora</div></div></div>
        <div class="card"><div class="card-body" style="text-align:center;padding:20px"><div style="font-size:28px;font-weight:700;color:var(--rust);margin-bottom:5px">${semAgendamento}</div><div style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em">Sem Agendamento</div></div></div>
        <div class="card"><div class="card-body" style="text-align:center;padding:20px"><div style="font-size:28px;font-weight:700;color:var(--pur);margin-bottom:5px">${saldoMedio > 0 ? saldoMedio+'d' : percentualUtilizado+'%'}</div><div style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em">${saldoMedio > 0 ? 'Saldo Médio' : 'Férias Utilizadas'}</div></div></div>
      </div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin:4px 0 10px">Alertas de Vencimento</div>
      <div class="cg" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
        <div class="card" style="border-top:3px solid var(--rust)">
          <div class="card-body" style="text-align:center;padding:20px">
            <div style="font-size:28px;font-weight:700;color:var(--rust);margin-bottom:5px">${venc30}</div>
            <div style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em">Vencendo em 30 dias</div>
            <div style="font-size:11px;color:var(--rust);margin-top:4px;font-weight:600">⚠️ Ação imediata</div>
          </div>
        </div>
        <div class="card" style="border-top:3px solid var(--g-orange)">
          <div class="card-body" style="text-align:center;padding:20px">
            <div style="font-size:28px;font-weight:700;color:var(--g-orange);margin-bottom:5px">${venc60}</div>
            <div style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em">Vencendo em 60 dias</div>
            <div style="font-size:11px;color:var(--g-orange);margin-top:4px;font-weight:600">⏳ Atenção</div>
          </div>
        </div>
        <div class="card" style="border-top:3px solid #d4a843">
          <div class="card-body" style="text-align:center;padding:20px">
            <div style="font-size:28px;font-weight:700;color:#d4a843;margin-bottom:5px">${venc90}</div>
            <div style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em">Vencendo em 90 dias</div>
            <div style="font-size:11px;color:#d4a843;margin-top:4px;font-weight:600">📅 Planejamento</div>
          </div>
        </div>
      </div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-30);margin:4px 0 10px">Avisos e Retornos</div>
      <div class="cg" style="grid-template-columns:repeat(2,1fr);margin-bottom:16px">
        <div class="card" style="border-top:3px solid var(--pur)">
          <div class="card-body" style="text-align:center;padding:20px">
            <div style="font-size:28px;font-weight:700;color:var(--pur);margin-bottom:5px">${avisoEmitir}</div>
            <div style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em">Aviso de Férias a Emitir</div>
            <div style="font-size:11px;color:var(--pur);margin-top:4px;font-weight:600">📄 Início em até 33 dias</div>
          </div>
        </div>
        <div class="card" style="border-top:3px solid var(--g-teal)">
          <div class="card-body" style="text-align:center;padding:20px">
            <div style="font-size:28px;font-weight:700;color:var(--g-teal);margin-bottom:5px">${retornoProximo}</div>
            <div style="font-size:12px;color:var(--ink-60);text-transform:uppercase;letter-spacing:.05em">Retorno de Férias Próximo</div>
            <div style="font-size:11px;color:var(--g-teal);margin-top:4px;font-weight:600">🔄 Retorno em até 7 dias</div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Bar chart
  const counts=Array.from({length:12},(_,i)=>all.filter(r=>r.inicio&&new Date(r.inicio).getMonth()===i).length);
  const maxV=Math.max(...counts,1);
  const bw=document.getElementById('barWrap'), bl=document.getElementById('barLbls');
  if(bw) bw.innerHTML=counts.map((c,i)=>`<div class="bar-col"><div class="bar-val">${c||''}</div><div class="bar" style="height:${Math.max((c/maxV)*110,4)}px;background:${i===calM?'var(--rust)':'var(--sand-dark)'}"></div></div>`).join('');
  if(bl) bl.innerHTML=MSHORT.map(m=>`<span class="bar-lbl">${m}</span>`).join('');
  // Donut
  const canvas=document.getElementById('donut'); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const segs=[
    {label:'Aprovadas',count:appr.length,color:'#2d5a3d'},
    {label:'Pendentes',count:pend.length,color:'#d4a843'},
    {label:'Reprovadas',count:rej.length,color:'#c94f2a'},
    {label:'Outros',count:all.length-appr.length-pend.length-rej.length,color:'#b8b0a5'},
  ].filter(s=>s.count>0);
  const tot=segs.reduce((a,s)=>a+s.count,0)||1;
  ctx.clearRect(0,0,130,130);
  let angle=-Math.PI/2;
  segs.forEach(s=>{
    const sl=(s.count/tot)*Math.PI*2;
    ctx.beginPath();ctx.moveTo(65,65);ctx.arc(65,65,56,angle,angle+sl);ctx.closePath();ctx.fillStyle=s.color;ctx.fill();
    angle+=sl;
  });
  ctx.beginPath();ctx.arc(65,65,34,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
  ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--ink')||'#1a1612';
  ctx.font='bold 16px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(all.length,65,65);
  const dleg=document.getElementById('dLeg');
  if(dleg) dleg.innerHTML=segs.map(s=>`<div class="d-li"><div class="d-dot" style="background:${s.color}"></div>${s.label}: <strong>${s.count}</strong></div>`).join('');
  // Sector table
  const sm={};
  all.forEach(r=>{const s=r.setor||'—';if(!sm[s])sm[s]={t:0,a:0,p:0,r:0};sm[s].t++;if(r.statusFinal==='Aprovada')sm[s].a++;else if(['Aguardando gestor','Em análise pelo RH'].includes(r.statusFinal))sm[s].p++;else if((r.statusFinal||'').includes('Reprovada'))sm[s].r++;});
  const stb=document.getElementById('setorTb');
  if(stb) stb.innerHTML=Object.entries(sm).sort((a,b)=>b[1].t-a[1].t).map(([s,v])=>`<tr><td><strong>${s}</strong></td><td>${v.t}</td><td style="color:var(--forest)">${v.a}</td><td style="color:#7a5a10">${v.p}</td><td style="color:var(--rust-dark)">${v.r}</td></tr>`).join('')||'<tr><td colspan="5" style="padding:18px 12px;color:var(--ink-60)">Nenhum dado.</td></tr>';
}

// ── AUDIT ──
async function renderAudit(){
  const log=await getA(), el=document.getElementById('auditLog');
  if(!log.length){el.innerHTML='<div class="empty"><div class="ei">📋</div>Nenhuma ação registrada ainda</div>';return;}
  el.innerHTML=log.map((e,i)=>{
    const d=new Date(e.ts);
    const ts=d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    return `<div class="au-item">
      <div class="au-dw"><div class="au-dot">${e.icon||'📝'}</div>${i<log.length-1?'<div class="au-line"></div>':''}</div>
      <div class="au-c"><div class="au-t">${e.action}</div><div class="au-s">${e.detail} · <strong>${PLBL[e.role]||e.role||'Sistema'}</strong> · ${ts}</div></div>
    </div>`;
  }).join('');
}
async function clearAudit(){
  if(!confirm('Limpar todo o histórico?'))return;
  const snap = await db.collection(col('audit')).get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  _cacheAudit = null;
  renderAudit();
}

// ── EXPORT PDF ──
async function exportPDF(){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF();
  doc.setFont('helvetica','bold');doc.setFontSize(18);
  doc.text('Portal de Férias — Relatório',14,20);
  doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(100);
  doc.text(`Gerado: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')} · Perfil: ${PLBL[role]}`,14,28);
  const all=await getR();
  doc.autoTable({
    startY:36,
    head:[['Colaborador','Setor','Início','Fim','Total','Gestor','Status']],
    body:all.map(r=>[r.nome,r.setor,fmt(r.inicio),fmt(addDays(r.inicio,r.diasFerias||r.dias)),r.totalDias+' dias',r.nomeGestor||'—',r.statusFinal||'Aguardando gestor']),
    styles:{fontSize:9,cellPadding:3},
    headStyles:{fillColor:[26,22,18],textColor:255,fontStyle:'bold'},
    alternateRowStyles:{fillColor:[245,240,232]},
  });
  const fy=doc.lastAutoTable.finalY+10;
  doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(0);
  const appr=all.filter(r=>r.statusFinal==='Aprovada').length, pend=all.filter(r=>['Aguardando gestor','Em análise pelo RH'].includes(r.statusFinal)).length;
  doc.text(`Total: ${all.length}  |  Aprovadas: ${appr}  |  Pendentes: ${pend}  |  Reprovadas: ${all.length-appr-pend}`,14,fy);
  doc.save(`ferias-${new Date().toISOString().split('T')[0]}.pdf`);
  log('Relatório PDF exportado',`${all.length} registros`,'📄');
}

function downloadPoliticaPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFillColor(150, 19, 247); // #9613f7
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('POLÍTICA DE FÉRIAS', 105, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('Portal Interno de Férias', 105, 33, { align: 'center' });
  
  // Conteúdo
  let y = 55;
  doc.setTextColor(26, 32, 44); // --ink
  
  const sections = [
    { title: '1. PRAZOS DE SOLICITAÇÃO', content: 'As solicitações de férias devem ser realizadas com no mínimo 30 dias de antecedência da data de início desejada. Este prazo é fundamental para o planejamento das atividades da equipe.' },
    { title: '2. PERÍODO MÍNIMO E FRACIONAMENTO', content: 'Conforme a legislação vigente, as férias podem ser usufruídas em até 3 períodos. Um dos períodos deve ter no mínimo 14 dias corridos, e os demais não podem ser inferiores a 5 dias corridos cada.' },
    { title: '3. ABONO PECUNIÁRIO', content: 'O colaborador tem o direito de converter 1/3 do seu período de férias em abono pecuniário (venda de 10 dias). Esta opção deve ser manifestada no momento da solicitação, respeitando o prazo legal de 15 dias antes do término do período aquisitivo.' },
    { title: '4. FLUXO DE APROVAÇÃO', content: 'Toda solicitação enviada pelo portal segue o seguinte fluxo:\n1. Análise e aprovação do Gestor Direto.\n2. Validação final e processamento pelo departamento de RH.\nO colaborador será notificado via e-mail em cada etapa do processo.' },
    { title: '5. REGRAS GERAIS', content: '• O início das férias não pode coincidir com dois dias que antecedem feriado ou dia de descanso semanal remunerado.\n• O saldo de férias deve ser consultado previamente para garantir que o período solicitado está disponível.' }
  ];
  
  sections.forEach(s => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(150, 19, 247);
    doc.text(s.title, 14, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(74, 85, 104); // --ink-60
    const lines = doc.splitTextToSize(s.content, 180);
    doc.text(lines, 14, y);
    y += (lines.length * 5) + 10;
  });
  
  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(160, 174, 192);
  doc.text(`Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 105, 285, { align: 'center' });
  
  doc.save('Politica_de_Ferias.pdf');
  log('Política de Férias baixada em PDF', 'Download realizado pelo colaborador', '📥');
}

// ══════════════════════════════════════
// COLLABORATOR BANK
// ══════════════════════════════════════
// Fields we want to capture and their friendly labels
const COL_FIELDS = [
  {key:'nome',              label:'Nome',                        required:true},
  {key:'email',             label:'E-mail',                      required:true},
  {key:'setor',             label:'Setor',                       required:true},
  {key:'nomeGestor',        label:'Gestor Responsável',          required:false},
  {key:'emailGestor',       label:'E-mail do Gestor',            required:false},
  // ── PERÍODO 1 ──
  {key:'periodoAquisitivo', label:'Período 1 (ex: 24/25)',       required:false},
  {key:'inicioPeriodo1',    label:'Início Período 1 (YYYY-MM-DD)',required:false},
  {key:'fimPeriodo1',       label:'Fim Período 1 (YYYY-MM-DD)',  required:false},
  {key:'prazoLimite',       label:'Prazo Limite 1 (YYYY-MM-DD)', required:false},
  {key:'saldo',             label:'Saldo de Dias 1',             required:false},
  {key:'situacao1',         label:'Situação 1',                  required:false},
  {key:'diasGozados1',      label:'Dias Gozados 1',              required:false},
  // ── PERÍODO 2 ──
  {key:'periodo2',          label:'Período 2 (ex: 25/26)',       required:false},
  {key:'inicioPeriodo2',    label:'Início Período 2 (YYYY-MM-DD)',required:false},
  {key:'fimPeriodo2',       label:'Fim Período 2 (YYYY-MM-DD)',  required:false},
  {key:'prazoLimite2',      label:'Prazo Limite 2 (YYYY-MM-DD)', required:false},
  {key:'saldo2',            label:'Saldo de Dias 2',             required:false},
  {key:'situacao2',         label:'Situação 2',                  required:false},
  {key:'diasGozados2',      label:'Dias Gozados 2',              required:false},
];

let xlsxHeaders = [];   // headers read from file
let xlsxRows    = [];   // raw row objects from file

// ── DRAG & DROP ──
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('importZone').classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
}

// ── FILE READ ──
function handleFile(file) {
  if (!file || !file.name.endsWith('.xlsx')) {
    showImportMsg('❌ Selecione um arquivo .xlsx válido.', 'ae'); return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const wb   = XLSX.read(e.target.result, {type:'array', cellDates:true});
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
      if (data.length < 2) { showImportMsg('❌ Planilha vazia ou sem dados.','ae'); return; }
      xlsxHeaders = data[0].map(h => String(h).trim());
      xlsxRows    = data.slice(1).filter(r => r.some(c => String(c).trim()));
      showMappingUI();
    } catch(err) {
      showImportMsg('❌ Erro ao ler o arquivo: ' + err.message, 'ae');
    }
  };
  reader.readAsArrayBuffer(file);
}

// ── MAPPING UI ──
function showMappingUI() {
  const sec  = document.getElementById('mappingSection');
  const grid = document.getElementById('mapGrid');
  sec.style.display = 'block';
  document.getElementById('importMsg').style.display = 'none';

  // Auto-detect mapping by fuzzy matching header names
  const autoMatch = (fieldKey, fieldLabel) => {
    const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g,'');
    const targets = [norm(fieldKey), norm(fieldLabel)];
    return xlsxHeaders.findIndex(h => targets.some(t => norm(h).includes(t) || t.includes(norm(h))));
  };

  grid.innerHTML = COL_FIELDS.map(f => {
    const matched = autoMatch(f.key, f.label);
    const opts = xlsxHeaders.map((h,i) =>
      `<option value="${i}" ${i===matched?'selected':''}>${h}</option>`
    ).join('');
    return `
      <div class="map-row">
        <div class="map-lbl">${f.label}${f.required?' <span style="color:var(--rust)">*</span>':''}</div>
        <div class="map-arr">→</div>
        <select class="map-sel" id="map-${f.key}">
          <option value="">— ignorar —</option>
          ${opts}
        </select>
      </div>`;
  }).join('');

  showImportMsg(`📊 ${xlsxRows.length} linhas detectadas. Confirme o mapeamento de colunas abaixo.`, 'ai');
}

// ── CONFIRM IMPORT ──
async function confirmImport() {
  // Build mapping: fieldKey → column index (or -1)
  const mapping = {};
  COL_FIELDS.forEach(f => {
    const sel = document.getElementById('map-'+f.key);
    mapping[f.key] = sel && sel.value !== '' ? Number(sel.value) : -1;
  });

  // Validate required fields have mapping
  const missing = COL_FIELDS.filter(f => f.required && mapping[f.key] === -1).map(f=>f.label);
  if (missing.length) {
    showImportMsg(`❌ Mapeie os campos obrigatórios: ${missing.join(', ')}`, 'ae'); return;
  }

  // Parse rows
  const existing = await getCols();
  const existingEmails = new Set(existing.map(c => (c.email||'').toLowerCase()));
  let added = 0, updated = 0, skipped = 0;

  const newCols = [...existing];

  xlsxRows.forEach(row => {
    const get = key => mapping[key] !== -1 ? String(row[mapping[key]]||'').trim() : '';
    // helper: parse date cells (may be Date objects or strings)
    const getDate = key => {
      if (mapping[key] === -1) return '';
      const v = row[mapping[key]];
      if (!v) return '';
      if (v instanceof Date) return v.toISOString().split('T')[0];
      const s = String(v).trim();
      // handle dd/mm/yyyy
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) { const [d,m,y]=s.split('/'); return `${y}-${m}-${d}`; }
      return s;
    };
    const colab = {
      id:               crypto.randomUUID(),
      nome:             get('nome'),
      email:            get('email').toLowerCase(),
      setor:            get('setor'),
      nomeGestor:       get('nomeGestor'),
      emailGestor:      get('emailGestor').toLowerCase(),
      // Período 1
      saldo:            Number(get('saldo')) || 30,
      periodoAquisitivo:get('periodoAquisitivo'),
      inicioPeriodo1:   getDate('inicioPeriodo1'),
      fimPeriodo1:      getDate('fimPeriodo1'),
      prazoLimite:      getDate('prazoLimite'),
      situacao1:        get('situacao1'),
      diasGozados1:     Number(get('diasGozados1')) || 0,
      // Período 2
      periodo2:         get('periodo2'),
      inicioPeriodo2:   getDate('inicioPeriodo2'),
      fimPeriodo2:      getDate('fimPeriodo2'),
      prazoLimite2:     getDate('prazoLimite2'),
      saldo2:           get('saldo2') !== '' ? Number(get('saldo2')) : null,
      situacao2:        get('situacao2'),
      diasGozados2:     get('diasGozados2') !== '' ? Number(get('diasGozados2')) : null,
      importadoEm:      new Date().toISOString(),
    };
    if (!colab.nome || !colab.email) { skipped++; return; }

    const idx = newCols.findIndex(c => c.email === colab.email);
    if (idx >= 0) { newCols[idx] = {...newCols[idx], ...colab, id: newCols[idx].id}; updated++; }
    else          { newCols.push(colab); added++; existingEmails.add(colab.email); }
  });

  await saveColsAll(newCols);
  log('Base de colaboradores importada', `+${added} novos, ${updated} atualizados, ${skipped} ignorados`, '👥');

  cancelImport();
  renderColabs();
  updateColStats();
  showImportMsg(`✅ Importação concluída: <strong>${added}</strong> novos, <strong>${updated}</strong> atualizados, <strong>${skipped}</strong> ignorados.`, 'as');
}

function cancelImport() {
  document.getElementById('mappingSection').style.display = 'none';
  document.getElementById('xlsxInput').value = '';
  xlsxHeaders = []; xlsxRows = [];
}

// ── RENDER COLLABORATORS ──
async function renderColabs() {
  const all    = await getCols();
  const query  = (document.getElementById('colSearch')?.value || '').toLowerCase();
  const setor  = document.getElementById('colFilterSetor')?.value || '';

  const filtered = all.filter(c => {
    const matchQ = !query || [c.nome,c.email,c.setor,c.nomeGestor].some(v=>(v||'').toLowerCase().includes(query));
    const matchS = !setor || c.setor === setor;
    return matchQ && matchS;
  });

  // Update setor filter options
  const setores = [...new Set(all.map(c=>c.setor).filter(Boolean))].sort();
  const sf = document.getElementById('colFilterSetor');
  if (sf) {
    const cur = sf.value;
    sf.innerHTML = '<option value="">Todos os setores</option>' + setores.map(s=>`<option value="${s}" ${s===cur?'selected':''}>${s}</option>`).join('');
  }

  const countEl = document.getElementById('colCount');
  if (countEl) countEl.textContent = all.length
    ? `${filtered.length} de ${all.length} colaborador${all.length!==1?'es':''}${setor||query?' (filtrado)':''}`
    : 'Nenhum colaborador cadastrado';

  const el = document.getElementById('colList');
  if (!el) return;
  if (!filtered.length) {
    el.innerHTML = `<div class="empty"><div class="ei">${all.length?'🔍':'👥'}</div>${all.length?'Nenhum resultado para o filtro.':'Importe uma planilha para cadastrar colaboradores'}</div>`;
    return;
  }

  el.innerHTML = filtered.map(c => `
    <div class="col-card">
      <div style="flex:1;min-width:0">
        <div class="col-name">${c.nome}</div>
        <div class="col-meta">
          <span>📧 ${c.email}</span>
          <span>🏢 ${c.setor||'—'}</span>
          ${c.nomeGestor?`<span>👔 ${c.nomeGestor}</span>`:''}
        </div>
        <div style="margin-top:6px;display:flex;gap:5px;flex-wrap:wrap">
          ${c.periodoAquisitivo?`<span class="col-tag">📅 P1: ${c.periodoAquisitivo}</span>`:''}
          ${c.saldo?`<span class="col-tag">🗓 ${c.saldo} dias</span>`:''}
          ${c.prazoLimite?`<span class="col-tag${nearDL(c.prazoLimite)?' '+' style="background:var(--rust-soft);color:var(--rust-dark)"':''}" >⏰ ${fmt(c.prazoLimite)}</span>`:''}
          ${c.periodo2?`<span class="col-tag" style="background:var(--blue-soft);color:#2f4099">📅 P2: ${c.periodo2}</span>`:''}
          ${c.periodo2&&c.saldo2!=null?`<span class="col-tag" style="background:var(--blue-soft);color:#2f4099">🗓 ${c.saldo2} dias</span>`:''}
          ${c.prazoLimite2?`<span class="col-tag" style="background:var(--blue-soft);color:#2f4099">⏰ ${fmt(c.prazoLimite2)}</span>`:''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
        <button class="btn btn-p btn-sm" onclick="prefillFromColab('${c.id}')">✈️ Solicitar</button>
        <button class="btn btn-g btn-sm" onclick="abrirModalColab('${c.id}')">✏️ Editar</button>
        <button class="btn btn-g btn-sm" onclick="removeColab('${c.id}')" style="color:var(--rust-dark)">🗑</button>
      </div>
    </div>`).join('');
}

// ── STATS ──
async function updateColStats() {
  const all = await getCols();
  const setores = new Set(all.map(c=>c.setor).filter(Boolean));
  const prazoProx = all.filter(c => nearDL(c.prazoLimite)).length;
  const saldoMed  = all.length ? Math.round(all.reduce((a,c)=>a+(Number(c.saldo)||0),0)/all.length) : 0;
  const el = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
  el('colTotal',   all.length);
  el('colSetores', setores.size);
  el('colPrazo',   prazoProx);
  el('colSaldo',   saldoMed);
}

// ── PRE-FILL FORM ──
async function prefillFromColab(id) {
  const c = (await getCols()).find(x => x.id === id);
  if (!c) return;
  switchView('solicitacao');
  setTimeout(() => {
    const set = (sel, val) => { const el=document.querySelector(sel); if(el && val) el.value=val; };
    // Use Period 2 if it exists and has remaining balance, otherwise Period 1
    const usarP2 = c.periodo2 && c.saldo2 != null && c.saldo2 > 0;
    const periodoAtivo    = usarP2 ? c.periodo2          : c.periodoAquisitivo;
    const saldoAtivo      = usarP2 ? c.saldo2            : c.saldo;
    const prazoAtivo      = usarP2 ? c.prazoLimite2      : c.prazoLimite;
    set('[name="nome"]',       c.nome);
    set('[name="email"]',      c.email);
    set('[name="setor"]',      c.setor);
    set('[name="periodo"]',    periodoAtivo);
    set('[name="nomeGestor"]', c.nomeGestor);
    set('[name="emailGestor"]',c.emailGestor);
    set('[name="saldo"]',      saldoAtivo);
    set('[name="prazoLimite"]',prazoAtivo);
    document.getElementById('fSaldo').dispatchEvent(new Event('input'));
    document.getElementById('fPrazo').dispatchEvent(new Event('change'));
    // Scroll to form
    document.getElementById('vForm')?.scrollIntoView({behavior:'smooth', block:'start'});
    const periodoLabel = usarP2 ? ` (Período 2: ${c.periodo2})` : (c.periodoAquisitivo ? ` (Período 1: ${c.periodoAquisitivo})` : '');
    showImportMsg(`✅ Formulário pré-preenchido com dados de <strong>${c.nome}</strong>.`, 'as');
    document.getElementById('fMsg').className='alert ai';
    document.getElementById('fMsg').innerHTML=`ℹ️ Dados de <strong>${c.nome}</strong>${periodoLabel} pré-preenchidos. Informe a data de início e finalize.`;
    document.getElementById('fMsg').style.display='block';
  }, 150);
}

// ── REMOVE COLAB ──
async function removeColab(id) {
  if (!confirm('Remover este colaborador da base?')) return;
  await deleteColItem(id);
  renderColabs(); updateColStats();
  log('Colaborador removido', 'ID: '+id, '🗑');
}

// ══════════════════════════════════════
// MODAL EDITAR COLABORADOR + ACESSO
// ══════════════════════════════════════

let _colabEmEdicao = null;

async function abrirModalColab(id) {
  const all = await getCols();
  const c = all.find(x => x.id === id);
  if (!c) return;
  _colabEmEdicao = c;

  // Preencher dados básicos
  document.getElementById('editColabId').value   = c.id;
  document.getElementById('editNome').value       = c.nome || '';
  document.getElementById('editEmail').value      = c.email || '';
  document.getElementById('editSetor').value      = c.setor || '';
  document.getElementById('editGestor').value     = c.nomeGestor || '';
  document.getElementById('editEmailGestor').value= c.emailGestor || '';
  // Período 1
  document.getElementById('editPeriodo1').value   = c.periodoAquisitivo || '';
  document.getElementById('editSaldo1').value     = c.saldo != null ? c.saldo : '';
  document.getElementById('editInicio1').value    = c.inicioPeriodo1 || '';
  document.getElementById('editFim1').value       = c.fimPeriodo1 || '';
  document.getElementById('editPrazo1').value     = c.prazoLimite || '';
  document.getElementById('editSituacao1').value  = c.situacao1 || '';
  document.getElementById('editDiasGozados1').value = c.diasGozados1 != null ? c.diasGozados1 : '';
  // Período 2
  document.getElementById('editPeriodo2').value   = c.periodo2 || '';
  document.getElementById('editSaldo2').value     = c.saldo2 != null ? c.saldo2 : '';
  document.getElementById('editInicio2').value    = c.inicioPeriodo2 || '';
  document.getElementById('editFim2').value       = c.fimPeriodo2 || '';
  document.getElementById('editPrazo2').value     = c.prazoLimite2 || '';
  document.getElementById('editSituacao2').value  = c.situacao2 || '';
  document.getElementById('editDiasGozados2').value = c.diasGozados2 != null ? c.diasGozados2 : '';

  // Limpar campos de senha
  document.getElementById('editSenhaTemp').value = '';
  document.getElementById('editSenhaMsgBox').style.display = 'none';
  document.getElementById('btnCopiarSenha').style.display  = 'none';
  document.getElementById('editColabMsg').style.display    = 'none';

  // Verificar se já tem acesso (usuário no Firebase)
  await verificarAcessoColab(c.email);

  document.getElementById('colabModalOverlay').classList.add('active');
  document.getElementById('editNome').focus();
}

function fecharModalColab(e) {
  if (e && e.target !== document.getElementById('colabModalOverlay')) return;
  document.getElementById('colabModalOverlay').classList.remove('active');
  _colabEmEdicao = null;
}

async function verificarAcessoColab(email) {
  const badge = document.getElementById('editAcessoStatus');
  try {
    const snap = await db.collection('users').where('email','==',email.toLowerCase()).limit(1).get();
    if (!snap.empty) {
      badge.className = 'badge-acesso sim';
      badge.textContent = '● Com acesso';
    } else {
      badge.className = 'badge-acesso nao';
      badge.textContent = '● Sem acesso';
    }
  } catch(e) {
    badge.className = 'badge-acesso nao';
    badge.textContent = '● Sem acesso';
  }
}

function gerarSenhaAleatoria() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  let senha = '';
  for (let i = 0; i < 8; i++) senha += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById('editSenhaTemp').value = senha;
  document.getElementById('btnCopiarSenha').style.display = 'inline-flex';
}

function copiarSenha() {
  const v = document.getElementById('editSenhaTemp').value;
  if (!v) return;
  navigator.clipboard.writeText(v).then(() => {
    const btn = document.getElementById('btnCopiarSenha');
    const orig = btn.textContent;
    btn.textContent = '✅ Copiado!';
    setTimeout(() => btn.textContent = orig, 2000);
  });
}

function mostrarMsgAcesso(txt, ok) {
  const el = document.getElementById('editSenhaMsgBox');
  el.style.display = 'block';
  el.style.background = ok ? '#d1fae5' : '#fee2e2';
  el.style.color      = ok ? '#065f46' : '#991b1b';
  el.style.borderRadius = '8px';
  el.style.padding    = '8px 12px';
  el.innerHTML = txt;
}

async function criarAcessoColaborador() {
  const email = document.getElementById('editEmail').value.trim().toLowerCase();
  const nome  = document.getElementById('editNome').value.trim();

  if (!email) { mostrarMsgAcesso('❌ Informe o e-mail do colaborador.', false); return; }

  mostrarMsgAcesso('⏳ Criando acesso...', true);

  try {
    const FIREBASE_API_KEY = firebaseConfig.apiKey;

    // Tentar criar usuário (senha inicial aleatória — descartada imediatamente)
    const senhaTemp = Array.from(crypto.getRandomValues(new Uint8Array(18)))
      .map(b => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789'[b % 58]).join('');

    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email, password: senhaTemp, returnSecureToken: true})
    });
    const data = await res.json();

    let uid;
    if (data.error) {
      if (data.error.message === 'EMAIL_EXISTS') {
        // Usuário já existe — apenas disparar reset de senha por e-mail
        await auth.sendPasswordResetEmail(email);
        mostrarMsgAcesso(
          `✅ Colaborador já possui acesso.<br>
           📧 Um e-mail de redefinição de senha foi enviado para <strong>${escapeHtml(email)}</strong>.<br>
           <span style="font-size:11px;color:#065f46">Oriente o colaborador a verificar a caixa de entrada (e spam).</span>`,
          true
        );
        await verificarAcessoColab(email);
        log('Reset de senha enviado', `${nome} (${email})`, '🔑');
        return;
      }
      throw new Error(data.error.message);
    }

    uid = data.localId;
    const unidade = currentUnidade || 'meta';
    // Salvar perfil SEM senha — autenticação é responsabilidade exclusiva do Firebase Auth
    await db.collection('users').doc(uid).set({
      uid, nome, email,
      role: 'colaborador',
      unidade,
      criadoEm:       new Date().toISOString(),
      criadoPor:      currentUserData?.email || 'rh',
      primeiroAcesso: true
    });

    // Disparar e-mail de definição de senha imediatamente
    await auth.sendPasswordResetEmail(email);

    mostrarMsgAcesso(
      `✅ Acesso criado com sucesso!<br>
       📧 E-mail de definição de senha enviado para <strong>${escapeHtml(email)}</strong>.<br>
       <span style="font-size:11px;color:#065f46">O colaborador deve verificar a caixa de entrada para criar sua senha.</span>`,
      true
    );
    await verificarAcessoColab(email);
    log('Acesso de colaborador criado', `${nome} (${email}) — perfil: colaborador`, '🔑');
    carregarUsuarios && carregarUsuarios();

  } catch(e) {
    const errs = {
      'INVALID_EMAIL': '❌ E-mail inválido.',
      'TOO_MANY_ATTEMPTS_TRY_LATER': '❌ Muitas tentativas. Aguarde alguns minutos.',
    };
    mostrarMsgAcesso(errs[e.message] || '❌ Erro: ' + escapeHtml(e.message), false);
  }
}

async function salvarEdicaoColab() {
  const id    = document.getElementById('editColabId').value;
  const nome  = document.getElementById('editNome').value.trim();
  const email = document.getElementById('editEmail').value.trim().toLowerCase();
  const setor = document.getElementById('editSetor').value.trim();

  const msgEl = document.getElementById('editColabMsg');
  const showMsg = (txt, ok) => {
    msgEl.style.display  = 'block';
    msgEl.style.background = ok ? '#d1fae5' : '#fee2e2';
    msgEl.style.color      = ok ? '#065f46'  : '#991b1b';
    msgEl.innerHTML = txt;
  };

  if (!nome || !email || !setor) { showMsg('❌ Nome, e-mail e setor são obrigatórios.', false); return; }

  const saldo2Val = document.getElementById('editSaldo2').value;
  const diasG2Val = document.getElementById('editDiasGozados2').value;

  const updated = {
    nome, email, setor,
    nomeGestor:        document.getElementById('editGestor').value.trim(),
    emailGestor:       document.getElementById('editEmailGestor').value.trim().toLowerCase(),
    periodoAquisitivo: document.getElementById('editPeriodo1').value.trim(),
    saldo:             Number(document.getElementById('editSaldo1').value) || 0,
    inicioPeriodo1:    document.getElementById('editInicio1').value,
    fimPeriodo1:       document.getElementById('editFim1').value,
    prazoLimite:       document.getElementById('editPrazo1').value,
    situacao1:         document.getElementById('editSituacao1').value,
    diasGozados1:      Number(document.getElementById('editDiasGozados1').value) || 0,
    periodo2:          document.getElementById('editPeriodo2').value.trim(),
    saldo2:            saldo2Val !== '' ? Number(saldo2Val) : null,
    inicioPeriodo2:    document.getElementById('editInicio2').value,
    fimPeriodo2:       document.getElementById('editFim2').value,
    prazoLimite2:      document.getElementById('editPrazo2').value,
    situacao2:         document.getElementById('editSituacao2').value,
    diasGozados2:      diasG2Val !== '' ? Number(diasG2Val) : null,
    atualizadoEm:      new Date().toISOString(),
  };

  try {
    const all = await getCols();
    const idx = all.findIndex(x => x.id === id);
    if (idx < 0) { showMsg('❌ Colaborador não encontrado.', false); return; }
    all[idx] = { ...all[idx], ...updated };
    await saveColsAll(all);
    showMsg('✅ Dados salvos com sucesso!', true);
    renderColabs(); updateColStats();
    log('Colaborador editado', `${nome} (${email})`, '✏️');
    setTimeout(() => fecharModalColab(), 1400);
  } catch(e) {
    showMsg('❌ Erro ao salvar: ' + e.message, false);
  }
}


async function clearColabs() {
  if (!confirm('Limpar toda a base de colaboradores?')) return;
  const all = await getCols();
  const batch = db.batch();
  all.forEach(c => batch.delete(db.collection(col('grh_colabs')).doc(c.id)));
  await batch.commit();
  _cacheColabs = null;
  renderColabs(); updateColStats();
  log('Base de colaboradores limpa','Todos os registros removidos','🗑');
}

// ── EXPORT COLAB PDF ──
async function exportColPDF() {
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  doc.setFont('helvetica','bold'); doc.setFontSize(16);
  doc.text('Base de Colaboradores', 14, 20);
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(100);
  doc.text(`Gerado: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);
  const all = await getCols();
  doc.autoTable({
    startY: 34,
    head:[['Nome','E-mail','Setor','Gestor','P1','Saldo P1','Prazo P1','P2','Saldo P2','Prazo P2']],
    body: all.map(c=>[c.nome,c.email,c.setor||'—',c.nomeGestor||'—',c.periodoAquisitivo||'—',c.saldo?c.saldo+' dias':'—',fmt(c.prazoLimite),c.periodo2||'—',c.saldo2!=null?c.saldo2+' dias':'—',fmt(c.prazoLimite2)]),
    styles:{fontSize:8,cellPadding:3},
    headStyles:{fillColor:[26,22,18],textColor:255,fontStyle:'bold'},
    alternateRowStyles:{fillColor:[245,240,232]},
  });
  doc.save(`colaboradores-${new Date().toISOString().split('T')[0]}.pdf`);
  log('PDF colaboradores exportado',`${all.length} registros`,'📄');
}

// ── DOWNLOAD TEMPLATE ──
function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Nome','Email','Setor','Gestor Responsável','Email do Gestor',
     'Período 1','Início período 1','Fim período 1','Prazo Limite 1','Saldo de Dias 1','Situação 1','Dias Gozados 1',
     'Período 2','Início período 2','Fim período 2','Prazo Limite 2','Saldo de Dias 2','Situação 2','Dias Gozados 2'],
    ['Maria Silva','maria@empresa.com','Vendas','João Costa','joao@empresa.com',
     '24/25','2024-06-01','2025-05-31','2026-04-30','30','A agendar','0',
     '25/26','2025-06-01','2026-05-31','2027-04-30','30','A agendar','0'],
    ['Pedro Alves','pedro@empresa.com','TI','Ana Lima','ana@empresa.com',
     '24/25','2024-09-15','2025-09-14','2026-08-14','24','Parcial','6',
     '','','','','','',''],
  ]);
  ws['!cols'] = [
    {wch:22},{wch:26},{wch:14},{wch:22},{wch:26},
    {wch:10},{wch:16},{wch:16},{wch:16},{wch:14},{wch:14},{wch:14},
    {wch:10},{wch:16},{wch:16},{wch:16},{wch:14},{wch:14},{wch:14},
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Colaboradores');
  XLSX.writeFile(wb, 'modelo-colaboradores.xlsx');
  log('Modelo de planilha baixado','Template .xlsx exportado (com 2 períodos)','⬇️');
}

// ── HELPER ──
function showImportMsg(html, cls) {
  const el = document.getElementById('importMsg');
  if (!el) return;
	  	el.className = 'alert ' + cls; el.innerHTML = html; el.style.display = 'block';
}

// ═════════════════════════════════════════════════════════════════
// RELATÓRIO DE FÉRIAS VENCIDAS POR SETOR
// ═════════════════════════════════════════════════════════════════

async function gerarRelatorioVencidas() {
  const todas = await getR();
  const hoje = new Date();
  
  // Filtrar apenas as vencidas
  const vencidas = todas.filter(r => {
    if (!r.prazoLimite) return false;
    const dataVencimento = new Date(r.prazoLimite);
    return dataVencimento < hoje && r.statusFinal !== 'Aprovada';
  });
  
  if (vencidas.length === 0) {
    alert('✅ Nenhuma féria vencida no momento!');
    return;
  }
  
  // Agrupar por setor
  const porSetor = {};
  vencidas.forEach(r => {
    const setor = r.setor || 'Sem Setor';
    if (!porSetor[setor]) {
      porSetor[setor] = {
        total: 0,
        dias: 0,
        colaboradores: []
      };
    }
    porSetor[setor].total++;
    porSetor[setor].dias += (r.diasFerias || r.dias || 0);
    porSetor[setor].colaboradores.push(r);
  });
  
  // Criar relatório em HTML
  let html = `
    <div style="font-family:'Cormorant Garamond',serif;background:var(--sand);padding:40px;border-radius:12px;margin:20px 0">
      <h1 style="text-align:center;color:var(--ink);margin-bottom:10px;font-size:32px">Relatório de Férias Vencidas</h1>
      <p style="text-align:center;color:var(--ink-60);margin-bottom:30px;font-size:14px">Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      
      <div style="background:var(--rust-soft);border-left:4px solid var(--rust);padding:16px;border-radius:6px;margin-bottom:30px">
        <p style="color:var(--rust-dark);font-weight:600;margin:0">⚠️ Total de Férias Vencidas: ${vencidas.length} solicitações | ${vencidas.reduce((a,r)=>a+(r.diasFerias||r.dias||0),0)} dias em risco</p>
      </div>
  `;
  
  // Adicionar por setor
  Object.entries(porSetor).sort((a,b) => b[1].total - a[1].total).forEach(([setor, dados]) => {
    html += `
      <div style="margin-bottom:30px;border:1px solid var(--border);border-radius:10px;overflow:hidden">
        <div style="background:linear-gradient(135deg, var(--pur-soft) 0%, rgba(168,136,143,0.1) 100%);padding:16px;border-bottom:1px solid var(--border)">
          <h2 style="color:var(--ink);margin:0;font-size:18px;font-family:'Cormorant Garamond',serif">${setor}</h2>
          <p style="color:var(--ink-60);margin:4px 0 0;font-size:13px">${dados.total} colaborador${dados.total!==1?'es':''} | ${dados.dias} dias em risco</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:var(--sand);border-bottom:1px solid var(--border)">
              <th style="padding:12px;text-align:left;color:var(--ink);font-weight:600">Colaborador</th>
              <th style="padding:12px;text-align:center;color:var(--ink);font-weight:600">Dias</th>
              <th style="padding:12px;text-align:center;color:var(--ink);font-weight:600">Vencimento</th>
              <th style="padding:12px;text-align:center;color:var(--ink);font-weight:600">Dias Vencidos</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    dados.colaboradores.forEach(r => {
      const diasVencidos = Math.floor((hoje - new Date(r.prazoLimite)) / (1000 * 60 * 60 * 24));
      html += `
        <tr style="border-bottom:1px solid var(--border-light)">
          <td style="padding:12px;color:var(--ink)">${r.nome}</td>
          <td style="padding:12px;text-align:center;color:var(--ink)">${r.diasFerias || r.dias || 0}</td>
          <td style="padding:12px;text-align:center;color:var(--rust-dark);font-weight:600">${fmt(r.prazoLimite)}</td>
          <td style="padding:12px;text-align:center;background:rgba(201,79,42,0.1);color:var(--rust-dark);font-weight:600">${diasVencidos} dias</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  });
  
  html += `
      <div style="margin-top:40px;padding-top:20px;border-top:2px solid var(--border);text-align:center;color:var(--ink-60);font-size:12px">
        <p>Relatório gerado automaticamente pelo Portal de Férias</p>
      </div>
    </div>
  `;
  
  // Exibir em modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);
    display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px
  `;
  modal.innerHTML = `
    <div style="background:white;border-radius:12px;max-width:900px;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid var(--border);position:sticky;top:0;background:white">
        <h2 style="margin:0;color:var(--ink);font-family:'Cormorant Garamond',serif;font-size:24px">Relatório de Férias Vencidas</h2>
        <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--ink-60)">&times;</button>
      </div>
      <div style="padding:20px">${html}</div>
      <div style="padding:20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end">
        <button class="btn btn-p" onclick="exportarRelatorioVencidas()">📥 Exportar PDF</button>
        <button class="btn btn-g" onclick="this.parentElement.parentElement.parentElement.remove()">Fechar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
	  log('Relatório gerado','Férias vencidas por setor','📊');
}

async function exportarRelatorioVencidas() {
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  
  const todas = await getR();
  const hoje = new Date();
  const vencidas = todas.filter(r => {
    if (!r.prazoLimite) return false;
    return new Date(r.prazoLimite) < hoje && r.statusFinal !== 'Aprovada';
  });
  
  const porSetor = {};
  vencidas.forEach(r => {
    const setor = r.setor || 'Sem Setor';
    if (!porSetor[setor]) porSetor[setor] = [];
    porSetor[setor].push(r);
  });
  
  doc.setFont('helvetica','bold');
  doc.setFontSize(16);
  doc.text('Relatório de Férias Vencidas por Setor', 14, 20);
  
  doc.setFont('helvetica','normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
  
  let yPos = 36;
  Object.entries(porSetor).forEach(([setor, dados]) => {
    doc.setFont('helvetica','bold');
    doc.setFontSize(11);
    doc.setTextColor(26, 22, 18);
    doc.text(setor, 14, yPos);
    yPos += 6;
    
    doc.autoTable({
      startY: yPos,
      head: [['Colaborador', 'Dias', 'Vencimento', 'Dias Vencidos']],
      body: dados.map(r => {
        const diasVencidos = Math.floor((hoje - new Date(r.prazoLimite)) / (1000 * 60 * 60 * 24));
        return [r.nome, r.diasFerias || r.dias || 0, fmt(r.prazoLimite), diasVencidos];
      }),
      styles: {fontSize: 9, cellPadding: 3},
      headStyles: {fillColor: [168, 136, 143], textColor: 255, fontStyle: 'bold'},
      alternateRowStyles: {fillColor: [245, 240, 232]}
    });
    
    yPos = doc.lastAutoTable.finalY + 8;
  });
  
  doc.save(`relatorio-ferias-vencidas-${new Date().toISOString().split('T')[0]}.pdf`);
  log('PDF exportado','Relatório de férias vencidas','📄');
}


// ═════════════════════════════════════════════════════════════════
// RELATÓRIO: FÉRIAS VENCIDAS POR COLABORADOR
// ═════════════════════════════════════════════════════════════════

async function gerarRelatorioVencidasColaborador() {
  const todas = await getR();
  const hoje = new Date();
  
  const vencidas = todas.filter(r => {
    if (!r.prazoLimite) return false;
    return new Date(r.prazoLimite) < hoje && r.statusFinal !== 'Aprovada';
  }).sort((a, b) => new Date(a.prazoLimite) - new Date(b.prazoLimite));
  
  if (vencidas.length === 0) {
    alert('✅ Nenhuma féria vencida no momento!');
    return;
  }
  
  let html = `
    <div style="font-family:'Cormorant Garamond',serif;background:var(--sand);padding:40px;border-radius:12px;margin:20px 0">
      <h1 style="text-align:center;color:var(--ink);margin-bottom:10px;font-size:32px">Férias Vencidas por Colaborador</h1>
      <p style="text-align:center;color:var(--ink-60);margin-bottom:30px;font-size:14px">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
      
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:var(--pur-soft);border-bottom:2px solid var(--pur)">
            <th style="padding:14px;text-align:left;color:var(--ink);font-weight:700">Colaborador</th>
            <th style="padding:14px;text-align:center;color:var(--ink);font-weight:700">Setor</th>
            <th style="padding:14px;text-align:center;color:var(--ink);font-weight:700">Dias</th>
            <th style="padding:14px;text-align:center;color:var(--ink);font-weight:700">Vencimento</th>
            <th style="padding:14px;text-align:center;color:var(--ink);font-weight:700">Dias Vencidos</th>
            <th style="padding:14px;text-align:center;color:var(--ink);font-weight:700">Status</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  vencidas.forEach((r, idx) => {
    const diasVencidos = Math.floor((hoje - new Date(r.prazoLimite)) / (1000 * 60 * 60 * 24));
    const bgColor = idx % 2 === 0 ? '#fefdfb' : '#f5f3f0';
    html += `
      <tr style="border-bottom:1px solid var(--border);background:${bgColor}">
        <td style="padding:12px;color:var(--ink);font-weight:500">${r.nome}</td>
        <td style="padding:12px;text-align:center;color:var(--ink-60)">${r.setor || '—'}</td>
        <td style="padding:12px;text-align:center;color:var(--ink)">${r.diasFerias || r.dias || 0}</td>
        <td style="padding:12px;text-align:center;color:var(--rust-dark);font-weight:600">${fmt(r.prazoLimite)}</td>
        <td style="padding:12px;text-align:center;background:rgba(201,79,42,0.1);color:var(--rust-dark);font-weight:700">${diasVencidos}</td>
        <td style="padding:12px;text-align:center;color:var(--ink-60)">${r.statusFinal || 'Aguardando'}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
      <div style="margin-top:30px;padding-top:20px;border-top:2px solid var(--border);text-align:center;color:var(--ink-60);font-size:12px">
        <p>Total: <strong>${vencidas.length}</strong> colaboradores com férias vencidas</p>
      </div>
    </div>
  `;
  
  exibirModalRelatorio('Férias Vencidas por Colaborador', html, 'exportarVencidasColaborador');
  log('Relatório gerado','Férias vencidas por colaborador','📊');
}

// ═════════════════════════════════════════════════════════════════
// RELATÓRIO: FÉRIAS PRÓXIMAS DO VENCIMENTO POR SETOR
// ═════════════════════════════════════════════════════════════════

async function gerarRelatorioProximasVencer() {
  const todas = await getR();
  const hoje = new Date();
  const proximos30 = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const proximas = todas.filter(r => {
    if (!r.prazoLimite) return false;
    const dataVencimento = new Date(r.prazoLimite);
    return dataVencimento >= hoje && dataVencimento <= proximos30 && r.statusFinal !== 'Aprovada';
  });
  
  if (proximas.length === 0) {
    alert('✅ Nenhuma féria próxima de vencer nos próximos 30 dias!');
    return;
  }
  
  const porSetor = {};
  proximas.forEach(r => {
    const setor = r.setor || 'Sem Setor';
    if (!porSetor[setor]) porSetor[setor] = [];
    porSetor[setor].push(r);
  });
  
  let html = `
    <div style="font-family:'Cormorant Garamond',serif;background:var(--sand);padding:40px;border-radius:12px;margin:20px 0">
      <h1 style="text-align:center;color:var(--ink);margin-bottom:10px;font-size:32px">Férias Próximas do Vencimento</h1>
      <p style="text-align:center;color:var(--ink-60);margin-bottom:30px;font-size:14px">Próximos 30 dias | Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
      
      <div style="background:var(--gold-light);border-left:4px solid var(--gold-accent);padding:16px;border-radius:6px;margin-bottom:30px">
        <p style="color:var(--g-orange-s);font-weight:600;margin:0">⚠️ Atenção: ${proximas.length} solicitações vencerão em breve</p>
      </div>
  `;
  
  Object.entries(porSetor).sort((a,b) => b[1].length - a[1].length).forEach(([setor, dados]) => {
    html += `
      <div style="margin-bottom:30px;border:1px solid var(--border);border-radius:10px;overflow:hidden">
        <div style="background:linear-gradient(135deg, var(--gold-light) 0%, rgba(201,168,138,0.1) 100%);padding:16px;border-bottom:1px solid var(--border)">
          <h2 style="color:var(--ink);margin:0;font-size:18px;font-family:'Cormorant Garamond',serif">${setor}</h2>
          <p style="color:var(--ink-60);margin:4px 0 0;font-size:13px">${dados.length} colaborador${dados.length!==1?'es':''}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:var(--sand);border-bottom:1px solid var(--border)">
              <th style="padding:12px;text-align:left;color:var(--ink);font-weight:600">Colaborador</th>
              <th style="padding:12px;text-align:center;color:var(--ink);font-weight:600">Dias</th>
              <th style="padding:12px;text-align:center;color:var(--ink);font-weight:600">Vencimento</th>
              <th style="padding:12px;text-align:center;color:var(--ink);font-weight:600">Dias Restantes</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    dados.forEach(r => {
      const diasRestantes = Math.ceil((new Date(r.prazoLimite) - hoje) / (1000 * 60 * 60 * 24));
      const bgColor = diasRestantes <= 7 ? 'rgba(255,152,170,0.1)' : 'transparent';
      html += `
        <tr style="border-bottom:1px solid var(--border-light);background:${bgColor}">
          <td style="padding:12px;color:var(--ink)">${r.nome}</td>
          <td style="padding:12px;text-align:center;color:var(--ink)">${r.diasFerias || r.dias || 0}</td>
          <td style="padding:12px;text-align:center;color:var(--gold-accent);font-weight:600">${fmt(r.prazoLimite)}</td>
          <td style="padding:12px;text-align:center;font-weight:700;color:${diasRestantes <= 7 ? 'var(--rust-dark)' : 'var(--ink)'}">${diasRestantes} dias</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  });
  
  html += `
      <div style="margin-top:40px;padding-top:20px;border-top:2px solid var(--border);text-align:center;color:var(--ink-60);font-size:12px">
        <p>Recomenda-se contato com os colaboradores para agendamento imediato</p>
      </div>
    </div>
  `;
  
  exibirModalRelatorio('Férias Próximas do Vencimento', html, 'exportarProximasVencer');
  log('Relatório gerado','Férias próximas a vencer','⏰');
}

// ═════════════════════════════════════════════════════════════════
// RELATÓRIO: FÉRIAS PROGRAMADAS POR SETOR
// ═════════════════════════════════════════════════════════════════

async function gerarRelatorioProgramadas() {
  const todas = await getR();
  const hoje = new Date();
  
  const programadas = todas.filter(r => r.statusFinal === 'Aprovada' && r.inicio).sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
  
  if (programadas.length === 0) {
    alert('✅ Nenhuma féria programada no momento!');
    return;
  }
  
  const porSetor = {};
  programadas.forEach(r => {
    const setor = r.setor || 'Sem Setor';
    if (!porSetor[setor]) {
      porSetor[setor] = {
        total: 0,
        dias: 0,
        colaboradores: []
      };
    }
    porSetor[setor].total++;
    porSetor[setor].dias += (r.diasFerias || r.dias || 0);
    porSetor[setor].colaboradores.push(r);
  });
  
  let html = `
    <div style="font-family:'Cormorant Garamond',serif;background:var(--sand);padding:40px;border-radius:12px;margin:20px 0">
      <h1 style="text-align:center;color:var(--ink);margin-bottom:10px;font-size:32px">Férias Programadas por Setor</h1>
      <p style="text-align:center;color:var(--ink-60);margin-bottom:30px;font-size:14px">Cronograma de ausências aprovadas | Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
      
      <div style="background:var(--g-green-s);border-left:4px solid var(--g-green);padding:16px;border-radius:6px;margin-bottom:30px">
        <p style="color:var(--g-green);font-weight:600;margin:0">✅ Total: ${programadas.length} colaboradores em férias | ${programadas.reduce((a,r)=>a+(r.diasFerias||r.dias||0),0)} dias programados</p>
      </div>
  `;
  
  Object.entries(porSetor).sort((a,b) => b[1].total - a[1].total).forEach(([setor, dados]) => {
    html += `
      <div style="margin-bottom:30px;border:1px solid var(--border);border-radius:10px;overflow:hidden">
        <div style="background:linear-gradient(135deg, var(--g-green-s) 0%, rgba(138,154,127,0.1) 100%);padding:16px;border-bottom:1px solid var(--border)">
          <h2 style="color:var(--ink);margin:0;font-size:18px;font-family:'Cormorant Garamond',serif">${setor}</h2>
          <p style="color:var(--ink-60);margin:4px 0 0;font-size:13px">${dados.total} colaborador${dados.total!==1?'es':''} | ${dados.dias} dias</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:var(--sand);border-bottom:1px solid var(--border)">
              <th style="padding:12px;text-align:left;color:var(--ink);font-weight:600">Colaborador</th>
              <th style="padding:12px;text-align:center;color:var(--ink);font-weight:600">Dias</th>
              <th style="padding:12px;text-align:center;color:var(--ink);font-weight:600">Início</th>
              <th style="padding:12px;text-align:center;color:var(--ink);font-weight:600">Fim</th>
              <th style="padding:12px;text-align:center;color:var(--ink);font-weight:600">Gestor</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    dados.colaboradores.forEach(r => {
      const fimFerias = new Date(r.inicio);
      fimFerias.setDate(fimFerias.getDate() + (r.diasFerias || r.dias || 0));
      html += `
        <tr style="border-bottom:1px solid var(--border-light)">
          <td style="padding:12px;color:var(--ink);font-weight:500">${r.nome}</td>
          <td style="padding:12px;text-align:center;color:var(--ink)">${r.diasFerias || r.dias || 0}</td>
          <td style="padding:12px;text-align:center;color:var(--g-green);font-weight:600">${fmt(r.inicio)}</td>
          <td style="padding:12px;text-align:center;color:var(--g-green);font-weight:600">${fmt(fimFerias.toISOString().split('T')[0])}</td>
          <td style="padding:12px;text-align:center;color:var(--ink-60)">${r.nomeGestor || '—'}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  });
  
  html += `
      <div style="margin-top:40px;padding-top:20px;border-top:2px solid var(--border);text-align:center;color:var(--ink-60);font-size:12px">
        <p>Cronograma consolidado para planejamento operacional</p>
      </div>
    </div>
  `;
  
  exibirModalRelatorio('Férias Programadas por Setor', html, 'exportarProgramadas');
  log('Relatório gerado','Férias programadas por setor','📅');
}

// ═════════════════════════════════════════════════════════════════
// HELPER: Exibir Modal de Relatório
// ═════════════════════════════════════════════════════════════════

function exibirModalRelatorio(titulo, html, funcaoExportar) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);
    display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px
  `;
  modal.innerHTML = `
    <div style="background:white;border-radius:12px;max-width:1000px;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid var(--border);position:sticky;top:0;background:white">
        <h2 style="margin:0;color:var(--ink);font-family:'Cormorant Garamond',serif;font-size:24px">${titulo}</h2>
        <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--ink-60)">&times;</button>
      </div>
      <div style="padding:20px">${html}</div>
      <div style="padding:20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end">
        <button class="btn btn-p" onclick="${funcaoExportar}()">📥 Exportar PDF</button>
        <button class="btn btn-g" onclick="this.parentElement.parentElement.parentElement.remove()">Fechar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// ═════════════════════════════════════════════════════════════════
// FUNÇÕES DE EXPORTAÇÃO PDF
// ═════════════════════════════════════════════════════════════════

async function exportarVencidasColaborador() {
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  const todas = await getR();
  const hoje = new Date();
  const vencidas = todas.filter(r => new Date(r.prazoLimite) < hoje && r.statusFinal !== 'Aprovada');
  
  doc.setFont('helvetica','bold');
  doc.setFontSize(16);
  doc.text('Férias Vencidas por Colaborador', 14, 20);
  doc.setFont('helvetica','normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
  
  doc.autoTable({
    startY: 36,
    head: [['Colaborador', 'Setor', 'Dias', 'Vencimento', 'Dias Vencidos']],
    body: vencidas.map(r => {
      const diasVencidos = Math.floor((hoje - new Date(r.prazoLimite)) / (1000 * 60 * 60 * 24));
      return [r.nome, r.setor || '—', r.diasFerias || r.dias || 0, fmt(r.prazoLimite), diasVencidos];
    }),
    styles: {fontSize: 9, cellPadding: 3},
    headStyles: {fillColor: [255, 152, 170], textColor: 255, fontStyle: 'bold'},
    alternateRowStyles: {fillColor: [245, 240, 232]}
  });
  
  doc.save(`relatorio-vencidas-colaborador-${new Date().toISOString().split('T')[0]}.pdf`);
}

async function exportarProximasVencer() {
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  const todas = await getR();
  const hoje = new Date();
  const proximos30 = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
  const proximas = todas.filter(r => {
    if (!r.prazoLimite) return false;
    const dv = new Date(r.prazoLimite);
    return dv >= hoje && dv <= proximos30 && r.statusFinal !== 'Aprovada';
  });
  
  doc.setFont('helvetica','bold');
  doc.setFontSize(16);
  doc.text('Férias Próximas do Vencimento (30 dias)', 14, 20);
  doc.setFont('helvetica','normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
  
  doc.autoTable({
    startY: 36,
    head: [['Colaborador', 'Setor', 'Dias', 'Vencimento', 'Dias Restantes']],
    body: proximas.map(r => {
      const diasRestantes = Math.ceil((new Date(r.prazoLimite) - hoje) / (1000 * 60 * 60 * 24));
      return [r.nome, r.setor || '—', r.diasFerias || r.dias || 0, fmt(r.prazoLimite), diasRestantes];
    }),
    styles: {fontSize: 9, cellPadding: 3},
    headStyles: {fillColor: [201, 168, 138], textColor: 255, fontStyle: 'bold'},
    alternateRowStyles: {fillColor: [245, 240, 232]}
  });
  
  doc.save(`relatorio-proximas-vencer-${new Date().toISOString().split('T')[0]}.pdf`);
}

async function exportarProgramadas() {
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  const todas = await getR();
  const programadas = todas.filter(r => r.statusFinal === 'Aprovada' && r.inicio);
  
  doc.setFont('helvetica','bold');
  doc.setFontSize(16);
  doc.text('Férias Programadas por Setor', 14, 20);
  doc.setFont('helvetica','normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
  
  doc.autoTable({
    startY: 36,
    head: [['Colaborador', 'Setor', 'Dias', 'Início', 'Fim', 'Gestor']],
    body: programadas.map(r => {
      const fimFerias = new Date(r.inicio);
      fimFerias.setDate(fimFerias.getDate() + (r.diasFerias || r.dias || 0));
      return [r.nome, r.setor || '—', r.diasFerias || r.dias || 0, fmt(r.inicio), fmt(fimFerias.toISOString().split('T')[0]), r.nomeGestor || '—'];
    }),
    styles: {fontSize: 9, cellPadding: 3},
    headStyles: {fillColor: [138, 154, 127], textColor: 255, fontStyle: 'bold'},
    alternateRowStyles: {fillColor: [245, 240, 232]}
  });
  
  doc.save(`relatorio-programadas-${new Date().toISOString().split('T')[0]}.pdf`);
}

// ══════════════════════════════════════
// GERENCIAMENTO DE USUÁRIOS (RH)
// ══════════════════════════════════════

async function criarUsuario() {
  const nome  = document.getElementById('uNome').value.trim();
  const email = document.getElementById('uEmail').value.trim();
  const senha = document.getElementById('uSenha').value;
  const role  = document.getElementById('uRole').value;
  const msg   = document.getElementById('uMsg');

  const showU = (txt, ok) => {
    msg.textContent = txt;
    msg.style.display = 'block';
    msg.style.background = ok ? 'var(--forest-soft)' : 'var(--rust-soft)';
    msg.style.color = ok ? '#065f46' : 'var(--rust-dark)';
  };

  if (!nome || !email || !senha) { showU('❌ Preencha todos os campos.', false); return; }
  if (senha.length < 6) { showU('❌ Senha deve ter mínimo 6 caracteres.', false); return; }

  try {
    const FIREBASE_API_KEY = firebaseConfig.apiKey;
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password: senha, returnSecureToken: true})
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const uid = data.localId;
    // Salvar perfil no Firestore — sem armazenar senha
    const unidade = document.getElementById('uUnidade')?.value || 'meta';
    await db.collection('users').doc(uid).set({
      uid, nome, email, role, unidade,
      criadoEm: new Date().toISOString(),
      criadoPor: currentUserData?.email || 'admin'
    });

    // Disparar e-mail de redefinição para o usuário definir sua própria senha
    await auth.sendPasswordResetEmail(email).catch(() => {});

    showU(`✅ Usuário ${escapeHtml(nome)} criado! E-mail de definição de senha enviado para ${escapeHtml(email)}.`, true);
    document.getElementById('uNome').value = '';
    document.getElementById('uEmail').value = '';
    document.getElementById('uSenha').value = '';
    if(document.getElementById('uUnidade')) document.getElementById('uUnidade').value='meta';
    log('Usuário criado', `${nome} (${email}) — perfil: ${role}`, '🔑');
    carregarUsuarios();
  } catch(e) {
    const msgs = {
      'EMAIL_EXISTS': '❌ E-mail já cadastrado.',
      'WEAK_PASSWORD : Password should be at least 6 characters': '❌ Senha muito fraca.',
      'INVALID_EMAIL': '❌ E-mail inválido.',
    };
    showU(msgs[e.message] || '❌ Erro: ' + escapeHtml(e.message), false);
  }
}


// ══════════════════════════════════════
// GESTÃO DE SETORES E GESTORES
// ══════════════════════════════════════

async function adicionarSetor() {
  const input = document.getElementById('novoSetor');
  const nome = input.value.trim();
  if (!nome) return;
  try {
    const snap = await db.collection(col('setores')).where('nome', '==', nome).get();
    if (!snap.empty) { alert('Setor já cadastrado!'); return; }
    await db.collection(col('setores')).add({ nome, criadoEm: new Date().toISOString() });
    input.value = '';
    carregarSetores();
    popularSelectSetor();
    log('Setor adicionado', nome, '🏢');
  } catch(e) { alert('Erro: ' + e.message); }
}

async function removerSetor(id, nome) {
  if (!confirm(`Remover o setor "${nome}"?`)) return;
  await db.collection(col('setores')).doc(id).delete();
  carregarSetores();
  popularSelectSetor();
}

async function carregarSetores() {
  const el = document.getElementById('setoresList');
  if (!el) return;
  el.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try {
    const snap = await db.collection(col('setores')).get();
    if (snap.empty) { el.innerHTML = '<div class="empty"><div class="ei">🏢</div>Nenhum setor cadastrado</div>'; return; }
    el.innerHTML = snap.docs.map(d => `
      <div class="col-card" style="margin-bottom:6px">
        <span style="font-weight:600;flex:1">🏢 ${d.data().nome}</span>
        <button class="btn btn-g btn-sm" style="color:var(--rust)" onclick="removerSetor('${d.id}','${d.data().nome}')">🗑</button>
      </div>`).join('');
  } catch(e) { el.innerHTML = `<div class="empty"><div class="ei">❌</div>Erro: ${e.message}</div>`; }
}

async function popularSelectSetor() {
  const sel = document.getElementById('fSetor');
  if (!sel) return;
  try {
    const snap = await db.collection(col('setores')).get();
    const cur = sel.value;
    sel.innerHTML = '<option value="">Selecione o setor...</option>' +
      snap.docs.map(d => `<option value="${d.data().nome}" ${d.data().nome===cur?'selected':''}>${d.data().nome}</option>`).join('');
  } catch(e) {}
}

async function adicionarGestor() {
  const nome  = document.getElementById('novoGestorNome').value.trim();
  const email = document.getElementById('novoGestorEmail').value.trim();
  if (!nome || !email) { alert('Preencha nome e e-mail do gestor.'); return; }
  try {
    const snap = await db.collection(col('gestores')).where('email', '==', email).get();
    if (!snap.empty) { alert('Gestor com este e-mail já cadastrado!'); return; }
    await db.collection(col('gestores')).add({ nome, email, criadoEm: new Date().toISOString() });
    document.getElementById('novoGestorNome').value = '';
    document.getElementById('novoGestorEmail').value = '';
    carregarGestores();
    popularSelectGestor();
    log('Gestor adicionado', `${nome} (${email})`, '👔');
  } catch(e) { alert('Erro: ' + e.message); }
}

async function removerGestor(id, nome) {
  if (!confirm(`Remover o gestor "${nome}"?`)) return;
  await db.collection(col('gestores')).doc(id).delete();
  carregarGestores();
  popularSelectGestor();
}

async function carregarGestores() {
  const el = document.getElementById('gestoresList');
  if (!el) return;
  el.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try {
    const snap = await db.collection(col('gestores')).get();
    if (snap.empty) { el.innerHTML = '<div class="empty"><div class="ei">👔</div>Nenhum gestor cadastrado</div>'; return; }
    el.innerHTML = snap.docs.map(d => `
      <div class="col-card" style="margin-bottom:6px">
        <div style="flex:1">
          <div style="font-weight:600">👔 ${d.data().nome}</div>
          <div style="font-size:12px;color:var(--ink-60)">📧 ${d.data().email}</div>
        </div>
        <button class="btn btn-g btn-sm" style="color:var(--rust)" onclick="removerGestor('${d.id}','${d.data().nome}')">🗑</button>
      </div>`).join('');
  } catch(e) { el.innerHTML = `<div class="empty"><div class="ei">❌</div>Erro: ${e.message}</div>`; }
}

async function popularSelectGestor() {
  const sel = document.getElementById('fNomeGestor');
  if (!sel) return;
  try {
    const snap = await db.collection(col('gestores')).get();
    const cur = sel.value;
    sel.innerHTML = '<option value="">Selecione o gestor...</option>' +
      snap.docs.map(d => `<option value="${d.data().nome}" data-email="${d.data().email}" ${d.data().nome===cur?'selected':''}>${d.data().nome}</option>`).join('');
  } catch(e) {}
}

function onGestorSelect(sel) {
  const opt = sel.options[sel.selectedIndex];
  const emailField = document.getElementById('fEmailGestor');
  if (emailField) emailField.value = opt.dataset.email || '';
}

async function carregarUsuarios() {
  carregarSetores();
  carregarGestores();
  const el = document.getElementById('uList');
  if (!el) return;
  el.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  try {
    const snap = await db.collection('users').get();
    const users = snap.docs.map(d => d.data());
    if (!users.length) {
      el.innerHTML = '<div class="empty"><div class="ei">👤</div>Nenhum usuário cadastrado</div>';
      return;
    }
    const roleLabel = {colaborador:'👤 Colaborador', gestor:'👔 Gestor', rh:'🏢 RH'};
    el.innerHTML = users.map(u => `
      <div class="col-card">
        <div style="flex:1;min-width:0">
          <div class="col-name">${u.nome}</div>
          <div class="col-meta">
            <span>📧 ${u.email}</span>
            <span class="col-tag">${roleLabel[u.role]||u.role}</span>
            <span class="col-tag" style="background:var(--pur-mid);color:var(--pur-dark)">${u.unidade==='xpert'?'⚡ Xpert':'🏢 Meta'}</span>
            ${u.criadoEm ? `<span>📅 ${new Date(u.criadoEm).toLocaleDateString('pt-BR')}</span>` : ''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
          <button class="btn btn-g btn-sm" style="color:var(--rust)" onclick="removerUsuario('${u.uid}','${u.email}')">🗑 Remover</button>
        </div>
      </div>`).join('');
  } catch(e) {
    el.innerHTML = `<div class="empty"><div class="ei">❌</div>Erro ao carregar: ${e.message}</div>`;
  }
}

async function removerUsuario(uid, email) {
  if (!confirm(`Remover o usuário ${email}?\nEsta ação não remove o acesso imediatamente — contate o Firebase Console para desabilitar o login.`)) return;
  try {
    await db.collection('users').doc(uid).delete();
    log('Usuário removido do Firestore', email, '🗑');
    addNotif(`Usuário ${email} removido da base.`, 'warning');
    carregarUsuarios();
  } catch(e) {
    alert('Erro ao remover: ' + e.message);
  }
}

// ══════════════════════════════════════
// POLÍTICA DE FÉRIAS — Editor RH
// ══════════════════════════════════════

const POLITICA_DOC = 'configuracoes/politicaFerias';

// Tópicos padrão baseados no PDF da empresa
const POLITICA_DEFAULT = {
  versao: 1,
  atualizadoEm: new Date().toISOString(),
  atualizadoPor: 'Sistema',
  topicos: [
    {
      id: 'pt1',
      icone: '📅',
      titulo: 'Conceito e Prazos',
      conteudo: 'Férias são o período anual de descanso remunerado concedido ao colaborador após 12 (doze) meses de exercício contínuo (período aquisitivo). O valor das férias, acrescido de 1/3 constitucional, é pago até 2 (dois) dias antes do início do descanso. A fruição pode ser postergada, desde que não ultrapasse 1 ano e 11 meses contados do início do período aquisitivo.',
      ativo: true
    },
    {
      id: 'pt2',
      icone: '📊',
      titulo: 'Quantidade de Dias',
      conteudo: 'Após 12 meses de contrato, o direito às férias é proporcional às faltas injustificadas: 0 a 5 faltas → 30 dias; 6 a 14 faltas → 24 dias; 15 a 23 faltas → 18 dias; 24 a 32 faltas → 12 dias. Faltas justificadas conforme lei não reduzem o período de férias.',
      ativo: true
    },
    {
      id: 'pt3',
      icone: '✂️',
      titulo: 'Fracionamento',
      conteudo: 'As férias podem ser parceladas em até 3 (três) períodos, mediante solicitação do colaborador e acordo do gestor/RH. Um dos períodos deve ter mínimo de 14 dias corridos e os demais não podem ser inferiores a 5 dias corridos cada. É possível converter até 1/3 do período em abono pecuniário mediante solicitação ao RH.',
      ativo: true
    },
    {
      id: 'pt4',
      icone: '📨',
      titulo: 'Como Solicitar',
      conteudo: 'Passo a passo: (1) Alinhe previamente com seu gestor direto as datas pretendidas; (2) Envie e-mail ao RH e ao gestor com antecedência mínima de 45 dias, informando data prevista de início, quantidade de dias e indicação sobre abono pecuniário; (3) O RH validará com o gestor e retornará com o agendamento oficial e orientações de pagamento.',
      ativo: true
    },
    {
      id: 'pt5',
      icone: '⚠️',
      titulo: 'Perda do Direito',
      conteudo: 'O colaborador perde o direito às férias do período aquisitivo se: (a) houver desligamento sem readmissão em até 60 dias; (b) permanecer em licença remunerada por mais de 30 dias; (c) ficar afastado por paralisação dos serviços por mais de 30 dias; ou (d) receber benefício previdenciário por acidente de trabalho ou auxílio-doença por mais de 6 meses, ainda que descontínuos.',
      ativo: true
    },
    {
      id: 'pt6',
      icone: '⏸️',
      titulo: 'Interrupção de Férias',
      conteudo: 'A interrupção somente poderá ocorrer por força maior ou caso fortuito, com aprovação do gestor e do RH. O saldo remanescente deverá ser gozado de uma única vez, em data acordada entre as partes.',
      ativo: true
    }
  ]
};

let politicaState = null;      // estado atual carregado do Firestore
let politicaEdicao = null;     // cópia em edição (deep clone)
let politicaModoEdicao = false;

async function politicaCarregar() {
  const container = document.getElementById('politicaTopicosContainer');
  if (!container) return;
  container.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando política...</div>';
  try {
    const snap = await db.doc(POLITICA_DOC).get();
    if (snap.exists) {
      politicaState = snap.data();
    } else {
      // Primeira vez: gravar padrão
      await db.doc(POLITICA_DOC).set(POLITICA_DEFAULT);
      politicaState = JSON.parse(JSON.stringify(POLITICA_DEFAULT));
    }
    politicaRenderizar(politicaState);
    politicaAtualizarRodape(politicaState);
    politicaRenderizarArquivo(politicaState.arquivo);
  } catch(e) {
    container.innerHTML = `<div class="empty"><div class="ei">❌</div>Erro ao carregar: ${e.message}</div>`;
  }
}

function politicaRenderizarArquivo(arquivo){
  const wrap = document.getElementById('politicaArquivoWrap');
  if (!wrap) return;
  if (!arquivo || !arquivo.conteudo) { wrap.style.display = 'none'; wrap.innerHTML = ''; return; }
  wrap.style.display = 'block';
  wrap.innerHTML = `<div style="display:flex;align-items:center;gap:12px;background:var(--sand-light);border-radius:10px;padding:12px 16px">
    <span style="font-size:22px">${arquivo.tipo && arquivo.tipo.includes('pdf') ? '📕' : '📄'}</span>
    <div style="flex:1">
      <div style="font-size:13px;font-weight:700">${escapeHtml(arquivo.nome||'Política de Férias')}</div>
      <div style="font-size:11px;color:var(--ink-60)">Anexado em ${arquivo.atualizadoEm ? new Date(arquivo.atualizadoEm).toLocaleDateString('pt-BR') : '—'}</div>
    </div>
    <a href="${arquivo.conteudo}" download="${escapeHtml(arquivo.nome||'politica-ferias')}" class="btn btn-g btn-sm">⬇️ Baixar</a>
    <button class="btn btn-g btn-sm" onclick="politicaRemoverArquivo()">🗑️ Remover</button>
  </div>`;
}

async function politicaAnexarArquivo(input){
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 900000) {
    alert('Arquivo muito grande (máx. ~900KB). Tente um PDF/Word mais leve ou compactado.');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = async (e) => {
    const arquivo = { nome: file.name || 'politica-ferias', tipo: file.type || '', conteudo: e.target.result || '', atualizadoEm: new Date().toISOString() };
    try {
      await db.doc(POLITICA_DOC).set({ arquivo }, { merge: true });
      politicaState = politicaState || {};
      politicaState.arquivo = arquivo;
      politicaRenderizarArquivo(arquivo);
      addNotif('Política de Férias (arquivo) anexada com sucesso!', 'success');
    } catch(err) {
      alert('Erro ao salvar anexo: ' + err.message);
    }
  };
  reader.readAsDataURL(file);
}

async function politicaRemoverArquivo(){
  if (!confirm('Remover o arquivo anexado da política?')) return;
  try {
    await db.doc(POLITICA_DOC).set({ arquivo: null }, { merge: true });
    if (politicaState) politicaState.arquivo = null;
    politicaRenderizarArquivo(null);
  } catch(e) {
    alert('Erro ao remover: ' + e.message);
  }
}

function politicaRenderizar(data) {
  const container = document.getElementById('politicaTopicosContainer');
  if (!container || !data) return;
  const topicos = (data.topicos || []).filter(t => t.ativo !== false || politicaModoEdicao);

  if (!topicos.length) {
    container.innerHTML = '<div class="empty"><div class="ei">📋</div>Nenhum tópico cadastrado. Clique em "Editar" para adicionar.</div>';
    return;
  }

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
      ${topicos.map((t, idx) => politicaRenderTopico(t, idx, data.topicos.indexOf(t))).join('')}
    </div>
  `;
}

function politicaRenderTopico(t, idxVis, idxReal) {
  const editando = politicaModoEdicao;
  const inativo = t.ativo === false;
  return `
    <div class="card" id="topico-card-${idxReal}" style="border:${inativo ? '1.5px dashed var(--border)' : '1px solid var(--border)'};opacity:${inativo ? '0.55' : '1'};transition:.2s;position:relative">
      ${editando ? `
        <div style="position:absolute;top:10px;right:10px;display:flex;gap:6px;z-index:2">
          <button onclick="politicaMoverTopico(${idxReal},-1)" title="Mover para cima" style="border:1px solid var(--border);background:#fff;border-radius:7px;padding:4px 8px;cursor:pointer;font-size:13px" ${idxReal===0?'disabled':''}>↑</button>
          <button onclick="politicaMoverTopico(${idxReal},1)" title="Mover para baixo" style="border:1px solid var(--border);background:#fff;border-radius:7px;padding:4px 8px;cursor:pointer;font-size:13px">↓</button>
          <button onclick="politicaToggleAtivo(${idxReal})" title="${inativo?'Reativar':'Desativar'}" style="border:1px solid var(--border);background:#fff;border-radius:7px;padding:4px 8px;cursor:pointer;font-size:13px">${inativo?'👁':'🙈'}</button>
          <button onclick="politicaRemoverTopico(${idxReal})" title="Remover" style="border:1px solid #f48fb1;background:#fce4ec;border-radius:7px;padding:4px 8px;cursor:pointer;font-size:13px;color:var(--rust-dark)">🗑</button>
        </div>
      ` : ''}
      <div class="card-body" style="padding:20px">
        ${editando ? `
          <div style="display:flex;gap:10px;margin-bottom:12px;align-items:center">
            <input value="${t.icone || '📋'}" oninput="politicaUpdateCampo(${idxReal},'icone',this.value)"
              style="width:54px;text-align:center;font-size:20px;padding:6px;border:1px solid var(--border);border-radius:8px">
            <input value="${t.titulo}" oninput="politicaUpdateCampo(${idxReal},'titulo',this.value)"
              style="flex:1;font-weight:700;font-size:15px;padding:8px 12px;border:1px solid var(--border);border-radius:8px">
          </div>
          <textarea oninput="politicaUpdateCampo(${idxReal},'conteudo',this.value)"
            style="width:100%;min-height:110px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;line-height:1.6;resize:vertical">${t.conteudo}</textarea>
          ${inativo ? '<div style="margin-top:8px;font-size:11px;color:var(--rust-dark);font-weight:600">⚠️ Tópico desativado — não aparece para colaboradores</div>' : ''}
        ` : `
          <h4 style="color:var(--pur-vibrant);margin-bottom:10px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;display:flex;align-items:center;gap:7px">
            <span style="font-size:18px">${t.icone || '📋'}</span>${t.titulo}
          </h4>
          <p style="font-size:13px;color:var(--ink-60);line-height:1.7">${t.conteudo}</p>
        `}
      </div>
    </div>`;
}

function politicaToggleModo() {
  politicaModoEdicao = true;
  politicaEdicao = JSON.parse(JSON.stringify(politicaState));
  document.getElementById('btnEditarPolitica').style.display = 'none';
  document.getElementById('btnSalvarPolitica').style.display = '';
  document.getElementById('btnCancelarPolitica').style.display = '';
  document.getElementById('btnAdicionarTopico').style.display = '';
  document.getElementById('politicaVersionBanner').style.display = 'block';
  politicaRenderizar(politicaEdicao);
}

function politicaCancelarEdicao() {
  politicaModoEdicao = false;
  politicaEdicao = null;
  document.getElementById('btnEditarPolitica').style.display = '';
  document.getElementById('btnSalvarPolitica').style.display = 'none';
  document.getElementById('btnCancelarPolitica').style.display = 'none';
  document.getElementById('btnAdicionarTopico').style.display = 'none';
  document.getElementById('politicaVersionBanner').style.display = 'none';
  politicaRenderizar(politicaState);
}

function politicaUpdateCampo(idx, campo, valor) {
  if (!politicaEdicao) return;
  politicaEdicao.topicos[idx][campo] = valor;
}

function politicaToggleAtivo(idx) {
  if (!politicaEdicao) return;
  politicaEdicao.topicos[idx].ativo = !(politicaEdicao.topicos[idx].ativo !== false);
  politicaRenderizar(politicaEdicao);
}

function politicaMoverTopico(idx, dir) {
  if (!politicaEdicao) return;
  const arr = politicaEdicao.topicos;
  const novoIdx = idx + dir;
  if (novoIdx < 0 || novoIdx >= arr.length) return;
  [arr[idx], arr[novoIdx]] = [arr[novoIdx], arr[idx]];
  politicaRenderizar(politicaEdicao);
}

function politicaRemoverTopico(idx) {
  if (!politicaEdicao) return;
  if (!confirm('Remover este tópico da política?')) return;
  politicaEdicao.topicos.splice(idx, 1);
  politicaRenderizar(politicaEdicao);
}

function politicaAdicionarTopico() {
  if (!politicaEdicao) return;
  const novoId = 'pt_' + Date.now();
  politicaEdicao.topicos.push({
    id: novoId,
    icone: '📌',
    titulo: 'Novo Tópico',
    conteudo: 'Descreva aqui o conteúdo deste tópico da política de férias.',
    ativo: true
  });
  politicaRenderizar(politicaEdicao);
  // Rolar até o novo card
  setTimeout(() => {
    const cards = document.querySelectorAll('#politicaTopicosContainer .card');
    if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

async function politicaSalvar() {
  if (!politicaEdicao) return;
  const btn = document.getElementById('btnSalvarPolitica');
  btn.textContent = '⏳ Salvando...';
  btn.disabled = true;

  // Ler valores atuais dos inputs/textareas que estão no DOM
  const cards = document.querySelectorAll('#politicaTopicosContainer .card');
  cards.forEach((card, i) => {
    const inputs = card.querySelectorAll('input');
    const textarea = card.querySelector('textarea');
    if (inputs[0]) politicaEdicao.topicos[i].icone = inputs[0].value;
    if (inputs[1]) politicaEdicao.topicos[i].titulo = inputs[1].value;
    if (textarea)  politicaEdicao.topicos[i].conteudo = textarea.value;
  });

  try {
    const novaVersao = ((politicaState.versao || 1) + 1);
    const userName = sessionStorage.getItem('userName') || 'RH';

    // Guardar versão anterior no histórico
    const historico = politicaState.historico || [];
    historico.unshift({
      versao: politicaState.versao || 1,
      atualizadoEm: politicaState.atualizadoEm || '',
      atualizadoPor: politicaState.atualizadoPor || '',
      topicos: politicaState.topicos || []
    });
    // Manter no máx. 10 versões
    if (historico.length > 10) historico.splice(10);

    const novaData = {
      ...politicaEdicao,
      versao: novaVersao,
      atualizadoEm: new Date().toISOString(),
      atualizadoPor: userName,
      historico
    };

    await db.doc(POLITICA_DOC).set(novaData);
    politicaState = JSON.parse(JSON.stringify(novaData));

    log('Política de Férias atualizada', `Versão ${novaVersao} salva por ${userName}`, '📋');
    addNotif('Política de Férias atualizada com sucesso!', 'success');

    politicaModoEdicao = false;
    politicaEdicao = null;
    document.getElementById('btnEditarPolitica').style.display = '';
    document.getElementById('btnSalvarPolitica').style.display = 'none';
    document.getElementById('btnCancelarPolitica').style.display = 'none';
    document.getElementById('btnAdicionarTopico').style.display = 'none';
    document.getElementById('politicaVersionBanner').style.display = 'none';
    politicaRenderizar(politicaState);
    politicaAtualizarRodape(politicaState);
  } catch(e) {
    alert('Erro ao salvar: ' + e.message);
  } finally {
    btn.textContent = '💾 Salvar';
    btn.disabled = false;
  }
}

function politicaAtualizarRodape(data) {
  const el = document.getElementById('politicaUltimaEdicao');
  if (!el || !data) return;
  if (data.atualizadoEm) {
    const dt = new Date(data.atualizadoEm).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
    el.textContent = `v${data.versao || 1} · Editado em ${dt} por ${data.atualizadoPor || 'Sistema'}`;
  }
}

function politicaVerHistorico() {
  const modal = document.getElementById('politicaHistoricoModal');
  const lista = document.getElementById('politicaHistoricoLista');
  const historico = politicaState?.historico || [];

  if (!historico.length) {
    lista.innerHTML = '<div class="empty"><div class="ei">📋</div>Nenhuma versão anterior registrada.</div>';
  } else {
    lista.innerHTML = historico.map((v, i) => `
      <div style="border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong style="font-size:14px">Versão ${v.versao}</strong>
          <span style="font-size:11px;color:var(--ink-30)">${v.atualizadoPor || 'Sistema'} · ${v.atualizadoEm ? new Date(v.atualizadoEm).toLocaleString('pt-BR') : ''}</span>
        </div>
        <div style="font-size:12px;color:var(--ink-60)">${(v.topicos||[]).filter(t=>t.ativo!==false).length} tópicos ativos</div>
        <button onclick="politicaRestaurarVersao(${i})" class="btn btn-g btn-sm" style="margin-top:10px;font-size:11px">↩️ Restaurar esta versão</button>
      </div>`).join('');
  }

  modal.style.display = 'flex';
}

async function politicaRestaurarVersao(idxHistorico) {
  if (!confirm('Restaurar esta versão? A versão atual será arquivada no histórico.')) return;
  const versaoAntiga = politicaState.historico[idxHistorico];
  // Simula edição para salvar com os dados da versão antiga
  politicaEdicao = {
    topicos: JSON.parse(JSON.stringify(versaoAntiga.topicos || []))
  };
  document.getElementById('politicaHistoricoModal').style.display = 'none';
  await politicaSalvar();
}

// Carregar quando o painel RH for exibido
const _origNavTo = typeof navTo === 'function' ? navTo : null;

// Hook: detectar quando view-rh é ativado para carregar a política
document.addEventListener('DOMContentLoaded', () => {
  // ── Detectar file:// e avisar ──
  if (window.location.protocol === 'file:') {
    const w = document.getElementById('lFileWarning');
    if (w) w.style.display = 'block';
    const btn = document.getElementById('lBtn');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.title = 'Sirva o arquivo via servidor HTTP primeiro'; }
  }

  // Observer para detectar quando view-rh fica visível
  const rhView = document.getElementById('view-rh');
  if (rhView) {
    const obs = new MutationObserver((muts) => {
      muts.forEach(m => {
        if (m.type === 'attributes' && m.attributeName === 'style') {
          const visible = rhView.style.display !== 'none' && !rhView.hidden;
          if (visible && !politicaState) {
            politicaCarregar();
          }
        }
      });
    });
    obs.observe(rhView, { attributes: true });
  }
});

// ══════════════════════════════════════
// INICIALIZAÇÃO — Firebase Auth listener
// ══════════════════════════════════════
var __authCheckDone = false;
auth.onAuthStateChanged(async (user) => {
  // Login em andamento pelo fluxo real (js/modules/login-auth.js) — ele já
  // cuida de tudo (coleção correta grh_colabs, papel/perfis, navegação).
  // Sem esta checagem, este listener corria em paralelo com aquele fluxo,
  // usando a coleção `users` (não `grh_colabs`) e um papel padrão diferente
  // — o que terminasse primeiro "vencia" a corrida, deixando
  // `window.currentUserData` vazio ou o papel errado às vezes. Aqui só
  // resta a função original deste listener: restaurar uma sessão já
  // autenticada quando a página é recarregada SEM passar pelo botão Entrar.
  if (window.__loginEmAndamento || window.__restoringSession) {
    console.log('[onAuthStateChanged] Pulando (login em andamento ou restaurando sessão)');
    return;
  }

  // SEGURANÇA: Se houve login recente (menos de 2 segundos), pular para evitar race condition
  const lastLoginTime = sessionStorage.getItem('__lastLoginTime');
  if (lastLoginTime && Date.now() - parseInt(lastLoginTime) < 2000) {
    console.log('[onAuthStateChanged] Pulando (login recente detectado)');
    return;
  }

  // Verificação inicial: se há usuário no Firebase mas sessionStorage vazio,
  // fazer logout para forçar login limpo (evita conflito/oscilação)
  if (!__authCheckDone) {
    __authCheckDone = true;
    if (user) {
      const hasValidSession = sessionStorage.getItem('userEmail') &&
                             sessionStorage.getItem('userRole');
      if (!hasValidSession) {
        try { auth.signOut(); } catch(e) {}
        return;
      }
    }
  }

  if (user) {
    window.__restoringSession = true;
    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      let udata;
      if (userDoc.exists) {
        udata = userDoc.data();
      } else {
        // Criar perfil automaticamente como colaborador
        udata = { uid: user.uid, nome: user.email.split('@')[0], email: user.email, role: 'colaborador', unidade: 'meta', criadoEm: new Date().toISOString(), criadoPor: 'auto' };
        await db.collection('users').doc(user.uid).set(udata);
      }
      const preferredRestore = String(sessionStorage.getItem('imexPreferredRole') || '').toLowerCase().trim();
      role = (preferredRestore || udata.role || 'colaborador').toLowerCase();
      if (!PLBL[role]) role = 'colaborador';
      if (role === 'rh-colaborador') { _roleReal = 'rh-colaborador'; role = 'colaborador'; }
      // Prioriza o _roleReal calculado no login (a partir do cadastro real em
      // grh_colabs) sobre o campo `role` salvo em `users`, que pode estar
      // desatualizado de uma sessão de teste anterior e causar inconsistência
      // entre o que aparece na tela e o papel realmente escolhido no login.
      const roleRealRestore = String(sessionStorage.getItem('imexRoleReal') || '').toLowerCase().trim();
      _roleReal = roleRealRestore || _roleReal || (udata.role || role).toLowerCase();
      // `role`/`_roleReal` são `let` no topo do arquivo — isso NÃO cria
      // propriedade em `window`. Várias funções (effectiveRole, menus,
      // guards periódicos) leem `window.role`/`window._roleReal`, então
      // sem isto eles ficam presos a um valor de uma sessão anterior,
      // brigando com quem lê a variável "pura" e causando o menu lateral
      // oscilando entre RH/colaborador a cada recarregamento de página.
      window.role = role;
      window._roleReal = _roleReal;
      // Mesmo problema do `role`/`_roleReal` logo acima: `currentUserData`/
      // `currentUnidade` são `let` no topo do arquivo, então atribuir só a
      // variável "pura" não cria `window.currentUserData` — e é isso que
      // login-auth.js e várias outras funções leem. Sem espelhar em
      // `window.`, um simples F5 estando logado deixava `window.currentUserData`
      // indefinido até alguma outra ação recarregar os dados.
      currentUserData = udata;
      currentUnidade  = udata.unidade || 'meta';
      window.currentUserData = currentUserData;
      window.currentUnidade  = currentUnidade;
      sessionStorage.setItem('userRole',  role);
      sessionStorage.setItem('userName',  udata.nome  || user.email);
      sessionStorage.setItem('userEmail', udata.email || user.email);
      var loginScreenEl = document.getElementById('loginScreen');
      var appShellEl = document.getElementById('appShell');
      if(loginScreenEl) loginScreenEl.style.display = 'none';
      if(appShellEl) appShellEl.style.display = 'flex';
      var pLabelEl = document.getElementById('pLabel');
      if(pLabelEl) pLabelEl.textContent = PLBL[role] || role;
      var pDotEl = document.getElementById('pDot');
      if(pDotEl) pDotEl.textContent = PDOT[role] || '👤';
      buildSidebar();
      const pU2 = document.getElementById('pUnidade');
      if (pU2) pU2.textContent = currentUnidade === 'xpert' ? '⚡ Xpert' : '🏢 Meta';
      // Carregar dados em background
      setTimeout(async () => {
        try { await updateHero(); } catch(e) {}
        try { await renderAll(); } catch(e) {}
        try { enforcePermissions(); } catch(e) {}
        if (role === 'colaborador') try { await updateColResumo(); } catch(e) {}
        window.__restoringSession = false;
      }, 0);
    } catch(e) {
      console.error('Erro ao restaurar sessão:', e);
      window.__restoringSession = false;
      var loginScreenEl = document.getElementById('loginScreen');
      var appShellEl = document.getElementById('appShell');
      if(loginScreenEl) loginScreenEl.style.display = 'flex';
      if(appShellEl) appShellEl.style.display = 'none';
    }
  } else {
    window.__restoringSession = false;
    // Sem usuário autenticado: limpa resquícios de sessão anterior que podem
    // causar conflito/oscilação com o novo login. Isso evita que um "colaborador"
    // logado anteriormente interfira com um novo login de RH na mesma máquina.
    // MAS: se estamos em login em andamento (fallback), não limpar — o fallback
    // já definiu os dados corretos e está transitando para app
    if (window.__loginEmAndamento) {
      console.log('[onAuthStateChanged] Pulando limpeza (login em andamento)');
      return;
    }
    try { localStorage.removeItem('usuarioLogado'); } catch(e) {}
    try { sessionStorage.removeItem('userRole'); } catch(e) {}
    try { sessionStorage.removeItem('userName'); } catch(e) {}
    try { sessionStorage.removeItem('userEmail'); } catch(e) {}
    try { sessionStorage.removeItem('userDocId'); } catch(e) {}
    try { sessionStorage.removeItem('userPerfis'); } catch(e) {}
    try { sessionStorage.removeItem('imexPreferredRole'); } catch(e) {}
    try { sessionStorage.removeItem('imexRoleReal'); } catch(e) {}
    var loginScreenEl = document.getElementById('loginScreen');
    var appShellEl = document.getElementById('appShell');
    if(loginScreenEl) loginScreenEl.style.display = 'flex';
    if(appShellEl) appShellEl.style.display = 'none';
  }
});

// ══════════════════════════════════════════════════════════════
// GESTÃO DE RH — Módulo completo
// Coleções Firestore: grh_colabs | grh_rem | grh_mov | grh_desl
// ══════════════════════════════════════════════════════════════


// Base completa de colaboradores gravada no próprio arquivo
const GRH_COLABS_ARQUIVO = [
      {nome:'ABIMAEL DA CRUZ MENDES',matricula:'--',email:'abimael.mendes@imex.com.br',clt:'Não',nascimento:'1997-05-13',admissao:'2024-07-08',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'ABRANH AM JOÃO RESQUE VELOSO NETO',matricula:'231',email:'neto.veloso@imex.com.br',clt:'Sim',nascimento:'1993-09-22',admissao:'2023-11-27',funcao:'Analista de suporte',setor:'Suporte',salario:2985.21,status:'Ativo'},
      {nome:'ADAN LUCAS PEREIRA DE OLIVEIRA',matricula:'194',email:'adan.oliveira@imex.com.br',clt:'Sim',nascimento:'1992-10-18',admissao:'2021-08-22',funcao:'Programador',setor:'Prog. PDV',salario:3980.02,status:'Ativo'},
      {nome:'ALINE DE LIMA MAZZUCATTO',matricula:'203',email:'aline.mazzucatto@imex.com.br',clt:'Sim',nascimento:'1990-08-17',admissao:'2021-11-25',funcao:'Analista de RH',setor:'Recursos Humanos',salario:2582.63,status:'Ativo'},
      {nome:'BRUNO CESAR CASADO VILA VERDE',matricula:'--',email:'bruno.casado@imex.com.br',clt:'Não',nascimento:'1982-12-14',admissao:'2025-10-01',funcao:'Executivo de canais',setor:'Comercial',salario:null,status:'Ativo'},
      {nome:'BRUNO DE OLIVEIRA',matricula:'231',email:'bruno.oliveira@imex.com.br',clt:'Sim',nascimento:'1988-09-18',admissao:'2016-08-17',funcao:'Programador',setor:'Prog. Financeiro',salario:4266.19,status:'Ativo'},
      {nome:'BRUNO DE PAULA SILVA',matricula:'194',email:'bruno.silva@imex.com.br',clt:'Sim',nascimento:'1996-10-31',admissao:'2024-04-26',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'BRUNO FRIEDRICH RAQUEL',matricula:'203',email:'bruno.friedrich@imex.com.br',clt:'Sim',nascimento:'2004-09-22',admissao:'2024-07-01',funcao:'Programador',setor:'Prog. PDV',salario:4264.95,status:'Ativo'},
      {nome:'BRUNO ROSA DE OLIVEIRA',matricula:'222',email:'bruno.rosa@imex.com.br',clt:'Sim',nascimento:'1997-09-15',admissao:'2023-08-22',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'CAMILA ESTEFANI BORGES',matricula:'--',email:'camila.borges@imex.com.br',clt:'Não',nascimento:'1992-06-06',admissao:'2025-08-29',funcao:'Executivo de canais',setor:'Comercial',salario:null,status:'Ativo'},
      {nome:'DANIEL BOMFIM',matricula:'--',email:'daniel.sgarbi@imex.com.br',clt:'Não',nascimento:'2003-12-06',admissao:'2025-07-01',funcao:'Programador',setor:'Prog. PDV',salario:1300,status:'Ativo'},
      {nome:'DAVID DA SILVA LIMA',matricula:'239',email:'david.lima@imex.com.br',clt:'Sim',nascimento:'2002-05-26',admissao:'2024-10-22',funcao:'Trainee de suporte',setor:'Suporte',salario:2303.02,status:'Ativo'},
      {nome:'DIEGO FABIANO DE SOUSA',matricula:'230',email:'diego.sousa@imex.com.br',clt:'Sim',nascimento:'1998-05-14',admissao:'2024-02-22',funcao:'Analista Sucesso do cliente',setor:'Sucesso do Cliente',salario:3253.87,status:'Ativo'},
      {nome:'DIOGO MAURICIO FONTOLAN',matricula:'46',email:'diogo@imex.com.br',clt:'Sim',nascimento:'1983-09-12',admissao:'2011-02-17',funcao:'Product Owner',setor:'Product Owner',salario:4466.92,status:'Ativo'},
      {nome:'DORALICE AP. DOS SANTOS BORGES',matricula:'229',email:'doralice.borges@imex.com.br',clt:'Sim',nascimento:'1982-01-17',admissao:'2024-01-16',funcao:'Líder de suporte',setor:'Suporte',salario:3867.25,status:'Ativo'},
      {nome:'EDSON NAKAMURA',matricula:'10',email:'edson.nakamura@imex.com',clt:'Sim',nascimento:'1970-09-23',admissao:'2007-06-05',funcao:'Assistente administrativo',setor:'Administrativo',salario:3240.93,status:'Ativo'},
      {nome:'EDUARDO RIPKE FAHR',matricula:'--',email:'eduardo.rike@imex.com.br',clt:'Não',nascimento:'1995-08-24',admissao:'2022-04-07',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'EVERSON ADELMO BRITO DE MARINHO',matricula:'240',email:'everson.adelmo@imex.com.br',clt:'Sim',nascimento:'2001-11-22',admissao:'2025-06-20',funcao:'Analista de suporte',setor:'Suporte',salario:2302.82,status:'Ativo'},
      {nome:'EVERSON DA SILVA SANTANA',matricula:'137',email:'everson.santana@imex.com.br',clt:'Sim',nascimento:'1982-03-11',admissao:'2018-04-24',funcao:'Líder de suporte',setor:'Suporte',salario:3867.25,status:'Ativo'},
      {nome:'FABIO HENRIQUE CARDOSO NOBRE',matricula:'193',email:'fabio.nobre@imex.com.br',clt:'Sim',nascimento:'1992-01-18',admissao:'2021-06-07',funcao:'Programador',setor:'Prog. Fiscal',salario:3980.02,status:'Ativo'},
      {nome:'FABIO VENDRAMIN GUIMARAES ROSINI',matricula:'21',email:'fabio@imex.com.br',clt:'Sim',nascimento:'1980-09-24',admissao:'2008-06-09',funcao:'Gerente de Projetos',setor:'Prog. PDV',salario:9465,status:'Ativo'},
      {nome:'FERNANDA CHER',matricula:'162',email:'fernanda.cher@imex.com.br',clt:'Sim',nascimento:'1973-01-05',admissao:'2019-09-10',funcao:'Assistente administrativo',setor:'Administrativo',salario:2459.5,status:'Ativo'},
      {nome:'GABRIEL DE CASTRO MIRANDA LOPES',matricula:'103',email:'gabriel.castro@imex.com.br',clt:'Sim',nascimento:'1988-01-18',admissao:'2015-02-18',funcao:'Programador',setor:'Prog. PDV',salario:6246.14,status:'Ativo'},
      {nome:'GABRIEL SEIJI GONCALVES BANDO',matricula:'',email:'gabriel.seiji@imex.com.br',clt:'Não',nascimento:'2001-01-11',admissao:'2019-11-21',funcao:'Product Owner',setor:'Product Owner',salario:null,status:'Ativo'},
      {nome:'GILMAR SERGIO BIANCHI JUNIOR',matricula:'152',email:'gilmar.bianchi@imex.com.br',clt:'Sim',nascimento:'1988-02-18',admissao:'2020-04-01',funcao:'Programador',setor:'Prog. PDV',salario:4008.84,status:'Ativo'},
      {nome:'GUILHERME DE ASSIS VILAS BOAS',matricula:'223',email:'guilherme.assis@imex.com.br',clt:'Sim',nascimento:'2002-07-31',admissao:'2023-08-22',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'GUSTAVO BEGTSOM RIBEIRO',matricula:'220',email:'gustavo.begtsom@imex.com.br',clt:'Sim',nascimento:'2004-04-12',admissao:'2023-03-01',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'GUSTAVO PINHEIRO DA SILVA',matricula:'111',email:'gustavo.pinheiro@imex.com.br',clt:'Sim',nascimento:'1994-07-25',admissao:'2015-07-21',funcao:'Líder de suporte N3',setor:'Suporte N3',salario:4266.19,status:'Ativo'},
      {nome:'HEITOR GONÇALVES',matricula:'',email:'',clt:'Não',nascimento:'',admissao:'',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'IVAN PIONELLI JUNIOR',matricula:'89',email:'ivan.pionelli@imex.com.br',clt:'Sim',nascimento:'1993-05-25',admissao:'2013-11-26',funcao:'Programador',setor:'Prog. Fiscal',salario:3199.65,status:'Ativo'},
      {nome:'JULIO CESAR ANDREATA JUNIOR',matricula:'70',email:'julio.andreata@imex.com.br',clt:'Sim',nascimento:'1991-10-24',admissao:'2012-07-18',funcao:'Programador',setor:'Prog. Fiscal',salario:4266.19,status:'Ativo'},
      {nome:'LEANDRO ANDRADE DOS SANTOS',matricula:'--',email:'leandro.santos@imex.com.br',clt:'Não',nascimento:'1985-11-09',admissao:'2025-07-16',funcao:'Programador',setor:'Prog. Fiscal',salario:null,status:'Ativo'},
      {nome:'LEONARDO GOMES',matricula:'--',email:'leonardo.gomes@imex.com.br',clt:'Não',nascimento:'1991-02-23',admissao:'2023-08-29',funcao:'Líder de suporte',setor:'Suporte',salario:null,status:'Ativo'},
      {nome:'LEONARDO SCHAURICH DE ARAÚJO',matricula:'237',email:'leonardo.araujo@imex.com.br',clt:'Sim',nascimento:'1986-08-17',admissao:'2024-07-11',funcao:'Analista de suporte',setor:'Suporte',salario:3197.04,status:'Ativo'},
      {nome:'LUCAS DE MATTOS MARQUINI',matricula:'135',email:'lucas.marquini@imex.com.br',clt:'Sim',nascimento:'1992-10-16',admissao:'2018-04-05',funcao:'Analista de suporte',setor:'Suporte N3',salario:3867.25,status:'Ativo'},
      {nome:'LUIS FERNANDO ALMEIDA SANCHES',matricula:'--',email:'luis.sanches@imex.com.br',clt:'Não',nascimento:'1993-11-07',admissao:'2013-06-13',funcao:'Gerente de suporte',setor:'Suporte',salario:null,status:'Ativo'},
      {nome:'LUIZ FERNANDO RODRIGUES PEREIRA',matricula:'154',email:'luiz.rodrigues@imex.com.br',clt:'Sim',nascimento:'1992-10-18',admissao:'2020-05-07',funcao:'Programador',setor:'Prog. Fiscal',salario:4266.19,status:'Ativo'},
      {nome:'MARCELA APARECIDA MENDES',matricula:'85',email:'marcela.mendes@imex.com.br',clt:'Sim',nascimento:'1993-01-09',admissao:'2013-06-06',funcao:'Programador',setor:'ADM',salario:4847.65,status:'Ativo'},
      {nome:'MATEUS BAHIS VIEIRA',matricula:'5',email:'mateus@imex.com.br',clt:'Sim',nascimento:'1978-07-10',admissao:'2005-10-06',funcao:'Gerente de projetos',setor:'Prog. Financeiro',salario:12619.99,status:'Ativo'},
      {nome:'MATHEUS HENRIQUE MARQUES FREITAS',matricula:'175',email:'henrique.freitas@imex.com.br',clt:'Sim',nascimento:'1995-09-30',admissao:'2020-01-24',funcao:'Analista especialista de suporte',setor:'Suporte N3',salario:4266.19,status:'Ativo'},
      {nome:'MAYKON ALBERTO ELIAS',matricula:'--',email:'maykon.alberto@imex.com.br',clt:'Não',nascimento:'1983-08-22',admissao:'2025-03-24',funcao:'Programador',setor:'Prog. Fiscal',salario:null,status:'Ativo'},
      {nome:'MORVAN DE JESUS JAIR',matricula:'--',email:'morvan.jesus@imex.com.br',clt:'Não',nascimento:'1979-04-18',admissao:'2023-03-30',funcao:'Analista de suporte',setor:'Grandes Contas',salario:null,status:'Ativo'},
      {nome:'PAULO ANDRE LOT',matricula:'57',email:'paulo.lot@imex.com.br',clt:'Sim',nascimento:'1985-01-13',admissao:'2011-10-15',funcao:'Gerente de projetos',setor:'Prog. Fiscal',salario:8018.74,status:'Ativo'},
      {nome:'PAULO HENRIQUE DA CRUZ RIECHEL',matricula:'--',email:'paulo.riechel@imex.com.br',clt:'Não',nascimento:'1985-06-07',admissao:'2023-12-20',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'RAFAEL BRAYNER OLIVEIRA DE CERQUEIRA',matricula:'202',email:'rafael.brayner@imex.com.br',clt:'Sim',nascimento:'1988-02-18',admissao:'2021-11-25',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'RAFAEL FRANCOVIG CAVICCHIOLLI',matricula:'109',email:'rafael.cavicchiolli@imex.com.br',clt:'Sim',nascimento:'1993-03-08',admissao:'2015-06-26',funcao:'Programador',setor:'Prog. Financeiro',salario:4266.19,status:'Ativo'},
      {nome:'RAFAEL HONORIO RAQUEL JUNIOR',matricula:'--',email:'rafael@imex.com.br',clt:'Não',nascimento:'1995-01-13',admissao:'2014-10-08',funcao:'Gerente Comercial',setor:'Comercial',salario:null,status:'Ativo'},
      {nome:'RAFAELLA MARRA KERSUL',matricula:'182',email:'rafaella@imex.com.br',clt:'Sim',nascimento:'1992-03-12',admissao:'2020-11-01',funcao:'Coordenadora de RH',setor:'Recursos Humanos',salario:6387.72,status:'Ativo'},
      {nome:'RAMON OLIVEIRA',matricula:'--',email:'',clt:'Não',nascimento:'',admissao:'',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'RENAN MALAGUTTI',matricula:'204',email:'renan.malagutti@imex.com.br',clt:'Sim',nascimento:'1992-08-03',admissao:'2021-12-13',funcao:'Analista de suporte',setor:'Suporte',salario:3979.97,status:'Ativo'},
      {nome:'RHENAN AZEVEDO CANO',matricula:'',email:'rhenan.azevedo@imex.com.br',clt:'Não',nascimento:'1988-08-11',admissao:'2024-05-01',funcao:'Gerente de suporte',setor:'Suporte/Grandes Contas',salario:null,status:'Ativo'},
      {nome:'RHUAN VERLY DA FONSECA',matricula:'246',email:'rhuan.verli@imex.com.br',clt:'Sim',nascimento:'1994-05-31',admissao:'2026-01-01',funcao:'Analista de suporte',setor:'Suporte',salario:2839.81,status:'Ativo'},
      {nome:'RODOLFO CACERAGHI DOS SANTOS',matricula:'184',email:'rodolfo.caceraghi@imex.com.br',clt:'Sim',nascimento:'1986-06-22',admissao:'2020-12-25',funcao:'Programador',setor:'Prog. Fiscal',salario:5169.02,status:'Ativo'},
      {nome:'RODRIGO CAMPOS',matricula:'241',email:'rodrigo.campos@imex.com.br',clt:'Sim',nascimento:'1996-02-04',admissao:'2025-06-26',funcao:'Analista de suporte',setor:'Suporte',salario:2302.82,status:'Ativo'},
      {nome:'ROGÉRIO PAMPLONA BUSTAMANTE',matricula:'219',email:'rogerio.pamplona@imex.com.br',clt:'Sim',nascimento:'1996-05-23',admissao:'2023-03-01',funcao:'Analista de suporte',setor:'Suporte N3',salario:3867.25,status:'Ativo'},
      {nome:'RUBENS JOSÉ FACCO FILHO',matricula:'--',email:'rubens.facco@imex.com.br',clt:'Não',nascimento:'1994-07-28',admissao:'2025-02-05',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'SEVERINO OLÍMPIO FELIX NETO',matricula:'--',email:'severino.neto@imex.com.br',clt:'Não',nascimento:'1988-08-07',admissao:'2021-05-23',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'SIRYUS CANUTO SAMBULSKI',matricula:'176',email:'siryus.canuto@imex.com.br',clt:'Sim',nascimento:'1993-10-30',admissao:'2020-08-04',funcao:'Programador',setor:'DBA',salario:3980.02,status:'Ativo'},
      {nome:'VAGNER LUIS RODRIGUES',matricula:'--',email:'vagner.luis@imex.com.br',clt:'Não',nascimento:'1995-12-30',admissao:'2026-01-21',funcao:'Programador',setor:'Prog. Financeiro',salario:null,status:'Ativo'},
      {nome:'VANDILSON GUELLERI',matricula:'207',email:'vandilson.guellleri@imex.com.br',clt:'Sim',nascimento:'1989-09-27',admissao:'2022-01-13',funcao:'Analista de suporte',setor:'Suporte N3',salario:3867.25,status:'Ativo'},
      {nome:'VARLEY DA SILVA RIBEIRO',matricula:'244',email:'varley.ribeiro@imex.com.br',clt:'Sim',nascimento:'1992-01-17',admissao:'2025-11-05',funcao:'Analista de suporte',setor:'Suporte',salario:2585,status:'Ativo'},
      {nome:'VINÍCIUS MARTINS DE CARVALHO',matricula:'235',email:'vinicius.martins@imex.com.br',clt:'Sim',nascimento:'1994-06-18',admissao:'2024-06-26',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'VINNIE TAVARES DE CARVALHO',matricula:'133',email:'vinnie.carvalho@imex.com.br',clt:'Sim',nascimento:'1989-07-15',admissao:'2018-03-08',funcao:'Líder de suporte',setor:'Suporte',salario:3522.43,status:'Ativo'},
      {nome:'WALLYSSON MATEUS BARBOSA',matricula:'243',email:'wallysson.mateus@imex.com.br',clt:'Sim',nascimento:'1997-01-21',admissao:'2025-10-15',funcao:'Analista de suporte',setor:'Suporte',salario:2302.82,status:'Ativo'},
      {nome:'WILLIAN SANTOS',matricula:'--',email:'william.santos@imex.com.br',clt:'Não',nascimento:'2001-04-23',admissao:'2025-10-08',funcao:'Programador',setor:'Prog. Financeiro',salario:null,status:'Ativo'},
      {nome:'WILLIAM NASCIMENTO DA SILVA',matricula:'216',email:'william.nascimento@imex.com.br',clt:'Sim',nascimento:'1991-09-14',admissao:'2023-01-16',funcao:'Analista de suporte',setor:'Suporte N3',salario:2717.47,status:'Ativo'},
      {nome:'WILLIAM DIAS',matricula:'--',email:'william.dias@imex.com.br',clt:'Não',nascimento:'1977-09-11',admissao:'2020-04-01',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
    ];

// ── cache em memória ──
let _grhColabs  = null;
let _grhRem     = null;
let _grhMov     = null;
let _grhDesl    = null;
let _grhTabAtiva = 'colaboradores';

// ── helpers de data ──
function grhParseExcelDate(v) {
  if (!v || v === '--' || v === '') return '';
  const n = parseFloat(v);
  if (isNaN(n)) return v;
  // Serial Excel → JS Date (origin 25 Dec 1899)
  const d = new Date(Math.round((n - 25569) * 86400 * 1000));
  return d.toISOString().split('T')[0];
}
function grhFmt(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function grhTempoEmpresa(admissaoIso) {
  if (!admissaoIso) return '—';
  const adm = new Date(admissaoIso + 'T00:00:00');
  const hoje = new Date();
  let anos = hoje.getFullYear() - adm.getFullYear();
  let meses = hoje.getMonth() - adm.getMonth();
  if (meses < 0) { anos--; meses += 12; }
  if (anos > 0) return `${anos}a ${meses}m`;
  return `${meses} mês(es)`;
}
function grhBRL(v) {
  const n = parseFloat(v);
  if (isNaN(n)) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function grhFecharModal(id) {
  document.getElementById(id).style.display = 'none';
}

// ── Firestore getters ──
async function grhGetColabs(force = false) {
  if (_grhColabs && !force) return _grhColabs;

  let dadosBanco = [];
  try {
    const snap = await db.collection(col('grh_colabs')).get();
    dadosBanco = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  } catch(e) {
    console.warn('Firebase não retornou colaboradores. Usando base do arquivo.', e);
  }

  if (!dadosBanco.length || dadosBanco.length < 10) {
    _grhColabs = (typeof GRH_COLABS_ARQUIVO !== 'undefined' && GRH_COLABS_ARQUIVO.length)
      ? GRH_COLABS_ARQUIVO.map((c, i) => ({ _id: c._id || `base-${i}`, ...c }))
      : [];
  } else {
    _grhColabs = dadosBanco;
  }

  _grhColabs.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  return _grhColabs;
}
// Expõe funções como globais para acesso de outros módulos
// Protegidas contra sobrescrita para evitar referências circulares e recursão infinita
// Permitir sobrescrita por patches
window.grhGetColabs = grhGetColabs;
window.grhGetRem = grhGetRem;
window.grhGetMov = grhGetMov;
window.grhGetDesl = grhGetDesl;
async function grhGetRem(force = false) {
  if (_grhRem && !force) return _grhRem;
  try {
    const snap = await db.collection(col('grh_rem')).get();
    _grhRem = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  } catch(e) {
    console.error('Erro ao carregar remuneração:', e);
    _grhRem = [];
  }
  return _grhRem;
}
async function grhGetMov(force = false) {
  if (_grhMov && !force) return _grhMov;
  try {
    const snap = await db.collection(col('grh_mov')).get();
    _grhMov = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  } catch(e) {
    console.error('Erro ao carregar movimentações:', e);
    _grhMov = [];
  }
  return _grhMov;
}
async function grhGetDesl(force = false) {
  if (_grhDesl && !force) return _grhDesl;
  try {
    const snap = await db.collection(col('grh_desl')).get();
    _grhDesl = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  } catch(e) {
    _grhDesl = [
      { _id:'d1', nome:'Carlos Mendes',    dataAdmissao:'2021-03-10', dataDesligamento:'2024-02-28', motivo:'Pedido de demissão',          setor:'Comercial',   contrato:'CLT', tempoEmpresa:'2 anos 11 meses', rescisao:8400,   multaFgts:1260,  observacao:'Saiu para empreender' },
      { _id:'d2', nome:'Fernanda Lopes',   dataAdmissao:'2020-07-01', dataDesligamento:'2024-05-15', motivo:'Demissão sem justa causa',     setor:'Financeiro',  contrato:'CLT', tempoEmpresa:'3 anos 10 meses', rescisao:12600,  multaFgts:1890,  observacao:'Reestruturação do setor' },
      { _id:'d3', nome:'Ricardo Souza',    dataAdmissao:'2022-01-15', dataDesligamento:'2024-08-01', motivo:'Término de contrato',          setor:'TI',          contrato:'PJ',  tempoEmpresa:'2 anos 6 meses',  rescisao:0,      multaFgts:0,     observacao:'Projeto encerrado' },
      { _id:'d4', nome:'Patrícia Alves',   dataAdmissao:'2019-05-20', dataDesligamento:'2023-11-30', motivo:'Aposentadoria',                setor:'RH',          contrato:'CLT', tempoEmpresa:'4 anos 6 meses',  rescisao:21000,  multaFgts:3150,  observacao:'' },
      { _id:'d5', nome:'Marcos Oliveira',  dataAdmissao:'2021-09-01', dataDesligamento:'2024-01-10', motivo:'Demissão por justa causa',     setor:'Suporte',     contrato:'CLT', tempoEmpresa:'2 anos 4 meses',  rescisao:0,      multaFgts:0,     observacao:'Falta grave' },
    ];
  }
  return _grhDesl;
}

// ── Exposições globais consolidadas ──
// Funções centralizadas que devem ser usadas por TODO o sistema
window.getEmail = getEmail;  // Consolidada de 3 implementações anteriores
window.isRH = isRH;          // Consolidada de 3 implementações diferentes
window.isGestor = isGestor;  // Consolidada

// Funções de remuneração
window.grhRenderRemuneracao = grhRenderRemuneracao;
window.grhMontarBaseRemuneracao = grhMontarBaseRemuneracao;
window.grhSalvarRemuneracao = grhSalvarRemuneracao;
window.grhExcluirRem = grhExcluirRem;
window.grhAbrirModalRemuneracao = grhAbrirModalRemuneracao;

// ── Entrada principal ──
async function gestaoRhCarregar() {
  // Importar planilha na primeira vez se o banco estiver vazio
  await grhImportarSeVazio();
  await grhAtualizarHero();
  await grhRenderColabs();
  await grhRenderRemuneracao();
  await grhRenderMovimentacoes();
  await grhRenderDesligamentos();
  await grhRenderEnderecos();
  await grhRenderAdmissao();
}

// ── Importação automática da planilha na primeira vez ──
async function grhImportarSeVazio() {
  try {
    const snap = await db.collection(col('grh_colabs')).limit(1).get();
    if (!snap.empty) return; // já tem dados

    // Dados extraídos da planilha Gestão_RH_Atualizada
    const colaboradores = [
      {nome:'ABIMAEL DA CRUZ MENDES',matricula:'--',email:'abimael.mendes@imex.com.br',clt:'Não',nascimento:'1997-05-13',admissao:'2024-07-08',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'ABRANH AM JOÃO RESQUE VELOSO NETO',matricula:'231',email:'neto.veloso@imex.com.br',clt:'Sim',nascimento:'1993-09-22',admissao:'2023-11-27',funcao:'Analista de suporte',setor:'Suporte',salario:2985.21,status:'Ativo'},
      {nome:'ADAN LUCAS PEREIRA DE OLIVEIRA',matricula:'194',email:'adan.oliveira@imex.com.br',clt:'Sim',nascimento:'1992-10-18',admissao:'2021-08-22',funcao:'Programador',setor:'Prog. PDV',salario:3980.02,status:'Ativo'},
      {nome:'ALINE DE LIMA MAZZUCATTO',matricula:'203',email:'aline.mazzucatto@imex.com.br',clt:'Sim',nascimento:'1990-08-17',admissao:'2021-11-25',funcao:'Analista de RH',setor:'Recursos Humanos',salario:2582.63,status:'Ativo'},
      {nome:'BRUNO CESAR CASADO VILA VERDE',matricula:'--',email:'bruno.casado@imex.com.br',clt:'Não',nascimento:'1982-12-14',admissao:'2025-10-01',funcao:'Executivo de canais',setor:'Comercial',salario:null,status:'Ativo'},
      {nome:'BRUNO DE OLIVEIRA',matricula:'231',email:'bruno.oliveira@imex.com.br',clt:'Sim',nascimento:'1988-09-18',admissao:'2016-08-17',funcao:'Programador',setor:'Prog. Financeiro',salario:4266.19,status:'Ativo'},
      {nome:'BRUNO DE PAULA SILVA',matricula:'194',email:'bruno.silva@imex.com.br',clt:'Sim',nascimento:'1996-10-31',admissao:'2024-04-26',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'BRUNO FRIEDRICH RAQUEL',matricula:'203',email:'bruno.friedrich@imex.com.br',clt:'Sim',nascimento:'2004-09-22',admissao:'2024-07-01',funcao:'Programador',setor:'Prog. PDV',salario:4264.95,status:'Ativo'},
      {nome:'BRUNO ROSA DE OLIVEIRA',matricula:'222',email:'bruno.rosa@imex.com.br',clt:'Sim',nascimento:'1997-09-15',admissao:'2023-08-22',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'CAMILA ESTEFANI BORGES',matricula:'--',email:'camila.borges@imex.com.br',clt:'Não',nascimento:'1992-06-06',admissao:'2025-08-29',funcao:'Executivo de canais',setor:'Comercial',salario:null,status:'Ativo'},
      {nome:'DANIEL BOMFIM',matricula:'--',email:'daniel.sgarbi@imex.com.br',clt:'Não',nascimento:'2003-12-06',admissao:'2025-07-01',funcao:'Programador',setor:'Prog. PDV',salario:1300,status:'Ativo'},
      {nome:'DAVID DA SILVA LIMA',matricula:'239',email:'david.lima@imex.com.br',clt:'Sim',nascimento:'2002-05-26',admissao:'2024-10-22',funcao:'Trainee de suporte',setor:'Suporte',salario:2303.02,status:'Ativo'},
      {nome:'DIEGO FABIANO DE SOUSA',matricula:'230',email:'diego.sousa@imex.com.br',clt:'Sim',nascimento:'1998-05-14',admissao:'2024-02-22',funcao:'Analista Sucesso do cliente',setor:'Sucesso do Cliente',salario:3253.87,status:'Ativo'},
      {nome:'DIOGO MAURICIO FONTOLAN',matricula:'46',email:'diogo@imex.com.br',clt:'Sim',nascimento:'1983-09-12',admissao:'2011-02-17',funcao:'Product Owner',setor:'Product Owner',salario:4466.92,status:'Ativo'},
      {nome:'DORALICE AP. DOS SANTOS BORGES',matricula:'229',email:'doralice.borges@imex.com.br',clt:'Sim',nascimento:'1982-01-17',admissao:'2024-01-16',funcao:'Líder de suporte',setor:'Suporte',salario:3867.25,status:'Ativo'},
      {nome:'EDSON NAKAMURA',matricula:'10',email:'edson.nakamura@imex.com',clt:'Sim',nascimento:'1970-09-23',admissao:'2007-06-05',funcao:'Assistente administrativo',setor:'Administrativo',salario:3240.93,status:'Ativo'},
      {nome:'EDUARDO RIPKE FAHR',matricula:'--',email:'eduardo.rike@imex.com.br',clt:'Não',nascimento:'1995-08-24',admissao:'2022-04-07',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'EVERSON ADELMO BRITO DE MARINHO',matricula:'240',email:'everson.adelmo@imex.com.br',clt:'Sim',nascimento:'2001-11-22',admissao:'2025-06-20',funcao:'Analista de suporte',setor:'Suporte',salario:2302.82,status:'Ativo'},
      {nome:'EVERSON DA SILVA SANTANA',matricula:'137',email:'everson.santana@imex.com.br',clt:'Sim',nascimento:'1982-03-11',admissao:'2018-04-24',funcao:'Líder de suporte',setor:'Suporte',salario:3867.25,status:'Ativo'},
      {nome:'FABIO HENRIQUE CARDOSO NOBRE',matricula:'193',email:'fabio.nobre@imex.com.br',clt:'Sim',nascimento:'1992-01-18',admissao:'2021-06-07',funcao:'Programador',setor:'Prog. Fiscal',salario:3980.02,status:'Ativo'},
      {nome:'FABIO VENDRAMIN GUIMARAES ROSINI',matricula:'21',email:'fabio@imex.com.br',clt:'Sim',nascimento:'1980-09-24',admissao:'2008-06-09',funcao:'Gerente de Projetos',setor:'Prog. PDV',salario:9465,status:'Ativo'},
      {nome:'FERNANDA CHER',matricula:'162',email:'fernanda.cher@imex.com.br',clt:'Sim',nascimento:'1973-01-05',admissao:'2019-09-10',funcao:'Assistente administrativo',setor:'Administrativo',salario:2459.5,status:'Ativo'},
      {nome:'GABRIEL DE CASTRO MIRANDA LOPES',matricula:'103',email:'gabriel.castro@imex.com.br',clt:'Sim',nascimento:'1988-01-18',admissao:'2015-02-18',funcao:'Programador',setor:'Prog. PDV',salario:6246.14,status:'Ativo'},
      {nome:'GABRIEL SEIJI GONCALVES BANDO',matricula:'',email:'gabriel.seiji@imex.com.br',clt:'Não',nascimento:'2001-01-11',admissao:'2019-11-21',funcao:'Product Owner',setor:'Product Owner',salario:null,status:'Ativo'},
      {nome:'GILMAR SERGIO BIANCHI JUNIOR',matricula:'152',email:'gilmar.bianchi@imex.com.br',clt:'Sim',nascimento:'1988-02-18',admissao:'2020-04-01',funcao:'Programador',setor:'Prog. PDV',salario:4008.84,status:'Ativo'},
      {nome:'GUILHERME DE ASSIS VILAS BOAS',matricula:'223',email:'guilherme.assis@imex.com.br',clt:'Sim',nascimento:'2002-07-31',admissao:'2023-08-22',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'GUSTAVO BEGTSOM RIBEIRO',matricula:'220',email:'gustavo.begtsom@imex.com.br',clt:'Sim',nascimento:'2004-04-12',admissao:'2023-03-01',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'GUSTAVO PINHEIRO DA SILVA',matricula:'111',email:'gustavo.pinheiro@imex.com.br',clt:'Sim',nascimento:'1994-07-25',admissao:'2015-07-21',funcao:'Líder de suporte N3',setor:'Suporte N3',salario:4266.19,status:'Ativo'},
      {nome:'HEITOR GONÇALVES',matricula:'',email:'',clt:'Não',nascimento:'',admissao:'',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'IVAN PIONELLI JUNIOR',matricula:'89',email:'ivan.pionelli@imex.com.br',clt:'Sim',nascimento:'1993-05-25',admissao:'2013-11-26',funcao:'Programador',setor:'Prog. Fiscal',salario:3199.65,status:'Ativo'},
      {nome:'JULIO CESAR ANDREATA JUNIOR',matricula:'70',email:'julio.andreata@imex.com.br',clt:'Sim',nascimento:'1991-10-24',admissao:'2012-07-18',funcao:'Programador',setor:'Prog. Fiscal',salario:4266.19,status:'Ativo'},
      {nome:'LEANDRO ANDRADE DOS SANTOS',matricula:'--',email:'leandro.santos@imex.com.br',clt:'Não',nascimento:'1985-11-09',admissao:'2025-07-16',funcao:'Programador',setor:'Prog. Fiscal',salario:null,status:'Ativo'},
      {nome:'LEONARDO GOMES',matricula:'--',email:'leonardo.gomes@imex.com.br',clt:'Não',nascimento:'1991-02-23',admissao:'2023-08-29',funcao:'Líder de suporte',setor:'Suporte',salario:null,status:'Ativo'},
      {nome:'LEONARDO SCHAURICH DE ARAÚJO',matricula:'237',email:'leonardo.araujo@imex.com.br',clt:'Sim',nascimento:'1986-08-17',admissao:'2024-07-11',funcao:'Analista de suporte',setor:'Suporte',salario:3197.04,status:'Ativo'},
      {nome:'LUCAS DE MATTOS MARQUINI',matricula:'135',email:'lucas.marquini@imex.com.br',clt:'Sim',nascimento:'1992-10-16',admissao:'2018-04-05',funcao:'Analista de suporte',setor:'Suporte N3',salario:3867.25,status:'Ativo'},
      {nome:'LUIS FERNANDO ALMEIDA SANCHES',matricula:'--',email:'luis.sanches@imex.com.br',clt:'Não',nascimento:'1993-11-07',admissao:'2013-06-13',funcao:'Gerente de suporte',setor:'Suporte',salario:null,status:'Ativo'},
      {nome:'LUIZ FERNANDO RODRIGUES PEREIRA',matricula:'154',email:'luiz.rodrigues@imex.com.br',clt:'Sim',nascimento:'1992-10-18',admissao:'2020-05-07',funcao:'Programador',setor:'Prog. Fiscal',salario:4266.19,status:'Ativo'},
      {nome:'MARCELA APARECIDA MENDES',matricula:'85',email:'marcela.mendes@imex.com.br',clt:'Sim',nascimento:'1993-01-09',admissao:'2013-06-06',funcao:'Programador',setor:'ADM',salario:4847.65,status:'Ativo'},
      {nome:'MATEUS BAHIS VIEIRA',matricula:'5',email:'mateus@imex.com.br',clt:'Sim',nascimento:'1978-07-10',admissao:'2005-10-06',funcao:'Gerente de projetos',setor:'Prog. Financeiro',salario:12619.99,status:'Ativo'},
      {nome:'MATHEUS HENRIQUE MARQUES FREITAS',matricula:'175',email:'henrique.freitas@imex.com.br',clt:'Sim',nascimento:'1995-09-30',admissao:'2020-01-24',funcao:'Analista especialista de suporte',setor:'Suporte N3',salario:4266.19,status:'Ativo'},
      {nome:'MAYKON ALBERTO ELIAS',matricula:'--',email:'maykon.alberto@imex.com.br',clt:'Não',nascimento:'1983-08-22',admissao:'2025-03-24',funcao:'Programador',setor:'Prog. Fiscal',salario:null,status:'Ativo'},
      {nome:'MORVAN DE JESUS JAIR',matricula:'--',email:'morvan.jesus@imex.com.br',clt:'Não',nascimento:'1979-04-18',admissao:'2023-03-30',funcao:'Analista de suporte',setor:'Grandes Contas',salario:null,status:'Ativo'},
      {nome:'PAULO ANDRE LOT',matricula:'57',email:'paulo.lot@imex.com.br',clt:'Sim',nascimento:'1985-01-13',admissao:'2011-10-15',funcao:'Gerente de projetos',setor:'Prog. Fiscal',salario:8018.74,status:'Ativo'},
      {nome:'PAULO HENRIQUE DA CRUZ RIECHEL',matricula:'--',email:'paulo.riechel@imex.com.br',clt:'Não',nascimento:'1985-06-07',admissao:'2023-12-20',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'RAFAEL BRAYNER OLIVEIRA DE CERQUEIRA',matricula:'202',email:'rafael.brayner@imex.com.br',clt:'Sim',nascimento:'1988-02-18',admissao:'2021-11-25',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'RAFAEL FRANCOVIG CAVICCHIOLLI',matricula:'109',email:'rafael.cavicchiolli@imex.com.br',clt:'Sim',nascimento:'1993-03-08',admissao:'2015-06-26',funcao:'Programador',setor:'Prog. Financeiro',salario:4266.19,status:'Ativo'},
      {nome:'RAFAEL HONORIO RAQUEL JUNIOR',matricula:'--',email:'rafael@imex.com.br',clt:'Não',nascimento:'1995-01-13',admissao:'2014-10-08',funcao:'Gerente Comercial',setor:'Comercial',salario:null,status:'Ativo'},
      {nome:'RAFAELLA MARRA KERSUL',matricula:'182',email:'rafaella@imex.com.br',clt:'Sim',nascimento:'1992-03-12',admissao:'2020-11-01',funcao:'Coordenadora de RH',setor:'Recursos Humanos',salario:6387.72,status:'Ativo'},
      {nome:'RAMON OLIVEIRA',matricula:'--',email:'',clt:'Não',nascimento:'',admissao:'',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'RENAN MALAGUTTI',matricula:'204',email:'renan.malagutti@imex.com.br',clt:'Sim',nascimento:'1992-08-03',admissao:'2021-12-13',funcao:'Analista de suporte',setor:'Suporte',salario:3979.97,status:'Ativo'},
      {nome:'RHENAN AZEVEDO CANO',matricula:'',email:'rhenan.azevedo@imex.com.br',clt:'Não',nascimento:'1988-08-11',admissao:'2024-05-01',funcao:'Gerente de suporte',setor:'Suporte/Grandes Contas',salario:null,status:'Ativo'},
      {nome:'RHUAN VERLY DA FONSECA',matricula:'246',email:'rhuan.verli@imex.com.br',clt:'Sim',nascimento:'1994-05-31',admissao:'2026-01-01',funcao:'Analista de suporte',setor:'Suporte',salario:2839.81,status:'Ativo'},
      {nome:'RODOLFO CACERAGHI DOS SANTOS',matricula:'184',email:'rodolfo.caceraghi@imex.com.br',clt:'Sim',nascimento:'1986-06-22',admissao:'2020-12-25',funcao:'Programador',setor:'Prog. Fiscal',salario:5169.02,status:'Ativo'},
      {nome:'RODRIGO CAMPOS',matricula:'241',email:'rodrigo.campos@imex.com.br',clt:'Sim',nascimento:'1996-02-04',admissao:'2025-06-26',funcao:'Analista de suporte',setor:'Suporte',salario:2302.82,status:'Ativo'},
      {nome:'ROGÉRIO PAMPLONA BUSTAMANTE',matricula:'219',email:'rogerio.pamplona@imex.com.br',clt:'Sim',nascimento:'1996-05-23',admissao:'2023-03-01',funcao:'Analista de suporte',setor:'Suporte N3',salario:3867.25,status:'Ativo'},
      {nome:'RUBENS JOSÉ FACCO FILHO',matricula:'--',email:'rubens.facco@imex.com.br',clt:'Não',nascimento:'1994-07-28',admissao:'2025-02-05',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'SEVERINO OLÍMPIO FELIX NETO',matricula:'--',email:'severino.neto@imex.com.br',clt:'Não',nascimento:'1988-08-07',admissao:'2021-05-23',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
      {nome:'SIRYUS CANUTO SAMBULSKI',matricula:'176',email:'siryus.canuto@imex.com.br',clt:'Sim',nascimento:'1993-10-30',admissao:'2020-08-04',funcao:'Programador',setor:'DBA',salario:3980.02,status:'Ativo'},
      {nome:'VAGNER LUIS RODRIGUES',matricula:'--',email:'vagner.luis@imex.com.br',clt:'Não',nascimento:'1995-12-30',admissao:'2026-01-21',funcao:'Programador',setor:'Prog. Financeiro',salario:null,status:'Ativo'},
      {nome:'VANDILSON GUELLERI',matricula:'207',email:'vandilson.guellleri@imex.com.br',clt:'Sim',nascimento:'1989-09-27',admissao:'2022-01-13',funcao:'Analista de suporte',setor:'Suporte N3',salario:3867.25,status:'Ativo'},
      {nome:'VARLEY DA SILVA RIBEIRO',matricula:'244',email:'varley.ribeiro@imex.com.br',clt:'Sim',nascimento:'1992-01-17',admissao:'2025-11-05',funcao:'Analista de suporte',setor:'Suporte',salario:2585,status:'Ativo'},
      {nome:'VINÍCIUS MARTINS DE CARVALHO',matricula:'235',email:'vinicius.martins@imex.com.br',clt:'Sim',nascimento:'1994-06-18',admissao:'2024-06-26',funcao:'Analista de suporte',setor:'Suporte',salario:2717.47,status:'Ativo'},
      {nome:'VINNIE TAVARES DE CARVALHO',matricula:'133',email:'vinnie.carvalho@imex.com.br',clt:'Sim',nascimento:'1989-07-15',admissao:'2018-03-08',funcao:'Líder de suporte',setor:'Suporte',salario:3522.43,status:'Ativo'},
      {nome:'WALLYSSON MATEUS BARBOSA',matricula:'243',email:'wallysson.mateus@imex.com.br',clt:'Sim',nascimento:'1997-01-21',admissao:'2025-10-15',funcao:'Analista de suporte',setor:'Suporte',salario:2302.82,status:'Ativo'},
      {nome:'WILLIAN SANTOS',matricula:'--',email:'william.santos@imex.com.br',clt:'Não',nascimento:'2001-04-23',admissao:'2025-10-08',funcao:'Programador',setor:'Prog. Financeiro',salario:null,status:'Ativo'},
      {nome:'WILLIAM NASCIMENTO DA SILVA',matricula:'216',email:'william.nascimento@imex.com.br',clt:'Sim',nascimento:'1991-09-14',admissao:'2023-01-16',funcao:'Analista de suporte',setor:'Suporte N3',salario:2717.47,status:'Ativo'},
      {nome:'WILLIAM DIAS',matricula:'--',email:'william.dias@imex.com.br',clt:'Não',nascimento:'1977-09-11',admissao:'2020-04-01',funcao:'Programador',setor:'Prog. PDV',salario:null,status:'Ativo'},
    ];

    const remuneracao = [
      {nome:'ABRANH AM JOÃO RESQUE VELOSO NETO',salario:2985.21,va:604,saude:322.10,odonto:20.82,outros:12,custoTotal:3944.13},
      {nome:'ADAN LUCAS PEREIRA DE OLIVEIRA',salario:3980.02,va:604,saude:318.73,odonto:20.82,outros:12,custoTotal:4935.57},
      {nome:'ALINE DE LIMA MAZZUCATTO',salario:2582.63,va:604,saude:335.01,odonto:20.82,outros:12,custoTotal:3554.46},
      {nome:'BRUNO DE OLIVEIRA',salario:4266.19,va:604,saude:335.01,odonto:20.82,outros:12,custoTotal:5238.02},
      {nome:'BRUNO DE PAULA SILVA',salario:2717.47,va:604,saude:310.5,odonto:0,outros:12,custoTotal:3643.97},
      {nome:'BRUNO FRIEDRICH RAQUEL',salario:4264.95,va:604,saude:0,odonto:0,outros:12,custoTotal:4880.95},
      {nome:'BRUNO ROSA DE OLIVEIRA',salario:2717.47,va:604,saude:0,odonto:20.82,outros:12,custoTotal:3354.29},
      {nome:'DAVID DA SILVA LIMA',salario:2303.02,va:604,saude:241.20,odonto:20.82,outros:12,custoTotal:3181.04},
      {nome:'DIEGO FABIANO DE SOUSA',salario:3253.87,va:604,saude:309.28,odonto:0,outros:12,custoTotal:4179.15},
      {nome:'DIOGO MAURICIO FONTOLAN',salario:4466.92,va:604,saude:358.43,odonto:20.82,outros:12,custoTotal:5462.17},
      {nome:'DORALICE AP. DOS SANTOS BORGES',salario:3867.25,va:604,saude:409.28,odonto:20.82,outros:12,custoTotal:4913.35},
      {nome:'EDSON NAKAMURA',salario:3240.93,va:832,saude:608.43,odonto:20.82,outros:12,custoTotal:4714.18},
      {nome:'EVERSON ADELMO BRITO DE MARINHO',salario:2302.82,va:604,saude:310.5,odonto:20.82,outros:12,custoTotal:3250.14},
      {nome:'EVERSON DA SILVA SANTANA',salario:3867.25,va:604,saude:358.43,odonto:20.82,outros:12,custoTotal:4862.5},
      {nome:'FABIO HENRIQUE CARDOSO NOBRE',salario:3980.02,va:604,saude:322.10,odonto:20.82,outros:12,custoTotal:4938.94},
      {nome:'FABIO VENDRAMIN GUIMARAES ROSINI',salario:9465,va:604,saude:438.82,odonto:20.82,outros:12,custoTotal:10540.64},
      {nome:'FERNANDA CHER',salario:2459.5,va:604,saude:513.97,odonto:20.82,outros:12,custoTotal:3610.29},
      {nome:'GABRIEL DE CASTRO MIRANDA LOPES',salario:6246.14,va:604,saude:322.46,odonto:20.82,outros:12,custoTotal:7205.42},
      {nome:'GILMAR SERGIO BIANCHI JUNIOR',salario:4008.84,va:604,saude:322.46,odonto:20.82,outros:12,custoTotal:4968.12},
      {nome:'GUILHERME DE ASSIS VILAS BOAS',salario:2717.47,va:604,saude:0,odonto:20.82,outros:12,custoTotal:3354.29},
      {nome:'GUSTAVO BEGTSOM RIBEIRO',salario:2717.47,va:604,saude:0,odonto:20.82,outros:12,custoTotal:3354.29},
      {nome:'GUSTAVO PINHEIRO DA SILVA',salario:4266.19,va:604,saude:318.73,odonto:20.82,outros:12,custoTotal:5221.74},
      {nome:'IVAN PIONELLI JUNIOR',salario:3199.65,va:604,saude:318.73,odonto:20.82,outros:12,custoTotal:4155.2},
      {nome:'JULIO CESAR ANDREATA JUNIOR',salario:4266.19,va:604,saude:318.73,odonto:20.82,outros:12,custoTotal:5221.74},
      {nome:'LEONARDO SCHAURICH DE ARAÚJO',salario:3197.04,va:604,saude:322.46,odonto:0,outros:12,custoTotal:4135.5},
      {nome:'LUCAS DE MATTOS MARQUINI',salario:3867.25,va:604,saude:318.73,odonto:20.82,outros:12,custoTotal:4822.8},
      {nome:'LUIZ FERNANDO RODRIGUES PEREIRA',salario:4266.19,va:604,saude:322.10,odonto:20.82,outros:12,custoTotal:5225.11},
      {nome:'MARCELA APARECIDA MENDES',salario:4847.65,va:604,saude:322.10,odonto:20.82,outros:12,custoTotal:5806.57},
      {nome:'MATEUS BAHIS VIEIRA',salario:12619.99,va:604,saude:438.82,odonto:20.82,outros:12,custoTotal:13695.63},
      {nome:'MATHEUS HENRIQUE MARQUES FREITAS',salario:4266.19,va:604,saude:318.73,odonto:20.82,outros:12,custoTotal:5221.74},
      {nome:'PAULO ANDRE LOT',salario:8018.74,va:604,saude:499.76,odonto:20.82,outros:12,custoTotal:9155.32},
      {nome:'RAFAEL BRAYNER OLIVEIRA DE CERQUEIRA',salario:2717.47,va:604,saude:322.46,odonto:20.82,outros:12,custoTotal:3676.75},
      {nome:'RAFAEL FRANCOVIG CAVICCHIOLLI',salario:4266.19,va:604,saude:0,odonto:20.82,outros:12,custoTotal:4903.01},
      {nome:'RAFAELLA MARRA KERSUL',salario:6387.72,va:604,saude:322.10,odonto:20.82,outros:12,custoTotal:7346.64},
      {nome:'RENAN MALAGUTTI',salario:3979.97,va:604,saude:318.73,odonto:20.82,outros:12,custoTotal:4935.52},
      {nome:'RHUAN VERLY DA FONSECA',salario:2839.81,va:604,saude:322.10,odonto:20.82,outros:12,custoTotal:3798.73},
      {nome:'RODOLFO CACERAGHI DOS SANTOS',salario:5169.02,va:604,saude:358.43,odonto:20.82,outros:12,custoTotal:6164.27},
      {nome:'RODRIGO CAMPOS',salario:2302.82,va:604,saude:0,odonto:0,outros:12,custoTotal:2918.82},
      {nome:'ROGÉRIO PAMPLONA BUSTAMANTE',salario:3867.25,va:604,saude:322.46,odonto:0,outros:12,custoTotal:4805.71},
      {nome:'SIRYUS CANUTO SAMBULSKI',salario:3980.02,va:604,saude:322.46,odonto:20.82,outros:12,custoTotal:4939.3},
      {nome:'VANDILSON GUELLERI',salario:3867.25,va:604,saude:335.01,odonto:20.82,outros:12,custoTotal:4839.08},
      {nome:'VARLEY DA SILVA RIBEIRO',salario:2585,va:604,saude:322.46,odonto:20.82,outros:12,custoTotal:3544.28},
      {nome:'VINÍCIUS MARTINS DE CARVALHO',salario:2717.47,va:604,saude:322.10,odonto:0,outros:12,custoTotal:3655.57},
      {nome:'VINNIE TAVARES DE CARVALHO',salario:3522.43,va:604,saude:335.01,odonto:20.82,outros:12,custoTotal:4494.26},
      {nome:'WALLYSSON MATEUS BARBOSA',salario:2302.82,va:604,saude:322.10,odonto:20.82,outros:12,custoTotal:3261.74},
      {nome:'WILLIAM NASCIMENTO DA SILVA',salario:2717.47,va:604,saude:0,odonto:0,outros:12,custoTotal:3333.47},
    ];

    const batch1 = db.batch();
    colaboradores.forEach(c => {
      const ref = db.collection(col('grh_colabs')).doc();
      batch1.set(ref, { ...c, criadoEm: new Date().toISOString() });
    });
    await batch1.commit();

    // Firestore limita 500 ops por batch — remuneração separada
    const batch2 = db.batch();
    remuneracao.forEach(r => {
      const ref = db.collection(col('grh_rem')).doc();
      batch2.set(ref, { ...r, criadoEm: new Date().toISOString() });
    });
    await batch2.commit();

    _grhColabs = null;
    _grhRem = null;
  } catch(e) {
    console.error('Erro ao importar base RH:', e);
  }
}

// ── Hero stats ──
async function grhAtualizarHero() {
  try {
    const cols = await grhGetColabs();
    const rem  = await grhGetRem();
    const total = cols.length;
    const clt   = cols.filter(c => c.clt === 'Sim').length;
    const folha = rem.reduce((s, r) => s + (parseFloat(r.salario) || 0), 0);
    const el = id => document.getElementById(id);
    if (el('grh-total')) el('grh-total').textContent = total;
    if (el('grh-clt'))   el('grh-clt').textContent   = clt;
    if (el('grh-folha')) el('grh-folha').textContent  =
      folha.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  } catch(e) {}
}

// ══ ABA COLABORADORES ══

async function grhRenderColabs() {
  const tbody = document.getElementById('grh-colab-body');
  if (!tbody) return;

  try {
    const all = await grhGetColabs(true);

    const q = (document.getElementById('grh-search')?.value || '').toLowerCase();
    const fSetor = document.getElementById('grh-filter-setor')?.value || '';
    const fClt = document.getElementById('grh-filter-clt')?.value || '';
    const fStatus = document.getElementById('grh-filter-status')?.value ?? 'Ativo';

    const selSetor = document.getElementById('grh-filter-setor');
    if (selSetor && selSetor.options.length <= 1) {
      [...new Set(all.map(c => c.setor).filter(Boolean))]
        .sort((a,b)=>a.localeCompare(b,'pt-BR'))
        .forEach(s => {
          const o = document.createElement('option');
          o.value = s;
          o.textContent = s;
          selSetor.appendChild(o);
        });
    }

    let dados = all.slice();

    if (q) {
      dados = dados.filter(c =>
        (c.nome || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.funcao || '').toLowerCase().includes(q) ||
        (c.setor || '').toLowerCase().includes(q) ||
        (c.matricula || '').toString().toLowerCase().includes(q)
      );
    }

    if (fSetor) dados = dados.filter(c => c.setor === fSetor);
    if (fClt) dados = dados.filter(c => c.clt === fClt);
    if (fStatus) dados = dados.filter(c => (c.status || 'Ativo') === fStatus);

    dados.sort((a,b)=>(a.nome||'').localeCompare(b.nome||'','pt-BR'));

    const countEl = document.getElementById('grh-col-count');
    if (countEl) countEl.textContent = `${dados.length} de ${all.length} colaboradores`;

    if (!dados.length) {
      tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--ink-60)">Nenhum colaborador encontrado.</td></tr>`;
      if (typeof grhRenderSetorStats === 'function') grhRenderSetorStats(all);
      return;
    }

    tbody.innerHTML = dados.map(c => {
      const status = c.status || 'Ativo';
      const statusColor = status === 'Ativo' ? 'var(--g-green)' : status === 'Afastado' ? 'var(--g-orange)' : 'var(--g-pink)';
      const statusBg = status === 'Ativo' ? 'var(--g-green-s)' : status === 'Afastado' ? 'var(--g-orange-s)' : 'var(--g-pink-s)';
      const role = c.roleAcesso || 'colaborador';

      return `<tr>
        <td style="padding-left:20px;font-weight:600;max-width:220px">${c.nome || '—'}</td>
        <td style="color:var(--ink-60);font-size:12px">${c.matricula || '—'}</td>
        <td style="font-size:12px;color:var(--ink-60)">${c.email || '—'}</td>
        <td style="font-size:12px;color:var(--ink-60)">${c.cpf || '—'}</td>
        <td style="font-size:12px">${c.funcao || '—'}</td>
        <td><span style="background:var(--pur-soft);color:var(--pur-vibrant);border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">${c.setor || '—'}</span></td>
        <td><span style="font-size:11px;font-weight:700;color:${c.clt === 'Sim' ? 'var(--g-green)' : 'var(--ink-60)'}">${c.clt === 'Sim' ? '✅ CLT' : 'PJ'}</span></td>
        <td style="font-size:12px;white-space:nowrap">${typeof grhFmt === 'function' ? grhFmt(c.admissao) : (c.admissao || '—')}</td>
        <td style="font-size:12px;color:var(--ink-60)">${typeof grhTempoEmpresa === 'function' ? grhTempoEmpresa(c.admissao) : '—'}</td>
        <td><span style="background:${statusBg};color:${statusColor};border-radius:5px;padding:2px 8px;font-size:11px;font-weight:700">${status}</span></td>
        <td><span style="background:var(--border);color:var(--ink-60);border-radius:5px;padding:2px 8px;font-size:11px;font-weight:700">${role}</span></td>
        <td style="white-space:nowrap">
          <button onclick="typeof grhAbrirModalColab==='function' ? grhAbrirModalColab('${c._id}') : null" style="border:1px solid var(--border);background:#fff;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px;margin-right:4px" title="Editar">✏️</button>
        </td>
      </tr>`;
    }).join('');

    if (typeof grhRenderSetorStats === 'function') grhRenderSetorStats(all);
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:24px;color:var(--rust)">Erro ao carregar colaboradores: ${e.message}</td></tr>`;
  }
}

function grhRenderSetorStats(colabs) {
  const wrap = document.getElementById('grh-setor-stats');
  if (!wrap) return;

  const mapa = {};
  colabs.forEach(c => {
    const setor = c.setor || 'Sem setor';
    mapa[setor] = (mapa[setor] || 0) + 1;
  });

  wrap.innerHTML = Object.entries(mapa)
    .sort((a,b)=>b[1]-a[1])
    .map(([setor, qtd]) => `
      <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow-premium)">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-60);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${setor}</div>
        <div style="font-size:26px;font-weight:800;color:var(--pur-vibrant)">${qtd}</div>
        <div style="font-size:11px;color:var(--ink-30)">${qtd===1?'colaborador':'colaboradores'}</div>
      </div>
    `).join('');
}

// ══ ABA ENDEREÇOS ══
async function grhRenderEnderecos() {
  const tbody = document.getElementById('grh-end-body');
  if (!tbody) return;
  try {
    const all = await grhGetColabs();
    const q   = (document.getElementById('grh-end-search')?.value || '').toLowerCase();
    let dados = all;
    if (q) dados = dados.filter(c => (c.nome||'').toLowerCase().includes(q));
    
    const countEl = document.getElementById('grh-end-count');
    if (countEl) countEl.textContent = `${dados.length} colaboradores`;

    if (!dados.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--ink-60)">Nenhum resultado.</td></tr>`;
      return;
    }
    tbody.innerHTML = dados.map(c => {
      const e = c.endereco || {};
      return `<tr>
        <td style="padding-left:20px;font-weight:600">${c.nome}</td>
        <td style="font-size:12px">${e.cep || '—'}</td>
        <td style="font-size:12px">${e.rua || '—'}</td>
        <td style="font-size:12px">${e.num || '—'} ${e.comp ? '('+e.comp+')' : ''}</td>
        <td style="font-size:12px">${e.bairro || '—'}</td>
        <td style="font-size:12px">${e.cidade || '—'}${e.uf ? ' / ' + e.uf : ''}</td>
        <td style="white-space:nowrap">
          <button onclick="grhAbrirModalEndereco('${c._id}')" style="border:1px solid var(--border);background:#fff;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px" title="Editar Endereço">📍 Editar</button>
        </td>
      </tr>`;
    }).join('');
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--rust)">Erro: ${e.message}</td></tr>`;
  }
}

async function grhAbrirModalEndereco(id) {
  const modal = document.getElementById('grh-modal-end');
  const setV  = (eid, v) => { const e = document.getElementById(eid); if(e) e.value = v || ''; };
  
  const cols = await grhGetColabs();
  const c = cols.find(x => x._id === id);
  if (!c) return;

  document.getElementById('grh-end-id').value = id;
  setV('grh-e-nome', c.nome);
  const e = c.endereco || {};
  setV('grh-e-cep',    e.cep);
  setV('grh-e-rua',    e.rua);
  setV('grh-e-num',    e.num);
  setV('grh-e-comp',   e.comp);
  setV('grh-e-bairro', e.bairro);
  setV('grh-e-cidade', e.cidade);
  setV('grh-e-uf',     e.uf);

  modal.style.display = 'flex';
}

async function grhBuscaCEP(cep) {
  cep = cep.replace(/\D/g, '');
  if (cep.length !== 8) return;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) return;
    const setV = (eid, v) => { const e = document.getElementById(eid); if(e) e.value = v || ''; };
    setV('grh-e-rua',    data.logradouro);
    setV('grh-e-bairro', data.bairro);
    setV('grh-e-cidade', data.localidade);
    setV('grh-e-uf',     data.uf);
    document.getElementById('grh-e-num').focus();
  } catch(e) {}
}

async function grhSalvarEndereco() {
  const id = document.getElementById('grh-end-id').value;
  const g  = eid => document.getElementById(eid)?.value.trim() || '';
  const endereco = {
    cep:    g('grh-e-cep'),
    rua:    g('grh-e-rua'),
    num:    g('grh-e-num'),
    comp:   g('grh-e-comp'),
    bairro: g('grh-e-bairro'),
    cidade: g('grh-e-cidade'),
    uf:     g('grh-e-uf')
  };
  try {
    await db.collection(col('grh_colabs')).doc(id).update({ endereco });
    _grhColabs = null;
    grhFecharModal('grh-modal-end');
    await grhRenderEnderecos();
  await grhRenderAdmissao();
    addNotif('Endereço atualizado com sucesso.', 'success');
  } catch(e) { alert('Erro ao salvar: ' + e.message); }
}

// ── IMPORTAÇÃO DE ENDEREÇOS VIA PLANILHA ──────────────────────────────
let _grhImportEndDados = []; // dados parseados aguardando confirmação

async function grhImportarEnderecos(input) {
  const file = input.files[0];
  input.value = ''; // reset para permitir reimport do mesmo arquivo
  if (!file) return;

  // Verifica se a lib XLSX está disponível (já carregada no <head>)
  if (typeof XLSX === 'undefined') {
    alert('Biblioteca XLSX não encontrada. Verifique a conexão e recarregue a página.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const wb    = XLSX.read(e.target.result, { type: 'array' });
      // Tenta usar a aba "Endereços", senão pega a primeira
      const wsName = wb.SheetNames.includes('Endereços') ? 'Endereços' : wb.SheetNames[0];
      const ws     = wb.Sheets[wsName];
      const rows   = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!rows.length) {
        addNotif('A planilha está vazia ou sem dados válidos.', 'error');
        return;
      }

      // Mapeamento flexível de cabeçalhos (aceita variações)
      const map = r => ({
        cpf:    String(r['CPF *'] || r['CPF'] || r['cpf'] || '').trim(),
        nome:   String(r['Nome Completo *'] || r['Nome Completo'] || r['nome'] || r['Nome'] || '').trim(),
        cep:    String(r['CEP *'] || r['CEP'] || r['cep'] || '').trim(),
        rua:    String(r['Logradouro *'] || r['Logradouro'] || r['logradouro'] || r['Rua'] || '').trim(),
        num:    String(r['Número *'] || r['Número'] || r['Numero'] || r['numero'] || r['num'] || '').trim(),
        comp:   String(r['Complemento'] || r['complemento'] || '').trim(),
        bairro: String(r['Bairro *'] || r['Bairro'] || r['bairro'] || '').trim(),
        cidade: String(r['Cidade *'] || r['Cidade'] || r['cidade'] || '').trim(),
        uf:     String(r['UF *'] || r['UF'] || r['uf'] || '').trim().toUpperCase(),
      });

      const todos = await grhGetColabs();
      const preview = [];
      const alertas = [];

      for (let i = 0; i < rows.length; i++) {
        const d = map(rows[i]);
        // Pula linhas completamente vazias
        if (!d.cpf && !d.nome && !d.cep) continue;

        let status = 'ok';
        let msg    = '✅ Pronto';
        let colab  = null;

        const cpfLimpo = d.cpf.replace(/\D/g, '');

        if (!d.cpf) {
          status = 'erro'; msg = '❌ CPF ausente';
        } else if (!d.cep) {
          status = 'aviso'; msg = '⚠️ CEP ausente';
        } else {
          // Tenta encontrar colaborador pelo CPF
          colab = todos.find(c => (c.cpf || '').replace(/\D/g, '') === cpfLimpo);
          if (!colab) {
            // Tenta pelo nome
            colab = todos.find(c => (c.nome || '').toLowerCase() === d.nome.toLowerCase());
          }
          if (!colab) {
            status = 'aviso'; msg = '⚠️ Colaborador não encontrado';
          }
        }

        preview.push({ ...d, status, msg, _id: colab?._id || null, _nome: colab?.nome || d.nome });
      }

      if (!preview.length) {
        addNotif('Nenhuma linha válida encontrada na planilha.', 'error');
        return;
      }

      _grhImportEndDados = preview;

      // Monta alertas resumo
      const erros   = preview.filter(r => r.status === 'erro').length;
      const avisos  = preview.filter(r => r.status === 'aviso').length;
      const prontos = preview.filter(r => r.status === 'ok').length;

      const alertasDiv = document.getElementById('grh-import-end-alertas');
      alertasDiv.innerHTML = '';
      if (erros)   alertasDiv.innerHTML += `<div style="background:#fee2e2;color:#dc2626;padding:8px 14px;border-radius:8px;font-size:13px;margin-bottom:6px">❌ ${erros} linha(s) com erro — não serão importadas.</div>`;
      if (avisos)  alertasDiv.innerHTML += `<div style="background:#fef3c7;color:#92400e;padding:8px 14px;border-radius:8px;font-size:13px;margin-bottom:6px">⚠️ ${avisos} linha(s) com aviso — colaborador não encontrado no sistema.</div>`;
      if (prontos) alertasDiv.innerHTML += `<div style="background:#d1fae5;color:#065f46;padding:8px 14px;border-radius:8px;font-size:13px;margin-bottom:6px">✅ ${prontos} endereço(s) prontos para importar.</div>`;

      // Preenche tabela de preview
      const tbody = document.getElementById('grh-import-end-preview');
      tbody.innerHTML = preview.map((r, i) => {
        const bg = r.status === 'erro' ? '#fff5f5' : r.status === 'aviso' ? '#fffbeb' : (i%2===0?'#f9fafb':'#fff');
        return `<tr style="background:${bg}">
          <td style="padding:8px 12px;color:var(--ink-60)">${i+1}</td>
          <td style="padding:8px 12px;font-weight:600">${r._nome || r.nome || '—'}</td>
          <td style="padding:8px 12px">${r.cep || '—'}</td>
          <td style="padding:8px 12px">${r.rua || '—'}</td>
          <td style="padding:8px 12px">${r.num || '—'}</td>
          <td style="padding:8px 12px;color:var(--ink-60)">${r.comp || '—'}</td>
          <td style="padding:8px 12px">${r.bairro || '—'}</td>
          <td style="padding:8px 12px">${r.cidade || '—'}${r.uf ? ' / '+r.uf : ''}</td>
          <td style="padding:8px 12px">${r.msg}</td>
        </tr>`;
      }).join('');

      document.getElementById('grh-import-end-info').textContent = `Planilha: ${file.name} — ${preview.length} linha(s) lida(s)`;
      document.getElementById('grh-import-end-summary').textContent = `${prontos} de ${preview.length} serão importados`;

      const btn = document.getElementById('grh-import-end-btn');
      btn.disabled = prontos === 0;
      btn.style.opacity = prontos > 0 ? '1' : '0.5';

      document.getElementById('grh-modal-import-end').style.display = 'flex';
    } catch(err) {
      addNotif('Erro ao ler planilha: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

async function grhConfirmarImportEnderecos() {
  const prontos = _grhImportEndDados.filter(r => r.status === 'ok' && r._id);
  if (!prontos.length) { addNotif('Nenhum endereço válido para importar.', 'error'); return; }

  const btn = document.getElementById('grh-import-end-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Importando...';

  try {
    const batch = db.batch();
    for (const r of prontos) {
      const ref = db.collection(col('grh_colabs')).doc(r._id);
      batch.update(ref, {
        endereco: { cep: r.cep, rua: r.rua, num: r.num, comp: r.comp, bairro: r.bairro, cidade: r.cidade, uf: r.uf }
      });
    }
    await batch.commit();
    _grhColabs = null;
    grhFecharModal('grh-modal-import-end');
    await grhRenderEnderecos();
    addNotif(`✅ ${prontos.length} endereço(s) importado(s) com sucesso!`, 'success');
  } catch(err) {
    addNotif('Erro ao salvar no banco: ' + err.message, 'error');
    btn.disabled = false;
    btn.textContent = '💾 Confirmar Importação';
  }
}
// ─────────────────────────────────────────────────────────────────────
    

function grhMascaraCPF(i) {
  let v = i.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  i.value = v;
}


// ══ ABA ADMISSÃO ══
async function grhRenderAdmissao() {
  const tbody = document.getElementById('grh-adm-body');
  if (!tbody) return;
  try {
    const all = await grhGetColabs();
    // Filtrar por cadastros recentes (ex: criados nos últimos 30 dias) ou simplesmente ordenar por data de criação
    // Como não temos um campo 'criadoEm' em todos, vamos focar nos que têm e ordenar decrescente
    // Filtrar apenas colaboradores cadastrados manualmente (que possuem a flag manual: true)
    let dados = all.filter(c => c.manual === true);
    dados.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

    const q = (document.getElementById('grh-adm-search')?.value || '').toLowerCase();
    if (q) dados = dados.filter(c => (c.nome||'').toLowerCase().includes(q));
    
    const countEl = document.getElementById('grh-adm-count');
    if (countEl) countEl.textContent = `${dados.length} novos cadastros`;

    if (!dados.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--ink-60)">Nenhum cadastro recente encontrado.</td></tr>`;
      return;
    }
    tbody.innerHTML = dados.map(c => {
      const brl = v => v ? 'R$ ' + Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}) : '—';
      const cltBadge = c.clt === 'Sim'
        ? `<span style="background:#dcfce7;color:#166534;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">CLT</span>`
        : `<span style="background:#fef9c3;color:#854d0e;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">PJ</span>`;
      // Calcular 45/90 dias em runtime caso o campo não esteja salvo
      let d45 = c.d45, d90 = c.d90;
      if (!d45 && c.admissao) {
        const base = new Date(c.admissao);
        const dt45 = new Date(base); dt45.setDate(dt45.getDate() + 45);
        const dt90 = new Date(base); dt90.setDate(dt90.getDate() + 90);
        d45 = dt45.toISOString().split('T')[0];
        d90 = dt90.toISOString().split('T')[0];
      }
      return `<tr>
        <td style="padding-left:20px;font-weight:600">${c.nome}</td>
        <td style="font-size:12px">${grhFmt(c.admissao)||'—'}</td>
        <td style="font-size:12px">${c.funcao||'—'}</td>
        <td>${cltBadge}</td>
        <td style="font-weight:600;color:var(--g-green)">${brl(c.salario)}</td>
        <td style="font-size:12px;color:var(--ink-60)">${grhFmt(d45)||'—'}</td>
        <td style="font-size:12px;color:var(--ink-60)">${grhFmt(d90)||'—'}</td>
        <td style="white-space:nowrap">
          <button onclick="grhAbrirModalColab('${c._id}')" style="border:1px solid var(--border);background:#fff;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px" title="Ver Detalhes">👁️ Ver</button>
        </td>
      </tr>`;
    }).join('');
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--rust)">Erro: ${e.message}</td></tr>`;
  }
}
    

async function grhRenderColabs() {
  const tbody = document.getElementById('grh-colab-body');
  if (!tbody) return;

  try {
    const all = await grhGetColabs(true);

    const q = (document.getElementById('grh-search')?.value || '').toLowerCase();
    const fSetor = document.getElementById('grh-filter-setor')?.value || '';
    const fClt = document.getElementById('grh-filter-clt')?.value || '';
    const fStatus = document.getElementById('grh-filter-status')?.value ?? 'Ativo';

    const selSetor = document.getElementById('grh-filter-setor');
    if (selSetor && selSetor.options.length <= 1) {
      [...new Set(all.map(c => c.setor).filter(Boolean))]
        .sort((a,b)=>a.localeCompare(b,'pt-BR'))
        .forEach(s => {
          const o = document.createElement('option');
          o.value = s;
          o.textContent = s;
          selSetor.appendChild(o);
        });
    }

    let dados = all.slice();

    if (q) {
      dados = dados.filter(c =>
        (c.nome || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.funcao || '').toLowerCase().includes(q) ||
        (c.setor || '').toLowerCase().includes(q) ||
        (c.matricula || '').toString().toLowerCase().includes(q)
      );
    }

    if (fSetor) dados = dados.filter(c => c.setor === fSetor);
    if (fClt) dados = dados.filter(c => c.clt === fClt);
    if (fStatus) dados = dados.filter(c => (c.status || 'Ativo') === fStatus);

    dados.sort((a,b)=>(a.nome||'').localeCompare(b.nome||'','pt-BR'));

    const countEl = document.getElementById('grh-col-count');
    if (countEl) countEl.textContent = `${dados.length} de ${all.length} colaboradores`;

    if (!dados.length) {
      tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--ink-60)">Nenhum colaborador encontrado.</td></tr>`;
      if (typeof grhRenderSetorStats === 'function') grhRenderSetorStats(all);
      return;
    }

    tbody.innerHTML = dados.map(c => {
      const status = c.status || 'Ativo';
      const statusColor = status === 'Ativo' ? 'var(--g-green)' : status === 'Afastado' ? 'var(--g-orange)' : 'var(--g-pink)';
      const statusBg = status === 'Ativo' ? 'var(--g-green-s)' : status === 'Afastado' ? 'var(--g-orange-s)' : 'var(--g-pink-s)';
      const role = c.roleAcesso || 'colaborador';

      return `<tr>
        <td style="padding-left:20px;font-weight:600;max-width:220px">${c.nome || '—'}</td>
        <td style="color:var(--ink-60);font-size:12px">${c.matricula || '—'}</td>
        <td style="font-size:12px;color:var(--ink-60)">${c.email || '—'}</td>
        <td style="font-size:12px;color:var(--ink-60)">${c.cpf || '—'}</td>
        <td style="font-size:12px">${c.funcao || '—'}</td>
        <td><span style="background:var(--pur-soft);color:var(--pur-vibrant);border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">${c.setor || '—'}</span></td>
        <td><span style="font-size:11px;font-weight:700;color:${c.clt === 'Sim' ? 'var(--g-green)' : 'var(--ink-60)'}">${c.clt === 'Sim' ? '✅ CLT' : 'PJ'}</span></td>
        <td style="font-size:12px;white-space:nowrap">${typeof grhFmt === 'function' ? grhFmt(c.admissao) : (c.admissao || '—')}</td>
        <td style="font-size:12px;color:var(--ink-60)">${typeof grhTempoEmpresa === 'function' ? grhTempoEmpresa(c.admissao) : '—'}</td>
        <td><span style="background:${statusBg};color:${statusColor};border-radius:5px;padding:2px 8px;font-size:11px;font-weight:700">${status}</span></td>
        <td><span style="background:var(--border);color:var(--ink-60);border-radius:5px;padding:2px 8px;font-size:11px;font-weight:700">${role}</span></td>
        <td style="white-space:nowrap">
          <button onclick="typeof grhAbrirModalColab==='function' ? grhAbrirModalColab('${c._id}') : null" style="border:1px solid var(--border);background:#fff;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px;margin-right:4px" title="Editar">✏️</button>
        </td>
      </tr>`;
    }).join('');

    if (typeof grhRenderSetorStats === 'function') grhRenderSetorStats(all);
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:24px;color:var(--rust)">Erro ao carregar colaboradores: ${e.message}</td></tr>`;
  }
}

function grhRenderSetorStats(colabs) {
  const wrap = document.getElementById('grh-setor-stats');
  if (!wrap) return;

  const mapa = {};
  colabs.forEach(c => {
    const setor = c.setor || 'Sem setor';
    mapa[setor] = (mapa[setor] || 0) + 1;
  });

  wrap.innerHTML = Object.entries(mapa)
    .sort((a,b)=>b[1]-a[1])
    .map(([setor, qtd]) => `
      <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow-premium)">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-60);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${setor}</div>
        <div style="font-size:26px;font-weight:800;color:var(--pur-vibrant)">${qtd}</div>
        <div style="font-size:11px;color:var(--ink-30)">${qtd===1?'colaborador':'colaboradores'}</div>
      </div>
    `).join('');
}


// ── Modal colaborador ──

// ── Lógica do Prontuário (Documentos) ──
// Tipos de documento disponíveis por vínculo — CLT recebe Férias/IR,
// PJ recebe Ordem de Serviço/Nota Fiscal.
// "Holerite" foi removido daqui de propósito: a importação em massa agora é feita
// pelo Upload Automático de Holerites (PDF), em Remuneração → Ações da Folha.
const GRH_TIPOS_DOC = {
  Sim: [['Férias','🌴'], ['IR','🧮']],
  Não: [['Ordem de Serviço','📋'], ['Nota Fiscal','🧾'], ['IR','🧮']]
};
function grhAtualizarTiposDoc() {
  const sel = document.getElementById('grh-c-doc-tipo');
  if (!sel) return;
  const clt = document.getElementById('grh-c-clt')?.value || 'Sim';
  const tipos = GRH_TIPOS_DOC[clt] || GRH_TIPOS_DOC.Sim;
  sel.innerHTML = tipos.map(t => `<option value="${t[0]}">${t[1]} ${t[0]}</option>`).join('');
  grhToggleHoleriteForm();
}

function grhToggleHoleriteForm() {
  const sel = document.getElementById('grh-c-doc-tipo');
  const form = document.getElementById('grh-holerite-form');
  if (!sel || !form) return;
  form.style.display = sel.value === 'Holerite' ? 'block' : 'none';
}

async function grhUploadDoc(input) {
  const id = document.getElementById('grh-colab-id').value;
  if (!id) {
    alert('Salve o colaborador primeiro antes de anexar documentos.');
    input.value = '';
    return;
  }

  const tipoDoc = document.getElementById('grh-c-doc-tipo')?.value || '';
  const isHolerite = tipoDoc === 'Holerite';

  // Lê os valores do mini-formulário de holerite, se aplicável.
  let holeriteValores = null;
  if (isHolerite) {
    const n = eid => parseFloat(document.getElementById(eid)?.value) || 0;
    const mes = document.getElementById('grh-h-mes')?.value || '';
    if (!mes) { alert('Informe o mês de referência do holerite.'); return; }
    holeriteValores = {
      mes,
      bruta: n('grh-h-bruta'),
      liquida: n('grh-h-liquida'),
      descontoInss: n('grh-h-inss'),
      descontoIrrf: n('grh-h-irrf'),
      descontoSaude: n('grh-h-saude'),
      descontoOdonto: n('grh-h-odonto'),
      descontoFarmacia: n('grh-h-farmacia'),
      outrosDescontos: n('grh-h-outrosdesc'),
      provisao13: n('grh-h-prov13'),
      provisaoFerias: n('grh-h-provferias')
    };
  }

  const files = input.files;
  if (!files.length) return;

  for (const file of files) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      const docData = {
        nome: file.name,
        tipo: file.type,
        tipoDoc,
        tamanho: file.size,
        data: new Date().toISOString(),
        content: base64 // Armazenando no Firestore (limite de 1MB por doc, ideal para recibos pequenos)
      };

      try {
        const colabRef = db.collection(col('grh_colabs')).doc(id);
        const doc = await colabRef.get();
        const dadosAtuais = doc.data() || {};
        const prontuario = dadosAtuais.prontuario || [];
        prontuario.push(docData);
        const update = { prontuario };

        if (isHolerite && holeriteValores) {
          const holerites = (dadosAtuais.holerites || []).filter(h => h.mes !== holeriteValores.mes);
          holerites.push({ ...holeriteValores, arquivoNome: file.name, criadoEm: new Date().toISOString() });
          holerites.sort((a,b) => (b.mes||'').localeCompare(a.mes||''));
          update.holerites = holerites;
        }

        await colabRef.update(update);
        addNotif(`Documento "${file.name}" (${tipoDoc}) anexado.`, 'success');
        grhRenderProntuario(prontuario);
        if (isHolerite) grhRenderHolerites(update.holerites || dadosAtuais.holerites || []);
      } catch (err) {
        console.error(err);
        alert('Erro ao salvar documento: ' + err.message);
      }
    };
    reader.readAsDataURL(file);
  }
  input.value = '';
}

function grhRenderHolerites(holerites) {
  const wrap = document.getElementById('grh-holerites-lista-wrap');
  const container = document.getElementById('grh-holerites-lista');
  if (!container || !wrap) return;
  if (!holerites || !holerites.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  container.innerHTML = holerites.map(h => {
    const [ano, mes] = (h.mes || '').split('-');
    const mesLabel = ano && mes ? `${mes}/${ano}` : (h.mes || '—');
    return `
    <div class="doc-item">
      <div class="doc-info">
        <span>💰</span>
        <div>
          <div style="font-weight:600">${mesLabel} — Bruta: ${grhBRL(h.bruta)} · Líquida: ${grhBRL(h.liquida)}</div>
          <div style="font-size:10px; color:var(--ink-30)">INSS: ${grhBRL(h.descontoInss||0)} · IRRF: ${grhBRL(h.descontoIrrf||0)} · Saúde: ${grhBRL(h.descontoSaude||0)} · Odonto: ${grhBRL(h.descontoOdonto||0)} · Farmácia: ${grhBRL(h.descontoFarmacia||0)} · Outros: ${grhBRL(h.outrosDescontos||0)}</div>
          <div style="font-size:10px; color:var(--ink-30)">Prov. 13º+Férias: ${grhBRL((h.provisao13||0)+(h.provisaoFerias||0))}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Baixar modelo de planilha de holerites ──
function grhBaixarModeloHolerites() {
  if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }
  const ws = XLSX.utils.aoa_to_sheet([
    ['E-mail do Colaborador', 'Mês (AAAA-MM)', 'Remuneração Bruta', 'Remuneração Líquida', 'Desconto INSS', 'Desconto IRRF', 'Desconto Plano de Saúde', 'Desconto Odontológico', 'Desconto Farmácia', 'Outros Descontos', 'Provisão 13º', 'Provisão Férias'],
    ['maria.silva@imex.com.br', '2026-05', 4500.00, 3700.00, 495.00, 120.00, 350.00, 40.00, 0, 0, 375.00, 416.67],
    ['joao.costa@imex.com.br',  '2026-05', 2800.00, 2450.00, 280.00, 0,      0, 0, 0, 0, 233.33, 259.26],
  ]);
  ws['!cols'] = [{wch:30},{wch:16},{wch:18},{wch:20},{wch:14},{wch:14},{wch:18},{wch:16},{wch:14},{wch:16},{wch:14},{wch:16}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Holerites');
  XLSX.writeFile(wb, 'modelo-holerites.xlsx');
  log('Modelo baixado', 'Template de holerites exportado', '⬇️');
}

// ── Importar holerites via planilha ──
async function grhImportarHolerites(input) {
  const file = input.files[0];
  if (!file) return;
  input.value = '';

  if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('holerite')) || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (!rows.length) { alert('Nenhum dado encontrado na planilha.'); return; }

      const normalize = s => String(s).toLowerCase().trim();
      const keys = Object.keys(rows[0]);
      const colMap = {};
      keys.forEach(k => {
        const n = normalize(k);
        if (n.includes('e-mail') || n.includes('email')) colMap.email = k;
        else if (n.includes('mês') || n.includes('mes')) colMap.mes = k;
        else if (n.includes('bruta')) colMap.bruta = k;
        else if (n.includes('líquida') || n.includes('liquida')) colMap.liquida = k;
        else if (n.includes('inss')) colMap.inss = k;
        else if (n.includes('irrf')) colMap.irrf = k;
        else if (n.includes('saúde') || n.includes('saude')) colMap.saude = k;
        else if (n.includes('odont')) colMap.odonto = k;
        else if (n.includes('farmácia') || n.includes('farmacia')) colMap.farmacia = k;
        else if (n.includes('outros desconto')) colMap.outrosDesc = k;
        else if (n.includes('13')) colMap.prov13 = k;
        else if (n.includes('férias') || n.includes('ferias')) colMap.provFerias = k;
      });
      if (!colMap.email || !colMap.mes) {
        alert('A planilha precisa ter as colunas "E-mail do Colaborador" e "Mês (AAAA-MM)".');
        return;
      }

      const colabs = await grhGetColabs(true);
      const porEmail = new Map(colabs.map(c => [normalize(c.email || ''), c]));

      let atualizados = 0, naoEncontrados = [];
      const batch = db.batch();

      for (const row of rows) {
        const email = normalize(row[colMap.email] || '');
        const mes = String(row[colMap.mes] || '').trim().slice(0,7);
        if (!email || !mes) continue;
        const colab = porEmail.get(email);
        if (!colab) { naoEncontrados.push(email); continue; }

        const novoHolerite = {
          mes,
          bruta: parseFloat(row[colMap.bruta]) || 0,
          liquida: parseFloat(row[colMap.liquida]) || 0,
          descontoInss: parseFloat(row[colMap.inss]) || 0,
          descontoIrrf: parseFloat(row[colMap.irrf]) || 0,
          descontoSaude: parseFloat(row[colMap.saude]) || 0,
          descontoOdonto: parseFloat(row[colMap.odonto]) || 0,
          descontoFarmacia: parseFloat(row[colMap.farmacia]) || 0,
          outrosDescontos: parseFloat(row[colMap.outrosDesc]) || 0,
          provisao13: parseFloat(row[colMap.prov13]) || 0,
          provisaoFerias: parseFloat(row[colMap.provFerias]) || 0,
          criadoEm: new Date().toISOString(),
          origem: 'importacao_planilha'
        };

        const holerites = (colab.holerites || []).filter(h => h.mes !== mes);
        holerites.push(novoHolerite);
        holerites.sort((a,b) => (b.mes||'').localeCompare(a.mes||''));
        colab.holerites = holerites; // mantém atualizado em memória para próximas linhas da mesma planilha

        const ref = db.collection(col('grh_colabs')).doc(colab._id);
        batch.update(ref, { holerites });
        atualizados++;
      }

      if (atualizados > 0) await batch.commit();
      _grhColabs = null;

      let msg = `${atualizados} holerite(s) importado(s) com sucesso.`;
      if (naoEncontrados.length) msg += `\n\n${naoEncontrados.length} e-mail(s) não encontrado(s) na base de Colaboradores:\n` + naoEncontrados.slice(0,10).join(', ') + (naoEncontrados.length > 10 ? '...' : '');
      alert(msg);
      log('Holerites importados', `${atualizados} registros via planilha`, '📤');
      await grhRenderRemuneracao();
      await grhAtualizarHero();
    } catch (err) {
      console.error(err);
      alert('Erro ao importar planilha: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

function grhRenderProntuario(docs) {
  const container = document.getElementById('grh-c-doc-list');
  if (!container) return;

  if (!docs || docs.length === 0) {
    container.innerHTML = '<div style="text-align:center; font-size:12px; color:var(--ink-30); padding:10px;">Nenhum documento anexado.</div>';
    return;
  }

  container.innerHTML = docs.map((doc, idx) => `
    <div class="doc-item">
      <div class="doc-info">
        <span>${(doc.tipo||'').includes('pdf') ? '📄' : '🖼️'}</span>
        <div>
          <div style="font-weight:600">${doc.nome}${doc.tipoDoc ? ' <span style="font-weight:700;font-size:10px;color:#0047FF;background:#0047FF14;border-radius:99px;padding:2px 8px;margin-left:4px">'+doc.tipoDoc+'</span>' : ''}</div>
          <div style="font-size:10px; color:var(--ink-30)">${new Date(doc.data).toLocaleDateString()} · ${(doc.tamanho/1024).toFixed(1)} KB</div>
        </div>
      </div>
      <div class="doc-actions">
        <a href="${doc.content}" download="${doc.nome}" class="btn-doc-view" title="Baixar">📥</a>
        <button onclick="grhExcluirDoc(${idx})" class="btn-doc-del" title="Excluir">🗑️</button>
      </div>
    </div>
  `).join('');
}

async function grhExcluirDoc(idx) {
  if (!confirm('Deseja excluir este documento?')) return;
  const id = document.getElementById('grh-colab-id').value;
  try {
    const colabRef = db.collection(col('grh_colabs')).doc(id);
    const doc = await colabRef.get();
    const prontuario = doc.data().prontuario || [];
    prontuario.splice(idx, 1);
    await colabRef.update({ prontuario });
    addNotif('Documento removido.', 'warning');
    grhRenderProntuario(prontuario);
  } catch (err) {
    alert('Erro ao excluir: ' + err.message);
  }
}
    
async function grhAbrirModalColab(id) {
  const modal = document.getElementById('grh-modal-colab');
  const title = document.getElementById('grh-modal-colab-title');
  const setV  = (eid, v) => { const e = document.getElementById(eid); if(e) e.value = v || ''; };

  if (id) {
    const cols = await grhGetColabs();
    const c = cols.find(x => x._id === id);
    if (!c) return;
    title.textContent = '✏️ Editar Colaborador';
    document.getElementById('grh-colab-id').value = id;
    setV('grh-c-nome',      c.nome);
    setV('grh-c-matricula', c.matricula);
    setV('grh-c-email',     c.email);
    setV('grh-c-cpf',       c.cpf);
    setV('grh-c-funcao',    c.funcao);
    setV('grh-c-setor',     c.setor);
    setV('grh-c-unidade',   c.unidade);
    setV('grh-c-gestor',    c.gestor);
    setV('grh-c-gestor-email', c.gestorEmail);
    setV('grh-c-nasc',      c.nascimento);
    setV('grh-c-admissao',  c.admissao);
    setV('grh-c-clt',       c.clt);
    setV('grh-c-status',    c.status);
    setV('grh-c-salario',   c.salario);
    setV('grh-c-role',      c.roleAcesso || 'colaborador');
    setV('grh-c-telefone',  c.telefone);
    setV('grh-c-email-pessoal', c.emailPessoal);
    setV('grh-c-rg',        c.rg);
    setV('grh-c-estadocivil', c.estadoCivil);
    setV('grh-c-emerg-nome', c.emergenciaNome);
    setV('grh-c-emerg-tel', c.emergenciaTelefone);
    setV('grh-c-tipocontrato', c.tipoContrato || (c.clt === 'Sim' ? 'CLT' : 'PJ'));
    setV('grh-c-nivel',     c.nivel);
    setV('grh-c-ctps-num',  c.ctpsNumero);
    setV('grh-c-ctps-serie', c.ctpsSerie);
    setV('grh-c-pis',       c.pis);
    setV('grh-c-banco',     c.banco);
    setV('grh-c-agencia',   c.agencia);
    setV('grh-c-conta',     c.conta);
    setV('grh-c-tipoconta', c.tipoConta);
    grhAtualizarTiposDoc();
    grhRenderProntuario(c.prontuario || []);
    grhRenderHolerites(c.holerites || []);
    ['grh-h-mes','grh-h-bruta','grh-h-liquida','grh-h-inss','grh-h-irrf','grh-h-saude','grh-h-odonto','grh-h-farmacia','grh-h-outrosdesc','grh-h-prov13','grh-h-provferias'].forEach(eid => setV(eid,''));
    document.getElementById('grh-c-prontuario-area').style.display = 'block';
  } else {
    title.textContent = '➕ Novo Colaborador';
    document.getElementById('grh-colab-id').value = '';
    ['grh-c-nome','grh-c-matricula','grh-c-email','grh-c-cpf','grh-c-funcao','grh-c-setor',
     'grh-c-unidade','grh-c-gestor','grh-c-gestor-email',
     'grh-c-nasc','grh-c-admissao','grh-c-salario',
     'grh-c-telefone','grh-c-email-pessoal','grh-c-rg','grh-c-estadocivil','grh-c-emerg-nome','grh-c-emerg-tel',
     'grh-c-nivel','grh-c-ctps-num','grh-c-ctps-serie','grh-c-pis',
     'grh-c-banco','grh-c-agencia','grh-c-conta','grh-c-tipoconta'].forEach(eid => setV(eid,''));
    setV('grh-c-clt','Sim'); setV('grh-c-status','Ativo'); setV('grh-c-role','colaborador'); setV('grh-c-tipocontrato','CLT');
    document.getElementById('grh-c-prontuario-area').style.display = 'none';
  }
  modal.style.display = 'flex';
}

async function grhSalvarColab() {
  const id = document.getElementById('grh-colab-id').value;
  const g = eid => document.getElementById(eid)?.value.trim() || '';
  const roleAcesso = g('grh-c-role') || 'colaborador';
  const dados = {
    nome:       g('grh-c-nome'),
    matricula:  g('grh-c-matricula'),
    email:      g('grh-c-email'),
    cpf:        g('grh-c-cpf'),
    funcao:     g('grh-c-funcao'),
    setor:      g('grh-c-setor'),
    unidade:    g('grh-c-unidade'),
    gestor:     g('grh-c-gestor'),
    gestorEmail: g('grh-c-gestor-email'),
    nascimento: g('grh-c-nasc'),
    admissao:   g('grh-c-admissao'),
    clt:        g('grh-c-clt'),
    status:     g('grh-c-status'),
    salario:    parseFloat(g('grh-c-salario')) || null,
    roleAcesso,
    telefone:   g('grh-c-telefone'),
    emailPessoal: g('grh-c-email-pessoal'),
    rg:         g('grh-c-rg'),
    estadoCivil: g('grh-c-estadocivil'),
    emergenciaNome: g('grh-c-emerg-nome'),
    emergenciaTelefone: g('grh-c-emerg-tel'),
    tipoContrato: g('grh-c-tipocontrato'),
    nivel:      g('grh-c-nivel'),
    ctpsNumero: g('grh-c-ctps-num'),
    ctpsSerie:  g('grh-c-ctps-serie'),
    pis:        g('grh-c-pis'),
    banco:      g('grh-c-banco'),
    agencia:    g('grh-c-agencia'),
    conta:      g('grh-c-conta'),
    tipoConta:  g('grh-c-tipoconta'),
  };
  if (!dados.nome) { alert('Nome é obrigatório.'); return; }
  try {
    if (id) {
      // Captura estado anterior para detectar mudanças que devem gerar
      // Movimentação automática (Colaboradores é a base mestra do sistema).
      const colabsAntes = await grhGetColabs();
      const colabAntes = colabsAntes.find(c => c._id === id) || {};
      const salarioAntes = parseFloat(colabAntes.salario) || null;
      const cargoAntes   = colabAntes.funcao || '';
      const setorAntes   = colabAntes.setor || '';
      const gestorAntes  = colabAntes.gestor || '';

      await db.collection(col('grh_colabs')).doc(id).update(dados);
      _grhColabs = null;

      // ── Gera Movimentação automática quando salário/cargo/setor/gestor mudam ──
      await grhGerarMovimentacaoAutomatica(id, dados, {
        salarioAntes, cargoAntes, setorAntes, gestorAntes
      });
      // Sincronizar role no Firestore users (pelo e-mail)
      if (dados.email) {
        try {
          const usersSnap = await db.collection('users').where('email', '==', dados.email).get();
          usersSnap.forEach(doc => doc.ref.update({ role: roleAcesso }));
        } catch(e) { /* usuário pode não ter conta ainda */ }
      }

      // Gatilho automático: abre modal de desligamento pré-preenchido
      if (dados.status === 'Inativo') {
        log('Colaborador marcado Inativo', dados.nome, '🚪');
        grhFecharModal('grh-modal-colab');
        await grhRenderColabs();
        await grhAtualizarHero();
        // Passa os dados do colaborador para pré-preencher o modal
        grhAbrirModalDesligamentoPorInativo(id, dados);
        return; // Não exibe notificação genérica — o modal de desligamento assume
      }

      log('Colaborador atualizado', dados.nome, '✏️');
    } else {
      await db.collection(col('grh_colabs')).add({ ...dados, criadoEm: new Date().toISOString(), manual: true });
      log('Colaborador adicionado', dados.nome, '➕');
    }
    _grhColabs = null;
    grhFecharModal('grh-modal-colab');
    await grhRenderColabs();
    await grhAtualizarHero();
    addNotif(`Colaborador ${dados.nome} ${id?'atualizado':'adicionado'} com sucesso.`, 'success');
  } catch(e) {
    const u = (typeof auth !== 'undefined' && auth.currentUser) ? auth.currentUser : null;
    const debugAuth = u ? `Logado como: ${u.email} (uid: ${u.uid})` : 'NENHUM usuário autenticado no Firebase Auth (auth.currentUser está vazio).';
    alert('Erro ao salvar: ' + e.message + '\n\n[Diagnóstico]\n' + debugAuth);
  }
}

// ── Gera registros automáticos em Movimentações quando dados estruturais
// do colaborador mudam (salário, cargo/função, setor, gestor). Colaboradores
// é a base mestra: toda alteração ali deve refletir como histórico aqui. ──
async function grhGerarMovimentacaoAutomatica(colabId, dadosNovos, antes) {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const lancamentos = [];

    const salarioNovo = parseFloat(dadosNovos.salario) || null;
    if (salarioNovo && antes.salarioAntes && salarioNovo !== antes.salarioAntes) {
      lancamentos.push({
        tipo: 'Alteração Salarial',
        salarioAnt: antes.salarioAntes,
        salarioNovo: salarioNovo,
        observacao: 'Gerado automaticamente pela alteração de salário em Colaboradores.'
      });
    }
    if (dadosNovos.funcao && antes.cargoAntes && dadosNovos.funcao !== antes.cargoAntes) {
      lancamentos.push({
        tipo: 'Mudança de Cargo',
        cargoAnt: antes.cargoAntes,
        cargoNovo: dadosNovos.funcao,
        observacao: `Cargo alterado de "${antes.cargoAntes}" para "${dadosNovos.funcao}" em Colaboradores.`
      });
    }
    if (dadosNovos.setor && antes.setorAntes && dadosNovos.setor !== antes.setorAntes) {
      lancamentos.push({
        tipo: 'Transferência Interna',
        setorAnt: antes.setorAntes,
        setorNovo: dadosNovos.setor,
        observacao: `Setor alterado de "${antes.setorAntes}" para "${dadosNovos.setor}" em Colaboradores.`
      });
    }

    if (!lancamentos.length) return;

    const batch = db.batch();
    lancamentos.forEach(l => {
      const ref = db.collection(col('grh_mov')).doc();
      batch.set(ref, {
        colabId,
        nome: dadosNovos.nome,
        data: hoje,
        criadoEm: new Date().toISOString(),
        automatico: true,
        ...l
      });
    });
    await batch.commit();
    _grhMov = null;
  } catch(e) { console.warn('[grhGerarMovimentacaoAutomatica]', e); }
}

async function grhExcluirColab(id, nome) {
  if (!confirm(`Excluir "${nome}" da base de colaboradores?\n\nEsta ação não pode ser desfeita.`)) return;
  await db.collection(col('grh_colabs')).doc(id).delete();
  _grhColabs = null;
  log('Colaborador excluído', nome, '🗑');
  await grhRenderColabs();
  await grhAtualizarHero();
  addNotif(`${nome} removido da base.`, 'warning');
}

// ══ ABA REMUNERAÇÃO ══
function grhNormNome(v) {
  return (v || '').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function grhContratoColab(c) {
  const clt = (c?.clt || '').toString().trim().toLowerCase();
  if (['não','nao','pj','n'].includes(clt)) return 'PJ';
  if (['sim','clt','s'].includes(clt)) return 'CLT';
  return (c?.contrato || 'CLT').toString().trim().toUpperCase() === 'PJ' ? 'PJ' : 'CLT';
}
function grhMesAtual() {
  return new Date().toISOString().slice(0,7);
}

function grhMontarBaseRemuneracao(colabs, rem, mesFiltro = '') {
  const competenciaPadrao = mesFiltro || grhMesAtual();
  const colabsBase = (colabs || []).filter(c => (c.status || 'Ativo') !== 'Inativo');
  const rems = (rem || []);

  // Vínculo confiável por colabId; nome normalizado só serve como fallback
  // para lançamentos antigos que ainda não têm colabId gravado.
  function maisRecente(atual, r, comp) {
    if (!atual) return true;
    return (comp || '').localeCompare((atual.competencia || atual.mesReferencia || '').slice(0,7)) > 0;
  }
  const remPorColabId = new Map();
  const remPorNome = new Map();
  rems.forEach(r => {
    const comp = (r.competencia || r.mesReferencia || '').slice(0,7);
    if (mesFiltro && comp !== mesFiltro) return;
    if (r.colabId) {
      if (maisRecente(remPorColabId.get(r.colabId), r, comp)) remPorColabId.set(r.colabId, r);
      return;
    }
    const key = grhNormNome(r.nome);
    if (!key) return;
    if (maisRecente(remPorNome.get(key), r, comp)) remPorNome.set(key, r);
  });

  const usadosId = new Set();
  const usadosNome = new Set();
  const base = colabsBase.map(c => {
    const key = grhNormNome(c.nome);
    const r = remPorColabId.get(c._id) || remPorNome.get(key) || null;
    if (r) { if (r.colabId) usadosId.add(r.colabId); else usadosNome.add(key); }
    // Colaboradores é a fonte da verdade para salário e contrato; o
    // lançamento de remuneração só complementa com benefícios.
    const contrato = grhContratoColab(c) === 'PJ' ? 'PJ' : 'CLT';
    const va = parseFloat(r?.va) || 0;
    const saude = parseFloat(r?.saude) || 0;
    const odonto = parseFloat(r?.odonto) || 0;
    const outros = parseFloat(r?.outros) || 0;

    // Holerite real (PDF da contabilidade) tem prioridade sobre o salário
    // cadastrado: dá o número mais próximo da folha de verdade. Usa o
    // holerite da competência filtrada, ou o mais recente se não houver filtro.
    const holerites = c.holerites || [];
    const holerite = mesFiltro
      ? holerites.find(h => h.mes === mesFiltro)
      : holerites[0]; // já vem ordenado do mais recente para o mais antigo
    const salario = holerite ? (parseFloat(holerite.bruta) || 0) : (parseFloat(c.salario) || parseFloat(r?.salario) || 0);
    const descontos = holerite ? ((parseFloat(holerite.descontoInss)||0)+(parseFloat(holerite.descontoIrrf)||0)+(parseFloat(holerite.outrosDescontos)||0)) : 0;
    const provisoes = holerite ? ((parseFloat(holerite.provisao13)||0)+(parseFloat(holerite.provisaoFerias)||0)) : 0;
    const liquida = holerite ? (parseFloat(holerite.liquida) || (salario - descontos)) : null;
    const custoTotal = holerite
      ? (salario + provisoes + va + saude + odonto + outros)
      : (parseFloat(r?.custoTotal) || (salario + va + saude + odonto + outros));

    return {
      _id: r?._id || '',
      _colabId: c._id || '',
      _origem: holerite ? 'holerite' : (r ? 'remuneracao' : 'colaboradores'),
      nome: c.nome || r?.nome || '',
      contrato,
      competencia: holerite ? holerite.mes : (r?.competencia || r?.mesReferencia || competenciaPadrao).slice(0,7),
      salario, va, saude, odonto, outros,
      liquida, descontos, provisoes,
      custoTotal,
      funcao: c.funcao || '',
      setor: c.setor || ''
    };
  });

  // Mantém lançamentos de remuneração que ainda não existem na aba Colaboradores, para não sumirem.
  rems.forEach(r => {
    const comp = (r.competencia || r.mesReferencia || '').slice(0,7);
    if (mesFiltro && comp !== mesFiltro) return;
    if (r.colabId) {
      if (usadosId.has(r.colabId) || colabsBase.some(c => c._id === r.colabId)) return;
    } else {
      const key = grhNormNome(r.nome);
      if (!key || usadosNome.has(key) || colabsBase.some(c => grhNormNome(c.nome) === key)) return;
    }
    const contrato = (r.contrato || 'CLT').toString().toUpperCase() === 'PJ' ? 'PJ' : 'CLT';
    const salario = parseFloat(r.salario) || 0;
    const va = parseFloat(r.va) || 0;
    const saude = parseFloat(r.saude) || 0;
    const odonto = parseFloat(r.odonto) || 0;
    const outros = parseFloat(r.outros) || 0;
    base.push({ ...r, contrato, competencia: comp || competenciaPadrao, salario, va, saude, odonto, outros, custoTotal: parseFloat(r.custoTotal) || (salario+va+saude+odonto+outros), _origem:'remuneracao' });
  });

  return base.sort((a,b) => (a.nome || '').localeCompare(b.nome || ''));
}

async function grhRenderRemuneracao() {
  const tbody = document.getElementById('grh-rem-body');
  if (!tbody) {
    console.warn('[grhRenderRemuneracao] tbody não encontrado');
    return;
  }

  tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--ink-60)">⏳ Carregando dados de remuneração…</td></tr>`;

  try {
    const rem = await grhGetRem();
    const colabs = await grhGetColabs().catch(err => {
      console.error('[grhRenderRemuneracao] Erro ao carregar colaboradores:', err);
      return [];
    });

    const q = (document.getElementById('grh-rem-search')?.value || '').toLowerCase();
    const mesFiltro = (document.getElementById('grh-rem-mes')?.value || '').trim();

    // Base oficial da aba: todos os colaboradores ativos cadastrados em Colaboradores, CLT + PJ.
    // Os lançamentos da coleção grh_rem apenas complementam/atualizam salário, benefícios e competência.
    const all = grhMontarBaseRemuneracao(colabs, rem, mesFiltro);

    const dados = all.filter(r => {
      const texto = `${r.nome || ''} ${r.funcao || ''} ${r.setor || ''} ${r.contrato || ''}`.toLowerCase();
      return !q || texto.includes(q);
    });

    const baseTotais = all;
    const clts = baseTotais.filter(r => r.contrato === 'CLT');
    const pjs  = baseTotais.filter(r => r.contrato === 'PJ');

    const totalFolha = baseTotais.reduce((s,r) => s+(parseFloat(r.salario)||0), 0);
    const totalCusto = baseTotais.reduce((s,r) => s+(parseFloat(r.custoTotal)||0), 0);
    const mediaCLT   = clts.length ? clts.reduce((s,r)=>s+(parseFloat(r.salario)||0),0)/clts.length : 0;
    const mediaPJ    = pjs.length  ? pjs.reduce((s,r)=>s+(parseFloat(r.salario)||0),0)/pjs.length  : 0;
    const totalVa    = baseTotais.reduce((s,r) => s+(parseFloat(r.va)||0), 0);

    const elT = id => document.getElementById(id);
    if(elT('grh-rem-total'))    elT('grh-rem-total').textContent    = grhBRL(totalFolha);
    if(elT('grh-rem-custo'))    elT('grh-rem-custo').textContent    = grhBRL(totalCusto);
    if(elT('grh-rem-media'))    elT('grh-rem-media').textContent    = grhBRL(mediaCLT);
    if(elT('grh-rem-media-pj')) elT('grh-rem-media-pj').textContent = grhBRL(mediaPJ);
    if(elT('grh-rem-va'))       elT('grh-rem-va').textContent       = grhBRL(totalVa);
    if(elT('grh-rem-ativos'))   elT('grh-rem-ativos').textContent   = baseTotais.length;
    (function(){
      const tot = baseTotais.length || 1;
      const pctC = Math.round(clts.length / tot * 100);
      const pctP = 100 - pctC;
      if(elT('grh-rem-dist-clt-bar'))   elT('grh-rem-dist-clt-bar').style.width   = pctC + '%';
      if(elT('grh-rem-dist-pj-bar'))    elT('grh-rem-dist-pj-bar').style.width    = pctP + '%';
      if(elT('grh-rem-dist-clt-label')) elT('grh-rem-dist-clt-label').textContent = 'CLT: ' + clts.length + ' (' + pctC + '%)';
      if(elT('grh-rem-dist-pj-label'))  elT('grh-rem-dist-pj-label').textContent  = 'PJ: '  + pjs.length  + ' (' + pctP + '%)';
    })();

    if (!dados.length) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--ink-60)">Nenhum resultado.</td></tr>`;
      return;
    }
    tbody.innerHTML = dados.map(r => {
      const contratoBadge = r.contrato === 'CLT'
        ? `<span style="background:#dcfce7;color:#166534;border-radius:999px;padding:3px 9px;font-size:11px;font-weight:700">CLT</span>`
        : `<span style="background:#e0f2fe;color:#075985;border-radius:999px;padding:3px 9px;font-size:11px;font-weight:700">PJ</span>`;
      const competenciaTxt = (r.competencia || r.mesReferencia || '').slice(0,7);
      const origem = r._origem === 'holerite'
        ? `<div style="font-size:10px;color:#166534;font-weight:700;margin-top:2px">💰 Holerite real</div>`
        : r._origem === 'colaboradores'
        ? `<div style="font-size:10px;color:var(--ink-30);font-weight:500;margin-top:2px">Base Colaboradores</div>` : '';
      const custoTitle = r._origem === 'holerite'
        ? `title="Inclui provisão de 13º/férias: ${grhBRL(r.provisoes||0)}"` : '';
      const editAction = r._id
        ? `grhAbrirModalRemuneracao('${r._id}')`
        : `grhAbrirModalRemuneracaoColab('${r._colabId}')`;
      const deleteBtn = r._id
        ? `<button onclick="grhExcluirRem('${r._id}','${(r.nome||'').replace(/'/g,"\\'")}' )" style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑</button>`
        : '';
      return `<tr>
      <td style="padding-left:20px;font-weight:600">${r.nome}${origem}</td>
      <td>${contratoBadge}</td>
      <td>${competenciaTxt ? competenciaTxt.split('-').reverse().join('/') : '—'}</td>
      <td style="font-weight:700;color:var(--pur-vibrant)">${grhBRL(r.salario)}</td>
      <td>${grhBRL(r.va)}</td>
      <td>${r.saude?grhBRL(r.saude):'—'}</td>
      <td>${r.odonto?grhBRL(r.odonto):'—'}</td>
      <td>${r.outros?grhBRL(r.outros):'—'}</td>
      <td style="font-weight:700" ${custoTitle}>${grhBRL(r.custoTotal)}</td>
      <td style="white-space:nowrap">
        <button onclick="${editAction}" style="border:1px solid var(--border);background:#fff;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px;margin-right:4px">✏️</button>
        ${deleteBtn}
      </td>
    </tr>`;
    }).join('');

    console.log(`[grhRenderRemuneracao] Renderizou ${dados.length} registros (filtrados de ${baseTotais.length})`);
  } catch(e) {
    console.error('[grhRenderRemuneracao] Erro fatal:', e);
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--rust)">❌ Erro: ${e.message}</td></tr>`;
  }
}

async function grhPopularSelectColabRemuneracao(nomeSelecionado) {
  const sel = document.getElementById('grh-r-colab-select');
  if (!sel) return;
  const colabs = await grhGetColabs();
  const ativos = colabs.filter(c => (c.status || 'Ativo') !== 'Inativo');
  sel.innerHTML = '<option value="">Selecione um colaborador cadastrado…</option>' +
    ativos.map(c => `<option value="${c._id}" ${grhNormNome(c.nome) === grhNormNome(nomeSelecionado||'') ? 'selected' : ''}>${c.nome}${c.funcao ? ' — ' + c.funcao : ''}</option>`).join('');
}

function grhSelecionarColabRemuneracao(colabId) {
  grhGetColabs().then(colabs => {
    const c = colabs.find(x => x._id === colabId);
    const setV = (eid, v) => { const e = document.getElementById(eid); if (e) e.value = v ?? ''; };
    if (!c) { setV('grh-r-nome',''); setV('grh-r-colabid',''); setV('grh-r-salario',''); return; }
    setV('grh-r-nome', c.nome || '');
    setV('grh-r-colabid', c._id || '');
    setV('grh-r-contrato', grhContratoColab(c));
    setV('grh-r-salario', c.salario || '');
  });
}

async function grhAbrirModalRemuneracaoColab(colabId) {
  const colabs = await grhGetColabs();
  const c = colabs.find(x => x._id === colabId);
  if (!c) return grhAbrirModalRemuneracao(null);
  await grhAbrirModalRemuneracao(null);
  await grhPopularSelectColabRemuneracao(c.nome);
  const setV  = (eid, v) => { const e = document.getElementById(eid); if(e) e.value = v ?? ''; };
  setV('grh-r-nome', c.nome || '');
  setV('grh-r-colabid', c._id || '');
  setV('grh-r-contrato', grhContratoColab(c));
  setV('grh-r-competencia', document.getElementById('grh-rem-mes')?.value || grhMesAtual());
  setV('grh-r-salario', c.salario || '');
}

async function grhAbrirModalRemuneracao(id) {
  const modal = document.getElementById('grh-modal-rem');
  const setV  = (eid, v) => { const e = document.getElementById(eid); if(e) e.value = v ?? ''; };
  const sel = document.getElementById('grh-r-colab-select');
  if (id) {
    const all = await grhGetRem();
    all.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    const r = all.find(x => x._id === id);
    if (!r) return;
    // Salário e contrato sempre vêm do cadastro real em Colaboradores, nunca
    // do lançamento antigo de remuneração — evita divergência entre as abas.
    // Prioriza vínculo por colabId; cai para nome só em lançamentos legados.
    const colabs = await grhGetColabs();
    const colab = (r.colabId && colabs.find(c => c._id === r.colabId)) ||
                  colabs.find(c => grhNormNome(c.nome) === grhNormNome(r.nome));
    document.getElementById('grh-modal-rem-title').textContent = '✏️ Editar Benefícios de Remuneração';
    document.getElementById('grh-rem-id').value = id;
    await grhPopularSelectColabRemuneracao(r.nome);
    if (sel) sel.disabled = true; // edição não reatribui o lançamento a outro colaborador
    setV('grh-r-nome',    r.nome);
    setV('grh-r-colabid', colab ? colab._id : (r.colabId || ''));
    setV('grh-r-contrato', colab ? grhContratoColab(colab) : (r.contrato || 'CLT').toUpperCase());
    setV('grh-r-competencia', (r.competencia || r.mesReferencia || '').slice(0,7));
    setV('grh-r-salario', colab ? (colab.salario || '') : r.salario);
    setV('grh-r-va',      r.va);
    setV('grh-r-saude',   r.saude);
    setV('grh-r-odonto',  r.odonto);
    setV('grh-r-outros',  r.outros);
  } else {
    document.getElementById('grh-modal-rem-title').textContent = '➕ Lançar Benefícios de Remuneração';
    document.getElementById('grh-rem-id').value = '';
    ['grh-r-nome','grh-r-colabid','grh-r-salario','grh-r-va','grh-r-saude','grh-r-odonto','grh-r-outros'].forEach(eid => setV(eid,''));
    setV('grh-r-contrato','CLT');
    setV('grh-r-competencia', document.getElementById('grh-rem-mes')?.value || grhMesAtual());
    await grhPopularSelectColabRemuneracao('');
    if (sel) sel.disabled = false;
  }
  modal.style.display = 'flex';
}

async function grhSalvarRemuneracao() {
  const id = document.getElementById('grh-rem-id').value;
  const g  = eid => document.getElementById(eid)?.value.trim() || '';
  const n  = v => parseFloat(v) || 0;
  const salario = n(g('grh-r-salario'));
  const va      = n(g('grh-r-va'));
  const saude   = n(g('grh-r-saude'));
  const odonto  = n(g('grh-r-odonto'));
  const outros  = n(g('grh-r-outros'));
  const dados = {
    nome: g('grh-r-nome'),
    colabId: g('grh-r-colabid') || null,
    contrato: (g('grh-r-contrato') || 'CLT').toUpperCase(),
    competencia: g('grh-r-competencia') || grhMesAtual(),
    salario, va, saude, odonto, outros,
    custoTotal: salario + va + saude + odonto + outros
  };
  if (!dados.nome) { alert('Nome é obrigatório.'); return; }
  try {
    if (id) {
      await db.collection(col('grh_rem')).doc(id).update(dados);
    } else {
      await db.collection(col('grh_rem')).add({ ...dados, criadoEm: new Date().toISOString() });
    }
    _grhRem = null;
    _grhColabs = null;
    grhFecharModal('grh-modal-rem');
    await grhRenderRemuneracao();
    await grhAtualizarHero();
    addNotif(`Remuneração de ${dados.nome} salva.`, 'success');
  } catch(e) { alert('Erro: ' + e.message); }
}

async function grhExcluirRem(id, nome) {
  if (!confirm(`Excluir registro de remuneração de "${nome}"?`)) return;
  await db.collection(col('grh_rem')).doc(id).delete();
  _grhRem = null;
  _grhColabs = null;
  await grhRenderRemuneracao();
}

// ══ ABA MOVIMENTAÇÕES ══
async function grhRenderMovimentacoes() {
  const tbody = document.getElementById('grh-mov-body');
  if (!tbody) return;
  try {
    const all = await grhGetMov();

    // — Popular dropdowns de Ano e Dia com valores existentes —
    const anoSel = document.getElementById('mov-filtro-ano');
    const diaSel = document.getElementById('mov-filtro-dia');
    if (anoSel && anoSel.options.length <= 1) {
      // Anos dos registros + anos fixos recentes para garantir que apareçam
      const anosFixos = ['2026','2025','2024','2023'];
      const anosRegistros = [...new Set(all.map(m => m.data ? m.data.split('-')[0] : null).filter(Boolean))];
      const anos = [...new Set([...anosFixos, ...anosRegistros])].sort().reverse();
      anos.forEach(a => { const o = document.createElement('option'); o.value = a; o.textContent = a; anoSel.appendChild(o); });
    }
    if (diaSel && diaSel.options.length <= 1) {
      for (let d = 1; d <= 31; d++) { const o = document.createElement('option'); const v = String(d).padStart(2,'0'); o.value = v; o.textContent = d; diaSel.appendChild(o); }
    }

    // — Ler filtros —
    const fDia  = document.getElementById('mov-filtro-dia')?.value  || '';
    const fMes  = document.getElementById('mov-filtro-mes')?.value  || '';
    const fAno  = document.getElementById('mov-filtro-ano')?.value  || '';
    const fTipo = document.getElementById('mov-filtro-tipo')?.value || '';
    const fOrdem = document.getElementById('mov-filtro-ordem')?.value || 'recente';

    const filtrado = all.filter(m => {
      const partes = (m.data || '').split('-'); // [ano, mes, dia]
      if (fAno  && partes[0] !== fAno)  return false;
      if (fMes  && partes[1] !== fMes)  return false;
      if (fDia  && partes[2] !== fDia)  return false;
      if (fTipo && m.tipo !== fTipo)    return false;
      return true;
    }).sort((a, b) => {
      const dataA = a.data || a.criadoEm || '';
      const dataB = b.data || b.criadoEm || '';

      const salarioAntA = parseFloat(a.salarioAnt ?? a.salarioAtual ?? a.salarioAnterior ?? 0) || 0;
      const salarioNovoA = parseFloat(a.salarioNovo ?? a.salarioProposto ?? a.novoSalario ?? 0) || 0;
      const salarioAntB = parseFloat(b.salarioAnt ?? b.salarioAtual ?? b.salarioAnterior ?? 0) || 0;
      const salarioNovoB = parseFloat(b.salarioNovo ?? b.salarioProposto ?? b.novoSalario ?? 0) || 0;

      const impactoA = Math.abs(salarioNovoA - salarioAntA);
      const impactoB = Math.abs(salarioNovoB - salarioAntB);

      const tipoA = (a.tipo || '').toLowerCase();
      const tipoB = (b.tipo || '').toLowerCase();

      if (fOrdem === 'antiga') {
        if (dataA !== dataB) return dataA.localeCompare(dataB);
        return (a.criadoEm || '').localeCompare(b.criadoEm || '');
      }

      if (fOrdem === 'maior-impacto') return impactoB - impactoA;
      if (fOrdem === 'menor-impacto') return impactoA - impactoB;

      if (fOrdem === 'promocoes') {
        const pa = tipoA.includes('promo') ? 0 : 1;
        const pb = tipoB.includes('promo') ? 0 : 1;
        if (pa !== pb) return pa - pb;
      }

      if (fOrdem === 'substituicoes') {
        const sa = tipoA.includes('substit') ? 0 : 1;
        const sb = tipoB.includes('substit') ? 0 : 1;
        if (sa !== sb) return sa - sb;
      }

      if (fOrdem === 'internas') {
        const ia = (tipoA.includes('transfer') || tipoA.includes('mudança') || tipoA.includes('mudanca') || tipoA.includes('interna')) ? 0 : 1;
        const ib = (tipoB.includes('transfer') || tipoB.includes('mudança') || tipoB.includes('mudanca') || tipoB.includes('interna')) ? 0 : 1;
        if (ia !== ib) return ia - ib;
      }

      // Padrão: mais recentes primeiro
      if (dataA !== dataB) return dataB.localeCompare(dataA);
      return (b.criadoEm || '').localeCompare(a.criadoEm || '');
    });

    const countEl = document.getElementById('mov-filtro-count');
    if (countEl) countEl.textContent = filtrado.length !== all.length ? `${filtrado.length} de ${all.length} registros` : `${all.length} registros`;

    if (!filtrado.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--ink-60)">${all.length ? 'Nenhum resultado para os filtros aplicados.' : 'Nenhuma movimentação registrada.'}</td></tr>`;
      return;
    }
    tbody.innerHTML = filtrado.map(m => `<tr>
      <td style="padding-left:20px;font-weight:600">${m.nome}</td>
      <td><span style="background:var(--pur-soft);color:var(--pur-vibrant);border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">${m.tipo}</span></td>
      <td style="font-size:12px">${grhFmt(m.data)}</td>
      <td style="color:var(--ink-60)">${m.salarioAnt?grhBRL(m.salarioAnt):'—'}</td>
      <td style="font-weight:700;color:var(--g-green)">${m.salarioNovo?grhBRL(m.salarioNovo):'—'}</td>
      <td style="font-size:12px;color:var(--ink-60);max-width:200px">${m.observacao||'—'}</td>
      <td>
        <button onclick="grhExcluirMov('${m._id}')" style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑</button>
      </td>
    </tr>`).join('');
  } catch(e) {}
}

function grhLimparFiltrosMov() {
  ['mov-filtro-dia','mov-filtro-mes','mov-filtro-ano','mov-filtro-tipo'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  const ordem = document.getElementById('mov-filtro-ordem');
  if (ordem) ordem.value = 'recente';
  grhRenderMovimentacoes();
}

// ══ AUTOCOMPLETE COLABORADOR NO MODAL DE MOVIMENTAÇÃO ══
let _movAutocompleteIdx = -1;

async function grhAutocompleteMov(q) {
  const lista = document.getElementById('grh-m-nome-lista');
  if (!lista) return;
  const termo = (q || '').toLowerCase().trim();
  if (!termo) { lista.style.display = 'none'; return; }

  const colabs = await grhGetColabs();
  // Buscar nos dois bancos: grh_colabs e grh_rem
  const rems = await grhGetRem();

  const normalizar = s => (s || '').toLowerCase().trim();
  const matches = colabs
    .filter(c => normalizar(c.nome).includes(termo))
    .slice(0, 10);

  if (!matches.length) { lista.style.display = 'none'; return; }

  _movAutocompleteIdx = -1;
  lista.style.display = 'block';
  lista.innerHTML = matches.map((c, i) => {
    // Pegar salário: primeiro de grh_colabs, depois tenta grh_rem
    const remReg = rems.find(r => normalizar(r.nome) === normalizar(c.nome));
    const sal = parseFloat(c.salario) || parseFloat(remReg?.salario) || 0;
    const salStr = sal ? grhBRL(sal) : '—';
    return `<div
      data-nome="${c.nome}"
      data-colabid="${c._id}"
      data-salario="${sal}"
      data-idx="${i}"
      onclick="grhSelecionarColabMov(this)"
      onmouseenter="grhAutocompleteHover(${i})"
      style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:13px">
      <span style="font-weight:600;color:var(--ink)">${c.nome}</span>
      <span style="font-size:11px;color:var(--ink-60);background:var(--pur-soft);padding:2px 8px;border-radius:5px">${salStr}</span>
    </div>`;
  }).join('');
}

function grhSelecionarColabMov(el) {
  const nome   = el.dataset.nome;
  const colabId = el.dataset.colabid || '';
  const salario = parseFloat(el.dataset.salario) || 0;
  document.getElementById('grh-m-nome').value = nome;
  document.getElementById('grh-m-colabid').value = colabId;
  if (salario) document.getElementById('grh-m-salant').value = salario.toFixed(2);
  document.getElementById('grh-m-nome-lista').style.display = 'none';
  _movAutocompleteIdx = -1;
  // Focar no próximo campo
  document.getElementById('grh-m-tipo').focus();
}

function grhAutocompleteHover(idx) {
  _movAutocompleteIdx = idx;
  grhAutocompleteHighlight();
}

function grhAutocompleteHighlight() {
  const lista = document.getElementById('grh-m-nome-lista');
  if (!lista) return;
  [...lista.children].forEach((el, i) => {
    el.style.background = i === _movAutocompleteIdx ? 'var(--pur-soft)' : '';
  });
}

function grhAutocompleteNav(e) {
  const lista = document.getElementById('grh-m-nome-lista');
  if (!lista || lista.style.display === 'none') return;
  const items = lista.children;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    _movAutocompleteIdx = Math.min(_movAutocompleteIdx + 1, items.length - 1);
    grhAutocompleteHighlight();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    _movAutocompleteIdx = Math.max(_movAutocompleteIdx - 1, 0);
    grhAutocompleteHighlight();
  } else if (e.key === 'Enter' && _movAutocompleteIdx >= 0) {
    e.preventDefault();
    grhSelecionarColabMov(items[_movAutocompleteIdx]);
  } else if (e.key === 'Escape') {
    lista.style.display = 'none';
  }
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', e => {
  if (!e.target.closest('#grh-modal-mov')) {
    const lista = document.getElementById('grh-m-nome-lista');
    if (lista) lista.style.display = 'none';
  }
});

function grhAbrirModalMovimentacao() {
  document.getElementById('grh-mov-id').value = '';
  ['grh-m-nome','grh-m-colabid','grh-m-salant','grh-m-salnovo','grh-m-obs'].forEach(id => {
    const e = document.getElementById(id); if(e) e.value='';
  });
  document.getElementById('grh-m-data').value = new Date().toISOString().split('T')[0];
  const lista = document.getElementById('grh-m-nome-lista');
  if (lista) lista.style.display = 'none';
  document.getElementById('grh-modal-mov').style.display = 'flex';
  setTimeout(() => document.getElementById('grh-m-nome')?.focus(), 100);
}

async function grhSalvarMovimentacao() {
  const g = eid => document.getElementById(eid)?.value.trim() || '';
  const dados = {
    nome:        g('grh-m-nome'),
    colabId:     g('grh-m-colabid') || null,
    tipo:        g('grh-m-tipo'),
    data:        g('grh-m-data'),
    salarioAnt:  parseFloat(g('grh-m-salant'))  || null,
    salarioNovo: parseFloat(g('grh-m-salnovo')) || null,
    observacao:  g('grh-m-obs'),
    criadoEm:    new Date().toISOString()
  };
  if (!dados.nome) { alert('Nome é obrigatório.'); return; }
  if (!dados.colabId) {
    if (!confirm('Este nome não corresponde a um colaborador selecionado da lista — o vínculo será feito por nome (menos confiável). Deseja continuar?')) return;
  }
  try {
    await db.collection(col('grh_mov')).add(dados);
    _grhMov = null;
    // ── Sincronizar salário na aba de colaboradores ──
    if (dados.salarioNovo) {
      await grhSincronizarSalarioColab(dados.colabId, dados.nome, dados.salarioNovo);
    }
    log('Movimentação registrada', `${dados.tipo} — ${dados.nome}`, '🔄');
    grhFecharModal('grh-modal-mov');
    await grhRenderMovimentacoes();
    addNotif(`Movimentação registrada: ${dados.tipo} de ${dados.nome}.`, 'success');
  } catch(e) { alert('Erro: ' + e.message); }
}

// ── Sincronizar salário do colaborador após movimentação ──
// Prioriza vínculo por colabId (confiável); cai para correspondência por
// nome apenas quando a movimentação não tem colabId (registros legados).
async function grhSincronizarSalarioColab(colabId, nomeMovimentacao, novoSalario) {
  try {
    const normalizar = s => (s || '').toLowerCase().replace(/\s+/g,' ').trim();
    const nomeNorm = normalizar(nomeMovimentacao);
    let atualizou = [];

    // 1. Atualizar grh_colabs
    const colabs = await grhGetColabs(true);
    const colab = (colabId && colabs.find(c => c._id === colabId)) ||
                  colabs.find(c => normalizar(c.nome) === nomeNorm) ||
                  colabs.find(c => normalizar(c.nome).includes(nomeNorm) || nomeNorm.includes(normalizar(c.nome)));
    if (colab) {
      await db.collection(col('grh_colabs')).doc(colab._id).update({ salario: novoSalario });
      _grhColabs = null;
      atualizou.push('Colaboradores');
    }

    // 2. Atualizar grh_rem — campo salario + recalcula custoTotal
    const rems = await grhGetRem(true);
    const rem = (colab && rems.find(r => r.colabId === colab._id)) ||
                rems.find(r => normalizar(r.nome) === nomeNorm) ||
                rems.find(r => normalizar(r.nome).includes(nomeNorm) || nomeNorm.includes(normalizar(r.nome)));
    if (rem) {
      const va     = parseFloat(rem.va)     || 0;
      const saude  = parseFloat(rem.saude)  || 0;
      const odonto = parseFloat(rem.odonto) || 0;
      const outros = parseFloat(rem.outros) || 0;
      const novoCustoTotal = novoSalario + va + saude + odonto + outros;
      await db.collection(col('grh_rem')).doc(rem._id).update({ salario: novoSalario, custoTotal: novoCustoTotal });
      _grhRem = null;
      atualizou.push('Remuneração');
    }

    // 3. Re-renderizar abas e hero
    if (atualizou.includes('Colaboradores')) await grhRenderColabs();
    if (atualizou.includes('Remuneração'))   await grhRenderRemuneracao();
    await grhAtualizarHero();

    if (atualizou.length) {
      addNotif(`💰 Salário de ${nomeMovimentacao} atualizado para ${grhBRL(novoSalario)} em: ${atualizou.join(' e ')}.`, 'success');
    }
  } catch(e) { console.warn('Sync salário falhou:', e); }
}

// ── Baixar modelo de planilha para movimentações ──
function grhBaixarModeloMovimentacoes() {
  if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }
  const ws = XLSX.utils.aoa_to_sheet([
    ['Colaborador', 'Motivo', 'Mês', 'Salário Atual', 'Salário Proposto', 'Cargo Atual', 'Cargo Proposto', 'Alteração', 'Substituir'],
    ['Maria Silva', 'Promoção Interna', '2026-05-01', 3500.00, 4200.00, 'Analista Jr', 'Analista Pl', '', ''],
    ['João Costa',  'Ajuste Salarial',  '2026-05-01', 2800.00, 3100.00, 'Assistente', 'Assistente', 'Mérito por performance', ''],
    ['Ana Lima',    'Transferência',    '2026-05-01', 3200.00, 3200.00, 'Suporte',    'Suporte N3', '', ''],
  ]);
  ws['!cols'] = [{wch:30},{wch:22},{wch:14},{wch:16},{wch:18},{wch:18},{wch:18},{wch:26},{wch:22}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Movimentações');
  XLSX.writeFile(wb, 'modelo-movimentacoes.xlsx');
  log('Modelo baixado', 'Template de movimentações exportado', '⬇️');
}


// ══ IMPORTAR MOVIMENTAÇÕES VIA PLANILHA ══
async function grhImportarMovimentacoes(input) {
  const file = input.files[0];
  if (!file) return;
  input.value = '';

  // Mapeamento de motivos da planilha → tipos do sistema
  const tipoMap = {
    'promoção interna':        'Promoção',
    'promoção':                'Promoção',
    'mérito':                  'Promoção',
    'ajuste salarial':         'Ajuste Salarial',
    'aumento':                 'Ajuste Salarial',
    'transferência':           'Transferência de Setor',
    'remanejamento':           'Transferência de Setor',
    'mudança de cargo':        'Mudança de Cargo',
    'substituição':            'Substituição',
    'substituicao':            'Substituição',
    'substitui':               'Substituição',
    'admissão':                'Outro',
    'movimentação interna':    'Transferência de Setor',
    'aumento de quadro':       'Outro',
  };

  function mapTipo(motivo) {
    if (!motivo) return 'Outro';
    const m = motivo.toLowerCase();
    for (const [key, val] of Object.entries(tipoMap)) {
      if (m.includes(key)) return val;
    }
    return 'Outro';
  }

  // Converter serial Excel → data ISO
  function excelDateToISO(serial) {
    if (!serial || isNaN(serial)) return '';
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }

  if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' });

      // Encontrar aba Movimentações (case-insensitive)
      const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('movimenta'));
      if (!sheetName) {
        alert('Aba "Movimentações" não encontrada na planilha.'); return;
      }

      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!rows.length) { alert('Nenhum dado encontrado na aba Movimentações.'); return; }

      // Mapeamento de colunas (case-insensitive)
      const normalize = s => String(s).toLowerCase().trim();
      const keys = Object.keys(rows[0]);

      const colMap = {};
      keys.forEach(k => {
        const n = normalize(k);
        if (n.includes('colaborador') && !n.includes('substituir')) colMap.colaborador = k;
        else if (n.includes('substituir')) colMap.substituto = k;
        else if (n.includes('motivo'))     colMap.motivo = k;
        else if (n.includes('mês') || n === 'mes' || n === 'mÊs') colMap.mes = k;
        else if (n.includes('salario atual') || n.includes('salário atual')) colMap.salAnt = k;
        else if (n.includes('salario proposto') || n.includes('salário proposto')) colMap.salNovo = k;
        else if (n.includes('cargo atual'))    colMap.cargoAnt = k;
        else if (n.includes('cargo proposto')) colMap.cargoNovo = k;
        else if (n.includes('alteração') || n.includes('alteracao')) colMap.alteracao = k;
      });

      // Filtrar linhas válidas (precisam ter ao menos colaborador ou substituto)
      const validas = rows.filter(r => {
        const nome = r[colMap.colaborador] || r[colMap.substituto] || '';
        return nome.toString().trim() !== '' &&
               nome.toString().trim().toUpperCase() !== 'NOVO CARGO / AUMENTO DE QUADRO' &&
               nome.toString().trim().toUpperCase() !== 'PROMOÇÃO' &&
               nome.toString().trim().toUpperCase() !== 'PROMOCAO';
      });

      if (!validas.length) { alert('Nenhuma movimentação válida encontrada.'); return; }

      const confirmar = confirm(`Importar ${validas.length} movimentação(ões) da aba "${sheetName}"?

Obs: Registros sem nome de colaborador serão ignorados.`);
      if (!confirmar) return;

      addNotif('⏳ Importando movimentações...', 'info');

      let ok = 0, erros = 0;
      for (const row of validas) {
        try {
          const nome = (row[colMap.colaborador] || row[colMap.substituto] || '').toString().trim();
          const motivo = (row[colMap.motivo] || '').toString().trim();
          const tipo = mapTipo(motivo);
          const dataISO = excelDateToISO(row[colMap.mes]);
          const salAnt = parseFloat(row[colMap.salAnt]) || null;
          const salNovo = parseFloat(row[colMap.salNovo]) || null;

          // Montar observação com contexto rico
          const partes = [];
          if (motivo) partes.push(motivo);
          if (row[colMap.substituto] && row[colMap.colaborador] &&
              row[colMap.substituto] !== row[colMap.colaborador])
            partes.push('Substitui: ' + row[colMap.substituto]);
          if (row[colMap.cargoAnt] && row[colMap.cargoNovo])
            partes.push(row[colMap.cargoAnt] + ' → ' + row[colMap.cargoNovo]);
          else if (row[colMap.cargoAnt]) partes.push('Cargo anterior: ' + row[colMap.cargoAnt]);
          if (row[colMap.alteracao]) partes.push('Alteração: ' + row[colMap.alteracao]);

          const dados = {
            nome, tipo,
            data: dataISO,
            salarioAnt: salAnt,
            salarioNovo: salNovo,
            observacao: partes.join(' | '),
            criadoEm: new Date().toISOString()
          };

          await db.collection(col('grh_mov')).add(dados);
          // ── Sincronizar salário se houver novo salário ──
          if (salNovo) {
            await grhSincronizarSalarioColab(nome, salNovo);
          }
          ok++;
        } catch(err) { erros++; }
      }

      _grhMov = null;
      await grhRenderMovimentacoes();
      log('Importação Movimentações', `${ok} registros importados`, '📤');
      addNotif(`✅ ${ok} movimentação(ões) importada(s)${erros ? ` | ${erros} erro(s)` : ''}.`, 'success');
    } catch(err) {
      alert('Erro ao processar planilha: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

async function grhExcluirMov(id) {
  if (!confirm('Excluir esta movimentação?')) return;
  await db.collection(col('grh_mov')).doc(id).delete();
  _grhMov = null;
  await grhRenderMovimentacoes();
}

// ══ ABA DESLIGAMENTOS ══
let _deslSortCol = 'data', _deslSortDir = -1; // -1 = desc, 1 = asc

function grhDeslOrdenar(col) {
  if (_deslSortCol === col) { _deslSortDir *= -1; }
  else { _deslSortCol = col; _deslSortDir = col === 'data' ? -1 : 1; }
  grhRenderDesligamentos();
}

function grhLimparFiltrosDesl() {
  const ids = ['grh-desl-search','grh-desl-filter-mes','grh-desl-filter-ano','grh-desl-filter-motivo'];
  ids.forEach(id => { const e = document.getElementById(id); if(e) e.value=''; });
  grhRenderDesligamentos();
}

async function grhRenderDesligamentos() {
  const tbody = document.getElementById('grh-desl-body');
  if (!tbody) return;
  try {
    const all = await grhGetDesl();

    // Popular anos dinamicamente
    const selAno = document.getElementById('grh-desl-filter-ano');
    if (selAno && selAno.options.length <= 1) {
      const anos = [...new Set(all.map(d => (d.dataDesligamento||'').slice(0,4)).filter(Boolean))].sort((a,b)=>b-a);
      anos.forEach(a => { const o = document.createElement('option'); o.value=a; o.textContent=a; selAno.appendChild(o); });
    }

    // Leitura dos filtros
    const q      = (document.getElementById('grh-desl-search')?.value    || '').toLowerCase();
    const fMes   =  document.getElementById('grh-desl-filter-mes')?.value  || '';
    const fAno   =  document.getElementById('grh-desl-filter-ano')?.value  || '';
    const fMotiv =  document.getElementById('grh-desl-filter-motivo')?.value || '';

    let dados = [...all];

    if (q)      dados = dados.filter(d => (d.nome||'').toLowerCase().includes(q) || (d.setor||'').toLowerCase().includes(q));
    if (fMes)   dados = dados.filter(d => (d.dataDesligamento||'').slice(5,7) === fMes);
    if (fAno)   dados = dados.filter(d => (d.dataDesligamento||'').slice(0,4) === fAno);
    if (fMotiv) dados = dados.filter(d => d.motivo === fMotiv);

    // Ordenação
    dados.sort((a, b) => {
      let va, vb;
      if (_deslSortCol === 'data') {
        va = a.dataDesligamento || '';
        vb = b.dataDesligamento || '';
      } else {
        va = (a.nome||'').toLowerCase();
        vb = (b.nome||'').toLowerCase();
      }
      if (!va && !vb) return 0;
      if (!va) return 1;
      if (!vb) return -1;
      return va < vb ? -_deslSortDir : va > vb ? _deslSortDir : 0;
    });

    // Indicadores de ordenação
    ['nome','data'].forEach(c => {
      const el = document.getElementById(`grh-desl-sort-${c}`);
      if (!el) return;
      el.textContent = _deslSortCol === c ? (_deslSortDir === -1 ? '↓' : '↑') : '';
    });

    // Contador
    const countEl = document.getElementById('grh-desl-count');
    if (countEl) countEl.textContent = `${dados.length} de ${all.length} desligamentos`;

    if (!dados.length) {
      tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--ink-60)">Nenhum resultado encontrado.</td></tr>`;
      return;
    }
    tbody.innerHTML = dados.map(d => {
      const brl = v => v ? 'R$ ' + Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}) : '—';
      const ctrBadge = d.contrato === 'CLT'
        ? `<span style="background:#dcfce7;color:#166534;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">CLT</span>`
        : d.contrato
          ? `<span style="background:#fef9c3;color:#854d0e;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">${d.contrato}</span>`
          : '—';
      return `<tr>
        <td style="padding-left:20px;font-weight:600">${d.nome}</td>
        <td style="font-size:12px">${grhFmt(d.dataAdmissao)||'—'}</td>
        <td style="font-size:12px;font-weight:600;color:var(--rust-dark)">${grhFmt(d.dataDesligamento)||'—'}</td>
        <td><span style="background:var(--g-pink-s);color:var(--rust-dark);border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">${d.motivo||'—'}</span></td>
        <td style="font-size:12px">${d.setor||'—'}</td>
        <td>${ctrBadge}</td>
        <td style="font-size:12px;color:var(--ink-60)">${d.tempoEmpresa||'—'}</td>
        <td style="font-weight:600;color:var(--rust-dark)">${brl(d.rescisao)}</td>
        <td style="font-size:12px">${brl(d.multaFgts)}</td>
        <td style="font-size:12px;color:var(--ink-60);max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${(d.observacao||'').replace(/"/g,"'")}">${d.observacao||'—'}</td>
        <td>
          <button onclick="grhExcluirDesl('${d._id}')" style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑</button>
        </td>
      </tr>`;
    }).join('');
  } catch(e) {
    // Firestore sem permissão — usa dados de demonstração
    const demo = [
      { _id:'d1', nome:'Carlos Mendes',   dataAdmissao:'2021-03-10', dataDesligamento:'2024-02-28', motivo:'Pedido de demissão',      setor:'Comercial',  contrato:'CLT', tempoEmpresa:'2 anos 11 meses', rescisao:8400,  multaFgts:1260, observacao:'Saiu para empreender' },
      { _id:'d2', nome:'Fernanda Lopes',  dataAdmissao:'2020-07-01', dataDesligamento:'2024-05-15', motivo:'Demissão sem justa causa', setor:'Financeiro', contrato:'CLT', tempoEmpresa:'3 anos 10 meses', rescisao:12600, multaFgts:1890, observacao:'Reestruturação do setor' },
      { _id:'d3', nome:'Ricardo Souza',   dataAdmissao:'2022-01-15', dataDesligamento:'2024-08-01', motivo:'Término de contrato',      setor:'TI',         contrato:'PJ',  tempoEmpresa:'2 anos 6 meses',  rescisao:0,     multaFgts:0,    observacao:'Projeto encerrado' },
      { _id:'d4', nome:'Patrícia Alves',  dataAdmissao:'2019-05-20', dataDesligamento:'2023-11-30', motivo:'Aposentadoria',            setor:'RH',         contrato:'CLT', tempoEmpresa:'4 anos 6 meses',  rescisao:21000, multaFgts:3150, observacao:'' },
      { _id:'d5', nome:'Marcos Oliveira', dataAdmissao:'2021-09-01', dataDesligamento:'2024-01-10', motivo:'Demissão por justa causa', setor:'Suporte',    contrato:'CLT', tempoEmpresa:'2 anos 4 meses',  rescisao:0,     multaFgts:0,    observacao:'Falta grave' },
    ];
    _grhDesl = demo;
    const brl = v => v ? 'R$ ' + Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}) : '—';
    tbody.innerHTML = demo.map(d => {
      const ctrBadge = d.contrato === 'CLT'
        ? `<span style="background:#dcfce7;color:#166534;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">CLT</span>`
        : `<span style="background:#fef9c3;color:#854d0e;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">${d.contrato}</span>`;
      return `<tr>
        <td style="padding-left:20px;font-weight:600">${d.nome}</td>
        <td style="font-size:12px">${grhFmt(d.dataAdmissao)||'—'}</td>
        <td style="font-size:12px;font-weight:600;color:var(--rust-dark)">${grhFmt(d.dataDesligamento)||'—'}</td>
        <td><span style="background:var(--g-pink-s,#fce7f3);color:var(--rust-dark,#b91c1c);border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">${d.motivo||'—'}</span></td>
        <td style="font-size:12px">${d.setor||'—'}</td>
        <td>${ctrBadge}</td>
        <td style="font-size:12px;color:var(--ink-60)">${d.tempoEmpresa||'—'}</td>
        <td style="font-weight:600;color:var(--rust-dark)">${brl(d.rescisao)}</td>
        <td style="font-size:12px">${brl(d.multaFgts)}</td>
        <td style="font-size:12px;color:var(--ink-60)">${d.observacao||'—'}</td>
        <td><button style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑</button></td>
      </tr>`;
    }).join('');
    const countEl = document.getElementById('grh-desl-count');
    if(countEl) countEl.textContent = `${demo.length} de ${demo.length} desligamentos`;
  }
}

// Abre o modal manualmente (botão ➕ Registrar)
function grhAbrirModalDesligamento() {
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('grh-desl-id').value       = '';
  document.getElementById('grh-desl-colab-id').value = '';
  document.getElementById('grh-desl-aviso').style.display = 'none';
  ['grh-d-nome','grh-d-admissao','grh-d-setor','grh-d-obs','grh-d-rescisao','grh-d-fgts']
    .forEach(id => { const e = document.getElementById(id); if(e) e.value=''; });
  document.getElementById('grh-d-data').value     = hoje;
  document.getElementById('grh-d-contrato').value = '';
  document.getElementById('grh-d-motivo').value   = 'Demissão sem justa causa';
  document.getElementById('grh-modal-desl').style.display = 'flex';
}

// Abre pré-preenchido a partir do colaborador que virou Inativo
function grhAbrirModalDesligamentoPorInativo(colabId, colab) {
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('grh-desl-id').value           = '';
  document.getElementById('grh-desl-colab-id').value     = colabId;
  document.getElementById('grh-desl-aviso').style.display = 'block';
  document.getElementById('grh-d-nome').value            = colab.nome       || '';
  document.getElementById('grh-d-admissao').value        = colab.admissao   || '';
  document.getElementById('grh-d-setor').value           = colab.setor      || '';
  document.getElementById('grh-d-contrato').value        = colab.clt === 'Sim' ? 'CLT' : (colab.clt === 'Não' ? 'PJ' : '');
  document.getElementById('grh-d-data').value            = hoje;
  document.getElementById('grh-d-motivo').value          = 'Demissão sem justa causa';
  document.getElementById('grh-d-obs').value             = '';
  document.getElementById('grh-d-rescisao').value        = '';
  document.getElementById('grh-d-fgts').value            = '';
  document.getElementById('grh-modal-desl').style.display = 'flex';
}

// Cancela: se veio de Inativo, reverte o status do colaborador para Ativo
async function grhCancelarModalDesl() {
  const colabId = document.getElementById('grh-desl-colab-id').value;
  if (colabId) {
    // Usuário abriu o modal por ter marcado Inativo mas cancelou — reverte
    try {
      await db.collection(col('grh_colabs')).doc(colabId).update({ status: 'Ativo' });
      _grhColabs = null;
      await grhRenderColabs();
      addNotif('Status revertido para Ativo — desligamento cancelado.', 'info');
    } catch(e) {}
  }
  grhFecharModal('grh-modal-desl');
}

async function grhSalvarDesligamento() {
  const g = eid => document.getElementById(eid)?.value.trim() || '';
  const colabId = document.getElementById('grh-desl-colab-id').value;

  // Calcular tempo de empresa
  let tempoEmpresa = '';
  const admStr = g('grh-d-admissao'), deslStr = g('grh-d-data');
  if (admStr && deslStr) {
    const adm  = new Date(admStr), desl = new Date(deslStr);
    const meses = (desl.getFullYear() - adm.getFullYear()) * 12 + (desl.getMonth() - adm.getMonth());
    const anos  = Math.floor(meses / 12), mesesRest = meses % 12;
    tempoEmpresa = anos > 0 ? `${anos}ano${anos>1?'s':''}, ${mesesRest}m` : `${mesesRest} mês(es)`;
  }

  const dados = {
    nome:             g('grh-d-nome'),
    dataAdmissao:     g('grh-d-admissao'),
    dataDesligamento: g('grh-d-data'),
    motivo:           g('grh-d-motivo'),
    setor:            g('grh-d-setor'),
    contrato:         g('grh-d-contrato'),
    rescisao:         parseFloat(g('grh-d-rescisao')) || null,
    multaFgts:        parseFloat(g('grh-d-fgts'))     || null,
    tempoEmpresa,
    observacao:       g('grh-d-obs'),
    criadoEm:         new Date().toISOString()
  };
  if (!dados.nome) { alert('Nome é obrigatório.'); return; }

  // Verificar se já existe desligamento para esse colaborador
  const snapDesl = await db.collection(col('grh_desl')).where('nome','==',dados.nome).get();
  if (!snapDesl.empty) {
    if (!confirm(`Já existe um desligamento registrado para "${dados.nome}". Deseja registrar outro?`)) return;
  }

  try {
    await db.collection(col('grh_desl')).add(dados);
    _grhDesl = null;

    // Se veio de um colaborador Inativo: garante status Inativo e esconde da lista ativa
    if (colabId) {
      await db.collection(col('grh_colabs')).doc(colabId).update({ status: 'Inativo' });
      _grhColabs = null;
    }

    log('Desligamento registrado', `${dados.nome} — ${dados.motivo}`, '🚪');
    grhFecharModal('grh-modal-desl');
    await grhRenderDesligamentos();
    await grhRenderColabs();
    await grhRenderAdmissao();
    await grhAtualizarHero();
    addNotif(`🚪 ${dados.nome} desligado e movido para a aba Desligamentos.`, 'warning');
  } catch(e) { alert('Erro: ' + e.message); }
}


// ══════════════════════════════════════════════════════
// IMPORTAR ADMISSÕES VIA PLANILHA
// ══════════════════════════════════════════════════════
async function grhImportarAdmissoes(input) {
  const file = input.files[0];
  if (!file) return;
  input.value = '';

  function excelDateToISO(val) {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    const n = Number(val);
    if (!isNaN(n) && n > 1000) return new Date(Math.round((n-25569)*86400*1000)).toISOString().split('T')[0];
    if (String(val).match(/\d{4}-\d{2}-\d{2}/)) return String(val).slice(0,10);
    return '';
  }

  function parseSalario(val) {
    if (!val) return null;
    // Se já é número (vindo do XLSX como float), usar direto
    if (typeof val === 'number') return val;
    // Se é string, limpar formatação BR: "R$ 2.839,81" → 2839.81
    const s = String(val).replace(/R\$\s*/g,'').trim()
      .replace(/\.(\d{3})/g, '$1')  // remove separador de milhar
      .replace(',', '.');             // troca vírgula decimal por ponto
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });

      // Localizar aba de Admissão
      const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('admiss'));
      if (!sheetName) { alert('Aba "Admissão" não encontrada.'); return; }

      const ws = wb.Sheets[sheetName];
      // Linha 1 = título "ADMISSÃO", linha 2 = headers reais → lemos bruto e detectamos o header
      const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      const headerRowIdx = rawRows.findIndex(r =>
        r.some(c => String(c).toLowerCase().includes('colaborador') || String(c).toLowerCase() === 'nome')
      );
      if (headerRowIdx === -1) { alert('Cabeçalho não encontrado na planilha.'); return; }
      const headers = rawRows[headerRowIdx].map(h => String(h).trim());
      const rows = rawRows.slice(headerRowIdx + 1)
        .filter(r => r.some(c => String(c).trim() !== ''))
        .map(r => { const o = {}; headers.forEach((h,i) => { o[h] = r[i] ?? ''; }); return o; });
      if (!rows.length) { alert('Nenhum dado encontrado.'); return; }

      // Mapear colunas dinamicamente
      const normalize = s => String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').trim();
      const keys = Object.keys(rows[0]);
      const colMap = {};
      keys.forEach(k => {
        const n = normalize(k);
        if (n === 'colaboradores' || n === 'nome')  colMap.nome = k;
        else if (n.includes('admiss'))              colMap.admissao = k;
        else if (n.includes('fun'))                 colMap.funcao = k;
        else if (n.includes('contrato'))            colMap.contrato = k;
        else if (n.includes('sal'))                 colMap.salario = k;
      });

      // Filtrar linhas válidas
      const validas = rows.filter(r => {
        const nome = String(r[colMap.nome] || '').trim();
        return nome.length > 1;
      });

      if (!validas.length) { alert('Nenhuma admissão válida encontrada.'); return; }

      if (!confirm(`Importar ${validas.length} admissão(ões) da aba "${sheetName}"?

Cada registro será adicionado como novo colaborador (status Ativo).`)) return;

      addNotif('⏳ Importando admissões...', 'info');
      let ok = 0, duplicados = 0, erros = 0;

      // Carregar todos os colaboradores existentes para verificar duplicatas
      const snapExist = await db.collection(col('grh_colabs')).get();
      const nomesExistentes = new Set(
        snapExist.docs.map(d => String(d.data().nome || '').trim().toLowerCase())
      );

      for (const row of validas) {
        try {
          const nome     = String(row[colMap.nome] || '').trim();
          const admISO   = excelDateToISO(row[colMap.admissao]);
          const funcao   = String(row[colMap.funcao] || '').trim();
          const contrato = String(row[colMap.contrato] || '').trim();
          const salario  = parseSalario(row[colMap.salario]);
          const clt      = contrato.toUpperCase() === 'CLT' ? 'Sim' : 'Não';

          // Verificar duplicata pelo nome (case-insensitive)
          if (nomesExistentes.has(nome.toLowerCase())) {
            duplicados++;
            continue; // Pular — colaborador já existe na base
          }

          // calcular 45 e 90 dias a partir da admissão
          let d45 = '', d90 = '';
          if (admISO) {
            const base = new Date(admISO);
            const dt45 = new Date(base); dt45.setDate(dt45.getDate() + 45);
            const dt90 = new Date(base); dt90.setDate(dt90.getDate() + 90);
            d45 = dt45.toISOString().split('T')[0];
            d90 = dt90.toISOString().split('T')[0];
          }
          const dados = {
            nome,
            admissao:  admISO,
            funcao,
            clt,
            salario,
            d45,
            d90,
            status:    'Ativo',
            manual:    true,
            criadoEm:  new Date().toISOString()
          };

          await db.collection(col('grh_colabs')).add(dados);
          nomesExistentes.add(nome.toLowerCase()); // evitar duplicata dentro do próprio lote
          ok++;
        } catch(err) { erros++; }
      }

      _grhColabs = null;
      await grhRenderAdmissao();
      await grhRenderColabs();
      await grhAtualizarHero();
      log('Importação Admissões', `${ok} novos, ${duplicados} já existiam`, '📤');
      const msgDup = duplicados ? ` | ${duplicados} já existia(m) na base (ignorado(s))` : '';
      addNotif(`✅ ${ok} admissão(ões) importada(s)${msgDup}${erros ? ` | ${erros} erro(s)` : ''}.`, 'success');
    } catch(err) {
      alert('Erro ao processar planilha: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

// ══════════════════════════════════════════════════════
// IMPORTAR DESLIGAMENTOS VIA PLANILHA
// ══════════════════════════════════════════════════════
async function grhImportarDesligamentos(input) {
  const file = input.files[0];
  if (!file) return;
  input.value = '';

  function excelDateToISO(val) {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    const n = Number(val);
    if (!isNaN(n) && n > 1000) return new Date(Math.round((n-25569)*86400*1000)).toISOString().split('T')[0];
    if (String(val).match(/\d{4}-\d{2}-\d{2}/)) return String(val).slice(0,10);
    return '';
  }

  function parseSalario(val) {
    if (!val) return null;
    // Se já é número (vindo do XLSX como float), usar direto
    if (typeof val === 'number') return val;
    // Se é string, limpar formatação BR: "R$ 2.839,81" → 2839.81
    const s = String(val).replace(/R\$\s*/g,'').trim()
      .replace(/\.(\d{3})/g, '$1')  // remove separador de milhar
      .replace(',', '.');             // troca vírgula decimal por ponto
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });

      // Localizar aba de Desligamento
      const sheetName = wb.SheetNames.find(n =>
        n.toLowerCase().includes('deslig') || n.toLowerCase().includes('demiss')
      );
      if (!sheetName) { alert('Aba "Desligamento" não encontrada.'); return; }

      const ws = wb.Sheets[sheetName];
      // Linha 1 = título "DESLIGAMENTOS", linha 2 = headers reais
      const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      const headerRowIdx = rawRows.findIndex(r =>
        r.some(c => String(c).toLowerCase() === 'nome' || String(c).toLowerCase() === 'motivo')
      );
      if (headerRowIdx === -1) { alert('Cabeçalho não encontrado na planilha.'); return; }
      const headers = rawRows[headerRowIdx].map(h => String(h).trim());
      const rows = rawRows.slice(headerRowIdx + 1)
        .filter(r => r.some(c => String(c).trim() !== ''))
        .map(r => { const o = {}; headers.forEach((h,i) => { o[h] = r[i] ?? ''; }); return o; });
      if (!rows.length) { alert('Nenhum dado encontrado.'); return; }

      // Mapear colunas
      const normalize = s => String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').trim();
      const keys = Object.keys(rows[0]);
      const colMap = {};
      keys.forEach(k => {
        const n = normalize(k);
        if (n === 'nome' || n === 'colaboradores')       colMap.nome = k;
        else if (n.includes('desl'))                     colMap.dataDesl = k;  // "Desligamento" ou "Data Desligamento"
        else if (n.includes('admiss'))                   colMap.dataAdm = k;
        else if (n === 'motivo')                         colMap.motivo = k;
        else if (n.includes('setor'))                    colMap.setor = k;
        else if (n.includes('contrato'))                 colMap.contrato = k;
        else if (n.includes('coment') || n.includes('obs')) colMap.obs = k;
        else if (n.includes('rescis'))                   colMap.rescisao = k;
        else if (n.includes('multa') || n === 'fgts')   colMap.multa = k;
        else if (n.includes('tempo'))                    colMap.tempo = k;
      });

      // Filtrar linhas válidas — precisa ter Nome preenchido
      const validas = rows.filter(r => {
        const nome = String(r[colMap.nome] || '').trim();
        return nome.length > 1;
      });

      if (!validas.length) { alert('Nenhum desligamento válido encontrado.'); return; }

      if (!confirm(`Importar ${validas.length} desligamento(s) da aba "${sheetName}"?`)) return;

      addNotif('⏳ Importando desligamentos...', 'info');
      let ok = 0, erros = 0;

      for (const row of validas) {
        try {
          const nome        = String(row[colMap.nome] || '').trim();
          const dataDesl    = excelDateToISO(row[colMap.dataDesl]);
          const dataAdm     = excelDateToISO(row[colMap.dataAdm]);
          const motivo      = String(row[colMap.motivo] || '').trim() || 'Não informado';
          const setor       = String(row[colMap.setor]  || '').trim();
          const contrato    = String(row[colMap.contrato] || '').trim();
          const obs         = String(row[colMap.obs]    || '').trim();
          const rescisao    = parseSalario(row[colMap.rescisao]);
          const multa       = parseSalario(row[colMap.multa]);
          const tempoEmp    = String(row[colMap.tempo]  || '').trim();

          // Montar observação rica
          const partes = [];
          if (obs)       partes.push(obs);
          if (setor)     partes.push('Setor: ' + setor);
          if (contrato)  partes.push('Contrato: ' + contrato);
          if (dataAdm)   partes.push('Admissão: ' + dataAdm);
          if (tempoEmp)  partes.push('Tempo: ' + tempoEmp);
          if (rescisao)  partes.push('Rescisão: R$ ' + rescisao.toLocaleString('pt-BR', {minimumFractionDigits:2}));
          if (multa)     partes.push('Multa FGTS: R$ ' + multa.toLocaleString('pt-BR', {minimumFractionDigits:2}));

          const dados = {
            nome,
            dataAdmissao:     dataAdm,
            dataDesligamento: dataDesl,
            motivo,
            setor,
            contrato,
            tempoEmpresa:     tempoEmp,
            rescisao,
            multaFgts:        multa,
            observacao:       obs,
            criadoEm:         new Date().toISOString()
          };

          await db.collection(col('grh_desl')).add(dados);
          ok++;
        } catch(err) { erros++; }
      }

      _grhDesl = null;
      await grhRenderDesligamentos();
      await grhRenderAdmissao();
      log('Importação Desligamentos', `${ok} registros importados`, '📤');
      addNotif(`✅ ${ok} desligamento(s) importado(s)${erros ? ` | ${erros} erro(s)` : ''}.`, 'success');
    } catch(err) {
      alert('Erro ao processar planilha: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

async function grhExcluirDesl(id) {
  if (!confirm('Excluir este registro de desligamento?')) return;
  await db.collection(col('grh_desl')).doc(id).delete();
  _grhDesl = null;
  await grhRenderDesligamentos();
  await grhRenderEnderecos();
  await grhRenderAdmissao();
}

// ══ NAVEGAÇÃO ENTRE ABAS ══
function grhTab(aba, btn) {
  _grhTabAtiva = aba;
  ['colaboradores','remuneracao','movimentacoes','desligamentos','enderecos','admissao','importar-base','ferias'].forEach(a => {
    const pane = document.getElementById('grh-pane-' + a);
    if (pane) pane.style.display = a === aba ? 'block' : 'none';
  });
  document.querySelectorAll('#grh-tabs .tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Callbacks por aba
  if (aba === 'importar-base') { _cacheColabs = null; renderColabs(); updateColStats(); }
  if (aba === 'ferias')        { renderRH(); if (!politicaState) politicaCarregar(); }
}

// ══ EXPORTAÇÃO EXCEL ══
async function grhExportarExcel() {
  try {
    const cols = await grhGetColabs();
    const rem  = await grhGetRem();
    const mov  = await grhGetMov();
    const desl = await grhGetDesl();

    if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }
    const wb = XLSX.utils.book_new();

    // Aba colaboradores
    const colData = [
      ['Nome','Matrícula','E-mail','Função','Setor','CLT','Nascimento','Admissão','Tempo Empresa','Salário','Status'],
      ...cols.map(c => [c.nome,c.matricula,c.email,c.funcao,c.setor,c.clt,
        grhFmt(c.nascimento),grhFmt(c.admissao),grhTempoEmpresa(c.admissao),c.salario||'',c.status])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(colData), 'Colaboradores');

    // Aba remuneração
    const remData = [
      ['Nome','Salário Base','VA/VR','Plano Saúde','Odonto','Outros','Custo Total'],
      ...rem.map(r => [r.nome,r.salario,r.va,r.saude,r.odonto,r.outros,r.custoTotal])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(remData), 'Remuneração');

    // Aba movimentações
    const movData = [
      ['Nome','Tipo','Data','Salário Anterior','Novo Salário','Observação'],
      ...mov.map(m => [m.nome,m.tipo,grhFmt(m.data),m.salarioAnt||'',m.salarioNovo||'',m.observacao||''])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(movData), 'Movimentações');

    // Aba desligamentos
    const deslData = [
      ['Nome','Data','Motivo','Observação'],
      ...desl.map(d => [d.nome,grhFmt(d.dataDesligamento),d.motivo,d.observacao||''])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(deslData), 'Desligamentos');

    XLSX.writeFile(wb, `Gestao_RH_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.xlsx`);
    log('Exportação Excel — Gestão RH', `${cols.length} colaboradores`, '📊');
    addNotif('Planilha Gestão RH exportada com sucesso!', 'success');
  } catch(e) { alert('Erro ao exportar: ' + e.message); }
}

// ══════════════════════════════════════════
// ADMIN MASTER
// ══════════════════════════════════════════
const ADMIN_PASS = 'FlowAdmin@2025'; // Senha do admin master

function abrirAdmin() {
  const senha = prompt('Senha do Admin Master:');
  if (!senha) return;
  if (senha !== ADMIN_PASS) { alert('Senha incorreta.'); return; }
  document.getElementById('adminScreen').style.display = 'flex';
  adminCarregarUsuarios();
}

function adminLogout() {
  document.getElementById('adminScreen').style.display = 'none';
}

async function adminCriarUsuario() {
  const nome     = document.getElementById('adNome').value.trim();
  const email    = document.getElementById('adEmail').value.trim();
  const senha    = document.getElementById('adSenha').value;
  const role     = document.getElementById('adRole').value;
  const unidade  = document.getElementById('adUnidade').value;
  const msg      = document.getElementById('adMsg');

  const show = (txt, ok) => {
    msg.textContent = txt;
    msg.style.display = 'block';
    msg.style.background = ok ? '#d1fae5' : '#fee2e2';
    msg.style.color = ok ? '#065f46' : '#991b1b';
  };

  if (!nome || !email || !senha) { show('❌ Preencha todos os campos.', false); return; }
  if (senha.length < 6) { show('❌ Senha deve ter mínimo 6 caracteres.', false); return; }

  try {
    const apiKey = firebaseConfig.apiKey;
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password: senha, returnSecureToken: true})
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const uid = data.localId;
    await db.collection('users').doc(uid).set({
      uid, nome, email, role, unidade,
      criadoEm: new Date().toISOString(),
      criadoPor: 'admin'
    });

    show(`✅ Usuário ${nome} criado na unidade ${unidade === 'xpert' ? 'Xpert' : 'Meta'}!`, true);
    document.getElementById('adNome').value = '';
    document.getElementById('adEmail').value = '';
    document.getElementById('adSenha').value = '';
    adminCarregarUsuarios();
  } catch(e) {
    const msgs = {
      'EMAIL_EXISTS': '❌ E-mail já cadastrado.',
      'INVALID_EMAIL': '❌ E-mail inválido.',
    };
    show(msgs[e.message] || '❌ Erro: ' + e.message, false);
  }
}

async function adminCarregarUsuarios() {
  const metaEl   = document.getElementById('adMetaList');
  const xpertEl  = document.getElementById('adXpertList');
  const metaCt   = document.getElementById('adMetaCount');
  const xpertCt  = document.getElementById('adXpertCount');
  if (!metaEl || !xpertEl) return;

  metaEl.innerHTML  = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';
  xpertEl.innerHTML = '<div class="empty"><div class="ei">⏳</div>Carregando...</div>';

  try {
    const snap = await db.collection('users').get();
    const all = snap.docs.map(d => d.data());
    const meta  = all.filter(u => !u.unidade || u.unidade === 'meta');
    const xpert = all.filter(u => u.unidade === 'xpert');

    const roleLabel = {colaborador:'👤 Colaborador', gestor:'👔 Gestor', rh:'🏢 RH'};

    const renderList = (users) => users.length === 0
      ? '<div class="empty"><div class="ei">👤</div>Nenhum usuário</div>'
      : users.map(u => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border);gap:8px">
          <div style="min-width:0">
            <div style="font-weight:700;font-size:13px">${u.nome}</div>
            <div style="font-size:11px;color:var(--ink-60)">${u.email}</div>
            <span style="font-size:11px;background:var(--pur-mid);color:var(--pur-dark);border-radius:5px;padding:2px 7px;font-weight:600">${roleLabel[u.role]||u.role}</span>
          </div>
          <button onclick="adminRemoverUsuario('${u.uid}','${u.email}')" style="border:1px solid #fca5a5;background:#fef2f2;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px;flex-shrink:0">🗑</button>
        </div>`).join('');

    metaEl.innerHTML  = renderList(meta);
    xpertEl.innerHTML = renderList(xpert);
    if (metaCt)  metaCt.textContent  = meta.length  + ' usuário(s)';
    if (xpertCt) xpertCt.textContent = xpert.length + ' usuário(s)';
  } catch(e) {
    metaEl.innerHTML = `<div class="empty">❌ ${e.message}</div>`;
  }
}

async function adminRemoverUsuario(uid, email) {
  if (!confirm(`Remover o usuário ${email}?`)) return;
  try {
    await db.collection('users').doc(uid).delete();
    adminCarregarUsuarios();
  } catch(e) {
    alert('Erro ao remover: ' + e.message);
  }
}
