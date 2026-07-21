// ===== script: sidebar-flicker-fix =====
(function(){
  if(window.__sbFlickerFixed) return;
  window.__sbFlickerFixed = true;

  function revealSidebar(){
    var s = document.getElementById('sidebar');
    if(s && !s.classList.contains('sb-ready')) s.classList.add('sb-ready');
  }

  // buildSidebar é chamado APÓS o Firebase definir o role real.
  // Aguarda só o próximo frame para o aplicarMenu() terminar de ajustar os itens.
  var _origBuild = window.buildSidebar;
  if(typeof _origBuild === 'function'){
    window.buildSidebar = function(){
      var r = _origBuild.apply(this, arguments);
      requestAnimationFrame(function(){ requestAnimationFrame(revealSidebar); });
      return r;
    };
  }

  // Fallback: revela em 2.5s caso buildSidebar nunca seja chamado
  setTimeout(revealSidebar, 2500);
})();


