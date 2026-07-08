# 🔐 COMO FAZER LOGIN

## ⚠️ PASSO 1: LIMPE O CACHE COMPLETAMENTE

**Pressione:** `Ctrl + Shift + Delete`

- Selecione: "Todos os tempos"
- Clique: "Limpar dados"

**OU:**

Abra DevTools (F12) → Settings → Desmarque "Disable cache (while DevTools is open)" → Feche DevTools

**OU:**

Feche o navegador **COMPLETAMENTE** (todas as abas) e abra novamente.

---

## ✅ PASSO 2: FAÇA LOGIN COM ESTES DADOS

Use **EXATAMENTE** um destes 4 emails:

```
📧 Email: colaborador@teste.com    Perfil: Colaborador
📧 Email: gestor@teste.com         Perfil: Gestor
📧 Email: rh@teste.com             Perfil: RH
📧 Email: admin@teste.com          Perfil: RH/Admin
```

**Senha para TODOS:** `123456`

---

## 🚀 PASSO 3: PRESSIONE ENTRAR

Clique no botão **"ENTRAR →"**

Se funcionar → Você entra no dashboard
Se não → Veja abaixo

---

## 🔍 SE NÃO ENTRAR

1. Abra o Console (F12)
2. Cole este comando:
```javascript
console.log('userRole:', sessionStorage.getItem('userRole'), 'email:', sessionStorage.getItem('userEmail'));
```
3. Aperte Enter
4. Copie o resultado e me envie

---

## ✨ O QUE FOI CORRIGIDO

✅ Login com fallback local quando Firebase falha
✅ Suporta maiúsculas/minúsculas no email
✅ Sem oscilação visual após login
✅ Sem erros de "Cannot redefine property"

---

**Tente agora com `colaborador@teste.com` / `123456`**

Se ainda não funcionar → Abra F12, Cole no console e me envie o resultado.
