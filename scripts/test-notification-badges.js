const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase
const supabaseUrl = 'https://jgvbwevezjgzsamqnitp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpndmJ3ZXZlempnenNhbXFuaXRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE3MzQwMiwiZXhwIjoyMDY3NzQ5NDAyfQ.27t6k7ofO6nqUSnlOVNtJkGPACFp09X0YLGqFh5zkQs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNotificationBadges() {
  try {
    console.log('🧪 Testando badges de notificação...');
    
    // 1. Buscar usuário para teste
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado para teste');
      return;
    }
    
    const testUser = users[0];
    console.log('👤 Usuário de teste:', testUser.name);
    
    // 2. Criar notificações de teste
    console.log('📝 Criando notificações de teste...');
    
    const notifications = [
      {
        user_id: testUser.id,
        type: 'like',
        title: 'Novo curtida',
        message: 'Alguém curtiu seu post',
        content: 'Alguém curtiu seu post',
        data: { test: true }
      },
      {
        user_id: testUser.id,
        type: 'comment',
        title: 'Novo comentário',
        message: 'Alguém comentou em seu post',
        content: 'Alguém comentou em seu post',
        data: { test: true }
      },
      {
        user_id: testUser.id,
        type: 'follow',
        title: 'Novo seguidor',
        message: 'Alguém começou a seguir você',
        content: 'Alguém começou a seguir você',
        data: { test: true }
      }
    ];
    
    const { data: createdNotifications, error: createError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select('id, type, title');
    
    if (createError) {
      console.error('❌ Erro ao criar notificações:', createError);
      return;
    }
    
    console.log('✅ Notificações criadas:', createdNotifications?.length || 0);
    
    // 3. Verificar contagem de notificações
    console.log('🔍 Verificando contagem de notificações...');
    
    const { data: notificationCount, error: countError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', testUser.id)
      .eq('is_read', false);
    
    if (countError) {
      console.error('❌ Erro ao contar notificações:', countError);
    } else {
      console.log('📊 Notificações não lidas:', notificationCount?.length || 0);
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
      const byType = stats?.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Estatísticas:');
      console.log('  - Total:', totalCount);
      console.log('  - Não lidas:', unreadCount);
      console.log('  - Por tipo:', byType);
    }
    
    // 5. Limpar notificações de teste
    console.log('🧹 Limpando notificações de teste...');
    
    const { error: cleanupError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', testUser.id)
      .eq('data->test', true);
    
    if (cleanupError) {
      console.error('❌ Erro ao limpar notificações:', cleanupError);
    } else {
      console.log('✅ Notificações de teste removidas');
    }
    
    console.log('🎉 Teste concluído!');
    
  } catch (error) {
    console.error('💥 Erro durante o teste:', error);
  }
}

// Executar teste
testNotificationBadges();