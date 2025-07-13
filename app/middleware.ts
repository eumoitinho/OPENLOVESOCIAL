// middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  console.log("=== MIDDLEWARE START ===")
  console.log("Middleware: Processando requisição para:", req.nextUrl.pathname)
  
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          res.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  // Tentar obter a sessão atual
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("Middleware: Sessão encontrada:", session ? "Sim" : "Não")
  console.log("Middleware: User ID:", session?.user?.id)
  console.log("Middleware: Email confirmado:", session?.user?.email_confirmed_at)

  // Definir rotas
  const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/auth/confirm-email"]
  const protectedRoutes = ["/home", "/dashboard", "/profile"] // adicione suas rotas protegidas aqui
  const currentPath = req.nextUrl.pathname

  // 1. VERIFICAR SE É ROTA PÚBLICA - permitir acesso direto
  if (publicRoutes.includes(currentPath)) {
    // Só redirecionar para /home se estiver na landing page "/" 
    if (currentPath === "/" && session && session.user.email_confirmed_at) {
      console.log("Middleware: Usuário logado acessando landing page, redirecionando para /home")
      const homeUrl = new URL("/home", req.url)
      return NextResponse.redirect(homeUrl)
    }
    // Se não está logado ou email não confirmado, permitir acesso
    console.log("Middleware: Permitindo acesso a rota pública")
    return res
  }

  // 2. VERIFICAR SESSÃO E EXPIRAÇÃO
  if (session) {
    // Verificar se o token expirou
    const tokenExp = session.expires_at ? session.expires_at * 1000 : 0
    const currentTime = Date.now()
    
    if (tokenExp && currentTime > tokenExp) {
      console.log("Middleware: Token expirado, fazendo logout")
      await supabase.auth.signOut()
      
      // Redirecionar para página inicial com mensagem
      const homeUrl = new URL("/", req.url)
      homeUrl.searchParams.set("session", "expired")
      return NextResponse.redirect(homeUrl)
    }

    // Verificar se o email foi confirmado
    if (!session.user.email_confirmed_at) {
      console.log("Middleware: Email não confirmado, redirecionando para signin")
      const signinUrl = new URL("/auth/signin", req.url)
      signinUrl.searchParams.set("email", "unconfirmed")
      return NextResponse.redirect(signinUrl)
    }
  }

  // 3. VERIFICAR ROTAS PROTEGIDAS
  if (protectedRoutes.includes(currentPath) || currentPath.startsWith("/dashboard")) {
    if (!session) {
      console.log("Middleware: Usuário não logado tentando acessar rota protegida")
      // Salvar URL para redirecionar após login
      const redirectUrl = req.nextUrl.pathname + req.nextUrl.search
      const signinUrl = new URL("/auth/signin", req.url)
      signinUrl.searchParams.set("redirect", redirectUrl)
      return NextResponse.redirect(signinUrl)
    }
  }

  // 4. OUTRAS ROTAS NÃO PÚBLICAS E NÃO PROTEGIDAS EXPLICITAMENTE
  // Para rotas que não são explicitamente públicas nem protegidas
  if (!publicRoutes.includes(currentPath) && !protectedRoutes.includes(currentPath)) {
    if (!session) {
      console.log("Middleware: Usuário não logado tentando acessar rota não pública")
      const signinUrl = new URL("/auth/signin", req.url)
      const redirectUrl = req.nextUrl.pathname + req.nextUrl.search
      signinUrl.searchParams.set("redirect", redirectUrl)
      return NextResponse.redirect(signinUrl)
    }
  }

  console.log("Middleware: Permitindo acesso")
  console.log("=== MIDDLEWARE END ===")
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}