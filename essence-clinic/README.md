# Essence Clinic

Healthcare Management Platform - Gestão Completa de Clínicas e Procedimentos Estéticos

## 🏗️ Arquitetura

```
essence-clinic/
├── backend/           # Node.js + Express + TypeScript
├── web/              # React + TypeScript (Dashboard Web)
├── mobile/           # React Native (iOS/Android)
└── docs/             # Documentação
```

## 🚀 Stack Tecnológico

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Linguagem:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **Autenticação:** JWT
- **Validação:** Zod

### Web
- **Framework:** React 18+
- **Linguagem:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React Context + Hooks
- **Requisições:** Axios/Fetch

### Mobile
- **Framework:** React Native
- **Linguagem:** TypeScript
- **UI:** React Native + Custom Styling
- **Requisições:** Axios

## 📋 Pré-requisitos

- Node.js 18+ e npm/yarn
- Git
- Conta Supabase (gratuita)
- VS Code (recomendado)

## 🔧 Setup Inicial

### 1. Clone o repositório
```bash
git clone https://github.com/alinemazzucatto-stack/essence-clinic.git
cd essence-clinic
```

### 2. Setup Supabase
```bash
# Crie conta em https://supabase.com
# Copie SUPABASE_URL e SUPABASE_KEY de https://app.supabase.com/project/[seu-projeto]/settings/api
```

### 3. Backend
```bash
cd backend
cp .env.example .env
# Preencha SUPABASE_URL e SUPABASE_KEY
npm install
npm run dev
```

### 4. Web
```bash
cd ../web
npm install
npm run dev
```

### 5. Mobile (Opcional)
```bash
cd ../mobile
npm install
npm start
```

## 📚 Documentação

- [Backend Setup](./docs/backend.md)
- [Web Setup](./docs/web.md)
- [Mobile Setup](./docs/mobile.md)
- [Database Schema](./docs/database.md)
- [API Endpoints](./docs/api.md)

## 🔐 Segurança

- Autenticação JWT com refresh tokens
- Isolamento de dados por clínica (clinic_id)
- CORS configurado
- Validação de entrada com Zod
- Hasheamento de senhas com bcrypt

## 📝 Commits

```bash
git config user.email "alinelima364@outlook.com"
git config user.name "Aline Mazzucatto"
```

## 📅 Roadmap

- [x] Setup inicial do projeto
- [ ] Autenticação e login
- [ ] Dashboard web
- [ ] Calendário interativo
- [ ] App mobile
- [ ] Multi-tenancy
- [ ] Deploy produção

## 📧 Suporte

alinelima364@outlook.com

---

**Desenvolvido com ❤️ por Aline Mazzucatto**
