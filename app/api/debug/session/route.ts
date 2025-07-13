import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Obter sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Verificar cookies de autenticação
    const authCookie = cookieStore.get('sb-jgvbwevezjgzsamqnitp-auth-token')
    const refreshCookie = cookieStore.get('sb-jgvbwevezjgzsamqnitp-auth-token-refresh')

    // Verificar timeout de sessão
    let sessionExpired = false
    if (session) {
      const tokenExp = session.expires_at ? session.expires_at * 1000 : 0
      const currentTime = Date.now()
      const maxSessionAge = 5 * 60 * 60 * 1000 // 5 horas
      sessionExpired = tokenExp && currentTime > tokenExp
    }

    return NextResponse.json({
      success: true,
      data: {
        session: {
          exists: !!session,
          user_id: session?.user?.id,
          email: session?.user?.email,
          email_confirmed: session?.user?.email_confirmed_at,
          expires_at: session?.expires_at,
          created_at: session?.created_at,
          expires_in: session?.expires_in,
          token_type: session?.token_type,
          access_token_length: session?.access_token?.length || 0,
          refresh_token_length: session?.refresh_token?.length || 0,
        },
        user: {
          exists: !!user,
          id: user?.id,
          email: user?.email,
          email_confirmed: user?.email_confirmed_at,
          created_at: user?.created_at,
          last_sign_in: user?.last_sign_in_at,
        },
        cookies: {
          auth_cookie_exists: !!authCookie,
          auth_cookie_value_length: authCookie?.value?.length || 0,
          refresh_cookie_exists: !!refreshCookie,
          refresh_cookie_value_length: refreshCookie?.value?.length || 0,
        },
        session_status: {
          expired: sessionExpired,
          current_time: new Date().toISOString(),
          session_age_ms: session ? Date.now() - (session.created_at ? new Date(session.created_at).getTime() : 0) : 0,
          time_until_expiry_ms: session && session.expires_at ? (session.expires_at * 1000) - Date.now() : 0,
        },
        errors: {
          session_error: sessionError?.message,
          user_error: userError?.message,
        }
      }
    })
  } catch (error) {
    console.error("Debug session error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
} 