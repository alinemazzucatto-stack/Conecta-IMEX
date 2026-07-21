// ===== script: patch-grh-hub-abas-js =====
(function(){
  const titulos = {
    colaboradores:'👥 Colaboradores',
    enderecos:'📍 Endereços',
    remuneracao:'💰 Remuneração',
    movimentacoes:'🔄 Movimentações',
    admissao:'✅ Admissões',
    desligamentos:'❌ Desligamentos',
    ferias:'🌴 Gestão de Férias',
    documentos:'📄 Documentos',
    'beneficios-rh':'🎁 Benefícios',
    'proximas-funcionalidades':'🚧 Próximas Funcionalidades',
    talentos:'🎯 Mapa de Talentos',
    'importar-base':'👥 Base / Importar'
  };

  function view(){ return document.getElementById('view-gestao-rh'); }
  function tabs(){ return document.getElementById('grh-tabs'); }

  function garantirBackBar(){
    const t=tabs();
    if(!t || document.getElementById('grh-back-bar')) return;
    t.insertAdjacentHTML('afterend', `
      <div id="grh-back-bar">
        <button class="grh-back-btn" type="button" onclick="voltarGestaoRH()">← Voltar para Gestão de RH</button>
        <div class="grh-back-title" id="grh-back-title">Módulo</div>
      </div>
    `);
  }

  function esconderPanes(){
    document.querySelectorAll('#view-gestao-rh [id^="grh-pane-"]').forEach(p=>p.style.display='none');
  }

  window.voltarGestaoRH = function(){
    const v=view();
    if(v) v.classList.remove('grh-module-open');
    esconderPanes();
    document.querySelectorAll('#grh-tabs .tab').forEach(b=>b.classList.remove('active'));
    const title=document.getElementById('grh-back-title');
    if(title) title.textContent='Módulo';
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const anterior = window.grhTab;
  window.grhTab = function(tab, btn){
    garantirBackBar();
    const v=view();
    if(v) v.classList.add('grh-module-open');
    esconderPanes();
    document.querySelectorAll('#grh-tabs .tab').forEach(b=>b.classList.remove('active'));
    const pane=document.getElementById('grh-pane-'+tab);
    if(pane) pane.style.display='block';
    if(btn) btn.classList.add('active');
    const title=document.getElementById('grh-back-title');
    if(title) title.textContent=titulos[tab] || 'Módulo';

    // Reaproveita as renderizações existentes do sistema.
    try{
      if(tab==='colaboradores' && typeof window.grhRenderColabs==='function') window.grhRenderColabs();
      if(tab==='remuneracao' && typeof window.grhRenderRemuneracao==='function') window.grhRenderRemuneracao();
      if(tab==='movimentacoes' && typeof window.grhRenderMovimentacoes==='function') window.grhRenderMovimentacoes();
      if(tab==='desligamentos' && typeof window.grhRenderDesligamentos==='function') window.grhRenderDesligamentos();
      if(tab==='enderecos' && typeof window.grhRenderEnderecos==='function') window.grhRenderEnderecos();
      if(tab==='admissao' && typeof window.grhRenderAdmissao==='function') window.grhRenderAdmissao();
      if(tab==='ferias' && typeof window.grhRenderFerias==='function') window.grhRenderFerias();
      if(tab==='talentos' && typeof window.grhRenderTalentos==='function') window.grhRenderTalentos();
    }catch(e){ console.warn('Erro ao renderizar módulo Gestão RH:', e); }

    window.scrollTo({top:0,behavior:'smooth'});
  };

  function iniciarHub(){
    garantirBackBar();
    // A tela inicial da Gestão de RH fica somente com os cards.
    voltarGestaoRH();
  }

  document.addEventListener('DOMContentLoaded',()=>setTimeout(iniciarHub,1200));
  setTimeout(iniciarHub,1800);
})();

