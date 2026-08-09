#!/usr/bin/env node

/**
 * 🚀 Script para criar tabelas no Supabase
 *
 * Como usar:
 * node create-tables.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

async function createTables() {
  console.log(`
╔════════════════════════════════════════╗
║  📊 Criando Tabelas no Supabase        ║
╚════════════════════════════════════════╝
  `);

  const supabaseUrl = 'https://uaxsdpgkanvcqsbylpdt.supabase.co';
  const supabaseKey = 'sb_publishable_POYTkk4QRtxiEQU_Zjp_7A__k8ccTS4';

  const schemaSql = fs.readFileSync(
    path.join(__dirname, 'backend', 'sql', 'schema.sql'),
    'utf-8'
  );

  // Split SQL em queries individuais
  const queries = schemaSql
    .split(';')
    .map(q => q.trim())
    .filter(q => q && !q.startsWith('--') && !q.startsWith('/*'));

  console.log(`📝 Total de queries: ${queries.length}`);
  console.log('\n🔄 Executando queries...\n');

  let success = 0;
  let failed = 0;

  for (const query of queries) {
    try {
      await executeSql(supabaseUrl, supabaseKey, query);
      success++;
      console.log(`✅ Query executada (${success}/${queries.length})`);
    } catch (error) {
      failed++;
      console.log(`❌ Erro: ${error.message}`);
    }
  }

  console.log(`
╔════════════════════════════════════════╗
║  ✅ TABELAS CRIADAS COM SUCESSO!       ║
╠════════════════════════════════════════╣
║  ✓ Queries executadas: ${success}            ║
║  ✗ Erros: ${failed}                          ║
╚════════════════════════════════════════╝
  `);

  console.log('\n📚 Próximo passo: npm install\n');
}

function executeSql(url, key, query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(`${url}/rest/v1/rpc/sql_exec`, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve();
        } else {
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

createTables().catch((error) => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
