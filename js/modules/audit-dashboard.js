// ════════════════════════════════════════════════════════════════════════════════
// AUDIT DASHBOARD - Painel de Auditoria Técnica e Governança
// ════════════════════════════════════════════════════════════════════════════════
// Responsabilidade: Exibir painel interativo para RH com status do sistema,
// logs de alterações, detecção de problemas e relatórios automáticos
// ════════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  if (window.__auditDashboardLoaded) return;
  window.__auditDashboardLoaded = true;

  window.AuditDashboard = {
    // Criar o painel na tela
    init: function() {
      // Aguardar audit-engine estar pronto
      if (!window.AuditEngine) {
        console.warn('[AUDIT-DASHBOARD] Aguardando engine...');
        setTimeout(() => this.init(), 500);
        return;
      }

      console.log('[AUDIT-DASHBOARD] Iniciado');
      this.render();
      this.attachEventListeners();
      this.setupLiveUpdates();
    },

    render: function() {
      const html = `
        <div id="audit-dashboard" class="audit-dashboard">
          <!-- HEADER -->
          <div class="audit-header">
            <h2>🔍 Auditoria Técnica & Governança</h2>
            <div class="audit-status-badge" id="auditStatusBadge">
              <span class="status-dot status-running"></span>
              Monitorando...
            </div>
          </div>

          <!-- STATS ROW -->
          <div class="audit-stats">
            <div class="stat-card">
              <div class="stat-value" id="statIssues">0</div>
              <div class="stat-label">Problemas Detectados</div>
            </div>
            <div class="stat-card alert">
              <div class="stat-value" id="statCritical">0</div>
              <div class="stat-label">Críticos</div>
            </div>
            <div class="stat-card warning">
              <div class="stat-value" id="statModules">0</div>
              <div class="stat-label">Módulos Funcionando</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="statLastRun">--:--</div>
              <div class="stat-label">Última Auditoria</div>
            </div>
          </div>

          <!-- TABS -->
          <div class="audit-tabs">
            <button class="tab-btn active" data-tab="overview">📊 Visão Geral</button>
            <button class="tab-btn" data-tab="issues">⚠️ Problemas</button>
            <button class="tab-btn" data-tab="modules">📦 Módulos</button>
            <button class="tab-btn" data-tab="permissions">🔐 Permissões</button>
            <button class="tab-btn" data-tab="logs">📝 Logs</button>
            <button class="tab-btn" data-tab="report">📄 Relatório</button>
          </div>

          <!-- TAB: OVERVIEW -->
          <div class="tab-content active" data-tab="overview">
            <div class="audit-section">
              <h3>Status dos Módulos</h3>
              <div id="moduleStatusContainer" class="module-status-grid"></div>
            </div>

            <div class="audit-section">
              <h3>Ações Rápidas</h3>
              <div class="audit-actions">
                <button class="btn btn-primary" id="btnFullAudit">🔍 Executar Auditoria Completa</button>
                <button class="btn btn-primary" id="btnTestAccess">🔐 Testar Perfis de Acesso</button>
                <button class="btn btn-primary" id="btnValidateModules">✓ Validar Módulos</button>
                <button class="btn btn-primary" id="btnGenerateReport">📄 Gerar Relatório Técnico</button>
              </div>
            </div>
          </div>

          <!-- TAB: ISSUES -->
          <div class="tab-content" data-tab="issues">
            <div class="audit-section">
              <h3>Problemas Detectados</h3>
              <div id="issuesContainer" class="issues-list"></div>
            </div>
          </div>

          <!-- TAB: MODULES -->
          <div class="tab-content" data-tab="modules">
            <div class="audit-section">
              <h3>Validação de Módulos</h3>
              <div id="moduleDetailsContainer" class="module-details"></div>
            </div>
          </div>

          <!-- TAB: PERMISSIONS -->
          <div class="tab-content" data-tab="permissions">
            <div class="audit-section">
              <h3>Validação de Permissões por Perfil</h3>
              <div id="permissionsContainer" class="permissions-grid"></div>
            </div>
          </div>

          <!-- TAB: LOGS -->
          <div class="tab-content" data-tab="logs">
            <div class="audit-section">
              <h3>Histórico de Alterações</h3>
              <button class="btn btn-secondary" id="btnExportLogs">⬇️ Exportar Logs</button>
              <div id="logsContainer" class="logs-list"></div>
            </div>
          </div>

          <!-- TAB: REPORT -->
          <div class="tab-content" data-tab="report">
            <div class="audit-section">
              <h3>Relatório Técnico Completo</h3>
              <button class="btn btn-secondary" id="btnDownloadReport">⬇️ Baixar Relatório</button>
              <div id="reportContainer" class="report-content"></div>
            </div>
          </div>
        </div>
      `;

      // Inserir no DOM
      let container = document.getElementById('view-auditoria');
      if (!container) {
        container = document.createElement('div');
        container.id = 'view-auditoria';
        container.className = 'page';
        document.querySelector('.main-area')?.appendChild(container);
      }

      container.innerHTML = html;
      this.applyStyles();
      this.updateDisplay();
    },

    applyStyles: function() {
      const styles = `
        <style>
          .audit-dashboard {
            padding: 24px;
            background: #f5f5f5;
            max-width: 1400px;
            margin: 0 auto;
          }

          .audit-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #ddd;
          }

          .audit-header h2 {
            font-size: 24px;
            margin: 0;
            color: #2c5f9d;
          }

          .audit-status-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: #e8f5e9;
            border-radius: 20px;
            font-weight: 500;
            color: #2e7d32;
          }

          .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }

          .status-running {
            background: #4caf50;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          .audit-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
          }

          .stat-card {
            background: white;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 4px solid #2c5f9d;
          }

          .stat-card.alert {
            border-left-color: #f44336;
          }

          .stat-card.warning {
            border-left-color: #ff9800;
          }

          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #2c5f9d;
          }

          .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 8px;
          }

          .audit-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            border-bottom: 1px solid #ddd;
            overflow-x: auto;
          }

          .tab-btn {
            padding: 12px 16px;
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-weight: 500;
            color: #666;
            transition: all 0.3s;
          }

          .tab-btn.active {
            color: #2c5f9d;
            border-bottom-color: #2c5f9d;
          }

          .tab-content {
            display: none;
          }

          .tab-content.active {
            display: block;
          }

          .audit-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .audit-section h3 {
            margin: 0 0 16px 0;
            color: #2c5f9d;
            font-size: 16px;
          }

          .audit-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
          }

          .btn {
            padding: 12px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
          }

          .btn-primary {
            background: #2c5f9d;
            color: white;
          }

          .btn-primary:hover {
            background: #1e4a7a;
          }

          .btn-secondary {
            background: #f5f5f5;
            color: #2c5f9d;
            border: 1px solid #ddd;
          }

          .btn-secondary:hover {
            background: #eee;
          }

          .module-status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
          }

          .module-status-card {
            padding: 12px;
            border-radius: 6px;
            text-align: center;
            color: white;
            font-weight: 500;
          }

          .status-funcionando {
            background: #4caf50;
          }

          .status-atencao {
            background: #ff9800;
          }

          .status-erro {
            background: #f44336;
          }

          .issues-list,
          .logs-list {
            max-height: 400px;
            overflow-y: auto;
          }

          .issue-item,
          .log-item {
            padding: 12px;
            border-left: 4px solid #ff9800;
            margin-bottom: 8px;
            background: #fff3e0;
            border-radius: 4px;
            font-size: 12px;
          }

          .issue-item.critical {
            border-left-color: #f44336;
            background: #ffebee;
          }

          .permissions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
          }

          .permission-card {
            background: #f9f9f9;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #ddd;
          }

          .permission-role {
            font-weight: bold;
            color: #2c5f9d;
            margin-bottom: 8px;
          }

          .permission-item {
            font-size: 12px;
            padding: 4px 0;
          }

          .permission-item.allowed {
            color: #4caf50;
          }

          .permission-item.denied {
            color: #f44336;
          }

          .report-content {
            background: #f9f9f9;
            padding: 16px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
            max-height: 600px;
            overflow-y: auto;
          }
        </style>
      `;

      if (!document.getElementById('audit-dashboard-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'audit-dashboard-styles';
        styleEl.innerHTML = styles;
        document.head.appendChild(styleEl);
      }
    },

    updateDisplay: function() {
      if (!window.AuditEngine) return;

      const status = window.AuditEngine.getStatus();

      // Update stats
      document.getElementById('statIssues').textContent = status.issuesCount;
      document.getElementById('statCritical').textContent = status.criticalIssues;
      document.getElementById('statModules').textContent =
        Object.values(status.moduleStatus || {}).filter(m => m.overall === 'FUNCIONANDO').length;

      if (status.lastRun) {
        const time = new Date(status.lastRun).toLocaleTimeString('pt-BR');
        document.getElementById('statLastRun').textContent = time;
      }

      // Update module status
      this.updateModuleStatus(status.moduleStatus);
      this.updateIssuesList(status);
      this.updateLogsList();
      this.updatePermissions(status.permissions);
    },

    updateModuleStatus: function(moduleStatus) {
      const container = document.getElementById('moduleStatusContainer');
      if (!container || !moduleStatus) return;

      let html = '';
      Object.entries(moduleStatus).forEach(([name, status]) => {
        const statusClass = 'status-' + status.overall.toLowerCase().replace('_', '-');
        html += `
          <div class="module-status-card ${statusClass}">
            <div>${name}</div>
            <div style="font-size: 12px; opacity: 0.8;">${status.overall}</div>
          </div>
        `;
      });

      container.innerHTML = html || '<p>Nenhum módulo validado</p>';
    },

    updateIssuesList: function(status) {
      const container = document.getElementById('issuesContainer');
      if (!container) return;

      const issues = window.AuditEngine.getIssues();
      if (issues.length === 0) {
        container.innerHTML = '<p style="color: #4caf50;">✓ Nenhum problema detectado</p>';
        return;
      }

      let html = '';
      issues.forEach(issue => {
        const className = issue.severity === 'CRITICAL' ? 'critical' : '';
        html += `
          <div class="issue-item ${className}">
            <strong>${issue.type}</strong> | ${issue.module}<br/>
            ${issue.message}<br/>
            <small>Auto-fix: ${issue.autoFix || 'Manual'}</small>
          </div>
        `;
      });

      container.innerHTML = html;
    },

    updateLogsList: function() {
      const container = document.getElementById('logsContainer');
      if (!container) return;

      const logs = window.AuditLogger.getLogs(50);
      if (logs.length === 0) {
        container.innerHTML = '<p>Nenhum log registrado</p>';
        return;
      }

      let html = '';
      logs.forEach(log => {
        html += `
          <div class="log-item">
            <strong>${log.timestamp.split('T')[1].split('.')[0]}</strong> |
            ${log.level} | ${log.category} | ${log.module}<br/>
            ${log.message}
          </div>
        `;
      });

      container.innerHTML = html;
    },

    updatePermissions: function(permissions) {
      const container = document.getElementById('permissionsContainer');
      if (!container || !permissions) return;

      let html = '';
      Object.entries(permissions).forEach(([role, validation]) => {
        html += `
          <div class="permission-card">
            <div class="permission-role">${role.toUpperCase()}</div>
        `;

        Object.entries(validation.canAccess || {}).forEach(([module, allowed]) => {
          const className = allowed ? 'allowed' : 'denied';
          const icon = allowed ? '✓' : '✗';
          html += `<div class="permission-item ${className}">${icon} ${module}</div>`;
        });

        html += '</div>';
      });

      container.innerHTML = html;
    },

    attachEventListeners: function() {
      // Tab switching
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

          e.target.classList.add('active');
          const tab = e.target.dataset.tab;
          document.querySelector('[data-tab="' + tab + '"]').classList.add('active');
        });
      });

      // Action buttons
      document.getElementById('btnFullAudit')?.addEventListener('click', () => {
        window.AuditEngine.runFullAudit();
        this.updateDisplay();
      });

      document.getElementById('btnTestAccess')?.addEventListener('click', () => {
        window.AuditPermissionValidator.validateAllProfiles();
        this.updateDisplay();
      });

      document.getElementById('btnValidateModules')?.addEventListener('click', () => {
        window.AuditValidator.validateAllModules();
        this.updateDisplay();
      });

      document.getElementById('btnGenerateReport')?.addEventListener('click', () => {
        this.generateReport();
      });

      document.getElementById('btnExportLogs')?.addEventListener('click', () => {
        this.exportLogs();
      });

      document.getElementById('btnDownloadReport')?.addEventListener('click', () => {
        this.downloadReport();
      });
    },

    setupLiveUpdates: function() {
      window.addEventListener('auditCompleted', () => {
        this.updateDisplay();
      });
    },

    generateReport: function() {
      const status = window.AuditEngine.getStatus();
      const issues = window.AuditEngine.getIssues();
      const logs = window.AuditLogger.getLogs(100);

      let report = `
RELATÓRIO TÉCNICO COMPLETO
============================
Gerado em: ${new Date().toLocaleString('pt-BR')}

RESUMO EXECUTIVO
────────────────
Problemas Detectados: ${status.issuesCount}
Problemas Críticos: ${status.criticalIssues}
Módulos Funcionando: ${Object.values(status.moduleStatus || {}).filter(m => m.overall === 'FUNCIONANDO').length}
Última Auditoria: ${status.lastRun}

PROBLEMAS ENCONTRADOS
──────────────────────
${issues.length > 0 ? issues.map(i => `[${i.severity}] ${i.type} - ${i.message}`).join('\n') : 'Nenhum'}

STATUS DOS MÓDULOS
──────────────────
${Object.entries(status.moduleStatus || {}).map(([name, s]) => `${name}: ${s.overall}`).join('\n')}

HISTÓRICO RECENTE (últimos 20 logs)
──────────────────────────────────
${logs.slice(-20).map(l => `${l.timestamp} [${l.level}] ${l.category}: ${l.message}`).join('\n')}

FIM DO RELATÓRIO
`;

      const container = document.getElementById('reportContainer');
      if (container) {
        container.textContent = report;
      }

      return report;
    },

    exportLogs: function() {
      const logs = window.AuditLogger.getLogs();
      const csv = 'timestamp,level,category,module,message\n' +
        logs.map(l => `"${l.timestamp}","${l.level}","${l.category}","${l.module}","${l.message}"`).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-logs-' + new Date().toISOString().split('T')[0] + '.csv';
      a.click();
    },

    downloadReport: function() {
      const report = this.generateReport();
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-report-' + new Date().toISOString().split('T')[0] + '.txt';
      a.click();
    }
  };

  // Auto-init se RH
  if (typeof window.isRH === 'function' && window.isRH()) {
    document.addEventListener('DOMContentLoaded', () => {
      AuditDashboard.init();
    });
  }

  console.log('[AUDIT-DASHBOARD] Carregado');
})();

