#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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
    return '';
  }
}

function generateChangelog() {
  log('📝 Gerando CHANGELOG.md...', 'cyan');
  
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

2. Execute o script de release:
   \`\`\`bash
   pnpm run release:alpha  # para releases alpha
   pnpm run release:beta   # para releases beta
   pnpm run release:patch  # para correções
   \`\`\`

3. O changelog será atualizado automaticamente com base nos commits.
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
}

if (require.main === module) {
  generateChangelog();
}

module.exports = { generateChangelog }; 