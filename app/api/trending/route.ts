import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase"
import { verifyAuth } from "@/app/lib/auth-helpers"

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient()
    const { user, error } = await verifyAuth()
    if (error || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const today = new Date().toISOString().slice(0, 10)

    // Buscar perfis Gold e Diamante que querem se promover hoje
    // Supondo que existe uma tabela 'promoted_profiles' com user_id, date, plano, promo_count
    // Se não existir, buscar direto dos usuários com lógica de limitação
    const { data: golds, error: goldError } = await supabase
      .from("users")
      .select(`
        id, name, username, avatar_url, plano, tokens, tokens_received, bio, interests, is_verified
      `)
      .eq("plano", "gold")
      .eq("is_active", true)
      .order("tokens_received", { ascending: false })
      .limit(10)

    const { data: diamantes, error: diamanteError } = await supabase
      .from("users")
      .select(`
        id, name, username, avatar_url, plano, tokens, tokens_received, bio, interests, is_verified
      `)
      .eq("plano", "diamante")
      .eq("is_active", true)
      .order("tokens_received", { ascending: false })
      .limit(10)

    if (goldError || diamanteError) {
      return NextResponse.json({ error: "Erro ao buscar perfis patrocinados" }, { status: 500 })
    }

    // Lógica de promoção diária: gold 1x/dia, diamante 4x/dia
    // (Aqui, para simplificar, sorteia 1 gold e até 4 diamantes aleatórios)
    function shuffle(arr: any[]) {
      return arr.map(a => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map(a => a[1])
    }
    const goldPromoted = shuffle(golds || []).slice(0, 1)
    const diamantePromoted = shuffle(diamantes || []).slice(0, 4)
    const promoted = [...goldPromoted, ...diamantePromoted]

    // Formatar para o frontend
    const trendingProfiles = promoted.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      avatar_url: u.avatar_url,
      plano: u.plano,
      tokens: u.tokens || u.tokens_received || 0,
      tokens_received: u.tokens_received || u.tokens || 0,
      bio: u.bio,
      interests: u.interests,
      verified: u.is_verified,
      description: u.bio,
      tags: u.interests || [],
    }))

    return NextResponse.json({ data: trendingProfiles })
  } catch (error) {
    console.error("Erro na API de trending:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
} 