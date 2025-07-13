
import { createRouteHandlerClient } from '@/app/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/home'

  if (code) {
    const supabase = await createRouteHandlerClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Redirecionar para a URL desejada
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
    } catch (error) {
      console.error('Erro ao trocar código por sessão:', error)
    }
  }

  // Erro ou sem código - redirecionar para signin
  return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin))
}