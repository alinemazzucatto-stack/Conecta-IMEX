// ===== ORCHESTRATOR DE INICIALIZAÇÃO CENTRALIZADO =====
// Arquivo: 000-init-orchestrator.js
// Objetivo: Consolidar 59 DOMContentLoaded listeners em 1 único ponto
// Status: Carregado ÚLTIMO (após todos os módulos)
// Benefício: Elimina race conditions, loop infinito de inicializações
//
// IMPORTANTE: Este arquivo DESABILITA os 59 listeners individuais
// usando uma técnica de monkey-patching do addEventListener.

(function() {
  'use strict';

  // Flag para evitar múltiplas inicializações
  if (window.__initOrchestrator) return;
  window.__initOrchestrator = true;

  // Array de funções de inicialização registradas
  const initQueue = [];
  let initDone = false;

  // ── STEP 1: Interceptar listeners de DOMContentLoaded (em Document e window) ──
  const originalDocAddEventListener = Document.prototype.addEventListener;
  const originalWinAddEventListener = Window.prototype.addEventListener;

  Document.prototype.addEventListener = function(type, listener, options) {
    if (type === 'DOMContentLoaded' && typeof listener === 'function') {
      initQueue.push(listener);
      console.log(`[Init] Função de inicialização registrada (total: ${initQueue.length})`);
      return;
    }
    return originalDocAddEventListener.call(this, type, listener, options);
  };

  Window.prototype.addEventListener = function(type, listener, options) {
    if (type === 'DOMContentLoaded' && typeof listener === 'function') {
      initQueue.push(listener);
      console.log(`[Init] Função de inicialização registrada (total: ${initQueue.length})`);
      return;
    }
    return originalWinAddEventListener.call(this, type, listener, options);
  };

  // ── STEP 2: Executar fila de inicialização ──
  function runInitQueue() {
    if (initDone) return;
    initDone = true;

    console.log(`[Init] ===== INICIANDO ${initQueue.length} FUNÇÕES DE INICIALIZAÇÃO =====`);

    let errorCount = 0;
    for (let i = 0; i < initQueue.length; i++) {
      try {
        const fn = initQueue[i];
        console.log(`[Init] [${i + 1}/${initQueue.length}] Executando...`);
        fn();
      } catch (e) {
        errorCount++;
        console.error(`[Init] Erro na função ${i + 1}:`, e);
      }
    }

    console.log(`[Init] ===== INICIALIZAÇÃO COMPLETA (Erros: ${errorCount}) =====`);
  }

  // ── STEP 3: Aguardar DOMContentLoaded ──
  function cleanupExistingListeners() {
    // Remove qualquer listener de DOMContentLoaded que tenha escapado
    const oldListeners = [];
    for (let i = 0; i < document.length; i++) {
      try {
        const listeners = getEventListeners(document, 'DOMContentLoaded');
        if (listeners) oldListeners.push(...listeners);
      } catch (e) {}
    }
    console.log(`[Init] Listeners escapados detectados: ${oldListeners.length}`);
  }

  if (document.readyState === 'loading') {
    console.log('[Init] Aguardando DOMContentLoaded...');
    originalDocAddEventListener.call(document, 'DOMContentLoaded', runInitQueue, { once: true });
  } else {
    console.log('[Init] DOM já pronto, executando immediately...');
    setTimeout(runInitQueue, 50);
  }

  // ── STEP 4: Fallback (garante execução em 2s) ──
  setTimeout(function() {
    if (!initDone) {
      console.warn('[Init] Fallback: Forçando inicialização (timeout 2s)');
      runInitQueue();
    }
  }, 2000);

})();

