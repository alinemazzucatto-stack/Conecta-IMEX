#!/bin/bash

echo "
╔════════════════════════════════════════════════╗
║  🚀 ESSENCE CLINIC - SETUP COMPLETO            ║
║  Instalando dependências e criando tabelas...  ║
╚════════════════════════════════════════════════╝
"

# 1. Backend
echo ""
echo "📦 Instalando Backend..."
cd backend
npm install --silent
cd ..
echo "✅ Backend pronto!"

# 2. Web
echo ""
echo "📦 Instalando Web..."
cd web
npm install --silent
cd ..
echo "✅ Web pronto!"

# 3. Criar tabelas
echo ""
echo "🗄️  Criando tabelas no Supabase..."
node create-tables.js

echo ""
echo "╔════════════════════════════════════════════════╗
║  ✅ SETUP CONCLUÍDO!                            ║
╚════════════════════════════════════════════════╝

▶️  Para rodar o sistema, abra 2 TERMINAIS:

  Terminal 1 - BACKEND:
    cd backend
    npm run dev

  Terminal 2 - WEB:
    cd web
    npm run dev

  Depois: Abra http://localhost:3000

💡 Registre-se com um novo email e senha!
"
