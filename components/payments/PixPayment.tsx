'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { QrCode, Copy, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface PixPaymentProps {
  planType: 'gold' | 'diamante' | 'diamante_anual'
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface PixPaymentData {
  clientSecret: string
  pixCode: string
  pixQrCode: string
  abacatePayId: string
  stripePaymentIntentId: string
  expiresAt: string
  amount: number
  currency: string
  planName: string
}

export default function PixPayment({ planType, onSuccess, onError }: PixPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<PixPaymentData | null>(null)
  const [status, setStatus] = useState<'idle' | 'pending' | 'paid' | 'expired' | 'error'>('idle')
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [checkingStatus, setCheckingStatus] = useState(false)

  const planConfig = {
    gold: { name: 'Open Ouro', price: 'R$ 25,00' },
    diamante: { name: 'Open Diamante', price: 'R$ 45,90' },
    diamante_anual: { name: 'Open Diamante Anual', price: 'R$ 459,00' }
  }

  const currentPlan = planConfig[planType]

  // Countdown timer
  useEffect(() => {
    if (!pixData?.expiresAt) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expiresAt = new Date(pixData.expiresAt).getTime()
      const remaining = Math.max(0, expiresAt - now)
      
      setTimeRemaining(remaining)
      
      if (remaining === 0) {
        setStatus('expired')
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [pixData?.expiresAt])

  // Auto-check status
  useEffect(() => {
    if (status !== 'pending' || !pixData) return

    const checkInterval = setInterval(() => {
      checkPaymentStatus()
    }, 5000) // Check every 5 seconds

    return () => clearInterval(checkInterval)
  }, [status, pixData])

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const createPixPayment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments/pix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          paymentMethodId: 'pm_pix_custom'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar pagamento PIX')
      }

      setPixData(result.data)
      setStatus('pending')
      toast({
        title: 'PIX Gerado!',
        description: 'Escaneie o QR Code ou copie o código PIX'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setStatus('error')
      onError?.(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!pixData || checkingStatus) return

    setCheckingStatus(true)
    try {
      const response = await fetch('/api/payments/pix/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abacatePayId: pixData.abacatePayId,
          stripePaymentIntentId: pixData.stripePaymentIntentId
        })
      })

      const result = await response.json()

      if (response.ok) {
        const newStatus = result.data.pixStatus
        setStatus(newStatus)
        
        if (newStatus === 'paid') {
          toast({
            title: 'Pagamento Aprovado!',
            description: 'Seu plano foi ativado com sucesso'
          })
          onSuccess?.()
        } else if (newStatus === 'expired') {
          toast({
            title: 'PIX Expirado',
            description: 'Gere um novo PIX para continuar',
            variant: 'destructive'
          })
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const copyPixCode = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode)
      toast({
        title: 'Código Copiado!',
        description: 'Cole no seu app de pagamentos'
      })
    }
  }

  const simulatePayment = async () => {
    if (!pixData || process.env.NODE_ENV === 'production') return

    try {
      const response = await fetch('/api/payments/pix/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abacatePayId: pixData.abacatePayId
        })
      })

      if (response.ok) {
        setStatus('paid')
        toast({
          title: 'Pagamento Simulado!',
          description: 'Seu plano foi ativado (desenvolvimento)'
        })
        onSuccess?.()
      }
    } catch (error) {
      console.error('Erro ao simular pagamento:', error)
    }
  }

  if (status === 'idle') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <QrCode className="w-5 h-5" />
            Pagamento PIX
          </CardTitle>
          <CardDescription>
            Pague com PIX de forma rápida e segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold">{currentPlan.name}</div>
            <div className="text-3xl font-bold text-primary">{currentPlan.price}</div>
          </div>
          
          <Button onClick={createPixPayment} disabled={loading} className="w-full">
            {loading ? 'Gerando PIX...' : 'Gerar PIX'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao processar pagamento. Tente novamente.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setStatus('idle')} className="w-full mt-4">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === 'paid') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-bold">Pagamento Aprovado!</h3>
              <p className="text-gray-600">Seu plano {currentPlan.name} foi ativado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <QrCode className="w-5 h-5" />
          PIX Gerado
        </CardTitle>
        <CardDescription>
          Escaneie o QR Code ou copie o código PIX
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'expired' ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              PIX expirado. Gere um novo para continuar.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tempo restante:</span>
              <Badge variant={timeRemaining < 300000 ? 'destructive' : 'default'}>
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant={status === 'paid' ? 'default' : 'secondary'}>
                {status === 'pending' ? 'Aguardando' : 'Processando'}
              </Badge>
            </div>
          </>
        )}

        <Separator />

        {pixData && status !== 'expired' && (
          <>
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <img 
                  src={`data:image/png;base64,${pixData.pixQrCode}`} 
                  alt="QR Code PIX" 
                  className="mx-auto max-w-full h-auto"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Código PIX:</p>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-xs break-all">
                    {pixData.pixCode}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyPixCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          {status === 'expired' ? (
            <Button onClick={() => setStatus('idle')} className="w-full">
              Gerar Novo PIX
            </Button>
          ) : (
            <Button 
              onClick={checkPaymentStatus} 
              disabled={checkingStatus}
              variant="outline" 
              className="w-full"
            >
              {checkingStatus ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verificar Status
                </>
              )}
            </Button>
          )}
          
          {process.env.NODE_ENV === 'development' && status === 'pending' && (
            <Button onClick={simulatePayment} variant="secondary" className="w-full">
              Simular Pagamento (Dev)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
