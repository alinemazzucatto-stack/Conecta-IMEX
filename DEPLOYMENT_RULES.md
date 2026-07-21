# DEPLOYMENT RULES - Regras de Estabilidade e Controle

## 🔐 Princípios de Proteção do Sistema

O sistema Conecta RH passou por refatoração crítica (2026-07-09) para resolver oscilações, bugs de autenticação e performance. Este documento establece regras para EVITAR que os mesmos erros retornem.

---

## 🚫 REGRA 1: Proibição de Reverter Commits Críticos

### Commits Protegidos
```
8e7d3bf - Fix: Fallback authentication now respects loginRole selection
4266b44 - Fix: Remove duplicate applyMenu() from core-functions
4fc9a34 - Fix: Correct Pesquisas access control - allow Gestor access
```

### Por que não podem ser revertidos?
Esses commits resolvem problemas críticos que causavam:
- ❌ Tela de login oscilando
- ❌ Login preso em "Autenticando..."
- ❌ Menu de Gestor incompleto
- ❌ Acesso negado para Gestor em Pesquisas

Reverter QUALQUER UM causaria reintrodução desses bugs.

### Implementação Git

```bash
# Proteger branch main
git config --global branch.main.protected true

# Adicionar pre-commit hook para prevenir reverts desses commits
# Arquivo: .git/hooks/pre-commit

#!/bin/bash
PROTECTED_COMMITS="8e7d3bf 4266b44 4fc9a34"
for commit in $PROTECTED_COMMITS; do
  if git log --oneline | head -1 | grep -q "^$commit"; then
    # Verificar se é um revert
    if git log --oneline | head -1 | grep -qi "revert.*$commit"; then
      echo "❌ ERRO: Tentativa de reverter commit crítico $commit"
      echo "   Use git revert apenas com autorização de liderança"
      exit 1
    fi
  fi
done
exit 0
```

---

## 🚫 REGRA 2: Proibição de Descomentarizar Código Legado

### Código Comentado Protegido
```
js/modules/login-auth.js (linhas 327-435)
  - perfilEstavelInit() [comentado]
  - colabLockInit() [comentado]

js/legacy/* (45+ definições de função duplicadas - todas comentadas)
  - isRH(), roleAtual(), aplicarMenu(), navegar(), etc.

js/legacy/57-patch-critico-navegacao-renderizacao.js (linhas 112-123)
  - guard() function [comentada]
  - setInterval(guard, 1200) [comentada]
```

### Por que não podem ser descomentarizados?
Foram COMENTADOS (não deletados) porque:
- ✅ Causavam oscilações de menu
- ✅ Drenavam 60-80% de CPU
- ✅ Bloqueavam navegação legítima
- ✅ Criavam race conditions

**Desmentarizar = Reintroduzir bugs imediatamente**

### Implementação

```bash
# Pre-commit hook para detectar decomentarização
# Arquivo: .git/hooks/pre-commit

#!/bin/bash
DANGER_PATTERNS=(
  "^[^#]*perfilEstavelInit"
  "^[^#]*colabLockInit"
  "^[^#]*setInterval(guard"
)

for pattern in "${DANGER_PATTERNS[@]}"; do
  if git diff --staged | grep -E "$pattern" | grep -v "^+.*#"; then
    echo "❌ ERRO: Tentativa de descomentarizar código crítico!"
    echo "   Padrão encontrado: $pattern"
    echo "   Isso reintroduziria bugs de oscilação/performance"
    exit 1
  fi
done
exit 0
```

---

## ✅ REGRA 3: Protocolo de Deploy Seguro

### Pré-Deploy Checklist

- [ ] Todos os testes passando (npm run test)
- [ ] Sem erros de console em desenvolvimento
- [ ] Sem 404s de scripts
- [ ] Performance dentro dos limites:
  - [ ] CPU < 30% em idle
  - [ ] FCP < 2s
  - [ ] LCP < 3s
- [ ] Validado em 3 perfis:
  - [ ] Colaborador (menu correto, sem acesso Pesquisas)
  - [ ] Gestor (menu completo, acesso Pesquisas)
  - [ ] RH (menu RH, acesso total)
- [ ] Sem regressões visuais (lado a lado com versão anterior)

### Aprovações Necessárias

```
Deploy em Produção requer:
  1. ✅ Code Review de 2 pessoas
  2. ✅ Aprovação de QA (testes passando)
  3. ✅ Aprovação de Product Owner (features OK)
  4. ✅ Aprovação de Infrastructure (servers OK)

Deploy em Test requer:
  1. ✅ Code Review de 1 pessoa
  2. ✅ Testes básicos passando
```

### Rollback Automático

```javascript
// Implementar health check que rola back automaticamente
// Se mais de 5% de erros em 5 minutos, rollback automático

if (errorRate > 5%) {
  console.error("High error rate detected. Rolling back to previous version...");
  fetch('/api/admin/rollback', { method: 'POST' });
  // Redireciona usuários para versão anterior
}
```

---

## 🔄 REGRA 4: Versionamento de Releases

### Nomenclatura Semântica
```
v1.2.3-prod
 │  │  │
 │  │  └─ Patch: Bugfix menor (não requer testes completos)
 │  └────── Minor: Feature nova (requer testes completos)
 └───────── Major: Breaking change (requer aprovação extra + comunicação)
```

### Changelog Obrigatório

Toda release DEVE ter:
```markdown
## [1.2.3] - 2026-07-10

### Added
- Nova feature X

### Fixed
- Bug Y resolvido

### Changed
- Comportamento de Z alterado

### Security
- Vulnerabilidade A corrigida

### Breaking Changes
- Endpoint /api/old removido (use /api/new)
```

### Git Tags

```bash
# Tag DEVE incluir hash do commit crítico que resolve o problema
git tag -a v1.2.3 -m "
Release v1.2.3
Includes: 8e7d3bf (login fix), 4266b44 (menu fix), 4fc9a34 (access control)
Author: Aline Mazzucatto
Date: 2026-07-09
Approved by: [Product Owner], [Tech Lead]
"

# Nunca overwrite tags
git tag -n 10 # Ver todas as tags com mensagens
```

---

## 📝 REGRA 5: Documentação de Mudanças

### Documentar SEMPRE

Toda mudança DEVE ser documentada em:
1. ✅ Git commit message (o QUÊ e POR QUÊ)
2. ✅ CHANGELOG.md (histórico de versão)
3. ✅ ARCHITECTURE.md (se muda estrutura)
4. ✅ DEPENDENCIES.md (se muda dependências)

### Template de Commit Message

```
Type: Short description (max 60 chars)

Body explaining WHY this change (not WHAT):
- Problem being solved
- How it affects the system
- Risks (if any)
- Testing done

Fixes: #123 (issue number if applicable)
```

---

## 🧪 REGRA 6: Validação Antes de Produção

### Testes Obrigatórios

```bash
# Deve passar TUDO antes de merge
npm run test              # Jest unit tests
npm run test:e2e          # E2E tests (Cypress)
npm run lint              # ESLint
npm run type-check        # TypeScript/JSDoc check
npm run build             # Build otimizado
npm run security          # OWASP dependency check

# Performance check
npm run perf:baseline
# Não pode regressar > 10%
```

### Teste em Múltiplos Ambientes

```
DEV  → Local machine (desenvolvedor)
TEST → Staging server (QA)
PROD → Production (usuários reais)

Apenas deploy de TEST → PROD se passou TEST completamente
```

---

## 🔔 REGRA 7: Monitoramento Pós-Deploy

### Alertas Automáticos

```javascript
// Monitorar por 24h após deploy
window.postDeployMonitoring = {
  checkLoginFailures: () => {
    // Se > 10% de login failures, alert
    if (errorRate > 10%) {
      sendAlert('Critical: High login failure rate post-deploy');
      triggerRollback();
    }
  },
  
  checkPerformance: () => {
    // Se FCP > 3s, alert
    if (firstContentfulPaint > 3000) {
      sendAlert('Warning: Performance degradation post-deploy');
    }
  },
  
  checkErrorRate: () => {
    // Se > 1% errors, alert
    if (errorRate > 1%) {
      sendAlert('Alert: Error rate elevated post-deploy');
    }
  },
  
  interval: setInterval(() => {
    this.checkLoginFailures();
    this.checkPerformance();
    this.checkErrorRate();
  }, 60000) // A cada 1 minuto
};
```

---

## 🚨 REGRA 8: Escalação e Rollback

### Quando Fazer Rollback (IMEDIATO)

1. ❌ Mais de 5% de erros 500
2. ❌ Login não funciona para qualquer perfil
3. ❌ Menu não renderiza (branco)
4. ❌ Performance > 50% pior
5. ❌ Acesso a dados negado (erro de permissão)

### Procédimento de Rollback

```bash
# 1. Identifique versão anterior funcionando
git tag --list | sort -V | tail -2
# ex: v1.2.2, v1.2.3 ← v1.2.2 era OK

# 2. Rollback imediato
git revert --no-edit v1.2.3

# 3. Deploy versão anterior
./deploy.sh v1.2.2

# 4. Notifique time
slack_notify("#tech", "🚨 Rollback v1.2.3 → v1.2.2. Causa: [problema]")

# 5. Post-mortem
# Marcar meeting em 24h com tech lead, produto e ops
```

---

## 📊 REGRA 9: Separação de Ambientes

### Ambiente Local (Desenvolvedor)
```javascript
// localStorage.debug = true
// firebase.useEmulator('localhost', 5000)
// API fallback automático

Objetivo: Desenvolvimento rápido sem Firebase real
Risco: BAIXO (só código do desenvolvedor)
Regra: Nenhuma (liberdade total)
```

### Ambiente Test (Staging)
```
URL: https://test.conecta-rh.com.br
Firebase: test-project (dados de teste)
Usuários: QA + Product Owner

Regras:
✅ Deploy automático em cada merge para test-branch
❌ Sem dados reais de produção
❌ Sem acesso a usuários reais
✅ Testes completos OBRIGATÓRIOS

Release Cadence: Diária (ou contínua)
Aprovação: Apenas QA
```

### Ambiente Produção
```
URL: https://conecta-rh.com.br
Firebase: prod-project (dados reais)
Usuários: Todos os colaboradores (500+)

Regras:
❌ Deploy manual apenas (NUNCA automático)
✅ Aprovação de 3 pessoas (dev, qa, po)
✅ CHANGELOG.md atualizado
✅ Git tag criado
✅ Health check passou
✅ Backup feito

Release Cadence: 1x semana ou menos
Aprovação: Tech Lead + Product Owner + CTO
Janela: Terça-feira 14:00 UTC (avoid Friday/Weekend)
Rollback time: < 5 minutos
```

---

## 🔐 REGRA 10: Proteção contra Modificação Não Autorizada

### Arquivos Críticos Protegidos
```
js/modules/000-core-functions.js       (permissões)
js/modules/login-auth.js               (autenticação)
js/legacy/57-patch-...js               (menu)
index.html                             (estrutura)
```

### Implementação

```javascript
// Adicionar ao git pre-push hook
// Arquivo: .git/hooks/pre-push

#!/bin/bash
CRITICAL_FILES=(
  "js/modules/000-core-functions.js"
  "js/modules/login-auth.js"
  "js/legacy/57-patch-critico-navegacao-renderizacao.js"
  "index.html"
)

# Verificar se algum arquivo crítico foi modificado
for file in "${CRITICAL_FILES[@]}"; do
  if git diff origin/main...HEAD -- "$file" | grep -q "^[+-]"; then
    echo "⚠️  AVISO: Arquivo crítico foi modificado: $file"
    echo "   Isso será revisado com atenção especial"
    echo "   Você tem certeza? (s/n)"
    read -r response
    if [ "$response" != "s" ]; then
      exit 1
    fi
  fi
done

exit 0
```

### Branch Protection Rules (GitHub)

```yaml
# .github/rules/main.yml
branch_protection:
  branch: main
  required_status_checks:
    - tests
    - lint
    - build
  required_approving_reviews: 2
  require_code_owner_reviews: true
  restrict_who_can_push:
    - tech-leads
    - devops
  allow_force_pushes: false
  allow_deletions: false
```

---

## 🎯 Checklist de Estabilidade

### Antes de Commitar
- [ ] Código segue convenções do projeto
- [ ] Nenhuma função duplicada em 000-core-functions
- [ ] Nenhum setInterval novo (use MutationObserver)
- [ ] Nenhuma modificação em código comentado crítico
- [ ] Testes passando localmente

### Antes de Push
- [ ] Commit message segue template
- [ ] CHANGELOG.md atualizado
- [ ] Nenhuma modificação acidental em arquivos críticos
- [ ] Nenhum console.log() deixado no código

### Antes de Merge para Main
- [ ] 2 code reviews aprovados
- [ ] Testes automáticos passando
- [ ] Sem conflitos com main
- [ ] Documentação atualizada

### Antes de Deploy em Prod
- [ ] Aprovação de Tech Lead
- [ ] Aprovação de Product Owner
- [ ] Backup feito
- [ ] Health check passou
- [ ] Rollback plan preparado

---

## 📞 Contatos de Emergência

```
Problema: Login não funciona
→ Call: Tech Lead (Aline) + Firebase Engineer

Problema: Performance muito lenta
→ Call: Infrastructure + Frontend Lead

Problema: Dados corruptos
→ Call: DBA + Security Team + Product Owner

Problema: Segurança comprometida
→ Call: Security Officer + CTO + Product Owner
```

---

## 📋 Assinatura de Responsabilidade

```
Ao fazer deploy, você concorda que:
✅ Testou em 3 perfis (colab, gestor, rh)
✅ Verificou performance (CPU < 30%)
✅ Tem plano de rollback
✅ Todos os testes passaram
✅ Nenhum código crítico foi modificado sem revisar
✅ Está disposto a responder alertas por 24h

Assinado: _______________________ Data: ___/___/_____
```

