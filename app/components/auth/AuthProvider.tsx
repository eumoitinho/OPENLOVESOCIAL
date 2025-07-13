// app/components/auth/AuthProvider.tsx
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  interests: string[]
  created_at: string
  updated_at: string
  plano?: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useEffect(() => {
    if (typeof document !== "undefined") {
      console.log("[AuthProvider] Cookies atuais:", document.cookie);
    }
  }, []);
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Função para verificar timeout de sessão
  const checkSessionTimeout = (session: Session | null) => {
    if (!session) return false
    
    const tokenExp = session.expires_at ? session.expires_at * 1000 : 0
    const currentTime = Date.now()
    const maxSessionAge = 5 * 60 * 60 * 1000 // 5 horas em milissegundos
    
    // Se o token expirou ou a sessão tem mais de 5 horas
    if (tokenExp && currentTime > tokenExp) {
      console.log("[AuthProvider] Sessão expirada, fazendo logout")
      return true
    }
    
    return false
  }

  const fetchProfile = async (userId: string) => {
    try {
      console.log("[AuthProvider] Buscando perfil para usuário:", userId)
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
      if (error || !data) {
        console.error("[AuthProvider] Error fetching profile:", error)
        setProfile(null)
        return null
      }
      setProfile(data)
      console.log("[AuthProvider] Perfil encontrado:", data)
      return data
    } catch (error) {
      console.error("[AuthProvider] Error fetching profile:", error)
      setProfile(null)
      return null
    }
  }

  const checkEmailConfirmation = async () => {
    if (user && !user.email_confirmed_at) {
      // Verificar se o email foi confirmado recentemente
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email_confirmed_at) {
        setUser(session.user)
        return true
      }
    }
    return false
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  const signOut = async () => {
    try {
      console.log("[AuthProvider] Fazendo logout...")
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
      // Redirecionar para página inicial após logout
      router.push("/")
    } catch (error) {
      console.error("[AuthProvider] Error signing out:", error)
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log("[AuthProvider] Iniciando getInitialSession...")
        setLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error("[AuthProvider] Error getting session:", error)
          setUser(null)
          setProfile(null)
          setSession(null)
        } else if (checkSessionTimeout(session)) {
          await signOut()
        } else if (session?.user) {
          setSession(session)
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error("[AuthProvider] Error in getInitialSession (catch):", error)
        setUser(null)
        setProfile(null)
        setSession(null)
      } finally {
        setLoading(false)
        console.log("[AuthProvider] Loading finalizado (getInitialSession)")
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthProvider] Auth state changed:", event, session?.user?.id)
      console.log("[AuthProvider] Event type:", event)
      console.log("[AuthProvider] Session exists:", !!session)
      console.log("[AuthProvider] User email:", session?.user?.email)
      console.log("[AuthProvider] URL atual:", typeof window !== "undefined" ? window.location.pathname : "server")

      // Verificar timeout de sessão
      if (checkSessionTimeout(session)) {
        console.log("[AuthProvider] Sessão expirada no onAuthStateChange, fazendo logout")
        await signOut()
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        console.log("[AuthProvider] Buscando perfil para usuário:", session.user.id)
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
        console.log("[AuthProvider] Perfil carregado:", profileData ? "Sim" : "Não")
        // Removido: redirecionamento para /home (agora feito em useEffect)
      } else {
        console.log("[AuthProvider] Nenhum usuário na sessão, limpando perfil")
        setProfile(null)
      }

      setLoading(false)
      console.log("[AuthProvider] Loading finalizado (onAuthStateChange)")
      console.log("[AuthProvider] Estado final - User:", !!session?.user, "Profile:", !!profile)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Verificar timeout periodicamente (a cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (session && checkSessionTimeout(session)) {
        signOut()
      }
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [session])

  // Removido: redirecionamento duplicado após carregamento do usuário
  // Redirecionar para /home quando usuário loga e está em /auth/signin ou /auth/signup
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const currentPath = window.location.pathname
      if (["/", "/auth/signin", "/auth/signup"].includes(currentPath)) {
        console.log("[AuthProvider] Redirecionando para /home após login (useEffect)")
        router.push("/home")
      }
    }
  }, [user, router])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}