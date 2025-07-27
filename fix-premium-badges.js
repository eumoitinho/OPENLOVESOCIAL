const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo PremiumLockBadge em todos os arquivos...\n');

// Função para buscar arquivos recursivamente
function findFiles(dir, pattern, ignore = []) {
  const results = [];
  
  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      // Verificar se deve ignorar
      const shouldIgnore = ignore.some(ig => filePath.includes(ig));
      if (shouldIgnore) continue;
      
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file.endsWith(pattern)) {
        results.push(filePath);
      }
    }
  }
  
  walk(dir);
  return results;
}

// Buscar todos os arquivos .tsx
const files = findFiles('.', '.tsx', ['node_modules', '.next', 'dist']);

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Remover propriedades não suportadas de PremiumLockBadge
  content = content.replace(
    /<PremiumLockBadge\s+([^>]*?)(?:size|disabled|onUpgradeClick)="[^"]*"\s*([^>]*?)>/g,
    (match, before, after) => {
      // Manter apenas feature e outras props válidas
      let cleanMatch = match;
      cleanMatch = cleanMatch.replace(/\s*size="[^"]*"/g, '');
      cleanMatch = cleanMatch.replace(/\s*disabled="[^"]*"/g, '');
      cleanMatch = cleanMatch.replace(/\s*disabled={[^}]*}/g, '');
      cleanMatch = cleanMatch.replace(/\s*onUpgradeClick={[^}]*}/g, '');
      return cleanMatch;
    }
  );
  
  // Corrigir features conhecidas
  const featureMap = {
    'canCreateCommunities': 'create_community',
    'hasAdvancedAnalytics': 'analytics',
    'hasAdvancedModeration': 'moderation',
    'canCreateEvents': 'create_event'
  };
  
  Object.entries(featureMap).forEach(([old, newFeature]) => {
    content = content.replace(
      new RegExp(`feature="${old}"`, 'g'),
      `feature="${newFeature}"`
    );
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`✅ Corrigido: ${file}`);
    totalFixed++;
  }
});

console.log(`\n✨ Total de arquivos corrigidos: ${totalFixed}`); 