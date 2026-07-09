// ════════════════════════════════════════════════════════════════════════════════
// CONSOLIDAÇÃO CENTRAL DE FUNÇÕES CRÍTICAS
// ════════════════════════════════════════════════════════════════════════════════
//
// Este arquivo CENTRALIZA todas as funções de permissão, navegação e controle.
// PROIBIDO redefinir essas funções em outros arquivos.
//
// Carga: PRIMEIRO (000- prefix), ANTES de qualquer outro código
// ════════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  if (window.__coreFunctionsLoaded) return;
  window.__coreFunctionsLoaded = true;

  // ──────────────────────────────────────────────────────────────────────────────
  // 1. HELPER: Obter papel atual (com fallbacks)
  // ──────────────────────────────────────────────────────────────────────────────

  window.getRoleOrDefault = function() {
    return (window.role ||
            sessionStorage.getItem('userRole') ||
            window._roleReal ||
            'colaborador').toLowerCase().trim();
  };

  window.getRoleReal = function() {
    return (window._roleReal ||
            sessionStorage.getItem('imexRoleReal') ||
            window.getRoleOrDefault()).toLowerCase().trim();
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // 2. VERIFICAÇÃO DE PERMISSÕES (ÚNICA DEFINIÇÃO)
  // ──────────────────────────────────────────────────────────────────────────────

  window.isRH = function() {
    var role = window.getRoleOrDefault();
    return role === 'rh' || role === 'rh-colaborador';
  };

  window.isGestor = function() {
    var role = window.getRoleOrDefault();
    return role === 'gestor';
  };

  window.isColaborador = function() {
    var role = window.getRoleOrDefault();
    return role === 'colaborador' || role === 'rh-colaborador';
  };

  window.hasPerfil = function(perfil) {
    if (!window.currentUserData || !window.currentUserData.perfis) return false;
    var perfis = window.currentUserData.perfis;
    if (!Array.isArray(perfis)) return false;
    return perfis.some(function(p) {
      return (p || '').toLowerCase() === (perfil || '').toLowerCase();
    });
  };

  // Funções alternativas (compatibilidade com código legado)
  window.souRH = function() { return window.isRH(); };
  window.souGestor = function() { return window.isGestor(); };
  window.roleAtual = function() { return window.getRoleOrDefault(); };
  window.roleAtualFinal = function() { return window.getRoleOrDefault(); };
  window.effectiveRole = function() { return window.getRoleOrDefault(); };

  // ──────────────────────────────────────────────────────────────────────────────
  // 3. SISTEMA DE NAVEGAÇÃO (ÚNICA DEFINIÇÃO)
  // ──────────────────────────────────────────────────────────────────────────────

  var __navigationInProgress = false;
  var __currentViewId = null;

  window.forceView = function(viewId) {
    if (__navigationInProgress) return; // Previne navegação duplicada
    __navigationInProgress = true;

    try {
      var allViews = document.querySelectorAll('[id^="view-"]');
      if (allViews && allViews.length > 0) {
        allViews.forEach(function(v) {
          if (v) {
            v.style.display = 'none';
            v.classList.remove('active');
          }
        });
      }

      var targetView = document.getElementById('view-' + viewId);
      if (targetView) {
        targetView.style.display = 'block';
        targetView.classList.add('active');
        __currentViewId = viewId;
        console.log('[NAVIGATION] Navigated to:', viewId);
      } else {
        console.warn('[NAVIGATION] View not found:', viewId);
      }
    } catch(e) {
      console.error('[NAVIGATION] Error:', e.message);
    } finally {
      __navigationInProgress = false;
    }
  };

  window.sbNav = function(viewId) {
    window.forceView(viewId);
  };

  window.switchView = function(viewId) {
    window.forceView(viewId);
  };

  // Aliases de compatibilidade
  window.navegar = function(viewId) { window.forceView(viewId); };
  window.irPara = function(viewId) { window.forceView(viewId); };

  // ──────────────────────────────────────────────────────────────────────────────
  // 4. MENU & SIDEBAR (ÚNICA DEFINIÇÃO)
  // ──────────────────────────────────────────────────────────────────────────────

  window.applyMenu = function() {
    try {
      var role = window.getRoleOrDefault();
      var body = document.body;

      if (body) {
        body.classList.remove('role-rh', 'role-gestor', 'role-colaborador');
        body.classList.add('role-' + role);
      }

      var sbItems = document.querySelectorAll('.sb-item');
      if (sbItems && sbItems.length > 0) {
        sbItems.forEach(function(item) {
          item.style.display = 'none';
        });

        // RH: acesso total
        if (window.isRH()) {
          var rhItems = ['sb-intranet', 'sb-gamificacao', 'sb-estrutura-carreira',
                        'sb-mais', 'sb-pesquisas', 'sb-beneficios', 'sb-solicitacao',
                        'sb-conecta-ai', 'sb-ouvidoria', 'sb-organograma', 'sb-trilhas',
                        'sb-experiencia', 'sb-cargos', 'sb-disc', 'sb-meu-desenvolvimento',
                        'sb-gestao-rh', 'sb-dashboard', 'sb-auditoria', 'sb-pdi',
                        'sb-usuarios', 'sb-gestor', 'sb-rh'];
          rhItems.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'block';
          });
        }

        // GESTOR: acesso reduzido
        else if (window.isGestor()) {
          var gestorItems = ['sb-intranet', 'sb-gamificacao', 'sb-estrutura-carreira',
                            'sb-mais', 'sb-beneficios', 'sb-solicitacao', 'sb-conecta-ai',
                            'sb-ouvidoria', 'sb-gestor'];
          gestorItems.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'block';
          });
        }

        // COLABORADOR: acesso limitado
        else {
          var colabItems = ['sb-intranet', 'sb-gamificacao', 'sb-estrutura-carreira',
                           'sb-mais', 'sb-beneficios', 'sb-solicitacao', 'sb-conecta-ai',
                           'sb-ouvidoria'];
          colabItems.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'block';
          });
        }
      }

      console.log('[MENU] Applied for role:', role);
    } catch(e) {
      console.error('[MENU] Error:', e.message);
    }
  };

  window.buildSidebar = function() {
    window.applyMenu();
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // 5. INICIALIZAÇÃO
  // ──────────────────────────────────────────────────────────────────────────────

  console.log('[CORE-FUNCTIONS] Consolidação central carregada');

})();
