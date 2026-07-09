# AUDIT TEST CHECKLIST - Validação do Módulo de Auditoria
**Data:** 2026-07-09  
**Status:** Em Execução  
**Responsável:** Aline Mazzucatto

---

## 🔍 Testes de Inicialização

### Engine Loading
- [ ] Script `audit-engine.js` carrega sem erros
- [ ] Script `audit-report-generator.js` carrega sem erros
- [ ] Script `audit-dashboard.js` carrega sem erros
- [ ] Window.AuditEngine disponível no console
- [ ] Window.AuditLogger disponível no console
- [ ] Window.AuditDetector disponível no console
- [ ] Window.AuditValidator disponível no console
- [ ] Window.AuditPermissionValidator disponível no console
- [ ] Window.AuditReportGenerator disponível no console

### Console Verification
```javascript
// No console:
window.AuditEngine        // deve retornar object
window.AuditLogger        // deve retornar object
AuditEngine.getStatus()   // deve retornar object com issuesCount, lastRun, etc
```

---

## 🚨 Testes de Detecção de Problemas

### 1. detectBrokenModules()
- [ ] Identifica módulos faltando no DOM
- [ ] Log registrado quando módulo quebrado é encontrado
- [ ] Severity: CRITICAL

### 2. detectPermissionIssues()
- [ ] Colaborador NÃO vê Gestão RH quando logado
- [ ] Gestor vê Pesquisas corretamente
- [ ] RH vê todos os módulos

### 3. detectBlankPages()
- [ ] Detecta páginas com conteúdo < 20 caracteres
- [ ] Gera WARNING em vez de CRITICAL

### 4. detectRenderingErrors()
- [ ] Captura erros do console.error
- [ ] Filtra apenas erros dos últimos 5 segundos
- [ ] Severity: ERROR

### 5. detectNavigationIssues()
- [ ] Verifica se sidebar carregou
- [ ] Verifica se .sb-item elementos existem
- [ ] Severity: CRITICAL se falhar

### 6. detectPerformanceIssues()
- [ ] Alerta se loadTime > 5000ms
- [ ] Severity: WARNING

### 7. detectVersionRollback()
- [ ] Detecta se código comentado foi reintroduzido
- [ ] Bloqueia restauração de versão antiga
- [ ] Severity: CRITICAL

---

## ✅ Testes de Validação

### validateModule()
- [ ] Verifica DOM exists
- [ ] Verifica has content
- [ ] Verifica no errors
- [ ] Verifica loader exists
- [ ] Verifica permission granted
- [ ] Retorna overall: FUNCIONANDO/ATENÇÃO/ERRO_CRÍTICO

### validateAllModules()
- [ ] Valida: intranet, pesquisas, beneficios, dashboard, gestao-rh, gamificacao
- [ ] AUDIT_STATE.moduleStatus atualizado
- [ ] Cada módulo tem 5 checks

---

## 🔐 Testes de Permissões

### Colaborador
- [ ] Acesso permitido: intranet, beneficios, gamificacao
- [ ] Acesso negado: pesquisas, dashboard, gestao-rh, auditoria
- [ ] Módulos negados NÃO são renderizados
- [ ] Logs registram tentativa de acesso ilegal

### Gestor
- [ ] Acesso permitido: intranet, pesquisas, beneficios, gamificacao, dashboard
- [ ] Acesso negado: gestao-rh, auditoria
- [ ] Menu com 5 itens (não truncado)

### RH
- [ ] Acesso permitido: todos os 7 módulos
- [ ] Dashboard de auditoria aparece
- [ ] AuditEngine inicia automaticamente
- [ ] Logs de auditoria aparecem em tempo real

---

## 📝 Testes de Logging

### AuditLogger.log()
- [ ] Cria entrada com timestamp, level, category, message, details
- [ ] Armazena userRole
- [ ] Armazena module atual
- [ ] Limita a 1000 logs em memória
- [ ] Persiste em localStorage

### Métodos de Conveniência
- [ ] AuditLogger.info() funciona
- [ ] AuditLogger.warning() funciona
- [ ] AuditLogger.error() funciona
- [ ] AuditLogger.critical() funciona + console.error

### getLogs()
- [ ] AuditLogger.getLogs(50) retorna últimos 50 logs
- [ ] AuditLogger.getLogs() retorna até 100 logs
- [ ] Logs recuperados de localStorage após reload

---

## 🎯 Testes de Engine Principal

### AuditEngine.start()
- [ ] Inicia loop de auditoria a cada 5s
- [ ] runFullAudit() executado na inicialização
- [ ] Continua executando em background
- [ ] Dispatch 'auditCompleted' event após cada auditoria

### AuditEngine.runFullAudit()
- [ ] Executa detectAll()
- [ ] Executa validateAllModules()
- [ ] Executa validateAllProfiles()
- [ ] Atualiza AUDIT_STATE.lastRun
- [ ] Registra auditoria em log com duração

### AuditEngine.getStatus()
- [ ] Retorna isRunning, lastRun, issuesCount, criticalIssues
- [ ] Retorna logsCount, moduleStatus, permissions

### AuditEngine.getIssues()
- [ ] Sem filtro: retorna todos os issues
- [ ] Com severity: retorna issues daquele nível
- [ ] Formato: {type, severity, module, message, timestamp, autoFix}

---

## 📊 Testes de Dashboard

### Rendering
- [ ] Dashboard renderiza em view-auditoria
- [ ] Header com status badge aparece
- [ ] Stats cards aparecem (problemas, críticos, módulos, último run)
- [ ] Tabs funcionam (Overview, Issues, Modules, Permissions, Logs, Report)

### Overview Tab
- [ ] Module status grid mostra todos os módulos
- [ ] Cores corretas (verde/amarelo/vermelho)
- [ ] 4 action buttons aparecem e funcionam

### Issues Tab
- [ ] Lista todos os problemas encontrados
- [ ] Critical issues com styling diferente
- [ ] Mensagens de problema claras

### Modules Tab
- [ ] Validação de módulos executada
- [ ] Status de cada módulo exibido
- [ ] Checks detalhe exibido

### Permissions Tab
- [ ] 3 cards aparecem (Colaborador, Gestor, RH)
- [ ] Módulos permitidos em verde ✓
- [ ] Módulos negados em vermelho ✗
- [ ] Violações listadas

### Logs Tab
- [ ] Últimos 50 logs aparecem
- [ ] Timestamp, level, category, message visíveis
- [ ] Export Logs button funciona (baixa CSV)

### Report Tab
- [ ] Relatório completo gerado
- [ ] Download Report button funciona
- [ ] Arquivo baixado é nomeado corretamente

---

## 🎨 Testes de Estilo

### CSS Carrega
- [ ] Cores aplicadas corretamente
- [ ] Layout responsive (desktop vs mobile)
- [ ] Animações funcionam (pulse animation no status dot)
- [ ] Spacing consistente com 8px scale

### Temas
- [ ] Dark mode funciona
- [ ] Light mode funciona
- [ ] Contraste de cores adequado (WCAG AA)

---

## ⚡ Testes de Performance

### Execução Rápida
- [ ] runFullAudit() completa em < 100ms
- [ ] Sem lag visível no dashboard
- [ ] CPU usage normal (< 5%)
- [ ] Memory usage estável

### Intervalos
- [ ] Auditoria a cada 5s (não mais frequente)
- [ ] 1000 logs mantidos em memória
- [ ] 30 dias de retenção em localStorage

---

## 🔗 Testes de Integração

### com index.html
- [ ] Scripts carregam na ordem correta (engine antes de dashboard)
- [ ] Sem erros de carregamento
- [ ] Sem conflitos com outros módulos

### com login-auth.js
- [ ] AuditEngine inicia após login completo
- [ ] window.role disponível para AuditEngine
- [ ] window.currentUserData disponível

### com 000-core-functions.js
- [ ] forceView() permite acesso correto para RH
- [ ] Audit dashboard acessível apenas para RH
- [ ] Sem conflitos de namespace

---

## 📱 Testes de Responsividade

### Desktop (1280px)
- [ ] Dashboard renderiza completo
- [ ] Todos os 6 tabs visíveis
- [ ] Stats cards em grid 4 colunas

### Tablet (768px)
- [ ] Dashboard renderiza sem scroll horizontal
- [ ] Tabs em scrollable container
- [ ] Stats cards em grid 2 colunas

### Mobile (375px)
- [ ] Dashboard renderiza sem scroll horizontal
- [ ] Botões grandes o suficiente para touch
- [ ] Tabs em vertical scroll
- [ ] Relatório legível

---

## 🧪 Teste Manual Completo

### Pré-requisitos
```
[ ] Usuário RH logado
[ ] Browser console aberto
[ ] Network tab monitorando
```

### Execução
```
1. [ ] Abrir Gestão RH
2. [ ] Verificar se audit dashboard aparece
3. [ ] Clicar "Executar Auditoria Completa"
4. [ ] Verificar se problemas aparecem (devem ser 0 para sistema saudável)
5. [ ] Clicar "Testar Perfis de Acesso"
6. [ ] Verificar se Colaborador NÃO vê Gestão RH
7. [ ] Verificar se Gestor vê Pesquisas
8. [ ] Clicar "Validar Módulos"
9. [ ] Verificar status de todos os 6 módulos
10. [ ] Clicar "Gerar Relatório Técnico"
11. [ ] Ler relatório no Tab Report
12. [ ] Clicar "Exportar Logs" (deve baixar CSV)
13. [ ] Clicar "Baixar Relatório" (deve baixar TXT)
14. [ ] Verificar console.log para mensagens [AUDIT]
```

### Verificações Finais
- [ ] Sem erros em console
- [ ] Sem warnings não esperados
- [ ] Sem console.error inesperados
- [ ] Performance normal (< 2s page load)
- [ ] Todas as 3 transições de perfil funcionam
- [ ] Page refresh mantém audit engine rodando

---

## ✨ Testes de Funcionalidades Especiais

### Auto-Discovery de Problemas
- [ ] Introduzir um erro no código (ex: remover um módulo)
- [ ] Auditoria deve detectar em 5 segundos
- [ ] Issue deve aparecer no dashboard
- [ ] Nível de severidade correto

### Recuperação Automática
- [ ] Alguns problemas têm autoFix definido
- [ ] Verificar se auto-fix é aplicado
- [ ] Problema deve desaparecer na próxima auditoria

### Persistência de Logs
- [ ] Recarregar página
- [ ] Logs anteriores devem estar em localStorage
- [ ] Dashboard mostra histórico completo

---

## 📋 Relatório Final

| Componente | Status | Notas |
|-----------|--------|-------|
| audit-engine.js | ⏳ | Detecta 7 tipos de problemas |
| audit-dashboard.js | ⏳ | 6 tabs + 20 funcionalidades |
| audit-report-generator.js | ⏳ | Gera 3 tipos de relatório |
| AuditLogger | ⏳ | Persiste em localStorage |
| AuditDetector | ⏳ | 7 detectores implementados |
| AuditValidator | ⏳ | Valida 6 módulos |
| AuditPermissionValidator | ⏳ | 3 perfis validados |
| Performance | ⏳ | < 100ms por auditoria |
| Integração | ⏳ | Carrega automaticamente para RH |

---

## ✅ Conclusão

Todos os testes devem passar antes de fazer commit:
```bash
git commit -m "feat: implement automated audit engine with 27 functionalities"
```

Data de Conclusão: _______________  
Assinado por: _______________

