// ===== script: patch-telas-brancas-corrigido-real =====
(function(){
  const META = {
    intranet:['🏠','Intranet'],
    'estrutura-carreira':['🏢','Estrutura e Carreira'],
    desenvolvimento:['🌱','Desenvolvimento'],
    pesquisas:['📋','Pesquisas'],
    beneficios:['🎁','Meus Benefícios'],
    solicitacao:['🌴','Férias'],
    'conecta-ai':['🤖','Conecta AI'],
    ouvidoria:['📢','Ouvidoria'],
    'gestao-rh':['🏢','Gestão RH'],
    'desenvolvimento-talentos':['🌱','Desenvolvimento & Talentos'],
    dashboard:['📊','Dashboard RH'],
    auditoria:['📝','Auditoria'],
    experiencia:['📆','Experiência'], disc:['🧠','DISC'], cargos:['📄','Descritivo de Cargos'], trilhas:['🚀','Trilhas de Carreira'], pdi:['🎯','PDI'],
    organograma:['🏢','Organograma'], 'meu-desenvolvimento':['✨','Meu Desenvolvimento'], 'mapeamento-talentos':['📈','Mapeamento de Talentos'], gestor:['👔','Gestor']
  };
  const ORDER_COLAB = ['intranet','estrutura-carreira','desenvolvimento','pesquisas','beneficios','solicitacao','conecta-ai','ouvidoria'];
  const ORDER_RH = ['gestao-rh','dashboard','ouvidoria','conecta-ai','auditoria'];
  const ORDER_GESTOR = ['intranet','estrutura-carreira','desenvolvimento','pesquisas','beneficios','solicitacao','conecta-ai','ouvidoria','gestor'];
  const ACCESS = {
    colaborador:[...ORDER_COLAB,'organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento'],
    gestor:[...ORDER_GESTOR,'organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento'],
    rh:[...ORDER_RH,'experiencia','disc','cargos','trilhas','pdi','mapeamento-talentos','organograma','usuarios','colaboradores','rh'],
    'rh-colaborador':[...ORDER_RH,'experiencia','disc','cargos','trilhas','pdi','mapeamento-talentos','organograma','usuarios','colaboradores','rh']
  };
  function norm(v){return String(v||'').toLowerCase().trim();}
  // REMOVED: Consolidated in 000-core-functions.js
  // function roleAtual(){
  //   let r = norm(window.role || sessionStorage.getItem('userRole') || 'colaborador');
  //   if(r === 'rh-colaborador') return 'rh';
  //   return ACCESS[r] ? r : 'colaborador';
  // }
  function mainArea(){return document.querySelector('.main-area') || document.getElementById('appShell') || document.body;}
  function ensureStyle(){
    if(document.getElementById('patch-telas-brancas-css')) return;
    const st=document.createElement('style'); st.id='patch-telas-brancas-css';
    st.textContent = `
      .page[id^="view-"]{width:100%;}
      .hub-grid-fix{display:grid;grid-template-columns:repeat(3,minmax(240px,1fr));gap:18px;margin:24px 0 38px}.hub-card-fix{background:#fff;border:1px solid var(--border,#e2e8f0);border-radius:18px;padding:22px;text-align:left;cursor:pointer;box-shadow:0 10px 28px rgba(16,24,40,.06);transition:.2s;font-family:inherit;color:inherit}.hub-card-fix:hover{transform:translateY(-3px);border-color:#0047FF;box-shadow:0 16px 34px rgba(0,71,255,.13)}.hub-card-fix .ico{font-size:32px;margin-bottom:12px}.hub-card-fix h3{font-size:17px;margin:0 0 7px;font-weight:900;color:#111827}.hub-card-fix p{font-size:13px;color:#4a5568;line-height:1.45;margin:0 0 12px}.hub-card-fix .chips{display:flex;flex-wrap:wrap;gap:6px}.hub-card-fix .chips span{font-size:11px;background:#eef4ff;color:#0047FF;border-radius:999px;padding:4px 9px;font-weight:700}.simple-section-fix{background:#fff;border:1px solid var(--border,#e2e8f0);border-radius:18px;padding:24px;box-shadow:0 8px 20px rgba(16,24,40,.05);margin-bottom:18px}.simple-section-fix h2{font-size:20px;margin:0 0 8px}.simple-section-fix p{color:#4a5568;margin:0 0 14px}.benefit-grid-fix{display:grid;grid-template-columns:repeat(3,minmax(230px,1fr));gap:16px}@media(max-width:1100px){.hub-grid-fix,.benefit-grid-fix{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.hub-grid-fix,.benefit-grid-fix{grid-template-columns:1fr}}`;
    document.head.appendChild(st);
  }
  function setTopbar(id){const meta=META[id]||['▫️',id]; const pi=document.getElementById('tPageIcon'); if(pi) pi.textContent=meta[0]; const pt=document.getElementById('tPageTitle'); if(pt) pt.textContent=meta[1];}
  function ensureView(id){
    const area=mainArea(); let v=document.getElementById('view-'+id);
    if(!v){v=document.createElement('div'); v.id='view-'+id; v.className='page';}
    v.classList.add('page');
    if(v.parentElement !== area) area.appendChild(v);
    return v;
  }
  function hubCard(icon,title,desc,target,chips){return `<button class="hub-card-fix" onclick="sbNav('${target}')"><div class="ico">${icon}</div><h3>${title}</h3><p>${desc}</p><div class="chips">${(chips||[]).map(c=>`<span>${c}</span>`).join('')}</div></button>`;}
  function renderEstrutura(){
    // Usa a view estática já existente — não sobrescreve o innerHTML
    const v=document.getElementById('view-estrutura-carreira');
    if(v) { v.classList.add('active'); v.style.setProperty('display','block','important'); }
  }
  function renderDesenvolvimento(){
    // Usa a view estática já existente — não sobrescreve o innerHTML
    const v=document.getElementById('view-desenvolvimento');
    if(v) { v.classList.add('active'); v.style.setProperty('display','block','important'); }
  }
  function renderBeneficios(){
    const v=ensureView('beneficios');
    v.innerHTML = `<div class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important"><div class="h-content"><div class="h-eyebrow">Benefícios IMEX</div><h1>MEUS BENEFÍCIOS</h1><p>Central de benefícios para consultar acessos, dependentes, orientações, FAQ e informações importantes.</p></div><div class="h-stats"><div class="h-stat"><span class="h-num">6</span><span class="h-lbl">Benefícios</span></div><div class="h-stat"><span class="h-num">FAQ</span><span class="h-lbl">Orientações</span></div></div></div><div class="benefit-grid-fix">${hubCard('🍔','iFood Benefícios','Saldo, extrato, como utilizar e FAQ.','beneficios',['Saldo','Extrato','FAQ'])}${hubCard('🏋️','Wellhub','Acesso, planos e dependentes.','beneficios',['Acesso','Dependentes'])}${hubCard('❤️','Starbem','Consultas, dependentes e orientações.','beneficios',['Consultas','Dependentes'])}${hubCard('🏥','Dasa','Exames, agendamentos e acesso à plataforma.','beneficios',['Exames','Agendamentos'])}${hubCard('🧠','Optum','Psicologia, nutrição e medicina.','beneficios',['Psicologia','Nutrição','Medicina'])}${hubCard('🩺','Unimed','Guia, reembolso e coparticipação.','beneficios',['Guia','Reembolso','Coparticipação'])}</div>`;
  }
  function renderGestaoRH(){
    const v=ensureView('gestao-rh');
    v.innerHTML = `<div class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important"><div class="h-content"><div class="h-eyebrow">Central administrativa do RH</div><h1>GESTÃO RH</h1><p>Administração completa de colaboradores, admissões, desligamentos, férias, documentos e benefícios.</p></div></div><div class="hub-grid-fix">${hubCard('👥','Colaboradores','Cadastro completo, dados pessoais, cargo, setor, gestor, benefícios, dependentes, foto e histórico.','colaboradores',['Cadastro','Cargo','Setor','Histórico'])}${hubCard('📍','Endereços','Cadastro, atualização e histórico de endereços.','gestao-rh',['Cadastro','Atualização','Histórico'])}${hubCard('💰','Remuneração','Salário atual, histórico salarial, promoções, mérito e ajustes.','gestao-rh',['Salário','Histórico','Promoções'])}${hubCard('🔄','Movimentações','Transferências, alterações de cargo, gestor e salário.','gestao-rh',['Cargo','Gestor','Salário'])}${hubCard('✅','Admissões','Checklist, documentação, contratos, equipamentos e integração.','gestao-rh',['Checklist','Contratos','Integração'])}${hubCard('❌','Desligamentos','Entrevista, motivo, histórico e indicadores.','gestao-rh',['Entrevista','Motivo','Indicadores'])}${hubCard('🌴','Gestão de Férias','Aprovar, reprovar, histórico, alertas, saldo, calendário e bloqueios por equipe.','rh',['Aprovar','Saldo','Calendário','Bloqueios'])}${hubCard('📄','Documentos','Contratos, advertências, termos, políticas e arquivos.','gestao-rh',['Contratos','Termos','Políticas'])}${hubCard('🎁','Benefícios','Unimed, Wellhub, Starbem, Dasa, Optum, iFood, dependentes, elegibilidade e custos.','gestao-rh',['Custos','Dependentes','Elegibilidade'])}</div>`;
  }
  function renderTalentosRH(){
    const v=ensureView('desenvolvimento-talentos');
    v.innerHTML = `<div class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important"><div class="h-content"><div class="h-eyebrow">Página HUB estratégica · RH</div><h1>DESENVOLVIMENTO & TALENTOS</h1><p>Central estratégica para experiência, DISC, descritivos, trilhas, mapeamento de talentos e PDI.</p></div><div class="h-stats"><div class="h-stat"><span class="h-num">45/90</span><span class="h-lbl">Experiência</span></div><div class="h-stat"><span class="h-num">9Box</span><span class="h-lbl">Talentos</span></div></div></div><div class="hub-grid-fix">${hubCard('📆','Experiência 45/90 dias','Dashboard, avaliações, pesquisa 45/90 dias, gestor e indicadores.','experiencia',['Dashboard','Avaliações','Indicadores'])}${hubCard('🧠','DISC','Aplicar, reaplicar, convocar, resultados, histórico, comparativo e relatórios.','disc',['Aplicar','Resultados','Relatórios'])}${hubCard('📄','Descritivo de Cargos','Respostas enviadas, histórico e geração de descritivo com IA.','cargos',['Respostas','Histórico','IA'])}${hubCard('🚀','Trilhas de Carreira','Estrutura, cargos, níveis, competências, criar, editar e excluir.','trilhas',['Cargos','Níveis','Competências'])}${hubCard('📈','Mapeamento de Talentos','Nine Box, potencial x performance, banco de talentos e sucessão.','mapeamento-talentos',['Nine Box','Sucessão','Potencial'])}${hubCard('🎯','PDI','Planos individuais e de equipe, metas, prazo, responsável, cursos e IA.','pdi',['Metas','Cursos','IA'])}</div>`;
  }
  function renderMapeamento(){
    const v=ensureView('mapeamento-talentos');
    v.innerHTML = `<div class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important"><div class="h-content"><div class="h-eyebrow">Talentos · Nine Box</div><h1>MAPEAMENTO DE TALENTOS</h1><p>Analise potencial x performance, banco de talentos, sucessores e cargos críticos.</p></div><div class="h-stats"><div class="h-stat"><span class="h-num">9Box</span><span class="h-lbl">Matriz</span></div><div class="h-stat"><span class="h-num">📈</span><span class="h-lbl">Sucessão</span></div></div></div><div class="hub-grid-fix">${hubCard('🎯','Nine Box','Matriz de potencial x performance por área, cargo e pessoa.','mapeamento-talentos',['Potencial','Performance','Área','Cargo'])}${hubCard('⭐','Banco de Talentos','Alto potencial, especialistas e profissionais em destaque.','mapeamento-talentos',['Alto potencial','Especialistas'])}${hubCard('👑','Sucessão','Próximos líderes, sucessores e backup de cargos críticos.','mapeamento-talentos',['Líderes','Sucessores','Backup'])}</div><div class="simple-section-fix"><h2>📊 Matriz de Talentos</h2><p>Esta tela agora é independente e não redireciona mais para a base de colaboradores.</p><table><thead><tr><th>Colaborador</th><th>Área</th><th>Cargo</th><th>Potencial</th><th>Performance</th><th>Classificação</th></tr></thead><tbody><tr><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Sem dados cadastrados</td></tr></tbody></table></div>`;
  }
  function renderFallback(id){
    if(id==='estrutura-carreira') renderEstrutura();
    if(id==='desenvolvimento') renderDesenvolvimento();
    if(id==='beneficios') renderBeneficios();
    if(id==='gestao-rh'){
      // Só injeta hub estático se o painel real (com abas e tabelas) não existir ainda
      const v=document.getElementById('view-gestao-rh');
      if(!v || !v.querySelector('#grh-tabs,#grh-colab-body,#grh-pane-colaboradores,.grh-tab-btn')) renderGestaoRH();
    }
    if(id==='desenvolvimento-talentos') renderTalentosRH();
    if(id==='mapeamento-talentos') renderMapeamento();
  }
  function ensureItem(id){
    const sidebar=document.getElementById('sidebar'); if(!sidebar) return null;
    let el=document.getElementById('sb-'+id); const meta=META[id]||['▫️',id];
    if(!el){el=document.createElement('div'); el.className='sb-item'; el.id='sb-'+id; el.innerHTML='<span></span><span class="sb-tip"></span>';}
    const first=el.querySelector('span:first-child') || el.appendChild(document.createElement('span')); first.textContent=meta[0];
    let tip=el.querySelector('.sb-tip'); if(!tip){tip=document.createElement('span'); tip.className='sb-tip'; el.appendChild(tip);} tip.textContent=meta[1]; el.title=meta[1];
    el.onclick=function(e){ if(e) e.preventDefault(); window.sbNav(id); return false; };
    return el;
  }
  // REMOVED: Consolidated in 000-core-functions.js
  // function aplicarMenu(){
  //   ensureStyle();
  //   const r=roleAtual(); const order=r==='rh'?ORDER_RH:(r==='gestor'?ORDER_GESTOR:ORDER_COLAB);
  //   const sidebar=document.getElementById('sidebar'); const spacer=sidebar && sidebar.querySelector('.sb-spacer');
  //   order.forEach(ensureItem);
  //   if(sidebar && spacer){ order.forEach(id=>{ const el=document.getElementById('sb-'+id); if(el) sidebar.insertBefore(el, spacer); }); }
  //   const known=[...new Set([...ORDER_COLAB,...ORDER_GESTOR,...ORDER_RH,'gestor','disc','cargos','pdi','organograma','trilhas','experiencia','meu-desenvolvimento','usuarios','colaboradores','rh','calendario','mapeamento-talentos'])];
  //   known.forEach(id=>{ const el=document.getElementById('sb-'+id); if(el) el.style.setProperty('display', order.includes(id) ? 'flex' : 'none', 'important'); });
  //   const lbl=document.getElementById('btnTrocarPerfilLabel');
  //   if(lbl) lbl.textContent = r==='rh' ? '👤 Minha Visão' : '🏢 Voltar RH';
  //   const pLabel=document.getElementById('pLabel'); if(pLabel) pLabel.textContent = r==='rh' ? 'RH' : (r==='gestor'?'Gestor':'Colaborador');
  //   const pDot=document.getElementById('pDot'); if(pDot) pDot.textContent = r==='rh' ? '🏢' : (r==='gestor'?'👔':'👤');
  // }
  function hideAll(){
    document.querySelectorAll('[id^="view-"]').forEach(el=>{ el.classList.remove('active'); el.style.setProperty('display','none','important'); });
    const hero=document.getElementById('mainHero'); if(hero) hero.style.setProperty('display','none','important');
  }
  // REMOVED: Consolidated in 000-core-functions.js (navegar/aplicarMenu e todo
  // o bloco que os usava — switchView/sbNav/buildSidebar/trocarPerfil e o
  // listener de DOMContentLoaded — foram removidos daqui de vez). A versão
  // anterior deste comentário só comentou a ABERTURA da função e deixou o
  // meio/fim do bloco como código "vivo", com um `catch` sem `try`
  // correspondente — isso quebrava o PARSE do arquivo inteiro (SyntaxError:
  // Unexpected token 'catch'), impedindo até `hideAll()` acima de ser
  // definida e derrubando qualquer script carregado depois deste na mesma
  // tag <script>. Reintroduzir esse bloco sem os `//` também sobrescreveria
  // window.switchView/sbNav (definidos em 000-core-functions.js) com
  // `navegar`, que não existe mais neste arquivo.
})();


