"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, User, RefreshCw } from 'lucide-react'

interface ProfileFixProps {
  username?: string
}

export default function ProfileFix({ username }: ProfileFixProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [isFixing, setIsFixing] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (username) {
      checkProfile()
    }
  }, [username])

  const checkProfile = async () => {
    if (!username) return

    setIsFixing(true)
    setError(null)
    setStep(1)

    try {
      // Passo 1: Verificar se o usuário está logado
      setStep(1)
      if (!user) {
        setError('Usuário não está logado')
        setIsFixing(false)
        return
      }

      // Passo 2: Buscar perfil atual
      setStep(2)
      const currentProfileResponse = await fetch('/api/profile')
      if (!currentProfileResponse.ok) {
        throw new Error('Erro ao buscar perfil atual')
      }
      const currentProfile = await currentProfileResponse.json()
      console.log('Perfil atual:', currentProfile)

      // Passo 3: Verificar se o username buscado é do usuário atual
      setStep(3)
      if (currentProfile.username === username) {
        // É o próprio perfil, redirecionar para /profile
        router.push('/profile')
        return
      }

      // Passo 4: Buscar perfil por username
      setStep(4)
      const profileResponse = await fetch(`/api/profile/${username}`)
      if (!profileResponse.ok) {
        if (profileResponse.status === 404) {
          setError(`Usuário @${username} não foi encontrado`)
        } else {
          throw new Error(`Erro ao buscar perfil: ${profileResponse.status}`)
        }
      } else {
        const profileData = await profileResponse.json()
        setProfileData(profileData)
      }

    } catch (error) {
      console.error('Erro ao verificar perfil:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsFixing(false)
    }
  }

  const fixProfile = async () => {
    if (!user) return

    setIsFixing(true)
    setError(null)

    try {
      // Tentar atualizar o perfil com um username válido
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil')
      }

      // Recarregar a página
      window.location.reload()
    } catch (error) {
      console.error('Erro ao corrigir perfil:', error)
      setError(error instanceof Error ? error.message : 'Erro ao corrigir perfil')
    } finally {
      setIsFixing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (profileData) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Perfil Encontrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{profileData.profile.full_name}</h3>
                <p className="text-gray-600">@{profileData.profile.username}</p>
              </div>
              <Button onClick={() => router.push(`/profile/${username}`)}>
                Ver Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Problema com Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isFixing && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                Passo {step}: {
                  step === 1 ? 'Verificando login...' :
                  step === 2 ? 'Buscando perfil atual...' :
                  step === 3 ? 'Verificando username...' :
                  step === 4 ? 'Buscando perfil...' :
                  'Processando...'
                }
              </span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Informações de Debug:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>Usuário logado:</span>
                  {user ? (
                    <span className="text-green-600">✓ {user.email}</span>
                  ) : (
                    <span className="text-red-600">✗ Não logado</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>Perfil carregado:</span>
                  {profile ? (
                    <span className="text-green-600">✓ @{profile.username}</span>
                  ) : (
                    <span className="text-red-600">✗ Não carregado</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>Username buscado:</span>
                  <span className="font-mono">@{username}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button onClick={checkProfile} disabled={isFixing} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar Perfil Novamente
              </Button>
              
              {user && !profile?.username && (
                <Button onClick={fixProfile} disabled={isFixing} variant="outline" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  Corrigir Meu Perfil
                </Button>
              )}
              
              <Button onClick={() => router.push('/profile')} variant="outline" className="w-full">
                Ir para Meu Perfil
              </Button>
              
              <Button onClick={() => router.push('/home')} variant="outline" className="w-full">
                Voltar para Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 