import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// POST - Criar enquete
export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Configuração do servidor incompleta" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar autenticação
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Token de autenticação necessário" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    // Verificar se o usuário é assinante
    const { data: userProfile } = await supabase
      .from("users")
      .select("plano, status_assinatura")
      .eq("id", user.id)
      .single()

    if (!userProfile || userProfile.plano === "free") {
      return NextResponse.json(
        { error: "Enquetes disponíveis apenas para assinantes" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { content, pollOptions, visibility = "public", durationDays = 7 } = body

    if (!pollOptions || !Array.isArray(pollOptions) || pollOptions.length < 2 || pollOptions.length > 4) {
      return NextResponse.json(
        { error: "Enquete deve ter entre 2 e 4 opções" },
        { status: 400 }
      )
    }

    // Validar que todas as opções têm conteúdo
    const validOptions = pollOptions.filter(option => option && option.trim().length > 0)
    if (validOptions.length < 2) {
      return NextResponse.json(
        { error: "Pelo menos 2 opções devem ter conteúdo" },
        { status: 400 }
      )
    }

    // Criar post com enquete
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: content || "",
        poll_question: "Enquete", // Você pode adicionar um campo para a pergunta
        poll_options: validOptions,
        poll_ends_at: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
        post_type: "poll",
        visibility: visibility,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (postError) {
      console.error("Erro ao criar enquete:", postError)
      return NextResponse.json(
        { error: "Erro ao criar enquete" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      post: postData,
      message: "Enquete criada com sucesso!"
    })

  } catch (error) {
    console.error("Erro no processamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// PUT - Votar em enquete
export async function PUT(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Configuração do servidor incompleta" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar autenticação
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Token de autenticação necessário" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { postId, optionIndex } = body

    if (postId === undefined || optionIndex === undefined) {
      return NextResponse.json(
        { error: "postId e optionIndex são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se a enquete existe e não expirou
    const { data: postData } = await supabase
      .from("posts")
      .select("poll_ends_at, poll_options")
      .eq("id", postId)
      .single()

    if (!postData) {
      return NextResponse.json(
        { error: "Enquete não encontrada" },
        { status: 404 }
      )
    }

    if (postData.poll_ends_at && new Date(postData.poll_ends_at) < new Date()) {
      return NextResponse.json(
        { error: "Enquete expirada" },
        { status: 400 }
      )
    }

    const pollOptions = postData.poll_options || []
    if (optionIndex < 0 || optionIndex >= pollOptions.length) {
      return NextResponse.json(
        { error: "Opção inválida" },
        { status: 400 }
      )
    }

    // Verificar se o usuário já votou
    const { data: existingVote } = await supabase
      .from("poll_votes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    if (existingVote) {
      // Atualizar voto existente
      const { error: updateError } = await supabase
        .from("poll_votes")
        .update({ option_index: optionIndex, created_at: new Date().toISOString() })
        .eq("id", existingVote.id)

      if (updateError) {
        console.error("Erro ao atualizar voto:", updateError)
        return NextResponse.json(
          { error: "Erro ao atualizar voto" },
          { status: 500 }
        )
      }
    } else {
      // Inserir novo voto
      const { error: insertError } = await supabase
        .from("poll_votes")
        .insert({
          post_id: postId,
          user_id: user.id,
          option_index: optionIndex
        })

      if (insertError) {
        console.error("Erro ao inserir voto:", insertError)
        return NextResponse.json(
          { error: "Erro ao votar na enquete" },
          { status: 500 }
        )
      }
    }

    // Buscar estatísticas atualizadas
    const { data: stats } = await supabase.rpc("get_poll_stats", { post_uuid: postId })

    return NextResponse.json({
      success: true,
      stats: stats,
      message: "Voto registrado com sucesso!"
    })

  } catch (error) {
    console.error("Erro no processamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// GET - Obter estatísticas da enquete
export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Configuração do servidor incompleta" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "postId é obrigatório" },
        { status: 400 }
      )
    }

    // Buscar estatísticas da enquete
    const { data: stats, error: statsError } = await supabase.rpc("get_poll_stats", { post_uuid: postId })

    if (statsError) {
      console.error("Erro ao buscar estatísticas:", statsError)
      return NextResponse.json(
        { error: "Erro ao buscar estatísticas da enquete" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      stats: stats
    })

  } catch (error) {
    console.error("Erro no processamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 
