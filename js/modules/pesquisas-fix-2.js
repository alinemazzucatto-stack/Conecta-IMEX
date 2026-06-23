// ===== script: pesquisas-click-fix2-js =====
(function(){
'use strict';
if(window.__pesqClickFix2) return;
window.__pesqClickFix2 = true;

var wantPesquisas = false;
var lastFix = 0;

function forcarPesquisas(){
  var now = Date.now();
  if(now - lastFix < 30) return; // evita loop de mutacoes se retriggerarem entre si
  lastFix = now;

  var vg = document.getElementById('view-gestao-rh');
  if(vg){
    vg.classList.remove('active','dev-active');
    vg.style.setProperty('display','none','important');
  }
  document.querySelectorAll('[id^="view-"]').forEach(function(el){
    if(el.id !== 'view-pesquisas'){
      el.classList.remove('active','dev-active','beneficios-force-active');
      el.style.setProperty('display','none','important');
    }
  });
  var v = document.getElementById('view-pesquisas');
  if(!v) return;
  v.classList.add('active');
  v.style.setProperty('display','block','important');
  v.style.setProperty('visibility','visible','important');
  v.style.setProperty('opacity','1','important');
  document.querySelectorAll('.sb-item[id^="sb-"]').forEach(function(sb){
    sb.classList.toggle('active', sb.id === 'sb-pesquisas');
  });
  var pi = document.getElementById('tPageIcon'); if(pi){ pi.textContent='📋'; pi.style.display=''; }
  var pt = document.getElementById('tPageTitle'); if(pt) pt.textContent='Pesquisas';
  if(typeof window.pesqCarregar === 'function'){ try{ window.pesqCarregar(); }catch(e){} }
}

function precisaCorrigir(){
  if(!wantPesquisas) return false;
  var vp = document.getElementById('view-pesquisas');
  var vg = document.getElementById('view-gestao-rh');
  var pesqOk = vp && window.getComputedStyle(vp).display !== 'none' && vp.classList.contains('active');
  var gestaoVisivel = vg && window.getComputedStyle(vg).display !== 'none';
  return !pesqOk || gestaoVisivel;
}

var mo = new MutationObserver(function(){
  if(precisaCorrigir()) forcarPesquisas();
});

function observeViews(){
  document.querySelectorAll('[id^="view-"]').forEach(function(el){
    mo.observe(el, {attributes:true, attributeFilter:['style','class']});
  });
}
var mainHost = document.querySelector('.main-area') || document.body;
mo.observe(mainHost, {childList:true, subtree:false});
observeViews();
setInterval(observeViews, 1000); // garante observar views criadas dinamicamente depois

document.addEventListener('click', function(ev){
  var t = ev.target;
  if(!t || !t.closest) return;
  var alvo = t.closest('#sb-pesquisas');
  if(alvo){
    wantPesquisas = true;
    forcarPesquisas();
    return;
  }
  var outro = t.closest('.sb-item[id^="sb-"], [data-view]');
  if(outro && outro.id !== 'sb-pesquisas'){
    wantPesquisas = false;
  }
}, false);
})();

