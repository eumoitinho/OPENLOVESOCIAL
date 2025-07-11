"use client"

import { useEffect, useState } from "react"
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react"
import { PlanoType, PLANOS_PRECOS } from "@/types/mercadopago"

interface CheckoutFormProps {
  user: any
  plano: PlanoType
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export default function CheckoutForm({ user, plano, onSuccess, onError }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY)
    }
  }, [])

  const initialization = {
    amount: PLANOS_PRECOS[plano],
  }

  const customization = {
    paymentMethods: {
      types: {
        included: ["credit_card" as const, "debit_card" as const]
      }
    },
  }

  const onSubmit = async (formData: any) => {
    setLoading(true)
    try {
      const response = await fetch("/api/mercadopago/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: formData.token,
          email: user.email,
          plano,
          cardholderName: formData.cardholderName,
          identificationType: formData.identificationType,
          identificationNumber: formData.identificationNumber,
        }),
      })

      const result = await response.json()

      if (result.redirectUrl) {
        onSuccess?.(result)
        window.location.href = result.redirectUrl
      } else {
        onError?.(result.error || "Erro ao processar pagamento")
      }
    } catch (error) {
      onError?.("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleFormError = (error: any) => {
    console.error("Erro no formulário:", error)
    onError?.("Erro no formulário de pagamento")
  }

  const onReady = () => {
    console.log("Formulário pronto")
  }

  const formatPlanoValue = (plano: PlanoType) => {
    switch (plano) {
      case "gold":
        return "R$ 25,00/mês"
      case "diamante":
        return "R$ 45,90/mês"
      case "diamante_anual":
        return "R$ 459,00/ano (2 meses grátis)"
      default:
        return ""
    }
  }

  const formatPlanoName = (plano: PlanoType) => {
    switch (plano) {
      case "gold":
        return "Open Ouro"
      case "diamante":
        return "Open Diamante"
      case "diamante_anual":
        return "Open Diamante Anual"
      default:
        return ""
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Assinar {formatPlanoName(plano)}
        </h2>
        <p className="text-gray-600">
          Valor: {formatPlanoValue(plano)}
        </p>
      </div>

      <CardPayment
        initialization={initialization}
        customization={customization}
        onSubmit={onSubmit}
        onReady={onReady}
        onError={handleFormError}
      />

      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Processando pagamento...</p>
        </div>
      )}
    </div>
  )
} 