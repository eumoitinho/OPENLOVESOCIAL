"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Crown } from "lucide-react"

export default function PlanoDiamanteAtivado() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Plano Open Diamante Ativado!
          </h1>
          <p className="text-gray-600 mb-6">
            Parabéns! Seu plano Open Diamante foi ativado com sucesso.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-800 mb-2">Seus novos benefícios:</h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Participar de até 5 comunidades</li>
            <li>• Criar até 10 eventos por mês</li>
            <li>• Eventos ilimitados</li>
            <li>• Mensagens privadas com fotos, vídeos e áudios</li>
            <li>• Chamadas de voz e vídeo</li>
            <li>• Upload ilimitado de fotos e vídeos</li>
            <li>• Perfil super destacado + badge verificado</li>
            <li>• Estatísticas e analytics avançados</li>
            <li>• Criar comunidades privadas</li>
            <li>• Moderação avançada</li>
            <li>• Suporte dedicado</li>
          </ul>
        </div>

        <div className="text-sm text-gray-500">
          Redirecionando para o dashboard em {countdown} segundos...
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Ir para o Dashboard
        </button>
      </div>
    </div>
  )
} 