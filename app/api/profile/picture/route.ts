import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { mediaId } = await request.json()

    if (!mediaId) {
      return NextResponse.json({ error: "ID da mídia é obrigatório" }, { status: 400 })
    }

    // Usar a função RPC para definir foto de perfil
    const { data, error } = await supabase.rpc("set_profile_picture", {
      media_id: mediaId,
    })

    if (error) {
      console.error("Erro ao definir foto de perfil:", error)
      return NextResponse.json({ error: "Erro ao definir foto de perfil" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Mídia não encontrada ou não é uma imagem" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao definir foto de perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
