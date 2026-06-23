// ===== script: debug-role-js =====
(function(){
'use strict';
// DESATIVADO: badge de diagnóstico usado só durante a investigação do bug
// de "logout sempre voltava como colaborador" (já corrigido em doLogout()/
// app.js). Mantido aqui desligado em vez de removido, para preservar o
// histórico caso o problema volte a aparecer.
return;
if(window.__debugRoleInit) return;
window.__debugRoleInit = true;

function criarBadge(){
  if(document.getElementById('debug-role-badge')) return document.getElementById('debug-role-badge');
  var b = document.createElement('div');
  b.id = 'debug-role-badge';
  b.style.cssText = 'position:fixed;bottom:10px;right:10px;z-index:2147483647;background:#111827;color:#fff;font:11px monospace;padding:8px 12px;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.3);line-height:1.5;opacity:.92;';
  document.body.appendChild(b);
  return b;
}

function atualizar(){
  var b = criarBadge();
  var roleVar = 'erro';
  try{ roleVar = typeof role !== 'undefined' ? String(role) : '(undefined)'; }catch(e){ roleVar = '(erro: '+e.message+')'; }
  var roleRealVar = 'erro';
  try{ roleRealVar = typeof _roleReal !== 'undefined' ? String(_roleReal) : '(undefined)'; }catch(e){ roleRealVar = '(erro: '+e.message+')'; }
  var isAdmin = 'erro';
  try{ isAdmin = typeof isRH === 'function' ? String(isRH()) : '(sem isRH)'; }catch(e){ isAdmin = '(erro: '+e.message+')'; }
  var btnDisplay = 'sem elemento';
  try{ var btn=document.getElementById('btnTrocarPerfil'); if(btn) btnDisplay = (btn.style.display||'(vazio)')+' / computed:'+window.getComputedStyle(btn).display; }catch(e){ btnDisplay='(erro: '+e.message+')'; }
  var perfisVar = 'erro';
  try{ perfisVar = JSON.stringify((window.currentUserData&&window.currentUserData.perfis)||sessionStorage.getItem('userPerfis')||[]); }catch(e){ perfisVar='(erro)'; }

  b.innerHTML =
    '<b>DEBUG ROLE</b><br>' +
    'role: ' + roleVar + '<br>' +
    '_roleReal: ' + roleRealVar + '<br>' +
    'window.role: ' + String(window.role) + '<br>' +
    'window._roleReal: ' + String(window._roleReal) + '<br>' +
    'sessionStorage.userRole: ' + String(sessionStorage.getItem('userRole')) + '<br>' +
    'isRH(): ' + isAdmin + '<br>' +
    'btnTrocarPerfil: ' + btnDisplay + '<br>' +
    'perfis: ' + perfisVar;
}

setInterval(atualizar, 500);
setTimeout(atualizar, 200);
})();

