// ===== script: patch-final-correcoes-js =====
(function(){
  'use strict';
  const $ = id => document.getElementById(id);

  // ── Issue #1: rh-colaborador deve abrir na visão escolhida no login ──
  // visualRole() do patch anterior trata rh-colaborador como 'rh' e
  // joga o usuário em gestao-rh. Aqui respeitamos imexPreferredRole.
  function preferredRole(){
    try{
      const p = sessionStorage.getItem('imexPreferredRole');
      if(p) return String(p).toLowerCase().trim();
    }catch(e){}
    return null;
  }
  function effectiveRole(){
    const pref = preferredRole();
    if(pref && ['colaborador','gestor','rh'].includes(pref)) return pref;
    const label = ($('pLabel')?.textContent || '').toLowerCase();
    if(label.includes('colaborador')) return 'colaborador';
    if(label.includes('gestor')) return 'gestor';
    if(label.includes('rh') && !label.includes('colaborador')) return 'rh';
    const r = String((typeof window.role!=='undefined' && window.role) || sessionStorage.getItem('userRole') || 'colaborador').toLowerCase().trim();
    if(r==='rh-colaborador') {
      const pref = preferredRole();
      return (pref && ['colaborador','gestor','rh'].includes(pref)) ? pref : 'colaborador';
    }
    return ['rh','gestor','colaborador'].includes(r) ? r : 'colaborador';
  }
  window.__effectiveRole = effectiveRole;

  // ── Esconder Gestão RH para não-RH e proibir abertura indevida ──
  function lockGestaoRH(){
    const r = effectiveRole();
    const sb = $('sb-gestao-rh');
    if(sb && r !== 'rh') sb.style.setProperty('display','none','important');
    const view = $('view-gestao-rh');
    if(view && r !== 'rh' && getComputedStyle(view).display !== 'none'){
      view.style.setProperty('display','none','important');
      view.classList.remove('active');
      if(typeof window.sbNav === 'function') window.sbNav('intranet');
    }
  }

  // ── Issue #2 e #4: garantir conteúdo de Gamificação e Estrutura e Carreira ──
  function fallbackEstrutura(){
    return '<div class="hero"><div><div class="h-eyebrow">Estrutura & Carreira</div><h1>ESTRUTURA E CARREIRA</h1><p>Organograma, gestor direto, equipe, departamento, trilhas de carreira, competências e evolução.</p></div></div>'
      + '<div class="stats-row">'
      + '<div class="sc"><div class="sc-lbl">Cargo atual</div><div class="sc-num" style="font-size:24px">Analista</div><div class="sc-sub">Função cadastrada no RH</div></div>'
      + '<div class="sc"><div class="sc-lbl">Próximo cargo</div><div class="sc-num" style="font-size:24px">Pleno</div><div class="sc-sub">Trilha sugerida</div></div>'
      + '<div class="sc"><div class="sc-lbl">Evolução</div><div class="sc-num">80%</div><div class="sc-sub">Competências mapeadas</div></div>'
      + '</div>'
      + '<div class="cg">'
      + '<div class="card"><div class="card-head"><div class="cht"><h2>🏢 Organograma</h2><p>Gestor direto, equipe, departamento e estrutura hierárquica.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Gestor direto</div><div class="ri-meta"><span class="ri-m">Departamento: <strong>Recursos Humanos</strong></span><span class="ri-m">Equipe: <strong>Time IMEX</strong></span></div></div><div class="ri-item"><div class="ri-name">Estrutura hierárquica</div><div class="ri-meta"><span class="ri-m">Nível: <strong>Pleno / Analista</strong></span></div></div></div></div>'
      + '<div class="card"><div class="card-head"><div class="cht"><h2>🚀 Trilhas de Carreira</h2><p>Cargo atual, próximo cargo, competências necessárias, cursos recomendados e evolução de carreira.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Competências necessárias</div><div class="ri-meta"><span class="ri-m">Comunicação</span><span class="ri-m">Liderança</span><span class="ri-m">Gestão de processos</span></div></div><div class="ri-item"><div class="ri-name">Cursos recomendados</div><div class="ri-meta"><span class="ri-m">Excel aplicado</span><span class="ri-m">People Analytics</span></div></div><div class="ri-item"><div class="ri-name">Evolução de carreira</div><div class="ri-meta"><span class="ri-m">Status: <strong>80% concluído</strong></span></div></div></div></div>'
      + '</div>';
  }
  function fallbackGamificacao(){
    return '<div class="hero"><div><div class="h-eyebrow">Engajamento & Reconhecimento</div><h1>🏆 GAMIFICAÇÃO</h1><p>Ranking geral, ranking mensal, sistema de pontos, medalhas, conquistas, desafios, missões, histórico, recompensas e evolução.</p></div></div>'
      + '<div class="stats-row">'
      + '<div class="sc"><div class="sc-lbl">Pontos totais</div><div class="sc-num">8.450</div><div class="sc-sub">Sistema de pontos</div></div>'
      + '<div class="sc"><div class="sc-lbl">Ranking mensal</div><div class="sc-num">#3</div><div class="sc-sub">Entre os colaboradores</div></div>'
      + '<div class="sc"><div class="sc-lbl">Barra de progresso</div><div class="sc-num">72%</div><div class="sc-sub">Próximo nível</div></div>'
      + '</div>'
      + '<div class="cg">'
      + '<div class="card"><div class="card-head"><div class="cht"><h2>🏅 Medalhas e conquistas</h2><p>Conquistas liberadas pelo engajamento.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Comunicador</div><span class="badge ba">Conquistada</span></div><div class="ri-item"><div class="ri-name">Participativo</div><span class="badge bp">Em andamento</span></div></div></div>'
      + '<div class="card"><div class="card-head"><div class="cht"><h2>🎯 Desafios e missões</h2><p>Atividades que geram pontos e recompensas.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Responder pesquisa</div><span class="badge bb">+50 pontos</span></div><div class="ri-item"><div class="ri-name">Reconhecer um colega</div><span class="badge bb">+30 pontos</span></div></div></div>'
      + '<div class="card"><div class="card-head"><div class="cht"><h2>📊 Ranking geral</h2><p>Top colaboradores da empresa.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">1º — Maria Souza</div><span class="badge ba">9.820 pts</span></div><div class="ri-item"><div class="ri-name">2º — João Lima</div><span class="badge ba">8.910 pts</span></div><div class="ri-item"><div class="ri-name">3º — Você</div><span class="badge bp">8.450 pts</span></div></div></div>'
      + '<div class="card"><div class="card-head"><div class="cht"><h2>🎁 Recompensas</h2><p>Troque seus pontos por recompensas.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Vale-presente IMEX</div><span class="badge bb">1.500 pts</span></div><div class="ri-item"><div class="ri-name">Day-off extra</div><span class="badge bb">5.000 pts</span></div></div></div>'
      + '<div class="card"><div class="card-head"><div class="cht"><h2>🕒 Histórico de pontuação</h2><p>Últimas movimentações.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">+50 — Pesquisa de clima</div><span class="ri-m">Hoje</span></div><div class="ri-item"><div class="ri-name">+30 — Reconhecimento de colega</div><span class="ri-m">Ontem</span></div><div class="ri-item"><div class="ri-name">+20 — Comentário em comunicado</div><span class="ri-m">Esta semana</span></div></div></div>'
      + '<div class="card"><div class="card-head"><div class="cht"><h2>📈 Evolução do colaborador</h2><p>Acompanhamento de progresso.</p></div></div><div class="card-body"><div class="ri-item"><div class="ri-name">Nível atual: 6</div><div class="ri-meta"><span class="ri-m">Próximo nível: <strong>7</strong></span></div></div></div></div>'
      + '</div>';
  }
  function ensureFallbackContent(id){
    let v = $('view-'+id);
    if(!v){
      v = document.createElement('div');
      v.id = 'view-'+id; v.className = 'page'; v.style.display='none';
      const host = document.querySelector('.main-area') || document.body;
      host.appendChild(v);
    }
    const txt = (v.textContent||'').replace(/\s+/g,'').trim();
    if(txt.length < 30){
      if(id==='estrutura-carreira') v.innerHTML = fallbackEstrutura();
      if(id==='gamificacao') v.innerHTML = fallbackGamificacao();
    }
    return v;
  }

  // ── Wrapper sobre sbNav/switchView que valida permissão e renderiza ──
  const baseNav = window.sbNav || window.switchView;
  function safeNav(id){
    id = String(id||'').trim();
    const r = effectiveRole();
    // Bloqueia gestao-rh para não-RH
    if(r !== 'rh' && (id === 'gestao-rh' || id === 'rh' || id === 'dashboard' || id === 'auditoria' || id === 'usuarios' || id === 'desenvolvimento-talentos')){
      id = 'intranet';
    }
    if(id === 'gamificacao' || id === 'estrutura-carreira') ensureFallbackContent(id);
    if(typeof baseNav === 'function'){
      try{ baseNav(id); }catch(e){ console.warn('safeNav baseNav erro', e); }
    }
    // Garante visibilidade
    document.querySelectorAll('[id^="view-"]').forEach(v=>{
      if(v.id !== 'view-'+id){ v.style.setProperty('display','none','important'); v.classList.remove('active'); }
    });
    const v = $('view-'+id);
    if(v){ v.style.setProperty('display','block','important'); v.classList.add('active'); }
    lockGestaoRH();
  }
  window.sbNav = safeNav;
  window.switchView = safeNav;

  // ── Override seguro do buildSidebar para landing inicial ──
  const baseBuild = window.buildSidebar;
  window.buildSidebar = function(){
    try{ if(typeof baseBuild==='function') baseBuild(); }catch(e){}
    const r = effectiveRole();
    lockGestaoRH();
    safeNav(r === 'rh' ? 'gestao-rh' : 'intranet');
  };

  // ── Guard periódico: nunca permite gestao-rh aberto para não-RH ──
  function guardLoop(){
    lockGestaoRH();
    // Garante conteúdo presente nos módulos
    ensureFallbackContent('gamificacao');
    ensureFallbackContent('estrutura-carreira');
  }
  document.addEventListener('DOMContentLoaded', function(){
    [80, 400, 1000, 2000].forEach(t=>setTimeout(guardLoop, t));
  });
  // REMOVED: Performance optimization - 1500ms setInterval polling
  // setInterval(guardLoop, 1500);
})();


