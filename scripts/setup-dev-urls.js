#!/usr/bin/env node

/**
 * Script para configurar URLs de desenvolvimento para AbacatePay
 * O AbacatePay requer URLs públicas para webhooks
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Setup de URLs para desenvolvimento - AbacatePay')
console.log('================================================')
console.log('')

const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.example')

// Verificar se .env.local existe
let envContent = ''
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
  console.log('✅ Arquivo .env.local encontrado')
} else {
  console.log('⚠️ Arquivo .env.local não encontrado, criando...')
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8')
    console.log('📋 Copiando de .env.example')
  }
}

// Verificar se NEXT_PUBLIC_APP_URL já está configurado
const hasAppUrl = envContent.includes('NEXT_PUBLIC_APP_URL=') && 
                  !envContent.includes('NEXT_PUBLIC_APP_URL=http://localhost')

if (hasAppUrl) {
  console.log('✅ NEXT_PUBLIC_APP_URL já está configurado')
  
  // Extrair URL atual
  const match = envContent.match(/NEXT_PUBLIC_APP_URL=(.+)/)
  if (match) {
    console.log(`📍 URL atual: ${match[1]}`)
  }
} else {
  console.log('❌ NEXT_PUBLIC_APP_URL não configurado ou é localhost')
  console.log('')
  console.log('🚀 Para configurar URLs públicas para desenvolvimento:')
  console.log('')
  console.log('1. Instale ngrok (se ainda não tiver):')
  console.log('   npm install -g ngrok')
  console.log('')
  console.log('2. Em um terminal, execute:')
  console.log('   ngrok http 3000')
  console.log('')
  console.log('3. Copie a URL HTTPS (ex: https://abcd1234.ngrok.io)')
  console.log('')
  console.log('4. Configure no .env.local:')
  console.log('   NEXT_PUBLIC_APP_URL=https://abcd1234.ngrok.io')
  console.log('')
  console.log('5. Reinicie o servidor Next.js')
  console.log('')
  
  // Adicionar configuração comentada se não existir
  if (!envContent.includes('NEXT_PUBLIC_APP_URL')) {
    const newContent = envContent + '\n# Configure com sua URL do ngrok para desenvolvimento\n# NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io\n'
    fs.writeFileSync(envPath, newContent)
    console.log('📝 Adicionado exemplo comentado no .env.local')
  }
}

console.log('')
console.log('📚 Documentação do AbacatePay: https://docs.abacatepay.com/')
console.log('🔗 Webhook Tester: https://webhook.site/ (para testes rápidos)')
console.log('')

// Verificar se AbacatePay está configurado
if (!envContent.includes('ABACATEPAY_API_KEY=') || envContent.includes('ABACATEPAY_API_KEY=your_abacatepay_api_key')) {
  console.log('⚠️ ABACATEPAY_API_KEY não configurado')
  console.log('   Configure sua chave da API do AbacatePay no .env.local')
}

console.log('✨ Configuração completa!')