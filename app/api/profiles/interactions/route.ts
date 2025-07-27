import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"

// API para rastrear interações entre usuários
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const body = await request.json()
    
    const { 
      targetUserId, 
      interactionType, 
      metadata = {} 
    } = body

    console.log("📊 [Interactions] Nova interação:", { targetUserId, interactionType, metadata })

    // Validar dados
    if (!targetUserId || !interactionType) {
      return NextResponse.json({ 
        error: "Dados obrigatórios não fornecidos" 
      }, { status: 400 })
    }

    // Validar tipos de interação
    const validTypes = [
      'view_profile', 'like', 'super_like', 'pass', 'message', 
      'block', 'report', 'follow', 'unfollow', 'visit_profile',
      'view_photos', 'share_profile', 'save_profile'
    ]
    
    if (!validTypes.includes(interactionType)) {
      return NextResponse.json({ 
        error: "Tipo de interação inválido" 
      }, { status: 400 })
    }

    // Buscar usuário autenticado
    const {
      data: { user },
      error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ 
        error: "Usuário não autenticado" 
      }, { status: 401 })
    }

    // Verificar se o usuário alvo existe
    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("id, username")
      .eq("id", targetUserId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json({ 
        error: "Usuário alvo não encontrado" 
      }, { status: 404 })
    }

    // Verificar se não é auto-interação
    if (user.id === targetUserId) {
      return NextResponse.json({ 
        error: "Não é possível interagir consigo mesmo" 
      }, { status: 400 })
    }

    // Verificar se já existe interação recente do mesmo tipo
    const { data: existingInteraction } = await supabase
      .from("interactions")
      .select("id, created_at")
      .eq("user_id", user.id)
      .eq("target_user_id", targetUserId)
      .eq("interaction_type", interactionType)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    // Evitar spam - limitar interações duplicadas
    if (existingInteraction) {
      const timeDiff = new Date().getTime() - new Date(existingInteraction.created_at).getTime()
      const minInterval = interactionType === 'view_profile' ? 60000 : 5000 // 1 min para view, 5s para outras
      
      if (timeDiff < minInterval) {
        return NextResponse.json({ 
          message: "Interação registrada recentemente",
          existing: true 
        })
      }
    }

    // Registrar a interação
    const { data: interaction, error: interactionError } = await supabase
      .from("interactions")
      .insert([{
        user_id: user.id,
        target_user_id: targetUserId,
        interaction_type: interactionType,
        metadata: metadata,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (interactionError) {
      console.error("❌ [Interactions] Erro ao registrar:", interactionError)
      return NextResponse.json({ 
        error: "Erro ao registrar interação",
        details: interactionError.message 
      }, { status: 500 })
    }

    // Atualizar estatísticas do usuário alvo (async)
    updateUserStats(supabase, targetUserId, interactionType)

    // Processar ações específicas baseadas no tipo de interação
    await processInteractionSideEffects(supabase, user.id, targetUserId, interactionType, metadata)

    console.log("✅ [Interactions] Interação registrada:", interaction.id)

    return NextResponse.json({
      success: true,
      interaction: {
        id: interaction.id,
        type: interactionType,
        targetUser: targetUser.username,
        timestamp: interaction.created_at
      },
      message: "Interação registrada com sucesso"
    })

  } catch (error) {
    console.error("❌ [Interactions] Erro:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}

// Buscar histórico de interações
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit
    const type = searchParams.get("type") // Filtrar por tipo
    const targetUserId = searchParams.get("targetUserId") // Filtrar por usuário alvo

    // Buscar usuário autenticado
    const {
      data: { user },
      error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ 
        error: "Usuário não autenticado" 
      }, { status: 401 })
    }

    // Construir query
    let query = supabase
      .from("interactions")
      .select(`
        id,
        interaction_type,
        metadata,
        created_at,
        target_user:users!interactions_target_user_id_fkey (
          id,
          username,
          name,
          avatar_url
        )
      `)
      .eq("user_id", user.id)

    // Aplicar filtros
    if (type) {
      query = query.eq("interaction_type", type)
    }

    if (targetUserId) {
      query = query.eq("target_user_id", targetUserId)
    }

    // Executar query
    const { data: interactions, error: interactionsError } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (interactionsError) {
      console.error("❌ [Interactions] Erro ao buscar:", interactionsError)
      return NextResponse.json({ 
        error: "Erro ao buscar interações",
        details: interactionsError.message 
      }, { status: 500 })
    }

    // Contar total para paginação
    const { count, error: countError } = await supabase
      .from("interactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    return NextResponse.json({
      data: interactions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (interactions?.length || 0) === limit
      }
    })

  } catch (error) {
    console.error("❌ [Interactions] Erro:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}

// Função para atualizar estatísticas do usuário
async function updateUserStats(supabase: any, targetUserId: string, interactionType: string) {
  try {
    // Buscar estatísticas atuais
    const { data: currentStats } = await supabase
      .from("users")
      .select("stats")
      .eq("id", targetUserId)
      .single()

    const stats = currentStats?.stats || {
      profile_views: 0,
      likes_received: 0,
      super_likes_received: 0,
      messages_received: 0,
      followers: 0
    }

    // Atualizar baseado no tipo de interação
    switch (interactionType) {
      case 'view_profile':
        stats.profile_views = (stats.profile_views || 0) + 1
        break
      case 'like':
        stats.likes_received = (stats.likes_received || 0) + 1
        break
      case 'super_like':
        stats.super_likes_received = (stats.super_likes_received || 0) + 1
        break
      case 'message':
        stats.messages_received = (stats.messages_received || 0) + 1
        break
      case 'follow':
        stats.followers = (stats.followers || 0) + 1
        break
      case 'unfollow':
        stats.followers = Math.max(0, (stats.followers || 0) - 1)
        break
    }

    // Atualizar no banco
    await supabase
      .from("users")
      .update({ 
        stats,
        updated_at: new Date().toISOString()
      })
      .eq("id", targetUserId)

    console.log("📈 [Stats] Estatísticas atualizadas para:", targetUserId)

  } catch (error) {
    console.error("❌ [Stats] Erro ao atualizar:", error)
  }
}

// Função para processar efeitos colaterais das interações
async function processInteractionSideEffects(
  supabase: any, 
  userId: string, 
  targetUserId: string, 
  interactionType: string, 
  metadata: any
) {
  try {
    switch (interactionType) {
      case 'like':
        // Verificar se é um match (like mútuo)
        const { data: reciprocalLike } = await supabase
          .from("interactions")
          .select("id")
          .eq("user_id", targetUserId)
          .eq("target_user_id", userId)
          .eq("interaction_type", "like")
          .single()

        if (reciprocalLike) {
          // Criar notificação de match
          await supabase
            .from("notifications")
            .insert([{
              user_id: userId,
              type: "match",
              title: "Novo Match!",
              message: "Vocês curtiram um ao outro!",
              data: { matched_user_id: targetUserId },
              created_at: new Date().toISOString()
            }])

          await supabase
            .from("notifications")
            .insert([{
              user_id: targetUserId,
              type: "match",
              title: "Novo Match!",
              message: "Vocês curtiram um ao outro!",
              data: { matched_user_id: userId },
              created_at: new Date().toISOString()
            }])

          console.log("💕 [Match] Match criado entre:", userId, "e", targetUserId)
        } else {
          // Criar notificação de like
          await supabase
            .from("notifications")
            .insert([{
              user_id: targetUserId,
              type: "like",
              title: "Alguém curtiu você!",
              message: "Você recebeu uma curtida",
              data: { from_user_id: userId },
              created_at: new Date().toISOString()
            }])
        }
        break

      case 'super_like':
        // Criar notificação de super like
        await supabase
          .from("notifications")
          .insert([{
            user_id: targetUserId,
            type: "super_like",
            title: "Super Like!",
            message: "Alguém te deu um super like!",
            data: { from_user_id: userId },
            created_at: new Date().toISOString()
          }])
        break

      case 'follow':
        // Criar notificação de follow
        await supabase
          .from("notifications")
          .insert([{
            user_id: targetUserId,
            type: "follow",
            title: "Novo seguidor!",
            message: "Alguém começou a te seguir",
            data: { from_user_id: userId },
            created_at: new Date().toISOString()
          }])
        break

      case 'view_profile':
        // Criar notificação de visualização (apenas para usuários premium)
        const { data: targetUserData } = await supabase
          .from("users")
          .select("is_premium")
          .eq("id", targetUserId)
          .single()

        if (targetUserData?.is_premium) {
          await supabase
            .from("notifications")
            .insert([{
              user_id: targetUserId,
              type: "profile_view",
              title: "Visualização do perfil",
              message: "Alguém visualizou seu perfil",
              data: { from_user_id: userId },
              created_at: new Date().toISOString()
            }])
        }
        break
    }

  } catch (error) {
    console.error("❌ [SideEffects] Erro ao processar:", error)
  }
} 
