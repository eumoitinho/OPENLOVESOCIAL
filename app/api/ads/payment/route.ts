import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Stripe from "stripe"
import type { Database } from "@/app/lib/database.types"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, advertiserId, paymentMethod, description } = body

    if (!amount || !advertiserId) {
      return NextResponse.json({ error: "Valor e ID do anunciante são obrigatórios" }, { status: 400 })
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

    // Criar ou buscar cliente no Stripe
    let stripeCustomerId = advertiser.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: advertiser.email,
        name: advertiser.name,
        metadata: {
          advertiser_id: advertiserId,
          user_id: user.id
        }
      })

      stripeCustomerId = customer.id

      // Atualizar anunciante com o ID do cliente Stripe
      await supabase
        .from("advertisers")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", advertiserId)
    }

    // Criar PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Converter para centavos
      currency: "brl",
      customer: stripeCustomerId,
      description: description || `Adicionar saldo - ${advertiser.name}`,
      metadata: {
        advertiser_id: advertiserId,
        user_id: user.id,
        type: "ad_balance"
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Registrar transação no banco
    const { data: transaction, error: transactionError } = await supabase
      .from("ad_transactions")
      .insert({
        advertiser_id: advertiserId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount,
        status: "pending",
        type: "deposit",
        description: description || "Adicionar saldo",
        created_by: user.id
      })
      .select()
      .single()

    if (transactionError) {
      console.error("Erro ao registrar transação:", transactionError)
      return NextResponse.json({ error: "Erro ao registrar transação" }, { status: 500 })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      transactionId: transaction.id
    })
  } catch (error) {
    console.error("Erro na API de pagamento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    const body = await request.json()
    const { paymentIntentId, status, advertiserId } = body

    if (!paymentIntentId || !status || !advertiserId) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    // Atualizar status da transação
    const { data: transaction, error: transactionError } = await supabase
      .from("ad_transactions")
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq("stripe_payment_intent_id", paymentIntentId)
      .select()
      .single()

    if (transactionError) {
      console.error("Erro ao atualizar transação:", transactionError)
      return NextResponse.json({ error: "Erro ao atualizar transação" }, { status: 500 })
    }

    // Se o pagamento foi confirmado, adicionar saldo ao anunciante
    if (status === "succeeded" && transaction) {
      const { data: advertiser } = await supabase
        .from("advertisers")
        .select("balance")
        .eq("id", advertiserId)
        .single()

      if (advertiser) {
        await supabase
          .from("advertisers")
          .update({ 
            balance: (advertiser.balance || 0) + transaction.amount,
            updated_at: new Date().toISOString()
          })
          .eq("id", advertiserId)
      }
    }

    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    console.error("Erro na API de pagamento:", error)
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
    const advertiserId = searchParams.get("advertiserId")
    const status = searchParams.get("status")

    let query = supabase
      .from("ad_transactions")
      .select(`
        *,
        advertiser:advertisers(*)
      `)
      .order("created_at", { ascending: false })

    if (advertiserId) {
      query = query.eq("advertiser_id", advertiserId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error("Erro ao buscar transações:", error)
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Erro na API de pagamento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 