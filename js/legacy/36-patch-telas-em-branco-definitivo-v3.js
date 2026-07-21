// ===== script: patch-telas-em-branco-definitivo-v3-js =====
(function(){
  'use strict';
  if(window.__PATCH_TELAS_BRANCAS_V3__) return;
  window.__PATCH_TELAS_BRANCAS_V3__ = true;

  function $(id){ return document.getElementById(id); }
  function area(){ return document.querySelector('.main-area') || $('appShell') || document.body; }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function txt(el){ return ((el && el.innerText) || '').replace(/\s+/g,' ').trim(); }
  function visible(el){ return !!el && getComputedStyle(el).display !== 'none' && el.offsetParent !== null; }
  function isEmpty(el){ return !el || txt(el).length < 45; }
  function setTop(icon,label){ var pi=$('tPageIcon'); if(pi){ pi.textContent=icon; pi.style.display=''; } var pt=$('tPageTitle'); if(pt) pt.textContent=label; }
  function ensureView(id){ var v=$('view-'+id); if(!v){ v=document.createElement('div'); v.id='view-'+id; v.className='page'; area().appendChild(v); } v.classList.add('page'); if(v.parentElement && v.parentElement.id && v.parentElement.id.indexOf('view-')===0) area().appendChild(v); return v; }
  function hideAllViews(){ document.querySelectorAll('[id^="view-"]').forEach(function(el){ el.classList.remove('active','dev-active'); el.style.setProperty('display','none','important'); }); var hero=$('mainHero'); if(hero) hero.style.setProperty('display','none','important'); }
  function showOnly(id, icon, label){ var v=ensureView(id); hideAllViews(); v.style.setProperty('display','block','important'); v.classList.add('active'); document.querySelectorAll('.sb-item[id^="sb-"]').forEach(function(sb){ sb.classList.toggle('active', sb.id === 'sb-'+id); }); if(icon || label) setTop(icon || '▫️', label || id); return v; }

  var beneficios = [
    ['🍔','iFood Benefícios','Cartão alimentação/refeição, saldo, extrato, cartão virtual/físico e Clube iFood.',['Baixar o app iFood Benefícios','Consultar saldo e extrato','Ativar cartão virtual','Solicitar cartão físico','Confirmar aceite do estabelecimento'],'https://www.ifood.com.br/clube'],
    ['🏋️','Wellhub','Plataforma de bem-estar com academias, estúdios, modalidades e apps parceiros.',['Consultar rede credenciada','Escolher plano','Incluir até 3 dependentes','Usar check-in pelo app'],'https://wellhub.com/pt-br/'],
    ['🏥','Dasa | Colab+','Teleconsulta, exames, vacinas, medicamentos com desconto e apoio à saúde.',['Teleconsulta Nav sem custo','Exames laboratoriais com desconto','Até 4 dependentes','Consultar rede parceira'],'https://nav.dasa.com.br/entrar'],
    ['❤️','Starbem','Consultas por videochamada com médico, psicólogo e nutricionista.',['1 consulta médica/mês','2 consultas psicológicas/mês','1 consulta nutricional/mês','Solicitar dependentes ao RH'],'https://www.starbem.app/'],
    ['🧠','Optum','Apoio psicológico, social, jurídico e financeiro por atendimento telefônico.',['Segunda a sexta, 8h às 20h','Emergência 24/7','Orientação jurídica preliminar','Consultoria financeira'],'https://www.optum.com.br/'],
    ['🩺','Unimed','Plano de saúde, guia médico, reembolso, coparticipação e dependentes.',['Consultar guia médico','Acompanhar coparticipação','Orientações de reembolso','Dependentes e elegibilidade'],'#']
  ];

  function beneficiosHTML(){
    return '<section class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important"><div class="h-content"><div class="h-eyebrow">Central de benefícios IMEX</div><h1>MEUS BENEFÍCIOS</h1><p>Consulte acessos, orientações, dependentes, aplicativos e perguntas frequentes de cada benefício.</p></div><div class="h-stats"><div class="h-stat"><span class="h-num">6</span><span class="h-lbl">Benefícios</span></div><div class="h-stat"><span class="h-num">FAQ</span><span class="h-lbl">Orientações</span></div></div></section>'+
      '<div class="blank-safe-benefits">'+beneficios.map(function(b){ return '<article class="blank-safe-benefit"><div class="blank-safe-benefit-head"><div class="blank-safe-benefit-ico">'+b[0]+'</div><div><h3>'+esc(b[1])+'</h3><p>'+esc(b[2])+'</p></div></div><ul>'+b[3].map(function(i){return '<li>'+esc(i)+'</li>';}).join('')+'</ul><div class="blank-safe-actions"><button type="button" onclick="benAbrirModal && benAbrirModal(\'beneficio\')">Solicitar ao RH</button>'+(b[4]&&b[4]!=='#'?'<a target="_blank" rel="noopener" href="'+esc(b[4])+'">Acessar</a>':'')+'</div></article>'; }).join('')+'</div>'+
      '<div class="blank-safe-note"><strong>Observação:</strong> em caso de dificuldade de acesso, inclusão ou exclusão de dependentes, registre a solicitação para análise do RH.</div>';
  }

  function renderBeneficiosDireto(){
    var v = showOnly('beneficios','🎁','Meus Benefícios');
    v.innerHTML = beneficiosHTML();
    return v;
  }

  function renderGestaoRHBeneficiosDireto(){
    var v = showOnly('gestao-rh','🏢','Gestão RH');
    garantirTabsRH();
    var pane = $('grh-pane-beneficios-rh');
    if(pane){
      document.querySelectorAll('#view-gestao-rh [id^="grh-pane-"]').forEach(function(p){ p.style.display='none'; });
      pane.style.setProperty('display','block','important');
      document.querySelectorAll('#grh-tabs .tab').forEach(function(b){ b.classList.toggle('active', /benef/i.test(b.textContent||'')); });
      if(isEmpty(pane)) pane.innerHTML = beneficiosRhHTML();
    }
    return v;
  }

  function beneficiosRhHTML(){
    return '<div class="card"><div class="card-head"><div class="cht"><h2>🎁 Benefícios</h2><p>Gestão de Unimed, Wellhub, Starbem, Dasa, Optum, iFood, dependentes, elegibilidade e custos.</p></div></div><div class="card-body"><div class="blank-safe-grid">'+beneficios.map(function(b){ return '<div class="blank-safe-card"><h3>'+b[0]+' '+esc(b[1])+'</h3><p>'+esc(b[2])+'</p></div>'; }).join('')+'</div><div class="blank-safe-note">Use este módulo para organizar solicitações, custos, dependentes e regras de elegibilidade dos benefícios.</div></div></div>';
  }

  function garantirTabsRH(){
    var v=ensureView('gestao-rh');
    var tabs=$('grh-tabs');
    if(!tabs){
      v.innerHTML = '<section class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important"><div class="h-content"><div class="h-eyebrow">Central administrativa</div><h1>GESTÃO RH</h1><p>Administração de colaboradores, férias, documentos e benefícios.</p></div></section><div id="grh-tabs" class="tabs"></div>';
      tabs=$('grh-tabs');
    }
    var items=[['colaboradores','👥 Colaboradores'],['enderecos','📍 Endereços'],['remuneracao','💰 Remuneração'],['movimentacoes','🔄 Movimentações'],['admissao','✅ Admissões'],['desligamentos','❌ Desligamentos'],['ferias','🌴 Gestão de Férias'],['documentos','📄 Documentos'],['beneficios-rh','🎁 Benefícios'],['acessos','🔐 Acessos e Permissões']];
    if(tabs && !tabs.querySelector('[onclick*="beneficios-rh"]')){
      tabs.innerHTML = items.map(function(it){ return '<button class="tab" type="button" onclick="grhTab(\''+it[0]+'\',this)">'+it[1]+'</button>'; }).join('');
    }
    var host = tabs && tabs.parentElement ? tabs.parentElement : v;
    if(!$('grh-pane-beneficios-rh')){
      var pane=document.createElement('div'); pane.id='grh-pane-beneficios-rh'; pane.style.display='none'; pane.innerHTML=beneficiosRhHTML(); host.appendChild(pane);
    }
    if(!$('grh-pane-documentos')){
      var doc=document.createElement('div'); doc.id='grh-pane-documentos'; doc.style.display='none'; doc.innerHTML='<div class="card"><div class="card-head"><div class="cht"><h2>📄 Documentos</h2><p>Contratos, termos, políticas e arquivos do prontuário.</p></div></div><div class="card-body"><div class="empty"><div class="ei">📄</div>Documentos organizados neste módulo.</div></div></div>'; host.appendChild(doc);
    }
  }

  var fallbackInfo = {
    pesquisas:['📋','Pesquisas','Central de pesquisas internas, clima e enquetes.'],
    ouvidoria:['📢','Ouvidoria','Canal para registrar relatos, dúvidas e manifestações.'],
    'conecta-ai':['🤖','Conecta AI','Assistente interno para dúvidas e apoio às rotinas.'],
    dashboard:['📊','Dashboard RH','Indicadores e visão geral do RH.'],
    auditoria:['📝','Auditoria','Histórico de ações, logs e acompanhamento.'],
    solicitacao:['🌴','Férias','Solicitação e acompanhamento de férias.'],
    intranet:['🏠','Intranet','Comunicados, aniversariantes, feed e informações internas.'],
    colaboradores:['👥','Colaboradores','Base de colaboradores e dados cadastrais.'],
    usuarios:['🔑','Gestão de Acessos','Usuários e permissões do sistema.']
  };
  function fallbackHTML(id){ var m=fallbackInfo[id] || ['▫️',id,'Tela do módulo.']; return '<section class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important"><div class="h-content"><div class="h-eyebrow">Conecta IMEX</div><h1>'+esc(m[1]).toUpperCase()+'</h1><p>'+esc(m[2])+'</p></div></section><div class="blank-safe-note">Esta tela foi carregada em modo seguro para evitar página em branco.</div>'; }

  var oldSb = window.sbNav;
  var oldSwitch = window.switchView;
  var oldShow = window.showView;
  var oldGrh = window.grhTab;

  // REMOVED: Consolidated in 000-core-functions.js
  // function navegar(id){
  //   if(id==='meus-beneficios') id='beneficios';
  //   if(id==='beneficios') return renderBeneficiosDireto();
  //   if(id==='beneficios-rh') return renderGestaoRHBeneficiosDireto();
  //   var ret;
  //   try{ if(typeof oldSb === 'function') ret = oldSb.apply(this, arguments); }catch(e){ console.warn('[patch-v3] sbNav anterior falhou:', id, e); }
  //   setTimeout(function(){ conferirTela(id); }, 80);
  //   setTimeout(function(){ conferirTela(id); }, 350);
  //   return ret;
  // }

  function conferirTela(id){
    if(id==='beneficios') return renderBeneficiosDireto();
    if(id==='gestao-rh') garantirTabsRH();
    var v=$('view-'+id);
    if(!v) return;
    var shouldShow = v.classList.contains('active') || getComputedStyle(v).display !== 'none';
    if(shouldShow && isEmpty(v) && fallbackInfo[id]) v.innerHTML = fallbackHTML(id);
  }

  window.renderBeneficiosCards = renderBeneficiosDireto;
  window.renderBeneficiosHub = renderBeneficiosDireto;
  window.renderBeneficios = renderBeneficiosDireto;
  window.benCarregar = renderBeneficiosDireto;
  window.montarBeneficiosExato = renderBeneficiosDireto;
  window.sbNav = navegar;
  window.switchView = function(id){ if(id==='beneficios' || id==='meus-beneficios') return renderBeneficiosDireto(); if(id==='beneficios-rh') return renderGestaoRHBeneficiosDireto(); try{ return typeof oldSwitch==='function' ? oldSwitch.apply(this,arguments) : navegar.apply(this,arguments); } finally { setTimeout(function(){ conferirTela(id); },120); } };
  window.showView = function(id){ if(id==='beneficios' || id==='meus-beneficios') return renderBeneficiosDireto(); return typeof oldShow==='function' ? oldShow.apply(this,arguments) : navegar.apply(this,arguments); };
  window.grhTab = function(tab, btn){
    if(tab==='beneficios-rh' || tab==='beneficios') return renderGestaoRHBeneficiosDireto();
    var ret; try{ ret = typeof oldGrh==='function' ? oldGrh.apply(this,arguments) : undefined; }catch(e){ console.warn('[patch-v3] grhTab anterior falhou:', tab, e); }
    setTimeout(function(){ if(tab==='beneficios-rh') renderGestaoRHBeneficiosDireto(); },80);
    return ret;
  };

  function start(){ garantirTabsRH(); var vb=$('view-beneficios'); if(vb && visible(vb)) renderBeneficiosDireto(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(start,150); setTimeout(start,700); });
  else { setTimeout(start,100); setTimeout(start,700); }
  window.addEventListener('load', function(){ setTimeout(start,500); });
  window._corrigirTelasBrancasV3 = function(id){ return id==='beneficios-rh' ? renderGestaoRHBeneficiosDireto() : (id ? navegar(id) : renderBeneficiosDireto()); };
})();



