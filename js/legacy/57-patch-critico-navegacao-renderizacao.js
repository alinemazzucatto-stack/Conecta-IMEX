// ===== script: patch-critico-navegacao-renderizacao-js =====
(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  const COLAB_MENU = ['intranet','gamificacao','estrutura-carreira','mais','ouvidoria'];
  const GESTOR_MENU = ['intranet','gamificacao','estrutura-carreira','solicitacao','gestor','pesquisas','beneficios','ouvidoria','conecta-ai'];
  const RH_MENU = ['gestao-rh','gamificacao','dashboard','ouvidoria','conecta-ai','auditoria'];
  const COLAB_ALLOWED = new Set([...COLAB_MENU,'organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento','desenvolvimento','beneficios','solicitacao','pesquisas','conecta-ai']);
  const GESTOR_ALLOWED = new Set([...GESTOR_MENU,'organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento','desenvolvimento']);
  const RH_ALLOWED = new Set([...RH_MENU,'estrutura-carreira','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento','desenvolvimento','gestor','solicitacao','pdi']);
  const META = {
    intranet:['🏠','Intranet'], 'estrutura-carreira':['🏢','Estrutura e Carreira'], pesquisas:['📋','Pesquisas'], beneficios:['🎁','Meus Benefícios'], solicitacao:['🌴','Férias'], 'conecta-ai':['🤖','Conecta AI'], ouvidoria:['📢','Ouvidoria'], gamificacao:['🏆','Gamificação'], 'gestao-rh':['🏢','Gestão RH'], usuarios:['🔑','Gestão de Acessos'], dashboard:['📊','Dashboard RH'], auditoria:['📝','Auditoria'], gestor:['👔','Gestor'], organograma:['🏢','Organograma'], trilhas:['🚀','Trilhas de Carreira'], experiencia:['📆','Minha Experiência'], cargos:['📄','Descritivo de Cargos'], disc:['🧠','DISC'], 'meu-desenvolvimento':['✨','Meu Desenvolvimento'], desenvolvimento:['🌱','Desenvolvimento'], mais:['📦','Mais']
  };
  function visualRole(){
    // NÃO ler o texto do #pLabel: dezenas de scripts escrevem nesse rótulo
    // em intervalos próprios e descoordenados, então o texto pisca entre
    // "RH"/"Colaborador" por frações de segundo — e como esta função roda
    // em loop (guard/forceView), isso fazia a tela oscilar entre painéis.
    // `role`/`window.role` é a fonte estável definida no login.
    const r = String((typeof role !== 'undefined' && role) ? role : (window.role || sessionStorage.getItem('userRole') || 'colaborador')).toLowerCase().trim();
    return r === 'rh-colaborador' ? 'rh' : (['rh','gestor','colaborador'].includes(r) ? r : 'colaborador');
  }
  function menuFor(r){ return r==='rh' ? RH_MENU : (r==='gestor' ? GESTOR_MENU : COLAB_MENU); }
  function allowedFor(r){ return r==='rh' ? RH_ALLOWED : (r==='gestor' ? GESTOR_ALLOWED : COLAB_ALLOWED); }
  function setTop(id){
    const m = META[id] || ['▫️',id];
    const icon=$('tPageIcon'); if(icon) icon.textContent=m[0];
    const title=$('tPageTitle'); if(title) title.textContent=m[1];
  }
  function ensureSidebarItem(id){
    const sidebar=$('sidebar'); if(!sidebar) return null;
    let el=$('sb-'+id); if(el) return el;
    const m=META[id] || ['▫️',id];
    el=document.createElement('div');
    el.className='sb-item'; el.id='sb-'+id; el.title='';
    el.innerHTML='<span>'+m[0]+'</span><span class="sb-tip">'+m[1]+'</span>';
    el.onclick=function(){ window.sbNav(id); };
    const spacer=sidebar.querySelector('.sb-spacer');
    if(spacer) sidebar.insertBefore(el,spacer); else sidebar.appendChild(el);
    return el;
  }
  function applyMenu(){
    const r=visualRole(); const menu=menuFor(r);
    const sidebar=$('sidebar'); const spacer=sidebar?.querySelector('.sb-spacer');
    menu.forEach(id=>{ const el=ensureSidebarItem(id); if(el&&sidebar&&spacer) sidebar.insertBefore(el,spacer); });
    document.querySelectorAll('[id^="sb-"]').forEach(el=>{
      const id=el.id.replace(/^sb-/,'');
      const show=menu.includes(id);
      el.style.setProperty('display', show ? 'flex' : 'none', 'important');
      if(id==='gestao-rh' && r!=='rh') el.style.setProperty('display','none','important');
    });
  }
  function hideAll(){
    document.querySelectorAll('[id^="view-"]').forEach(v=>{v.classList.remove('active','dev-active','beneficios-force-active'); v.style.setProperty('display','none','important');});
    const hero=$('mainHero'); if(hero) hero.style.setProperty('display','none','important');
  }
  function ensureView(id){
    let v=$('view-'+id); if(v) return v;
    v=document.createElement('div'); v.id='view-'+id; v.className='page'; v.style.display='none';
    const main=document.querySelector('.main-area .page') || document.querySelector('.main-area') || document.body;
    main.appendChild(v); return v;
  }
  function ensureContent(id){
    const v=ensureView(id);
    const txt=(v.textContent||'').replace(/\s+/g,'').trim();
    if(txt.length>20) return v;
    if(id==='estrutura-carreira'){
      v.innerHTML='<div class="hero"><div><div class="h-eyebrow">Estrutura & Carreira</div><h1>ESTRUTURA E CARREIRA</h1><p>Consulte organograma, gestor direto, equipe, departamento, trilhas e evolução de carreira.</p></div></div><div class="stats-row"><div class="sc"><div class="sc-lbl">Cargo atual</div><div class="sc-num" style="font-size:24px">Analista</div><div class="sc-sub">Função cadastrada no RH</div></div><div class="sc"><div class="sc-lbl">Próximo cargo</div><div class="sc-num" style="font-size:24px">Pleno</div><div class="sc-sub">Trilha sugerida</div></div><div class="sc"><div class="sc-lbl">Evolução</div><div class="sc-num">80%</div><div class="sc-sub">Competências mapeadas</div></div></div><div class="cg"><div class="card"><div class="card-head"><div class="cht"><h2>🏢 Organograma</h2><p>Gestor direto, equipe, departamento e estrutura hierárquica.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Gestor direto</div><div class="ri-meta"><span class="ri-m">Departamento: <strong>Recursos Humanos</strong></span><span class="ri-m">Equipe: <strong>Time IMEX</strong></span></div></div></div></div><div class="card"><div class="card-head"><div class="cht"><h2>🚀 Trilhas de Carreira</h2><p>Cargo atual, próximo cargo, competências e cursos recomendados.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Competências necessárias</div><div class="ri-meta"><span class="ri-m">Comunicação</span><span class="ri-m">Liderança</span><span class="ri-m">Gestão de processos</span></div></div><div class="ri-item"><div class="ri-name">Cursos recomendados</div><div class="ri-meta"><span class="ri-m">Excel aplicado</span><span class="ri-m">People Analytics</span></div></div></div></div></div>';
    } else if(id==='gamificacao'){
      v.innerHTML='<div class="hero"><div><div class="h-eyebrow">Engajamento & Reconhecimento</div><h1>🏆 GAMIFICAÇÃO</h1><p>Ranking, pontos, medalhas, desafios, missões, histórico, recompensas e evolução do colaborador.</p></div></div><div class="stats-row"><div class="sc"><div class="sc-lbl">Pontos totais</div><div class="sc-num">8.450</div><div class="sc-sub">Sistema de pontos</div></div><div class="sc"><div class="sc-lbl">Ranking mensal</div><div class="sc-num">#3</div><div class="sc-sub">Entre os colaboradores</div></div><div class="sc"><div class="sc-lbl">Barra de progresso</div><div class="sc-num">72%</div><div class="sc-sub">Próximo nível</div></div></div><div class="cg"><div class="card"><div class="card-head"><div class="cht"><h2>🏅 Medalhas e conquistas</h2><p>Conquistas liberadas pelo engajamento.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Comunicador</div><span class="badge ba">Conquistada</span></div><div class="ri-item"><div class="ri-name">Participativo</div><span class="badge bp">Em andamento</span></div></div></div><div class="card"><div class="card-head"><div class="cht"><h2>🎯 Desafios e missões</h2><p>Atividades que geram pontos e recompensas.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Responder pesquisa</div><span class="badge bb">+50 pontos</span></div><div class="ri-item"><div class="ri-name">Reconhecer um colega</div><span class="badge bb">+30 pontos</span></div><div class="ri-item"><div class="ri-name">Histórico de pontuação</div><div class="ri-meta"><span class="ri-m">Última pontuação: <strong>+20</strong></span><span class="ri-m">Recompensas: <strong>2 disponíveis</strong></span></div></div></div></div></div>';
    }
    return v;
  }
  function callLoader(id){
    try{
      if(id==='intranet' && typeof window.intraCarregar==='function') window.intraCarregar();
      if(id==='pesquisas' && typeof window.pesqCarregar==='function') window.pesqCarregar();
      if(id==='beneficios' && typeof window.benCarregar==='function') window.benCarregar();
      if(id==='solicitacao' && typeof window.updateResumo==='function') window.updateResumo();
      if(id==='conecta-ai' && typeof window.carregarTemasAI==='function') window.carregarTemasAI();
      if(id==='ouvidoria' && typeof window.ouvidoriaCarregar==='function') window.ouvidoriaCarregar();
      if(id==='gestao-rh' && typeof window.gestaoRhCarregar==='function') window.gestaoRhCarregar();
      if(id==='usuarios' && typeof window.carregarUsuarios==='function') window.carregarUsuarios();
      if(id==='dashboard' && typeof window.renderDash==='function') window.renderDash();
      if(id==='auditoria' && typeof window.renderAudit==='function') window.renderAudit();
      if(id==='gestor' && typeof window.renderGestor==='function') window.renderGestor();
      if(id==='gamificacao' && typeof window.gamCarregar==='function') window.gamCarregar();
    }catch(e){ console.warn('loader protegido', id, e); }
  }
  function forceView(id){
    const r=visualRole(); const allowed=allowedFor(r);
    if(!allowed.has(id)) id = r==='rh' ? 'gestao-rh' : 'intranet';
    if(r!=='rh' && id==='gestao-rh') id='intranet';
    applyMenu(); ensureContent(id); hideAll();
    const v=ensureView(id); v.classList.add('active'); v.style.setProperty('display','block','important');
    document.querySelectorAll('.sb-item').forEach(el=>el.classList.remove('active'));
    const active=(['organograma','trilhas'].includes(id))?'estrutura-carreira':(['experiencia','cargos','disc','meu-desenvolvimento'].includes(id)?'desenvolvimento':id);
    const sb=$('sb-'+active); if(sb) sb.classList.add('active');
    setTop(id); callLoader(id);
  }
  const oldDoLogin = window.doLogin;
  if(typeof oldDoLogin==='function'){
    window.doLogin = async function(){
      const selected=document.querySelector('#loginRoleGrid .role-btn.selected')?.getAttribute('data-role') || window.loginRole || 'colaborador';
      try{ window.loginRole=selected; sessionStorage.setItem('imexPreferredRole', selected); }catch(e){}
      return oldDoLogin.apply(this, arguments);
    };
  }
  window.buildSidebar = function(){ applyMenu(); forceView(visualRole()==='rh'?'gestao-rh':'intranet'); };
  window.switchView = function(id){ forceView(id); };
  window.sbNav = function(id){ forceView(id); };
  function guard(){
    applyMenu();
    const r=visualRole();
    const gestao=$('view-gestao-rh');
    if(r!=='rh' && gestao && getComputedStyle(gestao).display!=='none') forceView('intranet');
    const active=document.querySelector('[id^="view-"].active');
    if(!active) forceView(r==='rh'?'gestao-rh':'intranet');
  }
  document.addEventListener('DOMContentLoaded', function(){ [50,300,800,1500,2500].forEach(t=>setTimeout(guard,t)); });
  setInterval(guard, 1200);
})();
