# 🚀 Essence Clinic - Setup Completo

## 1️⃣ Setup Supabase (PostgreSQL na Nuvem)

### Criar Projeto Supabase

1. Acesse [https://supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Preencha:
   - **Project name:** `essence-clinic`
   - **Database password:** Guarde isso! (você vai precisar)
   - **Region:** Brazil (São Paulo)
4. Aguarde a criação (~1 min)

### Obter Credenciais

1. No dashboard, vá para **Settings → API**
2. Copie:
   - `Project URL` → Será seu `SUPABASE_URL`
   - `anon public` (em Project API keys) → Será seu `SUPABASE_KEY`

Exemplo:
```
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Criar Tabelas

1. Vá para **SQL Editor** no Supabase
2. Copie o conteúdo de `backend/sql/schema.sql`
3. Cole no SQL Editor e execute

Pronto! As tabelas estão criadas.

---

## 2️⃣ Setup Backend

### Instalação

```bash
cd backend
cp .env.example .env
# Edite .env e coloque suas credenciais Supabase
npm install
```

### Arquivo .env

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-aqui
JWT_SECRET=sua-chave-secreta-mudar-em-producao
JWT_REFRESH_SECRET=sua-chave-refresh-mudar-em-producao
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Rodar Backend

```bash
npm run dev
# Você verá:
# ╔════════════════════════════════╗
# ║  🏥 Essence Clinic - Backend   ║
# ║  🚀 Server running on port 3001║
# ║  📍 http://localhost:3001      ║
# ╚════════════════════════════════╝
```

**Teste:** Abra http://localhost:3001/health - deve retornar JSON com status ok

---

## 3️⃣ Setup Web (React)

### Instalação

```bash
cd web
npm install
```

### Arquivo .env

```env
VITE_API_URL=http://localhost:3001/api
```

### Rodar Frontend

```bash
npm run dev
# Abrirá em http://localhost:3000
```

---

## 4️⃣ Testar Login

### Criar primeiro usuário (Admin)

1. Na tela de login, clique em **"Registre-se"**
2. Preencha:
   - **Email:** seu@email.com
   - **Senha:** senhaSegura123
   - **Seu Nome:** Seu Nome
   - **Nome da Clínica:** Essence Clinic
3. Clique em **Registrar**

Pronto! Você será redirecionado para o dashboard

### Fazer Login

1. Volte para a tela de login
2. Digite suas credenciais
3. Clique em **Entrar**

---

## 5️⃣ Inicializar Git

```bash
cd essence-clinic
git init
git config user.email "alinelima364@outlook.com"
git config user.name "Aline Mazzucatto"
git add .
git commit -m "Initial commit: Essence Clinic setup"
git remote add origin https://github.com/alinemazzucatto-stack/essence-clinic.git
git branch -M main
git push -u origin main
```

---

## 📚 Próximas Etapas

- [ ] Implementar calendario interativo (arrastar da Conecta Essence)
- [ ] CRUD de profissionais
- [ ] CRUD de clientes
- [ ] Agendamentos com validação
- [ ] App Mobile (React Native)
- [ ] Multi-tenancy com clinic_id
- [ ] Deploy (Vercel + Railway/Heroku)

---

## 🆘 Troubleshooting

### Erro: "SUPABASE_URL is not defined"
- Verifique se o arquivo `.env` existe no backend
- Confirme que as variáveis estão preenchidas

### Erro: "CORS error"
- Verifique se o backend está rodando na porta 3001
- Confirme CORS_ORIGIN no `.env` é `http://localhost:3000`

### Erro: "Cannot find module"
- Execute `npm install` novamente
- Delete `node_modules` e `package-lock.json`
- Execute `npm install` de novo

---

## 💻 Comandos Úteis

### Backend
```bash
npm run dev      # Rodar em desenvolvimento
npm run build    # Compilar TypeScript
npm run start    # Rodar compilado
npm test         # Rodar testes
```

### Web
```bash
npm run dev      # Rodar em desenvolvimento
npm run build    # Compilar para produção
npm run preview  # Preview da build
npm run lint     # Verificar código
```

---

**Dúvidas?** Consulte a documentação em `docs/` ou acione suporte.
