// ===== script: ferias-v3-js =====
(function(){
'use strict';
if(window.__feriasV3Fix) return;
window.__feriasV3Fix = true;

function aplicarBadges(){
  var labels = document.querySelectorAll('#view-solicitacao .sc-lbl');
  labels.forEach(function(el){
    if(el.getAttribute('data-fx-badge') === '1') return;
    var txt = el.textContent;
    var match;
    try{ match = txt.match(/^(\p{Extended_Pictographic}️?)\s*/u); }catch(e){ match = null; }
    if(!match) return;
    var emoji = match[1];
    var resto = txt.slice(match[0].length);
    el.innerHTML = '<span class="fx-badge">' + emoji + '</span>' + resto;
    el.setAttribute('data-fx-badge', '1');
  });
}

// REMOVED: Performance optimization - 700ms setInterval polling
/*setInterval(function(){
  var v = document.getElementById('view-solicitacao');
  if(v && window.getComputedStyle(v).display !== 'none') aplicarBadges();
}, 700);*/
setTimeout(aplicarBadges, 300);
})();


