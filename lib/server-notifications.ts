import { createRouteHandlerClient } from '@/app/lib/supabase-server'
import { cookies } from 'next/headers'

export type NotificationType = 
  | 'follow' | 'unfollow' | 'friend_request' | 'friend_accept'
  | 'post_like' | 'post_comment' | 'comment_like' | 'comment_reply'
  | 'post_share' | 'mention' | 'event_invitation' | 'event_reminder'
  | 'community_invitation' | 'community_post' | 'message'
  | 'payment_success' | 'payment_failed' | 'subscription_expiring'
  | 'verification_approved' | 'verification_rejected' | 'system'

interface CreateNotificationParams {
  recipientId: string
  senderId: string
  type: NotificationType
  title: string
  content?: string
  icon?: string
  actionText?: string
  actionUrl?: string
  relatedData?: Record<string, any>
}

// Ícones padrão para cada tipo de notificação
const defaultIcons: Record<string, string> = {
  'follow': 'user-plus',
  'unfollow': 'user-minus',
  'friend_request': 'users',
  'friend_accept': 'user-check',
  'post_like': 'heart',
  'post_comment': 'message-circle',
  'comment_like': 'heart',
  'comment_reply': 'reply',
  'post_share': 'share',
  'mention': 'at-sign',
  'event_invitation': 'calendar',
  'event_reminder': 'bell',
  'community_invitation': 'users',
  'community_post': 'file-text',
  'message': 'mail',
  'payment_success': 'check-circle',
  'payment_failed': 'x-circle',
  'subscription_expiring': 'alert-circle',
  'verification_approved': 'check-circle',
  'verification_rejected': 'x-circle',
  'system': 'info'
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: params.recipientId,
        sender_id: params.senderId,
        type: params.type,
        title: params.title,
        content: params.content,
        icon: params.icon || defaultIcons[params.type] || 'bell',
        action_text: params.actionText,
        action_url: params.actionUrl,
        related_data: params.relatedData || {},
        is_read: false,
        is_deleted: false,
        sent_via_email: false,
        sent_via_push: false
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar notificação:', error)
      return null
    }

    return notification
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return null
  }
}

// Funções auxiliares para criar notificações específicas
export const serverNotifications = {
  // Interações de posts
  async postLiked(postId: string, postAuthorId: string, senderId: string, postTitle?: string) {
    return createNotification({
      recipientId: postAuthorId,
      senderId,
      type: 'post_like',
      title: 'Alguém curtiu seu post',
      content: postTitle ? `"${postTitle}"` : undefined,
      actionUrl: `/posts/${postId}`,
      actionText: 'Ver post',
      relatedData: { post_id: postId }
    })
  },

  async postCommented(postId: string, postAuthorId: string, senderId: string, commentPreview: string) {
    return createNotification({
      recipientId: postAuthorId,
      senderId,
      type: 'post_comment',
      title: 'Novo comentário no seu post',
      content: commentPreview.length > 100 ? commentPreview.substring(0, 100) + '...' : commentPreview,
      actionUrl: `/posts/${postId}`,
      actionText: 'Ver comentário',
      relatedData: { post_id: postId }
    })
  },

  async postShared(postId: string, postAuthorId: string, senderId: string) {
    return createNotification({
      recipientId: postAuthorId,
      senderId,
      type: 'post_share',
      title: 'Alguém compartilhou seu post',
      actionUrl: `/posts/${postId}`,
      actionText: 'Ver post',
      relatedData: { post_id: postId }
    })
  },

  // Interações de comentários
  async commentLiked(commentId: string, commentAuthorId: string, senderId: string, postId: string) {
    return createNotification({
      recipientId: commentAuthorId,
      senderId,
      type: 'comment_like',
      title: 'Alguém curtiu seu comentário',
      actionUrl: `/posts/${postId}`,
      actionText: 'Ver comentário',
      relatedData: { comment_id: commentId, post_id: postId }
    })
  },

  async commentReplied(commentId: string, commentAuthorId: string, senderId: string, postId: string, replyPreview: string) {
    return createNotification({
      recipientId: commentAuthorId,
      senderId,
      type: 'comment_reply',
      title: 'Nova resposta ao seu comentário',
      content: replyPreview.length > 100 ? replyPreview.substring(0, 100) + '...' : replyPreview,
      actionUrl: `/posts/${postId}`,
      actionText: 'Ver resposta',
      relatedData: { comment_id: commentId, post_id: postId }
    })
  },

  // Interações sociais
  async userFollowed(followerId: string, followedId: string, senderId: string) {
    return createNotification({
      recipientId: followedId,
      senderId,
      type: 'follow',
      title: 'Novo seguidor',
      actionUrl: `/profile/${followerId}`,
      actionText: 'Ver perfil',
      relatedData: { user_id: followerId }
    })
  },

  async friendRequestSent(requesterId: string, recipientId: string, senderId: string) {
    return createNotification({
      recipientId: recipientId,
      senderId,
      type: 'friend_request',
      title: 'Nova solicitação de amizade',
      actionUrl: `/profile/${requesterId}`,
      actionText: 'Ver perfil',
      relatedData: { user_id: requesterId }
    })
  },

  async friendRequestAccepted(accepterId: string, requesterId: string, senderId: string) {
    return createNotification({
      recipientId: requesterId,
      senderId,
      type: 'friend_accept',
      title: 'Solicitação de amizade aceita',
      actionUrl: `/profile/${accepterId}`,
      actionText: 'Ver perfil',
      relatedData: { user_id: accepterId }
    })
  },

  // Menções
  async userMentioned(mentionedUserId: string, senderId: string, postId: string, context: 'post' | 'comment') {
    return createNotification({
      recipientId: mentionedUserId,
      senderId,
      type: 'mention',
      title: context === 'post' ? 'Você foi mencionado em um post' : 'Você foi mencionado em um comentário',
      actionUrl: `/posts/${postId}`,
      actionText: 'Ver menção',
      relatedData: { post_id: postId, context }
    })
  },

  // Sistema e verificação
  async verificationApproved(userId: string, senderId: string) {
    return createNotification({
      recipientId: userId,
      senderId,
      type: 'verification_approved',
      title: 'Sua verificação foi aprovada!',
      content: 'Parabéns! Sua conta agora está verificada.',
      icon: 'check-circle',
      actionUrl: '/settings/profile',
      actionText: 'Ver perfil'
    })
  },

  async verificationRejected(userId: string, senderId: string, reason?: string) {
    return createNotification({
      recipientId: userId,
      senderId,
      type: 'verification_rejected',
      title: 'Verificação não aprovada',
      content: reason || 'Sua solicitação de verificação não foi aprovada. Por favor, tente novamente.',
      icon: 'x-circle',
      actionUrl: '/settings/verification',
      actionText: 'Tentar novamente'
    })
  },

  // Pagamentos
  async paymentSuccess(userId: string, senderId: string, plan: string, amount: string) {
    return createNotification({
      recipientId: userId,
      senderId,
      type: 'payment_success',
      title: 'Pagamento confirmado',
      content: `Seu pagamento de ${amount} para o plano ${plan} foi processado com sucesso.`,
      icon: 'check-circle',
      actionUrl: '/settings/subscription',
      actionText: 'Ver detalhes'
    })
  },

  async paymentFailed(userId: string, senderId: string, reason?: string) {
    return createNotification({
      recipientId: userId,
      senderId,
      type: 'payment_failed',
      title: 'Falha no pagamento',
      content: reason || 'Não foi possível processar seu pagamento. Por favor, tente novamente.',
      icon: 'x-circle',
      actionUrl: '/settings/payment',
      actionText: 'Tentar novamente'
    })
  },

  async subscriptionExpiring(userId: string, senderId: string, daysLeft: number) {
    return createNotification({
      recipientId: userId,
      senderId,
      type: 'subscription_expiring',
      title: 'Assinatura expirando',
      content: `Sua assinatura expira em ${daysLeft} dias. Renove para continuar aproveitando todos os benefícios.`,
      icon: 'alert-circle',
      actionUrl: '/settings/subscription',
      actionText: 'Renovar agora'
    })
  },

  // Sistema geral
  async systemNotification(userId: string, senderId: string, title: string, content: string, actionUrl?: string, actionText?: string) {
    return createNotification({
      recipientId: userId,
      senderId,
      type: 'system',
      title,
      content,
      icon: 'info',
      actionUrl,
      actionText
    })
  }
}