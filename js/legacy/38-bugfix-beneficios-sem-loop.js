// ===== script: bugfix-beneficios-sem-loop-js =====
(function(){
  'use strict';
  if(window.__BUGFIX_BENEFICIOS_SEM_LOOP__) return;
  window.__BUGFIX_BENEFICIOS_SEM_LOOP__ = true;

  function $(id){ return document.getElementById(id); }
  function isBenefId(id){ return id === 'beneficios' || id === 'meus-beneficios'; }

  function desativarBeneficios(){
    var v = $('view-beneficios');
    if(!v) return;
    v.classList.remove('active','dev-active','beneficios-force-active');
    v.style.setProperty('display','none','important');
    v.style.setProperty('visibility','hidden','important');
    v.style.setProperty('opacity','0','important');
    var sb = $('sb-beneficios');
    if(sb) sb.classList.remove('active');
  }

  function prepararSaida(id){
    if(!isBenefId(id)) desativarBeneficios();
  }

  var sbAtual = window.sbNav;
  var switchAtual = window.switchView;
  var showAtual = window.showView;

  window.sbNav = function(id){
    prepararSaida(id);
    return (typeof sbAtual === 'function') ? sbAtual.apply(this, arguments) : undefined;
  };

  window.switchView = function(id){
    prepararSaida(id);
    return (typeof switchAtual === 'function') ? switchAtual.apply(this, arguments) : (typeof window.sbNav === 'function' ? window.sbNav(id) : undefined);
  };

  window.showView = function(id){
    prepararSaida(id);
    return (typeof showAtual === 'function') ? showAtual.apply(this, arguments) : (typeof window.sbNav === 'function' ? window.sbNav(id) : undefined);
  };

  document.addEventListener('click', function(ev){
    var alvo = ev.target && ev.target.closest ? ev.target.closest('[id^="sb-"],[data-view],[onclick],.role-btn') : null;
    if(!alvo) return;
    var txt = (alvo.id || '') + ' ' + (alvo.getAttribute('data-view') || '') + ' ' + (alvo.getAttribute('onclick') || '');
    if(!/beneficios|meus-beneficios/i.test(txt)) desativarBeneficios();
  }, true);

  // REMOVED: Performance optimization - 250ms setInterval polling
  // Segurança extra: se outro módulo estiver ativo, Benefícios fica escondido.
  /*setInterval(function(){
    var v = $('view-beneficios');
    if(!v) return;
    var outraAtiva = Array.prototype.some.call(document.querySelectorAll('[id^="view-"]'), function(el){
      return el.id !== 'view-beneficios' && el.classList.contains('active') && getComputedStyle(el).display !== 'none';
    });
    if(outraAtiva) desativarBeneficios();
  }, 250);*/
})();
