"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SomethingWentWrongProps {
  message?: string
}

export function SomethingWentWrong({ message }: SomethingWentWrongProps) {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <AlertTriangle className="h-12 w-12 text-red-500" />
      <h3 className="mt-4 text-2xl font-bold text-red-800 dark:text-red-200">Oops! Algo deu errado.</h3>
      <p className="mt-2 text-center text-red-600 dark:text-red-400">
        {message || "Não foi possível carregar a timeline. Por favor, tente novamente."}
      </p>
      <Button onClick={handleRefresh} className="mt-6 bg-red-500 hover:bg-red-600 text-white">
        Recarregar a Página
      </Button>
    </div>
  )
}
