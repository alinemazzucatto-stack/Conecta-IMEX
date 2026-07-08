// ===== CONSOLIDATION: GRH Functions Protection & Consolidation =====
(function(){
  'use strict';

  // Proteger funções grhGet contra redefinição acidental
  const protectedGrhFunctions = [
    'grhGetColabs',
    'grhGetRem',
    'grhGetMov',
    'grhGetDesl',
    'grhRenderColabs',
    'grhRenderRemuneracao',
    'grhRenderMovimentacoes',
    'grhRenderDesligamentos'
  ];

  protectedGrhFunctions.forEach(fnName => {
    if(typeof window[fnName] === 'function'){
      const originalFn = window[fnName];
      Object.defineProperty(window, fnName, {
        value: originalFn,
        writable: false,
        configurable: false,
        enumerable: true
      });
      console.log(`[GRH CONSOLIDATION] ${fnName} protegida contra sobrescrita`);
    }
  });

  // Expor funções de renderização para uso global
  window.ensureGrhRendering = function(moduleId){
    if(!moduleId) return;

    const renderMap = {
      'colaboradores': 'grhRenderColabs',
      'remuneracao': 'grhRenderRemuneracao',
      'movimentacoes': 'grhRenderMovimentacoes',
      'desligamentos': 'grhRenderDesligamentos'
    };

    const fnName = renderMap[moduleId];
    if(fnName && typeof window[fnName] === 'function'){
      try {
        window[fnName]();
        console.log(`[GRH CONSOLIDATION] Renderização de ${moduleId} executada`);
      } catch(e) {
        console.warn(`[GRH CONSOLIDATION] Erro ao renderizar ${moduleId}:`, e);
      }
    }
  };

  console.log('[GRH CONSOLIDATION] Initialized - funções grhGet são única fonte de verdade');
})();
