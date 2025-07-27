"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Shield, Zap, Star } from "lucide-react"

const TestCheckout: React.FC = () => {
  const handleTestPayment = async () => {
    try {
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: "price_test_123",
          userId: "test_user_id" }) })

      if (!response.ok) {
        throw new Error("Erro ao processar pagamento")
      }

      const data = await response.json()
      console.log("Pagamento processado:", data)
      alert("Pagamento de teste processado com sucesso!")
    } catch (error) {
      console.error("Erro no pagamento:", error)
      alert("Erro ao processar pagamento de teste")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Teste de Checkout</h1>
          <p className="text-xl text-gray-600">
            Página de teste para verificar a integração com pagamentos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Plano Básico */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Plano Básico
                <Badge variant="secondary">Gratuito</Badge>
              </CardTitle>
              <CardDescription>
                Perfeito para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">R$ 0</div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-green-500 mr-2" />
                  Acesso básico
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  Perfil básico
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-green-500 mr-2" />
                  Comunidades limitadas
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Plano Atual
              </Button>
            </CardContent>
          </Card>

          {/* Plano Premium */}
          <Card className="relative border-2 border-blue-500">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white">Mais Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Plano Premium
                <Badge variant="default">Premium</Badge>
              </CardTitle>
              <CardDescription>
                Para usuários ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">R$ 29,90<span className="text-lg text-gray-500">/mês</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-green-500 mr-2" />
                  Tudo do plano básico
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  Perfil destacado
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-green-500 mr-2" />
                  Comunidades ilimitadas
                </li>
                <li className="flex items-center">
                  <CreditCard className="h-4 w-4 text-green-500 mr-2" />
                  Pagamentos seguros
                </li>
              </ul>
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={handleTestPayment}
              >
                Testar Pagamento
              </Button>
            </CardContent>
          </Card>

          {/* Plano Pro */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Plano Pro
                <Badge variant="destructive">Pro</Badge>
              </CardTitle>
              <CardDescription>
                Para profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">R$ 59,90<span className="text-lg text-gray-500">/mês</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-green-500 mr-2" />
                  Tudo do plano premium
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  Analytics avançados
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-green-500 mr-2" />
                  Suporte prioritário
                </li>
                <li className="flex items-center">
                  <CreditCard className="h-4 w-4 text-green-500 mr-2" />
                  API personalizada
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleTestPayment}
              >
                Testar Pagamento
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Informações de Teste
            </h3>
            <p className="text-blue-700 mb-4">
              Esta página é apenas para testes. Os pagamentos não serão processados realmente.
            </p>
            <div className="text-sm text-blue-600">
              <p>• Use cartões de teste do Stripe</p>
              <p>• Não há cobrança real</p>
              <p>• Dados são simulados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestCheckout 
