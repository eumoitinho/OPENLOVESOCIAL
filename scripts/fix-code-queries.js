#!/usr/bin/env node

/**
 * Script de Correção Automática de Queries - OPENLOVE
 * 
 * Este script corrige automaticamente as queries problemáticas identificadas
 * no diagnóstico de incompatibilidades entre código e banco de dados.
 */

const fs = require('fs');
const path = require('path');

// Configurações
const ROOT_DIR = path.join(__dirname, '..');
const BACKUP_DIR = path.join(ROOT_DIR, 'backups', 'before-fix-' + new Date().toISOString().split('T')[0]);

// Correções a serem aplicadas
const FIXES = [
  // Sistema de Amizades - friendships -> friends
  {
    files: [
      'app/api/friends/route.ts',
      'app/api/friends/request/route.ts',
      'app/api/friends/requests/route.ts',
      'app/api/friends/respond/route.ts'
    ],
    patterns: [
      { from: 'from("friendships")', to: 'from("friends")' },
      { from: 'from(\'friendships\')', to: 'from(\'friends\')' }
    ]
  },
  
  // Dashboard - post_interactions -> likes
  {
    files: ['app/dashboard/DashboardClient.tsx'],
    patterns: [
      { from: 'from("post_interactions")', to: 'from("likes")' },
      { from: 'from(\'post_interactions\')', to: 'from(\'likes\')' }
    ]
  },
  
  // Dashboard - viewed_user_id -> viewed_profile_id
  {
    files: ['app/dashboard/DashboardClient.tsx'],
    patterns: [
      { from: 'viewed_user_id', to: 'viewed_profile_id' }
    ]
  },
  
  // Sistema de Perfis - user_id -> id
  {
    files: [
      'app/api/friends/route.ts',
      'app/api/friends/request/route.ts',
      'app/api/friends/requests/route.ts'
    ],
    patterns: [
      { from: '.eq("user_id", user.id)', to: '.eq("id", user.id)' },
      { from: '.eq(\'user_id\', user.id)', to: '.eq(\'id\', user.id)' }
    ]
  },
  
  // Sistema de Perfis - profiles -> users
  {
    files: ['app/api/open-dates/interactions/route.ts'],
    patterns: [
      { from: 'from("profiles")', to: 'from("users")' },
      { from: 'from(\'profiles\')', to: 'from(\'users\')' }
    ]
  }
];

/**
 * Cria backup do arquivo
 */
function createBackup(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
    return false;
  }
  
  // Criar diretório de backup se não existir
  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Copiar arquivo para backup
  fs.copyFileSync(fullPath, backupPath);
  console.log(`📦 Backup criado: ${backupPath}`);
  return true;
}

/**
 * Aplica correções em um arquivo
 */
function applyFixes(filePath, patterns) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (regex.test(content)) {
      content = content.replace(regex, pattern.to);
      modified = true;
      console.log(`  ✅ ${pattern.from} -> ${pattern.to}`);
    }
  });
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`🔧 Arquivo corrigido: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  Nenhuma correção necessária: ${filePath}`);
    return false;
  }
}

/**
 * Função principal
 */
function main() {
  console.log('🚀 Iniciando correção automática de queries...\n');
  
  // Criar diretório de backup
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  FIXES.forEach((fix, index) => {
    console.log(`📁 Grupo ${index + 1}: ${fix.files[0].split('/')[2] || 'Correções Gerais'}`);
    
    fix.files.forEach(filePath => {
      totalFiles++;
      
      // Criar backup
      createBackup(filePath);
      
      // Aplicar correções
      if (applyFixes(filePath, fix.patterns)) {
        modifiedFiles++;
      }
      
      console.log(''); // Linha em branco para separar
    });
  });
  
  // Resumo
  console.log('📊 RESUMO:');
  console.log(`   Total de arquivos processados: ${totalFiles}`);
  console.log(`   Arquivos modificados: ${modifiedFiles}`);
  console.log(`   Backups salvos em: ${BACKUP_DIR}`);
  
  if (modifiedFiles > 0) {
    console.log('\n✅ Correções aplicadas com sucesso!');
    console.log('💡 Recomendação: Teste as funcionalidades após as correções.');
  } else {
    console.log('\nℹ️  Nenhuma correção foi necessária.');
  }
  
  console.log('\n🔍 Próximos passos:');
  console.log('   1. Execute o script de correção do banco de dados');
  console.log('   2. Teste as funcionalidades corrigidas');
  console.log('   3. Verifique se não há erros de compilação');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, FIXES }; 