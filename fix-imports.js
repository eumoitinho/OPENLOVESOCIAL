const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo imports...\n');

// Função para criar diretório se não existir
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Criar cópias dos arquivos nos locais esperados
const copies = [
  {
    from: 'app/components/auth/AuthProvider.tsx',
    to: 'components/auth/AuthProvider.tsx'
  },
  {
    from: 'app/lib/supabase-browser.ts',
    to: 'lib/supabase-browser.ts'
  }
];

copies.forEach(({ from, to }) => {
  if (fs.existsSync(from)) {
    const toDir = path.dirname(to);
    ensureDir(toDir);
    
    // Copiar arquivo
    fs.copyFileSync(from, to);
    console.log(`✅ Copiado: ${from} -> ${to}`);
  } else {
    console.log(`❌ Arquivo não encontrado: ${from}`);
  }
});

console.log('\n✨ Imports corrigidos!'); 