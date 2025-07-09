import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface AuthUser extends User {
  user_metadata: {
    username?: string
    full_name?: string
  }
}

// Função para registrar usuário
export const signUp = async (
  email: string,
  password: string,
  userData: {
    username: string
    full_name: string
  },
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })

  if (error) throw error
  return data
}

// Função para fazer login
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

// Função para fazer logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Função para obter usuário atual
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user as AuthUser
}

// Função para atualizar perfil
export const updateProfile = async (updates: {
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  interests?: string[]
}) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  })

  if (error) throw error
  return data
}
