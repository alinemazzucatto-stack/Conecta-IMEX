// ===== script: remuneracao-premium-fix-js =====
(function(){
  'use strict';
  if(window.__remPremiumFixInit) return;
  window.__remPremiumFixInit = true;

  let fixTimeout = null;
  let lastFixTime = 0;
  const FIX_DEBOUNCE = 800;

  function forcarVisibilidade() {
    const pane = document.getElementById('grh-pane-remuneracao') || document.getElementById('grh-pane-remuneracoes');
    if(!pane) return false;

    let madeChange = false;

    // Encontra o painel colorido
    const premiumWrap = pane.querySelector('.rem-premium-wrap');
    if(premiumWrap) {
      const estilosEsperados = {
        'display': 'block',
        'visibility': 'visible',
        'opacity': '1',
        'z-index': '100',
        'position': 'relative'
      };

      Object.entries(estilosEsperados).forEach(([prop, valor]) => {
        const atual = premiumWrap.style[prop === 'z-index' ? 'zIndex' : prop];
        if(atual !== valor) {
          premiumWrap.style.setProperty(
            prop === 'z-index' ? 'z-index' : prop,
            valor,
            'important'
          );
          madeChange = true;
        }
      });

      // Move o painel para o topo se ele não está lá
      const parent = pane;
      const firstChild = parent.firstElementChild;
      if(firstChild && firstChild !== premiumWrap && !firstChild.classList?.contains('hero')) {
        parent.insertBefore(premiumWrap, firstChild);
        madeChange = true;
      }
    }

    return madeChange;
  }

  function fixComDebounce() {
    if(fixTimeout) clearTimeout(fixTimeout);
    const agora = Date.now();
    if(agora - lastFixTime < FIX_DEBOUNCE) {
      fixTimeout = setTimeout(() => {
        lastFixTime = Date.now();
        if(forcarVisibilidade()) {
          console.log('[remuneracao-fix] Visibilidade corrigida');
        }
      }, FIX_DEBOUNCE);
    } else {
      lastFixTime = agora;
      forcarVisibilidade();
    }
  }

  function init() {
    const pane = document.getElementById('grh-pane-remuneracao') || document.getElementById('grh-pane-remuneracoes');
    if(!pane) {
      setTimeout(init, 500);
      return;
    }

    // Executa uma única vez ao iniciar
    forcarVisibilidade();

    // Observa mudanças com debounce agressivo
    const observer = new MutationObserver(fixComDebounce);
    observer.observe(pane, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      subtree: true,
      attributeOldValue: true
    });

    console.log('[remuneracao-fix] Inicializado com segurança');
  }

  // Inicia quando o DOM estiver pronto
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 500);
  }
})();

