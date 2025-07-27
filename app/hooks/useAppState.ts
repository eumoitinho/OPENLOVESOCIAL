"use client"

import { create } from "zustand"
import { createClient } from "@/app/lib/supabase-browser"

// Tipos
interface User {
  id: string
  email: string
  full_name?: string
  username?: string
  avatar_url?: string
  premium?: boolean
  verified?: boolean
}

interface AppState {
  // Estado do usuário
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Estado da interface
  theme: 'light' | 'dark' | 'auto'
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  activeView: string
  
  // Estado das notificações
  notifications: any[]
  unreadCount: number
  
  // Estado do chat
  chatOpen: boolean
  activeConversation: string | null
  
  // Estado da busca
  searchQuery: string
  searchFilters: Record<string, any>
  
  // Estado da timeline
  timelinePosts: any[]
  hasMorePosts: boolean
  isLoadingPosts: boolean
  
  // Estado das configurações
  settings: Record<string, any>
  userSettings: Record<string, any>
  
  // Ações do usuário
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (loading: boolean) => void
  
  // Ações da interface
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  setActiveView: (view: string) => void
  
  // Ações das notificações
  setNotifications: (notifications: any[]) => void
  addNotification: (notification: any) => void
  markNotificationAsRead: (id: string) => void
  setUnreadCount: (count: number) => void
  
  // Ações do chat
  setChatOpen: (open: boolean) => void
  setActiveConversation: (conversationId: string | null) => void
  
  // Ações da busca
  setSearchQuery: (query: string) => void
  setSearchFilters: (filters: Record<string, any>) => void
  clearSearch: () => void
  
  // Ações da timeline
  setTimelinePosts: (posts: any[]) => void
  addTimelinePosts: (posts: any[]) => void
  setHasMorePosts: (hasMore: boolean) => void
  setLoadingPosts: (loading: boolean) => void
  
  // Ações das configurações
  setSettings: (settings: Record<string, any>) => void
  updateSetting: (key: string, value: any) => void
  updateUserSettings: (settings: Record<string, any>) => void
  
  // Ações de autenticação
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  
  // Ações de dados
  refreshUserData: () => Promise<void>
  updateProfile: (profileData: any) => Promise<void>
}

// Store principal
export const useAppState = create<AppState>()(
  (set: any, get: any) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      theme: 'auto',
      sidebarOpen: false,
      mobileMenuOpen: false,
      activeView: 'home',
      
      notifications: [],
      unreadCount: 0,
      
      chatOpen: false,
      activeConversation: null,
      
      searchQuery: '',
      searchFilters: {},
      
      timelinePosts: [],
      hasMorePosts: true,
      isLoadingPosts: false,
      
      settings: {},
      userSettings: {},
      
      // Ações do usuário
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Ações da interface
      setTheme: (theme) => {
        set({ theme })
        // Aplicar tema ao documento
        if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      toggleSidebar: () => set((state: AppState) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleMobileMenu: () => set((state: AppState) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      setActiveView: (view: string) => set({ activeView: view }),
      
      // Ações das notificações
      setNotifications: (notifications: any[]) => set({ notifications }),
      addNotification: (notification: any) => set((state: AppState) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      })),
      markNotificationAsRead: (id: string) => set((state: AppState) => ({
        notifications: state.notifications.map((n: any) => 
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      })),
      setUnreadCount: (count: number) => set({ unreadCount: count }),
      
      // Ações do chat
      setChatOpen: (open: boolean) => set({ chatOpen: open }),
      setActiveConversation: (conversationId: string | null) => set({ activeConversation: conversationId }),
      
      // Ações da busca
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setSearchFilters: (filters: Record<string, any>) => set({ searchFilters: filters }),
      clearSearch: () => set({ searchQuery: '', searchFilters: {} }),
      
      // Ações da timeline
      setTimelinePosts: (posts: any[]) => set({ timelinePosts: posts }),
      addTimelinePosts: (posts: any[]) => set((state: AppState) => ({
        timelinePosts: [...state.timelinePosts, ...posts]
      })),
      setHasMorePosts: (hasMore: boolean) => set({ hasMorePosts: hasMore }),
      setLoadingPosts: (loading: boolean) => set({ isLoadingPosts: loading }),
      
      // Ações das configurações
      setSettings: (settings: Record<string, any>) => set({ settings }),
      updateSetting: (key: string, value: any) => set((state: AppState) => ({
        settings: { ...state.settings, [key]: value }
      })),
      updateUserSettings: (settings: Record<string, any>) => set((state: AppState) => ({
        userSettings: { ...state.userSettings, ...settings }
      })),
      
      // Ações de autenticação
      signIn: async (email, password) => {
        const supabase = createClient()
        set({ isLoading: true })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          
          if (error) throw error
          
          if (data.user) {
            // Buscar dados do perfil
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            const userData = {
              id: data.user.id,
              email: data.user.email!,
              full_name: profile?.full_name,
              username: profile?.username,
              avatar_url: profile?.avatar_url,
              premium: profile?.premium,
              verified: profile?.verified
            }
            
            set({ user: userData, isAuthenticated: true })
          }
        } catch (error) {
          console.error('Erro no login:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      signUp: async (email, password, userData) => {
        const supabase = createClient()
        set({ isLoading: true })
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: userData
            }
          })
          
          if (error) throw error
          
          if (data.user) {
            // Criar perfil do usuário
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email!,
                full_name: userData.full_name,
                username: userData.username,
                created_at: new Date().toISOString()
              })
            
            if (profileError) throw profileError
            
            const userProfile = {
              id: data.user.id,
              email: data.user.email!,
              full_name: userData.full_name,
              username: userData.username,
              avatar_url: undefined,
              premium: false,
              verified: false
            }
            
            set({ user: userProfile, isAuthenticated: true })
          }
        } catch (error) {
          console.error('Erro no cadastro:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      signOut: async () => {
        const supabase = createClient()
        
        try {
          await supabase.auth.signOut()
          set({
            user: null,
            isAuthenticated: false,
            notifications: [],
            unreadCount: 0,
            chatOpen: false,
            activeConversation: null,
            searchQuery: '',
            searchFilters: {},
            timelinePosts: [],
            hasMorePosts: true
          })
        } catch (error) {
          console.error('Erro no logout:', error)
          throw error
        }
      },
      
      // Ações de dados
      refreshUserData: async () => {
        const { user } = get()
        if (!user) return
        
        const supabase = createClient()
        
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (error) throw error
          
          const updatedUser = {
            ...user,
            full_name: data.full_name,
            username: data.username,
            avatar_url: data.avatar_url,
            premium: data.premium,
            verified: data.verified
          }
          
          set({ user: updatedUser })
        } catch (error) {
          console.error('Erro ao atualizar dados do usuário:', error)
        }
      },
      
      updateProfile: async (profileData) => {
        const { user } = get()
        if (!user) return
        
        const supabase = createClient()
        
        try {
          const { error } = await supabase
            .from('users')
            .update(profileData)
            .eq('id', user.id)
          
          if (error) throw error
          
          const updatedUser = { ...user, ...profileData }
          set({ user: updatedUser })
        } catch (error) {
          console.error('Erro ao atualizar perfil:', error)
          throw error
                 }
       }
     })
   )

// Hooks derivados para facilitar o uso
export const useUser = () => {
  const { user, isAuthenticated, isLoading } = useAppState()
  return { user, isAuthenticated, isLoading }
}

export const useTheme = () => {
  const { theme, setTheme } = useAppState()
  return { theme, setTheme }
}

export const useNotifications = () => {
  const { notifications, unreadCount, addNotification, markNotificationAsRead } = useAppState()
  return { notifications, unreadCount, addNotification, markNotificationAsRead }
}

export const useChat = () => {
  const { chatOpen, activeConversation, setChatOpen, setActiveConversation } = useAppState()
  return { chatOpen, activeConversation, setChatOpen, setActiveConversation }
}

export const useSearch = () => {
  const { searchQuery, searchFilters, setSearchQuery, setSearchFilters, clearSearch } = useAppState()
  return { searchQuery, searchFilters, setSearchQuery, setSearchFilters, clearSearch }
}

export const useTimeline = () => {
  const { 
    timelinePosts, 
    hasMorePosts, 
    isLoadingPosts, 
    setTimelinePosts, 
    addTimelinePosts, 
    setHasMorePosts, 
    setLoadingPosts 
  } = useAppState()
  
  return { 
    timelinePosts, 
    hasMorePosts, 
    isLoadingPosts, 
    setTimelinePosts, 
    addTimelinePosts, 
    setHasMorePosts, 
    setLoadingPosts 
  }
}

export const useSettings = () => {
  const { settings, setSettings, updateSetting } = useAppState()
  return { settings, setSettings, updateSetting }
}

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    signIn, 
    signUp, 
    signOut, 
    refreshUserData, 
    updateProfile 
  } = useAppState()
  
  return { 
    user, 
    isAuthenticated, 
    isLoading, 
    signIn, 
    signUp, 
    signOut, 
    refreshUserData, 
    updateProfile 
  }
} 
