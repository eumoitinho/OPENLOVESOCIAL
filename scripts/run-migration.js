const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase
const supabaseUrl = 'https://jgvbwevezjgzsamqnitp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpndmJ3ZXZlempnenNhbXFuaXRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE3MzQwMiwiZXhwIjoyMDY3NzQ5NDAyfQ.27t6k7ofO6nqUSnlOVNtJkGPACFp09X0YLGqFh5zkQs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Iniciando migração do sistema de notificações...');
    
    // 1. Verificar se tabela notifications existe
    console.log('📝 Verificando estrutura da tabela notifications...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'notifications');
    
    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
      return;
    }
    
    console.log('✅ Colunas atuais na tabela notifications:', tableInfo?.map(c => c.column_name));
    
    // 2. Verificar se precisa criar notificação de teste
    console.log('🧪 Criando notificação de teste...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return;
    }
    
    if (users && users.length > 0) {
      const testUserId = users[0].id;
      
      const { data: testNotification, error: testError } = await supabase
        .from('notifications')
        .insert({
          user_id: testUserId,
          type: 'system',
          title: 'Teste de Sistema',
          message: 'Sistema de notificações funcionando!',
          data: { test: true }
        })
        .select('id')
        .single();
      
      if (testError) {
        console.error('❌ Erro ao criar notificação de teste:', testError);
      } else {
        console.log('✅ Notificação de teste criada:', testNotification.id);
      }
    }
    
    // 3. Verificar se pode buscar notificações
    console.log('🔍 Testando busca de notificações...');
    
    const { data: notifications, error: notifyError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5);
    
    if (notifyError) {
      console.error('❌ Erro ao buscar notificações:', notifyError);
    } else {
      console.log('✅ Notificações encontradas:', notifications?.length || 0);
    }
    
    // 4. Verificar se configurações existem
    console.log('📝 Verificando configurações de notificação...');
    
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .limit(1);
    
    if (settingsError) {
      console.error('❌ Erro ao verificar configurações:', settingsError);
    } else {
      console.log('✅ Configurações encontradas:', settings?.length || 0);
    }
    
    console.log('🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('💥 Erro durante a migração:', error);
  }
}

// Executar migração
runMigration();