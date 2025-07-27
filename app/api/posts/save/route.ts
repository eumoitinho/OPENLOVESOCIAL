import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { NextResponse } from "next/server"
import { z } from "zod"

const savePostSchema = z.object({
  postId: z.string().uuid(),
  folder_name: z.string().max(100).optional().default('default')
})

export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient()
    const body = await request.json()
    const { postId, folder_name } = savePostSchema.parse(body)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar ID do usuário atual na tabela users
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o post existe
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    // Verificar se já está salvo
    const { data: existingSave, error: checkError } = await supabase
      .from("saved_posts")
      .select("id, folder_name")
      .eq("user_id", currentUser.id)
      .eq("post_id", postId)
      .single()

    if (existingSave) {
      // Remover dos salvos
      const { error: deleteError } = await supabase
        .from("saved_posts")
        .delete()
        .eq("id", existingSave.id)

      if (deleteError) {
        console.error("Erro ao remover dos salvos:", deleteError)
        return NextResponse.json({ error: "Erro ao remover dos salvos" }, { status: 500 })
      }

      return NextResponse.json({
        message: "Post removido dos salvos",
        data: {
          saved: false,
          action: "unsaved"
        }
      })
    } else {
      // Salvar post
      const { data: savedPost, error: insertError } = await supabase
        .from("saved_posts")
        .insert({
          user_id: currentUser.id,
          post_id: postId,
          folder_name
        })
        .select("id, folder_name")
        .single()

      if (insertError) {
        console.error("Erro ao salvar post:", insertError)
        return NextResponse.json({ error: "Erro ao salvar post" }, { status: 500 })
      }

      // Criar notificação se não for o próprio autor
      if (post.user_id !== currentUser.id) {
        const { data: currentUserData } = await supabase
          .from("users")
          .select("username, name, avatar_url")
          .eq("id", currentUser.id)
          .single()

        await supabase
          .from("notifications")
          .insert({
            recipient_id: post.user_id,
            sender_id: currentUser.id,
            type: "post_save",
            title: "Post salvo",
            content: `${currentUserData?.name || currentUserData?.username || 'Alguém'} salvou seu post`,
            icon: "Bookmark",
            related_data: {
              post_id: postId,
              user_id: currentUser.id,
              username: currentUserData?.username,
              name: currentUserData?.name,
              avatar_url: currentUserData?.avatar_url,
              folder_name
            },
            action_url: `/posts/${postId}`
          })
      }

      return NextResponse.json({
        message: "Post salvo com sucesso",
        data: {
          saved: true,
          action: "saved",
          folder: folder_name
        }
      })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro interno na API de salvar:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createRouteHandlerClient()
    const url = new URL(request.url)
    const postId = url.searchParams.get('postId')
    
    if (!postId) {
      return NextResponse.json({ error: "ID do post é obrigatório" }, { status: 400 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar ID do usuário atual na tabela users
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o post está salvo
    const { data: savedPost, error: checkError } = await supabase
      .from("saved_posts")
      .select("id, folder_name, created_at")
      .eq("user_id", currentUser.id)
      .eq("post_id", postId)
      .single()

    return NextResponse.json({
      data: {
        saved: !!savedPost,
        folder: savedPost?.folder_name || null,
        savedAt: savedPost?.created_at || null
      }
    })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
