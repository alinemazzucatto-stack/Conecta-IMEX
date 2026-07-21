// ===== script: fix-final-login-docs =====
(function(){
'use strict';
if(window.__FIX_FINAL_V2__) return;
window.__FIX_FINAL_V2__ = true;

var $ = function(id){ return document.getElementById(id); };

/* ══ PARTE 1: LOGIN ══ */
// REMOVIDO (auditoria de segurança/duplicidade): este bloco reatribuía
// `#lBtn.onclick` e adicionava um SEGUNDO listener de "Enter" no campo de
// e-mail, competindo com o `onclick="doLogin()"`/`onkeydown` inline do HTML
// e com o botão de seleção de perfil (`onclick="selectRole(...)"` também
// inline, sobrescrito aqui por `_setLoginRole`). Pressionar Enter chegava a
// disparar `doLogin()` DUAS VEZES em paralelo (uma pelo atributo inline, ver
// index.html, outra por este listener chamando `lBtn.click()`). A fonte
// única de login é `js/modules/login-auth.js`; a de seleção de perfil é
// `selectRole` em `61-patch-hotfix-login-menu.js`.

/* ══ VOLTA PARA AS ABAS ══ */
// Limpeza genérica da classe docs-rh-open no <body> — necessária para o
// botão "Voltar" não deixar a tela de Gestão RH presa no modo documentos.
// O módulo de Documentos em si (HTML, render, abrir) vive em
// 71-fix-final-login-docs.js, conectado à base real via grhDocsPainelHTML.
function sairModoDocumentos(){
  document.body.classList.remove('docs-rh-open');
  var host=$('view-gestao-rh');
  if(host){
    host.removeAttribute('data-docs-mode');
    var tabs=$('grh-tabs'); if(tabs) tabs.style.removeProperty('display');
    var grhHero=host.querySelector('.hero:not(.docs-hero-main)');
    if(grhHero) grhHero.style.removeProperty('display');
    var grhStats=host.querySelector('.h-stats');
    if(grhStats) grhStats.style.removeProperty('display');
    host.querySelectorAll('[id^="grh-pane-"]').forEach(function(p){ p.style.setProperty('display','none','important'); });
  }
  var bb=$('grh-back-bar'); if(bb) bb.style.removeProperty('display');
}
var _prevVoltar=window.voltarGestaoRHSeguro||window.voltarGestaoRH;
window.voltarGestaoRHSeguro=window.voltarGestaoRH=function(){
  sairModoDocumentos();
  return typeof _prevVoltar==='function'?_prevVoltar.apply(this,arguments):undefined;
};

})();



