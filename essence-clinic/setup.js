#!/usr/bin/env node

/**
 * 🚀 Essence Clinic - Setup Automático
 *
 * Como usar:
 * 1. Copie suas credenciais Supabase
 * 2. Execute: node setup.js
 * 3. Responda as perguntas
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function main() {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 ESSENCE CLINIC - SETUP AUTOMÁTICO ║
║                                        ║
║   Este script vai configurar:         ║
║   ✓ Backend (.env)                    ║
║   ✓ Web (.env)                        ║
║   ✓ Criar tabelas no Supabase         ║
╚════════════════════════════════════════╝
  `);

  try {
    // 1. Coletar credenciais
    console.log('\n📋 PASSO 1: Credenciais Supabase');
    console.log('   (Vá em https://supabase.com → Seu Projeto → Settings → API)\n');

    const supabaseUrl = await ask('   URL do Supabase (ex: https://xxx.supabase.co): ');
    const supabaseKey = await ask('   Anon Key (ex: eyJhbGc...): ');

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Credenciais inválidas!');
      process.exit(1);
    }

    // 2. Gerar JWT Secret
    const jwtSecret = require('crypto').randomBytes(32).toString('hex');
    const jwtRefreshSecret = require('crypto').randomBytes(32).toString('hex');

    // 3. Criar .env backend
    console.log('\n🔧 PASSO 2: Configurando Backend...');
    const backendEnv = `
SUPABASE_URL=${supabaseUrl}
SUPABASE_KEY=${supabaseKey}
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
`;

    fs.writeFileSync(
      path.join(__dirname, 'backend', '.env'),
      backendEnv.trim()
    );
    console.log('   ✅ Backend .env criado');

    // 4. Criar .env web
    console.log('\n🎨 PASSO 3: Configurando Web...');
    const webEnv = `VITE_API_URL=http://localhost:3001/api`;

    fs.writeFileSync(
      path.join(__dirname, 'web', '.env'),
      webEnv
    );
    console.log('   ✅ Web .env criado');

    // 5. Executar schema SQL
    console.log('\n🗄️  PASSO 4: Criando tabelas no Supabase...');
    const schemaSql = fs.readFileSync(
      path.join(__dirname, 'backend', 'sql', 'schema.sql'),
      'utf-8'
    );

    try {
      await executarSqlSupabase(supabaseUrl, supabaseKey, schemaSql);
      console.log('   ✅ Tabelas criadas com sucesso!');
    } catch (error) {
      console.warn('   ⚠️  Não consegui criar tabelas automaticamente');
      console.warn('   Faça manualmente em: Supabase → SQL Editor → Cole schema.sql');
    }

    // 6. Instalar dependências
    console.log('\n📦 PASSO 5: Instalando dependências...');
    console.log('   Isto pode levar alguns minutos...\n');

    await instalarDependencias();

    // 7. Resumo final
    console.log(`
╔════════════════════════════════════════╗
║   ✅ SETUP CONCLUÍDO COM SUCESSO!     ║
╚════════════════════════════════════════╝

🎉 Seu Essence Clinic está pronto!

▶️  Próximos passos:

   1️⃣  Terminal 1 - Rodar Backend:
       cd backend
       npm run dev

   2️⃣  Terminal 2 - Rodar Web:
       cd web
       npm run dev

   3️⃣  Abra http://localhost:3000 no navegador

   4️⃣  Registre-se (cria clínica + admin)

💡 Dica: Abra 2 terminais paralelos para backend e web

❓ Problemas? Confira docs/SETUP.md

🚀 Vamos começar!
    `);

    rl.close();
  } catch (error) {
    console.error('❌ Erro durante setup:', error.message);
    process.exit(1);
  }
}

async function executarSqlSupabase(url, key, sql) {
  return new Promise((resolve, reject) => {
    const queries = sql
      .split(';')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('--'));

    let completed = 0;

    queries.forEach((query) => {
      const body = JSON.stringify({ query });

      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = https.request(
        `${url}/rest/v1/rpc/sql_exec`,
        options,
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            completed++;
            if (completed === queries.length) {
              resolve();
            }
          });
        }
      );

      req.on('error', (err) => {
        console.warn('   Aviso: Não consegui executar SQL automaticamente');
        if (completed === queries.length) resolve();
      });

      req.write(body);
      req.end();
    });
  });
}

async function instalarDependencias() {
  const { execSync } = require('child_process');

  try {
    console.log('   Backend...');
    execSync('cd backend && npm install --silent', { stdio: 'inherit' });

    console.log('   Web...');
    execSync('cd web && npm install --silent', { stdio: 'inherit' });

    console.log('   ✅ Dependências instaladas');
  } catch (error) {
    console.log('   ⚠️  Execute manualmente: npm install em backend/ e web/');
  }
}

main();
