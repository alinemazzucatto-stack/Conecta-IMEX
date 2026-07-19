#!/bin/bash
# 🛡️ SCRIPT DE RESTAURAÇÃO RÁPIDA - VERSÃO PERFEITA
# Restaura a versão perfeita em UMA LINHA

echo "🛡️ RESTAURANDO VERSÃO PERFEITA..."
echo "=================================="
echo ""

# Step 1: Criar backup da branch atual
BACKUP_BRANCH="backup-antes-restore-$(date +%Y%m%d-%H%M%S)"
echo "📌 Criando backup da branch atual: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"

# Step 2: Restaurar versão perfeita
echo "🔄 Restaurando commit 684548d..."
git reset --hard v-perfeito-beneficios-pdf

# Step 3: Push para GitHub
echo "📤 Fazendo push para GitHub..."
git push -u origin main --force

# Step 4: Deploy no Cloudflare
echo "🚀 Deployando no Cloudflare..."
npx wrangler deploy

# Step 5: Sucesso!
echo ""
echo "✅ RESTAURAÇÃO CONCLUÍDA COM SUCESSO!"
echo "🟢 Versão perfeita está ativa"
echo "📌 Backup criado em: $BACKUP_BRANCH"
echo ""
echo "Para reverter para antes da restauração:"
echo "  git reset --hard $BACKUP_BRANCH"
