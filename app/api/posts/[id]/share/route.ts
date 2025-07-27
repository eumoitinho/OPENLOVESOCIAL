import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"

const shareSchema = z.object({
  share_type: z.enum(['timeline', 'direct_message', 'external']).default('timeline'),
  content: z.string().max(500).optional(),
  recipient_ids: z.array(z.string().uuid()).optional(),
  platform: z.enum(['whatsapp', 'telegram', 'twitter', 'facebook', 'linkedin', 'copy_link']).optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { id: postId } = await params
    const body = await request.json()
    const { share_type, content, recipient_ids, platform } = shareSchema.parse(body)

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar ID do usuário atual na tabela users
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id, username, name, avatar_url")
      .eq("auth_id", user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o post existe
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id, content, media_urls, stats, visibility")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    // Verificar se o post é público ou se o usuário tem acesso
    if (post.visibility !== 'public' && post.user_id !== currentUser.id) {
      // Verificar se segue o autor para posts de amigos
      if (post.visibility === 'friends') {
        const { data: follow } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUser.id)
          .eq("following_id", post.user_id)
          .single()

        if (!follow) {
          return NextResponse.json({ error: "Sem permissão para compartilhar este post" }, { status: 403 })
        }
      } else if (post.visibility === 'private') {
        return NextResponse.json({ error: "Não é possível compartilhar posts privados" }, { status: 403 })
      }
    }

    let shareResponse: any = {}

    // Processar compartilhamento baseado no tipo
    switch (share_type) {
      case 'timeline':
        // Criar um novo post compartilhando o original
        const { data: sharedPost, error: shareError } = await supabase
          .from("posts")
          .insert({
            user_id: currentUser.id,
            content: content || `Compartilhado de @${post.user_id}`,
            visibility: 'public',
            stats: {
              likes_count: 0,
              comments_count: 0,
              shares_count: 0,
              views_count: 0
            },
            // Adicionar referência ao post original
            event_details: {
              type: 'shared_post',
              original_post_id: postId,
              original_author_id: post.user_id
            }
          })
          .select("id")
          .single()

        if (shareError) {
          console.error("Erro ao compartilhar no timeline:", shareError)
          return NextResponse.json({ error: "Erro ao compartilhar no timeline" }, { status: 500 })
        }

        shareResponse = {
          type: 'timeline',
          shared_post_id: sharedPost.id
        }
        break

      case 'direct_message':
        if (!recipient_ids || recipient_ids.length === 0) {
          return NextResponse.json({ error: "IDs dos destinatários são obrigatórios para mensagem direta" }, { status: 400 })
        }

        // Enviar mensagem para cada destinatário
        const messagePromises = recipient_ids.map(async (recipientId) => {
          // Criar ou buscar conversa
          const { data: conversation, error: convError } = await supabase
            .from("conversations")
            .select("id")
            .or(`and(type.eq.direct,created_by.eq.${currentUser.id}),and(type.eq.direct,created_by.eq.${recipientId})`)
            .single()

          let conversationId = conversation?.id

          if (!conversationId) {
            // Criar nova conversa
            const { data: newConv, error: newConvError } = await supabase
              .from("conversations")
              .insert({
                type: 'direct',
                created_by: currentUser.id
              })
              .select("id")
              .single()

            if (newConvError) {
              throw new Error("Erro ao criar conversa")
            }

            conversationId = newConv.id

            // Adicionar participantes
            await supabase
              .from("conversation_participants")
              .insert([
                { conversation_id: conversationId, user_id: currentUser.id, role: 'admin' },
                { conversation_id: conversationId, user_id: recipientId, role: 'member' }
              ])
          }

          // Enviar mensagem com o post
          return supabase
            .from("messages")
            .insert({
              conversation_id: conversationId,
              sender_id: currentUser.id,
              content: content || "Compartilhou um post",
              type: 'text',
              media_metadata: {
                type: 'shared_post',
                post_id: postId,
                post_content: post.content,
                post_media: post.media_urls
              }
            })
        })

        await Promise.all(messagePromises)

        shareResponse = {
          type: 'direct_message',
          sent_to: recipient_ids.length
        }
        break

      case 'external':
        // Gerar link compartilhável
        const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/posts/${postId}`
        
        shareResponse = {
          type: 'external',
          platform: platform || 'copy_link',
          share_url: shareUrl,
          share_text: `Confira este post no OpenLove: ${post.content?.slice(0, 100)}${post.content && post.content.length > 100 ? '...' : ''}`
        }
        break
    }

    // Atualizar contador de compartilhamentos do post
    const currentShares = (post.stats?.shares_count || 0) + 1
    await supabase
      .from("posts")
      .update({
        stats: {
          ...post.stats,
          shares_count: currentShares
        }
      })
      .eq("id", postId)

    // Criar notificação para o autor do post (se não for ele mesmo)
    if (post.user_id !== currentUser.id) {
      await supabase
        .from("notifications")
        .insert({
          recipient_id: post.user_id,
          sender_id: currentUser.id,
          type: "post_share",
          title: "Post compartilhado",
          content: `${currentUser.name || currentUser.username || 'Alguém'} compartilhou seu post`,
          icon: "Share",
          related_data: {
            post_id: postId,
            user_id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            avatar_url: currentUser.avatar_url,
            share_type
          },
          action_url: `/posts/${postId}`
        })
    }

    return NextResponse.json({
      message: "Post compartilhado com sucesso",
      data: {
        shares_count: currentShares,
        ...shareResponse
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { id: postId } = await params

    // Verificar se o post existe
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, stats, user_id")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    // Buscar informações de compartilhamento
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/posts/${postId}`
    
    // Buscar posts que compartilharam este (se públicos)
    const { data: sharedPosts, error: sharedError } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        created_at,
        users!inner (
          id,
          username,
          name,
          avatar_url
        )
      `)
      .eq("event_details->>original_post_id", postId)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      data: {
        shares_count: post.stats?.shares_count || 0,
        share_url: shareUrl,
        recent_shares: sharedPosts || []
      }
    })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
