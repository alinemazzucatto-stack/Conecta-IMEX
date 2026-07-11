// ════════════════════════════════════════════════════════════════════════════════
// AUDIT ENGINE - Motor Central de Auditoria Técnica e Governança
// ════════════════════════════════════════════════════════════════════════════════
// Responsabilidade: Monitorar sistema em tempo real, detectar problemas,
// validar permissões, manter logs e executar validações automaticamente
// ════════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  if (window.__auditEngineLoaded) return;
  window.__auditEngineLoaded = true;

  // ──────────────────────────────────────────────────────────────────────────────
  // SEÇÃO 1: CONFIGURAÇÃO & ESTADO
  // ──────────────────────────────────────────────────────────────────────────────

  const AUDIT_CONFIG = {
    ENABLED: true,
    AUTO_RUN_INTERVAL: 5000,          // 5 segundos
    LOG_RETENTION_DAYS: 30,           // Manter 30 dias de logs
    CRITICAL_ERRORS_ALERT: true,
    AUTO_VALIDATION: true
  };

  const AUDIT_STATE = {
    isRunning: false,
    lastRun: null,
    issues: [],
    logs: [],
    moduleStatus: {},
    permissions: {}
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // SEÇÃO 2: SISTEMA DE LOGGING
  // ──────────────────────────────────────────────────────────────────────────────

  window.AuditLogger = {
    log: function(level, category, message, details) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: level,                    // INFO, WARNING, ERROR, CRITICAL
        category: category,              // MODULE, PERMISSION, CODE, PERFORMANCE, etc
        message: message,
        details: details || {},
        userRole: window.role || 'unknown',
        module: this._getCurrentModule()
      };

      AUDIT_STATE.logs.push(logEntry);

      // Limitar a 1000 logs em memória
      if (AUDIT_STATE.logs.length > 1000) {
        AUDIT_STATE.logs = AUDIT_STATE.logs.slice(-1000);
      }

      // Persistir em localStorage
      try {
        localStorage.setItem('auditLogs', JSON.stringify(AUDIT_STATE.logs));
      } catch (e) {
        console.warn('[AUDIT] localStorage full:', e);
      }

      // Log no console se CRITICAL
      if (level === 'CRITICAL') {
        console.error('[AUDIT-CRITICAL]', message, details);
      }

      return logEntry;
    },

    _getCurrentModule: function() {
      const active = document.querySelector('[id^="view-"].active');
      return active ? active.id.replace('view-', '') : 'unknown';
    },

    info: function(category, message, details) {
      return this.log('INFO', category, message, details);
    },

    warning: function(category, message, details) {
      return this.log('WARNING', category, message, details);
    },

    error: function(category, message, details) {
      return this.log('ERROR', category, message, details);
    },

    critical: function(category, message, details) {
      return this.log('CRITICAL', category, message, details);
    },

    getLogs: function(limit = 100) {
      return AUDIT_STATE.logs.slice(-limit);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // SEÇÃO 3: DETECTORES DE PROBLEMAS
  // ──────────────────────────────────────────────────────────────────────────────

  window.AuditDetector = {
    detectAll: function() {
      let issues = [];

      issues = issues.concat(this.detectBrokenModules());
      issues = issues.concat(this.detectPermissionIssues());
      issues = issues.concat(this.detectBlankPages());
      issues = issues.concat(this.detectRenderingErrors());
      issues = issues.concat(this.detectNavigationIssues());
      issues = issues.concat(this.detectPerformanceIssues());
      issues = issues.concat(this.detectVersionRollback());

      AUDIT_STATE.issues = issues;
      return issues;
    },

    // Detectar módulos que não carregam
    detectBrokenModules: function() {
      const issues = [];
      const modules = ['intranet', 'pesquisas', 'beneficios', 'dashboard', 'gestao-rh'];

      modules.forEach(mod => {
        const view = document.getElementById('view-' + mod);
        if (!view) {
          issues.push({
            type: 'BROKEN_MODULE',
            severity: 'CRITICAL',
            module: mod,
            message: 'Módulo ' + mod + ' não encontrado no DOM',
            timestamp: new Date().toISOString(),
            autoFix: 'Recriar módulo no HTML'
          });
        }
      });

      return issues;
    },

    // Detectar problemas de permissão
    detectPermissionIssues: function() {
      const issues = [];
      const role = window.role || 'unknown';

      // Colaborador não deve ver Gestão RH
      if (role === 'colaborador') {
        const gestaoRh = document.querySelector('[id*="gestao-rh"], [id*="dashboard-rh"]');
        if (gestaoRh && gestaoRh.style.display !== 'none') {
          issues.push({
            type: 'PERMISSION_VIOLATION',
            severity: 'CRITICAL',
            module: 'gestao-rh',
            message: 'Colaborador consegue ver módulo administrativo',
            timestamp: new Date().toISOString(),
            autoFix: 'Ocultando módulo para colaborador'
          });
          gestaoRh.style.display = 'none';
        }
      }

      return issues;
    },

    // Detectar páginas em branco
    detectBlankPages: function() {
      const issues = [];
      const active = document.querySelector('[id^="view-"].active');

      if (active && (!active.textContent || active.textContent.trim().length < 20)) {
        issues.push({
          type: 'BLANK_PAGE',
          severity: 'WARNING',
          module: active.id.replace('view-', ''),
          message: 'Página renderizada mas sem conteúdo significativo',
          timestamp: new Date().toISOString(),
          autoFix: 'Verificar carregamento de dados'
        });
      }

      return issues;
    },

    // Detectar erros de renderização
    detectRenderingErrors: function() {
      const issues = [];

      // Procurar por elementos quebrados (erro no console)
      const errors = (window.__auditErrors || []).filter(e =>
        e.timestamp > Date.now() - 5000  // Últimos 5 segundos
      );

      errors.forEach(err => {
        issues.push({
          type: 'RENDERING_ERROR',
          severity: 'ERROR',
          module: err.module || 'unknown',
          message: err.message,
          timestamp: err.timestamp,
          autoFix: 'Recarregar módulo'
        });
      });

      return issues;
    },

    // Detectar problemas de navegação
    detectNavigationIssues: function() {
      const issues = [];

      // Menu não carregou
      const sidebar = document.getElementById('sidebar');
      if (!sidebar || sidebar.querySelectorAll('.sb-item').length === 0) {
        issues.push({
          type: 'NAVIGATION_ISSUE',
          severity: 'CRITICAL',
          module: 'menu',
          message: 'Menu sidebar não carregou itens',
          timestamp: new Date().toISOString(),
          autoFix: 'Reconstruir menu'
        });
      }

      return issues;
    },

    // Detectar problemas de performance
    detectPerformanceIssues: function() {
      const issues = [];
      const perf = window.performance;

      if (perf && perf.timing) {
        const loadTime = perf.timing.loadEventEnd - perf.timing.navigationStart;
        if (loadTime > 5000) {  // > 5 segundos
          issues.push({
            type: 'PERFORMANCE_ISSUE',
            severity: 'WARNING',
            module: 'general',
            message: 'Tempo de carregamento lento: ' + loadTime + 'ms',
            timestamp: new Date().toISOString(),
            autoFix: 'Analisar bundle e cache'
          });
        }
      }

      return issues;
    },

    // Detectar tentativa de restauração de versão antiga
    detectVersionRollback: function() {
      const issues = [];
      const protectedCommits = ['8e7d3bf', '4266b44', '4fc9a34'];

      // Verificar se há código comentado que deveria estar deletado
      if (document.body.innerHTML.includes('REMOVED: Caused menu oscillation') ||
          document.body.innerHTML.includes('REMOVED: Blocked legitimate navigation')) {

        issues.push({
          type: 'VERSION_ROLLBACK_ATTEMPT',
          severity: 'CRITICAL',
          module: 'core',
          message: 'Detectada restauração de código comentado que foi deletado',
          timestamp: new Date().toISOString(),
          autoFix: 'Remover restauração - commits críticos protegidos'
        });
      }

      return issues;
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // SEÇÃO 4: VALIDADORES DE MÓDULO
  // ──────────────────────────────────────────────────────────────────────────────

  window.AuditValidator = {
    validateModule: function(moduleName) {
      const status = {
        name: moduleName,
        timestamp: new Date().toISOString(),
        checks: {}
      };

      // Check 1: DOM exists
      const view = document.getElementById('view-' + moduleName);
      status.checks.domExists = !!view;

      // Check 2: Has content
      status.checks.hasContent = view ? view.textContent.trim().length > 0 : false;

      // Check 3: No console errors
      status.checks.noErrors = (window.__auditErrors || []).length === 0;

      // Check 4: Loader function exists
      const loaderFunc = window[moduleName + 'Carregar'] || window[moduleName + 'Loader'];
      status.checks.loaderExists = !!loaderFunc;

      // Check 5: Permissions validated
      const requiredRole = this._getRequiredRole(moduleName);
      const currentRole = window.role || 'colaborador';
      status.checks.permissionGranted = this._checkPermission(currentRole, requiredRole);

      // Status geral
      const passedChecks = Object.values(status.checks).filter(Boolean).length;
      status.overall = passedChecks >= 4 ? 'FUNCIONANDO' :
                      passedChecks >= 2 ? 'ATENÇÃO' : 'ERRO_CRÍTICO';

      return status;
    },

    validateAllModules: function() {
      const modules = ['intranet', 'pesquisas', 'beneficios', 'dashboard', 'gestao-rh', 'gamificacao'];
      const results = {};

      modules.forEach(mod => {
        results[mod] = this.validateModule(mod);
      });

      AUDIT_STATE.moduleStatus = results;
      return results;
    },

    _getRequiredRole: function(moduleName) {
      const roleMap = {
        'gestao-rh': 'rh',
        'dashboard': 'rh',
        'auditoria': 'rh',
        'pesquisas': 'gestor',
        'beneficios': 'any'
      };
      return roleMap[moduleName] || 'any';
    },

    _checkPermission: function(currentRole, requiredRole) {
      if (requiredRole === 'any') return true;
      if (requiredRole === 'rh') return currentRole === 'rh';
      if (requiredRole === 'gestor') return currentRole === 'rh' || currentRole === 'gestor';
      return true;
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // SEÇÃO 5: VALIDADOR DE PERMISSÕES
  // ──────────────────────────────────────────────────────────────────────────────

  window.AuditPermissionValidator = {
    validateAllProfiles: function() {
      const results = {
        colaborador: this.validateProfile('colaborador'),
        gestor: this.validateProfile('gestor'),
        rh: this.validateProfile('rh')
      };

      AUDIT_STATE.permissions = results;
      return results;
    },

    validateProfile: function(role) {
      const validation = {
        role: role,
        timestamp: new Date().toISOString(),
        canAccess: {},
        violations: []
      };

      const allowedModules = this._getAllowedModules(role);
      const allModules = ['intranet', 'pesquisas', 'beneficios', 'dashboard', 'gestao-rh', 'auditoria'];

      allModules.forEach(mod => {
        validation.canAccess[mod] = allowedModules.includes(mod);

        if (!allowedModules.includes(mod)) {
          // Verificar se módulo está visível quando não deveria
          const view = document.getElementById('view-' + mod);
          if (view && view.style.display !== 'none') {
            validation.violations.push({
              module: mod,
              issue: 'Módulo visível para ' + role + ' quando deveria estar oculto',
              severity: 'CRITICAL'
            });
          }
        }
      });

      return validation;
    },

    _getAllowedModules: function(role) {
      const accessMap = {
        colaborador: ['intranet', 'beneficios', 'gamificacao'],
        gestor: ['intranet', 'pesquisas', 'beneficios', 'gamificacao', 'dashboard'],
        rh: ['intranet', 'pesquisas', 'beneficios', 'gestao-rh', 'auditoria', 'dashboard', 'gamificacao']
      };
      return accessMap[role] || [];
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // SEÇÃO 6: ENGINE PRINCIPAL
  // ──────────────────────────────────────────────────────────────────────────────

  window.AuditEngine = {
    start: function() {
      if (AUDIT_STATE.isRunning) return;
      AUDIT_STATE.isRunning = true;

      console.log('[AUDIT] Engine iniciado');

      // Rodada inicial
      this.runFullAudit();

      // Rodar a cada 5 segundos
      this.auditInterval = setInterval(() => {
        this.runFullAudit();
      }, AUDIT_CONFIG.AUTO_RUN_INTERVAL);
    },

    stop: function() {
      if (this.auditInterval) {
        clearInterval(this.auditInterval);
        AUDIT_STATE.isRunning = false;
        console.log('[AUDIT] Engine parado');
      }
    },

    runFullAudit: function() {
      const startTime = performance.now();

      // Detectar problemas
      AuditDetector.detectAll();

      // Validar módulos
      AuditValidator.validateAllModules();

      // Validar permissões
      AuditPermissionValidator.validateAllProfiles();

      AUDIT_STATE.lastRun = new Date().toISOString();

      const duration = (performance.now() - startTime).toFixed(2);
      AuditLogger.info('AUDIT', 'Auditoria completa executada em ' + duration + 'ms', {
        issuesFound: AUDIT_STATE.issues.length
      });

      // Disparar evento para dashboard atualizar
      window.dispatchEvent(new CustomEvent('auditCompleted', {
        detail: AUDIT_STATE
      }));
    },

    getStatus: function() {
      return {
        isRunning: AUDIT_STATE.isRunning,
        lastRun: AUDIT_STATE.lastRun,
        issuesCount: AUDIT_STATE.issues.length,
        criticalIssues: AUDIT_STATE.issues.filter(i => i.severity === 'CRITICAL').length,
        logsCount: AUDIT_STATE.logs.length,
        moduleStatus: AUDIT_STATE.moduleStatus,
        permissions: AUDIT_STATE.permissions
      };
    },

    getIssues: function(severity = null) {
      return severity ? AUDIT_STATE.issues.filter(i => i.severity === severity) : AUDIT_STATE.issues;
    },

    getLogs: function(limit = 100) {
      return AUDIT_STATE.logs.slice(-limit);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // SEÇÃO 7: INICIALIZAÇÃO & CAPTURA DE ERROS
  // ──────────────────────────────────────────────────────────────────────────────

  // Capturar erros do console
  window.__auditErrors = [];
  const originalError = console.error;
  console.error = function(...args) {
    window.__auditErrors.push({
      message: args.join(' '),
      timestamp: Date.now(),
      module: document.querySelector('[id^="view-"].active')?.id.replace('view-', '') || 'unknown'
    });
    return originalError.apply(console, args);
  };

  // Iniciar engine quando DOM está pronto
  document.addEventListener('DOMContentLoaded', function() {
    if (window.isRH && window.isRH()) {
      AuditEngine.start();
      console.log('[AUDIT] Engine ativo - RH detectado');
    }
  });

  // Garantir que engine está rodando para RH
  if (typeof window.isRH === 'function' && window.isRH()) {
    AuditEngine.start();
  }

  console.log('[AUDIT] Engine carregado e pronto');
})();
