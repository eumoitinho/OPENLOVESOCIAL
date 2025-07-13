import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const envInfo = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Definida" : "Não definida",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Definida" : "Não definida",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Definida" : "Não definida",
      NODE_ENV: process.env.NODE_ENV,
    }

    return NextResponse.json({ 
      success: true, 
      env: envInfo,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Debug env error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
} 