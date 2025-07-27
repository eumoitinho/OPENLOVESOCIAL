"use client"

import { useEffect, useCallback } from "react"
import { createClient } from "@/app/lib/supabase-browser"

interface PremiumNotificationOptions {
  userId: string
  onPremiumExpiring?: (daysRemaining: number) => void
  onPremiumExpired?: () => void
  onPaymentFailed?: () => void
  onPaymentSuccess?: () => void
}

export function usePremiumNotifications(options: PremiumNotificationOptions) {
  const supabase = createClient()

  // Check premium status and create notifications if needed
  const checkPremiumStatus = useCallback(async () => {
    if (!options.userId) return

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, is_premium, premium_expires_at, premium_type, premium_status')
        .eq('id', options.userId)
        .single()

      if (error) throw error

      if (user?.premium_expires_at) {
        const expiresAt = new Date(user.premium_expires_at)
        const now = new Date()
        const diffInDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Check if premium is expiring soon (7 days or less)
        if (diffInDays <= 7 && diffInDays > 0 && user.is_premium) {
          // Check if we already sent this notification today
          const today = new Date().toDateString()
          const lastNotificationKey = `premium_expiring_${options.userId}_${today}`
          
          if (!localStorage.getItem(lastNotificationKey)) {
            // Create expiring notification
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert({
                recipient_id: options.userId,
                sender_id: options.userId,
                type: 'subscription_expiring',
                title: `Seu plano premium expira em ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`,
                content: 'Renove agora para continuar aproveitando todos os benefícios premium.',
                icon: 'crown',
                related_data: {
                  days_remaining: diffInDays,
                  expires_at: user.premium_expires_at,
                  premium_type: user.premium_type
                },
                action_text: 'Renovar plano',
                action_url: '/settings/billing',
                is_read: false
              })

            if (!notificationError) {
              localStorage.setItem(lastNotificationKey, 'true')
              options.onPremiumExpiring?.(diffInDays)
            }
          }
        }

        // Check if premium has expired
        if (diffInDays <= 0 && !user.is_premium && user.premium_status === 'inactive') {
          const expiredKey = `premium_expired_${options.userId}_${expiresAt.toDateString()}`
          
          if (!localStorage.getItem(expiredKey)) {
            // Create expired notification
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert({
                recipient_id: options.userId,
                sender_id: options.userId,
                type: 'subscription_expiring',
                title: 'Seu plano premium expirou',
                content: 'Renove agora para continuar aproveitando todos os benefícios premium.',
                icon: 'crown-off',
                related_data: {
                  expired_at: user.premium_expires_at,
                  premium_type: user.premium_type
                },
                action_text: 'Renovar plano',
                action_url: '/settings/billing',
                is_read: false
              })

            if (!notificationError) {
              localStorage.setItem(expiredKey, 'true')
              options.onPremiumExpired?.()
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status premium:', err)
    }
  }, [options, supabase])

  // Check payment status
  const checkPaymentStatus = useCallback(async () => {
    if (!options.userId) return

    try {
      // Check for recent payment intents
      const { data: paymentIntents, error } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('user_id', options.userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      paymentIntents?.forEach(async (payment) => {
        const paymentDate = new Date(payment.created_at)
        const now = new Date()
        const diffInHours = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60)

        // Only check payments from the last 24 hours
        if (diffInHours <= 24) {
          const notificationKey = `payment_${payment.status}_${payment.id}`
          
          if (!localStorage.getItem(notificationKey)) {
            if (payment.status === 'succeeded') {
              // Payment successful notification
              const { error: notificationError } = await supabase
                .from('notifications')
                .insert({
                  recipient_id: options.userId,
                  sender_id: options.userId,
                  type: 'payment_success',
                  title: 'Pagamento realizado com sucesso! 🎉',
                  content: `Seu plano ${payment.plan_type || 'premium'} foi ativado com sucesso.`,
                  icon: 'credit-card',
                  related_data: {
                    payment_id: payment.id,
                    amount: payment.amount,
                    plan_type: payment.plan_type,
                    payment_method: payment.payment_method
                  },
                  action_text: 'Ver plano',
                  action_url: '/settings/billing',
                  is_read: false
                })

              if (!notificationError) {
                localStorage.setItem(notificationKey, 'true')
                options.onPaymentSuccess?.()
              }
            } else if (payment.status === 'failed') {
              // Payment failed notification
              const { error: notificationError } = await supabase
                .from('notifications')
                .insert({
                  recipient_id: options.userId,
                  sender_id: options.userId,
                  type: 'payment_failed',
                  title: 'Falha no pagamento',
                  content: 'Não foi possível processar seu pagamento. Tente novamente ou use outro método.',
                  icon: 'credit-card',
                  related_data: {
                    payment_id: payment.id,
                    amount: payment.amount,
                    plan_type: payment.plan_type,
                    payment_method: payment.payment_method,
                    error_message: payment.error_message
                  },
                  action_text: 'Tentar novamente',
                  action_url: '/settings/billing',
                  is_read: false
                })

              if (!notificationError) {
                localStorage.setItem(notificationKey, 'true')
                options.onPaymentFailed?.()
              }
            }
          }
        }
      })
    } catch (err) {
      console.error('Erro ao verificar status de pagamento:', err)
    }
  }, [options, supabase])

  // Set up periodic checks
  useEffect(() => {
    if (!options.userId) return

    // Initial check
    checkPremiumStatus()
    checkPaymentStatus()

    // Check every hour
    const interval = setInterval(() => {
      checkPremiumStatus()
      checkPaymentStatus()
    }, 60 * 60 * 1000) // 1 hour

    return () => clearInterval(interval)
  }, [options.userId, checkPremiumStatus, checkPaymentStatus])

  // Listen for real-time updates on user premium status
  useEffect(() => {
    if (!options.userId) return

    const channel = supabase
      .channel('premium_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${options.userId}`
        },
        (payload) => {
          // Recheck status when user data changes
          setTimeout(() => {
            checkPremiumStatus()
          }, 1000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [options.userId, supabase, checkPremiumStatus])

  return {
    checkPremiumStatus,
    checkPaymentStatus
  }
}
