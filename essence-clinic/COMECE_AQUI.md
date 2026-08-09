# 🚀 ESSENCE CLINIC - COMECE AQUI

## ✅ O que foi configurado

- ✅ Supabase criado e conectado
- ✅ Backend (.env preenchido)
- ✅ Web (.env preenchido)
- ✅ Credenciais Supabase salvas

## 🎯 Próximo Passo: Rodar o Sistema

### Opção 1: Comando Único (Recomendado)

Abra o terminal na pasta `essence-clinic`:

```bash
bash start.sh
```

Isso vai:
1. ✅ Instalar dependências do backend
2. ✅ Instalar dependências do web
3. ✅ Criar todas as tabelas no Supabase
4. ✅ Mostrar instruções finais

### Opção 2: Manual (Passo a Passo)

#### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
```

Você verá:
```
🏥 Essence Clinic - Backend
🚀 Server running on port 3001
📍 http://localhost:3001
```

#### Terminal 2 - Web
```bash
cd web
npm install
npm run dev
```

Navegador abrirá automaticamente `http://localhost:3000`

---

## 📝 Testar Login

1. Na tela de login, clique **"Registre-se"**
2. Preencha:
   ```
   Email: seu@email.com
   Senha: SenhaQualquer123
   Nome: Seu Nome
   Clínica: Essence Clinic
   ```
3. Clique **"Registrar"**
4. ✅ Você verá o Dashboard!

---

## 🐛 Troubleshooting

### Erro: "Module not found"
```bash
cd backend && npm install
cd ../web && npm install
```

### Erro: "Port 3001 already in use"
Mude em `backend/.env`:
```env
PORT=3002
```

### Erro: "Cannot connect to Supabase"
Verifique se `.env` tem as credenciais corretas:
```bash
cat backend/.env
```

### Tabelas não foram criadas?
Vá manualmente ao Supabase:
1. SQL Editor
2. Cole conteúdo de `backend/sql/schema.sql`
3. Execute

---

## 📊 Estrutura Criada

```
essence-clinic/
├── backend/          ← Node.js + Express + PostgreSQL
├── web/              ← React + TypeScript + Tailwind
├── docs/             ← Documentação
└── .env files        ← Credenciais (NÃO commitr!)
```

---

## 🎯 Próximos Passos

- [ ] Rodar o sistema (backend + web)
- [ ] Testar login e registrar usuário
- [ ] Integrar Calendário Interativo da Conecta Essence
- [ ] Adicionar CRUD de profissionais e clientes
- [ ] Testar agendamentos
- [ ] Deploy na nuvem (Vercel + Railway)

---

## 💡 Dicas

✅ **Sempre abra 2 terminais** - um para backend, outro para web

✅ **Frontend e backend rodam em paralelo** - não fecha nenhum dos 2

✅ **Mudanças no código?** - Ambos têm hot reload (recarrega automático)

✅ **Credenciais são secretas** - Nunca commita `.env` no Git

---

## 🚀 Vamos Começar!

Execute em uma janela de terminal na pasta `essence-clinic`:

```bash
bash start.sh
```

Ou manualmente:

**Terminal 1:**
```bash
cd backend && npm install && npm run dev
```

**Terminal 2:**
```bash
cd web && npm install && npm run dev
```

---

**Sucesso! 🎉 Seu Essence Clinic está pronto para usar!**

Dúvidas? Confira `docs/SETUP.md` ou `QUICK_START.md`
