import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar cards recomendados usando a função SQL
    const { data: recommendedCards, error } = await supabase.rpc('get_recommended_cards', {
      p_user_id: user.id,
      p_limit: 20
    })

    if (error) {
      console.error("Erro ao buscar cards recomendados:", error)
      return NextResponse.json({ error: "Erro ao buscar recomendações" }, { status: 500 })
    }

    // Formatar os dados para o frontend
    const formattedCards = recommendedCards?.map((card: any) => ({
      id: card.card_id,
      user_id: card.user_id,
      title: card.title,
      subtitle: card.subtitle,
      description: card.description,
      image_url: card.image_url,
      icon: card.icon,
      colors: card.colors,
      distance: card.distance,
      age: card.age,
      common_interests: card.common_interests,
      user: {
        full_name: card.title, // Usar o título como nome por enquanto
        username: card.subtitle,
        avatar_url: card.image_url,
        age: card.age,
        location: card.distance ? `${Math.round(card.distance)}km` : undefined,
        interests: card.common_interests,
        profile_type: 'single'
      }
    })) || []

    // Se não há cards suficientes, adicionar cards de exemplo
    if ((formattedCards || []).length < 5) {
      const sampleCards = [
        {
          id: "sample-1",
          user_id: "sample-user-1",
          title: "Maria & Carlos",
          subtitle: "Casal Aventura",
          description: "Casal apaixonado por viagens e fotografia. Sempre em busca de novas experiências e conexões autênticas.",
          image_url: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2762&q=80",
          icon: "heart",
          colors: {
            primary: "#1a1a1a",
            secondary: "#333333",
            text: "#ffffff",
            shadow: "rgba(0, 0, 0, 0.5)"
          },
          distance: 5.2,
          age: 28,
          common_interests: ["viagens", "fotografia", "música"],
          user: {
            full_name: "Maria & Carlos",
            username: "mariacarlos",
            avatar_url: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2762&q=80",
            age: 28,
            location: "5.2km",
            interests: ["viagens", "fotografia", "música"],
            profile_type: "couple"
          }
        },
        {
          id: "sample-2",
          user_id: "sample-user-2",
          title: "Ana Silva",
          subtitle: "Solteira Independente",
          description: "Mulher independente que ama arte, gastronomia e conversas profundas. Buscando conexões genuínas.",
          image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2760&q=80",
          icon: "star",
          colors: {
            primary: "#0f2b46",
            secondary: "#1e4976",
            text: "#ffffff",
            shadow: "rgba(15, 43, 70, 0.6)"
          },
          distance: 8.7,
          age: 32,
          common_interests: ["arte", "gastronomia", "literatura"],
          user: {
            full_name: "Ana Silva",
            username: "anasilva",
            avatar_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2760&q=80",
            age: 32,
            location: "8.7km",
            interests: ["arte", "gastronomia", "literatura"],
            profile_type: "single"
          }
        },
        {
          id: "sample-3",
          user_id: "sample-user-3",
          title: "Rafael & Sofia",
          subtitle: "Casal Criativo",
          description: "Casal criativo apaixonado por design, tecnologia e inovação. Sempre explorando novas possibilidades.",
          image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2760&q=80",
          icon: "users",
          colors: {
            primary: "#2d4a22",
            secondary: "#4a7a38",
            text: "#ffffff",
            shadow: "rgba(45, 74, 34, 0.6)"
          },
          distance: 12.3,
          age: 30,
          common_interests: ["design", "tecnologia", "inovação"],
          user: {
            full_name: "Rafael & Sofia",
            username: "rafaelsofia",
            avatar_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2760&q=80",
            age: 30,
            location: "12.3km",
            interests: ["design", "tecnologia", "inovação"],
            profile_type: "couple"
          }
        }
      ]
      
      formattedCards.push(...sampleCards)
    }

    return NextResponse.json({ 
      cards: formattedCards,
      total: (formattedCards || []).length
    })

  } catch (error) {
    console.error("Erro na API de recomendações:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 
