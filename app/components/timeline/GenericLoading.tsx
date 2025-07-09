"use client"

import { Loader2 } from "lucide-react"

interface GenericLoadingProps {
  children?: React.ReactNode
}

export function GenericLoading({ children = "Carregando..." }: GenericLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      <p className="mt-4 text-lg">{children}</p>
    </div>
  )
}
