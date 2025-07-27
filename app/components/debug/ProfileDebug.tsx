"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, XCircle, User, Database, Link as LinkIcon } from 'lucide-react'

interface DebugInfo {
  authUser: any
  profile: any
  profileApiResponse: any
  usernameApiResponse: any
  error: string | null
}

export default function ProfileDebug() {
  const { user, profile, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    authUser: null,
    profile: null,
    profileApiResponse: null,
    usernameApiResponse: null,
    error: null
  })
  const [isDebugging, setIsDebugging] = useState(false)

  useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      authUser: user,
      profile: profile
    }))
  }, [user, profile])

  const runDebugTests = async () => {
    setIsDebugging(true)
    const newDebugInfo: DebugInfo = {
      authUser: user,
      profile: profile,
      profileApiResponse: null,
      usernameApiResponse: null,
      error: null
    }

    try {
      // Teste 1: API de perfil atual
      console.log('[DEBUG] Testando API de perfil atual...')
      const profileResponse = await fetch('/api/profile')
      if (profileResponse.ok) {
        newDebugInfo.profileApiResponse = await profileResponse.json()
        console.log('[DEBUG] Perfil atual encontrado:', newDebugInfo.profileApiResponse)
      } else {
        const errorText = await profileResponse.text()
        console.log('[DEBUG] Erro na API de perfil:', errorText)
        newDebugInfo.error = `Erro na API de perfil: ${profileResponse.status} - ${errorText}`
      }

      // Teste 2: API de perfil por username (se username existir)
      if (newDebugInfo.profileApiResponse?.username) {
        console.log('[DEBUG] Testando API de perfil por username:', newDebugInfo.profileApiResponse.username)
        const usernameResponse = await fetch(`/api/profile/${newDebugInfo.profileApiResponse.username}`)
        if (usernameResponse.ok) {
          newDebugInfo.usernameApiResponse = await usernameResponse.json()
          console.log('[DEBUG] Perfil por username encontrado:', newDebugInfo.usernameApiResponse)
        } else {
          const errorText = await usernameResponse.text()
          console.log('[DEBUG] Erro na API de perfil por username:', errorText)
          newDebugInfo.error = `Erro na API de perfil por username: ${usernameResponse.status} - ${errorText}`
        }
      }

    } catch (error) {
      console.error('[DEBUG] Erro durante testes:', error)
      newDebugInfo.error = `Erro durante testes: ${error}`
    }

    setDebugInfo(newDebugInfo)
    setIsDebugging(false)
  }

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <AlertCircle className="w-4 h-4 text-gray-500" />
    return status ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
  }

  const formatJson = (obj: any) => {
    if (!obj) return 'null'
    return JSON.stringify(obj, null, 2)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Debug: Problema de Perfil Não Encontrado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDebugTests} 
            disabled={isDebugging}
            className="w-full"
          >
            {isDebugging ? 'Executando testes...' : 'Executar Testes de Debug'}
          </Button>

          {debugInfo.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-4 h-4" />
                <span className="font-medium">Erro encontrado:</span>
              </div>
              <p className="text-red-600 mt-2">{debugInfo.error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status do Auth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <StatusIcon status={!!debugInfo.authUser} />
                  Auth Provider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Usuário:</span>
                    <Badge variant={debugInfo.authUser ? 'default' : 'destructive'}>
                      {debugInfo.authUser ? 'Logado' : 'Não logado'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Perfil:</span>
                    <Badge variant={debugInfo.profile ? 'default' : 'destructive'}>
                      {debugInfo.profile ? 'Carregado' : 'Não carregado'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Loading:</span>
                    <Badge variant={loading ? 'secondary' : 'default'}>
                      {loading ? 'Carregando' : 'Concluído'}
                    </Badge>
                  </div>
                  {debugInfo.profile?.username && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Username:</span>
                      <Badge variant="outline">
                        {debugInfo.profile.username}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status da API */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <StatusIcon status={!!debugInfo.profileApiResponse} />
                  API de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">API /profile:</span>
                    <Badge variant={debugInfo.profileApiResponse ? 'default' : 'destructive'}>
                      {debugInfo.profileApiResponse ? 'OK' : 'Erro'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">API /profile/[username]:</span>
                    <Badge variant={debugInfo.usernameApiResponse ? 'default' : 'destructive'}>
                      {debugInfo.usernameApiResponse ? 'OK' : 'Erro'}
                    </Badge>
                  </div>
                  {debugInfo.profileApiResponse?.username && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Username da API:</span>
                      <Badge variant="outline">
                        {debugInfo.profileApiResponse.username}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes do Auth User */}
          {debugInfo.authUser && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dados do Auth User</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {formatJson({
                    id: debugInfo.authUser.id,
                    email: debugInfo.authUser.email,
                    user_metadata: debugInfo.authUser.user_metadata,
                    created_at: debugInfo.authUser.created_at
                  })}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Detalhes do Profile */}
          {debugInfo.profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dados do Profile (Auth Provider)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {formatJson(debugInfo.profile)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Detalhes da API de Perfil */}
          {debugInfo.profileApiResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resposta da API /profile</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {formatJson(debugInfo.profileApiResponse)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Detalhes da API de Username */}
          {debugInfo.usernameApiResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resposta da API /profile/[username]</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {formatJson(debugInfo.usernameApiResponse)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Links úteis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Links para Teste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <a 
                  href="/api/profile" 
                  target="_blank" 
                  className="block text-blue-600 hover:underline text-sm"
                >
                  /api/profile - Dados do seu perfil
                </a>
                {debugInfo.profileApiResponse?.username && (
                  <a 
                    href={`/api/profile/${debugInfo.profileApiResponse.username}`} 
                    target="_blank" 
                    className="block text-blue-600 hover:underline text-sm"
                  >
                    /api/profile/{debugInfo.profileApiResponse.username} - Perfil por username
                  </a>
                )}
                {debugInfo.profileApiResponse?.username && (
                  <a 
                    href={`/profile/${debugInfo.profileApiResponse.username}`} 
                    target="_blank" 
                    className="block text-blue-600 hover:underline text-sm"
                  >
                    /profile/{debugInfo.profileApiResponse.username} - Página de perfil
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Possíveis soluções */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-yellow-700">Possíveis Soluções</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Verificar se o usuário tem um username válido na tabela users</li>
                <li>• Verificar se a API está buscando na tabela correta (users vs profiles)</li>
                <li>• Verificar se o username não está null ou vazio</li>
                <li>• Verificar se há erro de case-sensitivity no username</li>
                <li>• Verificar se o usuário está logado corretamente</li>
                <li>• Verificar se as variáveis de ambiente estão configuradas</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
} 