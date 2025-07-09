import { createClient } from "@supabase/supabase-js"

// Singleton pattern para o cliente Supabase
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Variáveis de ambiente do Supabase não configuradas")
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// Cliente para uso geral
export const supabase = getSupabaseClient()

// Tipos para o banco de dados
export interface User {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  interests: string[]
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  name: string
  description: string
  category: string
  image_url?: string
  member_count: number
  is_private: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  community_id: string
  created_by: string
  max_participants?: number
  current_participants: number
  created_at: string
  updated_at: string
}
