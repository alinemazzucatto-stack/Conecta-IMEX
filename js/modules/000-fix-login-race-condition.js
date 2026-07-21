// ===== FIX: Eliminar race condition de autenticação =====
// Problema: 02-legacy.js tem listener onAuthStateChanged que conflita com login-auth.js
// Solução: Bloquear 02-legacy.js completamente durante login
//
// CARREGADO PRIMEIRO (000-) para garantir que flags existem antes dos outros

(function() {
  'use strict';

  if (window.__loginRaceConditionFixed) return;
  window.__loginRaceConditionFixed = true;

  // ── Flags de controle ──
  window.__loginEmAndamento = false;      // Bloqueiam 02-legacy.js
  window.__restoringSession = false;      // Bloqueiam 02-legacy.js
  window.__disableLegacyAuthListener = false; // Nova flag para desabilitar totalmente

  // ── SUPRIMIR onAuthStateChanged do 02-legacy.js ──
  // O listener original em 02-legacy.js (linha ~4321) vai tentar rodar
  // toda vez que auth.onAuthStateChanged é acionado. Injetamos aqui uma
  // flag que força TODOS os onAuthStateChanged a pular se estamos logando
  // ou se já temos sessão válida.
  //
  // IMPORTANTE: Fazer isso APÓS auth estar definido para evitar ReferenceError

  function patchAuthListener() {
    if (!window.auth || !window.auth.onAuthStateChanged) return;
    if (window.__authListenerPatched) return;
    window.__authListenerPatched = true;

    var origOnAuthStateChanged = window.auth.onAuthStateChanged;
    window.auth.onAuthStateChanged = function(callback) {
      var wrappedCallback = function(user) {
        if (window.__loginEmAndamento || window.__restoringSession) {
          console.log('[AUTH-FIX] Bloqueando callback legado (login em andamento)');
          return;
        }
        var hasValidSession = sessionStorage.getItem('userEmail') &&
                            sessionStorage.getItem('userRole');
        if (hasValidSession && user) {
          console.log('[AUTH-FIX] Sessão já restaurada, ignorando callback');
          return;
        }
        console.log('[AUTH-FIX] Permitindo callback (sessão = ' + !!user + ')');
        try {
          callback(user);
        } catch(e) {
          console.error('[AUTH-FIX] Erro no callback:', e);
        }
      };
      return origOnAuthStateChanged.call(window.auth, wrappedCallback);
    };
  }

  // Tentar patchar agora, se auth já existir
  patchAuthListener();

  // Se não existir, esperar até que exista
  if (!window.auth) {
    var checkAuth = setInterval(function() {
      if (window.auth) {
        clearInterval(checkAuth);
        patchAuthListener();
      }
    }, 100);
    setTimeout(function() { clearInterval(checkAuth); }, 5000); // Timeout de 5s
  }

  // ── TIMEOUT AGRESSIVO PARA LOGIN ──
  // Se a autenticação travar por mais de 10 segundos, forçar erro e liberar UI
  window.forceLoginTimeout = function() {
    var btn = document.getElementById('lBtn');
    var load = document.getElementById('lLoading');
    var err = document.getElementById('lErr');

    if (window.__loginEmAndamento) {
      console.error('[LOGIN-TIMEOUT] Timeout de autenticação acionado!');

      // Liberar UI
      if (btn) btn.disabled = false;
      if (load) load.style.display = 'none';

      // Mostrar erro
      if (err) {
        err.textContent = 'Autenticação demorou muito. Verifique sua conexão e tente novamente.';
        err.style.display = 'block';
      }

      // Liberar flags
      window.__loginEmAndamento = false;
      window.__restoringSession = false;

      return true;
    }
    return false;
  };

  // ── SANITIZAR ESTADO AO CARREGAR PÁGINA ──
  // Se houver resquício de sessão de outro perfil, forçar logout limpo
  document.addEventListener('DOMContentLoaded', function() {
    try {
      var userEmail = sessionStorage.getItem('userEmail');
      var userRole = sessionStorage.getItem('userRole');

      if (!userEmail || !userRole) {
        console.log('[AUTH-FIX] Sessão vazia ao carregar - limpando');
        try {
          if (auth && typeof auth.signOut === 'function') {
            auth.signOut().catch(function() {});
          }
        } catch(e) {}
      }
    } catch(e) {}
  });

  console.log('[AUTH-FIX] Proteção contra race condition ativada');
})();

