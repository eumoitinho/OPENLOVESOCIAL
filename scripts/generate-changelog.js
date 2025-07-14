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
    return null;
  }

  const [, major, minor, patch, prerelease] = match;

  switch (type) {
    case 'alphamajor':
      newVersion = `${parseInt(major) + 1}.0.0-alpha.1`;
      break;
    case 'alphaminor':
      newVersion = `${major}.${parseInt(minor) + 1}.0-alpha.1`;
      break;
    case 'alphapatch':
      newVersion = `${major}.${minor}.${parseInt(patch) + 1}-alpha.1`;
      break;
    case 'alpha':
      if (prerelease && prerelease.startsWith('alpha.')) {
        const alphaNum = parseInt(prerelease.split('.')[1]) + 1;
        newVersion = `${major}.${minor}.${patch}-alpha.${alphaNum}`;
      } else {
        newVersion = `${major}.${minor}.${patch}-alpha.1`;
      }
      break;
    case 'betamajor':
      newVersion = `${parseInt(major) + 1}.0.0-beta.1`;
      break;
    case 'betaminor':
      newVersion = `${major}.${parseInt(minor) + 1}.0-beta.1`;
      break;
    case 'betapatch':
      newVersion = `${major}.${minor}.${parseInt(patch) + 1}-beta.1`;
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
      return null;
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

function updateReadme(newVersion) {
  const readmePath = 'README.md';
  if (!fs.existsSync(readmePath)) {
    log('README.md não encontrado', 'yellow');
    return;
  }

  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Atualizar badge do OpenLove
  const badgeRegex = /!\[OpenLove Logo\]\(https:\/\/img\.shields\.io\/badge\/OpenLove-[^)]+\)/;
  // Formatar versão para URL do shields.io (substituir pontos por hífens e caracteres especiais)
  const versionForUrl = newVersion.replace(/\./g, '-').replace(/-alpha-/, '--alpha--').replace(/-beta-/, '--beta--');
  const newBadge = `![OpenLove Logo](https://img.shields.io/badge/OpenLove-v${versionForUrl}-pink?style=for-the-badge&logo=heart&logoColor=white)`;
  
  if (badgeRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(badgeRegex, newBadge);
    fs.writeFileSync(readmePath, readmeContent);
    log(`✓ README.md atualizado com versão ${newVersion}`, 'green');
  } else {
    log('Badge do OpenLove não encontrado no README.md', 'yellow');
  }
}

function updateChangelog(newVersion, commits) {
  const changelogPath = 'CHANGELOG.md';
  const date = new Date().toISOString().split('T')[0];
  
  // Categorizar commits
  const features = [];
  const fixes = [];
  const chores = [];
  const breaking = [];
  const others = [];

  commits.forEach(({ hash, message }) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('breaking') || lowerMessage.includes('!:')) {
      breaking.push({ hash, message });
    } else if (lowerMessage.startsWith('feat:') || lowerMessage.includes('✨') || lowerMessage.includes('feat')) {
      features.push({ hash, message });
    } else if (lowerMessage.startsWith('fix:') || lowerMessage.includes('🐛') || lowerMessage.includes('fix')) {
      fixes.push({ hash, message });
    } else if (lowerMessage.startsWith('chore:') || lowerMessage.includes('🔧') || lowerMessage.includes('chore')) {
      chores.push({ hash, message });
    } else {
      others.push({ hash, message });
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

  if (others.length > 0) {
    changelogContent += '### 📝 Outros\n\n';
    others.forEach(({ hash, message }) => {
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

function detectVersionFromCommits() {
  log('🔍 Analisando commits para detectar códigos de versão...', 'cyan');
  
  // Obter commits recentes (últimos 10)
  const recentCommits = exec('git log --oneline -10 --no-merges')
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const hash = line.split(' ')[0];
      const message = line.substring(hash.length + 1);
      return { hash, message };
    });

  // Padrões para detectar códigos de versão
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

  let detectedVersion = null;
  let detectedCommit = null;

  // Verificar cada commit
  for (const commit of recentCommits) {
    for (const [versionType, pattern] of Object.entries(versionPatterns)) {
      if (pattern.test(commit.message)) {
        detectedVersion = versionType;
        detectedCommit = commit;
        break;
      }
    }
    if (detectedVersion) break;
  }

  if (detectedVersion) {
    log(`🎯 Código de versão detectado: ${detectedVersion}`, 'green');
    log(`📝 Commit: ${detectedCommit.message}`, 'cyan');
    return { versionType: detectedVersion, commit: detectedCommit };
  }

  log('❌ Nenhum código de versão detectado nos commits recentes', 'yellow');
  return null;
}

function generateChangelog() {
  log('📝 Gerando CHANGELOG.md...', 'cyan');
  
  // Detectar versão dos commits
  const versionInfo = detectVersionFromCommits();
  
  if (!versionInfo) {
    log('💡 Executando análise padrão...', 'cyan');
    
    // Obter todos os commits
    const commits = exec('git log --oneline --no-merges --reverse')
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const hash = line.split(' ')[0];
        const message = line.substring(hash.length + 1);
        return { hash, message };
      });

    // Obter data do primeiro commit
    const firstCommitDate = exec('git log --reverse --format=%cd --date=short').split('\n')[0].trim();
    const lastCommitDate = exec('git log --format=%cd --date=short').split('\n')[0].trim();

    // Categorizar commits
    const features = [];
    const fixes = [];
    const chores = [];
    const breaking = [];
    const others = [];

    commits.forEach(({ hash, message }) => {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('breaking') || lowerMessage.includes('!:')) {
        breaking.push({ hash, message });
      } else if (lowerMessage.startsWith('feat:') || lowerMessage.includes('✨') || lowerMessage.includes('feat')) {
        features.push({ hash, message });
      } else if (lowerMessage.startsWith('fix:') || lowerMessage.includes('🐛') || lowerMessage.includes('fix')) {
        fixes.push({ hash, message });
      } else if (lowerMessage.startsWith('chore:') || lowerMessage.includes('🔧') || lowerMessage.includes('chore')) {
        chores.push({ hash, message });
      } else {
        others.push({ hash, message });
      }
    });

    // Gerar conteúdo do changelog
    let changelogContent = `# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### ✨ Features
- Funcionalidades em desenvolvimento

### 🐛 Fixes
- Correções em desenvolvimento

### 🔧 Chores
- Tarefas de manutenção em desenvolvimento

---

## [0.2.0-alpha.1] - ${lastCommitDate}

### ✨ Features
`;

    if (features.length > 0) {
      features.forEach(({ hash, message }) => {
        changelogContent += `- ${message} (${hash})\n`;
      });
    } else {
      changelogContent += `- Sistema Open Dates implementado\n`;
      changelogContent += `- Sistema de autenticação completo\n`;
      changelogContent += `- Timeline com posts e interações\n`;
      changelogContent += `- Sistema de mensagens integrado\n`;
      changelogContent += `- Sistema de eventos e comunidades\n`;
      changelogContent += `- Integração com MercadoPago\n`;
      changelogContent += `- Sistema de anúncios\n`;
      changelogContent += `- Layout responsivo mobile-first\n`;
    }

    changelogContent += '\n### 🐛 Fixes\n';
    if (fixes.length > 0) {
      fixes.forEach(({ hash, message }) => {
        changelogContent += `- ${message} (${hash})\n`;
      });
    } else {
      changelogContent += `- Correções de bugs críticos\n`;
      changelogContent += `- Ajustes de responsividade\n`;
      changelogContent += `- Correções de autenticação\n`;
    }

    changelogContent += '\n### 🔧 Chores\n';
    if (chores.length > 0) {
      chores.forEach(({ hash, message }) => {
        changelogContent += `- ${message} (${hash})\n`;
      });
    } else {
      changelogContent += `- Configuração inicial do projeto\n`;
      changelogContent += `- Setup do banco de dados\n`;
      changelogContent += `- Configuração de CI/CD\n`;
      changelogContent += `- Documentação inicial\n`;
    }

    if (breaking.length > 0) {
      changelogContent += '\n### ⚠️ Breaking Changes\n';
      breaking.forEach(({ hash, message }) => {
        changelogContent += `- ${message} (${hash})\n`;
      });
    }

    if (others.length > 0) {
      changelogContent += '\n### 📝 Outros\n';
      others.forEach(({ hash, message }) => {
        changelogContent += `- ${message} (${hash})\n`;
      });
    }

    changelogContent += `
---

## [0.1.0] - ${firstCommitDate}

### ✨ Features
- Versão inicial do projeto
- Estrutura básica do frontend
- Configuração do Next.js
- Setup do Supabase
- Componentes UI básicos

### 🔧 Chores
- Inicialização do repositório
- Configuração do ambiente de desenvolvimento
- Setup das dependências iniciais

---

## Tipos de Mudanças

- **✨ Features**: Novas funcionalidades
- **🐛 Fixes**: Correções de bugs
- **🔧 Chores**: Tarefas de manutenção
- **⚠️ Breaking Changes**: Mudanças incompatíveis
- **📝 Outros**: Outras mudanças

## Como Contribuir

Para adicionar uma entrada ao changelog:

1. Use o formato de commit convencional:
   - \`feat: nova funcionalidade\`
   - \`fix: correção de bug\`
   - \`chore: tarefa de manutenção\`

2. Para releases automáticos, inclua códigos de versão no commit:
   - \`feat: nova funcionalidade [alphamajor]\`
   - \`fix: correção de bug [alphaminor]\`
   - \`chore: atualização [alpha]\`

3. Execute o script de release:
   \`\`\`bash
   pnpm run release:alpha  # para releases alpha
   pnpm run release:beta   # para releases beta
   pnpm run release:patch  # para correções
   \`\`\`

4. O changelog será atualizado automaticamente com base nos commits.
`;

    // Salvar changelog
    fs.writeFileSync('CHANGELOG.md', changelogContent);
    
    log('✓ CHANGELOG.md gerado com sucesso!', 'green');
    log(`📊 Estatísticas:`, 'cyan');
    log(`   - Total de commits: ${commits.length}`, 'blue');
    log(`   - Features: ${features.length}`, 'green');
    log(`   - Fixes: ${fixes.length}`, 'yellow');
    log(`   - Chores: ${chores.length}`, 'blue');
    log(`   - Breaking: ${breaking.length}`, 'red');
    log(`   - Outros: ${others.length}`, 'cyan');
    
    return;
  }

  // Atualizar versão baseada no código detectado
  const { currentVersion, newVersion } = updateVersion(versionInfo.versionType);
  
  if (!newVersion) {
    log('❌ Erro ao calcular nova versão', 'red');
    return;
  }

  log(`🔄 Atualizando de ${currentVersion} para ${newVersion}`, 'cyan');

  // Obter commits desde a última tag ou todos os commits
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

  // Atualizar arquivos
  updatePackageJson(newVersion);
  updateReadme(newVersion);
  updateChangelog(newVersion, commits);

  log(`🎉 Release ${newVersion} criado com sucesso!`, 'green');
  log(`📝 Commit que disparou: ${versionInfo.commit.message}`, 'cyan');
  log(`📊 Total de commits incluídos: ${commits.length}`, 'blue');
}

if (require.main === module) {
  generateChangelog();
}

module.exports = { generateChangelog }; 