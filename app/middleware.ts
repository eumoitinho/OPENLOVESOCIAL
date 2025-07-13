// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  console.log("=== MIDDLEWARE START ===")
  console.log("Middleware: Processando requisição para:", req.nextUrl.pathname)
  
  // Atualiza sessão Supabase e cookies primeiro
  const res = await updateSession(req)

  // Proteção personalizada para o OpenLove
  // Sempre obtenha o usuário validado do Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => req.cookies.get(name)?.value } }
  )
  const { data, error } = await supabase.auth.getUser()
  const user = data?.user

  // Rotas públicas e protegidas do OpenLove
  const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/auth/confirm-email"]
  const protectedRoutes = ["/home", "/dashboard", "/profile", "/timeline", "/content", "/friends", "/events"]
  const currentPath = req.nextUrl.pathname

  // 1. Rota pública: se logado e na landing, redireciona para /home
  if (publicRoutes.includes(currentPath)) {
    if (currentPath === "/" && user) {
      return NextResponse.redirect(new URL("/home", req.url))
    }
    return res
  }

  // 2. Proteção de rotas protegidas
  if (protectedRoutes.some(route => currentPath === route || currentPath.startsWith(route + "/"))) {
    if (!user) {
      const redirectUrl = req.nextUrl.pathname + req.nextUrl.search
      const signinUrl = new URL("/auth/signin", req.url)
      signinUrl.searchParams.set("redirect", redirectUrl)
      return NextResponse.redirect(signinUrl)
    }
  }

  // 3. Outras rotas não públicas nem protegidas
  if (!publicRoutes.includes(currentPath) && !protectedRoutes.some(route => currentPath === route || currentPath.startsWith(route + "/"))) {
    if (!user) {
      const signinUrl = new URL("/auth/signin", req.url)
      const redirectUrl = req.nextUrl.pathname + req.nextUrl.search
      signinUrl.searchParams.set("redirect", redirectUrl)
      return NextResponse.redirect(signinUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}