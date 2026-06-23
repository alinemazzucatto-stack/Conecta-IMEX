// ===== script: patch-paineis-preenchidos-script =====
(function(){
  function roleAtual(){ return (window.role || localStorage.getItem('conecta-imex_role') || '').toLowerCase(); }
  function isRH(){ const r=roleAtual(); return r==='rh' || r==='rh-colaborador' || r.includes('rh'); }
  function moveIntranetTop(){
    const side=document.getElementById('sidebar');
    const logo=side?.querySelector('.sb-logo');
    const intranet=document.getElementById('sb-intranet');
    if(side && logo && intranet && logo.nextElementSibling!==intranet){
      side.insertBefore(intranet, logo.nextElementSibling);
    }
    if(intranet){
      intranet.querySelector('span:first-child').textContent='🏠';
      const tip=intranet.querySelector('.sb-tip'); if(tip) tip.textContent='Intranet';
    }
    const cargos=document.getElementById('sb-cargos');
    const ouv=document.getElementById('sb-ouvidoria');
    if(cargos && ouv && cargos.nextElementSibling!==ouv){ cargos.after(ouv); }
  }
  function makeHero(kicker,title,desc){
    return `<div class="patch-hero"><small>${kicker}</small><h1>${title}</h1><p>${desc}</p></div>`;
  }
  function ensurePanel(id, html){
    const el=document.getElementById(id); if(!el) return;
    if(el.dataset.patchPreenchido==='1') return;
    const visibleText=(el.innerText||'').replace(/\s+/g,' ').trim();
    if(visibleText.length<120){ el.innerHTML=html; }
    el.dataset.patchPreenchido='1';
  }
  function preencherPaineis(){
    ensurePanel('view-disc', makeHero('Comportamental · DISC','TESTE DISC','Painel para aplicar testes comportamentais, acompanhar respostas e apoiar decisões de desenvolvimento.') + `
      <div class="patch-panel-wrap">
        <div class="patch-card"><h3>🧠 Aplicar teste</h3><p>Envie o teste para colaboradores e acompanhe quem já respondeu.</p><span class="patch-pill">Criar formulário</span></div>
        <div class="patch-card"><h3>📊 Perfis mapeados</h3><p>Visualize tendências comportamentais por colaborador, equipe ou setor.</p><span class="patch-pill">Ver resultados</span></div>
        <div class="patch-card"><h3>🤖 Análise com IA</h3><p>Use a IA para resumir pontos fortes, riscos e recomendações de gestão.</p><span class="patch-pill">Gerar análise</span></div>
      </div>`);
    ensurePanel('view-pdi', makeHero('Desempenho · Desenvolvimento','PDI & AVALIAÇÃO','Central para acompanhar avaliações, planos de desenvolvimento e evolução dos colaboradores.') + `
      <div class="patch-panel-wrap">
        <div class="patch-card"><h3>🎯 PDI individual</h3><p>Crie objetivos, ações, prazos e responsáveis para cada colaborador.</p><span class="patch-pill">Novo PDI</span></div>
        <div class="patch-card"><h3>⭐ Avaliação de desempenho</h3><p>Acompanhe competências, entregas, feedbacks e histórico de evolução.</p><span class="patch-pill">Avaliar</span></div>
        <div class="patch-card"><h3>🚀 Próximo nível</h3><p>Conecte o PDI à trilha de carreira e ao próximo cargo possível.</p><span class="patch-pill">Ver trilha</span></div>
      </div>`);
    ensurePanel('view-pesquisas', makeHero('Pesquisas · Clima · Engajamento','PESQUISAS INTERNAS','Crie pesquisas, acompanhe participação e analise respostas por setor.') + `
      <div class="patch-panel-wrap">
        <div class="patch-card"><h3>❤️ Clima organizacional</h3><p>Modelos de pesquisa rápida para medir humor, satisfação e engajamento.</p><span class="patch-pill">Criar pesquisa</span></div>
        <div class="patch-card"><h3>📋 Pesquisas pendentes</h3><p>Controle quem respondeu e envie lembretes para pendências.</p><span class="patch-pill">Ver pendências</span></div>
        <div class="patch-card"><h3>📈 Indicadores</h3><p>Resumo visual para o RH entender participação e pontos de atenção.</p><span class="patch-pill">Dashboard</span></div>
      </div>`);
  }
  function preencherIntranetInterna(){
    const ai=document.getElementById('conecta-ai-pane');
    if(ai && (ai.innerText||'').trim().length<80){
      ai.innerHTML=`<div class="conecta-panel"><h3>🤖 Conecta AI</h3><p>Assistente para orientar colaboradores, gestores e RH conforme o perfil de acesso.</p><div class="patch-list"><div class="patch-item">🌴 <span><b>Colaborador:</b> férias, documentos, PDI, trilhas e comunicados.</span></div><div class="patch-item">👔 <span><b>Gestor:</b> equipe, feedbacks, PDI e clima.</span></div><div class="patch-item">🏢 <span><b>RH:</b> comunicados, descritivos, talentos e análises.</span></div></div></div>`;
    }
    const tal=document.getElementById('talentos-pane');
    if(tal && (tal.innerText||'').trim().length<80){
      tal.innerHTML=`<div class="conecta-panel"><h3>🧠 Mapa de Talentos</h3><p>Painel restrito ao RH para acompanhar potencial, sucessão e prontidão para promoção.</p><div class="patch-panel-wrap"><div class="patch-card"><h3>4</h3><p>Prontos para promoção</p></div><div class="patch-card"><h3>7</h3><p>Potencial de liderança</p></div><div class="patch-card"><h3>2</h3><p>Risco de atenção</p></div></div></div>`;
    }
    if(tal && !isRH()) tal.style.display='none';
  }
  function run(){ moveIntranetTop(); preencherPaineis(); preencherIntranetInterna(); }
  document.addEventListener('DOMContentLoaded',run);
  setTimeout(run,300); setTimeout(run,1000); setTimeout(run,2000);
  const old=window.switchView;
  if(typeof old==='function'){
    window.switchView=function(v){ const r=old.apply(this,arguments); setTimeout(run,60); return r; };
  }
})();
