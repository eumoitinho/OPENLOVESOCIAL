const path = require('path');
const fs = require('fs');

console.log('Verificando arquivos...\n');

// Verificar AuthProvider
const authProviderPath = path.join(__dirname, 'app/components/auth/AuthProvider.tsx');
console.log(`AuthProvider existe: ${fs.existsSync(authProviderPath)}`);
console.log(`Caminho: ${authProviderPath}\n`);

// Verificar supabase-browser
const supabaseBrowserPath = path.join(__dirname, 'app/lib/supabase-browser.ts');
console.log(`supabase-browser existe: ${fs.existsSync(supabaseBrowserPath)}`);
console.log(`Caminho: ${supabaseBrowserPath}\n`);

// Verificar select
const selectPath = path.join(__dirname, 'components/ui/select.tsx');
console.log(`select.tsx existe: ${fs.existsSync(selectPath)}`);
console.log(`Caminho: ${selectPath}\n`);

// Verificar tsconfig
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  console.log('Paths no tsconfig:');
  console.log(JSON.stringify(tsconfig.compilerOptions.paths, null, 2));
} 