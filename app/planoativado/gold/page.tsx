"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Crown } from "lucide-react"

export default function PlanoGoldAtivado() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Plano Open Ouro Ativado!
          </h1>
          <p className="text-gray-600 mb-6">
            Parabéns! Seu plano Open Ouro foi ativado com sucesso.
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-yellow-800 mb-2">Seus novos benefícios:</h2>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Participar de até 3 comunidades</li>
            <li>• Participar de eventos ilimitados</li>
            <li>• Criar até 2 eventos por mês</li>
            <li>• Mensagens privadas com envio de fotos</li>
            <li>• Upload ilimitado de fotos</li>
            <li>• Upload de até 10 vídeos</li>
            <li>• Perfil com destaque visual</li>
            <li>• Estatísticas básicas</li>
            <li>• Suporte prioritário</li>
          </ul>
        </div>

        <div className="text-sm text-gray-500">
          Redirecionando para o dashboard em {countdown} segundos...
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
        >
          Ir para o Dashboard
        </button>
      </div>
    </div>
  )
} 