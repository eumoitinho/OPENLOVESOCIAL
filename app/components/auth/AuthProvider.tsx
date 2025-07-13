"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import type { Database } from "@/app/lib/database.types"

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

// Criar cliente Supabase uma única vez
const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchProfile = async (userId: string) => {
    try {
      console.log("[AuthProvider] Buscando perfil para usuário:", userId)
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()
      
      if (error) {
        console.error("[AuthProvider] Erro ao buscar perfil:", error)
        setProfile(null)
        return null
      }
      
      setProfile(data)
      console.log("[AuthProvider] Perfil encontrado:", data)
      return data
    } catch (error) {
      console.error("[AuthProvider] Erro ao buscar perfil:", error)
      setProfile(null)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const signOut = async () => {
    try {
      console.log("[AuthProvider] Fazendo logout...")
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      setSession(null)
      
      router.push("/")
      router.refresh() // Força refresh para limpar cookies server-side
    } catch (error) {
      console.error("[AuthProvider] Erro ao fazer logout:", error)
    }
  }

  useEffect(() => {
    // Verificar sessão inicial
    const initializeAuth = async () => {
      try {
        console.log("[AuthProvider] Inicializando autenticação...")
        
        // Usar getSession() para obter sessão inicial do cookie
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("[AuthProvider] Erro ao obter sessão:", error)
          setLoading(false)
          return
        }
        
        if (session) {
          console.log("[AuthProvider] Sessão encontrada:", session.user.email)
          setSession(session)
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          console.log("[AuthProvider] Nenhuma sessão encontrada")
        }
        
        setLoading(false)
      } catch (error) {
        console.error("[AuthProvider] Erro na inicialização:", error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthProvider] Auth state changed:", event, session?.user?.email)
      
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setSession(null)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          setSession(session)
          setUser(session.user)
          await fetchProfile(session.user.id)
          
          // Força refresh da página para sincronizar cookies
          if (event === 'SIGNED_IN') {
            router.refresh()
          }
        }
      } else if (event === 'USER_UPDATED') {
        if (session) {
          setSession(session)
          setUser(session.user)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

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