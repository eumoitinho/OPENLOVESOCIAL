import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { PlanoType, PLANOS_CODIGOS, PLANOS_PRECOS, PLANOS_FREQUENCIAS } from "@/types/mercadopago"

// Defina os tipos válidos de plano
const planData = {
  gold: {
    plan_id: PLANOS_CODIGOS.gold,
    redirect: "https://openlove.com.br/planoativado/gold",
  },
  diamante: {
    plan_id: PLANOS_CODIGOS.diamante,
    redirect: "https://openlove.com.br/planoativado/diamante",
  },
  diamante_anual: {
    plan_id: PLANOS_CODIGOS.diamante_anual,
    redirect: "https://openlove.com.br/planoativado/diamante-anual",
  },
} as const

export async function POST(req: NextRequest) {
  const { token, email, plano, cardholderName, identificationType, identificationNumber } = await req.json()

  if (!plano || !(plano in planData)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
  }

  const planoKey = plano as PlanoType

  try {
    // 1. Criar ou buscar cliente no Mercado Pago
    let customerId = await getOrCreateCustomer(email, cardholderName, identificationType, identificationNumber)

    // 2. Salvar cartão do cliente
    const cardId = await saveCustomerCard(customerId, token)

    // 3. Criar assinatura
    const subscription = await createSubscription(customerId, cardId, planData[planoKey].plan_id)

    if (subscription.status === "authorized" || subscription.status === "pending") {
      // 4. Atualizar usuário no Supabase
      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      await supabase
        .from("users")
        .update({ 
          plano: planoKey,
          mp_customer_id: customerId,
          mp_subscription_id: subscription.id,
          status_assinatura: subscription.status
        })
        .eq("email", email)

      return NextResponse.json({ redirectUrl: planData[planoKey].redirect })
    } else {
      return NextResponse.json({ error: "Falha ao criar assinatura" }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro na criação da assinatura:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

async function getOrCreateCustomer(email: string, name: string, identificationType: string, identificationNumber: string) {
  // Primeiro, tenta buscar cliente existente
  const searchResponse = await fetch(`https://api.mercadopago.com/v1/customers/search?email=${email}`, {
    headers: {
      "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
  })

  const searchResult = await searchResponse.json()
  
  if (searchResult.results && searchResult.results.length > 0) {
    return searchResult.results[0].id
  }

  // Se não existir, cria novo cliente
  const createResponse = await fetch("https://api.mercadopago.com/v1/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      email,
      first_name: name.split(" ")[0],
      last_name: name.split(" ").slice(1).join(" ") || "",
      identification: {
        type: identificationType,
        number: identificationNumber,
      },
    }),
  })

  const customer = await createResponse.json()
  return customer.id
}

async function saveCustomerCard(customerId: string, token: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/customers/${customerId}/cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      token,
    }),
  })

  const card = await response.json()
  return card.id
}

async function createSubscription(customerId: string, cardId: string, planId: string) {
  const response = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      preapproval_plan_id: planId,
      payer_email: customerId, // Usar customerId como referência
      card_token_id: cardId,
      auto_recurring: {
        frequency: planId === PLANOS_CODIGOS.diamante_anual ? PLANOS_FREQUENCIAS.diamante_anual : PLANOS_FREQUENCIAS.gold,
        frequency_type: "months",
        transaction_amount: planId === PLANOS_CODIGOS.gold ? PLANOS_PRECOS.gold : planId === PLANOS_CODIGOS.diamante ? PLANOS_PRECOS.diamante : PLANOS_PRECOS.diamante_anual,
        currency_id: "BRL",
      },
      back_url: "https://openlove.com.br/dashboard",
    }),
  })

  return await response.json()
} 