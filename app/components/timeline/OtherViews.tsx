"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"

interface OtherViewsProps {
  activeView: string
}

export function OtherViews({ activeView }: OtherViewsProps) {
  const getIcon = () => {
    switch (activeView) {
      case "settings":
        return Settings
      default:
        return Settings
    }
  }

  const Icon = getIcon()

  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Icon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Esta seção está em desenvolvimento.</p>
        <p className="text-sm mt-2 text-gray-500 dark:text-gray-500">
          Em breve você poderá acessar {activeView === "settings" ? "configurações" : activeView}.
        </p>
      </CardContent>
    </Card>
  )
}
