'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Shield, CheckCircle, Clock, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerificationRequestModalProps {
  type: 'community' | 'event'
  entityId: string
  entityName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function VerificationRequestModal({ 
  type, 
  entityId, 
  entityName, 
  isOpen, 
  onClose, 
  onSuccess 
}: VerificationRequestModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          entity_id: entityId,
          reason
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        onSuccess?.()
        setTimeout(() => {
          setSuccess(false)
          setReason('')
          onClose()
        }, 2000)
      } else {
        throw new Error(data.error || 'Erro ao enviar solicitação')
      }
    } catch (error) {
      console.error('Erro ao solicitar verificação:', error)
      alert('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <DialogTitle className="text-xl font-bold text-green-700 mb-2">
              Solicitação Enviada!
            </DialogTitle>
            <DialogDescription className="text-green-600">
              Sua solicitação de verificação foi enviada com sucesso e está sendo analisada pela nossa equipe.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Solicitar Verificação
          </DialogTitle>
          <DialogDescription>
            Solicite verificação para {type === 'community' ? 'sua comunidade' : 'seu evento'} "{entityName}"
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sobre a Verificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">Critérios para Verificação:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Conteúdo original e autêntico</li>
                <li>• Descrição completa e informativa</li>
                <li>• Imagens apropriadas e de qualidade</li>
                <li>• Atividade regular e engajamento</li>
                <li>• Cumprimento das diretrizes da comunidade</li>
              </ul>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
              <span className="text-xs text-gray-600">
                Aumenta a confiança e visibilidade
              </span>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason" className="text-sm font-medium">
              Por que você merece verificação?
            </Label>
            <Textarea
              id="reason"
              placeholder="Descreva brevemente por que esta comunidade/evento merece ser verificado..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Seja específico sobre o valor único que você oferece à comunidade.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Solicitar Verificação
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}