const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase
const supabaseUrl = 'https://jgvbwevezjgzsamqnitp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpndmJ3ZXZlempnenNhbXFuaXRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE3MzQwMiwiZXhwIjoyMDY3NzQ5NDAyfQ.27t6k7ofO6nqUSnlOVNtJkGPACFp09X0YLGqFh5zkQs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixNotificationSchema() {
  try {
    console.log('🔧 Corrigindo schema de notificações...');
    
    // 1. Testar a estrutura atual
    console.log('🔍 Verificando estrutura atual...');
    
    const { data: currentNotifications, error: currentError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (currentError) {
      console.error('❌ Erro ao acessar notificações:', currentError);
      return;
    }
    
    console.log('✅ Tabela notifications acessível');
    
    // 2. Criar notificação com campos simples
    console.log('📝 Testando criação de notificação...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return;
    }
    
    const testUser = users[0];
    
    // Testar com campos básicos
    const { data: testNotification, error: testError } = await supabase
      .from('notifications')
      .insert({
        user_id: testUser.id,
        type: 'system',
        title: 'Teste de Sistema',
        data: { test: true }
      })
      .select('id, type, title, data')
      .single();
    
    if (testError) {
      console.error('❌ Erro ao criar notificação:', testError);
      return;
    }
    
    console.log('✅ Notificação criada:', testNotification.id);
    
    // 3. Verificar se podemos ler notificações
    console.log('🔍 Testando leitura de notificações...');
    
    const { data: notifications, error: readError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUser.id)
      .limit(5);
    
    if (readError) {
      console.error('❌ Erro ao ler notificações:', readError);
    } else {
      console.log('✅ Notificações encontradas:', notifications?.length || 0);
      if (notifications && notifications.length > 0) {
        console.log('📊 Primeira notificação:', {
          id: notifications[0].id,
          type: notifications[0].type,
          title: notifications[0].title,
          is_read: notifications[0].is_read
        });
      }
    }
    
    // 4. Testar estatísticas
    console.log('📈 Testando estatísticas...');
    
    const { data: stats, error: statsError } = await supabase
      .from('notifications')
      .select('type, is_read')
      .eq('user_id', testUser.id);
    
    if (statsError) {
      console.error('❌ Erro ao buscar estatísticas:', statsError);
    } else {
      const unreadCount = stats?.filter(n => !n.is_read).length || 0;
      const totalCount = stats?.length || 0;
      
      console.log('📊 Estatísticas:');
      console.log('  - Total:', totalCount);
      console.log('  - Não lidas:', unreadCount);
    }
    
    // 5. Limpar notificação de teste
    console.log('🧹 Limpando notificação de teste...');
    
    const { error: cleanupError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', testNotification.id);
    
    if (cleanupError) {
      console.error('❌ Erro ao limpar notificação:', cleanupError);
    } else {
      console.log('✅ Notificação de teste removida');
    }
    
    console.log('🎉 Teste de schema concluído!');
    
  } catch (error) {
    console.error('💥 Erro durante o teste:', error);
  }
}

// Executar teste
fixNotificationSchema();