// ===== script: (sem id) =====
(function(){
  if(window.__roteadorFinalInstalado) return;
  window.__roteadorFinalInstalado = true;

  /* ── helpers ── */
  // REMOVED: Consolidated in 000-core-functions.js
  // function role(){ return String(window._roleAtivo||window._roleReal||window.role||sessionStorage.getItem('userRole')||'colaborador').toLowerCase(); }
  // REMOVED: Consolidated in 000-core-functions.js
  // function isRH(){ const r=role(); return r==='rh'||r==='rh-colaborador'; }
  function topbar(icon,label){
    const pi=document.getElementById('tPageIcon'); if(pi) pi.textContent=icon;
    const pt=document.getElementById('tPageTitle'); if(pt) pt.textContent=label;
  }
  function getView(id){
    let v=document.getElementById('view-'+id);
    if(!v){ v=document.createElement('div'); v.id='view-'+id; v.className='page'; (document.querySelector('.main-area')||document.body).appendChild(v); }
    return v;
  }
  function hideAll(){
    document.querySelectorAll('[id^="view-"]').forEach(el=>{ el.classList.remove('active'); el.style.setProperty('display','none','important'); });
    const hero=document.getElementById('mainHero'); if(hero) hero.style.setProperty('display','none','important');
  }
  function showView(id){
    hideAll();
    const v=getView(id);
    v.style.setProperty('display','block','important');
    v.classList.add('active');
    document.querySelectorAll('.sb-item').forEach(el=>el.classList.remove('active'));
    const sbId = (isRH() && ['experiencia','disc','cargos','trilhas','pdi','mapeamento-talentos'].includes(id)) ? 'desenvolvimento-talentos' : id;
    const sb=document.getElementById('sb-'+sbId); if(sb) sb.classList.add('active');
  }

  /* ── meta ── */
  const META = {
    'intranet':['🏠','Intranet'], 'estrutura-carreira':['🏢','Estrutura e Carreira'],
    'desenvolvimento':['🌱','Desenvolvimento'], 'pesquisas':['📋','Pesquisas'],
    'beneficios':['🎁','Meus Benefícios'], 'solicitacao':['🌴','Férias'],
    'conecta-ai':['🤖','Conecta AI'], 'ouvidoria':['📢','Ouvidoria'],
    'gestao-rh':['🏢','Gestão RH'], 'desenvolvimento-talentos':['🌱','Desenvolvimento & Talentos'],
    'dashboard':['📊','Dashboard RH'], 'auditoria':['📝','Auditoria'],
    'disc':['🧠','DISC'], 'pdi':['🎯','PDI'], 'trilhas':['🚀','Trilhas de Carreira'],
    'experiencia':['📆','Experiência'], 'cargos':['📄','Descritivo de Cargos'],
    'organograma':['🏢','Organograma'], 'meu-desenvolvimento':['✨','Meu Desenvolvimento'],
    'mapeamento-talentos':['📈','Mapeamento de Talentos'], 'gestor':['👔','Gestão de Equipe'],
    'rh':['🏢','RH'], 'calendario':['📅','Calendário'], 'usuarios':['🔑','Gestão de Acessos'],
    'colaboradores':['👥','Colaboradores'], 'mais':['📦','Mais']
  };

  /* ── loaders: chamados APÓS showView ── */
  function loadView(id){
    try {
      if(id==='intranet'           && typeof window.intraCarregar==='function')    window.intraCarregar();
      if(id==='solicitacao'        && typeof window.updateResumo==='function')     window.updateResumo();
      if(id==='gestor'             && typeof window.renderGestor==='function')     window.renderGestor();
      if(id==='rh'                 && typeof window.renderRH==='function')         { window.renderRH(); if(!window.politicaState && typeof window.politicaCarregar==='function') window.politicaCarregar(); }
      if(id==='gestao-rh'          && typeof window.gestaoRhCarregar==='function') window.gestaoRhCarregar();
      if(id==='dashboard'          && typeof window.renderDash==='function')       window.renderDash();
      if(id==='auditoria'          && typeof window.renderAudit==='function')      window.renderAudit();
      if(id==='ouvidoria'          && typeof window.ouvidoriaCarregar==='function') window.ouvidoriaCarregar();
      if(id==='pesquisas'          && typeof window.pesqCarregar==='function')     window.pesqCarregar();
      if(id==='disc'               && typeof window.discCarregar==='function')     window.discCarregar();
      if(id==='pdi'                && typeof window.pdiCarregar==='function')      window.pdiCarregar();
      if(id==='trilhas'            && typeof window.trilhasCarregar==='function')  window.trilhasCarregar();
      if(id==='experiencia'        && typeof window.expCarregar==='function')      window.expCarregar();
      if(id==='cargos'             && typeof window.cargosCarregar==='function')   window.cargosCarregar();
      if(id==='organograma'        && typeof window.orgCarregar==='function')      window.orgCarregar();
      if(id==='beneficios'         && typeof window.benCarregar==='function')      window.benCarregar();
      if(id==='conecta-ai'         && typeof window.carregarTemasAI==='function') window.carregarTemasAI();
      if(id==='usuarios'           && typeof window.carregarUsuarios==='function') window.carregarUsuarios();
      if(id==='calendario'         && typeof window.renderCal==='function')        window.renderCal();
      if(id==='meu-desenvolvimento'&& typeof window.renderMeuDesenvolvimento==='function') window.renderMeuDesenvolvimento();
      if(id==='colaboradores'      && typeof window.renderColabs==='function')     { window.renderColabs(); if(typeof window.updateColStats==='function') window.updateColStats(); }
    } catch(e){ console.warn('[roteador] erro ao carregar', id, e); }
  }

  /* ── ACCESS ── */
  const ORDER_COLAB   = ['intranet','estrutura-carreira','desenvolvimento','mais','ouvidoria'];
  const ORDER_GESTOR  = ['intranet','estrutura-carreira','desenvolvimento','pesquisas','beneficios','solicitacao','conecta-ai','ouvidoria','gestor'];
  const ORDER_RH      = ['gestao-rh','desenvolvimento-talentos','pesquisas','dashboard','ouvidoria','conecta-ai','auditoria'];
  const ACCESS = {
    colaborador: [...ORDER_COLAB,'organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento','pesquisas','beneficios','solicitacao','conecta-ai'],
    gestor:      [...ORDER_GESTOR,'organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento'],
    rh:          [...ORDER_RH,'experiencia','disc','cargos','trilhas','pdi','mapeamento-talentos','organograma','usuarios','colaboradores','rh','gestao-rh'],
    'rh-colaborador': [...ORDER_RH,'experiencia','disc','cargos','trilhas','pdi','mapeamento-talentos','organograma','usuarios','colaboradores','rh','gestao-rh']
  };

  /* ── roteador principal ── */
  // REMOVED: Consolidated in 000-core-functions.js
  // function navegar(id){
  //   const r = role();
  //   const allowed = ACCESS[r] || ACCESS.colaborador;
  //   if(!allowed.includes(id)) id = isRH() ? 'gestao-rh' : 'intranet';
  //   const meta = META[id] || ['▫️', id];
  //   showView(id);
  //   topbar(meta[0], meta[1]);
  //   loadView(id);
  //   // Bloqueia ações RH-only para colaboradores
  //   if(!isRH() && typeof window.aplicarBloqueioColaborador==='function'){
  //     setTimeout(window.aplicarBloqueioColaborador, 80);
  //   }
  // }

  /* ── menu sidebar ── */
  // REMOVED: Consolidated in 000-core-functions.js
  // function aplicarMenu(){
  //   const r = role();
  //   const order = r==='rh'||r==='rh-colaborador' ? ORDER_RH : (r==='gestor' ? ORDER_GESTOR : ORDER_COLAB);
  //   const sidebar = document.getElementById('sidebar');
  //   if(!sidebar) return;
  //   const known = [...new Set([...ORDER_COLAB,...ORDER_GESTOR,...ORDER_RH,'gestor','disc','cargos','pdi','organograma','trilhas','experiencia','meu-desenvolvimento','usuarios','colaboradores','rh','calendario','mapeamento-talentos','pesquisas','beneficios','solicitacao','conecta-ai','mais'])];
  //   known.forEach(id=>{
  //     const el = document.getElementById('sb-'+id);
  //     if(el) el.style.setProperty('display', order.includes(id)?'flex':'none', 'important');
  //   });
  //   const lbl = document.getElementById('btnTrocarPerfilLabel');
  //   if(lbl) lbl.textContent = isRH() ? '👤 Minha Visão' : '🏢 Voltar RH';
  //   const pLabel = document.getElementById('pLabel'); if(pLabel) pLabel.textContent = isRH()?'RH':(r==='gestor'?'Gestor':'Colaborador');
  //   const pDot   = document.getElementById('pDot');   if(pDot)   pDot.textContent   = isRH()?'🏢':(r==='gestor'?'👔':'👤');
  // }

  /* ── instala ── */
  function instalar(){
    aplicarMenu();
    window.sbNav       = function(id){ aplicarMenu(); navegar(id); };
    window.switchView  = function(id){ aplicarMenu(); navegar(id); };
    window.buildSidebar= function(){ aplicarMenu(); navegar(isRH()?'gestao-rh':'intranet'); };
    window.trocarPerfil= function(){
      if(isRH()){ window.role='colaborador'; sessionStorage.setItem('userRole','colaborador'); }
      else       { window.role='rh';          sessionStorage.setItem('userRole','rh'); }
      aplicarMenu(); navegar(isRH()?'gestao-rh':'intranet');
    };
    window.__roteadorNavegar = navegar;
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', instalar); }
  else { instalar(); }

  /* ── ouvidoriaCarregar: função que faltava ── */
  if(typeof window.ouvidoriaCarregar !== 'function'){
    window.ouvidoriaCarregar = function(){
      const v = document.getElementById('view-ouvidoria');
      if(!v) return;
      // Popula contadores do hero
      if(typeof db !== 'undefined' && typeof col === 'function'){
        db.collection(col('ouvidoria')).get().then(snap=>{
          const msgs = snap.docs.map(d=>d.data());
          const total = msgs.length;
          const novas = msgs.filter(m=>!m.lida).length;
          const respondidas = msgs.filter(m=>m.resposta).length;
          const el = document.getElementById;
          ['ouv-total','ouv-novas','ouv-respondidas'].forEach((id,i)=>{ const e=document.getElementById(id); if(e) e.textContent=[total,novas,respondidas][i]; });
        }).catch(()=>{});
      }
    };
  }

})();
