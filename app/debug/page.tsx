"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugPage() {
  const { user, session, loading } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [testSessionData, setTestSessionData] = useState<any>(null)
  const [redirectData, setRedirectData] = useState<any>(null)
  const [myProfileData, setMyProfileData] = useState<any>(null)
  const [loadingSession, setLoadingSession] = useState(false)
  const [loadingTestSession, setLoadingTestSession] = useState(false)
  const [loadingRedirect, setLoadingRedirect] = useState(false)
  const [loadingMyProfile, setLoadingMyProfile] = useState(false)

  const fetchSessionData = async () => {
    setLoadingSession(true)
    try {
      const response = await fetch("/api/debug/session")
      const data = await response.json()
      setSessionData(data)
    } catch (error) {
      console.error("Erro ao buscar dados da sessão:", error)
    } finally {
      setLoadingSession(false)
    }
  }

  const fetchTestSessionData = async () => {
    setLoadingTestSession(true)
    try {
      const response = await fetch("/api/debug/test-session")
      const data = await response.json()
      setTestSessionData(data)
    } catch (error) {
      console.error("Erro ao buscar dados de teste da sessão:", error)
    } finally {
      setLoadingTestSession(false)
    }
  }

  const fetchRedirectData = async () => {
    setLoadingRedirect(true)
    try {
      const response = await fetch("/api/debug/test-redirects")
      const data = await response.json()
      setRedirectData(data)
    } catch (error) {
      console.error("Erro ao buscar dados de redirecionamento:", error)
    } finally {
      setLoadingRedirect(false)
    }
  }

  const fetchMyProfileData = async () => {
    setLoadingMyProfile(true)
    try {
      const response = await fetch("/api/debug/test-my-profile")
      const data = await response.json()
      setMyProfileData(data)
    } catch (error) {
      console.error("Erro ao buscar dados do meu perfil:", error)
    } finally {
      setLoadingMyProfile(false)
    }
  }

  useEffect(() => {
    fetchSessionData()
    fetchTestSessionData()
    fetchRedirectData()
    fetchMyProfileData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Debug - Estado da Sessão</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>AuthProvider State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Loading:</span>
                <Badge variant={loading ? "destructive" : "default"}>
                  {loading ? "Sim" : "Não"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Usuário:</span>
                <Badge variant={user ? "default" : "secondary"}>
                  {user ? "Logado" : "Não logado"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Sessão:</span>
                <Badge variant={session ? "default" : "secondary"}>
                  {session ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              
              {user && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Dados do Usuário:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify({
                      id: user.id,
                      email: user.email,
                      email_confirmed: user.email_confirmed_at,
                      created_at: user.created_at,
                      last_sign_in: user.last_sign_in_at,
                    }, null, 2)}
                  </pre>
                </div>
              )}
              
              {session && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Dados da Sessão:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify({
                      expires_at: session.expires_at,
                      expires_in: session.expires_in,
                      token_type: session.token_type,
                      access_token_length: session.access_token?.length || 0,
                      refresh_token_length: session.refresh_token?.length || 0,
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Session Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={fetchSessionData} disabled={loadingSession}>
                {loadingSession ? "Carregando..." : "Atualizar Dados"}
              </Button>
              
              {sessionData && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(sessionData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Session Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={fetchTestSessionData} disabled={loadingTestSession}>
                {loadingTestSession ? "Carregando..." : "Testar Sessão"}
              </Button>
              
              {testSessionData && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(testSessionData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Redirects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={fetchRedirectData} disabled={loadingRedirect}>
                {loadingRedirect ? "Carregando..." : "Atualizar Dados de Redirecionamento"}
              </Button>
              
              {redirectData && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(redirectData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={fetchMyProfileData} disabled={loadingMyProfile}>
                {loadingMyProfile ? "Carregando..." : "Atualizar Dados do Meu Perfil"}
              </Button>
              
              {myProfileData && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(myProfileData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = "/auth/signin"}
                variant="outline"
                className="w-full"
              >
                Ir para Login
              </Button>
              
              <Button 
                onClick={() => window.location.href = "/home"}
                variant="outline"
                className="w-full"
              >
                Ir para Home
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Recarregar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 