#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Comando principal
const command = process.argv[2];
const args = process.argv.slice(3);

// Funções auxiliares
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function countTokens(text) {
  // Aproximação simples: ~4 caracteres por token
  return Math.ceil(text.length / 4);
}

// Comandos disponíveis

// 1. Analisar contexto de um módulo
function analyzeContext(moduleName) {
  log(`\nAnalisando contexto do módulo: ${moduleName}`, 'bright');
  
  const contextFile = path.join('app', moduleName, '.context');
  if (!fs.existsSync(contextFile)) {
    log(`Arquivo .context não encontrado para o módulo ${moduleName}`, 'red');
    return;
  }
  
  const context = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
  
  log('\nInformações do Módulo:', 'blue');
  console.log(`- Descrição: ${context.description}`);
  console.log(`- Arquivos principais: ${context.key_files.length}`);
  console.log(`- Dependências: ${context.dependencies.join(', ')}`);
  console.log(`- Padrões: ${context.patterns.join(', ')}`);
  
  // Contar arquivos e tamanho
  let totalFiles = 0;
  let totalSize = 0;
  let totalTokens = 0;
  
  const moduleDir = path.join('app', moduleName);
  if (fs.existsSync(moduleDir)) {
    const files = execSync(`find ${moduleDir} -name "*.ts" -o -name "*.tsx"`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    
    totalFiles = files.length;
    
    files.forEach(file => {
      const size = getFileSize(file);
      const content = fs.readFileSync(file, 'utf8');
      totalSize += size;
      totalTokens += countTokens(content);
    });
  }
  
  log('\nEstatísticas:', 'green');
  console.log(`- Total de arquivos: ${totalFiles}`);
  console.log(`- Tamanho total: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`- Tokens estimados: ~${totalTokens.toLocaleString()}`);
  
  if (context.common_issues) {
    log('\nProblemas Comuns:', 'yellow');
    context.common_issues.forEach(issue => console.log(`- ${issue}`));
  }
}

// 2. Gerar contexto comprimido
function generateCompressedContext(moduleName) {
  log(`\nGerando contexto comprimido para: ${moduleName}`, 'bright');
  
  const moduleDir = path.join('app', moduleName);
  if (!fs.existsSync(moduleDir)) {
    log(`Módulo ${moduleName} não encontrado`, 'red');
    return;
  }
  
  const files = execSync(`find ${moduleDir} -name "*.ts" -o -name "*.tsx"`, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  
  const compressed = {
    module: moduleName,
    timestamp: new Date().toISOString(),
    interfaces: [],
    types: [],
    functions: [],
    components: []
  };
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);
    
    // Extrair interfaces
    const interfaceMatches = content.match(/export interface \w+/g) || [];
    interfaceMatches.forEach(match => {
      const name = match.replace('export interface ', '');
      compressed.interfaces.push({ name, file: relativePath });
    });
    
    // Extrair types
    const typeMatches = content.match(/export type \w+/g) || [];
    typeMatches.forEach(match => {
      const name = match.replace('export type ', '');
      compressed.types.push({ name, file: relativePath });
    });
    
    // Extrair funções
    const functionMatches = content.match(/export (async )?function \w+/g) || [];
    functionMatches.forEach(match => {
      const name = match.replace(/export (async )?function /, '');
      compressed.functions.push({ name, file: relativePath });
    });
    
    // Extrair componentes React
    const componentMatches = content.match(/export (default )?function [A-Z]\w+/g) || [];
    componentMatches.forEach(match => {
      const name = match.replace(/export (default )?function /, '');
      compressed.components.push({ name, file: relativePath });
    });
  });
  
  const outputFile = path.join('docs', 'context', `${moduleName}-compressed.json`);
  fs.writeFileSync(outputFile, JSON.stringify(compressed, null, 2));
  
  log(`\nContexto comprimido salvo em: ${outputFile}`, 'green');
  log('\nResumo:', 'blue');
  console.log(`- Interfaces: ${compressed.interfaces.length}`);
  console.log(`- Types: ${compressed.types.length}`);
  console.log(`- Funções: ${compressed.functions.length}`);
  console.log(`- Componentes: ${compressed.components.length}`);
  
  const compressedSize = getFileSize(outputFile);
  const compressedTokens = countTokens(JSON.stringify(compressed));
  console.log(`- Tamanho: ${(compressedSize / 1024).toFixed(2)} KB`);
  console.log(`- Tokens: ~${compressedTokens.toLocaleString()}`);
}

// 3. Listar todos os módulos
function listModules() {
  log('\nMódulos disponíveis:', 'bright');
  
  const appDir = 'app';
  const modules = fs.readdirSync(appDir)
    .filter(item => {
      const itemPath = path.join(appDir, item);
      return fs.statSync(itemPath).isDirectory() && !item.startsWith('(');
    });
  
  modules.forEach(module => {
    const contextFile = path.join(appDir, module, '.context');
    const hasContext = fs.existsSync(contextFile);
    
    if (hasContext) {
      const context = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
      log(`\n${module}`, 'green');
      console.log(`  ${context.description}`);
    } else {
      log(`\n${module}`, 'yellow');
      console.log('  (sem arquivo .context)');
    }
  });
}

// 4. Validar contextos
function validateContexts() {
  log('\nValidando arquivos de contexto...', 'bright');
  
  const issues = [];
  
  // Verificar perfis do Cursor
  const cursorProfilesFile = '.cursor/context-profiles.json';
  if (fs.existsSync(cursorProfilesFile)) {
    const profiles = JSON.parse(fs.readFileSync(cursorProfilesFile, 'utf8'));
    
    Object.entries(profiles.profiles).forEach(([name, profile]) => {
      profile.context_files.forEach(file => {
        if (!fs.existsSync(file)) {
          issues.push(`Perfil '${name}': arquivo de contexto não encontrado: ${file}`);
        }
      });
    });
  }
  
  // Verificar .context files
  const contextFiles = execSync('find . -name ".context" -not -path "./node_modules/*"', { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  
  contextFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const context = JSON.parse(content);
      
      // Validar estrutura
      const requiredFields = ['module', 'description', 'key_files'];
      requiredFields.forEach(field => {
        if (!context[field]) {
          issues.push(`${file}: campo obrigatório ausente: ${field}`);
        }
      });
      
      // Validar arquivos referenciados
      if (context.key_files) {
        context.key_files.forEach(keyFile => {
          if (!fs.existsSync(keyFile)) {
            issues.push(`${file}: arquivo referenciado não existe: ${keyFile}`);
          }
        });
      }
    } catch (e) {
      issues.push(`${file}: erro ao parsear JSON - ${e.message}`);
    }
  });
  
  if (issues.length === 0) {
    log('\n✅ Todos os contextos estão válidos!', 'green');
  } else {
    log('\n❌ Problemas encontrados:', 'red');
    issues.forEach(issue => console.log(`- ${issue}`));
  }
}

// Menu de ajuda
function showHelp() {
  log('\nContext Tools - Ferramentas para gerenciar contexto do projeto', 'bright');
  log('\nUso: npm run context <comando> [argumentos]', 'blue');
  
  log('\nComandos disponíveis:', 'yellow');
  console.log('  analyze <module>    - Analisa o contexto de um módulo');
  console.log('  compress <module>   - Gera contexto comprimido para um módulo');
  console.log('  list               - Lista todos os módulos do projeto');
  console.log('  validate           - Valida todos os arquivos de contexto');
  console.log('  help               - Mostra esta mensagem de ajuda');
  
  log('\nExemplos:', 'green');
  console.log('  npm run context analyze messages');
  console.log('  npm run context compress posts');
  console.log('  npm run context list');
}

// Executar comando
switch (command) {
  case 'analyze':
    if (!args[0]) {
      log('Erro: especifique o nome do módulo', 'red');
      showHelp();
    } else {
      analyzeContext(args[0]);
    }
    break;
    
  case 'compress':
    if (!args[0]) {
      log('Erro: especifique o nome do módulo', 'red');
      showHelp();
    } else {
      generateCompressedContext(args[0]);
    }
    break;
    
  case 'list':
    listModules();
    break;
    
  case 'validate':
    validateContexts();
    break;
    
  case 'help':
  default:
    showHelp();
    break;
}