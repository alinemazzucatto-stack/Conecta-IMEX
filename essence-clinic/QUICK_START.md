# ⚡ Quick Start - Essence Clinic em 5 Minutos

## 🎯 Objetivo
Setup automático do Supabase + Backend + Web

## ✅ Checklist Rápido

### 1️⃣ Criar Conta Supabase (2 min)

- [ ] Acesse https://supabase.com
- [ ] Clique "Sign Up" → Use seu email (alinelima364@outlook.com)
- [ ] Defina uma senha forte
- [ ] Confirme email
- [ ] Na dashboard, clique "New Project"
- [ ] Preencha:
  - **Name:** `essence-clinic`
  - **Password:** Guarde um print (você vai precisar depois)
  - **Region:** Brazil (São Paulo)
- [ ] Aguarde criação (~1 min)

### 2️⃣ Pegar Credenciais (1 min)

No dashboard do seu projeto Supabase:

- [ ] Clique em **Settings** (engrenagem no canto esquerdo)
- [ ] Vá para **API**
- [ ] Copie: **Project URL** 
  ```
  https://xxxxx.supabase.co
  ```
- [ ] Copie: **anon public** (em Project API keys)
  ```
  eyJhbGc...
  ```

**Cole essas 2 coisas em um bloco de notas temporário!**

### 3️⃣ Rodar Setup Automático (2 min)

Abra terminal na pasta `essence-clinic`:

```bash
node setup.js
```

O script vai:
1. ✅ Pedir suas 2 credenciais
2. ✅ Criar `.env` no backend
3. ✅ Criar `.env` no web
4. ✅ Criar tabelas no Supabase
5. ✅ Instalar dependências (npm install)

**É só apertar Enter e colar as credenciais!**

---

## 🚀 Depois: Rodar o Sistema

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Você verá:
```
🚀 Server running on port 3001
📍 http://localhost:3001
```

### Terminal 2 - Web
```bash
cd web
npm run dev
```
Navegador abrirá:
```
http://localhost:3000
```

---

## 🎯 Testar

1. Na tela de login, clique **"Registre-se"**
2. Preencha:
   - Email: seu@email.com
   - Senha: qualquerSenha123
   - Nome: Seu Nome
   - Clínica: Essence Clinic
3. Clique **Registrar**
4. ✅ Você verá o Dashboard!

---

## ❓ Dúvidas?

- **"Onde pego as credenciais?"** → Settings → API no Supabase
- **"Erro no setup?"** → Confirme se copiou correto URL + KEY
- **"Porta 3001/3000 ocupada?"** → Mude PORT no `.env`
- **"Dependências falharam?"** → Execute manualmente: `npm install` em backend/ e web/

---

## 📚 Depois de Setup

Você terá:
- ✅ Backend rodando (Node + Express + PostgreSQL)
- ✅ Web rodando (React + Dashboard)
- ✅ Autenticação funcional
- ✅ Banco de dados na nuvem

Próximo: Integrar o Calendário da Conecta Essence aqui! 🗓️

---

**Pronto? Crie a conta Supabase e avise quando tiver as credenciais!**
