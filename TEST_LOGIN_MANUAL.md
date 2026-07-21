# TESTE MANUAL - Login em Ambiente Online (Go Live)

**Data de Teste:** 2026-07-09  
**Ambiente:** Online (Produção)  
**Tester:** [Você]

---

## 📋 Pré-requisitos

- [ ] Sistema online/deployed
- [ ] Console do navegador aberto (F12)
- [ ] Network tab aberta
- [ ] Dados de teste preparados

---

## 🧪 TESTE 1: Login com Dados Inválidos

**Objetivo:** Verificar se erro é mostrado corretamente e UI é liberada

**Passos:**
1. Abrir sistema em navegador
2. Preencher Email: `invalido@teste.com`
3. Preencher Senha: `wrong123`
4. Clicar "Entrar"
5. Aguardar resposta

**Verificações:**
- [ ] Mensagem de erro aparece claramente
- [ ] Botão "Entrar" fica HABILITADO após erro
- [ ] Loading spinner desaparece
- [ ] Console não mostra erros críticos
- [ ] Pode tentar novamente imediatamente
- [ ] `__loginEmAndamento` == false (verificar em console: `window.__loginEmAndamento`)

**Resultado:**
- [ ] SUCESSO
- [ ] FALHA

**Observações:**
_____________________________________

---

## 🧪 TESTE 2: Login com Credenciais de Teste (RH)

**Objetivo:** Verificar se login de RH funciona completamente

**Passos:**
1. Preencher Email: `rh@teste.com`
2. Preencher Senha: `123456`
3. Clicar "Entrar"
4. Aguardar carregamento

**Verificações:**
- [ ] Tela de login desaparece
- [ ] Tela de app/dashboard aparece
- [ ] Menu lateral carrega com opções de RH
- [ ] Profile indicator mostra "RH" (🏢)
- [ ] Nenhuma oscilação visual na tela de login
- [ ] Console não mostra erros críticos
- [ ] Networkmostra sucesso Firebase Auth
- [ ] Dados de sessão em sessionStorage:
  - [ ] `userRole` = `rh`
  - [ ] `userEmail` = `rh@teste.com`
  - [ ] `userName` está preenchido

**Resultado:**
- [ ] SUCESSO
- [ ] FALHA

**Tempo de entrada:** _____ segundos

**Observações:**
_____________________________________

---

## 🧪 TESTE 3: Login com Credenciais de Teste (Gestor)

**Objetivo:** Verificar se login de Gestor funciona

**Passos:**
1. Logout (if necesário)
2. Email: `gestor@teste.com`
3. Senha: `123456`
4. Clicar "Entrar"

**Verificações:**
- [ ] Tela de login desaparece
- [ ] Dashboard Gestor carrega
- [ ] Profile mostra "Gestor" (👔)
- [ ] Perfil correto em sessionStorage

**Resultado:**
- [ ] SUCESSO
- [ ] FALHA

**Observações:**
_____________________________________

---

## 🧪 TESTE 4: Login com Credenciais de Teste (Colaborador)

**Objetivo:** Verificar se login de Colaborador funciona

**Passos:**
1. Logout
2. Email: `colaborador@teste.com`
3. Senha: `123456`
4. Clicar "Entrar"

**Verificações:**
- [ ] Dashboard Colaborador carrega
- [ ] Profile mostra "Colaborador" (👤)
- [ ] Acesso limitado (não pode ver Gestão RH)

**Resultado:**
- [ ] SUCESSO
- [ ] FALHA

**Observações:**
_____________________________________

---

## 🧪 TESTE 5: Logout e Relogin

**Objetivo:** Verificar se logout limpa corretamente e novo login funciona

**Passos:**
1. Estar logado (qualquer perfil)
2. Clicar em Logout
3. Aguardar retorno para tela de login
4. Fazer novo login (perfil diferente)

**Verificações:**
- [ ] Logout limpa sessionStorage
- [ ] Tela de login aparece
- [ ] Novo login carrega corretamente
- [ ] Novo perfil não é do login anterior

**Resultado:**
- [ ] SUCESSO
- [ ] FALHA

**Observações:**
_____________________________________

---

## 🧪 TESTE 6: Page Refresh (F5)

**Objetivo:** Verificar se sessão é restaurada corretamente

**Passos:**
1. Fazer login (qualquer perfil)
2. Aguardar carregamento completo
3. Pressionar F5 (refresh)
4. Aguardar página recarregar

**Verificações:**
- [ ] Página recarrega
- [ ] Sessão é restaurada (não pede login novamente)
- [ ] Mesmo perfil mantido
- [ ] Dashboard carrega corretamente
- [ ] Nenhuma oscilação visual

**Resultado:**
- [ ] SUCESSO
- [ ] FALHA

**Tempo de restauração:** _____ segundos

**Observações:**
_____________________________________

---

## 🧪 TESTE 7: Abrir Nova Aba

**Objetivo:** Verificar se sistema funciona com múltiplas abas

**Passos:**
1. Estar logado na aba 1
2. Abrir aba 2 (Ctrl+T)
3. Ir para o sistema na aba 2
4. Sistema deve restaurar sessão automaticamente

**Verificações:**
- [ ] Aba 2 restaura sessão
- [ ] Ambas abas funcionam simultaneamente
- [ ] Logout em uma aba afeta a outra

**Resultado:**
- [ ] SUCESSO
- [ ] FALHA

**Observações:**
_____________________________________

---

## 🧪 TESTE 8: Fechar e Reabrir Navegador

**Objetivo:** Verificar persistência de sessão

**Passos:**
1. Fazer login
2. Fechar navegador completamente
3. Reabrir navegador
4. Ir para o sistema

**Verificações:**
- [ ] Sessão é restaurada (se < 30 dias)
- [ ] OU tela de login aparece (se sessão expirou)
- [ ] Sem erros críticos

**Resultado:**
- [ ] SUCESSO (restaurou)
- [ ] SUCESSO (pediu login)
- [ ] FALHA

**Observações:**
_____________________________________

---

## 🧪 TESTE 9: Problema Visual - Oscilação da Caixa de Login

**Objetivo:** Verificar se caixa de login é estável

**Passos:**
1. Abrir sistema no navegador (não logado)
2. Observar muito bem a tela de login durante carregamento
3. Procurar por qualquer movimento/piscada

**Verificações:**
- [ ] Caixa de login aparece na posição CORRETA desde o inicio
- [ ] Nenhuma piscada ou piscar
- [ ] Nenhum deslocamento lateral
- [ ] Nenhuma oscilação visual
- [ ] Layout é ESTÁVEL ao carregar

**Resultado:**
- [ ] SUCESSO (sem problemas visuais)
- [ ] FALHA (ainda pisca/desloca)

**Descrição do Problema (se houver):**
_____________________________________

---

## 🧪 TESTE 10: Monitorar Console Durante Login

**Objetivo:** Verificar se há erros silenciosos

**Passos:**
1. Abrir Console (F12)
2. Fazer login
3. Observar console enquanto autentica

**Verificações:**
- [ ] Logs com `[login]` aparecem
- [ ] Nenhum `Uncaught Error`
- [ ] Nenhum `Cannot read property`
- [ ] Nenhum `undefined is not a function`
- [ ] Firebase Auth responde corretamente
- [ ] Timeouts aparecem corretamente

**Resultado:**
- [ ] SEM ERROS
- [ ] COM ERROS (descrever)

**Erros encontrados:**
_____________________________________

---

## 📊 Resumo de Testes

| Teste | Status | Tempo | Observações |
|-------|--------|-------|-------------|
| 1 - Dados Inválidos | [ ] ✓ [ ] ✗ | __ seg | _____________ |
| 2 - Login RH | [ ] ✓ [ ] ✗ | __ seg | _____________ |
| 3 - Login Gestor | [ ] ✓ [ ] ✗ | __ seg | _____________ |
| 4 - Login Colaborador | [ ] ✓ [ ] ✗ | __ seg | _____________ |
| 5 - Logout/Relogin | [ ] ✓ [ ] ✗ | __ seg | _____________ |
| 6 - Page Refresh | [ ] ✓ [ ] ✗ | __ seg | _____________ |
| 7 - Nova Aba | [ ] ✓ [ ] ✗ | __ seg | _____________ |
| 8 - Fechar/Reabrir | [ ] ✓ [ ] ✗ | __ seg | _____________ |
| 9 - Oscilação Visual | [ ] ✓ [ ] ✗ | N/A | _____________ |
| 10 - Console Errors | [ ] ✓ [ ] ✗ | N/A | _____________ |

---

## ✅ RESULTADO FINAL

**Total de Testes:** 10  
**Sucessos:** _____ / 10  
**Falhas:** _____ / 10  

### Login Funciona? 
- [ ] **SIM** - Sistema pronto para produção
- [ ] **PARCIALMENTE** - Alguns problemas, mas crítico resolvido
- [ ] **NÃO** - Problema persiste, investigação adicional necessária

### Problemas Restantes (se houver):
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Próximas Ações:
- [ ] Documentar erros encontrados
- [ ] Investigação adicional se necessário
- [ ] Implementar mais correções
- [ ] Deploy em produção (se sucesso)

---

**Testado por:** ___________________  
**Data:** ___________________  
**Assinatura:** ___________________


