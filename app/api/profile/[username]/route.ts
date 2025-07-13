import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/app/lib/database.types"

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Buscar usuário autenticado
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = user?.id

    // Buscar perfil pelo username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", params.username)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 })
    }

    // Buscar mídia do usuário
    const { data: media } = await supabase
      .from("media")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })

    // Buscar posts do usuário
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10)

    // Buscar estatísticas de seguidores/seguindo
    const { data: followers } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", profile.id)

    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", profile.id)

    // Verificar se o usuário atual segue este perfil
    let isFollowing = false
    if (currentUserId) {
      const { data: followStatus } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", profile.id)
        .single()
      
      isFollowing = !!followStatus
    }

    // Buscar amigos (se o usuário atual estiver logado)
    let friends: any[] = []
    if (currentUserId) {
      const { data: friendships } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", profile.id)
        .eq("status", "accepted")

      if (friendships) {
        friends = friendships.map(f => ({ id: f.friend_id }))
      }
    }

    // Calcular distância se o usuário atual tiver localização
    let distance = null
    if (currentUserId) {
      const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("latitude, longitude")
        .eq("id", currentUserId)
        .single()

      if (currentUserProfile?.latitude && currentUserProfile?.longitude && 
          profile.latitude && profile.longitude) {
        distance = calculateDistance(
          currentUserProfile.latitude,
          currentUserProfile.longitude,
          profile.latitude,
          profile.longitude
        )
      }
    }

    // Registrar visualização do perfil
    if (currentUserId && currentUserId !== profile.id) {
      await supabase.rpc("register_profile_view", {
        target_profile_id: profile.id
      })
    }

    // Buscar estatísticas de visualização
    const { data: viewStats } = await supabase
      .rpc("get_profile_view_stats", {
        target_profile_id: profile.id
      })

    const result = {
      profile: {
        ...profile,
        followers_count: (followers || []).length,
        following_count: (following || []).length,
        posts_count: (posts || []).length,
        media_count: (media || []).length,
        distance_km: distance,
        view_stats: viewStats?.[0] || {
          total_views: 0,
          unique_viewers: 0,
          views_today: 0,
          views_this_week: 0,
          views_this_month: 0
        }
      },
      media: media || [],
      posts: posts || [],
      friends: friends,
      is_following: isFollowing,
      can_message: currentUserId ? await canSendMessage(currentUserId, profile.id, supabase) : false
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Função para calcular distância entre dois pontos
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c)
}

// Função para verificar se pode enviar mensagem
async function canSendMessage(senderId: string, receiverId: string, supabase: any): Promise<boolean> {
  try {
    const { data } = await supabase.rpc("can_send_message", {
      target_user_id: receiverId
    })
    return data || false
  } catch (error) {
    console.error("Error checking message permission:", error)
    return false
  }
} 