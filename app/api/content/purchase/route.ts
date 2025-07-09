import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/app/lib/database.types"

export async function POST(request: NextRequest) {
  try {
    const { contentId, price } = await request.json()

    if (!contentId || !price) {
      return NextResponse.json({ error: "Content ID e preço são obrigatórios" }, { status: 400 })
    }

    const supabase = createServerComponentClient<Database>({ cookies })

    // Verificar usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Verificar se o conteúdo existe
    const { data: content, error: contentError } = await supabase
      .from("paid_content")
      .select("*")
      .eq("id", contentId)
      .single()

    if (contentError || !content) {
      return NextResponse.json({ error: "Conteúdo não encontrado" }, { status: 404 })
    }

    // Verificar se já comprou
    const { data: existingPurchase } = await supabase
      .from("content_purchases")
      .select("id")
      .eq("content_id", contentId)
      .eq("user_id", user.id)
      .single()

    if (existingPurchase) {
      return NextResponse.json({ error: "Conteúdo já foi comprado" }, { status: 400 })
    }

    // Verificar saldo do usuário (simulado)
    const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).single()

    if (!profile || (profile.wallet_balance || 0) < price) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 })
    }

    // Processar compra
    const { error: purchaseError } = await supabase.from("content_purchases").insert([
      {
        content_id: contentId,
        user_id: user.id,
        price: price,
        purchased_at: new Date().toISOString(),
      },
    ])

    if (purchaseError) {
      throw purchaseError
    }

    // Atualizar saldo do comprador
    await supabase
      .from("profiles")
      .update({
        wallet_balance: (profile.wallet_balance || 0) - price,
      })
      .eq("id", user.id)

    // Atualizar ganhos do criador (80% para o criador)
    const creatorEarnings = price * 0.8
    await supabase.rpc("update_creator_earnings", {
      creator_id: content.user_id,
      amount: creatorEarnings,
    })

    // Atualizar contador de compras
    await supabase
      .from("paid_content")
      .update({
        purchase_count: (content.purchase_count || 0) + 1,
      })
      .eq("id", contentId)

    return NextResponse.json({
      success: true,
      message: "Conteúdo comprado com sucesso!",
    })
  } catch (error) {
    console.error("Erro na compra de conteúdo:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
