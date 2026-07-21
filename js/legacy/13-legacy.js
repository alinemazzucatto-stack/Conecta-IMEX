// ===== script: (sem id) =====
// Correção final: modelos prontos e encerradas aparecem somente para RH.
(function(){
  // REMOVED: Consolidated in 000-core-functions.js
  // function isRH(){
  //   // `_roleReal === 'rh-colaborador'` é a marca de "conta híbrida vendo
  //   // como colaborador" (ver login) — NÃO significa "é RH agora". Checar
  //   // isso aqui é o inverso do que se quer: libera conteúdo de RH
  //   // justamente para quem escolheu ver como colaborador.
  //   try {
  //     return (typeof role !== 'undefined' && role === 'rh') || (typeof window.role !== 'undefined' && window.role === 'rh');
  //   } catch(e){ return false; }
  // }
  function aplicarPermissoesPesquisas(){
    var rh = isRH();
    var tabModelos = document.getElementById('pesq-tab-modelos-btn');
    var tabEncerradas = document.getElementById('pesq-tab-encerradas-btn');
    var paneModelos = document.getElementById('pesq-pane-modelos');
    var paneEncerradas = document.getElementById('pesq-pane-encerradas');
    var btnCriar = document.getElementById('pesq-btn-criar');

    if (tabModelos) tabModelos.style.display = rh ? '' : 'none';
    if (tabEncerradas) tabEncerradas.style.display = rh ? '' : 'none';
    if (paneModelos && !rh) paneModelos.style.display = 'none';
    if (paneEncerradas && !rh) paneEncerradas.style.display = 'none';
    if (btnCriar) btnCriar.style.display = rh ? '' : 'none';

    if (!rh) {
      var paneAtivas = document.getElementById('pesq-pane-ativas');
      if (paneAtivas) paneAtivas.style.display = 'block';
      document.querySelectorAll('#pesq-tabs .tab').forEach(function(b){ b.classList.remove('active'); });
      var primeira = document.querySelector('#pesq-tabs .tab');
      if (primeira) primeira.classList.add('active');
      window.pesqTabAtiva = 'ativas';
    }
  }

  var originalPesqTab = window.pesqTab;
  window.pesqTab = function(t, el){
    if (!isRH() && t !== 'ativas') t = 'ativas';
    if (typeof originalPesqTab === 'function') originalPesqTab(t, el);
    aplicarPermissoesPesquisas();
  };

  var originalPesqCarregar = window.pesqCarregar;
  window.pesqCarregar = async function(){
    if (typeof originalPesqCarregar === 'function') await originalPesqCarregar();
    aplicarPermissoesPesquisas();
  };

  document.addEventListener('DOMContentLoaded', aplicarPermissoesPesquisas);
  setTimeout(aplicarPermissoesPesquisas, 500);
  setTimeout(aplicarPermissoesPesquisas, 1500);
})();

