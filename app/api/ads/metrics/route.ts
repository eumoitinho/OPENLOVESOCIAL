import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/app/lib/database.types"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    const body = await request.json()
    const { campaignId, eventType, userId, metadata } = body

    if (!campaignId || !eventType) {
      return NextResponse.json({ error: "Campaign ID e tipo de evento são obrigatórios" }, { status: 400 })
    }

    // Registrar evento de métrica
    const { data: metric, error } = await supabase
      .from("ad_metrics")
      .insert({
        campaign_id: campaignId,
        event_type: eventType, // 'impression', 'click', 'conversion'
        user_id: userId,
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao registrar métrica:", error)
      return NextResponse.json({ error: "Erro ao registrar métrica" }, { status: 500 })
    }

    // Se for um clique, atualizar contador na campanha
    if (eventType === "click") {
      // Buscar campanha atual para atualizar valores
      const { data: currentCampaign } = await supabase
        .from("ad_campaigns")
        .select("clicks, spent")
        .eq("id", campaignId)
        .single()

      if (currentCampaign) {
        await supabase
          .from("ad_campaigns")
          .update({ 
            clicks: (currentCampaign.clicks || 0) + 1,
            spent: (currentCampaign.spent || 0) + 0.50 // Custo por clique simulado
          })
          .eq("id", campaignId)
      }
    }

    // Se for uma impressão, atualizar contador na campanha
    if (eventType === "impression") {
      // Buscar campanha atual para atualizar valores
      const { data: currentCampaign } = await supabase
        .from("ad_campaigns")
        .select("impressions, spent")
        .eq("id", campaignId)
        .single()

      if (currentCampaign) {
        await supabase
          .from("ad_campaigns")
          .update({ 
            impressions: (currentCampaign.impressions || 0) + 1,
            spent: (currentCampaign.spent || 0) + 0.01 // Custo por impressão simulado
          })
          .eq("id", campaignId)
      }
    }

    return NextResponse.json({ success: true, metric })
  } catch (error) {
    console.error("Erro na API de métricas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaignId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const eventType = searchParams.get("eventType")

    let query = supabase
      .from("ad_metrics")
      .select(`
        *,
        campaign:ad_campaigns(*)
      `)

    if (campaignId) {
      query = query.eq("campaign_id", campaignId)
    }

    if (startDate) {
      query = query.gte("timestamp", startDate)
    }

    if (endDate) {
      query = query.lte("timestamp", endDate)
    }

    if (eventType) {
      query = query.eq("event_type", eventType)
    }

    const { data: metrics, error } = await query

    if (error) {
      console.error("Erro ao buscar métricas:", error)
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }

    // Agrupar métricas por tipo
    const groupedMetrics = metrics?.reduce((acc, metric) => {
      const type = metric.event_type
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(metric)
      return acc
    }, {} as Record<string, any[]>) || {}

    // Calcular totais
    const totals = {
      impressions: (groupedMetrics.impression || []).length || 0,
      clicks: (groupedMetrics.click || []).length || 0,
      conversions: (groupedMetrics.conversion || []).length || 0,
      totalEvents: (metrics || []).length || 0
    }

    return NextResponse.json({ 
      metrics, 
      groupedMetrics, 
      totals,
      summary: {
        ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
        conversionRate: totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0
      }
    })
  } catch (error) {
    console.error("Erro na API de métricas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 
