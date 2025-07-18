const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jgvbwevezjgzsamqnitp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpndmJ3ZXZlempnenNhbXFuaXRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE3MzQwMiwiZXhwIjoyMDY3NzQ5NDAyfQ.27t6k7ofO6nqUSnlOVNtJkGPACFp09X0YLGqFh5zkQs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Iniciando migração do sistema de notificações...');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250117_fix_notifications_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar migração
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Erro ao executar migração:', error);
      
      // Tentar executar partes da migração manualmente
      console.log('🔄 Tentando executar migração em partes...');
      
      // 1. Adicionar coluna sender_id
      console.log('📝 Adicionando coluna sender_id...');
      const { error: senderError } = await supabase
        .from('notifications')
        .select('sender_id')
        .limit(1);
      
      if (senderError && senderError.code === 'PGRST116') {
        // Coluna não existe, criar
        await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;'
        });
        console.log('✅ Coluna sender_id adicionada');
      } else {
        console.log('✅ Coluna sender_id já existe');
      }
      
      // 2. Adicionar coluna content
      console.log('📝 Adicionando coluna content...');
      const { error: contentError } = await supabase
        .from('notifications')
        .select('content')
        .limit(1);
      
      if (contentError && contentError.code === 'PGRST116') {
        // Coluna não existe, criar
        await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE notifications ADD COLUMN IF NOT EXISTS content TEXT;'
        });
        console.log('✅ Coluna content adicionada');
      } else {
        console.log('✅ Coluna content já existe');
      }
      
      // 3. Atualizar dados
      console.log('📝 Atualizando dados existentes...');
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ content: supabase.raw('message') })
        .is('content', null);
      
      if (updateError) {
        console.log('⚠️  Erro ao atualizar dados:', updateError.message);
      } else {
        console.log('✅ Dados atualizados');
      }
      
    } else {
      console.log('✅ Migração executada com sucesso');
    }
    
    // Verificar se as tabelas existem
    console.log('🔍 Verificando estrutura das tabelas...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['notifications', 'notification_settings']);
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError);
    } else {
      console.log('✅ Tabelas encontradas:', tables?.map(t => t.table_name));
    }
    
    // Testar criação de notificação
    console.log('🧪 Testando criação de notificação...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
    } else if (users && users.length > 0) {
      const testUserId = users[0].id;
      
      const { data: testNotification, error: testError } = await supabase
        .from('notifications')
        .insert({
          user_id: testUserId,
          type: 'system',
          title: 'Teste de Migração',
          message: 'Sistema de notificações funcionando!',
          content: 'Sistema de notificações funcionando!',
          data: { test: true }
        })
        .select('id')
        .single();
      
      if (testError) {
        console.error('❌ Erro ao criar notificação de teste:', testError);
      } else {
        console.log('✅ Notificação de teste criada:', testNotification.id);
        
        // Remover notificação de teste
        await supabase
          .from('notifications')
          .delete()
          .eq('id', testNotification.id);
        
        console.log('✅ Notificação de teste removida');
      }
    }
    
    console.log('🎉 Migração concluída!');
    
  } catch (error) {
    console.error('💥 Erro durante a migração:', error);
  }
}

// Executar migração
runMigration();