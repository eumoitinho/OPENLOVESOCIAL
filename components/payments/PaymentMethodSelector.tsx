'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CreditCard, Smartphone, Zap, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import PixPayment from './PixPayment'

interface PaymentMethodSelectorProps {
  planType: 'gold' | 'diamante' | 'diamante_anual'
  onSuccess?: () => void
  onError?: (error: string) => void
}

type PaymentMethod = 'stripe' | 'pix'

export default function PaymentMethodSelector({ 
  planType, 
  onSuccess, 
  onError 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix')
  const [showPayment, setShowPayment] = useState(false)

  const planConfig = {
    gold: { name: 'Open Ouro', price: 'R$ 25,00', monthly: true },
    diamante: { name: 'Open Diamante', price: 'R$ 45,90', monthly: true },
    diamante_anual: { name: 'Open Diamante Anual', price: 'R$ 459,00', monthly: false }
  }

  const currentPlan = planConfig[planType]

  const paymentMethods = [
    {
      id: 'pix' as PaymentMethod,
      name: 'PIX',
      description: 'Pagamento instantâneo',
      icon: Smartphone,
      features: ['Aprovação imediata', 'Sem taxas extras', 'Disponível 24h'],
      badge: 'Recomendado',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'stripe' as PaymentMethod,
      name: 'Cartão de Crédito',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      features: ['Parcelamento disponível', 'Pagamento seguro', 'Renovação automática'],
      badge: 'Tradicional',
      badgeColor: 'bg-blue-500'
    }
  ]

  const handleProceed = () => {
    setShowPayment(true)
  }

  const handleBack = () => {
    setShowPayment(false)
  }

  const handlePaymentSuccess = () => {
    onSuccess?.()
  }

  if (showPayment) {
    if (selectedMethod === 'pix') {
      return (
        <div className="space-y-4">
          <Button variant="outline" onClick={handleBack} className="mb-4">
            ← Voltar
          </Button>
          <PixPayment 
            planType={planType} 
            onSuccess={handlePaymentSuccess}
            onError={onError}
          />
        </div>
      )
    }
    
    // Para Stripe, você pode implementar o componente existente
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          ← Voltar
        </Button>
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Pagamento com Cartão</h3>
              <p className="text-gray-600">Integração com Stripe será implementada aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Escolha o Método de Pagamento</CardTitle>
          <CardDescription>
            Plano selecionado: {currentPlan.name} - {currentPlan.price}
            {currentPlan.monthly && '/mês'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod as any}>
            <div className="grid gap-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="relative">
                  <Label
                    htmlFor={method.id}
                    className={cn(
                      "flex cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-gray-50",
                      selectedMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    )}
                  >
                    <RadioGroupItem
                      value={method.id}
                      id={method.id}
                      className="sr-only"
                    />
                    
                    <div className="flex flex-1 items-start gap-4">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg",
                        selectedMethod === method.id
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600"
                      )}>
                        <method.icon className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{method.name}</h3>
                          <Badge className={cn("text-xs", method.badgeColor)}>
                            {method.badge}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {method.description}
                        </p>
                        
                        <div className="space-y-1">
                          {method.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {selectedMethod === method.id && (
                      <div className="absolute -top-2 -right-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          
          <div className="mt-6 space-y-4">
            <Button onClick={handleProceed} className="w-full">
              Continuar com {paymentMethods.find(m => m.id === selectedMethod)?.name}
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Zap className="h-4 w-4" />
              Pagamentos processados de forma segura
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}