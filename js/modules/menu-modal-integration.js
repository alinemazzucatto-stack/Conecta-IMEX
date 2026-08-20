// ════════════════════════════════════════════════════════════════════════════════
// INTEGRAÇÃO MENU SIDEBAR COM SISTEMA DE MODAIS
// ════════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // Mapa de nomes amigáveis para views
  const viewNames = {
    'intranet': '🏠 Intranet',
    'gamificacao': '🏆 Gamificação',
    'estrutura-carreira': '🏢 Estrutura e Carreira',
    'mais': '📦 Mais',
    'pesquisas': '📋 Pesquisas',
    'beneficios': '🎁 Meus Benefícios',
    'solicitacao': '🌴 Férias',
    'conecta-ai': '🤖 Conecta AI',
    'ouvidoria': '📢 Ouvidoria',
    'organograma': '🏢 Organograma',
    'trilhas': '🚀 Trilhas de Carreira',
    'experiencia': '📆 Minha Experiência',
    'cargos': '📄 Descritivo de Cargos',
    'disc': '🧠 DISC',
    'meu-desenvolvimento': '✨ Meu Desenvolvimento',
    'gestao-rh': '🏢 Gestão RH',
    'dashboard': '📊 Dashboard RH',
    'auditoria': '📝 Auditoria',
    'pdi': '🎯 PDI',
    'usuarios': '🔑 Gestão de Acessos',
    'gestor': '👔 Gestor',
    'rh': '🏢 RH'
  };

  // Interceptar função sbNav global
  const originalSbNav = window.sbNav;

  window.sbNav = function(viewId) {
    console.log('[MENU-MODAL] Abrindo:', viewId);

    // Verificar se a view existe
    const view = document.getElementById('view-' + viewId);
    if (!view) {
      console.warn('[MENU-MODAL] View não encontrada:', viewId);
      if (originalSbNav) {
        return originalSbNav(viewId);
      }
      return;
    }

    // Obter título amigável
    const title = viewNames[viewId] || viewId.toUpperCase();

    // Clonar conteúdo da view para modal
    const viewContent = view.cloneNode(true);
    viewContent.id = ''; // Remover ID para evitar duplicatas
    viewContent.style.display = 'block';

    // Abrir modal com conteúdo
    openModal({
      title: title,
      content: () => {
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = '';
        modalContent.appendChild(viewContent);
      },
      onOpen: () => {
        // Certificar que scripts dentro do modal rodem se necessário
        const scripts = viewContent.querySelectorAll('script');
        scripts.forEach(script => {
          if (script.src) {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            document.body.appendChild(newScript);
          } else {
            eval(script.textContent);
          }
        });
      }
    });
  };

  // Alias para compatibilidade
  window.forceView = window.sbNav;

  console.log('[MENU-MODAL-INTEGRATION] Sistema de integração carregado');
  console.log('[MENU-MODAL-INTEGRATION] Todos os cliques do menu abrem modais!');
})();
