import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const PLANOS_CODIGOS = {
  gold: "2c93808497eec1c50197f5377401026e",
  diamante: "2c93808497eec1c50197f53886f60270", 
  diamante_anual: "OPENDIMAYEAR"
} as const

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
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas")
  }
  
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  
  console.log("Processando atualização de assinatura:", data)
  
  // Buscar usuário pelo ID da assinatura
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("mp_subscription_id", data.id)
    .single()

  if (user) {
    const plano = data.preapproval_plan_id === PLANOS_CODIGOS.gold ? "gold" : 
                  data.preapproval_plan_id === PLANOS_CODIGOS.diamante ? "diamante" : 
                  data.preapproval_plan_id === PLANOS_CODIGOS.diamante_anual ? "diamante_anual" : null
    
    await supabase
      .from("users")
      .update({ 
        status_assinatura: data.status,
        plano: plano
      })
      .eq("id", user.id)
      
    console.log(`Usuário ${user.email} atualizado - Status: ${data.status}, Plano: ${plano}`)
  } else {
    console.log("Usuário não encontrado para assinatura:", data.id)
  }
}

async function handlePaymentUpdate(data: any) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas")
  }
  
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  
  console.log("Processando atualização de pagamento:", data)
  
  // Buscar usuário pelo ID do pagamento ou customer_id
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("mp_customer_id", data.payer?.id)
    .single()

  if (user) {
    await supabase
      .from("users")
      .update({ 
        status_assinatura: data.status,
        ultimo_pagamento: data.date_approved || data.date_created
      })
      .eq("id", user.id)
      
    console.log(`Pagamento processado para usuário ${user.email} - Status: ${data.status}`)
  } else {
    console.log("Usuário não encontrado para pagamento:", data.payer?.id)
  }
}

async function handleSubscriptionPayment(data: any) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas")
  }
  
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  
  console.log("Processando pagamento de assinatura:", data)
  
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
      
    console.log(`Pagamento de assinatura processado para usuário ${user.email} - Status: ${data.status}`)
  } else {
    console.log("Usuário não encontrado para pagamento de assinatura:", data.subscription_id)
  }
} 
