// ===== script: fix-mainhero-grh-js =====
(function(){
'use strict';
if(window.__fixMainHeroGrh) return;
window.__fixMainHeroGrh = true;

function corrigir(){
  var grh = document.getElementById('view-gestao-rh');
  var hero = document.getElementById('mainHero');
  if(!grh || !hero) return;
  var grhVisivel = window.getComputedStyle(grh).display !== 'none';
  if(grhVisivel && window.getComputedStyle(hero).display !== 'none'){
    hero.style.setProperty('display','none','important');
  }
}

var mo = new MutationObserver(corrigir);
(function observar(){
  var grh = document.getElementById('view-gestao-rh');
  if(!grh){ requestAnimationFrame(observar); return; }
  mo.observe(grh, {attributes:true, attributeFilter:['style','class']});
  var hero = document.getElementById('mainHero');
  if(hero) mo.observe(hero, {attributes:true, attributeFilter:['style','class']});
  corrigir();
})();
setInterval(corrigir, 500);
})();

