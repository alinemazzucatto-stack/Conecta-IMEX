// ===== script: (sem id) =====
// Ajuste RH: garante que Modelos Prontos apareça para RH e fique oculto para colaborador/gestor.
(function(){
  function perfilRH(){
    // mesmo motivo do patch acima: 'rh-colaborador' em _roleReal marca
    // "híbrido vendo como colaborador", não "é RH agora".
    try { return (typeof role !== 'undefined' && role === 'rh') || (typeof window.role !== 'undefined' && window.role === 'rh'); }
    catch(e){ return false; }
  }
  function ajustarPesquisasPorPerfil(){
    var rh = perfilRH();
    var modelos = document.getElementById('pesq-tab-modelos-btn');
    var encerradas = document.getElementById('pesq-tab-encerradas-btn');
    var criar = document.getElementById('pesq-btn-criar');
    if(modelos) modelos.style.display = rh ? '' : 'none';
    if(encerradas) encerradas.style.display = rh ? '' : 'none';
    if(criar) criar.style.display = rh ? '' : 'none';
    if(!rh){
      var paneModelos = document.getElementById('pesq-pane-modelos');
      var paneEncerradas = document.getElementById('pesq-pane-encerradas');
      if(paneModelos) paneModelos.style.display = 'none';
      if(paneEncerradas) paneEncerradas.style.display = 'none';
    }
  }
  document.addEventListener('DOMContentLoaded', ajustarPesquisasPorPerfil);
  setTimeout(ajustarPesquisasPorPerfil, 300);
  setTimeout(ajustarPesquisasPorPerfil, 1200);
  setTimeout(ajustarPesquisasPorPerfil, 2500);
  window.ajustarPesquisasPorPerfil = ajustarPesquisasPorPerfil;
})();



