import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Enviar email de confirmação
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    })

    if (error) {
      console.error("Error sending verification email:", error)
      return NextResponse.json(
        { error: "Erro ao enviar email de verificação" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Email de verificação enviado com sucesso" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in verify-email route:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    
    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Verificar status da sessão atual
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    // Verificar se o email foi confirmado
    const isConfirmed = session.user.email_confirmed_at !== null

    return NextResponse.json(
      { 
        confirmed: isConfirmed,
        email: session.user.email,
        email_confirmed_at: session.user.email_confirmed_at
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in verify-email route:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 