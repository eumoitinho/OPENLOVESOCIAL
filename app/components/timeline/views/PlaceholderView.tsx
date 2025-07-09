"use client"

import React from "react"
import { Home } from "lucide-react"

interface PlaceholderViewProps {
  viewName: string
  icon: React.ElementType
}

export function PlaceholderView({ viewName, icon }: PlaceholderViewProps) {
  return (
    <div className="border-x border-openlove-200 min-h-screen">
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-openlove-200 p-4">
        <h2 className="text-xl font-bold text-openlove-800 capitalize">
          {viewName}
        </h2>
      </div>
      <div className="p-8 text-center text-openlove-600">
        <div className="w-16 h-16 mx-auto mb-4 bg-openlove-100 rounded-full flex items-center justify-center">
          {React.createElement(icon || Home, {
            className: "w-8 h-8 text-openlove-600",
          })}
        </div>
        <p>Esta seção está em desenvolvimento.</p>
        <p className="text-sm mt-2">
          Em breve você poderá acessar {viewName.toLowerCase()}.
        </p>
      </div>
    </div>
  )
}
