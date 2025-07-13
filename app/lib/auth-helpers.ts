import { createServerClient } from "@supabase/ssr"
import { createBrowserClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export function createClientSupabaseClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Função helper para verificar autenticação e timeout de sessão
export async function verifyAuth() {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session) {
      return { user: null, error: "Unauthorized" }
    }

    // Verificar timeout de sessão (5 horas)
    const tokenExp = session.expires_at ? session.expires_at * 1000 : 0
    const currentTime = Date.now()
    
    if (tokenExp && currentTime > tokenExp) {
      // Sessão expirada, fazer logout
      await supabase.auth.signOut()
      return { user: null, error: "Session expired" }
    }

    return { user: session.user, error: null }
  } catch (error) {
    console.error("Error in verifyAuth:", error)
    return { user: null, error: "Authentication error" }
  }
}

export async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Error in getAuthenticatedUser:", error)
    return null
  }
}

export async function getUserProfile(userId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log("[getUserProfile] Buscando perfil para usuário:", userId)
    const { data: profile, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("[getUserProfile] Erro ao buscar perfil:", error)
      return null
    }

    console.log("[getUserProfile] Perfil encontrado:", profile)
    return profile
  } catch (error) {
    console.error("[getUserProfile] Erro inesperado:", error)
    return null
  }
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  await supabase.auth.getUser()

  return response
}
