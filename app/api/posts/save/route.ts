import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient()
    const { postId } = await request.json()
    
    console.log("[Save API] Tentativa de salvar post:", postId)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se já está salvo
    const { data: existingSave } = await supabase
      .from("saved_posts")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .single()

    if (existingSave) {
      // Remover dos salvos
      const { error: deleteError } = await supabase
        .from("saved_posts")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", postId)

      if (deleteError) {
        console.error("Erro ao remover dos salvos:", deleteError)
        return NextResponse.json({ error: "Erro ao remover dos salvos" }, { status: 500 })
      }

      console.log("[Save API] Post removido dos salvos")
      return NextResponse.json({ action: "unsaved", saved: false })
    } else {
      // Salvar post
      const { error: insertError } = await supabase
        .from("saved_posts")
        .insert({
          user_id: user.id,
          post_id: postId
        })

      if (insertError) {
        console.error("Erro ao salvar post:", insertError)
        return NextResponse.json({ error: "Erro ao salvar post" }, { status: 500 })
      }

      console.log("[Save API] Post salvo com sucesso")
      return NextResponse.json({ action: "saved", saved: true })
    }

  } catch (error) {
    console.error("Erro interno na API de salvar:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}