# DEPENDENCIES - Mapeamento de Módulos

## 🔗 Grafo de Dependências

```
index.html
├── 000-core-functions.js ⭐ (NÚCLEO - sem dependências externas)
│   ├─→ Define: getRoleOrDefault()
│   ├─→ Define: isRH(), isGestor(), isColaborador()
│   ├─→ Define: forceView()
│   ├─→ Define: sbNav(), switchView()
│   └─→ Define: buildSidebar()
│
├── login-auth.js ⭐ (AUTENTICAÇÃO)
│   ├─→ Depends on: firebase (global)
│   ├─→ Depends on: window.role (de 000-core-functions)
│   ├─→ Depends on: sessionStorage (DOM API)
│   └─→ Exports: window.doLogin(), window.currentUserData
│
├── 000-fix-login-race-condition.js
│   ├─→ Depends on: window.currentUserData (de login-auth)
│   └─→ Depends on: sessionStorage (de login-auth)
│
├── 000-init-orchestrator.js
│   ├─→ Depends on: window.buildSidebar() (de 000-core-functions)
│   ├─→ Depends on: window.forceView() (de 000-core-functions)
│   └─→ Depends on: DOMContentLoaded (consolidated)
│
├── 57-patch-critico-navegacao-renderizacao.js ⭐ (MENU)
│   ├─→ Depends on: window.role (de 000-core-functions)
│   ├─→ Depends on: window.sbNav() (de 000-core-functions)
│   ├─→ Defines: COLAB_MENU, GESTOR_MENU, RH_MENU
│   ├─→ Defines: applyMenu() (sobrescreve window.applyMenu)
│   └─→ Defines: visualRole()
│
└── Módulos Específicos
    ├── intranet.js
    │   ├─→ Depends on: window.role
    │   ├─→ Depends on: window.isRH()
    │   ├─→ Depends on: firebase
    │   └─→ Depends on: window.sbNav()
    │
    ├── gamificacao.js
    │   ├─→ Depends on: window.role
    │   ├─→ Depends on: firebase
    │   └─→ Depends on: DOM (document.getElementById, etc.)
    │
    ├── pesquisas-fix-1.js ⚠️ (COMENTADO)
    │   ├─→ Depends on: window.role
    │   └─→ Depends on: setInterval (300ms - REMOVIDO)
    │
    ├── pesquisas-fix-2.js ⚠️ (COMENTADO)
    │   ├─→ Depends on: MutationObserver (REMOVIDO)
    │   └─→ Depends on: setInterval (1000ms - REMOVIDO)
    │
    └── ... outros módulos
```

---

## 📊 Matriz de Dependências

### Núcleo (Deve estar ANTES de tudo)
```
000-core-functions.js
  ↓
Nenhuma dependência externa
  ↓
Fundação para todo sistema de autenticação e navegação
```

### Autenticação (Deve estar DEPOIS do núcleo)
```
login-auth.js
  ↓
Depends: 000-core-functions.js
  ↓
Usada por: 000-fix-login-race-condition.js
```

### Menu & Navegação (Depois de auth)
```
57-patch-critico-navegacao-renderizacao.js
  ↓
Depends: 000-core-functions.js, login-auth.js
  ↓
Usado por: Todos os módulos que precisam navegar/menu
```

### Módulos de Negócio (Independentes, mas precisam do núcleo)
```
intranet.js, gamificacao.js, pesquisas.js, etc.
  ↓
Depends: 000-core-functions.js, firebase
  ↓
Podem ser carregados em qualquer ordem (exceto os comentados)
```

---

## 🔴 Dependências Perigosas (Detectadas)

### 1. Duplicação de `applyMenu()`
```
Problema: Duas definições em conflito
- 000-core-functions.js (versão simplificada)
- 57-patch-critico-navegacao-renderizacao.js (versão completa)

Solução: ✅ Remover versão simplificada, usar só a completa
Status: RESOLVIDO
```

### 2. Duplicação de `forceView()`
```
Problema: Duas versões fazendo coisas diferentes
- 000-core-functions.js (básica - apenas troca view)
- 57-patch... (completa - com controle de acesso)

Solução: ✅ Manter básica no núcleo, patches especializados
Status: RESOLVIDO
```

### 3. Listeners em Conflito
```
Problema: Dois onAuthStateChanged() rodando em paralelo
- login-auth.js (autenticação primária)
- 02-legacy.js (listener legado)

Solução: ✅ Flag __loginEmAndamento sincroniza os dois
Status: RESOLVIDO
```

### 4. SessionStorage vs. Window.role Inconsistência
```
Problema: window.role e sessionStorage.userRole podem divergir
- Código legado lê direto de sessionStorage
- Novo código usa window.role

Solução: ✅ Manter em sincronia em 000-core-functions
Status: RESOLVIDO
```

---

## 🟡 Dependências Frágeis (Atenção)

### 1. Firebase Global (`window.firebase`)
```
Localização: login-auth.js linha 52
Comportamento: Se firebase não está definido, fallback executa

Risco: MÉDIO
- Se Firebase é carregado DEPOIS de login-auth, falha
- Solução: Garantir firebase.js é incluído ANTES de login-auth

Recomendação: 
  <script src="https://www.gstatic.com/firebasejs/..."></script>
  <script src="js/modules/login-auth.js"></script>
```

### 2. DOM Ready Timing
```
Localização: 000-init-orchestrator.js
Comportamento: Aguarda DOMContentLoaded para inicializar

Risco: MÉDIO
- Se elementos críticos (loginScreen, appShell) não existem no HTML
- Solução: Validar que HTML tem IDs corretos antes de inicializar

Crítico:
  - loginScreen (id do form de login)
  - appShell (id do app shell após login)
  - lEmail, lPass, lBtn (inputs de login)
```

### 3. LocalStorage/SessionStorage Compartilhado
```
Localização: Vários arquivos (02-legacy.js, login-auth.js)
Comportamento: Múltiplos scripts escrevem em sessionStorage

Risco: ALTO
- Race conditions se múltiplas abas abertas
- Valores conflitantes de userRole
- Solução: 000-core-functions.js como Single Source of Truth

Problema específico:
  - 02-legacy.js limpa sessionStorage durante login
  - login-auth.js está tentando ler (race condition)
  - Solução: ✅ Flag __loginEmAndamento sincroniza
```

### 4. Role Casting String
```
Localização: Vários arquivos
Comportamento: .toLowerCase().trim() em window.role

Risco: BAIXO
- Se role for não-string (null/undefined), chamará toString()
- Solução: getRoleOrDefault() retorna sempre string

Proteção:
  var r = String((typeof role !== 'undefined' && role) ? role : 'colaborador')
```

---

## 🟢 Dependências Estáveis

### 1. Firebase SDK (Global)
```
Status: ESTÁVEL
- Usado corretamente com comTimeout() wrapper
- Fallback se Firebase cair
- Recomendação: Atualizar para Firebase v9+ (modular)
```

### 2. DOM APIs (document, window)
```
Status: ESTÁVEL
- Usado de forma padrão
- Sem dependência de bibliotecas (vanilla JS)
- Recomendação: Considerar jQuery/vanilla para seletores complexos
```

### 3. CSS Classes & IDs
```
Status: ESTÁVEL
- Nomes bem definidos (role-rh, view-pesquisas, sb-intranet)
- Mudanças raras
- Recomendação: Manter naming convention
```

---

## 📋 Checklist de Dependências

### Antes de Deploy
- [ ] Firebase carregado ANTES de login-auth.js
- [ ] 000-core-functions.js é PRIMEIRO script (000 prefix)
- [ ] HTML tem todos IDs críticos (loginScreen, appShell, etc.)
- [ ] Nenhuma definição duplicada de isRH(), roleAtual(), etc.
- [ ] sessionStorage e window.role em sincronia
- [ ] Nenhum setInterval ativo (exceto login fallback)

### Monitoramento Contínuo
- [ ] Verificar console por erros de "undefined function"
- [ ] Monitorar sessionStorage por valores inconsistentes
- [ ] Alertar se Firebase.js não carregar
- [ ] Verificar se legacy files (comentadas) não são descomentadas acidentalmente

### Atualizações Futuras
- [ ] Migrar para Firebase v9+ (modular)
- [ ] Usar TypeScript para type safety
- [ ] Implementar dependency injection
- [ ] Criar sistema de plugins para módulos
