import { createServerComponentClient, createRouteHandlerClient } from './supabase-server'
import type { User } from '@supabase/supabase-js'

// Para Server Components
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerComponentClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Erro ao obter usuário:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error)
    return null
  }
}

// Para Route Handlers
export async function verifyAuth(): Promise<{ user: User | null; error: string | null }> {
  const supabase = await createRouteHandlerClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return { user: null, error: error.message }
    }
    
    if (!user) {
      return { user: null, error: 'Não autenticado' }
    }
    
    // Verificar se a sessão não expirou
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { user: null, error: 'Sessão expirada' }
    }
    
    return { user, error: null }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error)
    return { user: null, error: 'Erro interno' }
  }
}