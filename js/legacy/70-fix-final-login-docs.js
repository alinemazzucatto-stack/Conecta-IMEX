// ===== script: fix-final-login-docs =====
(function(){
'use strict';
if(window.__FIX_FINAL_V2__) return;
window.__FIX_FINAL_V2__ = true;

var $ = function(id){ return document.getElementById(id); };

/* ══ PARTE 1: LOGIN ══ */
function _setLoginRole(r, btnEl){
  r = String(r||'colaborador').toLowerCase().trim();
  window._supremoLoginRole = r;
  window.loginRole = r;
  try{ sessionStorage.setItem('imexPreferredRole',r); sessionStorage.setItem('userRole',r); }catch(e){}
  var grid=$('loginRoleGrid');
  if(grid) grid.querySelectorAll('.role-btn').forEach(function(b){ b.classList.remove('selected'); });
  if(btnEl) btnEl.classList.add('selected');
  else if(grid){ var t=grid.querySelector('.role-btn[data-role="'+r+'"]'); if(t) t.classList.add('selected'); }
}
function fixarRoleBtns(){
  var grid=$('loginRoleGrid');
  if(!grid||grid.__fixV2Done) return;
  grid.__fixV2Done=true;
  grid.querySelectorAll('.role-btn[data-role]').forEach(function(btn){
    btn.onclick=function(){ _setLoginRole(this.getAttribute('data-role'),this); };
  });
}
function fixarBotaoLogin(){
  var lBtn=$('lBtn');
  if(!lBtn||lBtn.__fixV2Done) return;
  lBtn.__fixV2Done=true;
  lBtn.onclick=function(ev){
    if(ev){ev.preventDefault();ev.stopPropagation();}
    var sel=document.querySelector('#loginRoleGrid .role-btn.selected');
    var perfil=(sel&&sel.getAttribute('data-role'))||window._supremoLoginRole||window.loginRole||'colaborador';
    perfil=perfil.toLowerCase().trim();
    _setLoginRole(perfil,sel);
    if(typeof window.entrarDemo==='function') window.entrarDemo(perfil);
    return false;
  };
  var lEmail=$('lEmail');
  if(lEmail&&!lEmail.__fixV2Enter){ lEmail.__fixV2Enter=true; lEmail.addEventListener('keydown',function(ev){ if((ev.key==='Enter'||ev.keyCode===13)&&lBtn) lBtn.click(); }); }
}

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

/* ══ SETUP ══ */
function setup(){
  fixarRoleBtns();
  fixarBotaoLogin();
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',function(){ [0,100,300,700].forEach(function(t){ setTimeout(setup,t); }); });
} else {
  [0,100,300,700].forEach(function(t){ setTimeout(setup,t); });
}

})();
