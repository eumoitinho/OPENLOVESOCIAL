import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("API Test - Usuário não autenticado:", authError)
      return NextResponse.json({ 
        authenticated: false, 
        error: authError?.message || "No user found" 
      })
    }

    console.log("API Test - Usuário autenticado:", user.id, user.email)

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at
      }
    })
  } catch (error) {
    console.error("API Test - Erro:", error)
    return NextResponse.json({ 
      authenticated: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
} 
