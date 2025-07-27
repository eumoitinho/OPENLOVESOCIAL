import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"

// Algoritmo de recomendação baseado em colaboração e conteúdo
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get("limit") || "10")
    const algorithm = searchParams.get("algorithm") || "hybrid" // hybrid, collaborative, content-based
    
    console.log("🤖 [Recommendations] Iniciando recomendações:", { limit, algorithm })

    // Buscar usuário autenticado
    const {
      data: { user },
      error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ 
        error: "Usuário não autenticado" 
      }, { status: 401 })
    }

    // Buscar perfil completo do usuário
    const { data: currentUserProfile } = await supabase
      .from("users")
      .select(`
        id,
        interests,
        birth_date,
        gender,
        profile_type,
        location,
        latitude,
        longitude,
        bio,
        seeking
      `)
      .eq("id", user.id)
      .single()

    if (!currentUserProfile) {
      return NextResponse.json({ 
        error: "Perfil do usuário não encontrado" 
      }, { status: 404 })
    }

    // Buscar histórico de interações do usuário
    const { data: userInteractions } = await supabase
      .from("interactions")
      .select(`
        target_user_id,
        interaction_type,
        created_at
      `)
      .eq("user_id", user.id)
      .in("interaction_type", ["like", "super_like", "view_profile", "message"])
      .order("created_at", { ascending: false })
      .limit(100)

    // Buscar todos os usuários candidatos
    const { data: allUsers } = await supabase
      .from("users")
      .select(`
        id,
        username,
        name,
        full_name,
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
        last_seen,
        created_at,
        stats,
        seeking
      `)
      .neq("id", user.id)
      .eq("is_active", true)
      .limit(200) // Limitar para performance

    if (!allUsers || allUsers.length === 0) {
      return NextResponse.json({
        data: [],
        algorithm: algorithm,
        recommendations: {
          message: "Nenhum usuário encontrado para recomendação",
          totalCandidates: 0
        }
      })
    }

    // Calcular scores de recomendação
    const scoredUsers = allUsers.map(targetUser => {
      const score = calculateCompatibilityScore(
        currentUserProfile,
        targetUser,
        userInteractions || [],
        algorithm
      )
      
      return {
        ...targetUser,
        recommendationScore: score.total,
        scoreBreakdown: score.breakdown,
        reasons: score.reasons
      }
    })

    // Ordenar por score e pegar os melhores
    const recommendations = scoredUsers
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit)
      .map(user => ({
        id: user.id,
        name: user.name || user.full_name || "Usuário",
        username: user.username || "usuario",
        avatar: user.avatar_url,
        bio: user.bio || "",
        location: user.location || "",
        age: user.birth_date ? new Date().getFullYear() - new Date(user.birth_date).getFullYear() : null,
        gender: user.gender || "não informado",
        relationshipType: user.profile_type || "single",
        interests: Array.isArray(user.interests) ? user.interests : [],
        isVerified: user.is_verified || false,
        isPremium: user.is_premium || false,
        isOnline: user.last_seen ? 
          (new Date().getTime() - new Date(user.last_seen).getTime()) < 15 * 60 * 1000 : false,
        lastSeen: user.last_seen,
        memberSince: user.created_at,
        recommendationScore: user.recommendationScore,
        scoreBreakdown: user.scoreBreakdown,
        reasons: user.reasons,
        stats: {
          followers: user.stats?.followers || 0,
          following: user.stats?.following || 0,
          posts: user.stats?.posts || 0,
          likes: user.stats?.likes_received || 0
        }
      }))

    return NextResponse.json({
      data: recommendations,
      algorithm: algorithm,
      recommendations: {
        message: `${recommendations.length} perfis recomendados usando algoritmo ${algorithm}`,
        totalCandidates: allUsers.length,
        avgScore: recommendations.length > 0 
          ? Math.round(recommendations.reduce((sum, u) => sum + u.recommendationScore, 0) / recommendations.length)
          : 0,
        topReasons: getTopReasons(recommendations)
      }
    })

  } catch (error) {
    console.error("❌ [Recommendations] Erro:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}

// Função para calcular score de compatibilidade
function calculateCompatibilityScore(
  currentUser: any,
  targetUser: any,
  interactions: any[],
  algorithm: string
) {
  const breakdown = {
    interests: 0,
    demographics: 0,
    activity: 0,
    location: 0,
    preferences: 0,
    social: 0
  }
  
  const reasons: string[] = []

  // 1. Compatibilidade de interesses (peso: 30%)
  const userInterests = Array.isArray(currentUser.interests) ? currentUser.interests : []
  const targetInterests = Array.isArray(targetUser.interests) ? targetUser.interests : []
  
  if (userInterests.length > 0 && targetInterests.length > 0) {
    const commonInterests = userInterests.filter((interest: string) => targetInterests.includes(interest))
    const interestScore = (commonInterests.length / Math.max(userInterests.length, targetInterests.length)) * 30
    breakdown.interests = interestScore
    
    if (commonInterests.length > 0) {
      reasons.push(`${commonInterests.length} interesse${commonInterests.length > 1 ? 's' : ''} em comum`)
    }
  }

  // 2. Demografia (idade, localização) (peso: 20%)
  const currentAge = currentUser.birth_date ? new Date().getFullYear() - new Date(currentUser.birth_date).getFullYear() : null
  const targetAge = targetUser.birth_date ? new Date().getFullYear() - new Date(targetUser.birth_date).getFullYear() : null
  
  if (currentAge && targetAge) {
    const ageDiff = Math.abs(currentAge - targetAge)
    const ageScore = Math.max(0, (10 - ageDiff) / 10) * 15 // Máximo 15 pontos
    breakdown.demographics += ageScore
    
    if (ageDiff <= 5) {
      reasons.push("Idades compatíveis")
    }
  }

  // 3. Localização (peso: 15%)
  if (currentUser.latitude && currentUser.longitude && targetUser.latitude && targetUser.longitude) {
    const distance = calculateDistance(
      currentUser.latitude, currentUser.longitude,
      targetUser.latitude, targetUser.longitude
    )
    
    const locationScore = Math.max(0, (50 - distance) / 50) * 15 // Máximo 15 pontos
    breakdown.location = locationScore
    
    if (distance <= 10) {
      reasons.push("Muito próximo geograficamente")
    } else if (distance <= 25) {
      reasons.push("Próximo geograficamente")
    }
  }

  // 4. Atividade e engagement (peso: 15%)
  const isActive = targetUser.last_seen ? 
    (new Date().getTime() - new Date(targetUser.last_seen).getTime()) < 7 * 24 * 60 * 60 * 1000 : false
  
  if (isActive) {
    breakdown.activity += 10
    reasons.push("Usuário ativo recentemente")
  }

  if (targetUser.is_verified) {
    breakdown.social += 5
    reasons.push("Perfil verificado")
  }

  if (targetUser.bio && targetUser.bio.length > 50) {
    breakdown.social += 5
    reasons.push("Perfil completo")
  }

  // 5. Preferências de relacionamento (peso: 10%)
  const userSeeking = Array.isArray(currentUser.seeking) ? currentUser.seeking : []
  const targetType = targetUser.profile_type || "single"
  
  if (userSeeking.includes(targetType) || userSeeking.includes("any")) {
    breakdown.preferences += 10
    reasons.push("Compatível com suas preferências")
  }

  // 6. Algoritmo colaborativo (peso: 10%)
  if (algorithm === "collaborative" || algorithm === "hybrid") {
    // Usuários que interagiram com perfis similares
    const similarityBonus = calculateCollaborativeScore(currentUser, targetUser, interactions)
    breakdown.social += similarityBonus
    
    if (similarityBonus > 5) {
      reasons.push("Perfil popular entre usuários similares")
    }
  }

  const total = Object.values(breakdown).reduce((sum, score) => sum + score, 0)

  return {
    total: Math.round(total),
    breakdown,
    reasons: reasons.slice(0, 3) // Máximo 3 razões
  }
}

// Função para calcular distância entre coordenadas
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Função para calcular score colaborativo
function calculateCollaborativeScore(currentUser: any, targetUser: any, interactions: any[]): number {
  // Implementação simplificada - em produção seria mais complexa
  const targetInteractions = interactions.filter(i => i.target_user_id === targetUser.id)
  
  if (targetInteractions.length > 0) {
    return 5 // Bonus por já ter interagido
  }
  
  // Bonus por popularidade
  const popularity = targetUser.stats?.followers || 0
  return Math.min(popularity / 100, 5) // Máximo 5 pontos
}

// Função para extrair principais razões
function getTopReasons(recommendations: any[]): string[] {
  const reasonCounts: Record<string, number> = {}
  
  recommendations.forEach(user => {
    user.reasons.forEach((reason: string) => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    })
  })
  
  return Object.entries(reasonCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([reason]) => reason)
} 
