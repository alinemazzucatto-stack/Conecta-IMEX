// Gestão RH consolidada: navegação administrativa por abas, sem rotas legadas conflitantes.
(function(){
  'use strict';
  if(window.__ESSENCE_RH_TABS_V16__) return;
  window.__ESSENCE_RH_TABS_V16__ = true;

  var legacy = { grhTab:window.grhTab, sbNav:window.sbNav, switchView:window.switchView };
  var bootstrapping = false;
  var activeTab = 'colaboradores';
  var tabs = {
    colaboradores:{pane:'colaboradores',render:['grhRenderColabs']},
    enderecos:{pane:'enderecos',render:['grhRenderEnderecos']},
    remuneracao:{pane:'remuneracao',render:['grhRenderRemuneracao']},
    ferias:{pane:'ferias',render:['grhRenderFerias','renderRH']},
    beneficios:{pane:'beneficios',render:['grhRenderBeneficiosSaude']},
    documentos:{pane:'documentos',render:['grhDocsCarregar']},
    pesquisas:{pane:'pesquisas',render:[]},
    admissao:{pane:'admissao',render:['grhRenderAdmissao']},
    desligamentos:{pane:'desligamentos',render:['grhRenderDesligamentos']},
    movimentacoes:{pane:'movimentacoes',render:['grhRenderMovimentacoes']},
    acessos:{pane:'acessos',render:['acessosCarregar']},
    roadmap:{pane:'roadmap',render:['grhRenderRoadmap']}
  };

  function normalize(tab){
    tab=String(tab||'colaboradores').toLowerCase().trim();
    var aliases={'beneficios-rh':'beneficios','pesquisas-rh':'pesquisas','roadmap-produto':'roadmap','proximas-funcionalidades':'roadmap','endereco':'enderecos','gestao-ferias':'ferias'};
    return aliases[tab]||tab;
  }

  function view(){ return document.getElementById('view-gestao-rh'); }

  function deriveTab(btn){
    var preset=btn.getAttribute('data-ess-rh-tab');
    if(preset) return normalize(preset);
    var code=btn.getAttribute('onclick')||'';
    var m=code.match(/grhTab\(\s*['\"]([^'\"]+)/i);
    return normalize(m?m[1]:'');
  }

  function bindTabs(){
    var bar=document.getElementById('grh-tabs');
    if(!bar) return;
    bar.querySelectorAll('button').forEach(function(btn){
      var tab=deriveTab(btn);
      if(!tabs[tab]) return;
      btn.setAttribute('data-ess-rh-tab',tab);
      btn.removeAttribute('onclick');
      btn.type='button';
    });
  }

  function ensureStructure(){
    var v=view();
    if((!v || !document.getElementById('grh-tabs') || !document.getElementById('grh-pane-colaboradores')) && !bootstrapping){
      bootstrapping=true;
      try{ if(typeof legacy.grhTab==='function') legacy.grhTab.call(window,'colaboradores',null); }catch(e){ console.warn('[Gestão RH] reconstrução',e); }
      bootstrapping=false;
      v=view();
    }
    try{ if(typeof window.__ensurePanelsGRH==='function') window.__ensurePanelsGRH(); }catch(e){}
    bindTabs();
    return v;
  }

  function showHost(){
    var v=ensureStructure(); if(!v) return null;
    document.querySelectorAll('[id^="view-"]').forEach(function(el){
      if(el!==v){ el.classList.remove('active','beneficios-force-active'); el.style.setProperty('display','none','important'); }
    });
    var employeeBenefits=document.getElementById('view-beneficios');
    if(employeeBenefits){ employeeBenefits.classList.remove('active','beneficios-force-active'); employeeBenefits.style.setProperty('display','none','important'); employeeBenefits.style.setProperty('visibility','hidden','important'); }
    v.classList.add('active','grh-module-open');
    v.style.setProperty('display','block','important');
    v.style.setProperty('visibility','visible','important');
    v.style.setProperty('opacity','1','important');
    var bar=document.getElementById('grh-tabs'); if(bar) bar.style.setProperty('display','none','important');
    v.querySelectorAll(':scope > .hero, :scope > section.hero').forEach(function(hero){ hero.style.setProperty('display','flex','important'); });
    var back=document.getElementById('grh-back-bar'); if(back) back.style.setProperty('display','none','important');
    var moduleHero=document.getElementById('grh-module-hero'); if(moduleHero) moduleHero.style.setProperty('display','none','important');
    document.body.classList.remove('docs-rh-open');
    v.removeAttribute('data-docs-mode');
    document.querySelectorAll('#sidebar .sb-item').forEach(function(item){item.classList.toggle('active',item.id==='sb-gestao-rh');});
    var title=document.getElementById('tPageTitle'); if(title) title.textContent='Gestão RH';
    var icon=document.getElementById('tPageIcon'); if(icon) icon.textContent='🏢';
    return v;
  }

  function benefitsAdminHTML(){
    var bodySaude=typeof window.grhBeneficioCardBody==='function'?window.grhBeneficioCardBody('saude'):'<div class="empty">Carregando plano de saúde…</div>';
    var bodyOdonto=typeof window.grhBeneficioCardBody==='function'?window.grhBeneficioCardBody('odonto'):'<div class="empty">Carregando plano odontológico…</div>';
    var providers=[
      ['🏋️','Wellhub','Academias, dependentes, elegibilidade e utilização'],
      ['❤️','Starbem','Consultas, dependentes e elegibilidade'],
      ['🏥','Dasa','Exames, agendamentos, dependentes e utilização'],
      ['🧠','Optum','Psicologia, nutrição, medicina e indicadores de uso'],
      ['🍔','iFood Benefícios','VA/VR, recargas, cartões e conferência mensal']
    ];
    return '<div class="ess-benefits-admin">'+
      '<section class="ess-rh-admin-head"><div><small>GESTÃO RH · BENEFÍCIOS</small><h2>Gerenciamento de benefícios</h2><p>Controle titulares, dependentes, custos, importações e histórico. Esta é a visão administrativa do RH.</p></div><div class="ess-rh-admin-actions">'+
      '<button class="btn btn-g" type="button" onclick="grhAbrirBeneficios()">📊 Importar planilha</button>'+
      '<button class="btn btn-g" type="button" onclick="grhAbrirBeneficiosPdf()">📄 Importar PDFs</button>'+
      '<button class="btn btn-p" type="button" onclick="grhAbrirHistoricoBeneficios()">🕘 Histórico</button></div></section>'+
      '<div class="grh-bplan-card" id="grh-bplan-saude"><div class="grh-bplan-head" onclick="grhToggleBeneficioPlano(\'saude\')"><div class="grh-bplan-ico">🩺</div><div class="grh-bplan-info"><h3>Plano de Saúde — Unimed</h3><p>Titulares, dependentes, plano, status e valores mensais</p></div><div class="grh-bplan-kpis"><div class="grh-bplan-kpi"><strong id="grh-bsa-saude-total">0</strong><span>colaboradores</span></div><div class="grh-bplan-kpi"><strong id="grh-bsa-saude-custo">R$ 0,00</strong><span>custo mensal</span></div></div><div class="grh-bplan-chevron" id="grh-bplan-chevron-saude">▾</div></div><div class="grh-bplan-body" id="grh-bplan-body-saude" style="display:none">'+bodySaude+'</div></div>'+
      '<div class="grh-bplan-card" id="grh-bplan-odonto"><div class="grh-bplan-head" onclick="grhToggleBeneficioPlano(\'odonto\')"><div class="grh-bplan-ico">🦷</div><div class="grh-bplan-info"><h3>Plano Odontológico — Uniodonto</h3><p>Titulares, dependentes, plano, status e valores mensais</p></div><div class="grh-bplan-kpis"><div class="grh-bplan-kpi"><strong id="grh-bsa-odonto-total">0</strong><span>colaboradores</span></div><div class="grh-bplan-kpi"><strong id="grh-bsa-odonto-custo">R$ 0,00</strong><span>custo mensal</span></div></div><div class="grh-bplan-chevron" id="grh-bplan-chevron-odonto">▾</div></div><div class="grh-bplan-body" id="grh-bplan-body-odonto" style="display:none">'+bodyOdonto+'</div></div>'+
      '<section class="ess-provider-section"><div class="ess-provider-title"><div><h2>Outros fornecedores</h2><p>Visão de gerenciamento do pacote corporativo.</p></div><span>5 fornecedores ativos</span></div><div class="ess-provider-grid">'+providers.map(function(p){return '<article class="ess-provider-card"><div class="ess-provider-icon">'+p[0]+'</div><div><h3>'+p[1]+'</h3><p>'+p[2]+'</p></div><span class="ess-provider-status">Ativo</span></article>';}).join('')+'</div></section></div>';
  }

  function ensureSpecialPane(tab,pane){
    if(tab==='beneficios' && !pane.querySelector('.ess-benefits-admin')) pane.innerHTML=benefitsAdminHTML();
    if(tab==='documentos' && typeof window.grhDocsPainelHTML==='function' && !pane.querySelector('[data-docs-rh="1"]')) pane.innerHTML=window.grhDocsPainelHTML();
    if(tab==='pesquisas' && typeof window.grhPesquisasPainelHTML==='function' && !pane.querySelector('[data-grh-pesq="2"]')) pane.innerHTML=window.grhPesquisasPainelHTML();
    if(tab==='roadmap' && typeof window.grhRoadmapPainelHTML==='function' && pane.textContent.trim().length<80) pane.innerHTML=window.grhRoadmapPainelHTML();
  }

  function paneFor(tab){
    var id='grh-pane-'+tabs[tab].pane;
    var pane=document.getElementById(id);
    if(!pane){ pane=document.createElement('div'); pane.id=id; pane.style.display='none'; view().appendChild(pane); }
    ensureSpecialPane(tab,pane);
    return pane;
  }

  function markActive(tab){
    document.querySelectorAll('#grh-tabs button').forEach(function(btn){btn.classList.toggle('active',normalize(btn.getAttribute('data-ess-rh-tab'))===tab);});
    try{sessionStorage.setItem('grhUltimaAba',tab);}catch(e){}
  }

  function invoke(name){
    try{ if(typeof window[name]==='function') return window[name](); }catch(e){ console.warn('[Gestão RH] '+name,e); }
  }

  function prepareCollaborators(){
    var pane=document.getElementById('grh-pane-colaboradores'); if(!pane) return null;
    pane.classList.add('ess-rh-pane-organized','ess-colab-pane');
    pane.style.setProperty('display','block','important');

    var restored=document.getElementById('grh-colaboradores-restaurado');
    if(restored){ restored.classList.remove('active'); restored.style.setProperty('display','none','important'); }
    var legacyKpis=document.getElementById('colabKpiTopV1');
    if(legacyKpis) legacyKpis.style.setProperty('display','none','important');

    var table=document.getElementById('grh-colab-table');
    var listCard=table&&table.closest('.card');
    if(listCard){
      listCard.classList.add('ess-rh-board','ess-colab-list-board');
      listCard.style.setProperty('display','block','important');
      var heading=listCard.querySelector('.cht h2'); if(heading) heading.textContent='Lista de colaboradores';
    }

    var summary=pane.querySelector('.ess-colab-summary-board');
    if(!summary){
      summary=document.createElement('section');
      summary.className='ess-rh-board ess-colab-summary-board';
      summary.innerHTML='<div class="ess-rh-board-head"><div><small>VISÃO GERAL</small><h2>Resumo da equipe</h2><p>Indicadores rápidos da base. A listagem completa fica no quadro seguinte.</p></div></div><div class="ess-colab-overview"></div>';
    }
    var overview=summary.querySelector('.ess-colab-overview');
    if(listCard){ pane.insertBefore(summary,listCard); pane.insertBefore(listCard,summary.nextSibling); }
    else pane.insertBefore(summary,pane.firstChild);

    var sectors=document.getElementById('grh-setor-stats');
    if(sectors){
      var sectorBoard=document.getElementById('colabSetoresBottomV1');
      if(!sectorBoard){
        sectorBoard=document.createElement('section'); sectorBoard.id='colabSetoresBottomV1';
        sectorBoard.innerHTML='<div class="colab-setores-head-v1"><h2>Distribuição por setor</h2><p>Leitura complementar da composição da equipe por área.</p></div>';
      }
      sectorBoard.className='ess-rh-board ess-colab-sector-board';
      sectors.classList.add('colab-setores-grid-final-v1'); sectorBoard.appendChild(sectors); pane.appendChild(sectorBoard);
    }
    return overview;
  }

  function enhanceCollaborators(){
    var overview=prepareCollaborators(); if(!overview) return;
    Promise.resolve(typeof window.grhGetColabs==='function'?window.grhGetColabs(true):[]).then(function(list){
      list=Array.isArray(list)?list:[];
      var norm=function(v){return String(v||'').toLowerCase();};
      var ativos=list.filter(function(c){return !/inativo|deslig/.test(norm(c.status));});
      var clt=ativos.filter(function(c){return /clt|sim|true/.test(norm(c.clt||c.contrato||c.tipoContrato));}).length;
      var pj=Math.max(ativos.length-clt,0);
      var vals=[['👥','Total',list.length,'cadastros na base'],['✅','Ativos',ativos.length,'em operação'],['📄','CLT',clt,'contratos ativos'],['🤝','PJ',pj,'prestadores ativos']];
      overview.innerHTML=vals.map(function(v){return '<article><span>'+v[0]+'</span><div><small>'+v[1]+'</small><strong>'+v[2]+'</strong><p>'+v[3]+'</p></div></article>';}).join('');
      prepareCollaborators();
    }).catch(function(){});
  }

  function organizePane(pane){
    if(!pane) return;
    pane.classList.add('ess-rh-pane-organized');
    Array.prototype.forEach.call(pane.children,function(child){
      if(child.id==='grh-tabs'||child.classList.contains('hero')) return;
      if(child.classList.contains('card')||child.tagName==='SECTION') child.classList.add('ess-rh-content-block');
    });
  }

  function renderTab(tab){
    var cfg=tabs[tab], pane=paneFor(tab);
    pane.style.setProperty('display','block','important');
    pane.classList.add('active');
    if(tab==='colaboradores') prepareCollaborators();
    if(tab==='remuneracao') window.__remPremiumRenderedV3=false;
    if(tab==='movimentacoes') window.__movRealRendered=false;
    cfg.render.forEach(invoke);
    if(tab==='ferias') invoke('politicaCarregar');
    if(tab==='beneficios') setTimeout(function(){invoke('grhRenderBeneficiosSaude');},80);
    if(tab==='documentos') setTimeout(function(){invoke('grhDocsCarregar');},60);
    organizePane(pane);
    if(tab==='colaboradores'){setTimeout(enhanceCollaborators,100);setTimeout(enhanceCollaborators,700);setTimeout(enhanceCollaborators,1500);}
    return pane;
  }

  function openTab(tab){
    tab=normalize(tab); if(!tabs[tab]) tab='colaboradores';
    var v=showHost(); if(!v) return false;
    activeTab=tab;
    v.querySelectorAll('[id^="grh-pane-"]').forEach(function(p){p.style.setProperty('display','none','important');p.classList.remove('active');});
    var pane=renderTab(tab);
    pane.style.setProperty('display','block','important'); pane.classList.add('active');
    markActive(tab);
    requestAnimationFrame(function(){ showHost(); pane.style.setProperty('display','block','important'); markActive(tab); });
    setTimeout(function(){ showHost(); pane.style.setProperty('display','block','important'); markActive(tab); },120);
    return false;
  }

  window.grhTab=function(tab){return openTab(tab);};
  window.sbNav=function(id){ if(normalize(id)==='gestao-rh') return openTab('colaboradores'); return typeof legacy.sbNav==='function'?legacy.sbNav.apply(this,arguments):false; };
  window.switchView=function(id){ if(normalize(id)==='gestao-rh') return openTab('colaboradores'); return typeof legacy.switchView==='function'?legacy.switchView.apply(this,arguments):window.sbNav(id); };
  window.voltarGestaoRH=window.voltarParaGestaoRH=window.voltarMenuGestaoRH=function(){return openTab('colaboradores');};

  document.addEventListener('click',function(ev){
    var btn=ev.target&&ev.target.closest?ev.target.closest('#grh-tabs button[data-ess-rh-tab]'):null;
    if(!btn) return;
    ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
    openTab(btn.getAttribute('data-ess-rh-tab'));
  },true);

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ensureStructure();}); else ensureStructure();
})();