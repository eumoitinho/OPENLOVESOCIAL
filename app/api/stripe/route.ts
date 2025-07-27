import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/app/lib/database.types"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY não configurada")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil" })

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId } = await request.json()

    if (!priceId || !userId) {
      return NextResponse.json({ error: "Price ID e User ID são obrigatórios" }, { status: 400 })
    }

    const supabase = createServerComponentClient<Database>({ cookies })

    // Verificar se o usuário existe
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Criar sessão do Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer_email: profile.email || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1 },
      ],
      mode: "subscription",
      success_url: `${request.nextUrl.origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        priceId: priceId },
      subscription_data: {
        metadata: {
          userId: userId } } })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Erro na API do Stripe:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
