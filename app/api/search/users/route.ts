import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const suggested = searchParams.get("suggested")
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")

    // Buscar usuário autenticado
    const { data: authUser } = await supabase.auth.getUser()
    const userId = authUser?.user?.id

    if (suggested) {
      const { data: users, error } = await supabase
        .rpc('search_users_with_suggestions', {
          search_query: '',
          limit_count: 20,
          offset_count: 0,
          exclude_user_id: userId,
          suggestions_only: true
        })
    
      if (error) {
        console.error("Erro na busca de sugestões:", error)
        return NextResponse.json({ error: "Falha na busca" }, { status: 500 })
      }

      // Verificar follows
      const userIds = users?.map((u: { id: string }) => u.id) || []
      const { data: follows } = userId && userIds.length > 0
        ? await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", userId)
            .in("following_id", userIds)
        : { data: [] }
    
      // Corrigindo o erro de tipo implícito de 'any' para o parâmetro 'u'
      const followingIds = new Set(follows?.map((f: { following_id: string }) => f.following_id) || [])

      const results = users?.map((u: any) => ({
        ...u,
        is_following: followingIds.has(u.id),
        profileImage: u.avatar_url,
        backgroundImage: u.cover_url || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=200&fit=crop",
        verified: u.is_verified,
        tags: u.interests || [],
        rating: 4.5,
        followers: u.stats?.followers || 0,
        following: u.stats?.following || 0,
        description: u.bio || "Usuário do OpenLove",
        joinedDate: new Date(u.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        tokens: u.tokens || 0,
        tokens_received: u.tokens_received || 0
      })) || []
    
      return NextResponse.json({ data: results })
    }

    // Busca normal por query
    if (!query) {
      return NextResponse.json({ data: [] })
    }
    
    const { data: users, error } = await supabase
      .rpc('search_users_with_suggestions', {
        search_query: query,
        limit_count: 20,
        offset_count: 0,
        exclude_user_id: userId,
        suggestions_only: false
      })
    
    if (error) {
      console.error("Erro na busca de usuários:", error)
      return NextResponse.json({ error: "Falha na busca" }, { status: 500 })
    }

    // Verificar se já segue cada usuário
    // Corrigindo o erro de tipo implícito de 'any' para o parâmetro 'u'
    const userIds = users?.map((u: { id: string }) => u.id) || []
    const { data: follows } = userId && userIds.length > 0
      ? await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId)
          .in("following_id", userIds)
      : { data: [] }

    // Corrigindo o erro de tipo implícito de 'any' para o parâmetro 'u'
    const followingIds = new Set(follows?.map((f: { following_id: string }) => f.following_id) || [])

    const results = users?.map((u: any) => ({
      ...u,
      is_following: followingIds.has(u.id),
      // Adicionar dados formatados para o ProfileCard
      profileImage: u.avatar_url,
      backgroundImage: u.cover_url || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=200&fit=crop",
      verified: u.is_verified,
      tags: u.interests || [],
      rating: 4.5,
      followers: u.stats?.followers || 0,
      following: u.stats?.following || 0,
      description: u.bio || "Usuário do OpenLove",
      joinedDate: new Date(u.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    })) || []

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error("Error in user search API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
