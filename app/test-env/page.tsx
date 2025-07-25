"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function TestEnvPage() {
  const [serverData, setServerData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const clientEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV
  }

  const testServerEnv = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-env')
      const data = await response.json()
      
      setServerData(data)
      
      if (data.success) {
        toast.success("Variáveis do servidor OK!")
      } else {
        toast.error(`Variáveis faltando: ${data.missingVars?.join(', ')}`)
      }
      
    } catch (error) {
      console.error("Erro ao testar server env:", error)
      toast.error("Erro ao testar variáveis do servidor")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testServerEnv()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Teste de Variáveis de Ambiente</h1>
        
        {/* Client-side vars */}
        <Card>
          <CardHeader>
            <CardTitle>Variáveis do Cliente (Frontend)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {Object.entries(clientEnvVars).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-mono">{key}:</span>
                  <span className={value ? "text-green-600" : "text-red-600"}>
                    {value || "NÃO CONFIGURADA"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Server-side vars */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Variáveis do Servidor (Backend)
              <Button onClick={testServerEnv} disabled={loading} size="sm">
                {loading ? "Testando..." : "Recarregar"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serverData ? (
              <div className="space-y-4">
                <div className={`p-2 rounded ${serverData.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {serverData.message}
                </div>
                
                <div className="space-y-2 text-sm">
                  {Object.entries(serverData.envVars || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-mono">{key}:</span>
                      <span className={value ? "text-green-600" : "text-red-600"}>
                        {value || "NÃO CONFIGURADA"}
                      </span>
                    </div>
                  ))}
                </div>
                
                {serverData.missingVars && serverData.missingVars.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
                    <strong>Variáveis faltando:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {serverData.missingVars.map((varName: string) => (
                        <li key={varName} className="font-mono text-sm">{varName}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div>Carregando...</div>
            )}
          </CardContent>
        </Card>

        {/* Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnósticos e Soluções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Se variáveis estão faltando:</h4>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Verifique se o arquivo <code>.env.local</code> existe na raiz do projeto</li>
                <li>Reinicie o servidor de desenvolvimento (<code>pnpm dev</code>)</li>
                <li>Verifique se não há espaços extras nas variáveis</li>
                <li>Confirme que as variáveis começam com <code>NEXT_PUBLIC_</code> para cliente</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Variáveis essenciais para o projeto:</h4>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li><code>NEXT_PUBLIC_SUPABASE_URL</code> - URL do projeto Supabase</li>
                <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Chave pública anônima</li>
                <li><code>SUPABASE_SERVICE_ROLE_KEY</code> - Chave de serviço (backend only)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}