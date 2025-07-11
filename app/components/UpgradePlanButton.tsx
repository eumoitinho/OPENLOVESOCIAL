"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Crown, ArrowUp } from "lucide-react"

interface UpgradePlanButtonProps {
  currentPlan?: string
  targetPlan: "gold" | "diamante"
  className?: string
}

export default function UpgradePlanButton({ currentPlan, targetPlan, className = "" }: UpgradePlanButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      // Redirecionar para a página de checkout com o plano selecionado
      router.push(`/checkout?plano=${targetPlan}`)
    } catch (error) {
      console.error("Erro ao redirecionar:", error)
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (currentPlan === "gold" && targetPlan === "diamante") {
      return "Upgrade para Diamante"
    }
    if (currentPlan === "free" && targetPlan === "gold") {
      return "Assinar Open Ouro"
    }
    if (currentPlan === "free" && targetPlan === "diamante") {
      return "Assinar Open Diamante"
    }
    return `Assinar ${targetPlan === "gold" ? "Open Ouro" : "Open Diamante"}`
  }

  const getButtonColor = () => {
    if (targetPlan === "gold") {
      return "bg-yellow-500 hover:bg-yellow-600"
    }
    return "bg-blue-500 hover:bg-blue-600"
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`flex items-center justify-center space-x-2 px-4 py-2 text-white font-medium rounded-lg transition-colors ${getButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <Crown className="w-4 h-4" />
          <ArrowUp className="w-4 h-4" />
        </>
      )}
      <span>{getButtonText()}</span>
    </button>
  )
} 