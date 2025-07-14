import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Função para calcular distância entre coordenadas
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const supabase = await createRouteHandlerClient()
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: "Username é obrigatório" }, { status: 400 })
    }

    // Buscar usuário autenticado atual
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    const currentUserId = currentUser?.id

    // ✅ BUSCAR PERFIL NA TABELA USERS (NÃO PROFILES)
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        username,
        name,
        bio,
        avatar_url,
        cover_url,
        location,
        age,
        gender,
        interests,
        relationship_status,
        looking_for,
        is_premium,
        is_verified,
        is_active,
        last_seen,
        created_at,
        updated_at,
        premium_expires_at,
        birth_date,
        privacy_settings,
        stats,
        plano,
        status_assinatura,
        first_name,
        last_name,
        profile_type,
        seeking,
        other_interest,
        uf,
        latitude,
        longitude,
        partner,
        wallet_balance,
        tokens,
        tokens_received
      `)
      .eq("username", username)
      .eq("is_active", true)
      .single()

    if (profileError || !profile) {
      console.error("Erro ao buscar perfil:", profileError)
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 })
    }

    // Buscar posts do usuário
    const { data: posts } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        media_urls,
        media_types,
        hashtags,
        mentions,
        visibility,
        location,
        is_event,
        event_details,
        is_premium_content,
        price,
        stats,
        created_at
      `)
      .eq("user_id", profile.id)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(12)

    // Buscar seguidores
    const { data: followers } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", profile.id)

    // Buscar seguindo
    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", profile.id)

    // Verificar se o usuário atual está seguindo este perfil
    let isFollowing = false
    let followStatus = null
    if (currentUserId && currentUserId !== profile.id) {
      const { data: followData } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", profile.id)
        .single()

      isFollowing = !!followData
      followStatus = followData ? "following" : "not_following"
    }

    // Buscar amigos (relacionamentos mútuos)
    let friends: any[] = []
    if (currentUserId) {
      const { data: mutualFollows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", profile.id)
        .in("following_id", [currentUserId])

      if (mutualFollows && mutualFollows.length > 0) {
        friends = mutualFollows.map(f => ({ id: f.following_id }))
      }
    }

    // Calcular distância se ambos têm coordenadas
    let distance = null
    if (currentUserId && currentUserId !== profile.id) {
      const { data: currentUserProfile } = await supabase
        .from("users")
        .select("latitude, longitude")
        .eq("id", currentUserId)
        .single()

      if (
        currentUserProfile?.latitude &&
        currentUserProfile?.longitude &&
        profile.latitude &&
        profile.longitude
      ) {
        distance = calculateDistance(
          currentUserProfile.latitude,
          currentUserProfile.longitude,
          profile.latitude,
          profile.longitude
        )
      }
    }

    // Registrar visualização do perfil (se não for o próprio perfil)
    if (currentUserId && currentUserId !== profile.id) {
      // Verificar se existe tabela profile_views
      const { error: viewError } = await supabase
        .from("post_interactions")
        .insert({
          user_id: currentUserId,
          post_id: null, // Não é um post
          interaction_type: "profile_view"
        })
      
      // Ignorar erro se a tabela não existir
      if (viewError) {
        console.log("Aviso: Não foi possível registrar visualização do perfil")
      }
    }

    // Buscar eventos do usuário (se ele criou algum)
    const { data: events } = await supabase
      .from("events")
      .select(`
        id,
        title,
        description,
        event_date,
        location,
        max_participants,
        current_participants,
        category,
        settings,
        status
      `)
      .eq("creator_id", profile.id)
      .eq("status", "active")
      .order("event_date", { ascending: true })
      .limit(5)

    // Montar resposta completa
    const result = {
      profile: {
        // Dados básicos
        id: profile.id,
        email: profile.email,
        username: profile.username,
        name: profile.name,
        bio: profile.bio || "",
        avatar_url: profile.avatar_url,
        cover_url: profile.cover_url,
        location: profile.location,
        age: profile.age,
        gender: profile.gender,
        interests: profile.interests || [],
        relationship_status: profile.relationship_status,
        looking_for: profile.looking_for || [],
        
        // Status e verificações
        is_premium: profile.is_premium,
        is_verified: profile.is_verified,
        is_active: profile.is_active,
        last_seen: profile.last_seen,
        
        // Datas
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        premium_expires_at: profile.premium_expires_at,
        birth_date: profile.birth_date,
        
        // Configurações
        privacy_settings: profile.privacy_settings,
        stats: profile.stats,
        
        // Plano
        plano: profile.plano,
        status_assinatura: profile.status_assinatura,
        
        // Dados extras
        first_name: profile.first_name,
        last_name: profile.last_name,
        profile_type: profile.profile_type,
        seeking: profile.seeking,
        other_interest: profile.other_interest,
        uf: profile.uf,
        partner: profile.partner,
        
        // Economia
        wallet_balance: profile.wallet_balance,
        tokens: profile.tokens,
        tokens_received: profile.tokens_received,
        
        // Contadores calculados
        followers_count: (followers || []).length,
        following_count: (following || []).length,
        posts_count: (posts || []).length,
        events_count: (events || []).length,
        
        // Localização
        distance_km: distance,
        
        // Estatísticas de visualização (mockado por enquanto)
        view_stats: {
          total_views: 0,
          unique_viewers: 0,
          views_today: 0,
          views_this_week: 0,
          views_this_month: 0
        }
      },
      
      // Dados relacionados
      posts: posts || [],
      events: events || [],
      friends: friends,
      
      // Status de relacionamento com usuário atual
      is_following: isFollowing,
      follow_status: followStatus,
      can_message: currentUserId ? !profile.privacy_settings?.allow_messages || profile.privacy_settings.allow_messages !== "none" : false,
      is_own_profile: currentUserId === profile.id
    }

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error("Erro na API de perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Função para atualizar perfil
export async function PUT(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const supabase = await createRouteHandlerClient()
    const { username } = params

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se é o próprio perfil
    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Não autorizado a editar este perfil" }, { status: 403 })
    }

    const body = await request.json()
    
    // Validar e sanitizar dados
    const allowedFields = [
      'name', 'bio', 'location', 'age', 'gender', 'interests',
      'relationship_status', 'looking_for', 'first_name', 'last_name',
      'profile_type', 'seeking', 'other_interest', 'uf'
    ]
    
    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Atualizar perfil
    const { data: updatedProfile, error: updateError } = await supabase
      .from("users")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: updatedProfile })

  } catch (error) {
    console.error("Erro na atualização do perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}