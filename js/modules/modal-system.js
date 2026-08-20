// ════════════════════════════════════════════════════════════════════════════════
// SISTEMA DE MODAIS - ESSENCE CLINIC
// ════════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  window.openModal = function(config) {
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');
    const title = document.getElementById('modal-title');
    const tabsContainer = document.getElementById('modal-tabs-container');
    const content = document.getElementById('modal-content');

    // Limpar estado anterior
    tabsContainer.innerHTML = '';
    content.innerHTML = '';

    // Configurar título
    if (config.title) {
      title.textContent = config.title;
    }

    // Configurar abas (se houver)
    if (config.tabs && config.tabs.length > 0) {
      config.tabs.forEach((tab, index) => {
        const btn = document.createElement('button');
        btn.className = 'modal-tab' + (index === 0 ? ' active' : '');
        btn.textContent = tab.label;
        btn.onclick = function(e) {
          e.preventDefault();
          document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          if (typeof tab.onSelect === 'function') {
            tab.onSelect();
          }
        };
        tabsContainer.appendChild(btn);
      });
    }

    // Configurar conteúdo
    if (config.content) {
      if (typeof config.content === 'string') {
        content.innerHTML = config.content;
      } else if (typeof config.content === 'function') {
        config.content();
      }
    }

    // Mostrar modal com animação
    setTimeout(() => {
      overlay.classList.add('active');
      container.classList.add('active');
    }, 10);

    // Callback ao abrir
    if (typeof config.onOpen === 'function') {
      config.onOpen();
    }
  };

  window.closeModal = function(event) {
    // Se clicou no overlay, fechar apenas se foi no overlay mesmo (não no conteúdo)
    if (event && event.target.id !== 'modal-overlay') {
      return;
    }

    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');

    overlay.classList.remove('active');
    container.classList.remove('active');

    // Limpar após animação
    setTimeout(() => {
      overlay.innerHTML = '';
      container.innerHTML = '';
    }, 300);
  };

  // Fechar com ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  console.log('[MODAL-SYSTEM] Sistema de modais Essence Clinic carregado');
})();
