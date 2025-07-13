const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Variáveis de ambiente necessárias não encontradas:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runNotificationsFix() {
  try {
    console.log('Iniciando correção do schema de notificações...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '031_fix_notifications_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executando SQL...');
    
    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Erro ao executar SQL:', error);
      
      // Tentar executar diretamente
      console.log('Tentando executar diretamente...');
      const { error: directError } = await supabase.from('notifications').select('*').limit(1);
      
      if (directError) {
        console.error('Erro ao acessar tabela notifications:', directError);
      } else {
        console.log('Tabela notifications acessível');
      }
      
      return;
    }
    
    console.log('SQL executado com sucesso!');
    console.log('Resultado:', data);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

runNotificationsFix(); 