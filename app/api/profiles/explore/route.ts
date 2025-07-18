import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit
    
    // Filtros
    const gender = searchParams.get("gender") || "all"
    const relationshipType = searchParams.get("relationshipType") || "all"
    const minAge = parseInt(searchParams.get("minAge") || "18")
    const maxAge = parseInt(searchParams.get("maxAge") || "65")
    const maxDistance = parseInt(searchParams.get("maxDistance") || "50")
    const interests = searchParams.get("interests")?.split(",").filter(Boolean) || []
    const location = searchParams.get("location") || ""
    const verified = searchParams.get("verified") === "true"
    const premium = searchParams.get("premium") === "true"
    const search = searchParams.get("search") || ""

    console.log("🔍 [Explore] Parâmetros de busca:", {
      page, limit, offset, gender, relationshipType, minAge, maxAge, 
      maxDistance, interests, location, verified, premium, search
    })

    // Buscar usuário autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("❌ [Explore] Usuário não autenticado")
      console.log("❌ [Explore] Erro de autenticação:", userError)
      console.log("❌ [Explore] Headers:", Object.fromEntries(request.headers.entries()))
      
      // Em desenvolvimento, retornar dados dummy
      if (process.env.NODE_ENV === "development") {
        console.log("🔧 [Explore] Retornando dados dummy para desenvolvimento")
        return NextResponse.json({
          data: [
            {
              id: "dummy-1",
              name: "Maria Silva",
              username: "maria_silva",
              avatar: "/placeholder.svg",
              bio: "Amante de fotografia e viagens. Sempre em busca de novas aventuras!",
              location: "São Paulo, SP",
              age: 28,
              gender: "female",
              relationshipType: "single",
              interests: ["Fotografia", "Viagens", "Gastronomia"],
              commonInterests: ["Fotografia", "Viagens"],
              compatibilityScore: 85,
              distance: 5,
              isVerified: true,
              isPremium: false,
              isOnline: true,
              lastSeen: null,
              memberSince: "2024-01-15T10:00:00Z",
              stats: {
                followers: 234,
                following: 156,
                posts: 45,
                likes: 1200
              }
            },
            {
              id: "dummy-2",
              name: "João Santos",
              username: "joao_santos",
              avatar: "/placeholder.svg",
              bio: "Desenvolvedor apaixonado por tecnologia e esportes.",
              location: "Rio de Janeiro, RJ",
              age: 32,
              gender: "male",
              relationshipType: "single",
              interests: ["Tecnologia", "Esportes", "Música"],
              commonInterests: ["Tecnologia"],
              compatibilityScore: 72,
              distance: 8,
              isVerified: false,
              isPremium: true,
              isOnline: false,
              lastSeen: "2024-01-17T14:30:00Z",
              memberSince: "2023-08-22T15:45:00Z",
              stats: {
                followers: 189,
                following: 98,
                posts: 28,
                likes: 890
              }
            }
          ],
          hasMore: true,
          page: 1,
          limit: 20,
          total: 2,
          filters: {
            gender: "all",
            relationshipType: "all",
            minAge: 18,
            maxAge: 65,
            maxDistance: 50
          },
          stats: {
            totalFound: 2,
            afterAgeFilter: 2,
            afterDistanceFilter: 2,
            afterInterestsFilter: 2,
            onlineUsers: 1,
            verifiedUsers: 1,
            premiumUsers: 1,
            avgCompatibility: 78
          }
        })
      }
      
      return NextResponse.json({ 
        error: "Usuário não autenticado", 
        details: userError?.message || "Nenhum usuário encontrado",
        hint: "Verifique se o usuário está logado e os cookies de autenticação estão sendo enviados"
      }, { status: 401 })
    }

    // Buscar perfil do usuário atual para obter localização
    const { data: currentUserProfile } = await supabase
      .from("users")
      .select("location, interests, birth_date, gender")
      .eq("id", user.id)
      .single()

    console.log("👤 [Explore] Perfil do usuário atual:", currentUserProfile)

    // Construir query base (apenas campos que existem)
    let query = supabase
      .from("users")
      .select(`
        id,
        username,
        name,
        avatar_url,
        bio,
        location,
        birth_date,
        is_verified,
        is_premium,
        created_at
      `)
      .neq("id", user.id) // Excluir usuário atual

    // Filtros comentados até validar estrutura da tabela
    // if (gender !== "all") {
    //   query = query.eq("gender", gender)
    // }

    // if (relationshipType !== "all") {
    //   query = query.eq("relationship_type", relationshipType)
    // }

    // Filtro por verificado
    if (verified) {
      query = query.eq("is_verified", true)
    }

    // Filtro por premium
    if (premium) {
      query = query.eq("is_premium", true)
    }

    // Filtro por busca (nome ou username)
    if (search) {
      query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%`)
    }

    // Filtro por localização
    if (location) {
      query = query.ilike("location", `%${location}%`)
    }

    // Ordenar por data de criação
    query = query.order("created_at", { ascending: false })

    // Executar query com paginação
    console.log("🔍 [Explore] Executando query...")
    const { data: profiles, error: profilesError } = await query
      .range(offset, offset + limit - 1)

    if (profilesError) {
      console.error("❌ [Explore] Erro ao buscar perfis:", profilesError)
      console.error("❌ [Explore] Detalhes do erro:", JSON.stringify(profilesError, null, 2))
      return NextResponse.json({ 
        error: "Failed to fetch profiles", 
        details: profilesError.message,
        hint: profilesError.hint || "Verifique a estrutura da tabela users"
      }, { status: 500 })
    }

    console.log("✅ [Explore] Perfis encontrados:", (profiles || []).length)

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        data: [],
        hasMore: false,
        page,
        limit,
        total: 0,
        filters: {
          gender, relationshipType, minAge, maxAge, maxDistance, 
          interests, location, verified, premium, search
        }
      })
    }

    // Processar perfis e calcular distância/compatibilidade
    const processedProfiles = profiles.map((profile: any) => {
      // Calcular idade
      const age = profile.birth_date 
        ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
        : null

      // Calcular compatibilidade de interesses (simulado)
      const userInterests = currentUserProfile?.interests || []
      const profileInterests = [] // Simulado até validar estrutura
      const commonInterests = []
      const compatibilityScore = Math.floor(Math.random() * 100)

      // Calcular distância (simulada - em um caso real, usaria geolocalização)
      const distance = Math.floor(Math.random() * maxDistance) + 1

      // Status online (simulado)
      const lastSeen = null
      const isOnline = Math.random() > 0.7 // 30% chance de estar online

      return {
        id: profile.id,
        name: profile.full_name || "Usuário",
        username: profile.username || "usuario",
        avatar: profile.avatar_url,
        bio: profile.bio || "",
        location: profile.location || "Localização não informada",
        age,
        gender: "unknown", // Simplificado
        relationshipType: "single", // Simplificado
        interests: profileInterests,
        commonInterests,
        compatibilityScore: Math.round(compatibilityScore),
        distance,
        isVerified: profile.is_verified || false,
        isPremium: profile.is_premium || false,
        isOnline,
        lastSeen: lastSeen,
        memberSince: profile.created_at,
        stats: {
          followers: Math.floor(Math.random() * 1000), // Simulado
          following: Math.floor(Math.random() * 500), // Simulado
          posts: Math.floor(Math.random() * 100), // Simulado
          likes: Math.floor(Math.random() * 5000) // Simulado
        }
      }
    })

    // Filtrar por idade
    const filteredByAge = processedProfiles.filter(profile => {
      if (!profile.age) return true
      return profile.age >= minAge && profile.age <= maxAge
    })

    // Filtrar por distância
    const filteredByDistance = filteredByAge.filter(profile => 
      profile.distance <= maxDistance
    )

    // Filtrar por interesses
    const filteredByInterests = interests.length > 0 
      ? filteredByDistance.filter(profile => 
          profile.commonInterests.length > 0
        )
      : filteredByDistance

    // Ordenar por compatibilidade e atividade
    const sortedProfiles = filteredByInterests.sort((a, b) => {
      // Priorizar usuários online
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1
      
      // Depois por compatibilidade
      if (b.compatibilityScore !== a.compatibilityScore) {
        return b.compatibilityScore - a.compatibilityScore
      }
      
      // Por último, por distância
      return a.distance - b.distance
    })

    const result = {
      data: sortedProfiles,
      hasMore: profiles.length === limit,
      page,
      limit,
      total: sortedProfiles.length,
      filters: {
        gender, relationshipType, minAge, maxAge, maxDistance, 
        interests, location, verified, premium, search
      },
      stats: {
        totalFound: profiles.length,
        afterAgeFilter: filteredByAge.length,
        afterDistanceFilter: filteredByDistance.length,
        afterInterestsFilter: filteredByInterests.length,
        onlineUsers: sortedProfiles.filter(p => p.isOnline).length,
        verifiedUsers: sortedProfiles.filter(p => p.isVerified).length,
        premiumUsers: sortedProfiles.filter(p => p.isPremium).length,
        avgCompatibility: sortedProfiles.length > 0 
          ? Math.round(sortedProfiles.reduce((sum, p) => sum + p.compatibilityScore, 0) / sortedProfiles.length)
          : 0
      }
    }

    console.log("📊 [Explore] Estatísticas:", result.stats)
    console.log("✅ [Explore] Retornando", sortedProfiles.length, "perfis processados")

    return NextResponse.json(result)

  } catch (error) {
    console.error("❌ [Explore] Erro interno:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}