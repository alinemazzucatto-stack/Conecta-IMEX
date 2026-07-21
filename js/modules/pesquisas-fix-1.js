// ===== script: pesquisas-grhtab-final-override =====
(function(){
  if(window.__pesqGrhTabFinalOverride) return;
  window.__pesqGrhTabFinalOverride = true;

  function abrirPesquisasDashboard(){
    var grhView = document.getElementById('view-gestao-rh');
    // Garante que view-gestao-rh está visível
    if(grhView){
      document.querySelectorAll('[id^="view-"]').forEach(function(v){
        v.style.display = 'none'; v.classList.remove('active');
      });
      grhView.style.display = 'block';
      grhView.classList.add('active', 'grh-module-open');
    }
    // Esconde hero e tabs do GRH
    var tabs = document.getElementById('grh-tabs');
    if(tabs) tabs.style.display = 'none';
    var mhero = document.getElementById('grh-module-hero');
    if(mhero) mhero.style.setProperty('display','none','important');
    // Back bar
    var bar = document.getElementById('grh-back-bar');
    if(bar){ bar.style.display='flex'; bar.style.marginBottom='6px'; }
    var backTitle = document.getElementById('grh-back-title');
    if(backTitle) backTitle.textContent = '📋 Pesquisas';
    // Esconde todos os panes
    document.querySelectorAll('[id^="grh-pane-"]').forEach(function(p){
      p.style.display = 'none'; p.classList.remove('active');
    });
    // Cria grh-pane-pesquisas se não existir
    var host = grhView || document.getElementById('view-gestao-rh');
    var pane = document.getElementById('grh-pane-pesquisas');
    if(!pane && host){
      pane = document.createElement('div');
      pane.id = 'grh-pane-pesquisas';
      pane.style.cssText = 'padding:20px';
      host.appendChild(pane);
    }
    if(pane){
      pane.innerHTML = (typeof window.grhPesquisasPainelHTML === 'function') ? window.grhPesquisasPainelHTML() : '<p>Carregando…</p>';
      pane.style.display = 'block';
      pane.classList.add('active');
    }
    window.scrollTo({top:0, behavior:'smooth'});
  }

  // Esse painel (grh-pane-pesquisas dentro de Gestão RH) é exclusivo de RH.
  // Colaborador/gestor devem continuar na view-pesquisas normal.
  // REMOVED: Consolidated in 000-core-functions.js
  // function souRH(){ return typeof window.isRH === 'function' ? window.isRH() : false; }

  // 1) Intercepta grhTab
  var prevGrhTab = window.grhTab;
  window.grhTab = function(aba, btn){
    var a = String(aba||'').toLowerCase();
    if(souRH() && (a === 'pesquisas-rh' || a === 'pesquisas')){ abrirPesquisasDashboard(); return; }
    return typeof prevGrhTab === 'function' ? prevGrhTab.apply(this, arguments) : undefined;
  };

  // 2) Intercepta sbNav
  var prevSbNav = window.sbNav;
  window.sbNav = function(v){
    if(souRH() && String(v||'').toLowerCase() === 'pesquisas'){ abrirPesquisasDashboard(); return; }
    return typeof prevSbNav === 'function' ? prevSbNav.apply(this, arguments) : undefined;
  };

  // 3) Intercepta switchView
  var prevSwitchView = window.switchView;
  window.switchView = function(v){
    if(souRH() && String(v||'').toLowerCase() === 'pesquisas'){ abrirPesquisasDashboard(); return; }
    return typeof prevSwitchView === 'function' ? prevSwitchView.apply(this, arguments) : undefined;
  };

  // 4) REMOVED: Aggressive 300ms polling causes performance drain and CSS race conditions
  // Consolidated in 000-core-functions.js with event-driven approach
  /*
  setInterval(function(){
    if(!souRH()) return;
    var vp = document.getElementById('view-pesquisas');
    if(!vp) return;
    var cs = window.getComputedStyle(vp);
    if(cs.display !== 'none' && cs.visibility !== 'hidden'){
      vp.style.display = 'none';
      vp.classList.remove('active');
      abrirPesquisasDashboard();
    }
  }, 300);
  */
})();


