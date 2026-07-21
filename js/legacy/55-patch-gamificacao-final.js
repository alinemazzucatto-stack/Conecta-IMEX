// ===== script: patch-gamificacao-final =====
(function(){
  function esconderViews(){
    document.querySelectorAll('[id^="view-"]').forEach(function(el){
      el.classList.remove('active','dev-active');
      el.style.setProperty('display','none','important');
    });
    var hero = document.getElementById('mainHero');
    if (hero) hero.style.setProperty('display','none','important');
  }
  function mostrarGamificacao(){
    esconderViews();
    var v = document.getElementById('view-gamificacao');
    if (v) { v.classList.add('active'); v.style.setProperty('display','block','important'); }
    document.querySelectorAll('.sb-item').forEach(function(el){ el.classList.remove('active'); });
    var sb = document.getElementById('sb-gamificacao');
    if (sb) sb.classList.add('active');
    var pi = document.getElementById('tPageIcon'); if (pi) { pi.textContent = '🏆'; pi.style.display = ''; }
    var pt = document.getElementById('tPageTitle'); if (pt) pt.textContent = 'Gamificação';
    if (typeof window.gamCarregar === 'function') {
      try { window.gamCarregar(); } catch(e) { console.warn('gamCarregar:', e); }
    }
  }

  var oldSbNav = window.sbNav;
  window.sbNav = function(id){
    if (id === 'gamificacao') { mostrarGamificacao(); return; }
    return (typeof oldSbNav === 'function') ? oldSbNav.apply(this, arguments) : undefined;
  };

  var oldSwitchView = window.switchView;
  window.switchView = function(id){
    if (id === 'gamificacao') { mostrarGamificacao(); return; }
    return (typeof oldSwitchView === 'function') ? oldSwitchView.apply(this, arguments) : undefined;
  };

  function garantirItemSidebar(){
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    if (document.getElementById('sb-gamificacao')) return;
    var el = document.createElement('div');
    el.className = 'sb-item';
    el.id = 'sb-gamificacao';
    el.title = '';
    el.innerHTML = '<span>🏆</span><span class="sb-tip">Gamificação</span>';
    el.onclick = function(){ window.sbNav('gamificacao'); };
    var ouvidoria = document.getElementById('sb-ouvidoria');
    if (ouvidoria && ouvidoria.parentNode) {
      ouvidoria.parentNode.insertBefore(el, ouvidoria.nextSibling);
    } else {
      var spacer = sidebar.querySelector('.sb-spacer');
      if (spacer) sidebar.insertBefore(el, spacer); else sidebar.appendChild(el);
    }
  }
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(garantirItemSidebar, 200);
    setTimeout(garantirItemSidebar, 900);
    setTimeout(garantirItemSidebar, 1800);
  });
})();

