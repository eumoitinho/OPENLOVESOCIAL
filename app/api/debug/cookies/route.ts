import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Verificar cookies do Supabase
    const supabaseCookies = {
      accessToken: cookieStore.get('sb-access-token')?.value ? "Presente" : "Ausente",
      refreshToken: cookieStore.get('sb-refresh-token')?.value ? "Presente" : "Ausente",
      authToken: cookieStore.get('sb-jgvbwevezjgzsamqnitp-auth-token')?.value ? "Presente" : "Ausente",
      authToken0: cookieStore.get('sb-jgvbwevezjgzsamqnitp-auth-token.0')?.value ? "Presente" : "Ausente",
    }

    // Listar todos os cookies
    const allCookies = Array.from(cookieStore.getAll()).map(cookie => ({
      name: cookie.name,
      value: cookie.value ? "Definido" : "Vazio",
    }))

    return NextResponse.json({ 
      success: true, 
      supabaseCookies,
      allCookies,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Debug cookies error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
} 