// ===== script: patch-grh-cards-limpos-js =====
(function(){
  const itens = [
    ['colaboradores','👥','Colaboradores','Cadastros e dados dos colaboradores'],
    ['enderecos','📍','Endereços','Endereços cadastrados e atualizações'],
    ['remuneracao','💰','Remuneração','Salários, contratos e folha'],
    ['movimentacoes','🔄','Movimentações','Cargo, setor, salário e gestor'],
    ['admissao','✅','Admissões','Entrada de novos colaboradores'],
    ['desligamentos','❌','Desligamentos','Saídas e histórico de desligamento'],
    ['ferias','🌴','Gestão de Férias','Solicitações, saldos e calendário'],
    ['documentos','📄','Documentos','Arquivos e prontuário digital'],
    ['beneficios-rh','🎁','Benefícios','Benefícios, dependentes e custos'],
    ['acessos','🔐','Acessos e Permissões','Controle de acessos por perfil'],
    ['proximas-funcionalidades','🚧','Próximas Funcionalidades','Desenvolvimento e R&S em construção']
  ];
  function garantirPanesExtras(){
    const tabs=document.getElementById('grh-tabs');
    if(!tabs || !tabs.parentElement) return;
    const container=tabs.parentElement;
    if(!document.getElementById('grh-pane-documentos')){
      container.insertAdjacentHTML('beforeend',`<div id="grh-pane-documentos" style="display:none"><div class="card"><div class="card-head"><div class="cht"><h2>📄 Documentos</h2><p>Contratos, advertências, termos, políticas e arquivos do prontuário.</p></div></div><div class="card-body"><div class="empty"><div class="ei">📄</div>As informações e arquivos ficam organizados dentro deste módulo.</div></div></div></div>`);
    }
    if(!document.getElementById('grh-pane-beneficios-rh')){
      container.insertAdjacentHTML('beforeend',`<div id="grh-pane-beneficios-rh" style="display:none"><div class="card"><div class="card-head"><div class="cht"><h2>🎁 Benefícios</h2><p>Unimed, Wellhub, Starbem, Dasa, Optum, iFood e demais controles.</p></div></div><div class="card-body"><div class="empty"><div class="ei">🎁</div>Os dados detalhados de benefícios ficam dentro deste módulo.</div></div></div></div>`);
    }
    if(!document.getElementById('grh-pane-proximas-funcionalidades')){
      container.insertAdjacentHTML('beforeend',`<div id="grh-pane-proximas-funcionalidades" style="display:none">
        <div class="card">
          <div class="card-head">
            <div class="cht"><h2>🚧 Próximas Funcionalidades</h2><p>Módulos planejados para evolução futura do Conecta IMEX.</p></div>
            <span class="badge bb">Em breve</span>
          </div>
          <div class="card-body">
            <div class="future-mod-grid">
              <div class="future-mod-card">
                <div class="future-mod-top"><div class="future-mod-ico">🌱</div><span>Futuro</span></div>
                <h3>Desenvolvimento</h3>
                <p>Central para acompanhar crescimento, desempenho e evolução profissional.</p>
                <div class="future-mini-grid">
                  <span>🎯 Trilhas de Carreira</span><span>📚 Meu Desenvolvimento</span><span>📝 PDI</span><span>🧠 DISC</span><span>⭐ Avaliações</span><span>🚀 Mapeamento de Talentos</span>
                </div>
              </div>
              <div class="future-mod-card">
                <div class="future-mod-top"><div class="future-mod-ico">📋</div><span>Futuro</span></div>
                <h3>Recrutamento e Seleção</h3>
                <p>Central para gestão de vagas, candidatos, entrevistas e triagem inteligente.</p>
                <div class="future-mini-grid">
                  <span>📋 Vagas</span><span>👤 Candidatos</span><span>📅 Entrevistas</span><span>📊 Pipeline</span><span>🤖 Triagem IA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`);
    }
  }
  function aplicarCards(){
    const tabs=document.getElementById('grh-tabs');
    if(!tabs) return;
    garantirPanesExtras();
    const ativoAtual=(tabs.querySelector('.tab.active')?.getAttribute('onclick')||'').match(/grhTab\('([^']+)'/)?.[1] || 'colaboradores';
    tabs.innerHTML=itens.map(([id,ico,titulo,sub])=>`
      <button class="tab ${id===ativoAtual?'active':''}" data-icon="${ico}" onclick="grhTab('${id}',this)">
        <span><span class="grh-card-title">${titulo}</span><span class="grh-card-sub">${sub}</span></span>
      </button>`).join('');
  }
  const antigo=window.grhTab;
  window.patchGestaoRHTabsLimpos = aplicarCards;
  window.grhTab=function(tab,btn){
    garantirPanesExtras();
    document.querySelectorAll('[id^="grh-pane-"]').forEach(p=>p.style.display='none');
    document.querySelectorAll('#grh-tabs .tab').forEach(b=>b.classList.remove('active'));
    const pane=document.getElementById('grh-pane-'+tab); if(pane) pane.style.display='block';
    if(btn) btn.classList.add('active');
    try{ if(typeof antigo==='function' && !['documentos','beneficios-rh'].includes(tab)) antigo(tab,btn); }catch(e){ console.warn('grhTab limpo:',e); }
    setTimeout(aplicarCards,20);
  };
  function start(){ aplicarCards(); }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(start,500));
  setTimeout(start,900);
  setTimeout(start,1800);
})();

