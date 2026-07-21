// ===== script: patch-conecta-rh-menu-estavel-v3-js =====
(function(){
  const ACCESS_FINAL = {
    // Menu limpo do COLABORADOR: apenas 8 módulos principais
    colaborador: [
      'intranet','estrutura-carreira','desenvolvimento','pesquisas',
      'beneficios','solicitacao','conecta-ai','ouvidoria',
      // subpáginas internas acessadas por cards/hubs
      'organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento'
    ],
    gestor: [
      'intranet','estrutura-carreira','desenvolvimento','pesquisas',
      'beneficios','solicitacao','conecta-ai','ouvidoria','gestor',
      'organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento'
    ],
    rh: ['gestao-rh','desenvolvimento-talentos','pesquisas','dashboard','ouvidoria','conecta-ai','auditoria','experiencia','disc','cargos','trilhas','pdi','usuarios'],
    'rh-colaborador': ['intranet','disc','cargos','conecta-ai','gestao-rh','pesquisas','usuarios','ouvidoria','organograma','trilhas','experiencia','beneficios','meu-desenvolvimento']
  };

  const ORDER_FINAL = ['intranet','estrutura-carreira','desenvolvimento','pesquisas','beneficios','solicitacao','conecta-ai','ouvidoria'];
  const ORDER_RH = ['gestao-rh','dashboard','ouvidoria','conecta-ai','auditoria'];
  const ORDER_GESTOR = ['intranet','estrutura-carreira','desenvolvimento','pesquisas','beneficios','solicitacao','conecta-ai','ouvidoria','gestor'];

  const META_FINAL = {
    intranet:['🏠','Intranet'],
    'estrutura-carreira':['🏢','Estrutura e Carreira'],
    desenvolvimento:['🌱','Desenvolvimento'],
    pesquisas:['📋','Pesquisas'],
    beneficios:['🎁','Meus Benefícios'],
    solicitacao:['🌴','Férias'],
    'conecta-ai':['🤖','Conecta AI'],
    ouvidoria:['📢','Ouvidoria'],
    gestor:['👔','Gestor'],
    disc:['🧠','DISC'],
    cargos:['📄','Descritivo de Cargos'],
    'meu-desenvolvimento':['✨','Meu Desenvolvimento'],
    experiencia:['📆','Minha Experiência'],
    organograma:['🏢','Organograma'],
    trilhas:['🚀','Trilhas de Carreira'],
    'gestao-rh':['🏢','Gestão RH'],
    usuarios:['🔑','Gestão de Acessos']
  };
  const R_LABEL = {colaborador:'Colaborador',gestor:'Gestor',rh:'RH','rh-colaborador':'RH'};
  const R_DOT = {colaborador:'👤',gestor:'👔',rh:'🏢','rh-colaborador':'🏢'};

  function norm(v){ return String(v||'').toLowerCase().trim(); }
  // REMOVED: Consolidated in 000-core-functions.js
  // function roleAtual(){
  //   let r = norm(window.role || sessionStorage.getItem('userRole') || 'colaborador');
  //   if(r === 'rh-colaborador') r = 'rh';
  //   if(!ACCESS_FINAL[r]) r = 'colaborador';
  //   return r;
  // }
  function perfisReais(){
    try{
      if(window.currentUserData && Array.isArray(window.currentUserData.perfis)) return window.currentUserData.perfis.map(norm);
      const ss=sessionStorage.getItem('userPerfis'); if(ss) return JSON.parse(ss).map(norm);
      const u=JSON.parse(localStorage.getItem('usuarioLogado')||'{}');
      if(Array.isArray(u.perfis)) return u.perfis.map(norm);
      if(u.perfil) return [norm(u.perfil)];
    }catch(e){}
    return [];
  }
  function temPerfilRH(){
    const perfis = perfisReais();
    return perfis.includes('rh') || norm(window._roleReal)==='rh' || norm(window._roleReal)==='rh-colaborador' || norm(sessionStorage.getItem('userRole'))==='rh';
  }
  function setTopbar(icon,label){
    const pi=document.getElementById('tPageIcon'); if(pi){ pi.textContent=icon; pi.style.display=''; }
    const pt=document.getElementById('tPageTitle'); if(pt) pt.textContent=label;
  }
  function setPerfilVisual(){
    const r=roleAtual();
    const pLabel=document.getElementById('pLabel'); if(pLabel) pLabel.textContent=R_LABEL[r]||'Colaborador';
    const pDot=document.getElementById('pDot'); if(pDot) pDot.textContent=R_DOT[r]||'👤';
    const btn=document.getElementById('btnTrocarPerfil');
    if(btn){
      const mostrar = temPerfilRH();
      btn.style.setProperty('display', mostrar ? 'inline-flex' : 'none', 'important');
      const lbl=document.getElementById('btnTrocarPerfilLabel');
      if(lbl) lbl.textContent = r === 'rh' ? '👤 Minha Visão' : '🏢 Voltar RH';
    }
  }
  function ensureItem(id){
    const sidebar=document.getElementById('sidebar'); if(!sidebar) return null;
    const meta=META_FINAL[id] || ['▫️',id];
    let el=document.getElementById('sb-'+id);
    if(!el){
      el=document.createElement('div'); el.className='sb-item'; el.id='sb-'+id;
      el.innerHTML='<span></span><span class="sb-tip"></span>';
    }
    const icon=el.querySelector('span:first-child') || el.appendChild(document.createElement('span'));
    icon.textContent=meta[0];
    let tip=el.querySelector('.sb-tip');
    if(!tip){ tip=document.createElement('span'); tip.className='sb-tip'; el.appendChild(tip); }
    tip.textContent=meta[1]; el.title=meta[1];
    el.onclick=function(ev){ if(ev) ev.preventDefault(); navegar(id); return false; };
    return el;
  }
  function hubCard(icon,title,desc,target,items){
    const lis=(items||[]).map(i=>`<span>✓ ${i}</span>`).join('');
    return `<button class="hub-card" onclick="sbNav('${target}')"><div class="hub-ico">${icon}</div><div><h3>${title}</h3><p>${desc}</p><div class="hub-list">${lis}</div></div></button>`;
  }
  function ensureHubStyles(){
    if(document.getElementById('hub-colaborador-style')) return;
    const st=document.createElement('style'); st.id='hub-colaborador-style';
    st.textContent = `.hub-grid{display:grid;grid-template-columns:repeat(2,minmax(260px,1fr));gap:16px}.hub-card{background:#fff;border:1px solid var(--border);border-radius:18px;padding:20px;text-align:left;display:flex;gap:16px;cursor:pointer;box-shadow:0 8px 22px rgba(16,24,40,.05);transition:.22s;font-family:inherit}.hub-card:hover{transform:translateY(-3px);border-color:#0047FF;box-shadow:0 16px 36px rgba(0,71,255,.12)}.hub-ico{width:48px;height:48px;border-radius:16px;background:#f3f6ff;display:flex;align-items:center;justify-content:center;font-size:24px;flex:0 0 48px}.hub-card h3{font-size:17px;margin:0 0 6px;color:var(--ink);font-weight:900}.hub-card p{font-size:13px;color:var(--ink-60);line-height:1.45;margin:0 0 10px}.hub-list{display:grid;grid-template-columns:repeat(2,minmax(110px,1fr));gap:5px 12px}.hub-list span{font-size:11.5px;color:var(--ink-60)}@media(max-width:850px){.hub-grid{grid-template-columns:1fr}.hub-list{grid-template-columns:1fr}}`;
    document.head.appendChild(st);
  }
  function ensureView(id){
    let v=document.getElementById('view-'+id);
    if(!v){ v=document.createElement('div'); v.id='view-'+id; v.className='page'; v.style.display='none'; document.querySelector('.main-area')?.appendChild(v); }
    return v;
  }
  function renderEstruturaCarreira(){
    // Usa a view estática já existente — não sobrescreve o innerHTML
    const v=document.getElementById('view-estrutura-carreira');
    if(v) { v.classList.add('active'); v.style.setProperty('display','block','important'); }
  }
  function renderDesenvolvimentoHub(){
    // Usa a view estática já existente — não sobrescreve o innerHTML
    const v=document.getElementById('view-desenvolvimento');
    if(v) { v.classList.add('active'); v.style.setProperty('display','block','important'); }
  }
  function renderBeneficiosHub(){
    const v=document.getElementById('view-beneficios');
    if(!v || v.dataset.hubBeneficios==='ok') return;
    ensureHubStyles();
    v.dataset.hubBeneficios='ok';
    v.innerHTML = `<div class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important"><div class="h-content"><div class="h-eyebrow">Benefícios IMEX</div><h1>MEUS BENEFÍCIOS</h1><p>Central para consultar benefícios, acessos, dependentes, orientações, FAQ e informações importantes.</p></div></div><div class="hub-grid">${hubCard('🍔','iFood Benefícios','Saldo, extrato, como utilizar e FAQ.','beneficios-ifood',['Saldo','Extrato','Como utilizar','FAQ'])}${hubCard('🏋️','Wellhub','Acesso à plataforma, planos e dependentes.','beneficios-wellhub',['Acesso','Dependentes'])}${hubCard('❤️','Starbem','Consultas e inclusão de dependentes.','beneficios-starbem',['Consultas','Dependentes'])}${hubCard('🏥','Dasa','Exames e agendamentos.','beneficios-dasa',['Exames','Agendamentos'])}${hubCard('🧠','Optum','Psicologia, nutrição e medicina.','beneficios-optum',['Psicologia','Nutrição','Medicina'])}${hubCard('🩺','Unimed','Guia, reembolso e coparticipação.','beneficios-unimed',['Guia','Reembolso','Coparticipação'])}</div><div class="alert ai" style="margin-top:18px">Os cards acima organizam a central de benefícios. As páginas detalhadas podem ser conectadas depois com links, FAQ ou integrações.</div>`;
  }
  function esconderViews(){
    document.querySelectorAll('[id^="view-"]').forEach(el=>{ el.classList.remove('active','dev-active'); el.style.setProperty('display','none','important'); });
    const hero=document.getElementById('mainHero'); if(hero) hero.style.setProperty('display','none','important');
  }
  // REMOVED: Consolidated in 000-core-functions.js
  // function navegar(id){
  //   const allowed=ACCESS_FINAL[roleAtual()] || ACCESS_FINAL.colaborador;
  //   if(!allowed.includes(id)) id='intranet';
  //   esconderViews();
  //   if(id==='estrutura-carreira') renderEstruturaCarreira();
  //   if(id==='desenvolvimento') renderDesenvolvimentoHub();
  //   if(id==='beneficios') renderBeneficiosHub();
  //   if(id==='meu-desenvolvimento' && typeof renderMeuDesenvolvimento==='function') renderMeuDesenvolvimento();
  //   const v=document.getElementById('view-'+id);
  //   if(v){ v.classList.add('active'); if(id==='meu-desenvolvimento') v.classList.add('dev-active'); v.style.setProperty('display','block','important'); }
  //   document.querySelectorAll('.sb-item').forEach(el=>el.classList.remove('active'));
  //   const activeMain = (['organograma','trilhas'].includes(id)) ? 'estrutura-carreira' : (['experiencia','cargos','disc','meu-desenvolvimento'].includes(id) ? 'desenvolvimento' : id);
  //   const sb=document.getElementById('sb-'+activeMain); if(sb) sb.classList.add('active');
  //   const meta=META_FINAL[id] || META_FINAL[activeMain]; if(meta) setTopbar(meta[0], meta[1]);
  //   try{
  //     if(id==='intranet' && typeof intraCarregar==='function') intraCarregar();
  //     if(id==='pesquisas' && typeof pesqCarregar==='function') pesqCarregar();
  //     if(id==='disc' && typeof discCarregar==='function') discCarregar();
  //     if(id==='cargos' && typeof cargosCarregar==='function') cargosCarregar();
  //     if(id==='conecta-ai' && typeof carregarTemasAI==='function') carregarTemasAI();
  //     if(id==='gestao-rh' && typeof gestaoRhCarregar==='function') gestaoRhCarregar();
  //     if(id==='usuarios' && typeof carregarUsuarios==='function') carregarUsuarios();
  //     if(id==='ouvidoria' && typeof ouvidoriaCarregar==='function') ouvidoriaCarregar();
  //     if(id==='gestor' && typeof renderGestor==='function') renderGestor();
  //   }catch(e){ console.warn('navegar:', id, e); }
  // }
  // REMOVED: Consolidated in 000-core-functions.js
  // function aplicarMenu(){
  //   window.ROLE_ACCESS = window.ROLE_ACCESS || {};
  //   Object.keys(ACCESS_FINAL).forEach(k=>window.ROLE_ACCESS[k]=ACCESS_FINAL[k].slice());
  //   window.TAB_META = window.TAB_META || {};
  //   Object.keys(META_FINAL).forEach(k=>window.TAB_META[k]={icon:META_FINAL[k][0], label:META_FINAL[k][1]});
  //   const r=roleAtual();
  //   const menuOrder = r==='rh' ? ORDER_RH : (r==='gestor' ? ORDER_GESTOR : ORDER_FINAL);
  //   const sidebar=document.getElementById('sidebar'); const spacer=sidebar ? sidebar.querySelector('.sb-spacer') : null;
  //   menuOrder.forEach(ensureItem);
  //   if(sidebar && spacer){ menuOrder.forEach(id=>{ const el=document.getElementById('sb-'+id); if(el) sidebar.insertBefore(el, spacer); }); }
  //   const allSidebarIds=['intranet','estrutura-carreira','desenvolvimento','pesquisas','beneficios','solicitacao','conecta-ai','ouvidoria','gestor','disc','cargos','meu-desenvolvimento','organograma','trilhas','experiencia','gestao-rh','usuarios','dashboard','auditoria','pdi','rh','calendario','colaboradores'];
  //   allSidebarIds.forEach(id=>{ const el=document.getElementById('sb-'+id); if(el) el.style.setProperty('display', menuOrder.includes(id) ? 'flex' : 'none', 'important'); });
  //   const grh=document.getElementById('sb-gestao-rh'); if(grh) grh.classList.toggle('sb-rh-highlight', r==='rh');
  //   setPerfilVisual();
  // }
  window.buildSidebar = function(){ aplicarMenu(); const r=roleAtual(); const first=(r==='rh'?ORDER_RH:(r==='gestor'?ORDER_GESTOR:ORDER_FINAL))[0] || 'intranet'; navegar(first); };
  window.switchView = function(v){ aplicarMenu(); navegar(v); };
  window.sbNav = function(v){ aplicarMenu(); navegar(v); };
  window.trocarPerfil = function(){
    if(roleAtual()==='rh'){ window.role='colaborador'; sessionStorage.setItem('userRole','colaborador'); }
    else { window.role='rh'; sessionStorage.setItem('userRole','rh'); }
    aplicarMenu(); navegar(roleAtual()==='rh'?'intranet':'intranet');
  };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(aplicarMenu,150); setTimeout(aplicarMenu,800); });
})();


