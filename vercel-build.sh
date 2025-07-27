#!/bin/bash

echo "🔧 Iniciando build customizado para Vercel..."

# Limpar caches
echo "🧹 Limpando caches..."
rm -rf .next
rm -rf node_modules/.cache

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Verificar arquivos
echo "✅ Verificando arquivos críticos..."
if [ -f "app/components/auth/AuthProvider.tsx" ]; then
    echo "✓ AuthProvider.tsx encontrado"
else
    echo "✗ AuthProvider.tsx não encontrado!"
    exit 1
fi

if [ -f "app/lib/supabase-browser.ts" ]; then
    echo "✓ supabase-browser.ts encontrado"
else
    echo "✗ supabase-browser.ts não encontrado!"
    exit 1
fi

if [ -f "components/ui/select.tsx" ]; then
    echo "✓ select.tsx encontrado"
else
    echo "✗ select.tsx não encontrado!"
    exit 1
fi

# Build
echo "🏗️ Executando build..."
npm run build

echo "✅ Build concluído!" 