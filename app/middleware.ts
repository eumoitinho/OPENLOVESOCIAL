import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se o usuário está logado e está em uma rota de auth, redirecionar para timeline
  if (session && req.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/timeline", req.url))
  }

  // Se o usuário não está logado e está tentando acessar uma rota protegida
  if (!session && !req.nextUrl.pathname.startsWith("/auth") && req.nextUrl.pathname !== "/") {
    // Salvar a URL original para redirecionar após o login
    const redirectUrl = req.nextUrl.pathname + req.nextUrl.search
    const signinUrl = new URL("/auth/signin", req.url)
    signinUrl.searchParams.set("redirect", redirectUrl)
    return NextResponse.redirect(signinUrl)
  }

  // Se o usuário está logado mas o email não foi confirmado, permitir acesso apenas a rotas específicas
  if (session && !session.user.email_confirmed_at) {
    const allowedRoutes = ["/auth/signin", "/auth/signup", "/", "/api"]
    const isAllowedRoute = allowedRoutes.some(route => req.nextUrl.pathname.startsWith(route))
    
    if (!isAllowedRoute) {
      return NextResponse.redirect(new URL("/auth/signin?email=unconfirmed", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
