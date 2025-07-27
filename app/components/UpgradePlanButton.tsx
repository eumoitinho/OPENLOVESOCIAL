"use client"

import { useState } from "react"
import { Crown, ArrowUp } from "lucide-react"
import PlanUpgradeModal from "@/app/components/upgrade/PlanUpgradeModal"

interface UpgradePlanButtonProps {
  currentPlan?: string
  targetPlan?: "gold" | "diamond" | "diamond_annual"
  className?: string
  variant?: 'button' | 'modal'
}

export default function UpgradePlanButton({ 
  currentPlan = 'free', 
  targetPlan, 
  className = "",
  variant = 'modal'
}: UpgradePlanButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    if (variant === 'modal') {
      setShowModal(true)
    }
  }

  const getButtonText = () => {
    if (currentPlan === "gold" && targetPlan === "diamond") {
      return "Upgrade para Diamond"
    }
    if (currentPlan === "free" && targetPlan === "gold") {
      return "Assinar Gold"
    }
    if (currentPlan === "free" && targetPlan === "diamond") {
      return "Assinar Diamond"
    }
    if (targetPlan === "diamond_annual") {
      return "Assinar Diamond Anual"
    }
    return "Fazer Upgrade"
  }

  const getButtonColor = () => {
    if (targetPlan === "gold") {
      return "bg-yellow-500 hover:bg-yellow-600"
    } else if (targetPlan === "diamond_annual") {
      return "bg-purple-500 hover:bg-purple-600"
    }
    return "bg-blue-500 hover:bg-blue-600"
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center justify-center space-x-2 px-4 py-2 text-white font-medium rounded-lg transition-colors ${getButtonColor()} hover:shadow-lg ${className}`}
      >
        <Crown className="w-4 h-4" />
        <ArrowUp className="w-4 h-4" />
        <span>{getButtonText()}</span>
      </button>

      {variant === 'modal' && (
        <PlanUpgradeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          currentPlan={currentPlan}
        />
      )}
    </>
  )
} 
