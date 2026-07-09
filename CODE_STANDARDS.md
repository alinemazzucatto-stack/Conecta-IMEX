# CODE STANDARDS - Padrões de Código

**Versão:** 1.0  
**Vinculado:** CODE_GOVERNANCE.md  
**Status:** OBRIGATÓRIO

---

## 📐 Padronização por Aspecto

### 1. FUNÇÕES

#### Nomenclatura
```javascript
// ✅ Verbo + Substantivo (getUserData, fetchFromAPI, validateInput)
// ✅ Privadas: prefixo underscore (_internalHelper)
// ✅ Async: nenhum prefixo especial (async function getName)
// ❌ Sem prefixo get_ (use getData não get_data)
// ❌ Muito curta (use getUserRole não getRole)
```

#### Tamanho
```javascript
// ✅ < 50 linhas (quebrar em funções menores)
// ❌ > 100 linhas (evidence of bad design)

function doLogin() {
  // MAX 50 linhas
}
```

#### Parâmetros
```javascript
// ✅ Máximo 3 parâmetros
function updateUser(userId, data, options) { }

// ❌ Usar objeto se mais de 3
function updateUser(userId, firstName, lastName, email, phone, address) { } // RUIM

// ✅ Melhor
function updateUser(userId, updates) { }
```

#### Retorno
```javascript
// ✅ Sempre retorna algo (mesmo que undefined)
function validate(email) {
  if (!email) return false;
  return true;
}

// ❌ Sem retorno unclear
function process(data) {
  // ??? o que retorna?
}
```

---

### 2. VARIÁVEIS

#### Escopo
```javascript
// ✅ Const por padrão
const role = 'gestor';

// ✅ Let se muda valor
let counter = 0;
counter++;

// ❌ Var (evitar completamente)
var oldStyle = true;
```

#### Nomes
```javascript
// ✅ Descritivo e específico
const maxLoginAttempts = 3;
const userEmail = 'user@example.com';
const isAuthenticated = true;

// ❌ Vago
const max = 3;
const email = 'user@example.com';  // Qual email?
const auth = true;                  // Autenticado aonde?
```

#### Booleans
```javascript
// ✅ is/has prefix
const isLogged = true;
const hasPermission = false;
const isValid = true;

// ❌ Sem prefixo
const logged = true;
const permission = false;
```

---

### 3. CONSTANTES

```javascript
// ✅ UPPER_SNAKE_CASE
const FIREBASE_TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;
const MENU_ITEMS = ['pesquisas', 'beneficios'];

// ✅ Groupadas no topo
const ROLES = {
  ADMIN: 'rh',
  MANAGER: 'gestor',
  USER: 'colaborador'
};

// ❌ Espalhadas no código
const x = 5000;
const y = 3;
```

---

### 4. CLASSES

```javascript
// ✅ PascalCase
class UserAuthentication {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
  
  // Métodos privados com _
  _validate() {
    //...
  }
  
  // Métodos públicos
  authenticate() {
    return this._validate();
  }
}

// ❌ camelCase
class userAuthentication { }
```

---

### 5. MÓDULOS

#### Arquivo
```
// ✅ kebab-case
js/modules/user-authentication.js
js/modules/menu-renderer.js

// ❌ camelCase ou snake_case
js/modules/userAuthentication.js
js/modules/user_authentication.js
```

#### Exports
```javascript
// ✅ Named exports (mais específico)
export function getUserData() { }
export const MAX_USERS = 100;

// ✅ Default export só para classe principal
export default class UserService { }

// ❌ Tudo default export (confuso)
export default { getUserData, MAX_USERS }
```

#### Imports
```javascript
// ✅ Específico
import { getUserData } from './user-data.js';

// ✅ Padrão quando precisa tudo
import * as UserService from './user-service.js';
UserService.getData();

// ❌ Vago
import stuff from './user-data.js';
```

---

### 6. IDS DE ELEMENTO

```html
<!-- ✅ kebab-case -->
<div id="sb-pesquisas"></div>
<div id="view-gestao-rh"></div>
<button id="btn-logout"></button>

<!-- ✅ Prefixo significativo -->
<!-- sb- = sidebar, btn- = button, view- = page view -->

<!-- ❌ Sem padrão -->
<div id="sidebar-item-1"></div>
<div id="MainView"></div>
<button id="logoutBtn"></button>
```

---

### 7. CSS CLASSES

```html
<!-- ✅ BEM Methodology -->
<div class="card">
  <div class="card__header"></div>
  <div class="card__body"></div>
  <div class="card__footer"></div>
  <div class="card__footer--active"></div>
</div>

<!-- ✅ Utility classes -->
<div class="flex gap-md padding-lg"></div>

<!-- ❌ Sem padrão -->
<div class="big-box"></div>
<div class="content_area"></div>
```

---

### 8. ROTAS/PATHS

```javascript
// ✅ kebab-case, descritivo
'/pesquisas'
'/gestao-rh'
'/estrutura-carreira'
'/meu-desenvolvimento'

// ✅ Com prefixo de escopo
'/admin/usuarios'
'/user/perfil'
'/gestor/relatorios'

// ❌ Sem padrão
'/pesquisa'
'/Pesquisas'
'/pesquisasInternas'
'/pesquisas_internas'
```

---

### 9. DADOS/TIPOS

```javascript
// ✅ TypeScript - type PascalCase
type User = {
  id: string;
  email: string;
  role: 'admin' | 'gestor' | 'colaborador';
};

// ✅ Interface PascalCase
interface IUserService {
  getUser(id: string): Promise<User>;
}

// ❌ Sem tipos
const user = {};  // Qual é a estrutura?
```

---

## 🎨 Padrão Visual

### Cores (Usar CSS Variables SEMPRE)

```css
:root {
  --color-primary: #2C5F9D;
  --color-success: #4CAF50;
  --color-error: #F44336;
  --color-warning: #FF9800;
  --color-text: #1a1a1a;
  --color-border: #ddd;
}

/* ✅ BOM */
.button-primary {
  background-color: var(--color-primary);
}

/* ❌ RUIM */
.button-primary {
  background-color: #2C5F9D;
}
```

### Spacing (Usar escala 8px)

```css
:root {
  --spacing-xs: 4px;   /* 1/2 unit */
  --spacing-sm: 8px;   /* 1 unit */
  --spacing-md: 16px;  /* 2 units */
  --spacing-lg: 24px;  /* 3 units */
  --spacing-xl: 32px;  /* 4 units */
  --spacing-2xl: 48px; /* 6 units */
}

/* ✅ BOM */
.card {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

/* ❌ RUIM */
.card {
  padding: 15px;
  margin-bottom: 25px;
}
```

### Typography (Escala 8px + 16px base)

```css
:root {
  --font-size-sm: 12px;   /* -25% from base */
  --font-size-base: 14px; /* Base */
  --font-size-lg: 16px;   /* +14% from base */
  --font-size-xl: 20px;   /* +43% from base */
  --font-size-2xl: 24px;  /* +71% from base */
}

/* ✅ BOM */
.text-lg {
  font-size: var(--font-size-lg);
  line-height: 1.5;
}

/* ❌ RUIM */
.text-lg {
  font-size: 18px;
  line-height: 27px;
}
```

---

## 📦 Estrutura de Arquivo

```
js/
├── modules/
│   ├── 000-core-functions.js          ⭐ NÚCLEO
│   ├── login-auth.js                  ⭐ AUTH
│   ├── user-data.js
│   ├── menu-renderer.js
│   └── user-data.test.js              Testes junto
│
├── legacy/
│   ├── 57-patch-critico...js         ⭐ MENU
│   └── [comentados]
│
└── utils/
    ├── validators.js
    ├── formatters.js
    └── api-helpers.js
```

---

## ✅ Checklist Pre-Commit

```
Antes de fazer commit, verificar:

[ ] Função tem máximo 50 linhas?
[ ] Nomes seguem padrão (camelCase funcs, UPPER_SNAKE const)?
[ ] Sem `var` (apenas const/let)?
[ ] Sem números mágicos (tudo é constante)?
[ ] Arquivo < 300 linhas (quebrar se maior)?
[ ] Testes criados (.test.js)?
[ ] Comentário apenas onde necessário (POR QUÊ)?
[ ] Sem código comentado (deletar, não comentar)?
[ ] Sem console.log() de debug?
[ ] Sem TODO sem data/owner?
[ ] Valida em mobile (375px) e desktop (1280px)?
[ ] Passou em npm run lint?
[ ] Passou em npm test?
```

---

## Aprovação: Aline Mazzucatto (2026-07-09)
