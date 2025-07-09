import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is signed in and the current path is /auth redirect the user to /timeline
  if (session && req.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/timeline", req.url))
  }

  // If user is not signed in and the current path is not /auth redirect the user to /auth/signin
  if (!session && !req.nextUrl.pathname.startsWith("/auth") && req.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
