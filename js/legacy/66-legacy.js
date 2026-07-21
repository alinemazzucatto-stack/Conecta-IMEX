// ===== script: (sem id) =====
(function(){
  if(window.__imexHeroCompactoFinal) return;
  window.__imexHeroCompactoFinal = true;

  function compactarHeroes(){
    document.querySelectorAll('.hero, .module-hero, .page-hero, .rh-hero, .intranet-hero, .gamificacao-hero, .ouvidoria-hero, .dashboard-hero, .beneficios-hero, .estrutura-hero, .ferias-hero, .pesquisas-hero, .auditoria-hero').forEach(function(el){
      el.style.setProperty('min-height','118px','important');
      el.style.setProperty('height','auto','important');
      el.style.setProperty('padding','22px 38px','important');
      el.style.setProperty('margin','18px 0 20px 0','important');
      el.style.setProperty('align-items','center','important');
    });
    document.querySelectorAll('.hero h1, .module-hero h1, .page-hero h1').forEach(function(el){
      el.style.setProperty('font-size','30px','important');
      el.style.setProperty('line-height','1.08','important');
      el.style.setProperty('margin-bottom','8px','important');
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    compactarHeroes();
    setTimeout(compactarHeroes, 300);
    setTimeout(compactarHeroes, 1000);
  });

  var oldSbNav = window.sbNav;
  if(typeof oldSbNav === 'function' && !oldSbNav.__heroCompactWrapped){
    var wrapped = function(){
      var r = oldSbNav.apply(this, arguments);
      setTimeout(compactarHeroes, 80);
      setTimeout(compactarHeroes, 350);
      return r;
    };
    wrapped.__heroCompactWrapped = true;
    window.sbNav = wrapped;
  }

  window.connCompactarHeroes = compactarHeroes;
})();

