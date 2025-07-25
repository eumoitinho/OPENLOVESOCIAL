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

    // Buscar perfil do usuário atual para obter localização e interesses
    const { data: currentUserProfile } = await supabase
      .from("users")
      .select(`
        location, 
        interests, 
        birth_date, 
        gender, 
        latitude, 
        longitude,
        profile_type
      `)
      .eq("id", user.id)
      .single()

    console.log("👤 [Explore] Perfil do usuário atual:", currentUserProfile)

    // Construir query base com todos os campos necessários
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
        gender,
        profile_type,
        interests,
        latitude,
        longitude,
        is_verified,
        is_premium,
        last_active_at,
        created_at,
        stats
      `)
      .neq("id", user.id) // Excluir usuário atual
      .eq("is_active", true) // Apenas usuários ativos

    // Filtros por gênero
    if (gender !== "all") {
      query = query.eq("gender", gender)
    }

    // Filtros por tipo de relacionamento
    if (relationshipType !== "all") {
      query = query.eq("profile_type", relationshipType)
    }

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

    // Filtro por interesses se especificado
    if (interests.length > 0) {
      // Buscar usuários que tenham pelo menos um interesse em comum
      const interestFilters = interests.map(interest => `interests.cs.["${interest}"]`).join(',')
      query = query.or(interestFilters)
    }

    // Filtro por idade (aplicado no lado do servidor se possível)
    if (minAge > 18 || maxAge < 65) {
      const currentYear = new Date().getFullYear()
      const maxBirthYear = currentYear - minAge
      const minBirthYear = currentYear - maxAge
      
      query = query
        .gte("birth_date", `${minBirthYear}-01-01`)
        .lte("birth_date", `${maxBirthYear}-12-31`)
    }

    // Ordenar por atividade recente e criação
    query = query.order("last_active_at", { ascending: false, nullsFirst: false })
    query = query.order("created_at", { ascending: false })

    // Executar query com paginação
    console.log("🔍 [Explore] Executando query melhorada...")
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

      // Calcular compatibilidade de interesses (REAL)
      const userInterests = Array.isArray(currentUserProfile?.interests) 
        ? currentUserProfile.interests 
        : []
      
      const profileInterests = Array.isArray(profile.interests) 
        ? profile.interests 
        : []

      // Calcular interesses comuns
      const commonInterests = userInterests.filter(interest => 
        profileInterests.includes(interest)
      )

      // Calcular pontuação de compatibilidade baseada em interesses
      let compatibilityScore = 0
      
      if (userInterests.length > 0 && profileInterests.length > 0) {
        // Pontuação baseada em interesses comuns
        const commonInterestsRatio = commonInterests.length / Math.max(userInterests.length, profileInterests.length)
        compatibilityScore += commonInterestsRatio * 60 // Máximo 60 pontos por interesses
        
        // Bonus por ter muitos interesses em comum
        if (commonInterests.length >= 3) {
          compatibilityScore += 20
        } else if (commonInterests.length >= 2) {
          compatibilityScore += 10
        }
        
        // Bonus por diversidade de interesses
        if (profileInterests.length >= 5) {
          compatibilityScore += 10
        }
        
        // Bonus por perfil completo
        if (profile.bio && profile.bio.length > 50) {
          compatibilityScore += 5
        }
        
        // Bonus por verificação
        if (profile.is_verified) {
          compatibilityScore += 5
        }
      } else {
        // Se não há interesses, dar pontuação base
        compatibilityScore = 20
      }

      // Calcular distância baseada em coordenadas se disponíveis
      let distance = null
      if (currentUserProfile?.latitude && currentUserProfile?.longitude && 
          profile.latitude && profile.longitude) {
        // Fórmula de Haversine para calcular distância
        const R = 6371 // Raio da Terra em km
        const dLat = (profile.latitude - currentUserProfile.latitude) * Math.PI / 180
        const dLon = (profile.longitude - currentUserProfile.longitude) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(currentUserProfile.latitude * Math.PI / 180) * 
                  Math.cos(profile.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        distance = Math.round(R * c)
      } else {
        // Distância simulada se não há coordenadas
        distance = Math.floor(Math.random() * maxDistance) + 1
      }

      // Status online baseado em last_active_at se disponível
      const lastSeen = profile.last_active_at ? new Date(profile.last_active_at) : null
      const isOnline = lastSeen ? 
        (new Date().getTime() - lastSeen.getTime()) < 15 * 60 * 1000 : // 15 minutos
        Math.random() > 0.7 // Fallback simulado

      // Extrair gênero e tipo de relacionamento dos dados reais
      const gender = profile.gender || "não informado"
      const relationshipType = profile.profile_type || "single"

      return {
        id: profile.id,
        name: profile.name || profile.full_name || "Usuário",
        username: profile.username || "usuario",
        avatar: profile.avatar_url,
        bio: profile.bio || "",
        location: profile.location || "Localização não informada",
        age,
        gender,
        relationshipType,
        interests: profileInterests,
        commonInterests,
        compatibilityScore: Math.round(Math.min(compatibilityScore, 100)), // Máximo 100
        distance,
        isVerified: profile.is_verified || false,
        isPremium: profile.is_premium || false,
        isOnline,
        lastSeen: lastSeen,
        memberSince: profile.created_at,
        stats: {
          followers: profile.stats?.followers || 0,
          following: profile.stats?.following || 0,
          posts: profile.stats?.posts || 0,
          likes: profile.stats?.likes_received || 0
        }
      }
    })

    // Filtrar por idade (aplicado no cliente para maior precisão)
    const filteredByAge = processedProfiles.filter(profile => {
      if (!profile.age) return true
      return profile.age >= minAge && profile.age <= maxAge
    })

    // Filtrar por distância (apenas se temos coordenadas)
    const filteredByDistance = filteredByAge.filter(profile => {
      if (!profile.distance) return true
      return profile.distance <= maxDistance
    })

    // Filtrar por interesses (aplicado no cliente para maior precisão)
    const filteredByInterests = interests.length > 0 
      ? filteredByDistance.filter(profile => 
          profile.commonInterests.length > 0 || 
          profile.interests.some((interest: string) => interests.includes(interest))
        )
      : filteredByDistance

    // Filtrar por gênero (aplicado no cliente como backup)
    const filteredByGender = gender !== "all" 
      ? filteredByInterests.filter(profile => profile.gender === gender)
      : filteredByInterests

    // Filtrar por tipo de relacionamento (aplicado no cliente como backup)
    const filteredByRelationship = relationshipType !== "all"
      ? filteredByGender.filter(profile => profile.relationshipType === relationshipType)
      : filteredByGender

    // Ordenar por algoritmo de recomendação inteligente
    const sortedProfiles = filteredByRelationship.sort((a, b) => {
      // 1. Priorizar usuários com interesses em comum
      const aCommonInterests = a.commonInterests.length
      const bCommonInterests = b.commonInterests.length
      if (aCommonInterests !== bCommonInterests) {
        return bCommonInterests - aCommonInterests
      }
      
      // 2. Priorizar usuários online
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1
      
      // 3. Priorizar usuários verificados
      if (a.isVerified && !b.isVerified) return -1
      if (!a.isVerified && b.isVerified) return 1
      
      // 4. Ordenar por compatibilidade
      if (b.compatibilityScore !== a.compatibilityScore) {
        return b.compatibilityScore - a.compatibilityScore
      }
      
      // 5. Priorizar usuários com perfil mais completo
      const aCompleteness = (a.bio ? 1 : 0) + (a.interests.length > 0 ? 1 : 0) + (a.avatar ? 1 : 0)
      const bCompleteness = (b.bio ? 1 : 0) + (b.interests.length > 0 ? 1 : 0) + (b.avatar ? 1 : 0)
      if (aCompleteness !== bCompleteness) {
        return bCompleteness - aCompleteness
      }
      
      // 6. Por último, por distância (mais próximos primeiro)
      if (a.distance && b.distance) {
        return a.distance - b.distance
      }
      
      // 7. Por atividade recente
      const aLastSeen = a.lastSeen ? new Date(a.lastSeen).getTime() : 0
      const bLastSeen = b.lastSeen ? new Date(b.lastSeen).getTime() : 0
      return bLastSeen - aLastSeen
    })

    // Calcular estatísticas avançadas
    const stats = {
      totalFound: profiles.length,
      afterAgeFilter: filteredByAge.length,
      afterDistanceFilter: filteredByDistance.length,
      afterInterestsFilter: filteredByInterests.length,
      afterGenderFilter: filteredByGender.length,
      afterRelationshipFilter: filteredByRelationship.length,
      finalResults: sortedProfiles.length,
      onlineUsers: sortedProfiles.filter(p => p.isOnline).length,
      verifiedUsers: sortedProfiles.filter(p => p.isVerified).length,
      premiumUsers: sortedProfiles.filter(p => p.isPremium).length,
      usersWithCommonInterests: sortedProfiles.filter(p => p.commonInterests.length > 0).length,
      avgCompatibility: sortedProfiles.length > 0 
        ? Math.round(sortedProfiles.reduce((sum, p) => sum + p.compatibilityScore, 0) / sortedProfiles.length)
        : 0,
      avgDistance: sortedProfiles.length > 0 && sortedProfiles.some(p => p.distance)
        ? Math.round(sortedProfiles.filter(p => p.distance).reduce((sum, p) => sum + p.distance, 0) / sortedProfiles.filter(p => p.distance).length)
        : null,
      topCommonInterests: interests.length > 0 
        ? sortedProfiles.flatMap(p => p.commonInterests)
            .reduce((acc, interest) => {
              acc[interest] = (acc[interest] || 0) + 1
              return acc
            }, {} as Record<string, number>)
        : {},
      ageDistribution: {
        "18-25": sortedProfiles.filter(p => p.age && p.age >= 18 && p.age <= 25).length,
        "26-35": sortedProfiles.filter(p => p.age && p.age >= 26 && p.age <= 35).length,
        "36-45": sortedProfiles.filter(p => p.age && p.age >= 36 && p.age <= 45).length,
        "46+": sortedProfiles.filter(p => p.age && p.age >= 46).length,
      }
    }

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
      stats,
      recommendations: {
        message: sortedProfiles.length === 0 
          ? "Nenhum perfil encontrado com os filtros atuais. Tente expandir seus critérios de busca."
          : sortedProfiles.length < 5
          ? "Poucos perfis encontrados. Considere expandir a distância ou ajustar os filtros."
          : `${sortedProfiles.length} perfis encontrados! ${stats.usersWithCommonInterests} têm interesses em comum com você.`,
        suggestedFilters: sortedProfiles.length === 0 ? {
          expandDistance: maxDistance < 100,
          expandAge: (maxAge - minAge) < 20,
          removeInterests: interests.length > 3,
          removeLocation: !!location
        } : null
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