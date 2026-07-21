# 🛡️ PROTEÇÃO DA ARQUITETURA - CONECTA RH

## ⚠️ ANTES DE FAZER QUALQUER MUDANÇA, LEIA ISTO

---

## 🔴 ARQUIVOS CRÍTICOS - NÃO MEXER SEM APROVAÇÃO

| Arquivo | Linhas | Por que? | Impacto da quebra |
|---------|--------|---------|---|
| `js/legacy/02-legacy.js` | 7,322 | Define auth, db, PERMISSIONS, renderizadores | App inteiro fica inutilizável |
| `js/modules/000-core-functions.js` | 209 | forceView(), sbNav(), grhTab() | Navegação quebra completamente |
| `js/modules/login-auth.js` | 518 | Autenticação, fallback, timeout | Login fica preso em "Autenticando..." |
| `js/modules/000-fix-login-race-condition.js` | 117 | Patcha race condition de auth | Dois listeners competindo = inconsistência |
| `js/modules/000-init-orchestrator.js` | 95 | Consolida 59 DOMContentLoaded listeners | DOM nunca fica pronto |
| `index.html` (linhas 75-543) | - | Ordem de scripts, Firebase CDN | Qualquer reordenação quebra tudo |

---

## 🔑 SESSIONSTORA GE KEYS - NUNCA RENOMEAR

**204+ verificações dependem desses nomes EXATOS:**

```
PROIBIDO RENOMEAR:
✗ userRole          ← 88+ verificações
✗ userEmail         ← 156+ verificações
✗ userName          ← 42+ verificações
✗ userPerfis        ← JSON parsing
✗ connPreferredRole ← Fallback de perfil
✗ connRoleReal      ← Papel "real"
✗ imexPreferredRole ← Compartilhado (02-legacy.js)
✗ imexRoleReal      ← Compartilhado (02-legacy.js)
```

**Se precisar de NEW keys**: 
- Adicionar SEM REMOVER as antigas
- Testar que verificações antigas ainda funcionam
- Verificar com grep: `grep -r "userRole\|userEmail" js/`

---

## 🔗 DEPENDÊNCIAS CRÍTICAS - CUIDADO EXTREMO

### **Race Condition de Autenticação (ATIVA)**

```javascript
// Ordem EXATA em index.html:
<script src="js/legacy/02-legacy.js"></script>              ← Define auth, db, listener
<script src="js/modules/login-auth.js"></script>            ← Usa auth para login
<script src="js/modules/000-fix-login-race-condition.js"></script> ← Patcha listener
```

**❌ NÃO REORDENE ESSES 3 ARQUIVOS**

Se Firebase CDN falhar:
- auth fica undefined
- login-auth.js line 61 falha
- Tela de login trava por 12 segundos

### **SessionStorage Sincronização Entre Abas**

```
Tab 1: Loga como 'rh', sessionStorage = {userRole: 'rh'}
Tab 2: Abre em paralelo, tenta restaurar sessão
  ↓
Tab 2 limpa sessionStorage (logout)
  ↓
Tab 1 lê getRoleOrDefault() → sessionStorage.userRole vazio
  ↓
Retorna fallback 'colaborador' → Acesso RH NEGADO
```

**⚠️ Se modificar sessionStorage cleanup**: Testar múltiplas abas abertas

---

## 🚨 PONTOS DE FALHA TOTAL (3)

Se QUALQUER UM desses falhar, app é inutilizável:

### **1. Firebase CDN não carregar**
```
Sintoma: Login fica "Autenticando..." por 12s, depois erro
Checklist:
  ✓ Verificar F12 Console por CSP errors
  ✓ Verificar Network tab por 403/blocked-by-client
  ✓ Verificar firewall/proxy está deixando firebase.googleapis.com passar
```

### **2. 000-init-orchestrator.js falhar**
```
Sintoma: Elementos não aparecem, múltiplos DOMContentLoaded listeners rodam
Checklist:
  ✓ Verificar console por "Orchestrator" messages
  ✓ Verificar que Document.prototype.addEventListener foi monkey-patched
```

### **3. MutationObservers em loop (Firebase indisponível)**
```
Sintoma: Console cheio de retry messages, UI travada
Checklist:
  ✓ Verificar Firestore está respondendo (Network tab)
  ✓ Verificar que db.collection() chama estão resolvendo
```

---

## ✅ COMO FAZER MUDANÇAS SEGURAS

### **PASSO 1: Diagnóstico Transparente**
Antes de tocar em qualquer arquivo:
```
Claude diz:
"Vou modificar [arquivo]
 Linha: [número]
 Mudança: [EXATO O QUE VAI MUDAR]
 Por quê: [motivo]
 Risco: [baixo/médio/alto]"
```

**Usuário aprova antes de tudo**

### **PASSO 2: Grep de Impacto**
Não mexer em arquivo sem saber:
```bash
# Verificar todas as referências
grep -r "nomeVariavel" js/ index.html --include="*.js" --include="*.html"
```

### **PASSO 3: Testar Isolado**
Fazer mudança em arquivo com baixa dependência:
```
✅ SEGURO: Comentário, CSS puro, novo arquivo
⚠️ CUIDADO: sessionStorage key, função global, ordem de script
❌ PROIBIDO: 02-legacy.js, 000-*.js, index.html reordenação
```

### **PASSO 4: Validação Pós-Mudança**
Depois de QUALQUER mudança:
```javascript
// Rodar no Console (F12):
1. Limpar cache: Ctrl+Shift+Delete
2. Reload: Ctrl+Shift+R
3. Testar:
   - Login com cada perfil (colab, gestor, rh)
   - Abrir GRH
   - Abrir Benefícios
   - Logout
   - Verificar console por ERROS
```

---

## 📋 ANTES DE FAZER FIND & REPLACE GLOBAL

**❌ NUNCA faça:**
```bash
grep -r "imex" js/ | grep -i "imex" | sed 's/imex/conecta-rh/g'
```

**Essa abordagem quebrou tudo última vez!**

### **✅ SEGURO:**
1. Identificar EXATAMENTE quais 15 arquivos
2. Para CADA arquivo:
   - Mostrar mudanças específicas
   - Você aprova
   - Testar ESSE arquivo
3. Só depois fazer próximo

---

## 🧪 TESTES OBRIGATÓRIOS APÓS QUALQUER MUDANÇA

```
[ ] Limpar cache (Ctrl+Shift+Delete)
[ ] Hard refresh (Ctrl+Shift+R)
[ ] Login com email de COLABORADOR
    [ ] Painel de colaborador carrega?
    [ ] Pode acessar "Meus Dados"?
[ ] Login com email de GESTOR
    [ ] Pode ver seus times?
    [ ] GRH abre?
[ ] Login com email de RH
    [ ] Gestão RH abre?
    [ ] Benefícios carregam?
    [ ] Todos os módulos (Pesquisas, DISC, PDI, etc) abrem?
[ ] Logout funciona?
[ ] Abrir 2 abas em paralelo
    [ ] Logout em tab 1 → Tab 2 detecta?
    [ ] Não ficam desincronizadas?
[ ] F12 Console
    [ ] Zero ERROS (warnings OK)
    [ ] Nenhuma mensagem "is not defined"
    [ ] Nenhuma "Cannot read property 'collection' of undefined"
```

**Se QUALQUER teste falhar → REVERTER + diagnosticar**

---

## 🗂️ ARQUIVOS SEGUROS PARA MODIFICAR

Estes arquivos têm baixo impacto (bom lugar para começar):

```
✅ BAIXO RISCO:
   - js/modules/conecta-ai.js
   - js/modules/grh-beneficios-pdf.js
   - css/styles.css (apenas visual)
   - Novos arquivos (se não quebrem ordem de carregamento)

⚠️ MÉDIO RISCO:
   - js/legacy/03-legacy.js (pesquisas, DISC)
   - js/legacy/50-patch-*.js
   - js/legacy/51-patch-*.js
   - Mudanças em função com <10 chamadas

❌ MÁXIMO RISCO:
   - Qualquer coisa em lista de "NÃO MEXER SEM APROVAÇÃO"
```

---

## 📞 PROCESSO NOVO OBRIGATÓRIO

**Daqui em diante:**

1. **Usuário pede mudança** → Ex: "Mude 'IMEX' para 'Conecta' em X"

2. **Claude diagnostica** (SEM FAZER NADA):
   ```
   Achei:
   - Arquivo A, linhas 15-30 (referência visual)
   - Arquivo B, linhas 452 (sessionStorage key) ← RISCO
   - Arquivo C, linhas 890 (comentário)
   
   Vou fazer:
   1. [mudança específica]
   2. [mudança específica]
   3. [mudança específica]
   
   Riscos:
   - Arquivo B pode quebrar login
   ```

3. **Usuário aprova** → "Tá bom, mas cuidado com B"

4. **Claude faz mudança** OU **recusa se risco for alto**

5. **Claude testa** (F12 console, login, navegação)

6. **Claude mostra evidência** (screenshot, console clean, etc)

---

## 🔐 PROTEÇÃO CONTRA REGRESSÃO

```
NUNCA mais vamos fazer:
❌ Find & replace massivo sem verificação
❌ Reordeneação de scripts sem testar
❌ Mudanças em 02-legacy.js sem diálogo
❌ Deploy sem testes pós-mudança

SEMPRE vamos fazer:
✅ Diagnóstico → Aprovação → Mudança → Validação
✅ Testar isolado antes de globalizar
✅ Manter backup (git commit regular)
✅ Documentar mudanças (commit messages claras)
```

---

## 📞 RESUMO

**Sistema é viável, MAS frágil.**

Temos agora:
1. ✅ Versão perfeita restaurada (684548d)
2. ✅ Auditoria profunda que explica por que quebrou
3. ✅ Este documento de proteção

**Próximas mudanças SERÃO SEGURAS porque:**
- Diagnóstico transparente ANTES de agir
- Você aprova tudo ANTES
- Testes obrigatórios DEPOIS
- Documentação clara do risco

**Você está seguro agora. 🛡️**
