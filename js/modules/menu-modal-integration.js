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

  // Flag para prevenir abertura automática de modal
  let allowModalOpen = false;

  // Interceptar função sbNav global
  const originalSbNav = window.sbNav;

  window.sbNav = function(viewId) {
    console.log('[MENU-MODAL] sbNav chamado:', viewId);

    // Se não foi por clique do menu, usar navegação padrão
    if (!allowModalOpen) {
      console.log('[MENU-MODAL] Navegação padrão (não é clique do menu)');
      if (originalSbNav) {
        return originalSbNav(viewId);
      }
      return;
    }

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

  // Interceptar cliques DOS ÍCONES DO MENU para ativar modal
  document.addEventListener('click', function(e) {
    const sbItem = e.target.closest('.sb-item');
    if (sbItem) {
      console.log('[MENU-MODAL] Clique do menu detectado');
      allowModalOpen = true;
      // Reseta a flag depois que sbNav foi executado
      setTimeout(() => {
        allowModalOpen = false;
      }, 100);
    }
  });

  console.log('[MENU-MODAL-INTEGRATION] Sistema de integração carregado');
  console.log('[MENU-MODAL-INTEGRATION] Modal abre APENAS com cliques do menu!');
})();
