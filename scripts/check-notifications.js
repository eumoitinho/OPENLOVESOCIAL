const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase
const supabaseUrl = 'https://jgvbwevezjgzsamqnitp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpndmJ3ZXZlempnenNhbXFuaXRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE3MzQwMiwiZXhwIjoyMDY3NzQ5NDAyfQ.27t6k7ofO6nqUSnlOVNtJkGPACFp09X0YLGqFh5zkQs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNotificationSystem() {
  try {
    console.log('🔍 Verificando sistema de notificações...');
    
    // 1. Verificar se tabela notifications existe
    console.log('📝 Verificando tabela notifications...');
    const { data: notifications, error: notifyError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (notifyError) {
      console.error('❌ Tabela notifications não existe ou tem erro:', notifyError.message);
      
      // Tentar criar tabela básica
      console.log('🔨 Tentando criar tabela notifications...');
      // Não podemos criar via cliente, precisamos usar SQL Editor
      console.log('ℹ️  Execute o SQL script manualmente no Supabase SQL Editor');
      
    } else {
      console.log('✅ Tabela notifications existe');
      console.log('📊 Registros encontrados:', notifications?.length || 0);
    }
    
    // 2. Verificar se tabela notification_settings existe
    console.log('📝 Verificando tabela notification_settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .limit(1);
    
    if (settingsError) {
      console.error('❌ Tabela notification_settings não existe ou tem erro:', settingsError.message);
    } else {
      console.log('✅ Tabela notification_settings existe');
      console.log('📊 Registros encontrados:', settings?.length || 0);
    }
    
    // 3. Verificar se usuários existem
    console.log('👥 Verificando usuários...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .limit(3);
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message);
    } else {
      console.log('✅ Usuários encontrados:', users?.length || 0);
      if (users && users.length > 0) {
        console.log('👤 Primeiro usuário:', users[0].name || users[0].id);
      }
    }
    
    console.log('🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('💥 Erro durante a verificação:', error);
  }
}

// Executar verificação
checkNotificationSystem();