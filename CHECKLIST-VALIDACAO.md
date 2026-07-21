# ✅ CHECKLIST DE VALIDAÇÃO PRÉ-MUDANÇA

## Use este checklist ANTES de eu fazer qualquer mudança no código

---

## 📋 PASSO 1: DIAGNÓSTICO

**Quando você pedir uma mudança, me faça responder:**

```
□ Qual arquivo vai mudar? _______________
□ Quais linhas exatamente? _______________
□ Mudança específica (copiar/colar): _______________
□ Por quê fazer essa mudança? _______________
□ Qual é o risco? (baixo/médio/alto)
```

**Exemplos de BOAS respostas:**
```
Arquivo: js/legacy/beneficios.js
Linhas: 156-158
Mudança: "Camiseta IMEX" → "Camiseta Conecta"
Por quê: Apenas texto visual, usuário pediu
Risco: BAIXO (comentário, sem impacto funcional)
```

---

## 📋 PASSO 2: VALIDAR DEPENDÊNCIAS

**Antes de mudar, verificar:**

```
□ Achei arquivo? (grep -r "nome_variavel" js/)
□ Quantas referências? _____ (se >50, é CRÍTICO)
□ Está em lista de "NÃO MEXER"? (PROTEÇÃO-ARQUITETURA.md)
□ Afeta sessionStorage keys? (userRole, userEmail, etc)
□ Requer reordenação de scripts? (index.html)
□ Toca em 02-legacy.js, 000-*.js, login-auth.js?
```

**Se responder "SIM" a qualquer coisa ⚠️:**
- Risco = **MÁXIMO**
- Preciso de aprovação explícita
- Vou propor alternativa mais segura

---

## 📋 PASSO 3: GREP DE IMPACTO

**Antes de mudar, vou rodar:**

```bash
# Procurar TODAS as referências
grep -r "nomeVariavel" js/ index.html --include="*.js" --include="*.html"

# Se encontrar em 02-legacy.js, 000-*.js, login-auth.js
# → RISCO CRÍTICO, precisa aprovação dupla
```

**Resultado esperado:**
- Se <10 referências → SEGURO
- Se 10-50 referências → CUIDADO, testar bem
- Se >50 referências → CRÍTICO, mínimas mudanças

---

## 📋 PASSO 4: PLANO DE MUDANÇA

**Vou mostrar passo a passo:**

```
PLANO:
1. Arquivo: [qual]
   Mudança: [de → para]
   Linhas: [número]
   Por quê: [razão]
   
2. Arquivo: [qual]
   Mudança: [de → para]
   ...

TESTES APÓS MUDANÇA:
□ Hard refresh (Ctrl+Shift+R)
□ Login como COLABORADOR
□ Login como GESTOR
□ Login como RH
□ Abrir GRH
□ Logout
□ Verificar console (F12) zero erros
```

**Você aprova ANTES de eu fazer**

---

## 🧪 PASSO 5: TESTES OBRIGATÓRIOS PÓS-MUDANÇA

**Depois de QUALQUER mudança:**

```
[ ] Limpar cache
    Ctrl+Shift+Delete → Limpar tudo → Reload

[ ] Hard refresh
    Ctrl+Shift+R (vai carregar tudo de novo)

[ ] Teste 1: Login COLABORADOR
    Email: colaborador@empresa.com (ou seu email de colab)
    [ ] Entra no sistema?
    [ ] Vai para painel de colaborador?
    [ ] "Meus Dados" abre?
    [ ] Pode clicar em "Meus Benefícios"?

[ ] Teste 2: Login GESTOR
    Email: gestor@empresa.com (ou seu email de gestor)
    [ ] Entra no sistema?
    [ ] Vai para painel de gestor?
    [ ] GRH abre?
    [ ] Pode ver "Seus Times"?

[ ] Teste 3: Login RH
    Email: rh@empresa.com (ou seu email de RH)
    [ ] Entra no sistema?
    [ ] Vai para painel de RH?
    [ ] "Gestão RH" abre?
    [ ] Todas as abas de GRH carregam?
    [ ] Pesquisas, DISC, PDI abrem?

[ ] Teste 4: Múltiplas abas
    [ ] Abre 2 abas do navegador
    [ ] Loga em tab 1 como RH
    [ ] Tab 2 detecta login?
    [ ] Faz logout em tab 1 → Tab 2 atualiza?

[ ] Teste 5: F12 Console
    F12 → Console tab
    [ ] ZERO erros (vermelho)
    [ ] Warnings (amarelo) OK, mas não relacionado a mudança?
    [ ] Procurar por "is not defined"?
    [ ] Procurar por "Cannot read property"?
    [ ] Procurar por "Firebase"?

[ ] Teste 6: Visual
    [ ] Logo está correto?
    [ ] Títulos aparecem corretos?
    [ ] Menu lateral funciona?
    [ ] Cores/CSS correto?
```

**Se QUALQUER teste falhar:**
- ❌ PARAR
- 🔄 REVERTER mudança
- 📞 Diagnosticar antes de tentar novamente

---

## 🚨 RED FLAGS - Se vir isto, CANCEL MUDANÇA

```
❌ "auth is not defined"
   → Ordem de carregamento quebrou
   → Reverter e diagnosticar

❌ "Firebase não inicializado"
   → Firebase CDN não carregou
   → Não é culpa da mudança, testar conexão

❌ "Cannot read property 'collection' of undefined"
   → db não foi definido
   → 02-legacy.js pode não ter rodado

❌ "Uncaught ReferenceError: [variável] is not defined"
   → Variável que foi renomeada/removida
   → Procurar outras referências e consertar

❌ Múltiplas abas desincronizadas
   → sessionStorage pode estar corrompida
   → Limpar localStorage + reload
```

---

## 📊 RISCO MATRIX

**Como eu vou classificar cada mudança:**

### **🟢 BAIXO RISCO** (Posso fazer direto)
- [ ] Muda apenas comentários
- [ ] Muda apenas CSS visual
- [ ] Adiciona novo arquivo (sem mudar ordem)
- [ ] Muda texto em HTML (não funcionalidade)
- [ ] <5 referências em código

**Testes**: Login + GRH

### **🟡 MÉDIO RISCO** (Preciso de aprovação)
- [ ] Muda nome de variável com 5-50 referências
- [ ] Toca em função que é chamada <20 vezes
- [ ] Adiciona novo sessionStorage key
- [ ] Muda CSS class names (testar visual)

**Testes**: Login (todos perfis) + GRH + Benefícios

### **🔴 MÁXIMO RISCO** (Preciso de aprovação dupla + teste profundo)
- [ ] Muda 02-legacy.js, 000-*.js, login-auth.js
- [ ] Reordena scripts em index.html
- [ ] Renomeia sessionStorage keys existentes
- [ ] Toca em função com >50 referências
- [ ] Muda autenticação, Firebase, navegação

**Testes**: TODOS os 6 testes completos + múltiplas abas + console limpo

---

## 💾 BACKUP ANTES DE TUDO

**Antes de fazer QUALQUER mudança:**

```bash
git status          # Ver o que mudou
git add .           # Staging de tudo
git commit -m "Antes de mudança X"  # Commit local
```

**Se quebrar:**
```bash
git reset --hard HEAD~1  # Reverter último commit
```

---

## 📞 TEMPLATE DE PEDIDO SEGURO

**Quando você pedir uma mudança, use este template:**

```
Pedido: [o que quer fazer]

Contexto: [por que precisa]

Arquivos a mudar:
1. [arquivo] - linhas [XX-YY]
   De: [texto antigo]
   Para: [texto novo]
   
2. [arquivo] - linhas [XX-YY]
   De: [texto antigo]
   Para: [texto novo]

Riscos que vejo:
- [risco 1]
- [risco 2]

Testes importantes:
- [teste 1]
- [teste 2]
```

---

## 🎯 EXEMPLO REAL: Mudança SEGURA

**Pedido do usuário:**
> "Mude o email de contato em Benefícios de 'ben@imex.com.br' para 'ben@empresa.com'"

**Meu diagnóstico:**
```
Arquivo: js/legacy/beneficios.js
Linhas: 156, 234, 445
Mudança: "ben@imex.com.br" → "ben@empresa.com"

Grep result: 3 referências total
Risco: BAIXO (apenas texto, sem lógica)

PLANO:
1. Abrir beneficios.js
2. Mudar linha 156: "ben@imex.com.br" → "ben@empresa.com"
3. Mudar linha 234: mesma coisa
4. Mudar linha 445: mesma coisa

TESTES:
□ Hard refresh
□ Login como Colaborador
□ Abrir "Meus Benefícios"
□ Verificar email de contato está correto
□ F12 Console zero erros
```

**Você aprova?** SIM → Faço

---

## 🎯 EXEMPLO REAL: Mudança PERIGOSA

**Pedido do usuário:**
> "Renomear 'imexRoleReal' para 'connRoleReal' em todo o código"

**Meu diagnóstico:**
```
PROBLEMA: 15+ sessionStorage keys usadas por 204+ verificações

Grep result:
- 02-legacy.js: 12 referências
- login-auth.js: 8 referências
- 000-core-functions.js: 3 referências
- Outros: 15+ arquivos

RISCO: MÁXIMO
- Cada referência que falta = parte do sistema quebra
- Falha silenciosa = usuario vê comportamento estranho
- Múltiplas abas podem desincronizar

ALTERNATIVA SEGURA:
1. Manter 'imexRoleReal' como é
2. Adicionar NOVO 'connRoleReal' 
3. Sincronizar ambas por 1 mês
4. Depois remover imexRoleReal

Isso vai levar tempo, mas é SEGURO
```

**Resultado**: Recuso mudança agressiva, propunho alternativa

---

## ✅ RESUMO

**Novo processo obrigatório:**

1. ✅ Você pede mudança
2. ✅ Eu faço diagnóstico (SEM fazer nada)
3. ✅ Você aprova ou pede mudança de plano
4. ✅ Eu faço mudança
5. ✅ Eu testo (todos os 6 testes)
6. ✅ Eu mostro evidência (screenshot, console clean)

**Resultado**: Mudanças seguras, sem surpresas desagradáveis 🛡️
