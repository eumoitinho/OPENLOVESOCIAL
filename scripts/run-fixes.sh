#!/bin/bash

# =====================================================
# SCRIPT DE EXECUÇÃO DE CORREÇÕES - OPENLOVE
# =====================================================
# Data: $(date)
# Descrição: Executa todas as correções de incompatibilidades
# =====================================================

set -e  # Para o script se houver erro

echo "🚀 OPENLOVE - Script de Correção de Incompatibilidades"
echo "======================================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto OPENLOVE"
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Erro: Node.js não está instalado"
    exit 1
fi

echo "✅ Ambiente verificado"
echo ""

# 1. Executar correções no código
echo "📝 PASSO 1: Corrigindo queries no código..."
echo "-------------------------------------------"

if [ -f "scripts/fix-code-queries.js" ]; then
    node scripts/fix-code-queries.js
    echo ""
else
    echo "⚠️  Script de correção de código não encontrado"
fi

# 2. Instruções para o banco de dados
echo "🗄️  PASSO 2: Correções no banco de dados"
echo "----------------------------------------"
echo ""
echo "Para corrigir o banco de dados, execute o seguinte script no Supabase SQL Editor:"
echo ""
echo "📋 Copie e cole o conteúdo do arquivo:"
echo "   scripts/027_fix_database_incompatibilities.sql"
echo ""
echo "🔗 Acesse: https://supabase.com/dashboard"
echo "   → Selecione seu projeto"
echo "   → SQL Editor"
echo "   → Cole o script e execute"
echo ""

# 3. Verificar se há erros de TypeScript
echo "🔍 PASSO 3: Verificando erros de TypeScript..."
echo "----------------------------------------------"

if command -v pnpm &> /dev/null; then
    echo "Executando verificação de tipos..."
    pnpm run type-check 2>/dev/null || echo "⚠️  Execute 'pnpm run type-check' para verificar tipos"
elif command -v npm &> /dev/null; then
    echo "Executando verificação de tipos..."
    npm run type-check 2>/dev/null || echo "⚠️  Execute 'npm run type-check' para verificar tipos"
else
    echo "⚠️  Execute 'npx tsc --noEmit' para verificar tipos"
fi

echo ""

# 4. Instruções finais
echo "🎯 PRÓXIMOS PASSOS:"
echo "=================="
echo ""
echo "1. ✅ Execute o script de correção do banco de dados no Supabase"
echo "2. ✅ Teste as funcionalidades corrigidas:"
echo "   - Sistema de amizades"
echo "   - Dashboard"
echo "   - Sistema de perfis"
echo "3. ✅ Verifique se não há erros de compilação"
echo "4. ✅ Teste o sistema de anúncios (após criar tabelas)"
echo "5. ✅ Teste o sistema de conteúdo premium (após criar tabelas)"
echo ""
echo "📚 Documentação:"
echo "   - RELATORIO_INCOMPATIBILIDADES.md"
echo "   - scripts/028_fix_code_queries.sql (guia manual)"
echo ""
echo "🔧 Scripts disponíveis:"
echo "   - scripts/027_fix_database_incompatibilities.sql"
echo "   - scripts/fix-code-queries.js"
echo "   - scripts/run-fixes.sh (este script)"
echo ""

echo "✅ Processo concluído!"
echo ""
echo "💡 Dica: Se encontrar problemas, verifique os backups em:"
echo "   backups/before-fix-$(date +%Y-%m-%d)/"
echo "" 