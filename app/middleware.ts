import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  console.log("=== MIDDLEWARE START ===")
  console.log("Middleware: Processando requisição para:", req.nextUrl.pathname)
  console.log("Middleware: URL completa:", req.url)
  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("Middleware: Sessão encontrada:", session ? "Sim" : "Não")
  console.log("Middleware: User ID:", session?.user?.id)
  console.log("Middleware: User Email:", session?.user?.email)
  console.log("Middleware: Email confirmado:", session?.user?.email_confirmed_at)
  console.log("Middleware: Session expires_at:", session?.expires_at)
  console.log("Middleware: Current time:", Date.now())

  // Verificar timeout de sessão (5 horas = 18000000 ms)
  if (session) {
    // Usar o access_token exp para verificar expiração
    const tokenExp = session.expires_at ? session.expires_at * 1000 : 0
    const currentTime = Date.now()
    const maxSessionAge = 5 * 60 * 60 * 1000 // 5 horas em milissegundos
    
    // Se o token expirou ou a sessão tem mais de 5 horas
    if (tokenExp && currentTime > tokenExp) {
      console.log("Middleware: Token expirado, fazendo logout")
      await supabase.auth.signOut()
      
      // Redirecionar para página inicial com mensagem de sessão expirada
      const homeUrl = new URL("/", req.url)
      homeUrl.searchParams.set("session", "expired")
      console.log("Middleware: Redirecionando para:", homeUrl.toString())
      return NextResponse.redirect(homeUrl)
    }
  }

  // Rotas que usuários logados não devem acessar (redirecionar para /home)
  const protectedFromLoggedIn = ["/", "/auth/signin", "/auth/signup"]
  
  // Se o usuário está logado e está em uma rota que não deve acessar
  if (session && protectedFromLoggedIn.includes(req.nextUrl.pathname)) {
    console.log("Middleware: Usuário logado em rota protegida, redirecionando para home")
    console.log("Middleware: Rota atual:", req.nextUrl.pathname)
    console.log("Middleware: Rotas protegidas:", protectedFromLoggedIn)
    console.log("Middleware: User ID:", session.user.id)
    console.log("Middleware: User Email:", session.user.email)
    const homeUrl = new URL("/home", req.url)
    console.log("Middleware: Redirecionando para:", homeUrl.toString())
    return NextResponse.redirect(homeUrl)
  }

  // Se o usuário não está logado e está tentando acessar /home
  if (!session && req.nextUrl.pathname === "/home") {
    console.log("Middleware: Usuário não logado tentando acessar /home, redirecionando para /")
    const homeUrl = new URL("/", req.url)
    console.log("Middleware: Redirecionando para:", homeUrl.toString())
    return NextResponse.redirect(homeUrl)
  }

  // Se o usuário não está logado e está tentando acessar outras rotas protegidas
  if (!session && !req.nextUrl.pathname.startsWith("/auth") && req.nextUrl.pathname !== "/" && req.nextUrl.pathname !== "/api") {
    console.log("Middleware: Usuário não logado tentando acessar rota protegida")
    // Salvar a URL original para redirecionar após o login
    const redirectUrl = req.nextUrl.pathname + req.nextUrl.search
    const signinUrl = new URL("/auth/signin", req.url)
    signinUrl.searchParams.set("redirect", redirectUrl)
    console.log("Middleware: Redirecionando para:", signinUrl.toString())
    return NextResponse.redirect(signinUrl)
  }

  // Se o usuário está logado mas o email não foi confirmado, permitir acesso apenas a rotas específicas
  if (session && !session.user.email_confirmed_at) {
    console.log("Middleware: Usuário logado mas email não confirmado")
    const allowedRoutes = ["/auth/signin", "/auth/signup", "/auth/confirm-email", "/", "/api"]
    const isAllowedRoute = allowedRoutes.some(route => req.nextUrl.pathname.startsWith(route))
    
    if (!isAllowedRoute) {
      console.log("Middleware: Redirecionando para confirmação de email")
      const signinUrl = new URL("/auth/signin?email=unconfirmed", req.url)
      console.log("Middleware: Redirecionando para:", signinUrl.toString())
      return NextResponse.redirect(signinUrl)
    }
  }

  console.log("Middleware: Continuando sem redirecionamento")
  console.log("=== MIDDLEWARE END ===")
  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
