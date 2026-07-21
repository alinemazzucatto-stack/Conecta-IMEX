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
            sessionStorage.getItem('connRoleReal') ||
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

  // Aliases adicionais: vários arquivos legados (07-legacy.js,
  // 22-patch-trilhas-colaborador-readonly.js) tiveram suas próprias
  // isRHProfile()/isGestorProfile()/isColabProfile()/isRHFinal() comentadas
  // com "REMOVED: Consolidated in 000-core-functions.js", mas esses nomes
  // nunca foram criados aqui — só isRH/isGestor/isColaborador. Isso deixava
  // ReferenceError sempre que essas telas rodavam (menu, Conecta AI,
  // trilhas de carreira). Sem alias == função "consolidada" que não existe.
  window.isRHProfile = function() { return window.isRH(); };
  window.isGestorProfile = function() { return window.isGestor(); };
  window.isColabProfile = function() { return window.isColaborador(); };
  window.isRHFinal = function() { return window.getRoleOrDefault() === 'rh'; };

  // ──────────────────────────────────────────────────────────────────────────────
  // 3. SISTEMA DE NAVEGAÇÃO (ÚNICA DEFINIÇÃO)
  // ──────────────────────────────────────────────────────────────────────────────

  var __navigationInProgress = false;
  var __currentViewId = null;

  window.forceView = function(viewId) {
    if (__navigationInProgress) return; // Previne navegação duplicada
    __navigationInProgress = true;

    try {
      // ──────────────────────────────────────────────────────────────────────
      // PESQUISAS: RH e Gestor podem acessar. Colaborador -> Dashboard
      // ──────────────────────────────────────────────────────────────────────
      if (String(viewId || '').toLowerCase() === 'pesquisas' && window.isColaborador() && !window.isGestor() && !window.isRH()) {
        console.log('[PESQUISAS] Access denied for role:', window.getRoleOrDefault(), '→ redirecting to dashboard');
        __navigationInProgress = false;
        window.forceView('dashboard');
        return;
      }

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
  // 4. MENU & SIDEBAR (definidas em 57-patch-critico-navegacao-renderizacao.js)
  // ──────────────────────────────────────────────────────────────────────────────
  // Não redefinimos applyMenu() aqui — deixamos 57-patch fornecer a implementação
  // completa com as listas COLAB_MENU, GESTOR_MENU, RH_MENU e visualRole()

  // Aliases para compatibilidade
  window.buildSidebar = function() {
    if (typeof window.applyMenu === 'function') {
      window.applyMenu();
    }
  };

  // Compatibilidade com código legado (português)
  // NÃO copiar window.applyMenu diretamente aqui: este arquivo carrega
  // PRIMEIRO (prefixo 000-), antes de 57-patch-critico-navegacao-renderizacao.js
  // definir applyMenu de verdade — uma cópia direta capturaria `undefined`
  // para sempre. Um wrapper preguiçoso resolve window.applyMenu só na hora
  // da chamada, quando ele já existe.
  window.aplicarMenu = function() {
    if (typeof window.applyMenu === 'function') window.applyMenu();
  };
  window.navegar = function(viewId) { window.forceView(viewId); };
  window.irPara = function(viewId) { window.forceView(viewId); };

  // ──────────────────────────────────────────────────────────────────────────────
  // Tab switching for GRH module - Integra com grhModule ES6
  // ──────────────────────────────────────────────────────────────────────────────

  window.grhTab = function(tabName, btnElement) {
    try {
      // Remover classe 'active' de todos os tabs
      var tabs = document.querySelectorAll('#grh-tabs .tab');
      tabs.forEach(function(tab) { tab.classList.remove('active'); });

      // Adicionar classe 'active' ao botão clicado
      if (btnElement) btnElement.classList.add('active');

      // Salvar em sessionStorage para restaurar depois
      try { sessionStorage.setItem('grhUltimaAba', tabName); } catch(e) {}

      console.log('[grhTab] Abrindo módulo:', tabName);

      // ✅ Chamar grhModule.goToPane() com tabName correto
      if (typeof window.grhModule !== 'undefined' && typeof window.grhModule.goToPane === 'function') {
        console.log('[grhTab] Navegando para pane:', tabName);
        window.grhModule.goToPane(tabName);
      } else if (typeof window.grhState !== 'undefined' && typeof window.grhState.setState === 'function') {
        console.log('[grhTab] Usando grhState.setState()');
        window.grhState.setState('activePane', tabName);
      } else {
        console.warn('[grhTab] grhModule/grhState não disponíveis, fallback sbNav');
        if (typeof window.sbNav === 'function') {
          window.sbNav('gestao-rh');
        }
      }
    } catch(e) {
      console.error('[grhTab] Erro:', e.message);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // 5. INICIALIZAÇÃO
  // ──────────────────────────────────────────────────────────────────────────────

  console.log('[CORE-FUNCTIONS] Consolidação central carregada');

})();

