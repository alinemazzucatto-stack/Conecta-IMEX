// ===== script: imex-fase1-oficial-js =====
(function(){
  'use strict';
  if(window.__rh_FASE1_OFICIAL__) return;
  window.__rh_FASE1_OFICIAL__ = true;

  const META = {
    intranet:['🏠','Intranet'], 'estrutura-carreira':['🏢','Estrutura e Carreira'], desenvolvimento:['🌱','Desenvolvimento'], beneficios:['🎁','Benefícios'], solicitacao:['🌴','Férias'], pesquisas:['📋','Pesquisas'], ouvidoria:['📢','Ouvidoria'], 'conecta-ai':['🤖','Conecta AI'], gamificacao:['🏆','Gamificação'],
    equipe:['👥','Equipe'], 'aprovacao-ferias':['🌴','Aprovação de Férias'], gestor:['🌴','Aprovação de Férias'],
    'gestao-rh':['🏢','Gestão RH'], 'desenvolvimento-talentos':['🌱','Desenvolvimento & Talentos'], dashboard:['📊','Dashboard'], auditoria:['📝','Auditoria'],
    organograma:['🏢','Organograma'], trilhas:['🚀','Trilhas de Carreira'], experiencia:['📆','Minha Experiência'], cargos:['📄','Descritivo de Cargos'], disc:['🧠','DISC'], 'meu-desenvolvimento':['✨','Meu Desenvolvimento'], pdi:['🎯','PDI'], usuarios:['🔑','Gestão de Acessos']
  };
  const MENUS = {
    colaborador:['intranet','estrutura-carreira','desenvolvimento','beneficios','solicitacao','pesquisas','conecta-ai','ouvidoria','gamificacao'],
    gestor:['equipe','aprovacao-ferias','pesquisas','gamificacao'],
    rh:['gestao-rh','dashboard','ouvidoria','conecta-ai','auditoria','roadmap-produto'],
    'rh-colaborador':['intranet','estrutura-carreira','desenvolvimento','beneficios','solicitacao','pesquisas','ouvidoria','gamificacao']
  };
  const PERMISSOES = {
    colaborador:['intranet','estrutura-carreira','desenvolvimento','beneficios','solicitacao','pesquisas','ouvidoria','conecta-ai','gamificacao','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento'],
    gestor:['equipe','aprovacao-ferias','gestor','pesquisas','gamificacao','intranet','estrutura-carreira','desenvolvimento','beneficios','solicitacao','conecta-ai','ouvidoria','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento'],
    rh:['gestao-rh','desenvolvimento-talentos','dashboard','auditoria','conecta-ai','roadmap-produto','gamificacao','pesquisas','experiencia','disc','cargos','trilhas','pdi','usuarios'],
    'rh-colaborador':['intranet','estrutura-carreira','desenvolvimento','beneficios','solicitacao','pesquisas','ouvidoria','gamificacao','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento']
  };
  const ALIAS = {'aprovacao-ferias':'gestor'};

  // REMOVED: Consolidated in 000-core-functions.js
  // function roleAtual(){
  //   const r = String(window.role || sessionStorage.getItem('userRole') || window._roleAtivo || window._roleReal || 'colaborador').toLowerCase();
  //   if(r.includes('rh')) return 'rh';
  //   if(r.includes('gestor')) return 'gestor';
  //   return 'colaborador';
  // }
  function setTopbar(icon,label){
    const pi=document.getElementById('tPageIcon'); if(pi){pi.textContent=icon; pi.style.display='';}
    const pt=document.getElementById('tPageTitle'); if(pt) pt.textContent=label;
  }
  function ensureView(id){
    let v=document.getElementById('view-'+id);
    if(!v){ v=document.createElement('div'); v.id='view-'+id; v.className='page'; v.style.display='none'; (document.querySelector('.main-area')||document.body).appendChild(v); }
    return v;
  }
  function hideAll(){
    document.querySelectorAll('[id^="view-"]').forEach(el=>{el.classList.remove('active','dev-active','beneficios-force-active');el.style.setProperty('display','none','important');});
    const hero=document.getElementById('mainHero'); if(hero) hero.style.setProperty('display','none','important');
  }
  function ensureSidebarItem(id){
    const sidebar=document.getElementById('sidebar'); if(!sidebar) return null;
    const meta=META[id] || ['▫️',id];
    let el=document.getElementById('sb-'+id);
    if(!el){el=document.createElement('div'); el.id='sb-'+id; el.className='sb-item'; el.innerHTML='<span></span><span class="sb-tip"></span>';}
    el.style.cursor='pointer'; el.title=meta[1];
    let icon=el.querySelector('span:first-child') || el.appendChild(document.createElement('span')); icon.textContent=meta[0];
    let tip=el.querySelector('.sb-tip'); if(!tip){tip=document.createElement('span');tip.className='sb-tip';el.appendChild(tip);} tip.textContent=meta[1];
    el.onclick=function(ev){ if(ev){ev.preventDefault();ev.stopPropagation();} navegar(id); return false; };
    return el;
  }
  function aplicarMenu(){
    const r=roleAtual(); const order=MENUS[r] || MENUS.colaborador;
    const sidebar=document.getElementById('sidebar'); const spacer=sidebar ? sidebar.querySelector('.sb-spacer') : null;
    order.forEach(ensureSidebarItem);
    if(sidebar && spacer){ order.forEach(id=>{const el=document.getElementById('sb-'+id); if(el) sidebar.insertBefore(el,spacer);}); }
    document.querySelectorAll('.sb-item[id^="sb-"]').forEach(el=>el.style.setProperty('display','none','important'));
    order.forEach(id=>{const el=document.getElementById('sb-'+id); if(el) el.style.setProperty('display','flex','important');});
    const pLabel=document.getElementById('pLabel'); if(pLabel) pLabel.textContent = r==='rh'?'RH':(r==='gestor'?'Gestor':'Colaborador');
    const pDot=document.getElementById('pDot'); if(pDot) pDot.textContent = r==='rh'?'👩‍💻':(r==='gestor'?'👨‍💼':'👤');
  }

  const BENEFICIOS = [
    {key:'ifood',ico:'🍔',nome:'iFood Benefícios',pill:'Central do cartão',desc:'Vale alimentação/refeição: app, saldo, cartão virtual, cartão físico e calendário de recarga.',busca:'ifood cartão saldo alimentação refeição va vr cartão virtual físico app recarga',passos:['Baixe o app iFood Benefícios no celular.','Faça login com CPF e dados cadastrados.','Confira o cartão virtual para usar enquanto o físico não chega.','Acompanhe saldo, extrato e uso pelo aplicativo.'],servicos:['Consulta de saldo e extrato','Cartão virtual e físico','Pagamento em estabelecimentos habilitados','Recarga todo dia 30/31 ou último dia útil do mês'],dependentes:'Não se aplica como benefício de dependentes.',botoes:[['📲 Baixar Android','https://play.google.com/store/search?q=iFood%20Benef%C3%ADcios&c=apps'],['🍎 Baixar iPhone','https://apps.apple.com/br/app/ifood-benef%C3%ADcios/id1550867930'],['💳 Acessar iFood Benefícios','https://beneficios.ifood.com.br/']]},
    {key:'wellhub',ico:'💪',nome:'Wellhub',pill:'Saúde e academias',desc:'Acesso a academias, estúdios, apps de bem-estar e planos para atividade física.',busca:'wellhub gympass academia treino saúde dependentes aplicativo',passos:['Acesse o app ou site Wellhub.','Faça o cadastro com seus dados corporativos.','Escolha o plano disponível.','Ative academias, apps e parceiros conforme o plano escolhido.'],servicos:['Academias e estúdios parceiros','Apps de treino e bem-estar','Até 3 dependentes','Dependentes podem ser familiares, amigos ou pessoas conhecidas'],dependentes:'Permite até 3 dependentes.',botoes:[['🌐 Acessar Wellhub','https://wellhub.com/pt-br/'],['📲 Android','https://play.google.com/store/search?q=wellhub&c=apps'],['🍎 iPhone','https://wellhub.com/pt-br/']]},
    {key:'starbem',ico:'❤️',nome:'Starbem',pill:'Telemedicina',desc:'Consultas por videochamada com médico, psicólogo e nutricionista.',busca:'starbem telemedicina consulta médico psicólogo nutricionista dependentes',passos:['Acesse a plataforma Starbem.','Realize o cadastro conforme orientação do RH.','Escolha o tipo de atendimento disponível.','Agende ou inicie a consulta conforme disponibilidade.'],servicos:['1 consulta médica gratuita por mês','4 consultas gratuitas com psicólogos por mês','1 consulta gratuita com nutricionista por mês','Dependentes mediante solicitação ao RH'],dependentes:'Inclusão de dependentes mediante solicitação ao RH.',botoes:[['🌐 Acessar Starbem','https://www.starbem.app/'],['🎫 Solicitar inclusão de dependente','https://forms.gle/8m7s3qyMopPHKnq27']]},
    {key:'dasa',ico:'🏥',nome:'Dasa NAV',pill:'Exames e saúde',desc:'Plataforma de saúde com acesso NAV Dasa, descontos, rede e orientações.',busca:'dasa nav exames saúde colab dependentes acesso login',passos:['Acesse o portal NAV Dasa.','Entre com seus dados cadastrados.','Consulte serviços, rede e orientações.','Em caso de erro de acesso, acione o RH.'],servicos:['Acesso ao portal NAV','Exames e rede parceira','Orientações de saúde','Até 4 dependentes'],dependentes:'Permite até 4 dependentes.',botoes:[['🌐 Acessar Dasa NAV','https://nav.dasa.com.br/entrar'],['📲 Android','https://play.google.com/store/search?q=nav%20dasa&c=apps'],['🍎 iPhone','https://nav.dasa.com.br/entrar']]},
    {key:'optum',ico:'🧠',nome:'Optum',pill:'Apoio emocional',desc:'Apoio psicológico, social, jurídico e financeiro por atendimento especializado.',busca:'optum psicologia jurídico financeiro emocional apoio dependentes',passos:['Consulte os canais de atendimento divulgados pelo RH.','Informe que faz parte do benefício corporativo IMEX.','Escolha o tipo de orientação desejada.','Em caso de dúvida, peça apoio ao RH.'],servicos:['Apoio psicológico','Orientação social','Orientação jurídica preliminar','Consultoria financeira'],dependentes:'Permite até 2 dependentes.',botoes:[['🌐 Site Optum','https://www.optum.com.br/'],['📩 Falar com RH','mailto:rh@empresa.com?subject=D%C3%BAvida%20sobre%20Optum']]},
    {key:'unimed',ico:'🩺',nome:'Unimed',pill:'Plano de saúde',desc:'Plano de saúde corporativo, guia médico, coparticipação, carências e dependentes.',busca:'unimed plano saúde guia médico coparticipação dependentes carência reembolso',passos:['Consulte a carteirinha e dados do plano.','Use o guia médico para localizar atendimento.','Acompanhe coparticipação quando houver.','Solicite orientação ao RH para inclusão de dependentes.'],servicos:['Plano nacional coparticipativo','Mensalidade do colaborador custeada pela empresa','Dependentes não custeados pela empresa','Carência de obstetrícia: 300 dias'],dependentes:'Dependentes podem ser incluídos conforme regra do plano e custo vigente.',botoes:[['🌐 Guia médico Unimed','https://www.unimed.coop.br/'],['📩 Falar com RH','mailto:rh@empresa.com?subject=D%C3%BAvida%20sobre%20Unimed']]}
  ];

  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function benefitCard(b){
    return `<article class="benefit-item" data-keywords="${esc(b.busca)}"><button class="benefit-toggle" type="button" onclick="connBenefToggle(this)"><div class="benefit-icon">${b.ico}</div><div class="benefit-main"><h3>${esc(b.nome)}</h3><p>${esc(b.desc)}</p></div><div class="benefit-meta"><span class="pill">${esc(b.pill)}</span><span class="plus">+</span></div></button><div class="detail-panel"><div class="detail-shell"><div class="grid"><div class="info-card span-7"><h3>📲 Como usar</h3><ol>${b.passos.map(i=>`<li>${esc(i)}</li>`).join('')}</ol></div><div class="info-card span-5 black-card"><h3>👨‍👩‍👧 Dependentes</h3><p>${esc(b.dependentes)}</p><div class="chips">${b.servicos.slice(0,3).map(i=>`<span class="chip">${esc(i)}</span>`).join('')}</div></div><div class="info-card span-6"><h3>✅ O que está incluso</h3><ul>${b.servicos.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div><div class="info-card span-6"><h3>🔗 Acessos rápidos</h3><p>Use os botões abaixo para acessar plataforma, aplicativo ou acionar o RH.</p><div class="btn-row">${b.botoes.map((bt,idx)=>`<a class="btn ${idx===0?'btn-green':(idx===1?'btn-orange':'btn-dark')}" target="_blank" rel="noopener" href="${esc(bt[1])}">${esc(bt[0])}</a>`).join('')}</div><div class="notice"><strong>Importante:</strong> em caso de dificuldade de acesso, inclusão/exclusão de dependentes ou inconsistência, fale com o RH.</div></div></div></div></div></article>`;
  }
  function beneficiosHTML(){
    return `<div class="beneficios-imex-v5"><div class="wrap"><section class="hero-benef"><div class="kicker">💙 Pacote de Benefícios IMEX</div><h1>Hub de Bem-Estar e Benefícios</h1><p>Consulte seus benefícios, veja instruções de uso, acesse aplicativos, solicite dependentes e acompanhe as orientações do RH em um único lugar.</p></section><section class="tip-strip"><div><strong>Dica rápida</strong><span>Clique em um card para abrir as informações completas, botões de acesso, dependentes e FAQ.</span></div></section><section class="progress-section"><h2>Explore seus benefícios</h2><p>Abra os cards abaixo para conhecer melhor cada benefício disponível para você.</p><div class="progress-list">${BENEFICIOS.map(b=>`<span class="progress-chip" data-chip="${esc(b.key)}">○ ${esc(b.nome)}</span>`).join('')}</div></section><section class="benefits-section"><div class="section-head"><h2>Escolha um benefício</h2><p>Abra cada card para consultar detalhes, dependentes, serviços, descontos, canais e orientações de uso.</p></div><div class="search-row"><span>🔎</span><input id="beneficiosBuscaV5" type="search" placeholder="Buscar por benefício, cartão, consulta, dependentes..." oninput="imexBenefSearch(this.value)"></div><div class="benefit-list" id="beneficiosListaV5">${BENEFICIOS.map(benefitCard).join('')}</div><div class="empty-state" id="beneficiosEmptyV5">Nenhum benefício encontrado.</div></section><section class="general-faq"><h2>Dúvidas frequentes</h2><p>Informações gerais sobre acesso, dependentes e uso dos benefícios.</p><div class="accordion"><div class="acc-item"><button class="acc-btn" type="button" onclick="connAccToggle(this)">Quando cai o vale alimentação?</button><div class="acc-content">A recarga do VA ocorre todo dia 30/31 ou no último dia útil do mês.</div></div><div class="acc-item"><button class="acc-btn" type="button" onclick="connAccToggle(this)">Como solicito dependentes?</button><div class="acc-content">A solicitação deve ser enviada ao RH, respeitando a quantidade permitida em cada benefício.</div></div><div class="acc-item"><button class="acc-btn" type="button" onclick="connAccToggle(this)">O que fazer se meu acesso não funcionar?</button><div class="acc-content">Confira seus dados de cadastro e, se o erro continuar, envie um print para o RH.</div></div></div></section><section class="satisfaction"><h2>Essa página te ajudou?</h2><p>Seu feedback ajuda o RH a melhorar a comunicação dos benefícios.</p><div class="satisfaction-actions"><button class="btn btn-green" type="button" onclick="alert('Obrigada pelo feedback!')">👍 Sim, ajudou</button><button class="btn btn-dark" type="button" onclick="alert('Obrigada! O RH pode ajustar as informações.')">💬 Preciso de mais informações</button></div></section><section class="footer-rh"><h2>Ficou com dúvida?</h2><p>Entre em contato com o RH para orientação sobre acesso, dependentes e regras de utilização.</p><div class="contacts"><div class="contact-card"><h3>Aline Mazzucatto</h3><p>Unidade Londrina</p><a href="mailto:alinelima364@outlook.com">Enviar e-mail</a></div><div class="contact-card"><h3>Vânia Miotto</h3><p>Unidade Pato Branco</p><a href="mailto:rh@empresa.com">Enviar e-mail</a></div></div></section></div></div>`;
  }
  function renderBeneficios(){
    const v=ensureView('beneficios'); v.innerHTML=beneficiosHTML(); return v;
  }
  function renderEquipe(){
    const v=ensureView('equipe');
    v.innerHTML = `<section class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important"><div class="h-content"><div class="h-eyebrow">Gestão do gestor</div><h1>EQUIPE</h1><p>Acompanhe informações gerais da equipe, colaboradores ativos e pendências.</p></div></section><div class="imex-equipe-grid"><div class="imex-equipe-card"><strong>—</strong><span>Colaboradores na equipe</span></div><div class="imex-equipe-card"><strong>—</strong><span>Férias pendentes</span></div><div class="imex-equipe-card"><strong>—</strong><span>Pesquisas em aberto</span></div></div><div class="card" style="margin-top:16px"><div class="card-head"><div class="cht"><h2>Resumo da equipe</h2><p>Área preparada para listar os colaboradores vinculados ao gestor.</p></div></div><div class="card-body"><div class="empty"><div class="ei">👥</div>Nenhuma equipe carregada no momento.</div></div></div>`;
    return v;
  }
  function garantirGestaoRHTabs(){
    const v=document.getElementById('view-gestao-rh'); if(!v) return;
    const tabs=v.querySelector('#grh-tabs'); if(!tabs) return;
    const official=[['colaboradores','👥 Colaboradores'],['enderecos','📍 Endereços'],['remuneracao','💰 Remuneração'],['ferias','🌴 Férias'],['beneficios-rh','🎁 Benefícios'],['documentos','📄 Documentos'],['pesquisas-rh','📋 Pesquisas'],['admissao','📝 Admissão'],['desligamentos','🚪 Desligamentos'],['movimentacoes','🔄 Movimentações'],['acessos','🔐 Acessos e Permissões'],['roadmap-produto','🗺️ Roadmap do Produto']];
    tabs.innerHTML = official.map((x,i)=>`<button class="tab ${i===0?'active':''}" onclick="grhTab('${x[0]}',this)">${x[1]}</button>`).join('');
    official.forEach(x=>{let pane=document.getElementById('grh-pane-'+x[0]); if(!pane){pane=document.createElement('div'); pane.id='grh-pane-'+x[0]; pane.style.display='none'; pane.innerHTML=`<div class="card"><div class="card-head"><div class="cht"><h2>${x[1]}</h2><p>Módulo em organização dentro da Gestão RH.</p></div></div><div class="card-body"><div class="empty"><div class="ei">${x[1].split(' ')[0]}</div>Conteúdo preparado para esta aba.</div></div></div>`; tabs.parentNode.appendChild(pane);}});
  }

  window.connBenefToggle=function(btn){ const item=btn.closest('.benefit-item'); if(!item) return; item.classList.toggle('active'); const title=item.querySelector('h3')?.textContent||''; document.querySelectorAll(`.progress-chip`).forEach(c=>{ if(title && c.textContent.includes(title)){c.classList.add('done'); c.textContent='✓ '+title;} }); };
  window.imexBenefSearch=function(q){ q=String(q||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); let count=0; document.querySelectorAll('#beneficiosListaV5 .benefit-item').forEach(it=>{const s=(it.getAttribute('data-keywords')||it.textContent||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); const ok=!q||s.includes(q); it.style.display=ok?'':'none'; if(ok) count++;}); const e=document.getElementById('beneficiosEmptyV5'); if(e)e.style.display=count?'none':'block'; };
  window.connAccToggle=function(btn){ const item=btn.closest('.acc-item'); if(item)item.classList.toggle('open'); };

  function navegar(id){
    aplicarMenu();
    const r=roleAtual(); const allowed=PERMISSOES[r] || PERMISSOES.colaborador;
    if(!allowed.includes(id) && !MENUS[r].includes(id)) id=MENUS[r][0];
    const original=id; const target=ALIAS[id] || id;
    hideAll();
    if(original==='equipe') renderEquipe();
    if(target==='beneficios') renderBeneficios();
    if(target==='gestao-rh') setTimeout(garantirGestaoRHTabs, 0);
    const v=ensureView(original==='equipe'?'equipe':target);
    v.classList.add('active'); v.style.setProperty('display','block','important');
    document.querySelectorAll('.sb-item').forEach(el=>el.classList.remove('active'));
    const sb=document.getElementById('sb-'+original); if(sb) sb.classList.add('active');
    const meta=META[original] || META[target]; if(meta) setTopbar(meta[0],meta[1]);
    try{
      if(target==='intranet' && typeof intraCarregar==='function') intraCarregar();
      if(target==='pesquisas' && typeof pesqCarregar==='function') pesqCarregar();
      if(target==='gestor' && typeof renderGestor==='function') renderGestor();
      if(target==='dashboard' && typeof renderDash==='function') renderDash();
      if(target==='auditoria' && typeof renderAudit==='function') renderAudit();
      if(target==='conecta-ai' && typeof carregarTemasAI==='function') carregarTemasAI();
      if(target==='gestao-rh' && typeof gestaoRhCarregar==='function') gestaoRhCarregar();
      if(target==='ouvidoria' && typeof ouvidoriaCarregar==='function') ouvidoriaCarregar();
      if(target==='organograma' && typeof orgCarregar==='function') orgCarregar();
      if(target==='trilhas' && typeof trilhasCarregar==='function') trilhasCarregar();
      if(target==='experiencia' && typeof expCarregar==='function') expCarregar();
      if(target==='cargos' && typeof cargosCarregar==='function') cargosCarregar();
      if(target==='disc' && typeof discCarregar==='function') discCarregar();
      if(target==='pdi' && typeof pdiCarregar==='function') pdiCarregar();
      if(target==='usuarios' && typeof carregarUsuarios==='function') carregarUsuarios();
      if(target==='meu-desenvolvimento' && typeof renderMeuDesenvolvimento==='function') renderMeuDesenvolvimento();
      if(target==='desenvolvimento-talentos' && typeof window.renderDesenvolvimentoTalentos==='function') window.renderDesenvolvimentoTalentos();
    }catch(e){console.warn('[IMEX Fase 1] navegação', id, e);}
  }

  const oldGrhTab=window.grhTab;
  window.grhTab=function(aba,btn){
    garantirGestaoRHTabs();
    document.querySelectorAll('#view-gestao-rh [id^="grh-pane-"]').forEach(p=>p.style.display='none');
    let pane=document.getElementById('grh-pane-'+aba);
    if(pane) pane.style.display='block';
    document.querySelectorAll('#grh-tabs .tab').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    if(['colaboradores','enderecos','remuneracao','movimentacoes','desligamentos','admissao','ferias'].includes(aba) && typeof oldGrhTab==='function'){
      try{ oldGrhTab(aba,btn); }catch(e){ console.warn('[IMEX Fase 1] grhTab antigo',e); }
    }
  };
  window.renderBeneficiosCards=renderBeneficios; window.renderBeneficiosHub=renderBeneficios; window.renderBeneficios=renderBeneficios; window.benCarregar=renderBeneficios; window.montarBeneficiosExato=renderBeneficios;
  window.sbNav=navegar; window.switchView=navegar; window.showView=navegar;
  window.buildSidebar=function(){ aplicarMenu(); };
  window.trocarPerfil=function(){
    // "Visão Colaborador" é só uma pré-visualização temporária dentro da
    // sessão atual — por isso NÃO grava em sessionStorage/imexPreferredRole
    // nem mexe em _roleReal (o papel real de login). Antes gravava os dois,
    // e um F5 depois de usar o botão prendia o RH na visão de colaborador
    // permanentemente, porque a restauração de sessão lê exatamente esses
    // valores.
    const r=roleAtual();
    const novoRole = r==='rh' ? 'colaborador' : 'rh';
    window.role = novoRole;
    try{ role = novoRole; }catch(e){}
    aplicarMenu(); navegar(MENUS[roleAtual()][0]);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{aplicarMenu();},120));
  else setTimeout(()=>{aplicarMenu();},120);
  window.addEventListener('load',()=>setTimeout(()=>{aplicarMenu(); const active=document.querySelector('[id^="view-"].active'); if(!active) navegar(MENUS[roleAtual()][0]);},300));
})();


