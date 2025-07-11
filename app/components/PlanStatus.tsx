"use client"

import { useAuth } from "@/app/components/auth/AuthProvider"
import UpgradePlanButton from "./UpgradePlanButton"
import { Crown, CheckCircle, AlertCircle } from "lucide-react"

export default function PlanStatus() {
  const { user } = useAuth()

  if (!user) return null

  const currentPlan = (user as any).plano || "free"

  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case "gold":
        return {
          name: "Open Ouro",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          icon: <Crown className="w-5 h-5 text-yellow-600" />,
          features: [
            "Participar de até 3 comunidades",
            "Eventos ilimitados",
            "Criar até 2 eventos/mês",
            "Mensagens com fotos",
            "Upload ilimitado de fotos",
            "Upload de até 10 vídeos",
          ],
        }
      case "diamante":
        return {
          name: "Open Diamante",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          icon: <Crown className="w-5 h-5 text-blue-600" />,
          features: [
            "Participar de até 5 comunidades",
            "Criar até 10 eventos/mês",
            "Chamadas de voz e vídeo",
            "Upload ilimitado",
            "Badge verificado",
            "Moderação avançada",
          ],
        }
      default:
        return {
          name: "Gratuito",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          icon: <AlertCircle className="w-5 h-5 text-gray-600" />,
          features: [
            "Participar de comunidades verificadas",
            "Upload ilimitado de fotos",
            "Upload de 1 vídeo",
            "Perfil básico",
          ],
        }
    }
  }

  const planInfo = getPlanInfo(currentPlan)

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {planInfo.icon}
          <div>
            <h3 className="font-semibold text-gray-900">Seu Plano Atual</h3>
            <p className={`text-sm font-medium ${planInfo.color}`}>
              {planInfo.name}
            </p>
          </div>
        </div>
        {currentPlan !== "diamante" && (
          <div className="flex space-x-2">
            {currentPlan === "free" && (
              <>
                <UpgradePlanButton currentPlan={currentPlan} targetPlan="gold" />
                <UpgradePlanButton currentPlan={currentPlan} targetPlan="diamante" />
              </>
            )}
            {currentPlan === "gold" && (
              <UpgradePlanButton currentPlan={currentPlan} targetPlan="diamante" />
            )}
          </div>
        )}
      </div>

      <div className={`${planInfo.bgColor} rounded-lg p-4`}>
        <h4 className="font-medium text-gray-900 mb-3">Benefícios Ativos:</h4>
        <ul className="space-y-2">
          {planInfo.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {currentPlan === "free" && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Dica:</strong> Faça upgrade para desbloquear mais recursos e funcionalidades!
          </p>
        </div>
      )}

      {currentPlan !== "free" && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ <strong>Status:</strong> Assinatura ativa - {(user as any).status_assinatura || "Ativo"}
          </p>
        </div>
      )}
    </div>
  )
} 