'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Image, Video, MessageCircle, Calendar } from "lucide-react"
import UsageIndicator from "./UsageIndicator"
import PremiumLockBadge from "./PremiumLockBadge"
import { useIncrementCounter } from "@/lib/plans/hooks"

export default function UsageExample() {
  const { incrementCounter } = useIncrementCounter()
  const [loading, setLoading] = useState(false)

  const handleAction = async (actionType: string) => {
    setLoading(true)
    try {
      await incrementCounter(actionType)
      console.log(`Ação ${actionType} registrada com sucesso`)
    } catch (error) {
      console.error('Erro ao registrar ação:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-center mb-8">
        Exemplo de Sistema Freemium
      </h2>

      {/* Indicador de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Indicador de Uso do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <UsageIndicator showDetails={true} />
        </CardContent>
      </Card>

      {/* Funcionalidades com Bloqueio Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload de Imagem */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Upload de Imagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PremiumLockBadge feature="upload_image" requiredPlan="gold">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Clique para fazer upload de imagem</p>
                <Button 
                  className="mt-4"
                  onClick={() => handleAction('upload_image')}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Fazer Upload'}
                </Button>
              </div>
            </PremiumLockBadge>
          </CardContent>
        </Card>

        {/* Upload de Vídeo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Upload de Vídeo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PremiumLockBadge feature="upload_video" requiredPlan="gold">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Clique para fazer upload de vídeo</p>
                <Button 
                  className="mt-4"
                  onClick={() => handleAction('upload_video')}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Fazer Upload'}
                </Button>
              </div>
            </PremiumLockBadge>
          </CardContent>
        </Card>

        {/* Mensagens Privadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Mensagens Privadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PremiumLockBadge feature="send_message" requiredPlan="gold">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Envie mensagens privadas</p>
                <Button 
                  className="mt-4"
                  onClick={() => handleAction('send_message')}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Enviar Mensagem'}
                </Button>
              </div>
            </PremiumLockBadge>
          </CardContent>
        </Card>

        {/* Criação de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Criar Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PremiumLockBadge feature="create_event" requiredPlan="gold">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Crie eventos para sua comunidade</p>
                <Button 
                  className="mt-4"
                  onClick={() => handleAction('create_event')}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Criar Evento'}
                </Button>
              </div>
            </PremiumLockBadge>
          </CardContent>
        </Card>
      </div>

      {/* Informações sobre o Sistema */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle>Como Funciona o Sistema Freemium</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold mb-2">Contadores Reais</h3>
              <p className="text-sm text-gray-600">
                Cada ação é contabilizada em tempo real no banco de dados
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-semibold mb-2">Limites Dinâmicos</h3>
              <p className="text-sm text-gray-600">
                Limites configuráveis por plano e funcionalidade
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">UX Inteligente</h3>
              <p className="text-sm text-gray-600">
                Indicadores visuais e sugestões de upgrade automáticas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 