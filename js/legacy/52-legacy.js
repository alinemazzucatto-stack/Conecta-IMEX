// ===== script: (sem id) =====
(function(){
  function $(id){return document.getElementById(id)}
  function isRhAtivo(){ return String(window.role||'').toLowerCase()==='rh' || String(window.role||'').toLowerCase()==='rh-colaborador'; }
  function painelHTML(tipo){
    if(tipo==='beneficios') return `
      <div class="grh-bplan-card" id="grh-bplan-saude">
        <div class="grh-bplan-head" onclick="grhToggleBeneficioPlano('saude')">
          <div class="grh-bplan-ico">🩺</div>
          <div class="grh-bplan-info">
            <h3>Plano de Saúde — Unimed</h3>
            <p>Titulares, dependentes e valores mensais</p>
          </div>
          <div class="grh-bplan-kpis">
            <div class="grh-bplan-kpi"><strong id="grh-bsa-saude-total">0</strong><span>colaboradores</span></div>
            <div class="grh-bplan-kpi"><strong id="grh-bsa-saude-custo">R$ 0,00</strong><span>custo mensal</span></div>
          </div>
          <div class="grh-bplan-chevron" id="grh-bplan-chevron-saude">▾</div>
        </div>
        <div class="grh-bplan-body" id="grh-bplan-body-saude" style="display:none">
          ${grhBeneficioCardBody('saude')}
        </div>
      </div>

      <div class="grh-bplan-card" id="grh-bplan-odonto">
        <div class="grh-bplan-head" onclick="grhToggleBeneficioPlano('odonto')">
          <div class="grh-bplan-ico">🦷</div>
          <div class="grh-bplan-info">
            <h3>Plano Odontológico — Uniodonto</h3>
            <p>Titulares, dependentes e valores mensais</p>
          </div>
          <div class="grh-bplan-kpis">
            <div class="grh-bplan-kpi"><strong id="grh-bsa-odonto-total">0</strong><span>colaboradores</span></div>
            <div class="grh-bplan-kpi"><strong id="grh-bsa-odonto-custo">R$ 0,00</strong><span>custo mensal</span></div>
          </div>
          <div class="grh-bplan-chevron" id="grh-bplan-chevron-odonto">▾</div>
        </div>
        <div class="grh-bplan-body" id="grh-bplan-body-odonto" style="display:none">
          ${grhBeneficioCardBody('odonto')}
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-head"><div class="cht"><h2>🎁 Outros benefícios</h2><p>Demais fornecedores do pacote de benefícios IMEX.</p></div></div>
        <div class="card-body"><div class="grh-patch-grid">${[['🏋️','Wellhub','Controle de acesso, utilização e dependentes liberados.','Acesso|Dependentes'],['❤️','Starbem','Consultas gratuitas, dependentes e elegibilidade.','Consultas|Elegibilidade'],['🏥','Dasa','Exames, agendamentos, acesso e indicadores de utilização.','Exames|Acesso'],['🧠','Optum','Psicologia, nutrição, medicina e acompanhamento de uso.','Saúde mental|Nutrição'],['🍔','iFood Benefícios','Vale alimentação/refeição, calendário de pagamento e conferência mensal.','VA/VR|Calendário']].map(x=>`<div class="grh-patch-card"><div class="ico">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p><div class="grh-patch-tags">${x[3].split('|').map(t=>`<span>${t}</span>`).join('')}</div></div>`).join('')}</div></div>
      </div>`;
    if(tipo==='documentos') return (typeof window.grhDocsPainelHTML==='function') ? window.grhDocsPainelHTML() : '<div class="empty"><div class="ei">📄</div>Carregando módulo de Documentos…</div>';
    if(tipo==='pesquisas') return (typeof window.grhPesquisasPainelHTML==='function') ? window.grhPesquisasPainelHTML() : '<div class="grh-patch-kpi"><small>Pesquisas</small><strong>—</strong><span>Carregando…</span></div>';
    return `<div class="card"><div class="card-head"><div class="cht"><h2>🗺️ Roadmap do Produto</h2><p>Fases do Conecta IMEX sem tela em branco e sem piscar.</p></div></div><div class="card-body"><div class="grh-rmap"><div class="grh-rmap-card"><span class="grh-rmap-badge ok">✅ Fase 1 implantada</span><h3>Gestão RH + Conexão</h3><ul><li>Colaboradores, Endereços e Remuneração</li><li>Férias, Benefícios e Documentos</li><li>Pesquisas, Ouvidoria e Intranet</li><li>Movimentações, Admissões e Desligamentos</li></ul></div><div class="grh-rmap-card"><span class="grh-rmap-badge pause">🔮 Fase 2 planejada</span><h3>Desenvolvimento & Talentos</h3><ul><li>Trilhas de carreira e PDI</li><li>DISC e Avaliação de Desempenho</li><li>Mapeamento de Talentos e Matriz 9 Box</li><li>Universidade Corporativa</li></ul></div><div class="grh-rmap-card"><span class="grh-rmap-badge plan">🔮 Fase 3 planejada</span><h3>Recrutamento & Seleção</h3><ul><li>Vagas e banco de talentos</li><li>Pipeline, entrevistas e indicadores</li><li>Triagem com IA</li></ul></div></div></div></div>`;
  }
  function ensurePanels(){
    const host=$('view-gestao-rh'); if(!host) return;
    ['beneficios','documentos','pesquisas','roadmap'].forEach(function(t){
      let pane=$('grh-pane-'+t);
      if(!pane){ pane=document.createElement('div'); pane.id='grh-pane-'+t; pane.style.display='none'; host.appendChild(pane); }
      if(!pane.innerHTML.trim() || pane.textContent.trim().length<40) pane.innerHTML=painelHTML(t);
    });
  }
  window.__ensurePanelsGRH = ensurePanels;
  function applyGuard(){
    const rh=isRhAtivo();
    ['gestao-rh','dashboard','auditoria','usuarios','desenvolvimento-talentos'].forEach(function(id){ const el=$('sb-'+id); if(el) el.style.display = rh ? '' : 'none'; });
    const grh=$('view-gestao-rh');
    if(!rh && grh && getComputedStyle(grh).display!=='none'){
      if(typeof window.switchView==='function') window.switchView('intranet');
      else grh.style.display='none';
    }
  }
  const oldSwitch=window.switchView;
  window.switchView=function(v){
    if(!isRhAtivo() && ['gestao-rh','dashboard','auditoria','usuarios','desenvolvimento-talentos'].includes(String(v||''))){ v='intranet'; }
    const r = typeof oldSwitch==='function' ? oldSwitch.apply(this, [v]) : undefined;
    ensurePanels(); applyGuard(); return r;
  };
  const oldSb=window.sbNav;
  window.sbNav=function(v){
    if(!isRhAtivo() && ['gestao-rh','dashboard','auditoria','usuarios','desenvolvimento-talentos'].includes(String(v||''))){ v='intranet'; }
    if(typeof window.switchView==='function') return window.switchView(v);
    return typeof oldSb==='function' ? oldSb.apply(this,[v]) : undefined;
  };
  window.grhTab=function(aba,btn){
    ensurePanels();
    const aliases={'beneficios-rh':'beneficios','pesquisas-rh':'pesquisas','roadmap-produto':'roadmap','proximas-funcionalidades':'roadmap'};
    aba=aliases[aba]||aba;
    if(aba==='pesquisas'){
      if(typeof window.switchView==='function') window.switchView('pesquisas');
      else if(typeof window.sbNav==='function') window.sbNav('pesquisas');
      try{
        if(typeof window.pesqCarregar==='function') window.pesqCarregar();
        if(typeof window.ajustarPesquisasPorPerfil==='function') window.ajustarPesquisasPorPerfil();
      }catch(e){}
      window.scrollTo({top:0,behavior:'smooth'});
      return;
    }
    const abas=['colaboradores','remuneracao','movimentacoes','desligamentos','enderecos','admissao','importar-base','ferias','beneficios','documentos','pesquisas','roadmap'];
    abas.forEach(function(a){ const p=$('grh-pane-'+a); if(p) p.style.display=(a===aba?'block':'none'); });
    document.querySelectorAll('#grh-tabs .tab').forEach(function(b){b.classList.remove('active')});
    if(btn) btn.classList.add('active');
    if(!btn){ const wanted=Array.from(document.querySelectorAll('#grh-tabs .tab')).find(b=>(b.getAttribute('onclick')||'').includes("'"+aba+"'")||(b.getAttribute('onclick')||'').includes('"'+aba+'"')); if(wanted) wanted.classList.add('active'); }
    try{
      if(aba==='ferias' && window.renderRH) window.renderRH();
      if(aba==='importar-base' && window.renderColabs) window.renderColabs();
      if(aba==='beneficios' && typeof window.grhRenderBeneficiosSaude==='function') window.grhRenderBeneficiosSaude();
      if(aba==='documentos' && typeof window.grhDocsCarregar==='function') window.grhDocsCarregar();
    }catch(e){}
  };
  const oldBuild=window.buildSidebar; if(typeof oldBuild==='function'){ window.buildSidebar=function(){ const r=oldBuild.apply(this,arguments); ensurePanels(); applyGuard(); return r; }; }
  const oldTrocar=window.trocarPerfil; if(typeof oldTrocar==='function'){ window.trocarPerfil=function(){ const r=oldTrocar.apply(this,arguments); setTimeout(function(){ ensurePanels(); applyGuard(); if(String(window.role||'').toLowerCase()==='colaborador' && typeof window.switchView==='function') window.switchView('intranet'); },80); return r; }; }
  document.addEventListener('DOMContentLoaded',function(){ ensurePanels(); applyGuard(); });
  setTimeout(function(){ ensurePanels(); applyGuard(); },300);
  setTimeout(function(){ ensurePanels(); applyGuard(); },1200);
})();

