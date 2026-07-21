// ===== script: patch-definitivo-1a5-js =====
(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  const COLAB_ALLOWED = new Set(['intranet','estrutura-carreira','pesquisas','beneficios','solicitacao','conecta-ai','ouvidoria','gamificacao','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento','desenvolvimento']);
  const GESTOR_ALLOWED = new Set(['intranet','estrutura-carreira','solicitacao','gestor','pesquisas','beneficios','conecta-ai','ouvidoria','gamificacao','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento','desenvolvimento']);
  const RH_ALLOWED = new Set(['intranet','gestao-rh','usuarios','dashboard','auditoria','pesquisas','beneficios','conecta-ai','ouvidoria','gamificacao','estrutura-carreira','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento','desenvolvimento','gestor','solicitacao','pdi']);
  const META = {intranet:['🏠','Intranet'],'estrutura-carreira':['🏢','Estrutura e Carreira'],gamificacao:['🏆','Gamificação'],'gestao-rh':['🏢','Gestão RH'],beneficios:['🎁','Meus Benefícios'],pesquisas:['📋','Pesquisas'],solicitacao:['🌴','Férias'],ouvidoria:['📢','Ouvidoria'],'conecta-ai':['🤖','Conecta AI'],dashboard:['📊','Dashboard RH'],auditoria:['📝','Auditoria'],usuarios:['🔑','Gestão de Acessos'],gestor:['👔','Gestor']};

  // Causa de um loop infinito real (RangeError: Maximum call stack size
  // exceeded em sbNav/navegar/gestaoRhCarregar): esta função e a `role()`
  // de 23-legacy.js liam fontes DIFERENTES para decidir o papel atual —
  // esta priorizava sessionStorage/localStorage (que podem ficar
  // desatualizados entre sessões/testes), enquanto 23-legacy.js prioriza as
  // variáveis vivas (window._roleAtivo/_roleReal/role, atualizadas a cada
  // login). Quando as duas discordavam, uma função redirecionava
  // 'gestao-rh'→'intranet' achando que não é RH, e a outra redirecionava
  // 'intranet'→'gestao-rh' achando que é — um ping-pong sem fim. Agora as
  // duas leem a MESMA fonte, na mesma ordem de prioridade.
  // REMOVED: Consolidated in 000-core-functions.js
  // function roleAtual(){
  //   const vivo = String(window._roleAtivo || window._roleReal || window.role || '').toLowerCase().trim();
  //   if(['rh','gestor','colaborador'].includes(vivo)) return vivo;
  //   if(vivo === 'rh-colaborador') return 'rh';
  //   const p = (sessionStorage.getItem('imexPreferredRole') || sessionStorage.getItem('userRole') || sessionStorage.getItem('role') || localStorage.getItem('imexPreferredRole') || localStorage.getItem('role') || '').toLowerCase();
  //   if(['rh','gestor','colaborador'].includes(p)) return p;
  //   const label = (($('pLabel')||{}).textContent || '').toLowerCase();
  //   if(label.includes('rh')) return 'rh';
  //   if(label.includes('gestor')) return 'gestor';
  //   return 'colaborador';
  // }
  // REMOVED: Consolidated in 000-core-functions.js
  // window.roleAtual = roleAtual;

  function allowedSet(){ const r=roleAtual(); return r==='rh'?RH_ALLOWED:(r==='gestor'?GESTOR_ALLOWED:COLAB_ALLOWED); }
  function isAllowed(id){ return allowedSet().has(id); }

  function estruturaHTML(){ return `
    <div class="hero"><div><div class="h-eyebrow">Estrutura & Carreira</div><h1>ESTRUTURA E CARREIRA</h1><p>Organograma, gestor direto, equipe, departamento, trilhas de carreira, competências, cursos recomendados e evolução profissional.</p></div></div>
    <div class="stats-row"><div class="sc"><div class="sc-lbl">Cargo atual</div><div class="sc-num" style="font-size:24px">Analista</div><div class="sc-sub">Função cadastrada no RH</div></div><div class="sc"><div class="sc-lbl">Próximo cargo</div><div class="sc-num" style="font-size:24px">Pleno</div><div class="sc-sub">Trilha sugerida</div></div><div class="sc"><div class="sc-lbl">Evolução</div><div class="sc-num">80%</div><div class="sc-sub">Competências mapeadas</div></div></div>
    <div class="cg"><div class="card"><div class="card-head"><div class="cht"><h2>🏢 Organograma</h2><p>Gestor direto, equipe, departamento e estrutura hierárquica.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-head"><div class="ri-name">Gestor direto</div><span class="badge bb">RH</span></div><div class="ri-meta"><span class="ri-m">Departamento: <strong>Recursos Humanos</strong></span><span class="ri-m">Equipe: <strong>Administrativo</strong></span></div></div><div class="ri-item"><div class="ri-head"><div class="ri-name">Estrutura hierárquica</div></div><div class="ri-meta"><span class="ri-m">Diretoria → Coordenação → Analistas → Assistentes</span></div></div></div></div><div class="card"><div class="card-head"><div class="cht"><h2>🚀 Trilhas de Carreira</h2><p>Cargo atual, próximo cargo, competências e cursos recomendados.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-head"><div class="ri-name">Cargo atual: Analista de RH Jr</div><span class="badge ba">80%</span></div><div class="ri-meta"><span class="ri-m">Próximo cargo: <strong>Analista de RH Pleno</strong></span></div></div><div class="ri-item"><div class="ri-head"><div class="ri-name">Competências necessárias</div></div><div class="ri-meta"><span class="ri-m">Comunicação, Recrutamento, Endomarketing e Liderança</span></div></div><div class="ri-item"><div class="ri-head"><div class="ri-name">Cursos recomendados</div></div><div class="ri-meta"><span class="ri-m">People Analytics, Gestão de Indicadores e Liderança</span></div></div></div></div></div>`; }

  function gamificacaoHTML(){ return `
    <div class="hero"><div><div class="h-eyebrow">Engajamento & Reconhecimento</div><h1>🏆 GAMIFICAÇÃO</h1><p>Ranking, pontos, medalhas, missões, conquistas, recompensas e evolução do colaborador.</p></div><div class="h-stats"><div class="h-stat"><span class="h-num">8.450</span><span class="h-lbl">Pontos</span></div><div class="h-stat"><span class="h-num">#3</span><span class="h-lbl">Ranking</span></div><div class="h-stat"><span class="h-num">12</span><span class="h-lbl">Medalhas</span></div></div></div>
    <div class="stats-row"><div class="sc"><div class="sc-lbl">Ranking geral</div><div class="sc-num">#3</div><div class="sc-sub">Posição geral</div></div><div class="sc"><div class="sc-lbl">Ranking mensal</div><div class="sc-num">#1</div><div class="sc-sub">Destaque do mês</div></div><div class="sc"><div class="sc-lbl">Progresso</div><div class="sc-num">72%</div><div class="sc-sub">Próximo nível</div></div></div>
    <div class="card" style="margin-bottom:18px"><div class="card-head"><div class="cht"><h2>📈 Evolução do colaborador</h2><p>Barra de progresso para o próximo nível.</p></div></div><div class="card-body"><div style="height:14px;background:#e5e7eb;border-radius:999px;overflow:hidden"><div style="height:100%;width:72%;background:#0047FF;border-radius:999px"></div></div><div class="ri-meta" style="margin-top:10px"><span class="ri-m">Nível atual: <strong>Especialista</strong></span><span class="ri-m">Faltam <strong>550 pontos</strong> para o próximo nível</span></div></div></div>
    <div class="cg"><div class="card"><div class="card-head"><div class="cht"><h2>🎯 Desafios e Missões</h2><p>Atividades que geram pontos.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-head"><div class="ri-name">Responder pesquisa interna</div><span class="badge ba">+50 pts</span></div></div><div class="ri-item"><div class="ri-head"><div class="ri-name">Curtir/comentar comunicado</div><span class="badge bb">+10 pts</span></div></div><div class="ri-item"><div class="ri-head"><div class="ri-name">Concluir curso recomendado</div><span class="badge bp">+120 pts</span></div></div></div></div><div class="card"><div class="card-head"><div class="cht"><h2>🏅 Medalhas, Histórico e Recompensas</h2><p>Conquistas e loja de reconhecimento.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-head"><div class="ri-name">Medalhas conquistadas</div><span class="badge ba">12</span></div><div class="ri-meta"><span class="ri-m">Comunicador, Colaborador Ativo, Top Pesquisa</span></div></div><div class="ri-item"><div class="ri-head"><div class="ri-name">Histórico de pontuação</div></div><div class="ri-meta"><span class="ri-m">+50 Pesquisa • +10 Interação • +120 Curso</span></div></div><div class="ri-item"><div class="ri-head"><div class="ri-name">Recompensas disponíveis</div></div><div class="ri-meta"><span class="ri-m">Café especial, certificado interno, destaque no mural</span></div></div></div></div></div>`; }

  function mainArea(){ return document.querySelector('.main-area') || document.getElementById('appShell') || document.body; }
  function reparentViews(){
    const host = mainArea();
    if(!host) return;
    const views = Array.from(document.querySelectorAll('div[id^="view-"],section[id^="view-"]'));
    views.forEach(v=>{ if(v.parentElement !== host) host.appendChild(v); });
  }
  function ensureView(id, html){
    reparentViews();
    let v = $('view-'+id);
    if(!v){ v=document.createElement('div'); v.id='view-'+id; v.className='page'; mainArea().appendChild(v); }
    v.classList.add('page');
    const clean = (v.textContent||'').replace(/\s+/g,'').trim();
    if(clean.length < 40) v.innerHTML = html;
    return v;
  }
  function ensureModule(id){
    if(id==='estrutura-carreira') return ensureView(id, estruturaHTML());
    if(id==='gamificacao') return ensureView(id, gamificacaoHTML());
    reparentViews();
    return $('view-'+id);
  }
  function updateTopbar(id){
    const meta = META[id] || META.intranet;
    const title = document.querySelector('.t-title'); if(title) title.textContent = meta[1];
    const icon = document.querySelector('.t-page-icon'); if(icon) icon.textContent = meta[0];
    const p = $('pLabel'); if(p) p.textContent = roleAtual()==='rh'?'RH':(roleAtual()==='gestor'?'Gestor':'Colaborador');
  }
  function applySidebarPermissions(){
    const allowed = allowedSet();
    document.querySelectorAll('.sb-item[id^="sb-"]').forEach(item=>{
      const id = item.id.replace(/^sb-/,'');
      item.style.display = allowed.has(id) ? '' : 'none';
      item.classList.toggle('active', false);
    });
    const grh = $('sb-gestao-rh'); if(grh && roleAtual()!=='rh') grh.style.setProperty('display','none','important');
  }
  function showOnly(id){
    reparentViews();
    document.querySelectorAll('div[id^="view-"],section[id^="view-"]').forEach(v=>{ v.style.setProperty('display','none','important'); v.classList.remove('active'); });
    const v = ensureModule(id);
    if(v){ v.style.setProperty('display','block','important'); v.classList.add('active'); }
    document.querySelectorAll('.sb-item[id^="sb-"]').forEach(i=>i.classList.remove('active'));
    const sb = $('sb-'+id); if(sb) sb.classList.add('active');
    updateTopbar(id);
  }
  const originalSbNav = window.sbNav;
  window.sbNav = function(id){
    id = String(id||'intranet').trim();
    if(!isAllowed(id)) id = 'intranet';
    if(roleAtual()!=='rh' && ['gestao-rh','rh','dashboard','auditoria','usuarios'].includes(id)) id = 'intranet';
    try{ if(typeof originalSbNav === 'function' && id !== 'estrutura-carreira' && id !== 'gamificacao') originalSbNav(id); }catch(e){ console.warn('[PATCH 1-5] navegação original ignorada:', e); }
    showOnly(id);
    return false;
  };
  window.switchView = window.sbNav;
  window.gestaoRhCarregar = async function(){ if(roleAtual()!=='rh') return window.sbNav('intranet'); if(typeof window.voltarGestaoRHSeguro==='function') return window.voltarGestaoRHSeguro(); return showOnly('gestao-rh'); };
  const originalRenderGestaoRH = window.renderGestaoRH;
  window.renderGestaoRH = function(){ if(roleAtual()!=='rh') return window.sbNav('intranet'); if(typeof originalRenderGestaoRH==='function') return originalRenderGestaoRH.apply(this, arguments); };

  function boot(){
    reparentViews();
    ensureModule('gamificacao');
    ensureModule('estrutura-carreira');
    applySidebarPermissions();
    const initial = roleAtual()==='rh' ? 'gestao-rh' : 'intranet';
    if(roleAtual()!=='rh'){
      const grh = $('view-gestao-rh'); if(grh){grh.style.setProperty('display','none','important'); grh.classList.remove('active');}
    }
    showOnly(initial);
    console.log('[PATCH 1-5] Correções aplicadas: perfil ✓ intranet ✓ gamificação ✓ estrutura ✓');
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  [150,500,1200,2500].forEach(t=>setTimeout(boot,t));
})();

