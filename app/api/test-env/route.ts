import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    console.log("=== TESTE DE VARIÁVEIS DE AMBIENTE ===")
    
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
    }
    
    console.log("Variáveis de ambiente:", envVars)
    
    // Verificar se as principais estão configuradas
    const missingVars = []
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingVars.push('SUPABASE_SERVICE_ROLE_KEY')
    
    return NextResponse.json({
      success: missingVars.length === 0,
      envVars,
      missingVars,
      message: missingVars.length === 0 ? "Todas as variáveis configuradas" : `Variáveis faltando: ${missingVars.join(', ')}`
    })

  } catch (error) {
    console.error("=== ERRO NO TESTE DE ENV ===")
    console.error("Erro:", error)
    
    return NextResponse.json(
      { 
        error: "Erro interno no teste de variáveis",
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}