import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type PlanoType = "gold" | "diamante" | "diamante_anual"

const PLANOS_CODIGOS = {
  gold: "2c93808497eec1c50197f5377401026e",
  diamante: "2c93808497eec1c50197f53886f60270", 
  diamante_anual: "OPENDIMAYEAR"
} as const

const PLANOS_PRECOS = {
  gold: 25.0,
  diamante: 45.9,
  diamante_anual: 459.0
} as const

const PLANOS_FREQUENCIAS = {
  gold: 1,
  diamante: 1,
  diamante_anual: 12
} as const

// Defina os tipos válidos de plano
const planData = {
  gold: {
    plan_id: PLANOS_CODIGOS.gold,
    redirect: "https://openlove.com.br/planoativado/gold" },
  diamante: {
    plan_id: PLANOS_CODIGOS.diamante,
    redirect: "https://openlove.com.br/planoativado/diamante" },
  diamante_anual: {
    plan_id: PLANOS_CODIGOS.diamante_anual,
    redirect: "https://openlove.com.br/planoativado/diamante-anual" } } as const

export async function POST(req: NextRequest) {
  const formData = await req.json()
  const { token, email, plano, cardholderName, identificationType, identificationNumber } = formData

  console.log("Dados completos recebidos:", formData)
  console.log("Dados recebidos:", { token, email, plano, cardholderName, identificationType, identificationNumber })
  console.log("Email do formulário:", email)
  console.log("Token recebido:", token)
  console.log("Tipo do token:", typeof token)

  if (!plano || !(plano in planData)) {
    console.log("Plano inválido:", plano, "Planos válidos:", Object.keys(planData))
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
  }

  if (!token || !email) {
    console.log("Campos obrigatórios faltando:", { token: !!token, email: !!email })
    return NextResponse.json({ error: "Token e email são obrigatórios" }, { status: 400 })
  }

  // Campos opcionais com valores padrão
  const finalCardholderName = cardholderName || "Cliente OpenLove"
  const finalIdentificationType = identificationType || "CPF"
  const finalIdentificationNumber = identificationNumber || "00000000000"

  const planoKey = plano as PlanoType

  try {
    console.log("Iniciando criação da assinatura...")
    
    // 1. Criar ou buscar cliente no Mercado Pago
    console.log("Criando/buscando cliente com email:", email)
    let customerId = await getOrCreateCustomer(email, finalCardholderName, finalIdentificationType, finalIdentificationNumber)
    console.log("Cliente criado/buscado:", customerId)

    // 2. Criar assinatura usando a API correta
    console.log("Criando assinatura com email:", email)
    const subscription = await createSubscription(customerId, token, planData[planoKey].plan_id, email)
    console.log("Assinatura criada:", subscription)

    if (subscription.status === "authorized" || subscription.status === "pending") {
      // 4. Atualizar usuário no Supabase
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Variáveis de ambiente do Supabase não configuradas")
      }
      
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      await supabase
        .from("users")
        .update({ 
          plano: planoKey,
          mp_customer_id: customerId,
          mp_subscription_id: subscription.id,
          status_assinatura: subscription.status
        })
        .eq("email", email)

      return NextResponse.json({ redirectUrl: subscription.init_point || planData[planoKey].redirect })
    } else {
      return NextResponse.json({ error: "Falha ao criar assinatura" }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro na criação da assinatura:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

async function getOrCreateCustomer(email: string, name: string, identificationType: string, identificationNumber: string) {
  const accessToken = process.env.MP_ACCESS_TOKEN || process.env.MP_ACESS_TOKEN
  
  if (!accessToken) {
    throw new Error("Token de acesso do Mercado Pago não configurado")
  }

  // Primeiro, tenta buscar cliente existente
  const searchResponse = await fetch(`https://api.mercadopago.com/v1/customers/search?email=${email}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}` } })

  const searchResult = await searchResponse.json()
  
  if (searchResult.results && (searchResult.results || []).length > 0) {
    return searchResult.results[0].id
  }

  // Se não existir, cria novo cliente
  const createResponse = await fetch("https://api.mercadopago.com/v1/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}` },
    body: JSON.stringify({
      email,
      first_name: name && name.trim() ? name.split(" ")[0] : "Cliente",
      last_name: name && name.trim() ? name.split(" ").slice(1).join(" ") : "OpenLove",
      ...(identificationType && identificationNumber && {
        identification: {
          type: identificationType,
          number: identificationNumber } }) }) })

  const customer = await createResponse.json()
  
  if (customer.error) {
    throw new Error(`Erro ao criar cliente: ${customer.message}`)
  }
  
  return customer.id
}



async function createSubscription(customerId: string, token: string | null, planId: string, email: string) {
  const accessToken = process.env.MP_ACCESS_TOKEN || process.env.MP_ACESS_TOKEN
  
  console.log("Criando assinatura com token:", token)
  
  // Se não tiver token válido, criar preferência de checkout
  if (!token) {
    console.log("Token inválido, criando preferência de checkout...")
    return await createCheckoutPreference(planId, email, customerId, accessToken!)
  }
  
  // Criar assinatura usando a API correta do Mercado Pago
  const subscriptionData = {
    preapproval_plan_id: planId,
    reason: `Assinatura OpenLove ${planId === PLANOS_CODIGOS.gold ? 'Gold' : planId === PLANOS_CODIGOS.diamante ? 'Diamante' : 'Diamante Anual'}`,
    external_reference: `subscription_${customerId}_${planId}`,
    payer_email: email,
    card_token_id: token, // Usando o token original do cartão
    auto_recurring: {
      frequency: planId === PLANOS_CODIGOS.diamante_anual ? PLANOS_FREQUENCIAS.diamante_anual : PLANOS_FREQUENCIAS.gold,
      frequency_type: "months",
      transaction_amount: planId === PLANOS_CODIGOS.gold ? PLANOS_PRECOS.gold : planId === PLANOS_CODIGOS.diamante ? PLANOS_PRECOS.diamante : PLANOS_PRECOS.diamante_anual,
      currency_id: "BRL" },
    back_url: "https://openlove.com.br/dashboard" }

  console.log("Dados da assinatura:", subscriptionData)
  
  const response = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}` },
    body: JSON.stringify(subscriptionData) })

  const result = await response.json()
  
  if (result.error) {
    console.log("Erro na assinatura, criando checkout tradicional...")
    return await createCheckoutPreference(planId, email, customerId, accessToken!)
  }
  
  return result
}

async function createCheckoutPreference(planId: string, email: string, customerId: string, accessToken: string) {
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}` },
    body: JSON.stringify({
      items: [
        {
          title: `OpenLove ${planId === PLANOS_CODIGOS.gold ? 'Gold' : planId === PLANOS_CODIGOS.diamante ? 'Diamante' : 'Diamante Anual'}`,
          unit_price: planId === PLANOS_CODIGOS.gold ? PLANOS_PRECOS.gold : planId === PLANOS_CODIGOS.diamante ? PLANOS_PRECOS.diamante : PLANOS_PRECOS.diamante_anual,
          quantity: 1,
          currency_id: "BRL" }
      ],
      payer: {
        email: email,
        name: "Cliente OpenLove" },
      back_urls: {
        success: "https://openlove.com.br/dashboard",
        failure: "https://openlove.com.br/auth/signup",
        pending: "https://openlove.com.br/dashboard" },
      auto_return: "approved",
      external_reference: `subscription_${customerId}_${planId}`,
      notification_url: "https://openlove.com.br/api/mercadopago/webhook" }) })

  const result = await response.json()
  
  if (result.error) {
    throw new Error(`Erro ao criar preferência: ${result.message}`)
  }
  
  return {
    status: "pending",
    id: result.id,
    init_point: result.init_point }
} 
