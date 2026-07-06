// ===== script: remuneracao-premium-fix-js =====
(function(){
  'use strict';
  if(window.__remPremiumFixInit) return;
  window.__remPremiumFixInit = true;

  // Aguarda o painel de remuneração e força visibilidade do painel colorido
  //
  // CAUSA DE UM TRAVAMENTO REAL DA ABA INTEIRA: esta função é chamada pelo
  // MutationObserver abaixo toda vez que o `style`/`class` de qualquer
  // elemento dentro do painel muda — mas ela mesma SEMPRE reatribuía as
  // propriedades de style incondicionalmente (mesmo quando já estavam
  // corretas). Cada atribuição gera uma nova mutação, que aciona o
  // observer de novo, que chama esta função de novo, que gera outra
  // mutação... um loop de mutações que nunca termina e trava o navegador
  // (nem `console.log` novo aparecia — a fila de microtasks do
  // MutationObserver nunca esvaziava). Agora só mexe no DOM quando algo
  // realmente precisa mudar.
  function forcarVisibilidade() {
    const pane = document.getElementById('grh-pane-remuneracao') || document.getElementById('grh-pane-remuneracoes');
    if(!pane) return;

    // Encontra o painel colorido
    const premiumWrap = pane.querySelector('.rem-premium-wrap');
    if(premiumWrap) {
      const precisaEstilo = premiumWrap.style.display !== 'block'
        || premiumWrap.style.visibility !== 'visible'
        || premiumWrap.style.opacity !== '1'
        || premiumWrap.style.zIndex !== '100'
        || premiumWrap.style.position !== 'relative';
      if(precisaEstilo){
        premiumWrap.style.setProperty('display', 'block', 'important');
        premiumWrap.style.setProperty('visibility', 'visible', 'important');
        premiumWrap.style.setProperty('opacity', '1', 'important');
        premiumWrap.style.setProperty('z-index', '100', 'important');
        premiumWrap.style.setProperty('position', 'relative', 'important');
      }

      // Move o painel para o topo se ele não está lá
      const parent = pane;
      const firstChild = parent.firstElementChild;
      if(firstChild && firstChild !== premiumWrap) {
        parent.insertBefore(premiumWrap, firstChild);
      }
    }

    // Tabela é parte do painel premium — deixar visível
  }

  // Observa mudanças no painel e força visibilidade
  function observarMudancas() {
    const pane = document.getElementById('grh-pane-remuneracao') || document.getElementById('grh-pane-remuneracoes');
    if(!pane) {
      setTimeout(observarMudancas, 500);
      return;
    }

    forcarVisibilidade();

    // Cria um MutationObserver para garantir que o painel colorido continue visível
    const observer = new MutationObserver(() => {
      forcarVisibilidade();
    });

    observer.observe(pane, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  // Inicia quando o DOM estiver pronto
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observarMudancas);
  } else {
    setTimeout(observarMudancas, 500);
  }
})();
