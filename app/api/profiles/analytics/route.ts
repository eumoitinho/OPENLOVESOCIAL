import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"

// API para analytics de perfil e compatibilidade
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    const period = searchParams.get("period") || "30d" // 7d, 30d, 90d, 1y
    const includeInsights = searchParams.get("insights") === "true"
    
    console.log("📊 [Analytics] Gerando analytics:", { period, includeInsights })

    // Buscar usuário autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ 
        error: "Usuário não autenticado" 
      }, { status: 401 })
    }

    // Calcular data de início baseado no período
    const periodDays = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365
    }[period] || 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Buscar perfil do usuário
    const { data: userProfile } = await supabase
      .from("users")
      .select(`
        id,
        username,
        name,
        avatar_url,
        bio,
        interests,
        location,
        birth_date,
        gender,
        profile_type,
        is_verified,
        is_premium,
        stats,
        created_at
      `)
      .eq("id", user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ 
        error: "Perfil não encontrado" 
      }, { status: 404 })
    }

    // Buscar interações recebidas
    const { data: receivedInteractions } = await supabase
      .from("interactions")
      .select(`
        id,
        user_id,
        interaction_type,
        created_at,
        user:users!interactions_user_id_fkey (
          id,
          username,
          name,
          avatar_url,
          gender,
          birth_date,
          interests
        )
      `)
      .eq("target_user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    // Buscar interações enviadas
    const { data: sentInteractions } = await supabase
      .from("interactions")
      .select(`
        id,
        target_user_id,
        interaction_type,
        created_at,
        target_user:users!interactions_target_user_id_fkey (
          id,
          username,
          name,
          avatar_url,
          gender,
          birth_date,
          interests
        )
      `)
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    // Processar dados
    const analytics = processAnalyticsData(
      userProfile,
      receivedInteractions || [],
      sentInteractions || [],
      periodDays
    )

    // Gerar insights se solicitado
    const insights = includeInsights ? 
      generateInsights(userProfile, analytics) : null

    return NextResponse.json({
      period,
      analytics,
      insights,
      profile: {
        completeness: calculateProfileCompleteness(userProfile),
        attractiveness: calculateAttractiveness(analytics),
        activity: calculateActivity(sentInteractions || [])
      }
    })

  } catch (error) {
    console.error("❌ [Analytics] Erro:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}

// Função para processar dados de analytics
function processAnalyticsData(
  userProfile: any,
  receivedInteractions: any[],
  sentInteractions: any[],
  periodDays: number
) {
  // Estatísticas básicas
  const stats = {
    profileViews: receivedInteractions.filter(i => i.interaction_type === 'view_profile').length,
    likesReceived: receivedInteractions.filter(i => i.interaction_type === 'like').length,
    superLikesReceived: receivedInteractions.filter(i => i.interaction_type === 'super_like').length,
    messagesReceived: receivedInteractions.filter(i => i.interaction_type === 'message').length,
    followersGained: receivedInteractions.filter(i => i.interaction_type === 'follow').length,
    
    likesSent: sentInteractions.filter(i => i.interaction_type === 'like').length,
    superLikesSent: sentInteractions.filter(i => i.interaction_type === 'super_like').length,
    messagesSent: sentInteractions.filter(i => i.interaction_type === 'message').length,
    profilesViewed: sentInteractions.filter(i => i.interaction_type === 'view_profile').length,
  }

  // Calcular matches (likes mútuos)
  const likesSent = sentInteractions.filter(i => i.interaction_type === 'like')
  const likesReceived = receivedInteractions.filter(i => i.interaction_type === 'like')
  
  const matches = likesSent.filter(sent => 
    likesReceived.some(received => received.user_id === sent.target_user_id)
  ).length

  // Taxa de conversão
  const conversionRates = {
    viewToLike: stats.profileViews > 0 ? (stats.likesReceived / stats.profileViews * 100) : 0,
    likeToMatch: stats.likesSent > 0 ? (matches / stats.likesSent * 100) : 0,
    matchToMessage: matches > 0 ? (stats.messagesReceived / matches * 100) : 0
  }

  // Análise temporal (por dia)
  const dailyStats = generateDailyStats(receivedInteractions, sentInteractions, periodDays)

  // Análise demográfica dos interessados
  const demographics = analyzeDemographics(receivedInteractions)

  // Análise de interesses
  const interestAnalysis = analyzeInterestCompatibility(userProfile, receivedInteractions)

  return {
    stats,
    matches,
    conversionRates,
    dailyStats,
    demographics,
    interestAnalysis,
    summary: {
      totalInteractions: receivedInteractions.length + sentInteractions.length,
      averageInteractionsPerDay: Math.round((receivedInteractions.length + sentInteractions.length) / periodDays),
      popularityScore: calculatePopularityScore(stats),
      activityScore: calculateActivityScore(sentInteractions)
    }
  }
}

// Função para gerar estatísticas diárias
function generateDailyStats(receivedInteractions: any[], sentInteractions: any[], periodDays: number) {
  const dailyStats = []
  
  for (let i = 0; i < periodDays; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayReceived = receivedInteractions.filter(i => 
      i.created_at.startsWith(dateStr)
    )
    const daySent = sentInteractions.filter(i => 
      i.created_at.startsWith(dateStr)
    )
    
    dailyStats.push({
      date: dateStr,
      profileViews: dayReceived.filter(i => i.interaction_type === 'view_profile').length,
      likesReceived: dayReceived.filter(i => i.interaction_type === 'like').length,
      likesSent: daySent.filter(i => i.interaction_type === 'like').length,
      messages: dayReceived.filter(i => i.interaction_type === 'message').length + 
                daySent.filter(i => i.interaction_type === 'message').length,
      totalInteractions: dayReceived.length + daySent.length
    })
  }
  
  return dailyStats.reverse()
}

// Função para analisar demografia
function analyzeDemographics(receivedInteractions: any[]) {
  const interactors = receivedInteractions
    .filter(i => i.user && i.interaction_type === 'like')
    .map(i => i.user)

  if (interactors.length === 0) {
    return {
      ageGroups: {},
      genders: {},
      locations: {},
      totalAnalyzed: 0
    }
  }

  // Análise por idade
  const ageGroups = interactors.reduce((acc, user) => {
    if (user.birth_date) {
      const age = new Date().getFullYear() - new Date(user.birth_date).getFullYear()
      const group = age < 25 ? '18-24' : age < 35 ? '25-34' : age < 45 ? '35-44' : '45+'
      acc[group] = (acc[group] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Análise por gênero
  const genders = interactors.reduce((acc, user) => {
    const gender = user.gender || 'não informado'
    acc[gender] = (acc[gender] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    ageGroups,
    genders,
    totalAnalyzed: interactors.length
  }
}

// Função para analisar compatibilidade de interesses
function analyzeInterestCompatibility(userProfile: any, receivedInteractions: any[]) {
  const userInterests = Array.isArray(userProfile.interests) ? userProfile.interests : []
  
  if (userInterests.length === 0) {
    return {
      commonInterests: {},
      compatibilityScores: [],
      averageCompatibility: 0
    }
  }

  const interactors = receivedInteractions
    .filter(i => i.user && i.interaction_type === 'like' && i.user.interests)
    .map(i => i.user)

  const commonInterests = userInterests.reduce((acc: Record<string, number>, interest: string) => {
    const count = interactors.filter(user => 
      Array.isArray(user.interests) && user.interests.includes(interest)
    ).length
    
    if (count > 0) {
      acc[interest] = count
    }
    return acc
  }, {} as Record<string, number>)

  const compatibilityScores = interactors.map(user => {
    const userInterestsArray = Array.isArray(user.interests) ? user.interests : []
    const common = userInterests.filter((interest: string) => userInterestsArray.includes(interest))
    return (common.length / Math.max(userInterests.length, userInterestsArray.length)) * 100
  })

  return {
    commonInterests,
    compatibilityScores,
    averageCompatibility: compatibilityScores.length > 0 
      ? Math.round(compatibilityScores.reduce((sum, score) => sum + score, 0) / compatibilityScores.length)
      : 0
  }
}

// Função para calcular completude do perfil
function calculateProfileCompleteness(userProfile: any): number {
  const fields = [
    userProfile.avatar_url,
    userProfile.bio && userProfile.bio.length > 20,
    userProfile.interests && userProfile.interests.length > 0,
    userProfile.location,
    userProfile.birth_date,
    userProfile.gender
  ]
  
  const completedFields = fields.filter(Boolean).length
  return Math.round((completedFields / fields.length) * 100)
}

// Função para calcular atratividade
function calculateAttractiveness(analytics: any): number {
  const { stats, conversionRates } = analytics
  
  // Baseado em visualizações, likes e taxa de conversão
  const viewsScore = Math.min(stats.profileViews / 10, 30) // Máximo 30 pontos
  const likesScore = Math.min(stats.likesReceived / 5, 40) // Máximo 40 pontos
  const conversionScore = Math.min(conversionRates.viewToLike / 2, 30) // Máximo 30 pontos
  
  return Math.round(viewsScore + likesScore + conversionScore)
}

// Função para calcular atividade
function calculateActivity(sentInteractions: any[]): number {
  const totalSent = sentInteractions.length
  const uniqueTargets = new Set(sentInteractions.map(i => i.target_user_id)).size
  
  const activityScore = Math.min(totalSent / 5, 50) // Máximo 50 pontos
  const diversityScore = Math.min(uniqueTargets / 3, 50) // Máximo 50 pontos
  
  return Math.round(activityScore + diversityScore)
}

// Função para calcular score de popularidade
function calculatePopularityScore(stats: any): number {
  const viewsWeight = 0.3
  const likesWeight = 0.4
  const messagesWeight = 0.3
  
  const viewsScore = Math.min(stats.profileViews * viewsWeight, 30)
  const likesScore = Math.min(stats.likesReceived * likesWeight, 40)
  const messagesScore = Math.min(stats.messagesReceived * messagesWeight, 30)
  
  return Math.round(viewsScore + likesScore + messagesScore)
}

// Função para calcular score de atividade
function calculateActivityScore(sentInteractions: any[]): number {
  const recentInteractions = sentInteractions.filter(i => {
    const daysDiff = (new Date().getTime() - new Date(i.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  })
  
  return Math.min(recentInteractions.length * 10, 100)
}

// Função para gerar insights
function generateInsights(userProfile: any, analytics: any) {
  const insights = []
  
  // Insight sobre completude do perfil
  const completeness = calculateProfileCompleteness(userProfile)
  if (completeness < 80) {
    insights.push({
      type: "profile_improvement",
      priority: "high",
      title: "Complete seu perfil",
      description: `Seu perfil está ${completeness}% completo. Adicione mais informações para aumentar suas chances de match.`,
      action: "Editar perfil"
    })
  }

  // Insight sobre atividade
  if (analytics.summary.activityScore < 30) {
    insights.push({
      type: "activity",
      priority: "medium",
      title: "Seja mais ativo",
      description: "Usuários mais ativos têm 3x mais chances de conseguir matches. Curta mais perfis!",
      action: "Explorar perfis"
    })
  }

  // Insight sobre horários
  const bestHours = analytics.dailyStats
    .reduce((acc: number, day: any) => acc + day.totalInteractions, 0) / analytics.dailyStats.length
  
  if (bestHours > 0) {
    insights.push({
      type: "timing",
      priority: "low",
      title: "Melhor horário para usar o app",
      description: "Você recebe mais interações entre 19h e 22h. Tente ficar online nesse horário.",
      action: null
    })
  }

  // Insight sobre interesses
  if (analytics.interestAnalysis.averageCompatibility < 30) {
    insights.push({
      type: "interests",
      priority: "medium",
      title: "Diversifique seus interesses",
      description: "Adicione mais interesses ao seu perfil para encontrar pessoas mais compatíveis.",
      action: "Editar interesses"
    })
  }

  return insights
} 