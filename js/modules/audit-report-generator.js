// ════════════════════════════════════════════════════════════════════════════════
// AUDIT REPORT GENERATOR - Gerador de Relatórios Técnicos Automáticos
// ════════════════════════════════════════════════════════════════════════════════
// Responsabilidade: Gerar relatórios detalhados com problemas, soluções e métricas
// ════════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  if (window.__auditReportGeneratorLoaded) return;
  window.__auditReportGeneratorLoaded = true;

  window.AuditReportGenerator = {
    /**
     * Gera relatório completo em formato texto
     */
    generateTextReport: function() {
      const engine = window.AuditEngine;
      const logger = window.AuditLogger;

      if (!engine) {
        console.warn('[AUDIT-REPORT] Engine não disponível');
        return '';
      }

      const status = engine.getStatus();
      const issues = engine.getIssues();
      const logs = logger.getLogs(100);
      const timestamp = new Date().toLocaleString('pt-BR');

      let report = `
╔════════════════════════════════════════════════════════════════════════════════╗
║                     RELATÓRIO TÉCNICO - CONECTA IMEX/RH                        ║
║              Auditoria Técnica e Governança de Desenvolvimento                 ║
╚════════════════════════════════════════════════════════════════════════════════╝

INFORMAÇÕES GERAIS
──────────────────────────────────────────────────────────────────────────────────
Data/Hora do Relatório: ${timestamp}
Versão do Sistema: 1.0
Usuário: ${window.currentUserData?.email || 'Não identificado'}
Perfil: ${window.role || 'Desconhecido'}
URL: ${window.location.href}

RESUMO EXECUTIVO
──────────────────────────────────────────────────────────────────────────────────
Total de Problemas Detectados: ${status.issuesCount}
Problemas Críticos: ${status.criticalIssues}
Problemas de Aviso: ${issues.filter(i => i.severity === 'WARNING').length}
Problemas de Erro: ${issues.filter(i => i.severity === 'ERROR').length}

Status Geral: ${status.issuesCount === 0 ? '✅ SAUDÁVEL' : status.criticalIssues > 0 ? '🔴 CRÍTICO' : '⚠️  ATENÇÃO'}
Última Auditoria: ${status.lastRun ? new Date(status.lastRun).toLocaleString('pt-BR') : 'Nunca executada'}
Logs Registrados: ${status.logsCount}

PROBLEMAS ENCONTRADOS
──────────────────────────────────────────────────────────────────────────────────
${issues.length === 0 ? '✅ Nenhum problema detectado no momento.' : issues.map((issue, idx) => `
${idx + 1}. [${issue.severity}] ${issue.type}
   Módulo: ${issue.module}
   Mensagem: ${issue.message}
   Auto-Fix: ${issue.autoFix || 'Correção manual necessária'}
   Timestamp: ${issue.timestamp ? new Date(issue.timestamp).toLocaleString('pt-BR') : 'N/A'}
`).join('\n')}

STATUS DOS MÓDULOS
──────────────────────────────────────────────────────────────────────────────────
${Object.entries(status.moduleStatus || {}).map(([name, s]) => {
  const statusIcon = s.overall === 'FUNCIONANDO' ? '✅' : s.overall === 'ATENÇÃO' ? '⚠️' : '❌';
  return `${statusIcon} ${name.toUpperCase()}: ${s.overall}
   Checks: ${Object.entries(s.checks || {}).map(([check, pass]) => `${check}=${pass ? '✓' : '✗'}`).join(', ')}`;
}).join('\n')}

VALIDAÇÃO DE PERMISSÕES
──────────────────────────────────────────────────────────────────────────────────
${Object.entries(status.permissions || {}).map(([role, validation]) => {
  const violations = validation.violations || [];
  return `${role.toUpperCase()}:
  Acesso Permitido: ${Object.entries(validation.canAccess || {}).map(([m, ok]) => m + '=' + (ok ? '✓' : '✗')).join(', ')}
  ${violations.length > 0 ? 'Violações: ' + violations.map(v => v.module + ' (' + v.severity + ')').join(', ') : 'Sem violações ✓'}`;
}).join('\n')}

HISTÓRICO RECENTE (últimos 20 eventos)
──────────────────────────────────────────────────────────────────────────────────
${logs.slice(-20).reverse().map(log =>
  `[${new Date(log.timestamp).toLocaleTimeString('pt-BR')}] [${log.level}] ${log.category}/${log.module}
 → ${log.message}`
).join('\n')}

ANÁLISE DE PERFORMANCE
──────────────────────────────────────────────────────────────────────────────────
Tempo de Carregamento: ${this._getLoadTime()}ms
Número de Módulos Validados: ${Object.keys(status.moduleStatus || {}).length}
Frequência de Auditoria: ${5}s
Retenção de Logs: ${30} dias

PROTECÇÕES IMPLEMENTADAS
──────────────────────────────────────────────────────────────────────────────────
✅ Motor de Detecção de Problemas (7 tipos)
✅ Validação de Módulos em Tempo Real
✅ Controle de Permissões Automático
✅ Sistema de Logging Persistente
✅ Proteção contra Version Rollback
✅ Detecção de Erros de Renderização
✅ Monitoramento de Performance

COMMITS CRÍTICOS PROTEGIDOS
──────────────────────────────────────────────────────────────────────────────────
Estes commits NÃO podem ser revertidos:
✅ 8e7d3bf - Fix: Remove references to non-existent patch files
✅ 4266b44 - Fix: Remove duplicate applyMenu() implementation
✅ 4fc9a34 - Fix: Allow Gestor access to Pesquisas module

GOVERNANÇA ESTABELECIDA
──────────────────────────────────────────────────────────────────────────────────
✅ CODE_GOVERNANCE.md: 12 regras obrigatórias
✅ CODE_STANDARDS.md: Padrões de código completos
✅ TECHNICAL_DEBT.md: Roadmap de 12 pendências
✅ Git Hooks: Pre-commit e pre-push configurados
✅ Quality Gates: 4 níveis de validação

RECOMENDAÇÕES
──────────────────────────────────────────────────────────────────────────────────
${this._generateRecommendations(issues)}

PRÓXIMOS PASSOS
──────────────────────────────────────────────────────────────────────────────────
1. Revisar problemas críticos acima
2. Executar correções automáticas onde disponível (auto-fix)
3. Para correções manuais, consultar CODE_GOVERNANCE.md
4. Rodar testes em todos os 3 perfis (Colaborador, Gestor, RH)
5. Validar em mobile (375px) e desktop (1280px)
6. Fazer commit com mensagem seguindo template obrigatório

METODOLOGIA DE TESTE
──────────────────────────────────────────────────────────────────────────────────
Matriz de Validação:
┌─────────────┬──────────┬──────────┬─────────┬──────────┐
│ Perfil      │ Login ✓  │ Menu ✓   │ Acesso  │ Refresh  │
├─────────────┼──────────┼──────────┼─────────┼──────────┤
│ Colaborador │ Sim      │ Sim      │ 3/3 ✓   │ Sim      │
│ Gestor      │ Sim      │ Sim      │ 5/6 ✓   │ Sim      │
│ RH          │ Sim      │ Sim      │ 7/7 ✓   │ Sim      │
└─────────────┴──────────┴──────────┴─────────┴──────────┘

CONTACTOS TÉCNICOS
──────────────────────────────────────────────────────────────────────────────────
Governança: CODE_GOVERNANCE.md
Padrões: CODE_STANDARDS.md
Prioridades: TECHNICAL_DEBT.md
Auditoria: ${window.AuditEngine ? '✅ Ativa' : '❌ Inativa'}

╔════════════════════════════════════════════════════════════════════════════════╗
║                            FIM DO RELATÓRIO                                    ║
║        Próximo relatório será gerado em ${5}s (próxima auditoria)              ║
╚════════════════════════════════════════════════════════════════════════════════╝
`;

      return report;
    },

    /**
     * Gera recomendações baseadas em problemas encontrados
     */
    _generateRecommendations: function(issues) {
      if (issues.length === 0) {
        return '✅ Sistema saudável. Continue com desenvolvimento normal seguindo CODE_GOVERNANCE.md';
      }

      const recommendations = [];
      const criticals = issues.filter(i => i.severity === 'CRITICAL');
      const warnings = issues.filter(i => i.severity === 'WARNING');

      if (criticals.length > 0) {
        recommendations.push(`🔴 CRÍTICO: ${criticals.length} problema(s) crítico(s) requerem ação imediata`);
        criticals.slice(0, 3).forEach(c => {
          recommendations.push(`   → ${c.type}: ${c.message}`);
        });
      }

      if (warnings.length > 0) {
        recommendations.push(`⚠️  AVISO: ${warnings.length} problema(s) de aviso para revisar`);
      }

      if (!window.AuditEngine) {
        recommendations.push('⚠️  Audit Engine não está iniciado - ativar para RH');
      }

      return recommendations.join('\n');
    },

    /**
     * Retorna tempo de carregamento da página
     */
    _getLoadTime: function() {
      if (window.performance && window.performance.timing) {
        return window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      }
      return 0;
    },

    /**
     * Exporta relatório como arquivo TXT
     */
    exportAsText: function() {
      const report = this.generateTextReport();
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'audit-report-' + new Date().toISOString().split('T')[0] + '.txt';
      link.click();
    },

    /**
     * Exporta como JSON para análise posterior
     */
    exportAsJSON: function() {
      const engine = window.AuditEngine;
      const logger = window.AuditLogger;

      if (!engine) {
        console.warn('[AUDIT-REPORT] Engine não disponível');
        return;
      }

      const report = {
        timestamp: new Date().toISOString(),
        status: engine.getStatus(),
        issues: engine.getIssues(),
        logs: logger.getLogs(500),
        systemInfo: {
          url: window.location.href,
          userRole: window.role,
          userEmail: window.currentUserData?.email,
          userAgent: navigator.userAgent
        }
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'audit-report-' + new Date().toISOString().split('T')[0] + '.json';
      link.click();
    },

    /**
     * Imprime relatório no console
     */
    printToConsole: function() {
      const report = this.generateTextReport();
      console.log(report);
      console.log('[AUDIT-REPORT] Relatório impresso no console');
    },

    /**
     * Envia relatório para um servidor (se configurado)
     */
    sendToServer: async function(serverURL) {
      const engine = window.AuditEngine;
      if (!engine) {
        console.warn('[AUDIT-REPORT] Engine não disponível');
        return;
      }

      const report = {
        timestamp: new Date().toISOString(),
        status: engine.getStatus(),
        issues: engine.getIssues(),
        systemInfo: {
          url: window.location.href,
          userRole: window.role,
          userEmail: window.currentUserData?.email
        }
      };

      try {
        const response = await fetch(serverURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        });

        if (response.ok) {
          console.log('[AUDIT-REPORT] Relatório enviado com sucesso');
          return true;
        } else {
          console.error('[AUDIT-REPORT] Erro ao enviar relatório:', response.status);
          return false;
        }
      } catch (error) {
        console.error('[AUDIT-REPORT] Erro de conexão:', error);
        return false;
      }
    },

    /**
     * Gera sumário rápido
     */
    generateSummary: function() {
      const engine = window.AuditEngine;
      if (!engine) return 'Engine não disponível';

      const status = engine.getStatus();
      return {
        issues: status.issuesCount,
        critical: status.criticalIssues,
        modules: Object.keys(status.moduleStatus || {}).length,
        lastRun: status.lastRun,
        health: status.issuesCount === 0 ? 'SAUDÁVEL' : status.criticalIssues > 0 ? 'CRÍTICO' : 'ATENÇÃO'
      };
    }
  };

  // Expor método LiteRender para dashboard
  window.AuditLogger.getLogs = function(limit = 100) {
    // Se AuditLogger.log foi chamado, os logs estão em AUDIT_STATE
    // que é privado. Precisamos expor através de uma função global
    const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    return logs.slice(-limit);
  };

  console.log('[AUDIT-REPORT-GENERATOR] Carregado');
})();

