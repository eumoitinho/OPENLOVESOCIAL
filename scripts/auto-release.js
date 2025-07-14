#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe', ...options });
  } catch (error) {
    log(`Erro ao executar: ${command}`, 'red');
    return '';
  }
}

function showUsage() {
  log(`
🚀 Auto Release - OpenLove

Uso: node scripts/auto-release.js [opção]

Opções:
  --check, -c     Verificar commits recentes para códigos de versão
  --release, -r   Executar release automático
  --help, -h      Mostrar esta ajuda

Códigos de Versão Suportados:
  [alphamajor]    Incrementa major version + alpha.1
  [alphaminor]    Incrementa minor version + alpha.1  
  [alphapatch]    Incrementa patch version + alpha.1
  [alpha]         Incrementa alpha version atual
  [betamajor]     Incrementa major version + beta.1
  [betaminor]     Incrementa minor version + beta.1
  [betapatch]     Incrementa patch version + beta.1
  [beta]          Incrementa beta version atual
  [major]         Incrementa major version
  [minor]         Incrementa minor version
  [patch]         Incrementa patch version

Exemplos de Commits:
  git commit -m "feat: nova funcionalidade [alphamajor]"
  git commit -m "fix: correção de bug [alphaminor]"
  git commit -m "chore: atualização [alpha]"

`, 'cyan');
}

function checkRecentCommits() {
  log('🔍 Verificando commits recentes...', 'cyan');
  
  const recentCommits = exec('git log --oneline -10 --no-merges')
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const hash = line.split(' ')[0];
      const message = line.substring(hash.length + 1);
      return { hash, message };
    });

  const versionPatterns = {
    'alphamajor': /alphamajor|alpha-major|major-alpha/i,
    'alphaminor': /alphaminor|alpha-minor|minor-alpha/i,
    'alphapatch': /alphapatch|alpha-patch|patch-alpha/i,
    'alpha': /alpha(?!major|minor|patch)/i,
    'betamajor': /betamajor|beta-major|major-beta/i,
    'betaminor': /betaminor|beta-minor|minor-beta/i,
    'betapatch': /betapatch|beta-patch|patch-beta/i,
    'beta': /beta(?!major|minor|patch)/i,
    'patch': /patch/i,
    'minor': /minor/i,
    'major': /major/i
  };

  log('\n📋 Commits Recentes:', 'blue');
  let foundVersion = false;

  recentCommits.forEach((commit, index) => {
    let versionType = null;
    
    for (const [type, pattern] of Object.entries(versionPatterns)) {
      if (pattern.test(commit.message)) {
        versionType = type;
        break;
      }
    }

    if (versionType) {
      log(`  ${index + 1}. ${commit.message} [${versionType}]`, 'green');
      foundVersion = true;
    } else {
      log(`  ${index + 1}. ${commit.message}`, 'reset');
    }
  });

  if (!foundVersion) {
    log('\n❌ Nenhum código de versão encontrado nos commits recentes', 'yellow');
    log('💡 Adicione códigos como [alphamajor], [alphaminor], etc. nos commits', 'cyan');
  } else {
    log('\n✅ Códigos de versão detectados!', 'green');
    log('💡 Execute: node scripts/auto-release.js --release', 'cyan');
  }
}

function executeRelease() {
  log('🚀 Executando release automático...', 'cyan');
  
  // Executar o script de changelog que já tem a lógica de detecção
  const { generateChangelog } = require('./generate-changelog.js');
  generateChangelog();
  
  log('\n✅ Release automático concluído!', 'green');
  log('💡 Verifique os arquivos atualizados:', 'cyan');
  log('   - package.json (versão)', 'blue');
  log('   - README.md (badge)', 'blue');
  log('   - CHANGELOG.md (histórico)', 'blue');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }

  if (args.includes('--check') || args.includes('-c')) {
    checkRecentCommits();
    return;
  }

  if (args.includes('--release') || args.includes('-r')) {
    executeRelease();
    return;
  }

  log('❌ Opção inválida. Use --help para ver as opções disponíveis.', 'red');
}

if (require.main === module) {
  main();
}

module.exports = { checkRecentCommits, executeRelease }; 