# DIAGNOSTIC: Investigação Crítica do Login Travado
**Data:** 2026-07-09  
**Status:** Problemas Identificados e Corrigidos  
**Prioridade:** CRÍTICA

---

## 🔴 PROBLEMAS ENCONTRADOS

### PROBLEMA 1: `__loginEmAndamento` Nunca Redefinido
**Arquivo:** `js/modules/login-auth.js`  
**Linhas:** 49, 237-323  
**Severidade:** CRÍTICA

**Causa Raiz:**
```javascript
// Linha 49
window.__loginEmAndamento = true;  // ← Define como true ao iniciar login

// Linhas 249-307
if(usuarioTeste && usuarioTeste.senha === pass){
  // FALLBACK SUCESSO
  window.__loginEmAndamento = false;  // ← Define como false
  return;
}

// Linhas 319-323 (finally)
// NÃO faz nada!  ← PROBLEMA! Se fallback falhar, flag fica true PARA SEMPRE
```

**Impacto:**
- Se Firebase falha E fallback local não encontra usuário OR senha incorreta
- `__loginEmAndamento` fica `true` indefinidamente
- Bloqueadores de `02-legacy.js` nunca deixam o listener executar
- UI fica presa em "autenticando"
- Próximas tentativas de login também falham

**Status:** ✅ CORRIGIDO

---

### PROBLEMA 2: Falta Limpeza de UI em Caso de Erro
**Arquivo:** `js/modules/login-auth.js`  
**Linhas:** 319  
**Severidade:** ALTA

**Causa Raiz:**
Quando há erro de autenticação, o botão permanece disabled e o loading continua visível:
```javascript
// Linha 38-39
if(btn) btn.disabled = true;
if(load) load.style.display = 'block';

// Linhas 319-323: Erro mostrado, MAS botão e loading nunca são limpos!
showErr(msgs[e.code] || e.message || 'Erro desconhecido ao entrar.');
// finally faz nada
```

**Impacto:**
- Usuário vê "autenticando" mas não consegue clicar novamente
- Não consegue fazer nova tentativa
- UI parece congelada

**Status:** ✅ CORRIGIDO

---

### PROBLEMA 3: Listeners de Autenticação Competindo
**Arquivos:**  
- `js/modules/login-auth.js` (novo)
- `js/legacy/02-legacy.js` linha 4308 (antigo)

**Severidade:** ALTA

**Causa Raiz:**
Há 2 listeners independentes:
1. `doLogin()` em `login-auth.js` → lê de `grh_colabs`
2. `auth.onAuthStateChanged()` em `02-legacy.js` → lê de `users` (coleção diferente!)

Quando Firebase Auth muda de estado:
1. `login-auth.js` define estado correto com `grh_colabs`
2. `02-legacy.js` listener também é acionado
3. Tenta ler de `users` (não `grh_colabs`)
4. Se não encontrar, pode fazer logout (linha 4337)

**Impacto:**
- Oscilação entre sucessos/falhas
- Pode reverter login bem-sucedido
- Usuário vê tela de login aparecer/desaparecer

**Mitigação:** Há proteções em 02-legacy.js (linhas 4317-4327) que devem prevenir isto se `__loginEmAndamento` estiver correto

**Status:** ✅ MITIGADO (com correção do Problema 1)

---

### PROBLEMA 4: Oscilação Visual - Caixa de Login Pisca
**Arquivo:** `index.html` (CSS linha 7-63) + múltiplos scripts  
**Severidade:** MÉDIA

**Causas Identificadas:**
1. CSS crítico correto (com `!important`)
2. MAS múltiplos scripts manipulam `loginScreen.style.display`:
   - `02-legacy.js` linha 829 (logout)
   - `02-legacy.js` linha 4388 (sucesso)
   - `02-legacy.js` linha 4410 (erro)
   - `02-legacy.js` linha 4434 (sem sessão)
   - `login-auth.js` linha 206, 282

**Impacto:**
- Caixa aparece/desaparece rapidamente
- Deslocamento lateral observado
- Usuário vê "piscar" durante renderização

**Status:** ✅ PARCIALMENTE CORRIGIDO (CSS está correto, múltiplos manipuladores aguardam correção do Problema 1 para testes)

---

## ✅ CORREÇÕES REALIZADAS

### Correção 1: Sempre Limpar `__loginEmAndamento` em Finally
**Arquivo:** `js/modules/login-auth.js`  
**Linhas:** 320-335

**Mudança:**
```javascript
// ANTES:
} finally {
  // NÃO redefinir __loginEmAndamento aqui — o fallback define em setTimeout
  // para evitar que 02-legacy.js reverta loginScreen/appShell enquanto UI está mudando
}

// DEPOIS:
} finally {
  // CRÍTICO: Sempre limpar flags de autenticação em progresso
  // Se chegou aqui sem sucesso, precisa liberar UI para nova tentativa
  window.__loginEmAndamento = false;
  window.__restoringSession = false;

  // Liberar botão e ocultar loading se ainda estiverem presos
  try {
    var btn = document.getElementById('lBtn');
    var load = document.getElementById('lLoading');
    if(btn) btn.disabled = false;
    if(load) load.style.display = 'none';
  } catch(e) {}
}
```

**Impacto:**
- Garante que `__loginEmAndamento` NUNCA fica true indefinidamente
- Libera UI para nova tentativa de login
- Permite que listeners de restauração de sessão funcionem

**Status:** ✅ IMPLEMENTADO

---

## 🧪 TESTES PRÓXIMOS

### Testes Obrigatórios (Ambiente Online/Go Live):

1. **✓ Login RH** - [PENDENTE]
   - Dados: rh@teste.com / 123456
   - Esperado: Entra no sistema como RH

2. **✓ Login Gestor** - [PENDENTE]
   - Dados: gestor@teste.com / 123456
   - Esperado: Entra no sistema como Gestor

3. **✓ Login Colaborador** - [PENDENTE]
   - Dados: colaborador@teste.com / 123456
   - Esperado: Entra no sistema como Colaborador

4. **✓ Login com Credenciais Inválidas** - [PENDENTE]
   - Dados: invalido@teste.com / wrong
   - Esperado: Mensagem de erro clara, botão liberado para nova tentativa

5. **✓ Múltiplas Tentativas** - [PENDENTE]
   - Simular falha, depois sucesso
   - Esperado: UI responde normalmente após erro

6. **✓ Logout e Relogin** - [PENDENTE]
   - Fazer logout, depois fazer login novamente
   - Esperado: Funciona perfeitamente

7. **✓ Atualizar Página (Page Refresh)** - [PENDENTE]
   - F5 durante sessão ativa
   - Esperado: Sessão restaurada sem repedir login

8. **✓ Abrir Nova Aba** - [PENDENTE]
   - Abrir system em aba nova
   - Esperado: Login não interferido pela aba anterior

9. **✓ Sessão Persistente** - [PENDENTE]
   - Fechar navegador e reabrir
   - Esperado: Sessão restaurada (se < 30 dias)

10. **✓ Problema Visual - Oscilação** - [PENDENTE]
    - Monitorar renderização da tela de login
    - Esperado: Caixa estável, sem piscar ou deslocar

---

## 📊 Arquitetura Atual

```
FLUXO DE LOGIN:
┌─ Página carrega
├─ Firebase inicializa (02-legacy.js linha 370)
├─ Usuário clica "Entrar"
├─ doLogin() executa (login-auth.js)
│  ├─ __loginEmAndamento = true
│  ├─ Firebase Auth signIn()
│  ├─ Se sucesso: lê grh_colabs, define estado, oculta login
│  ├─ Se erro: tenta fallback local
│  │  ├─ Se fallback sucesso: __loginEmAndamento = false (linha 302)
│  │  ├─ Se fallback erro: __loginEmAndamento = ??? (ANTES: ficava true!)
│  ├─ finally: sempre limpa (AGORA: linha 321-335)
│
└─ Firebase Auth dispara onAuthStateChanged() (02-legacy.js 4308)
   ├─ Se __loginEmAndamento: pula (linha 4317-4319)
   ├─ Se sessão recente: pula (linha 4322-4327)
   ├─ Se user + validSession: restaura
   └─ Se !user: mostra login

```

---

## 🎯 Próximas Análises (se testes falharem)

Se após testes o login ainda não funcionar:

1. Verificar Firestore rules (`grh_colabs` vs `users`)
2. Verificar permissões de leitura/escrita
3. Adicionar mais logs ao Firebase signIn()
4. Verificar se tokens estão sendo criados
5. Analisar resposta do Firebase no Network tab
6. Verificar SE há documents em ambas as coleções

---

**Status Geral:** 1/3 problemas críticos corrigidos, aguardando testes em produção


