import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json({
        error: "Erro ao obter sessão",
        details: error.message,
        timestamp: new Date().toISOString(),
      })
    }

    if (!session) {
      return NextResponse.json({
        error: "Usuário não autenticado",
        timestamp: new Date().toISOString(),
      })
    }

    // Buscar dados do perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json({
        error: "Erro ao buscar perfil",
        details: profileError.message,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: {
        id: session.user.id,
        email: session.user.email,
        emailConfirmed: !!session.user.email_confirmed_at,
        createdAt: session.user.created_at,
        userMetadata: session.user.user_metadata,
      },
      profile: profile,
      viewData: {
        shouldShowProfile: true,
        authLoading: false,
        userExists: true,
        profileExists: !!profile,
      }
    })
  } catch (error) {
    console.error("Erro na API de teste my-profile:", error)
    return NextResponse.json({
      error: "Erro interno",
      details: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp: new Date().toISOString(),
    })
  }
} 