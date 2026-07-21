// ===== script: trilhas-estrutura-fixer =====
(function(){
  if(window.__trilhasEstruturaFixer) return;
  window.__trilhasEstruturaFixer = true;

  function fixEstruturaView(){
    var v = document.getElementById('view-estrutura-carreira');
    if(!v) return;
    var isActive = v.classList.contains('active') || v.style.display === 'block' || (v.style.display !== 'none' && v.offsetParent !== null);
    if(!isActive) return;
    // Se o card de Trilhas não tiver o onclick correto, re-renderiza
    if(!v.querySelector('[onclick*="abrirTrilhasColaborador"]')){
      if(typeof window.renderEstruturaCarreira === 'function'){
        window.renderEstruturaCarreira();
      } else if(typeof window.renderEstruturaFase1 === 'function'){
        window.renderEstruturaFase1();
      }
    }
  }

  // Roda logo ao carregar
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(fixEstruturaView, 500);
    setTimeout(fixEstruturaView, 1200);
  });

  // REMOVED: Performance optimization - 400ms setInterval polling
  // Monitora continuamente enquanto a view puder ficar ativa
  // setInterval(fixEstruturaView, 400);
})();



