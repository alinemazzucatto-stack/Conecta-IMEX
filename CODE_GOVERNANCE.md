# CODE GOVERNANCE - Governança de Desenvolvimento

**Versão:** 1.0  
**Efetivo:** 2026-07-09  
**Mandatório:** SIM - Todos os commits após esta data devem cumprir

---

## 🎯 Princípio Fundamental

> **ESTABILIDADE PRIMEIRO, FUNCIONALIDADE DEPOIS**

Nenhuma nova funcionalidade pode ser implementada até que:
1. ✅ Sistema atual esteja livre de bugs críticos
2. ✅ Código legado esteja limpo e consolidado
3. ✅ Testes automatizados cubram fluxos críticos
4. ✅ Documentação esteja completa e atualizada
5. ✅ Nenhum módulo quebre devido à mudança

---

## 📝 REGRA 1: Registro Obrigatório de Alterações

### Commit Message Template (OBRIGATÓRIO)

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Componentes

#### 1. Type (Obrigatório)
```
feat      : Nova funcionalidade
fix       : Correção de bug
refactor  : Reorganização de código (sem mudança de comportamento)
cleanup   : Remoção de código morto
docs      : Mudança em documentação
perf      : Melhoria de performance
test      : Adição/mudança de teste
chore     : Atualização de dependências/config
```

#### 2. Scope (Obrigatório)
```
login         : Módulo de autenticação
menu          : Sistema de menu/navegação
pesquisas     : Módulo de pesquisas
beneficios    : Módulo de benefícios
etc.          : Nome do módulo afetado
```

#### 3. Subject (Obrigatório)
- Máximo 60 caracteres
- Imperativo ("add", "fix", "refactor")
- Sem ponto final
- Português ou Inglês (seja consistente)

#### 4. Body (Obrigatório para mudanças > 10 linhas)
```
Explicar POR QUÊ a mudança é necessária, não O QUÊ foi mudado

Seções esperadas:
- Problem: O que estava quebrado
- Solution: Como foi resolvido
- Impact: Como afeta o sistema
- Testing: Como foi validado
```

#### 5. Footer (Obrigatório para issues)
```
Fixes #123
Fixes #456, #789

Breaking Change: Descrição do que quebra
Deprecation: O que será removido em breve
Co-Authored-By: Nome <email@example.com>
```

### Exemplo Válido
```
fix(login): respect loginRole selection in fallback authentication

Problem: Fallback authentication was ignoring window.loginRole and using 
the hardcoded perfil from test users array instead.

Solution: Added logic to check window.loginRole and connPreferredRole 
before falling back to usuarioTeste.perfil.

Impact: Gestor users can now login with correct role when Firebase fails.
Previously they would login as 'colaborador' because of hardcoded test 
user profile.

Testing:
- Tested Gestor login with Firebase down
- Verified sessionStorage shows userRole=gestor
- Verified menu shows 10 items (not 5)
- Verified access to Pesquisas allowed

Fixes #456
Co-Authored-By: Aline Mazzucatto <aline@empresa.com>
```

### Exemplo Inválido ❌
```
fix bug                        ❌ Muito vago
Fix: alteração                 ❌ Sem escopo
fixed login stuff              ❌ Sem tipo adequado
Update files                   ❌ Sem descrição clara
```

---

## 📚 REGRA 2: Histórico de Versões

### Versionamento Semântico

```
v1.2.3-prod
│  │  │
│  │  └─ PATCH (1.2.0 → 1.2.1)
│  │     - Bugfix menor
│  │     - Performance tweak
│  │     - Segurança trivial
│  │
│  └────── MINOR (1.0.0 → 1.1.0)
│          - Nova feature
│          - Refactor sem breaking change
│          - Novo módulo
│
└───────── MAJOR (0.0.0 → 1.0.0)
           - Breaking change
           - Rewrite de módulo
           - Mudança de API
```

### Release Tag Template

```bash
git tag -a v1.2.3 -m "
Release v1.2.3 - 2026-07-10

## Resumo
Resolve oscilação de login e menu incompleto para Gestor

## Commits Inclusos
- 8e7d3bf: Fix fallback auth
- 4266b44: Fix menu duplicate
- 4fc9a34: Fix pesquisas access

## Breaking Changes
NENHUMA

## Deprecations
NENHUMA

## Performance
- CPU: -60% em idle (30+ timers removidos)
- Memory: -5% (código morto removido)
- Bundle: -20KB minified

## Testing
✅ Colaborador: login, menu, acesso negado
✅ Gestor: login, menu completo, acesso pesquisas
✅ RH: login, menu rh, acesso total
✅ Mobile: responsivo 375px
✅ Desktop: responsivo 1280px

## Rollback Plan
git revert v1.2.3 (< 5 min)
firebase.useEmulator() for local testing

## Author: Aline Mazzucatto
## Approver: Tech Lead
## Date: 2026-07-10
"

git push origin tag v1.2.3
```

### Arquivo RELEASES.md (Automático)

```markdown
# Releases - Conecta RH

## [1.2.3] - 2026-07-10

### Fixed
- Fallback authentication now respects loginRole selection
- Menu for Gestor showing complete 10 items (was truncated to 5)
- Pesquisas access allowed for Gestor (was denied)

### Performance
- CPU reduced 60-80% by removing 30+ setInterval
- Bundle size reduced 20KB by removing dead code

### Testing
- ✅ 3/3 profiles validated (Colaborador, Gestor, RH)
- ✅ Mobile and Desktop responsive
- ✅ Zero regressions detected

---

## [1.2.2] - 2026-07-08
...
```

---

## ❌ REGRA 3: Proibição de Alterações Sem Teste

### Validação Pré-Commit (Git Hook)

```bash
#!/bin/bash
# File: .git/hooks/pre-commit

echo "🔍 Validando commit..."

# 1. Verificar se tem testes
if git diff --staged --name-only | grep -v "\.test\." | grep -E "\.(js|ts)$"; then
  if ! git diff --staged --name-only | grep -q "\.test\.\|\.spec\."; then
    echo "❌ ERRO: Mudança em código sem arquivo de teste correspondente"
    echo "   Esperado: app.js → app.test.js"
    echo "   Solução: npm test -- --coverage"
    exit 1
  fi
fi

# 2. Verificar se rorou testes localmente
if [ -f ".env" ] && grep -q "TEST_MODE=true" ".env"; then
  if ! npm test 2>/dev/null | grep -q "PASS"; then
    echo "❌ ERRO: Testes falhando"
    echo "   Execute: npm test"
    exit 1
  fi
fi

# 3. Verificar formatação
if ! npm run lint 2>/dev/null; then
  echo "❌ ERRO: Código não passa em linter"
  echo "   Execute: npm run lint:fix"
  exit 1
fi

# 4. Verificar se commit message segue template
COMMIT_MSG=$(git diff --cached --diff-filter=M --name-only | head -1)
if ! echo "$COMMIT_MSG" | grep -E "^(feat|fix|refactor|cleanup|docs|perf|test|chore)\(.+\):"; then
  echo "❌ ERRO: Commit message não segue template"
  echo "   Esperado: feat(scope): description"
  echo "   Leia: CODE_GOVERNANCE.md"
  exit 1
fi

echo "✅ Validações passaram! Commit permitido."
exit 0
```

### Testes Obrigatórios (Matriz)

```javascript
// Deve existir arquivo .test.js para cada novo arquivo

describe('Login Module', () => {
  // Testes de unidade
  it('should parse loginRole correctly', () => {});
  it('should handle Firebase timeout', () => {});
  it('should fallback to local auth', () => {});
});

describe('Menu Module', () => {
  // Testes de integração
  it('should show correct items for Colaborador', () => {});
  it('should show correct items for Gestor', () => {});
  it('should show correct items for RH', () => {});
});
```

---

## 📌 REGRA 4: Padronização de Nomes

### Funções (camelCase)
```javascript
// ✅ BOM
function getUserRole() { }
function fetchDataFromFirebase() { }
function validateEmail(email) { }
function applyMenuPermissions() { }

// ❌ RUIM
function get_user_role() { }
function GETUSERROLE() { }
function getRole() { }  // Vago
function stuff() { }    // Sem significado
```

### Classes (PascalCase)
```javascript
// ✅ BOM
class UserAuthentication { }
class MenuRenderer { }
class DatabaseConnection { }

// ❌ RUIM
class userAuthentication { }
class user_authentication { }
class Auth { }  // Muito vago
```

### Constantes (UPPER_SNAKE_CASE)
```javascript
// ✅ BOM
const MAX_LOGIN_ATTEMPTS = 3;
const FIREBASE_TIMEOUT_MS = 5000;
const MENU_ITEMS_PER_PAGE = 20;
const ROLES = ['colaborador', 'gestor', 'rh'];

// ❌ RUIM
const maxLoginAttempts = 3;
const MAX_ATTEMPTS = 3;  // Vago
const x = 3;             // Sem significado
```

### Módulos (kebab-case em arquivo, camelCase em import)
```javascript
// Arquivo: js/modules/user-authentication.js
// ✅ BOM
import { userAuthentication } from './user-authentication.js';
import { fetchUserData } from './user-data.js';

// ❌ RUIM
import { UserAuthentication } from './UserAuthentication.js';
import { fetch_user_data } from './fetch_user_data.js';
```

### IDs de Card/Menu (kebab-case)
```html
<!-- ✅ BOM -->
<div id="sb-pesquisas" class="menu-item">Pesquisas</div>
<div id="view-gestao-rh" class="page">Gestão RH</div>
<button id="btn-logout">Sair</button>

<!-- ❌ RUIM -->
<div id="sbPesquisas"></div>
<div id="view_gestao_rh"></div>
<button id="logoutBtn"></button>
```

### Rotas/URLs (kebab-case)
```javascript
// ✅ BOM
'/pesquisas'
'/gestao-rh'
'/estrutura-carreira'
'/meu-desenvolvimento'

// ❌ RUIM
'/pesquisa'
'/gestaoRh'
'/estrutura_carreira'
```

---

## 🧩 REGRA 5: Organização de Código por Blocos

### Estrutura de Arquivo

```javascript
// ============================================================================
// MÓDULO: User Authentication
// ============================================================================
// Responsabilidade: Gerenciar autenticação de usuários (Firebase + Fallback)
// Última mudança: 2026-07-09 (8e7d3bf)
// Testes: login-auth.test.js
// ============================================================================

// ──────────────────────────────────────────────────────────────────────────
// SEÇÃO 1: IMPORTS & CONFIGURAÇÃO
// ──────────────────────────────────────────────────────────────────────────

const FIREBASE_TIMEOUT_MS = 5000;
const MAX_LOGIN_RETRIES = 3;
const USUARIOS_TESTE_FALLBACK = [ /* ... */ ];

// ──────────────────────────────────────────────────────────────────────────
// SEÇÃO 2: HELPERS PRIVADOS
// ──────────────────────────────────────────────────────────────────────────

function comTimeout(promise, ms) {
  /* Implementação */
}

function validateEmail(email) {
  /* Implementação */
}

// ──────────────────────────────────────────────────────────────────────────
// SEÇÃO 3: API PÚBLICA (window.*)
// ──────────────────────────────────────────────────────────────────────────

window.doLogin = async function(email, password) {
  /* Implementação */
};

window.doLogout = function() {
  /* Implementação */
};

// ──────────────────────────────────────────────────────────────────────────
// SEÇÃO 4: EVENT LISTENERS
// ──────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  /* Inicialização */
});

// ──────────────────────────────────────────────────────────────────────────
// SEÇÃO 5: INICIALIZAÇÃO
// ──────────────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.__loginModule = {
    version: '1.0.0',
    loaded: true,
    initialized: false
  };
}
```

---

## 🧹 REGRA 6: Remoção de Funções Soltas/Duplicadas

### Antes de Commitar

```bash
# 1. Procurar por funções não usadas
npm run test:coverage
# Se função tem 0% coverage, é candidata a remoção

# 2. Procurar por duplicatas
grep -r "function isRH" js/
# Se aparece em 5+ arquivos, consolidar em uma

# 3. Procurar por código morto
npm run analyze:deadcode
# Se arquivo não é importado de nenhum lugar
```

### Checklist

```
Antes de remover função:
- [ ] Procurou em TODO o projeto por referências (grep -r)
- [ ] Procurou por comentários que mencionar a função
- [ ] Verificou arquivo de teste (.test.js)
- [ ] Verificou imports/exports
- [ ] Verificou em git log se foi adicionada recentemente
- [ ] Se foi importante, moveu para DEPRECATED_FUNCTIONS.js com data
- [ ] Criou commit descrevendo remoção

Exemplo:
git commit -m "cleanup(auth): remove unused getLoginAttempts function

Function was last used in commit abc1234 (2026-01-01).
Not referenced anywhere in current codebase.
Coverage: 0%
This cleanup removes 45 lines of dead code.
"
```

---

## 💬 REGRA 7: Comentários Técnicos (Apenas Quando Necessário)

### Quando NÃO Comentar

```javascript
// ❌ RUIM - Óbvio demais
// Incrementar contador
counter++;

// ❌ RUIM - Duplica o código
// Validar email
if (email.includes('@')) { }

// ❌ RUIM - Desatualizado
// TODO: Fixar isso depois (foi escrito em 2020!)
```

### Quando Comentar

```javascript
// ✅ BOM - Explicar POR QUÊ (restrição não óbvia)
// Firebase Auth timeout é 5s porque temos 3 retry automático.
// Se mais curto, falha em rede lenta (3G rural).
const FIREBASE_TIMEOUT_MS = 5000;

// ✅ BOM - Explicar trade-off ou decisão arquitetural
// Usando sessionStorage em vez de localStorage porque:
// - Dados não persistem entre abas (isolamento de sessão)
// - Menor tamanho (localStorage é mais lento)
// - Limpo automaticamente ao fechar browser
const userRole = sessionStorage.getItem('userRole');

// ✅ BOM - Explicar workaround para bug específico
// Guard contra race condition que ocorre quando:
// 1. Usuario faz login rapidamente
// 2. onAuthStateChanged() de legacy.js limpa sessionStorage
// 3. login-auth.js tenta usar sessionStorage vazio
// Solução: Flag __loginEmAndamento sincroniza os dois listeners
if (!window.__loginEmAndamento) {
  sessionStorage.clear();
}

// ✅ BOM - Explicar limite ou restrição técnica
// Máximo 100 colaboradores por página porque:
// - Firestore tem limite de 1MB por documento
// - JSON serializado é ~10KB por usuário
// - 100 usuários = ~1MB (limite atingido)
const MAX_USERS_PER_PAGE = 100;
```

---

## 🎨 REGRA 8: Padrão Visual Único

### Cores (CSS Variables)

```css
:root {
  /* Cores Primárias */
  --color-primary: #2C5F9D;      /* Azul empresa */
  --color-secondary: #1B9E6F;    /* Verde */
  --color-accent: #FF6B6B;       /* Vermelho alerta */
  --color-warning: #FFA500;      /* Laranja aviso */
  --color-success: #4CAF50;      /* Verde sucesso */
  
  /* Escala de Cinza */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-text-disabled: #999999;
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F5F5F5;
  --color-border: #DDDDDD;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-family: 'Segoe UI', Roboto, sans-serif;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
}

/* USO:
✅ BOM
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
}

❌ RUIM
.button {
  background-color: #2C5F9D;
  padding: 16px;
}
*/
```

### Componentes Padrão

```html
<!-- BUTTON PADRÃO -->
<button class="btn btn-primary">Entrar</button>
<button class="btn btn-secondary">Cancelar</button>
<button class="btn btn-danger">Sair</button>

<!-- CARD PADRÃO -->
<div class="card">
  <div class="card-header">Título</div>
  <div class="card-body">Conteúdo</div>
  <div class="card-footer">Ações</div>
</div>

<!-- FORMULÁRIO PADRÃO -->
<form class="form">
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" class="input">
    <span class="error">Mensagem de erro</span>
  </div>
</form>

<!-- ALERTA PADRÃO -->
<div class="alert alert-info">ℹ️ Informação</div>
<div class="alert alert-success">✅ Sucesso</div>
<div class="alert alert-warning">⚠️ Aviso</div>
<div class="alert alert-error">❌ Erro</div>
```

---

## 📱 REGRA 9: Validação Obrigatória (Desktop + Mobile)

### Antes de Deploy

```bash
# 1. DESKTOP - Testes em 1280x800
npm run test:visual:desktop
[ ] Login page renderiza corretamente
[ ] Menu sidebar cabe sem scroll
[ ] Tabelas não ficam muito largas

# 2. MOBILE - Testes em 375x812
npm run test:visual:mobile
[ ] Login page responsivo (campos empilhados)
[ ] Menu hamburger funciona
[ ] Tabelas com scroll horizontal

# 3. TABLET - Testes em 768x1024
npm run test:visual:tablet
[ ] Layout intermediário funciona
[ ] Toque funciona (não mouse hover)

# Checklis de Responsividade
[ ] Sem scroll horizontal em mobile
[ ] Texto legível (min 12px)
[ ] Botões com min 44x44px
[ ] Inputs com min 44px altura
[ ] Sem elementos que quebram em width < 375px
```

---

## 🧪 REGRA 10: Testes Críticos Obrigatórios

### Teste 1: Login Flow
```javascript
describe('Login Critical Path', () => {
  it('Colaborador should login without oscillation', async () => {
    // 1. Seleciona perfil
    // 2. Preenche email/senha
    // 3. Clica entrar
    // 4. Verifica sem piscadas de tela
    // 5. Verifica menu correto
  });
  
  it('Gestor should show complete menu with Pesquisas', async () => {
    // 1. Login como Gestor
    // 2. Verifica 10 itens no menu
    // 3. Verifica Pesquisas está visível
    // 4. Clica Pesquisas (não redireciona)
  });
  
  it('RH should have full access', async () => {
    // 1. Login como RH
    // 2. Verifica Gestão RH acessível
    // 3. Verifica Dashboard acessível
    // 4. Verifica Pesquisas acessível
  });
});
```

### Teste 2: Page Refresh
```javascript
describe('Page Refresh Resilience', () => {
  it('should maintain login state after F5', async () => {
    // 1. Login como Colaborador
    // 2. Navegatr para Intranet
    // 3. Pressiona F5
    // 4. Verifica ainda logado
    // 5. Verifica ainda na Intranet (não volta login)
  });
  
  it('should restore role after refresh', async () => {
    // 1. Login como Gestor
    // 2. Refresh
    // 3. Verifica sessionStorage.userRole = 'gestor'
    // 4. Verifica window.role = 'gestor'
  });
});
```

### Teste 3: Role Switch
```javascript
describe('Profile Switching', () => {
  it('should switch roles cleanly', async () => {
    // 1. Login como Colaborador
    // 2. Logout
    // 3. Login como Gestor
    // 4. Verifica menu Gestor (não menu Colaborador)
    // 5. Verifica sessionStorage limpo corretamente
  });
  
  it('should not retain data from previous profile', async () => {
    // 1. Login Colaborador, anota dados
    // 2. Logout
    // 3. Login Gestor
    // 4. Verifica dados diferentes
  });
});
```

---

## 📊 REGRA 11: Relatório Antes/Depois

### Obrigatório em Toda Release

```markdown
# Release Report v1.2.3

## Resumo da Release

**Data:** 2026-07-10  
**Commits:** 4 (8e7d3bf, 4266b44, 4fc9a34, 1331e14)  
**Linha adicionadas:** 2500+ docs, 3 fixes, 0 features  
**Status:** ✅ Pronto para Produção

## Métricas de Impacto

| Métrica | Antes | Depois | Delta |
|---------|-------|--------|-------|
| CPU (idle) | 45% | 12% | -73% ✅ |
| Login tempo | 2-3s (piscava) | 1-2s (estável) | -50% ✅ |
| Menu items (Gestor) | 5 (truncado) | 10 (completo) | +100% ✅ |
| Duplicatas função | 45+ | 0 | -100% ✅ |
| Código morto (linhas) | 117 | 0 | -100% ✅ |
| Erros 404 | 2 | 0 | -100% ✅ |
| Documentação | 0 | 2500+ linhas | +∞ ✅ |

## Testes Validados

- ✅ Login: Colaborador (sem oscilação)
- ✅ Login: Gestor (menu completo + Pesquisas)
- ✅ Login: RH (acesso total)
- ✅ Page Refresh: Mantém estado
- ✅ Profile Switch: Limpo e seguro
- ✅ Mobile 375px: Responsivo
- ✅ Desktop 1280px: Layout correto
- ✅ Performance: < 30% CPU

## Problemas Conhecidos

- NONE - Sistema limpo

## Pronto para Produção?

✅ SIM - Confiança 95%
```

---

## 📋 REGRA 12: Pendências (Futuro vs Urgente)

### Arquivo TECHNICAL_DEBT.md

```markdown
# Technical Debt & Roadmap

## 🔴 URGENTES (Próximas 3 semanas)

### 1. Remover Código Legado Comentado [8h work]
- Status: ⏳ TODO
- Blocker: Remover arquivos: 02-legacy.js, 03-legacy.js, etc.
- Risk: BAIXO (código comentado é seguro remover)
- Benefit: Reduz confusão, 10KB em bundle
- Owner: @dev-team
- Deadline: 2026-07-31

### 2. Implementar Jest [40h work]
- Status: ⏳ TODO
- Tarefas:
  - [ ] Setup Jest + Testing Library (4h)
  - [ ] Login tests (8h)
  - [ ] Menu tests (8h)
  - [ ] Access control tests (8h)
  - [ ] Integration tests (12h)
- Benefit: CI/CD automation, zero regressions
- Owner: @qa-team
- Deadline: 2026-08-30

### 3. Melhorar Firebase Fallback [16h work]
- Status: ⏳ TODO
- Tarefas:
  - [ ] Implementar IndexedDB (4h)
  - [ ] Retry automático 3x (4h)
  - [ ] Sync queue offline (8h)
- Benefit: Funciona mesmo sem internet
- Owner: @backend-dev
- Deadline: 2026-08-15

---

## 🟠 ALTOS (Próximos 1-2 meses)

### 4. Sentry Integration [12h work]
- Implementar logging centralizado
- Alerts automáticos
- Dashboard de monitoramento

### 5. TypeScript Migration [100h work]
- Converter código-chave para TS
- Tipos críticos primeiro (User, Role, View)
- Gradual, não requer rewrite completo

### 6. Paginação & Cache [20h work]
- Implementar paginação para listas
- TanStack Query para cache
- Suportar 1000+ colaboradores

---

## 🟡 MÉDIOS (2-3 meses)

### 7. CI/CD Pipeline
### 8. API Versionamento
### 9. Backup Automático

---

## 🟢 BAIXOS (3-6 meses)

### 10. Dark Mode
### 11. Internationalization (i18n)
### 12. PWA Support
```

---

## ⛔ REGRA FINAL: Barreira de Qualidade

### Nenhuma Mudança Pode:

```
❌ Quebrar módulos existentes
   → Validar contra TEST_CHECKLIST.md

❌ Duplicar dados
   → Procurar por queryKey duplicada em cache
   → Procurar por listeners duplicados

❌ Alterar permissões sem autorização
   → Revisar 000-core-functions.js forceView()
   → Revisar PERMISSIONS object em 02-legacy.js
   → Testar 3 perfis antes de submeter

❌ Restaurar versões antigas
   → Procurar por código comentado sendo descomentarizado
   → Procurar por setInterval/MutationObserver ressurgindo
   → Procurar por USUARIOS_TESTE_FALLBACK sendo alterado

❌ Ignorar governo (governance)
   → Commit message inválido = rejeitar
   → Sem teste = rejeitar
   → Sem documentação = rejeitar
   → Falha em validação = rejeitar
```

---

## ✅ Assinatura de Conformidade

Ao fazer commit após 2026-07-09, você concorda:

```
✅ Commit message segue template (type(scope): description)
✅ Body explica POR QUÊ (não O QUÊ)
✅ Testes criados e passando (npm test)
✅ Código passa em linter (npm run lint)
✅ Nenhuma função duplicada adicionada
✅ Comentários apenas onde necessário
✅ Nomes seguem padrão (camelCase, snake_case, etc)
✅ Código organizado em blocos com headers
✅ Validado em desktop (1280px) e mobile (375px)
✅ Testes críticos executados (login, refresh, switch role)
✅ Relatório antes/depois se aplicável
✅ Documentação atualizada
✅ Nenhum módulo existente quebrou
✅ Nenhuma duplicação de dados
✅ Nenhuma alteração de permissão não autorizada
✅ Nenhuma restauração de versão antiga

Assinado (eletronicamente): ________________
Data: 2026-__-__
```

---

## 🚨 Violações

Se violar governança:

```
1ª vez: Aviso e rejeição de PR (sem merge)
2ª vez: Código review obrigatório em toda futura mudança
3ª vez: Suspension de access a main branch (1 semana)
4ª vez: Escalação para tech lead

Objetivo NÃO é punir, é MANTER ESTABILIDADE.
```

**Aprovado por:** Aline Mazzucatto  
**Data:** 2026-07-09  
**Efetivo:** IMEDIATAMENTE para todos os commits

