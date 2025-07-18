const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jgvbwevezjgzsamqnitp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpndmJ3ZXZlempnenNhbXFuaXRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE3MzQwMiwiZXhwIjoyMDY3NzQ5NDAyfQ.27t6k7ofO6nqUSnlOVNtJkGPACFp09X0YLGqFh5zkQs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDynamicBadges() {
  try {
    console.log('🧪 Testando badges dinâmicos...');
    
    // 1. Buscar usuário
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return;
    }
    
    const testUser = users[0];
    console.log('👤 Usuário de teste:', testUser.name);
    
    // 2. Criar múltiplas notificações
    console.log('📝 Criando notificações para testar badges...');
    
    const notifications = [];
    for (let i = 1; i <= 5; i++) {
      notifications.push({
        user_id: testUser.id,
        type: i % 2 === 0 ? 'like' : 'comment',
        title: `Notificação de teste ${i}`,
        data: { test: true, number: i }
      });
    }
    
    const { data: createdNotifications, error: createError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select('id, type, title, is_read');
    
    if (createError) {
      console.error('❌ Erro ao criar notificações:', createError);
      return;
    }
    
    console.log('✅ Notificações criadas:', createdNotifications?.length || 0);
    
    // 3. Simular chamada do hook useNotifications
    console.log('🔍 Simulando hook useNotifications...');
    
    const { data: notificationData, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (fetchError) {
      console.error('❌ Erro ao buscar notificações:', fetchError);
      return;
    }
    
    // Calcular estatísticas como no hook
    const unread = notificationData?.filter(n => !n.is_read).length || 0;
    const mentions = notificationData?.filter(n => n.type === 'mention').length || 0;
    const events = notificationData?.filter(n => n.type === 'event').length || 0;
    const interactions = notificationData?.filter(n => ['like', 'comment', 'follow'].includes(n.type)).length || 0;
    
    const stats = {
      total: notificationData?.length || 0,
      unread,
      mentions,
      events,
      interactions
    };
    
    console.log('📊 Estatísticas calculadas:');
    console.log('  - Total:', stats.total);
    console.log('  - Não lidas:', stats.unread);
    console.log('  - Menções:', stats.mentions);
    console.log('  - Eventos:', stats.events);
    console.log('  - Interações:', stats.interactions);
    
    // 4. Testar comportamento do badge
    console.log('🏷️  Testando comportamento do badge:');
    
    // Badge de notificações
    const notificationBadge = {
      content: stats.unread > 99 ? '99+' : stats.unread,
      isInvisible: stats.unread === 0,
      color: 'danger'
    };
    
    console.log('  - Badge de notificações:', notificationBadge);
    
    // Badge de mensagens (simulado)
    const messageBadge = {
      content: 0, // Sem mensagens por enquanto
      isInvisible: true,
      color: 'primary'
    };
    
    console.log('  - Badge de mensagens:', messageBadge);
    
    // 5. Marcar algumas como lidas
    console.log('✅ Marcando algumas notificações como lidas...');
    
    const idsToMarkRead = createdNotifications?.slice(0, 2).map(n => n.id) || [];
    
    if (idsToMarkRead.length > 0) {
      const { error: markReadError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', idsToMarkRead);
      
      if (markReadError) {
        console.error('❌ Erro ao marcar como lidas:', markReadError);
      } else {
        console.log('✅ Notificações marcadas como lidas:', idsToMarkRead.length);
      }
    }
    
    // 6. Recalcular estatísticas
    console.log('🔄 Recalculando estatísticas...');
    
    const { data: updatedData, error: updateError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false });
    
    if (updateError) {
      console.error('❌ Erro ao buscar dados atualizados:', updateError);
    } else {
      const newUnread = updatedData?.filter(n => !n.is_read).length || 0;
      const newStats = {
        total: updatedData?.length || 0,
        unread: newUnread,
        mentions: updatedData?.filter(n => n.type === 'mention').length || 0,
        events: updatedData?.filter(n => n.type === 'event').length || 0,
        interactions: updatedData?.filter(n => ['like', 'comment', 'follow'].includes(n.type)).length || 0
      };
      
      console.log('📊 Novas estatísticas:');
      console.log('  - Total:', newStats.total);
      console.log('  - Não lidas:', newStats.unread);
      console.log('  - Interações:', newStats.interactions);
      
      const updatedBadge = {
        content: newStats.unread > 99 ? '99+' : newStats.unread,
        isInvisible: newStats.unread === 0,
        color: 'danger'
      };
      
      console.log('🏷️  Badge atualizado:', updatedBadge);
    }
    
    // 7. Limpar notificações de teste
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
    
    console.log('🎉 Teste de badges dinâmicos concluído!');
    
  } catch (error) {
    console.error('💥 Erro durante o teste:', error);
  }
}

// Executar teste
testDynamicBadges();