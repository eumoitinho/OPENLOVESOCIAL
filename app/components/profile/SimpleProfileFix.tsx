"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'

interface SimpleProfileFixProps {
  username: string
}

export default function SimpleProfileFix({ username }: SimpleProfileFixProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAndFixProfile()
  }, [username, user, profile])

  const checkAndFixProfile = async () => {
    console.log('[ProfileFix] Iniciando verificação...')
    console.log('[ProfileFix] Username buscado:', username)
    console.log('[ProfileFix] Usuário logado:', user?.email)
    console.log('[ProfileFix] Perfil:', profile)

    if (!user) {
      console.log('[ProfileFix] Usuário não logado, redirecionando para login')
      router.push('/auth/signin')
      return
    }

    try {
      // Buscar perfil atual
      const currentProfileResponse = await fetch('/api/profile')
      if (!currentProfileResponse.ok) {
        throw new Error('Erro ao buscar perfil atual')
      }
      
      const currentProfile = await currentProfileResponse.json()
      console.log('[ProfileFix] Perfil atual da API:', currentProfile)

      // Se o username buscado é o mesmo do usuário atual, redirecionar para /profile
      if (currentProfile.username === username) {
        console.log('[ProfileFix] É o próprio perfil, redirecionando para /profile')
        router.push('/profile')
        return
      }

      // Se não tem username, tentar criar um
      if (!currentProfile.username) {
        console.log('[ProfileFix] Usuário sem username, tentando criar...')
        await createUsername(currentProfile)
        return
      }

      // Tentar buscar o perfil por username
      const profileResponse = await fetch(`/api/profile/${username}`)
      if (!profileResponse.ok) {
        if (profileResponse.status === 404) {
          setError(`Usuário @${username} não foi encontrado`)
        } else {
          throw new Error(`Erro ao buscar perfil: ${profileResponse.status}`)
        }
      } else {
        // Perfil encontrado, recarregar a página
        window.location.reload()
      }

    } catch (error) {
      console.error('[ProfileFix] Erro:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsChecking(false)
    }
  }

  const createUsername = async (currentProfile: any) => {
    try {
      const newUsername = user?.email?.split('@')[0] || `user_${user?.id.slice(0, 8)}`
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUsername,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar username')
      }

      // Se o username criado é o mesmo que está sendo buscado, redirecionar
      if (newUsername === username) {
        router.push('/profile')
      } else {
        // Recarregar para atualizar o perfil
        window.location.reload()
      }

    } catch (error) {
      console.error('[ProfileFix] Erro ao criar username:', error)
      setError('Erro ao criar username')
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil não encontrado</h2>
        <p className="text-gray-600 mb-6">
          {error || `O usuário @${username} não foi encontrado ou não existe.`}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/profile')}
            className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Ir para Meu Perfil
          </button>
          
          <button
            onClick={() => router.push('/home')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Voltar para Home
          </button>
          
          <button
            onClick={checkAndFixProfile}
            className="w-full text-pink-500 py-2 px-4 rounded-lg hover:bg-pink-50 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  )
} 