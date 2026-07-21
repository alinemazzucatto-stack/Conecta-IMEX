// ===== script: patch-estabilizador-sem-redesign-js =====
(function(){
  'use strict';
  const $ = (id)=>document.getElementById(id);
  const roleMap = {
    colaborador: ['intranet','gamificacao','estrutura-carreira','beneficios','solicitacao','pesquisas','ouvidoria','conecta-ai','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento'],
    gestor: ['intranet','gamificacao','estrutura-carreira','solicitacao','gestor','pesquisas','beneficios','ouvidoria','conecta-ai','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento'],
    rh: ['intranet','gestao-rh','usuarios','dashboard','auditoria','pesquisas','beneficios','conecta-ai','ouvidoria','gamificacao','estrutura-carreira','desenvolvimento','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento','gestor','solicitacao'],
    'rh-colaborador': ['intranet','gestao-rh','usuarios','dashboard','auditoria','pesquisas','beneficios','conecta-ai','ouvidoria','gamificacao','estrutura-carreira','desenvolvimento','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento','gestor','solicitacao']
  };
  const meta = {
    intranet:['🏠','Intranet'], 'estrutura-carreira':['🏢','Estrutura e Carreira'], desenvolvimento:['🚀','Desenvolvimento'], pesquisas:['📋','Pesquisas'], beneficios:['🎁','Meus Benefícios'], solicitacao:['🌴','Férias'], 'conecta-ai':['🤖','Conecta AI'], ouvidoria:['📣','Ouvidoria'], gamificacao:['🏆','Gamificação'], 'gestao-rh':['🏢','Gestão RH'], usuarios:['🔑','Gestão de Acessos'], dashboard:['📊','Dashboard'], auditoria:['📋','Auditoria'], gestor:['👔','Gestor'], rh:['🏢','RH'], organograma:['🏢','Organograma'], trilhas:['🚀','Trilhas de Carreira'], experiencia:['📅','Minha Experiência'], cargos:['📄','Descritivo de Cargos'], disc:['🧠','DISC'], 'meu-desenvolvimento':['✨','Meu Desenvolvimento']
  };
  // REMOVED: Consolidated in 000-core-functions.js
  // function roleAtual(){
  //   const r = String(window.role || sessionStorage.getItem('userRole') || 'colaborador').toLowerCase().trim();
  //   return roleMap[r] ? r : 'colaborador';
  // }
  function setTopbar(id){
    const m = meta[id] || ['▫️', id];
    const icon = $('tPageIcon'); if(icon) icon.textContent = m[0];
    const title = $('tPageTitle'); if(title) title.textContent = m[1];
    const label = $('pLabel'); if(label){ const r=roleAtual(); label.textContent = r==='rh' || r==='rh-colaborador' ? 'RH' : r==='gestor' ? 'Gestor' : 'Colaborador'; }
  }
  function showOnly(id){
    document.querySelectorAll('[id^="view-"]').forEach(v=>{v.classList.remove('active','dev-active','beneficios-force-active'); v.style.setProperty('display','none','important');});
    const v = $('view-'+id);
    if(v){ v.classList.add('active'); v.style.setProperty('display','block','important'); }
    document.querySelectorAll('.sb-item').forEach(el=>el.classList.remove('active'));
    const active = ['organograma','trilhas'].includes(id) ? 'estrutura-carreira' : (['experiencia','cargos','disc','meu-desenvolvimento'].includes(id) ? 'desenvolvimento' : id);
    const sb = $('sb-'+active); if(sb) sb.classList.add('active');
    const hero = $('mainHero'); if(hero) hero.style.setProperty('display', ['solicitacao','gestor','rh'].includes(id) ? 'flex' : 'none', 'important');
    setTopbar(id);
  }
  function callLoader(id){
    try{
      if(id==='intranet' && typeof window.intraCarregar==='function') window.intraCarregar();
      if(id==='pesquisas' && typeof window.pesqCarregar==='function') window.pesqCarregar();
      if(id==='disc' && typeof window.discCarregar==='function') window.discCarregar();
      if(id==='cargos' && typeof window.cargosCarregar==='function') window.cargosCarregar();
      if(id==='conecta-ai' && typeof window.carregarTemasAI==='function') window.carregarTemasAI();
      if(id==='gestao-rh' && typeof window.gestaoRhCarregar==='function') window.gestaoRhCarregar();
      if(id==='usuarios' && typeof window.carregarUsuarios==='function') window.carregarUsuarios();
      if(id==='ouvidoria' && typeof window.ouvidoriaCarregar==='function') window.ouvidoriaCarregar();
      if(id==='gestor' && typeof window.renderGestor==='function') window.renderGestor();
      if(id==='beneficios' && typeof window.benCarregar==='function') window.benCarregar();
      if(id==='meu-desenvolvimento'){
        if(window.AlineCarreira && typeof window.AlineCarreira.renderMeuDesenvolvimento==='function') window.AlineCarreira.renderMeuDesenvolvimento();
        else if(typeof window.renderMeuDesenvolvimento==='function') window.renderMeuDesenvolvimento();
      }
      if(id==='trilhas' && typeof window.trilhasCarregar==='function') window.trilhasCarregar();
      if(id==='experiencia' && typeof window.expCarregar==='function') window.expCarregar();
      if(id==='gamificacao' && typeof window.gamificacaoCarregar==='function') window.gamificacaoCarregar();
    }catch(e){ console.warn('Loader protegido:', id, e); }
  }
  function ensureFallback(id){
    const v=$('view-'+id); if(!v) return;
    const txt=(v.textContent||'').replace(/\s+/g,'').trim();
    if(txt.length>0) return;
    const m=meta[id]||['▫️',id];
    v.innerHTML = '<div class="hero"><div class="h-content"><div class="h-eyebrow">Módulo</div><h1>'+m[1].toUpperCase()+'</h1><p>Conteúdo do módulo carregado.</p></div></div>';
  }
  function applyMenu(){
    const r=roleAtual(); const allowed=roleMap[r]||roleMap.colaborador;
    document.querySelectorAll('[id^="sb-"]').forEach(el=>{
      const id=el.id.replace(/^sb-/,'');
      el.style.setProperty('display', allowed.includes(id) ? 'flex' : 'none', 'important');
    });
    const btn=$('btnTrocarPerfil');
    if(btn){
      const real=String(window._roleReal || sessionStorage.getItem('userRole') || window.role || '').toLowerCase();
      btn.style.setProperty('display', (real==='rh'||real==='rh-colaborador'||real==='gestor') ? 'inline-flex' : 'none', 'important');
    }
  }
  window.buildSidebar = function(){ applyMenu(); const r=roleAtual(); const first=(r==='rh'||r==='rh-colaborador')?'intranet':'intranet'; window.switchView(first); };
  window.switchView = function(id){
    const r=roleAtual(); const allowed=roleMap[r]||roleMap.colaborador;
    if(!allowed.includes(id)) id='intranet';
    applyMenu(); ensureFallback(id); showOnly(id); callLoader(id);
  };
  window.sbNav = window.switchView;
  function stabilize(){ applyMenu(); const active=document.querySelector('[id^="view-"].active'); if(!active) window.switchView('intranet'); }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(stabilize,50); setTimeout(stabilize,300); setTimeout(stabilize,1000); });
})();

