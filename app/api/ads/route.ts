import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/app/lib/database.types"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const advertiserId = searchParams.get("advertiserId")
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    let query = supabase
      .from("ad_campaigns")
      .select(`
        *,
        advertiser:advertisers(*)
      `)

    if (advertiserId) {
      query = query.eq("advertiser_id", advertiserId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (type) {
      query = query.eq("type", type)
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error("Erro ao buscar campanhas:", error)
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Erro na API de anúncios:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      type,
      title,
      description,
      cta,
      image,
      budget,
      duration,
      targetAudience,
      category,
      advertiserId
    } = body

    // Validações básicas
    if (!name || !type || !title || !description || !budget) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    // Verificar se o anunciante existe
    const { data: advertiser, error: advertiserError } = await supabase
      .from("advertisers")
      .select("*")
      .eq("id", advertiserId)
      .single()

    if (advertiserError || !advertiser) {
      return NextResponse.json({ error: "Anunciante não encontrado" }, { status: 404 })
    }

    // Verificar saldo do anunciante
    if (advertiser.balance < budget) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 })
    }

    // Criar campanha
    const { data: campaign, error: campaignError } = await supabase
      .from("ad_campaigns")
      .insert({
        name,
        type,
        title,
        description,
        cta,
        image,
        budget,
        duration,
        target_audience: targetAudience,
        category,
        advertiser_id: advertiserId,
        status: "draft",
        created_by: user.id
      })
      .select()
      .single()

    if (campaignError) {
      console.error("Erro ao criar campanha:", campaignError)
      return NextResponse.json({ error: "Erro ao criar campanha" }, { status: 500 })
    }

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error("Erro na API de anúncios:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId, ...updates } = body

    if (!campaignId) {
      return NextResponse.json({ error: "ID da campanha é obrigatório" }, { status: 400 })
    }

    // Verificar se a campanha existe e pertence ao usuário
    const { data: existingCampaign, error: fetchError } = await supabase
      .from("ad_campaigns")
      .select("*, advertiser:advertisers(*)")
      .eq("id", campaignId)
      .single()

    if (fetchError || !existingCampaign) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
    }

    // Atualizar campanha
    const { data: campaign, error: updateError } = await supabase
      .from("ad_campaigns")
      .update(updates)
      .eq("id", campaignId)
      .select()
      .single()

    if (updateError) {
      console.error("Erro ao atualizar campanha:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar campanha" }, { status: 500 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("Erro na API de anúncios:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("id")

    if (!campaignId) {
      return NextResponse.json({ error: "ID da campanha é obrigatório" }, { status: 400 })
    }

    // Verificar se a campanha existe
    const { data: campaign, error: fetchError } = await supabase
      .from("ad_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
    }

    // Deletar campanha
    const { error: deleteError } = await supabase
      .from("ad_campaigns")
      .delete()
      .eq("id", campaignId)

    if (deleteError) {
      console.error("Erro ao deletar campanha:", deleteError)
      return NextResponse.json({ error: "Erro ao deletar campanha" }, { status: 500 })
    }

    return NextResponse.json({ message: "Campanha deletada com sucesso" })
  } catch (error) {
    console.error("Erro na API de anúncios:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
