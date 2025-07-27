import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { following_id } = await request.json()
    
    if (!following_id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    if (following_id === user.id) {
      return NextResponse.json({ error: "Não é possível seguir a si mesmo" }, { status: 400 })
    }

    // Verificar se já segue o usuário
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", following_id)
      .single()

    if (existingFollow) {
      // Deixar de seguir
      const { error: deleteError } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", following_id)

      if (deleteError) {
        console.error("Erro ao deixar de seguir:", deleteError)
        return NextResponse.json({ error: "Erro interno" }, { status: 500 })
      }

      // Se havia uma relação de amizade, também removê-la
      const { error: friendError } = await supabase
        .from("friends")
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${following_id}),and(user_id.eq.${following_id},friend_id.eq.${user.id})`)
        .eq("status", "accepted")

      if (friendError) {
        console.warn("Erro ao remover amizade:", friendError)
      }

      return NextResponse.json({ success: true, following: false, mutualFriends: false })
    } else {
      // Seguir
      const { error: insertError } = await supabase
        .from("follows")
        .insert({
          follower_id: user.id,
          following_id: following_id
        })

      if (insertError) {
        console.error("Erro ao seguir usuário:", insertError)
        return NextResponse.json({ error: "Erro interno" }, { status: 500 })
      }

      // Verificar se o usuário também segue de volta (seguimento mútuo)
      const { data: mutualFollow } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", following_id)
        .eq("following_id", user.id)
        .single()

      let mutualFriends = false

      if (mutualFollow) {
        console.log("Seguimento mútuo detectado! Criando relação de amizade...")
        
        // Verificar se já existe uma relação de amizade
        const { data: existingFriendship } = await supabase
          .from("friends")
          .select("id")
          .or(`and(user_id.eq.${user.id},friend_id.eq.${following_id}),and(user_id.eq.${following_id},friend_id.eq.${user.id})`)
          .single()

        if (!existingFriendship) {
          // Criar nova relação de amizade
          const { error: friendshipError } = await supabase
            .from("friends")
            .insert({
              user_id: user.id,
              friend_id: following_id,
              status: "accepted"
            })

          if (friendshipError) {
            console.error("Erro ao criar amizade:", friendshipError)
          } else {
            console.log("Amizade criada com sucesso!")
            mutualFriends = true
          }
        } else {
          mutualFriends = true
        }
      }

      return NextResponse.json({ 
        success: true, 
        following: true, 
        mutualFriends: mutualFriends 
      })
    }
  } catch (error) {
    console.error("Erro na API de follows:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
} 
