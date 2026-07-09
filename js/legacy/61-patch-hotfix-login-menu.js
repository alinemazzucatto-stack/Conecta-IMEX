// ===== script: patch-hotfix-login-menu-js =====
(function(){
  'use strict';

  const META = {
    intranet:['🏠','Intranet'],
    gamificacao:['🏆','Gamificação'],
    'estrutura-carreira':['🏢','Estrutura e Carreira'],
    beneficios:['🎁','Meus Benefícios'],
    solicitacao:['🌴','Férias'],
    pesquisas:['📋','Pesquisas'],
    ouvidoria:['📢','Ouvidoria'],
    'conecta-ai':['🤖','Conecta AI'],
    mais:['📦','Mais'],
    gestor:['👔','Gestor'],
    'gestao-rh':['🏢','Gestão RH'],
    dashboard:['📊','Dashboard RH'],
    auditoria:['📝','Auditoria'],
    'roadmap-produto':['🚀','Roadmap do Produto']
  };

  const MENU = {
    colaborador:['intranet','gamificacao','estrutura-carreira','mais','ouvidoria'],
    gestor:['intranet','gamificacao','estrutura-carreira','solicitacao','gestor','pesquisas','beneficios','ouvidoria','conecta-ai'],
    rh:['gestao-rh','dashboard','ouvidoria','conecta-ai','auditoria','roadmap-produto']
  };

  function $(id){ return document.getElementById(id); }

  function selectedLoginRole(){
    return (document.querySelector('#loginRoleGrid .role-btn.selected')?.dataset.role || window.loginRole || sessionStorage.getItem('imexPreferredRole') || 'colaborador').toLowerCase();
  }

  function setRole(r){
    r = ['rh','gestor','colaborador'].includes(String(r).toLowerCase()) ? String(r).toLowerCase() : 'colaborador';
    window.role = r;
    window.loginRole = r;
    window.selectedRole = r;
    window.currentUserRole = r;
    window._roleReal = r;
    try{
      sessionStorage.setItem('imexPreferredRole', r);
      sessionStorage.setItem('userRole', r);
      localStorage.setItem('imexPreferredRole', r);
      localStorage.setItem('role', r);
    }catch(e){}
    document.body.classList.remove('role-rh','role-gestor','role-colaborador');
    document.body.classList.add('role-'+r);
    const label = $('pLabel'); if(label) label.textContent = r === 'rh' ? 'RH' : (r === 'gestor' ? 'Gestor' : 'Colaborador');
    const dot = $('pDot'); if(dot) dot.textContent = r === 'rh' ? '🏢' : (r === 'gestor' ? '👔' : '👤');
    const unidade = $('pUnidade'); if(unidade && r !== 'rh') unidade.textContent = '🏢 Meta';
    return r;
  }

  // REMOVED: Consolidated in 000-core-functions.js
  // function roleAtual(){
  //   const r = String(window.currentUserRole || window.selectedRole || window.role || sessionStorage.getItem('imexPreferredRole') || sessionStorage.getItem('userRole') || 'colaborador').toLowerCase();
  //   if(r.includes('rh')) return 'rh';
  //   if(r.includes('gestor')) return 'gestor';
  //   return 'colaborador';
  // }
  // REMOVED: Consolidated in 000-core-functions.js
  // window.roleAtual = roleAtual;

  window.selectRole = function(r, btn){
    setRole(r);
    document.querySelectorAll('#loginRoleGrid .role-btn').forEach(b=>b.classList.remove('selected'));
    if(btn) btn.classList.add('selected');
  };

  function sidebar(){ return $('sidebar') || document.querySelector('.sidebar'); }
  function host(){ return document.querySelector('.main-area') || $('appShell') || document.body; }

  function createItem(id){
    const el = document.createElement('div');
    el.className = 'sb-item';
    el.id = 'sb-'+id;
    el.dataset.menuId = id;
    const m = META[id] || ['•', id];
    el.title = m[1];
    el.innerHTML = '<span>'+m[0]+'</span><span class="sb-tip">'+m[1]+'</span>';
    el.onclick = function(ev){ if(ev) ev.preventDefault(); return navigate(id); };
    return el;
  }

  function renderMenu(){
    const s = sidebar();
    if(!s) return;
    const r = roleAtual();
    const order = MENU[r] || MENU.colaborador;

    let logo = s.querySelector('.sb-logo');
    if(!logo){
      logo = document.createElement('div');
      logo.className = 'sb-logo';
      logo.textContent = 'IMEX';
    }

    let spacer = s.querySelector('.sb-spacer');
    if(!spacer){ spacer = document.createElement('div'); spacer.className = 'sb-spacer'; }

    let divider = s.querySelector('.sb-divider');
    if(!divider){ divider = document.createElement('div'); divider.className = 'sb-divider'; }

    let sair = s.querySelector('#sb-sair') || s.querySelector('[onclick*="doLogout"], [onclick*="logout"], [onclick*="Sair"]');
    if(!sair){
      sair = document.createElement('div');
      sair.className = 'sb-item';
      sair.id = 'sb-sair';
      sair.innerHTML = '<span>🚪</span><span class="sb-tip">Sair</span>';
      sair.onclick = function(){ if(typeof window.doLogout === 'function') return window.doLogout(); };
    }

    const frag = document.createDocumentFragment();
    frag.appendChild(logo);
    order.forEach(id => frag.appendChild(createItem(id)));
    frag.appendChild(spacer);
    frag.appendChild(divider);
    frag.appendChild(sair);
    s.replaceChildren(frag);
  }

  function ensureView(id){
    let v = $('view-'+id);
    if(!v){
      v = document.createElement('div');
      v.id = 'view-'+id;
      v.className = 'page';
      v.style.display = 'none';
      host().appendChild(v);
    }
    if(v.parentElement !== host()) host().appendChild(v);
    return v;
  }

  function ensureBasicContent(id){
    if(id === 'gamificacao'){
      const v = ensureView(id);
      if((v.textContent || '').trim().length < 30){
        v.innerHTML = '<div class="hero"><div><div class="h-eyebrow">Engajamento & Reconhecimento</div><h1>🏆 GAMIFICAÇÃO</h1><p>Ranking, pontos, medalhas, desafios, missões, recompensas e evolução do colaborador.</p></div></div><div class="stats-row"><div class="sc"><div class="sc-lbl">Ranking geral</div><div class="sc-num">#3</div><div class="sc-sub">Posição geral</div></div><div class="sc"><div class="sc-lbl">Ranking mensal</div><div class="sc-num">#1</div><div class="sc-sub">Destaque do mês</div></div><div class="sc"><div class="sc-lbl">Pontos</div><div class="sc-num">8450</div><div class="sc-sub">Pontuação total</div></div></div>';
      }
    }
    if(id === 'estrutura-carreira'){
      const v = ensureView(id);
      v.innerHTML = '<div class="hero"><div><div class="h-eyebrow">Estrutura & Carreira · Fase 1</div><h1>ESTRUTURA E CARREIRA</h1><p>Visualize o organograma, sua equipe e trilhas de carreira. Os demais recursos ficam na Fase 2 do Roadmap.</p></div></div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px"><div class="card"><div class="card-head"><div class="cht"><h2>🏢 Organograma</h2><p>Estrutura hierárquica, gestor direto, diretoria, departamento e unidade.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Gestor direto</div><div class="ri-meta"><span class="ri-m">Departamento: <strong>Recursos Humanos</strong></span><span class="ri-m">Unidade: <strong>IMEX</strong></span></div></div></div></div><div class="card"><div class="card-head"><div class="cht"><h2>👥 Minha Equipe</h2><p>Gestor imediato, integrantes, cargos, e-mails e ramais.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Equipe</div><div class="ri-meta"><span class="ri-m">Integrantes e contatos internos</span></div></div></div></div><div class="card"><div class="card-head"><div class="cht"><h2>🚀 Trilhas de Carreira</h2><p>Cargo atual, próximo cargo, competências, cursos e evolução.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Analista de RH Jr → Pleno</div><div class="ri-meta"><span class="ri-m">Evolução: <strong>80%</strong></span></div></div></div></div></div>';
    }
  }

  function allowed(id){
    return (MENU[roleAtual()] || MENU.colaborador).includes(id);
  }

  function navigate(id){
    id = String(id || '').trim() || (roleAtual() === 'rh' ? 'gestao-rh' : 'intranet');
    if(!allowed(id)) id = roleAtual() === 'rh' ? 'gestao-rh' : 'intranet';

    ensureBasicContent(id);

    document.querySelectorAll('div[id^="view-"],section[id^="view-"]').forEach(v=>{
      if(v.parentElement !== host()) host().appendChild(v);
      v.classList.remove('active');
      v.style.setProperty('display','none','important');
    });

    const v = ensureView(id);
    v.classList.add('active');
    v.style.setProperty('display','block','important');

    document.querySelectorAll('#sidebar .sb-item').forEach(i=>i.classList.remove('active'));
    const item = $('sb-'+id); if(item) item.classList.add('active');

    const m = META[id] || META.intranet;
    const title = document.querySelector('.t-title'); if(title) title.textContent = m[1];
    const icon = document.querySelector('.t-page-icon'); if(icon) icon.textContent = m[0];

    if(id === 'estrutura-carreira' && typeof window.renderEstruturaCarreira === 'function') window.renderEstruturaCarreira();

    return false;
  }

  window.sbNav = navigate;
  window.switchView = navigate;
  window.buildSidebar = renderMenu;
  window.renderSidebar = renderMenu;
  window.atualizarSidebar = renderMenu;

  // REMOVIDO (auditoria de segurança): esta função `enterApp` fabricava uma
  // sessão de usuário só com o texto digitado no campo de e-mail, SEM
  // verificar senha nenhuma no Firebase Auth, e era atribuída diretamente a
  // `window.doLogin`/`window.entrarDemo`. Hoje quem define a versão real de
  // `doLogin` é `js/modules/login-auth.js` (carregado depois, sobrescreve
  // esta), então esta função fake nunca executa na ordem atual — mas por ser
  // um login sem senha, deixá-la aqui era um risco grave: bastava um script
  // carregar fora de ordem, ou `login-auth.js` falhar ao carregar, para
  // qualquer pessoa entrar no sistema (inclusive como RH) digitando só um
  // e-mail. `doLogin`/`entrarDemo` não são mais tocados neste arquivo — a
  // única fonte de autenticação é `login-auth.js`.

  function init(){
    setRole(selectedLoginRole());
    renderMenu();
    const btn = $('lBtn');
    if(btn){
      btn.disabled = false;
      btn.style.pointerEvents = 'auto';
    }
    const login = $('loginScreen');
    const shell = $('appShell');
    if(login && getComputedStyle(login).display !== 'none' && shell) shell.style.setProperty('display','none','important');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  setTimeout(init, 100);
  setTimeout(init, 500);
})();
