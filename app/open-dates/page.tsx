"use client"

import { OpenDatesStack } from "@/app/components/timeline/OpenDatesStack"
import { OpenDatesPreferences } from "@/app/components/timeline/OpenDatesPreferences"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Settings } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function OpenDatesPage() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<'main' | 'preferences'>('main')

  useEffect(() => {
    const viewParam = searchParams.get('view')
    if (viewParam === 'preferences') {
      setView('preferences')
    } else {
      setView('main')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Open Dates
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {view === 'main' ? 'Descubra pessoas incríveis' : 'Configure suas preferências'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {view === 'main' && (
                <Button
                  variant="outline"
                  onClick={() => setView('preferences')}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Preferências
                </Button>
              )}
              {view === 'preferences' && (
                <Button
                  variant="outline"
                  onClick={() => setView('main')}
                >
                  Voltar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {view === 'main' && <OpenDatesStack />}
        {view === 'preferences' && <OpenDatesPreferences />}
      </div>
    </div>
  )
} 
