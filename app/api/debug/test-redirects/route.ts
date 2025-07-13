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

    // Verificar timeout de sessão
    let sessionExpired = false
    if (session) {
      const tokenExp = session.expires_at ? session.expires_at * 1000 : 0
      const currentTime = Date.now()
      const maxSessionAge = 5 * 60 * 60 * 1000 // 5 horas
      
      if (tokenExp && currentTime > tokenExp) {
        sessionExpired = true
      }
    }

    // Simular lógica de redirecionamento
    const currentPath = "/" // Simulando acesso à página inicial
    const protectedFromLoggedIn = ["/", "/auth/signin", "/auth/signup"]
    const shouldRedirectToHome = session && !sessionExpired && protectedFromLoggedIn.includes(currentPath)
    const shouldRedirectToLogin = !session && currentPath === "/home" as string

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        emailConfirmed: !!session?.user?.email_confirmed_at,
        expiresAt: session?.expires_at,
        currentTime: Date.now(),
        expired: sessionExpired,
      },
      redirectLogic: {
        currentPath,
        protectedFromLoggedIn,
        shouldRedirectToHome,
        shouldRedirectToLogin,
        reason: shouldRedirectToHome 
          ? "Usuário logado em rota protegida" 
          : shouldRedirectToLogin 
          ? "Usuário não logado tentando acessar /home"
          : "Nenhum redirecionamento necessário"
      },
      debug: {
        sessionAge: session ? Date.now() - (session.expires_at ? session.expires_at * 1000 : 0) : null,
        maxSessionAge: 5 * 60 * 60 * 1000,
        timeUntilExpiry: session && session.expires_at ? (session.expires_at * 1000) - Date.now() : null,
      }
    })
  } catch (error) {
    console.error("Erro na API de teste de redirecionamento:", error)
    return NextResponse.json({
      error: "Erro interno",
      details: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp: new Date().toISOString(),
    })
  }
} 