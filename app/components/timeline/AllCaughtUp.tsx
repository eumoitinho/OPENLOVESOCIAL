"use client"

import { CheckCircle2 } from "lucide-react"

export function AllCaughtUp() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
      <CheckCircle2 className="h-12 w-12 text-green-500" />
      <h3 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-200">Você está em dia!</h3>
      <p className="mt-2 text-center">Você viu todos os posts da sua timeline.</p>
    </div>
  )
}
