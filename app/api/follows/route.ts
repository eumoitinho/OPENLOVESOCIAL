import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
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

      return NextResponse.json({ success: true, following: false })
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

      return NextResponse.json({ success: true, following: true })
    }
  } catch (error) {
    console.error("Erro na API de follows:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
} 