// Gestão RH no padrão Essence: painel único com abas, sem hub de cartões.
(function(){
  'use strict';
  if(window.__ESSENCE_RH_TABS__) return;
  window.__ESSENCE_RH_TABS__ = true;

  var originalGrhTab = window.grhTab;
  var originalSbNav = window.sbNav;
  var originalSwitchView = window.switchView;
  var openingTab = false;

  function normalize(tab){
    tab = String(tab || 'colaboradores').toLowerCase();
    if(tab === 'beneficios') return 'beneficios-rh';
    if(tab === 'pesquisas') return 'pesquisas-rh';
    if(tab === 'roadmap') return 'roadmap-produto';
    if(tab === 'endereco') return 'enderecos';
    return tab;
  }

  function tabButton(tab){
    var aliases = {
      'beneficios-rh':'beneficios',
      'pesquisas-rh':'pesquisas',
      'roadmap-produto':'roadmap'
    };
    var key = aliases[tab] || tab;
    return Array.from(document.querySelectorAll('#grh-tabs button')).find(function(btn){
      return (btn.getAttribute('onclick') || '').indexOf("'" + key + "'") !== -1;
    }) || null;
  }

  function enforcePanel(tab){
    var view = document.getElementById('view-gestao-rh');
    if(!view) return;
    view.classList.add('grh-module-open');
    var tabs = document.getElementById('grh-tabs');
    if(tabs) tabs.style.setProperty('display','flex','important');
    view.querySelectorAll(':scope > .hero, :scope > section.hero').forEach(function(hero){
      hero.style.setProperty('display','flex','important');
    });
    var back = document.getElementById('grh-back-bar');
    if(back) back.style.setProperty('display','none','important');
    var moduleHero = document.getElementById('grh-module-hero');
    if(moduleHero) moduleHero.style.setProperty('display','none','important');
    document.querySelectorAll('#grh-tabs button').forEach(function(btn){ btn.classList.remove('active'); });
    var active = tabButton(tab);
    if(active) active.classList.add('active');
    try{ sessionStorage.setItem('grhUltimaAba', tab); }catch(e){}
  }

  function openTab(tab, btn){
    tab = normalize(tab);
    if(openingTab){
      enforcePanel(tab);
      return false;
    }
    var targetBtn = btn || tabButton(tab);
    var result = false;
    openingTab = true;
    try{
      result = typeof originalGrhTab === 'function' ? originalGrhTab.call(window, tab, targetBtn) : false;
    }finally{
      openingTab = false;
    }
    enforcePanel(tab);
    requestAnimationFrame(function(){ enforcePanel(tab); });
    setTimeout(function(){ enforcePanel(tab); }, 60);
    return result;
  }

  window.grhTab = openTab;
  window.sbNav = function(id){
    if(String(id || '').toLowerCase() === 'gestao-rh') return openTab('colaboradores');
    return typeof originalSbNav === 'function' ? originalSbNav.apply(this, arguments) : false;
  };
  window.switchView = function(id){
    if(String(id || '').toLowerCase() === 'gestao-rh') return openTab('colaboradores');
    return typeof originalSwitchView === 'function' ? originalSwitchView.apply(this, arguments) : window.sbNav(id);
  };
  window.voltarGestaoRH = window.voltarParaGestaoRH = window.voltarMenuGestaoRH = function(){
    return openTab('colaboradores');
  };
})();