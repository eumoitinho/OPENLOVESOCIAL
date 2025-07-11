import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { PLANOS_CODIGOS } from "@/types/mercadopago"

export async function POST(req: NextRequest) {
  const body = await req.json()

  console.log("Webhook recebido:", body)

  try {
    // Processar diferentes tipos de notificações
    if (body.type === "subscription_preapproval") {
      await handleSubscriptionUpdate(body.data)
    } else if (body.type === "payment") {
      await handlePaymentUpdate(body.data)
    } else if (body.type === "subscription_authorized_payment") {
      await handleSubscriptionPayment(body.data)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro no webhook:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

async function handleSubscriptionUpdate(data: any) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // Buscar usuário pelo ID da assinatura
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("mp_subscription_id", data.id)
    .single()

  if (user) {
    await supabase
      .from("users")
      .update({ 
        status_assinatura: data.status,
        plano: data.preapproval_plan_id === PLANOS_CODIGOS.gold ? "gold" : data.preapproval_plan_id === PLANOS_CODIGOS.diamante ? "diamante" : "diamante_anual"
      })
      .eq("id", user.id)
  }
}

async function handlePaymentUpdate(data: any) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // Buscar usuário pelo ID do pagamento ou customer_id
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("mp_customer_id", data.payer.id)
    .single()

  if (user) {
    await supabase
      .from("users")
      .update({ 
        status_assinatura: data.status,
        ultimo_pagamento: data.date_approved || data.date_created
      })
      .eq("id", user.id)
  }
}

async function handleSubscriptionPayment(data: any) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // Buscar usuário pelo ID da assinatura
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("mp_subscription_id", data.subscription_id)
    .single()

  if (user) {
    await supabase
      .from("users")
      .update({ 
        status_assinatura: data.status,
        ultimo_pagamento: data.date_approved || data.date_created
      })
      .eq("id", user.id)
  }
} 