// ===== script: patch-rh-painel-final-js =====
(function(){
  const ACCESS_RH_FINAL = {
    colaborador: ['intranet','estrutura-carreira','desenvolvimento','pesquisas','beneficios','solicitacao','conecta-ai','ouvidoria','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento'],
    gestor: ['intranet','estrutura-carreira','desenvolvimento','pesquisas','beneficios','solicitacao','gestor','conecta-ai','ouvidoria','organograma','trilhas','experiencia','cargos','disc','meu-desenvolvimento'],
    rh: ['gestao-rh','desenvolvimento-talentos','pesquisas','dashboard','ouvidoria','conecta-ai','auditoria','experiencia','disc','cargos','trilhas','pdi','usuarios'],
    'rh-colaborador': ['gestao-rh','desenvolvimento-talentos','pesquisas','dashboard','ouvidoria','conecta-ai','auditoria','experiencia','disc','cargos','trilhas','pdi','usuarios']
  };
  const ORDER_COLAB = ['intranet','estrutura-carreira','desenvolvimento','pesquisas','beneficios','solicitacao','conecta-ai','ouvidoria'];
  const ORDER_GESTOR = ['intranet','estrutura-carreira','desenvolvimento','pesquisas','beneficios','solicitacao','conecta-ai','ouvidoria','gestor'];
  const ORDER_RH = ['gestao-rh','dashboard','ouvidoria','conecta-ai','auditoria'];
  const META_RH_FINAL = {
    intranet:['🏠','Intranet'], 'estrutura-carreira':['🏢','Estrutura e Carreira'], desenvolvimento:['🌱','Desenvolvimento'], pesquisas:['📋','Pesquisas'], beneficios:['🎁','Meus Benefícios'], solicitacao:['🌴','Férias'], gestor:['👔','Gestor'],
    'gestao-rh':['🏢','Gestão RH'], 'desenvolvimento-talentos':['🌱','Desenvolvimento & Talentos'], pesquisas:['📋','Pesquisas'], dashboard:['📊','Dashboard RH'], ouvidoria:['📢','Ouvidoria'], 'conecta-ai':['🤖','Conecta AI'], auditoria:['📝','Auditoria'],
    experiencia:['📆','Experiência'], disc:['🧠','DISC'], cargos:['📄','Descritivo de Cargos'], trilhas:['🚀','Trilhas de Carreira'], pdi:['🎯','PDI'], 'meu-desenvolvimento':['✨','Meu Desenvolvimento'], organograma:['🏢','Organograma']
  };
  function norm(v){return String(v||'').toLowerCase().trim();}
  // REMOVED: Consolidated in 000-core-functions.js
  // function roleAtual(){let r=norm(window.role||sessionStorage.getItem('userRole')||'colaborador'); if(r==='rh-colaborador') return 'rh'; return ACCESS_RH_FINAL[r]?r:'colaborador';}
  function setTopbar(icon,label){const pi=document.getElementById('tPageIcon'); if(pi) pi.textContent=icon; const pt=document.getElementById('tPageTitle'); if(pt) pt.textContent=label;}
  function ensureStyle(){
    if(document.getElementById('patch-rh-hub-final-style')) return;
    const st=document.createElement('style'); st.id='patch-rh-hub-final-style';
    st.textContent=`.rh-hub-grid{display:grid;grid-template-columns:repeat(3,minmax(240px,1fr));gap:16px}.rh-hub-card{background:#fff;border:1px solid var(--border);border-radius:18px;padding:20px;text-align:left;display:flex;gap:15px;cursor:pointer;box-shadow:0 8px 22px rgba(16,24,40,.05);transition:.22s;font-family:inherit}.rh-hub-card:hover{transform:translateY(-3px);border-color:#0047FF;box-shadow:0 16px 36px rgba(0,71,255,.12)}.rh-hub-ico{width:48px;height:48px;border-radius:16px;background:#f3f6ff;display:flex;align-items:center;justify-content:center;font-size:24px;flex:0 0 48px}.rh-hub-card h3{font-size:16px;margin:0 0 6px;color:var(--ink);font-weight:900}.rh-hub-card p{font-size:13px;color:var(--ink-60);line-height:1.45;margin:0 0 10px}.rh-hub-list{display:grid;grid-template-columns:repeat(2,minmax(90px,1fr));gap:5px 10px}.rh-hub-list span{font-size:11.5px;color:var(--ink-60)}.rh-module-note{background:#eef4ff;border:1px solid #c7d7fe;color:#1e3a8a;border-radius:14px;padding:13px 16px;margin-top:18px;font-size:13px;line-height:1.55}@media(max-width:1120px){.rh-hub-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.rh-hub-grid{grid-template-columns:1fr}.rh-hub-list{grid-template-columns:1fr}}`;
    document.head.appendChild(st);
  }
  function ensureItem(id){
    const sidebar=document.getElementById('sidebar'); if(!sidebar) return null;
    const meta=META_RH_FINAL[id]||['▫️',id]; let el=document.getElementById('sb-'+id);
    if(!el){el=document.createElement('div'); el.className='sb-item'; el.id='sb-'+id; el.innerHTML='<span></span><span class="sb-tip"></span>';}
    el.querySelector('span:first-child').textContent=meta[0];
    let tip=el.querySelector('.sb-tip'); if(!tip){tip=document.createElement('span'); tip.className='sb-tip'; el.appendChild(tip);} tip.textContent=meta[1]; el.title=meta[1];
    el.onclick=function(e){if(e)e.preventDefault(); window.sbNav(id); return false;};
    return el;
  }
  function ensureView(id){let v=document.getElementById('view-'+id); if(!v){v=document.createElement('div'); v.id='view-'+id; v.className='page'; v.style.display='none'; const app=document.getElementById('appPage')||document.querySelector('.main-area'); app?.appendChild(v);} return v;}
  function card(icon,title,desc,target,items){return `<button class="rh-hub-card" onclick="sbNav('${target}')"><div class="rh-hub-ico">${icon}</div><div><h3>${title}</h3><p>${desc}</p><div class="rh-hub-list">${(items||[]).map(i=>`<span>✓ ${i}</span>`).join('')}</div></div></button>`;}
  function renderDesenvolvimentoTalentos(){
    ensureStyle(); const v=ensureView('desenvolvimento-talentos');
    v.innerHTML=`<div class="hero" style="background:radial-gradient(at 18% 15%, #1d54d6 0%, transparent 48%), radial-gradient(at 85% 5%, #061535 0%, transparent 45%), radial-gradient(at 88% 92%, #1f7fe0 0%, transparent 55%), radial-gradient(at 5% 95%, #040d24 0%, transparent 45%), #0a1d4a!important"><div class="h-content"><div class="h-eyebrow">Página HUB estratégica · RH</div><h1>DESENVOLVIMENTO & TALENTOS</h1><p>Central estratégica para experiência, DISC, descritivos, trilhas, mapeamento de talentos e PDI.</p></div><div class="h-stats"><div class="h-stat"><span class="h-num">45/90</span><span class="h-lbl">Experiência</span></div><div class="h-stat"><span class="h-num">9Box</span><span class="h-lbl">Talentos</span></div></div></div><div class="rh-hub-grid">${card('📆','Experiência 45/90 dias','Dashboard, avaliações do colaborador e gestor, indicadores de adaptação e alertas.','experiencia',['Dashboard','Pesquisa 45 dias','Pesquisa 90 dias','Avaliação gestor','Indicadores','Alertas'])}${card('🧠','DISC','Aplicação, reaplicação, convocação, resultados, histórico, comparativos e relatórios.','disc',['Aplicar','Reaplicar','Convocar','Histórico','Relatórios','Dashboard DISC'])}${card('📄','Descritivo de Cargos','Respostas dos colaboradores e geração de descritivo com IA.','cargos',['Respostas enviadas','Histórico','Gerar com IA','Missão','Responsabilidades','Competências'])}${card('🚀','Trilhas de Carreira','Estrutura de cargos, níveis, competências e gestão de trilhas.','trilhas',['Cargos','Níveis','Competências','Criar','Editar','Excluir'])}${card('📈','Mapeamento de Talentos','Nine Box, potencial x performance, sucessores, banco de talentos e cargos críticos.','gestao-rh',['Nine Box','Banco de Talentos','Sucessão','Potencial','Performance','Backup'])}${card('🎯','PDI','Gestão de planos individuais e de equipe, metas, cursos e geração com IA.','pdi',['Planos individuais','Planos de equipe','Metas','Prazos','Cursos','Gerar PDI com IA'])}</div><div class="rh-module-note">Este HUB mantém o menu do RH limpo e centraliza todos os processos estratégicos de desenvolvimento em uma única entrada.</div>`;
  }
  window.renderDesenvolvimentoTalentos = renderDesenvolvimentoTalentos;
  function patchGestaoRHTabs(){
    const tabs=document.getElementById('grh-tabs'); if(!tabs || tabs.dataset.rhFinal==='ok') return; tabs.dataset.rhFinal='ok';
    const desired=[['colaboradores','👥 Colaboradores'],['enderecos','📍 Endereços'],['remuneracao','💰 Remuneração'],['movimentacoes','🔄 Movimentações'],['admissao','✅ Admissões'],['desligamentos','❌ Desligamentos'],['ferias','🌴 Gestão de Férias'],['documentos','📄 Documentos'],['beneficios-rh','🎁 Benefícios'],['acessos','🔐 Acessos e Permissões']];
    tabs.innerHTML=desired.map((d,i)=>`<button class="tab ${i===0?'active':''}" onclick="grhTab('${d[0]}',this)">${d[1]}</button>`).join('');
    const container=tabs.parentElement;
    if(!document.getElementById('grh-pane-documentos')) container.insertAdjacentHTML('beforeend',`<div id="grh-pane-documentos" style="display:none"><div class="card"><div class="card-head"><div class="cht"><h2>📄 Documentos</h2><p>Contratos, advertências, termos, políticas e arquivos do prontuário.</p></div></div><div class="card-body"><div class="rh-hub-grid">${card('📑','Contratos','Arquivos contratuais e termos assinados.','gestao-rh',['Contratos','Termos','Arquivos'])}${card('⚠️','Advertências','Registro e histórico de medidas disciplinares.','gestao-rh',['Advertências','Histórico'])}${card('📚','Políticas','Documentos oficiais, normas internas e comunicados.','gestao-rh',['Políticas','Normas','Arquivos'])}</div></div></div></div>`);
    if(!document.getElementById('grh-pane-beneficios-rh')) container.insertAdjacentHTML('beforeend',`<div id="grh-pane-beneficios-rh" style="display:none"><div class="card"><div class="card-head"><div class="cht"><h2>🎁 Benefícios</h2><p>Gestão de Unimed, Wellhub, Starbem, Dasa, Optum e iFood Benefícios.</p></div></div><div class="card-body"><div class="rh-hub-grid">${card('🩺','Unimed','Guia, reembolso, coparticipação, dependentes e custos.','gestao-rh',['Dependentes','Elegibilidade','Custos','Utilização'])}${card('🏋️','Wellhub','Controle de acesso, dependentes e utilização.','gestao-rh',['Acesso','Dependentes','Utilização'])}${card('❤️','Starbem','Consultas, dependentes e elegibilidade.','gestao-rh',['Consultas','Dependentes','Controle'])}${card('🏥','Dasa','Exames, agendamentos e utilização.','gestao-rh',['Exames','Agendamentos','Utilização'])}${card('🧠','Optum','Psicologia, nutrição, medicina e indicadores de uso.','gestao-rh',['Psicologia','Nutrição','Medicina'])}${card('🍔','iFood Benefícios','Saldo, extrato, custos e controle mensal.','gestao-rh',['Controle','Custos','Utilização'])}</div></div></div></div>`);
  }
  const oldGrhTab=window.grhTab;
  window.grhTab=function(tab,btn){
    patchGestaoRHTabs();
    document.querySelectorAll('[id^="grh-pane-"]').forEach(p=>p.style.display='none');
    document.querySelectorAll('#grh-tabs .tab').forEach(b=>b.classList.remove('active'));
    const pane=document.getElementById('grh-pane-'+tab); if(pane) pane.style.display='block'; if(btn) btn.classList.add('active');
    try{ if(typeof oldGrhTab==='function' && !['documentos','beneficios-rh'].includes(tab)) oldGrhTab(tab,btn); }catch(e){}
  };
  function esconderViews(){document.querySelectorAll('[id^="view-"]').forEach(el=>{el.classList.remove('active','dev-active'); el.style.setProperty('display','none','important');}); const hero=document.getElementById('mainHero'); if(hero) hero.style.setProperty('display','none','important');}
  // REMOVED: Consolidated in 000-core-functions.js
  // function aplicarMenu(){
  //   window.ROLE_ACCESS=ACCESS_RH_FINAL; window.TAB_META={}; Object.keys(META_RH_FINAL).forEach(k=>window.TAB_META[k]={icon:META_RH_FINAL[k][0],label:META_RH_FINAL[k][1]});
  //   const r=roleAtual(); const order=r==='rh'?ORDER_RH:(r==='gestor'?ORDER_GESTOR:ORDER_COLAB); const sidebar=document.getElementById('sidebar'); const spacer=sidebar?.querySelector('.sb-spacer');
  //   order.forEach(ensureItem); if(sidebar&&spacer) order.forEach(id=>{const el=document.getElementById('sb-'+id); if(el) sidebar.insertBefore(el,spacer);});
  //   const all=['intranet','estrutura-carreira','desenvolvimento','pesquisas','beneficios','solicitacao','gestor','conecta-ai','ouvidoria','gestao-rh','desenvolvimento-talentos','dashboard','auditoria','usuarios','disc','cargos','pdi','rh','organograma','trilhas','experiencia','meu-desenvolvimento','calendario','colaboradores'];
  //   all.forEach(id=>{const el=document.getElementById('sb-'+id); if(el) el.style.setProperty('display',order.includes(id)?'flex':'none','important');});
  // }
  // REMOVED: Consolidated in 000-core-functions.js
  // function navegar(id){
  //   aplicarMenu(); const r=roleAtual(); const allowed=ACCESS_RH_FINAL[r]||ACCESS_RH_FINAL.colaborador; if(!allowed.includes(id)) id=(r==='rh'?'gestao-rh':'intranet');
  //   esconderViews(); if(id==='desenvolvimento-talentos') renderDesenvolvimentoTalentos();
  //   const v=document.getElementById('view-'+id); if(v){v.classList.add('active'); v.style.setProperty('display','block','important');}
  //   if(id==='gestao-rh') { patchGestaoRHTabs(); if(typeof gestaoRhCarregar==='function') gestaoRhCarregar(); }
  //   document.querySelectorAll('.sb-item').forEach(el=>el.classList.remove('active'));
  //   const main = (r==='rh' && ['experiencia','disc','cargos','trilhas','pdi'].includes(id)) ? 'desenvolvimento-talentos' : id;
  //   const sb=document.getElementById('sb-'+main); if(sb) sb.classList.add('active');
  //   const meta=META_RH_FINAL[main]||META_RH_FINAL[id]; if(meta) setTopbar(meta[0],meta[1]);
  //   try{ if(id==='pesquisas'&&typeof pesqCarregar==='function') pesqCarregar(); if(id==='dashboard'&&typeof renderDash==='function') renderDash(); if(id==='auditoria'&&typeof renderAudit==='function') renderAudit(); if(id==='ouvidoria'&&typeof ouvidoriaCarregar==='function') ouvidoriaCarregar(); if(id==='conecta-ai'&&typeof carregarTemasAI==='function') carregarTemasAI(); if(id==='disc'&&typeof discCarregar==='function') discCarregar(); if(id==='cargos'&&typeof cargosCarregar==='function') cargosCarregar(); if(id==='trilhas'&&typeof trilhasCarregar==='function') trilhasCarregar(); if(id==='experiencia'&&typeof expCarregar==='function') expCarregar(); if(id==='pdi'&&typeof pdiCarregar==='function') pdiCarregar(); if(id==='intranet'&&typeof intraCarregar==='function') intraCarregar(); if(id==='gestor'&&typeof renderGestor==='function') renderGestor(); }catch(e){console.warn('navegar rh final:',id,e);}
  // }
  window.buildSidebar=function(){aplicarMenu(); navegar(roleAtual()==='rh'?'gestao-rh':'intranet');};
  window.switchView=function(v){navegar(v);}; window.sbNav=function(v){navegar(v);};
  document.addEventListener('DOMContentLoaded',()=>{setTimeout(aplicarMenu,200); setTimeout(()=>{if(roleAtual()==='rh') patchGestaoRHTabs();},900);});
})();


