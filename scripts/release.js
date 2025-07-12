#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe', ...options });
  } catch (error) {
    log(`Erro ao executar: ${command}`, 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function updateVersion(type) {
  const currentVersion = getCurrentVersion();
  let newVersion;

  // Parse current version
  const match = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    log('Versão atual não está no formato SemVer válido', 'red');
    process.exit(1);
  }

  const [, major, minor, patch, prerelease] = match;

  switch (type) {
    case 'alpha':
      if (prerelease && prerelease.startsWith('alpha.')) {
        const alphaNum = parseInt(prerelease.split('.')[1]) + 1;
        newVersion = `${major}.${minor}.${patch}-alpha.${alphaNum}`;
      } else {
        newVersion = `${major}.${minor}.${patch}-alpha.1`;
      }
      break;
    case 'beta':
      if (prerelease && prerelease.startsWith('beta.')) {
        const betaNum = parseInt(prerelease.split('.')[1]) + 1;
        newVersion = `${major}.${minor}.${patch}-beta.${betaNum}`;
      } else {
        newVersion = `${major}.${minor}.${patch}-beta.1`;
      }
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${parseInt(patch) + 1}`;
      break;
    case 'minor':
      newVersion = `${major}.${parseInt(minor) + 1}.0`;
      break;
    case 'major':
      newVersion = `${parseInt(major) + 1}.0.0`;
      break;
    default:
      log(`Tipo de release inválido: ${type}`, 'red');
      process.exit(1);
  }

  return { currentVersion, newVersion };
}

function updatePackageJson(newVersion) {
  const packagePath = 'package.json';
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  log(`✓ package.json atualizado para versão ${newVersion}`, 'green');
}

function updateChangelog(newVersion, type) {
  const changelogPath = 'CHANGELOG.md';
  const date = new Date().toISOString().split('T')[0];
  
  // Obter commits desde a última tag
  let commits;
  try {
    const lastTag = exec('git describe --tags --abbrev=0', { stdio: 'pipe' }).trim();
    commits = exec(`git log ${lastTag}..HEAD --oneline --no-merges`, { stdio: 'pipe' })
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const hash = line.split(' ')[0];
        const message = line.substring(hash.length + 1);
        return { hash, message };
      });
  } catch (error) {
    // Se não há tags anteriores, pegar todos os commits
    commits = exec('git log --oneline --no-merges', { stdio: 'pipe' })
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const hash = line.split(' ')[0];
        const message = line.substring(hash.length + 1);
        return { hash, message };
      });
  }

  // Categorizar commits
  const features = [];
  const fixes = [];
  const chores = [];
  const breaking = [];

  commits.forEach(({ hash, message }) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('breaking') || lowerMessage.includes('!:')) {
      breaking.push({ hash, message });
    } else if (lowerMessage.startsWith('feat:') || lowerMessage.includes('✨')) {
      features.push({ hash, message });
    } else if (lowerMessage.startsWith('fix:') || lowerMessage.includes('🐛')) {
      fixes.push({ hash, message });
    } else {
      chores.push({ hash, message });
    }
  });

  // Gerar conteúdo do changelog
  let changelogContent = `## [${newVersion}] - ${date}\n\n`;
  
  if (breaking.length > 0) {
    changelogContent += '### ⚠️ Breaking Changes\n\n';
    breaking.forEach(({ hash, message }) => {
      changelogContent += `- ${message} (${hash})\n`;
    });
    changelogContent += '\n';
  }

  if (features.length > 0) {
    changelogContent += '### ✨ Features\n\n';
    features.forEach(({ hash, message }) => {
      changelogContent += `- ${message} (${hash})\n`;
    });
    changelogContent += '\n';
  }

  if (fixes.length > 0) {
    changelogContent += '### 🐛 Fixes\n\n';
    fixes.forEach(({ hash, message }) => {
      changelogContent += `- ${message} (${hash})\n`;
    });
    changelogContent += '\n';
  }

  if (chores.length > 0) {
    changelogContent += '### 🔧 Chores\n\n';
    chores.forEach(({ hash, message }) => {
      changelogContent += `- ${message} (${hash})\n`;
    });
    changelogContent += '\n';
  }

  // Ler changelog existente
  let existingChangelog = '';
  if (fs.existsSync(changelogPath)) {
    existingChangelog = fs.readFileSync(changelogPath, 'utf8');
  }

  // Adicionar nova versão no topo
  const newChangelog = changelogContent + existingChangelog;
  fs.writeFileSync(changelogPath, newChangelog);
  
  log(`✓ CHANGELOG.md atualizado com ${commits.length} commits`, 'green');
}

function updateVersionFile(newVersion) {
  const versionContent = `# Versionamento OpenLove

## Versão Atual
**${newVersion}**

## Padrão de Versionamento
Este projeto segue o **Versionamento Semântico** (SemVer): \`MAJOR.MINOR.PATCH[-prerelease][+build]\`

### Estrutura da Versão
- **MAJOR**: Mudanças incompatíveis com versões anteriores
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs compatíveis
- **prerelease**: Versões de desenvolvimento (alpha, beta, rc)

### Tipos de Release
- **alpha**: Desenvolvimento ativo, funcionalidades instáveis
- **beta**: Testes de funcionalidades, mais estável que alpha
- **rc** (release candidate): Versão candidata para produção
- **stable**: Versão estável para produção

### Exemplos
- \`0.2.0-alpha.1\`: Primeira versão alpha da versão 0.2.0
- \`0.2.0-beta.3\`: Terceira versão beta da versão 0.2.0
- \`0.2.0\`: Versão estável 0.2.0
- \`1.0.0\`: Primeira versão major

## Histórico de Versões
Consulte o [CHANGELOG.md](CHANGELOG.md) para o histórico completo de mudanças.

## Como Fazer Release
\`\`\`bash
# Release alpha
pnpm run release:alpha

# Release beta
pnpm run release:beta

# Release patch (correções)
pnpm run release:patch

# Release minor (novas funcionalidades)
pnpm run release:minor

# Release major (mudanças incompatíveis)
pnpm run release:major
\`\`\`

## Última Atualização
${new Date().toISOString()}
`;

  fs.writeFileSync('VERSION.md', versionContent);
  log('✓ VERSION.md atualizado', 'green');
}

function createGitTag(version) {
  const tagName = `v${version}`;
  
  // Verificar se a tag já existe
  try {
    exec(`git rev-parse ${tagName}`, { stdio: 'pipe' });
    log(`Tag ${tagName} já existe!`, 'yellow');
    return false;
  } catch (error) {
    // Tag não existe, podemos criar
  }

  exec(`git tag ${tagName}`);
  log(`✓ Tag ${tagName} criada`, 'green');
  return true;
}

function main() {
  const type = process.argv[2];
  
  if (!type) {
    log('Uso: node scripts/release.js <tipo>', 'red');
    log('Tipos: alpha, beta, patch, minor, major', 'yellow');
    process.exit(1);
  }

  log('🚀 Iniciando processo de release...', 'cyan');
  
  // Verificar se há mudanças não commitadas
  const status = exec('git status --porcelain');
  if (status.trim()) {
    log('⚠️  Há mudanças não commitadas!', 'yellow');
    log('Faça commit de todas as mudanças antes de fazer release.', 'yellow');
    process.exit(1);
  }

  // Atualizar versão
  const { currentVersion, newVersion } = updateVersion(type);
  log(`📦 Atualizando de ${currentVersion} para ${newVersion}`, 'blue');

  // Atualizar arquivos
  updatePackageJson(newVersion);
  updateChangelog(newVersion, type);
  updateVersionFile(newVersion);

  // Commit das mudanças
  exec('git add package.json CHANGELOG.md VERSION.md');
  exec(`git commit -m "chore: bump version to ${newVersion}"`);

  // Criar tag
  const tagCreated = createGitTag(newVersion);

  // Push
  log('📤 Fazendo push das mudanças...', 'blue');
  exec('git push origin main');
  
  if (tagCreated) {
    exec('git push origin --tags');
    log('✓ Tags enviadas para o repositório', 'green');
  }

  log('\n🎉 Release concluído com sucesso!', 'green');
  log(`📋 Versão: ${newVersion}`, 'cyan');
  log(`🏷️  Tag: v${newVersion}`, 'cyan');
  log(`📝 Commits: ${exec('git log --oneline --no-merges | wc -l').trim()}`, 'cyan');
}

if (require.main === module) {
  main();
}

module.exports = { updateVersion, updateChangelog, createGitTag }; 