// middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // IMPORTANTE: Excluir rotas da API do middleware
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        } } }
  )

  // IMPORTANTE: Usar getUser() ao invés de getSession() para validação server-side
  const {
    data: { user } } = await supabase.auth.getUser()

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/callback', '/auth/confirm-email', '/privacy', '/terms']
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // Se não está autenticado e tenta acessar rota protegida
  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.pathname + request.nextUrl.search
    return NextResponse.redirect(
      new URL(`/auth/signin?redirect=${encodeURIComponent(redirectUrl)}`, request.url)
    )
  }

  // Se está autenticado e tenta acessar signin/signup, redireciona para home
  if (user && (request.nextUrl.pathname === '/auth/signin' || request.nextUrl.pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Se está na raiz e autenticado, vai para home
  if (user && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (explicitly excluded in middleware)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ] }
