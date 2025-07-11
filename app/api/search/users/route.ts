import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const suggested = searchParams.get("suggested")
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")

    // Se for busca de sugestões, retornar usuários recomendados
    if (suggested) {
      const { data: users, error } = await supabase
        .from("users")
        .select(`
          id,
          name,
          username,
          avatar_url,
          cover_url,
          location,
          bio,
          age,
          gender,
          interests,
          relationship_status,
          looking_for,
          is_premium,
          is_verified,
          stats,
          created_at
        `)
        .neq("id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error searching suggested users:", error)
        return NextResponse.json({ error: "Search failed" }, { status: 500 })
      }

      // Verificar se já segue cada usuário
      const userIds = users?.map((u) => u.id) || []
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id)
        .in("following_id", userIds)

      const followingIds = new Set(follows?.map(f => f.following_id) || [])

      const results = users?.map((u) => ({
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
    }

    // Busca normal por query
    if (!query) {
      return NextResponse.json({ data: [] })
    }

    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id,
        name,
        username,
        avatar_url,
        cover_url,
        location,
        bio,
        age,
        gender,
        interests,
        relationship_status,
        looking_for,
        is_premium,
        is_verified,
        stats,
        created_at
      `)
      .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
      .neq("id", user.id)
      .eq("is_active", true)
      .limit(20)

    if (error) {
      console.error("Error searching users:", error)
      return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }

    // Verificar se já segue cada usuário
    const userIds = users?.map((u) => u.id) || []
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .in("following_id", userIds)

    const followingIds = new Set(follows?.map(f => f.following_id) || [])

    const results = users?.map((u) => ({
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
