"use client"

import { useState } from "react"
import { FilterSelector } from "@/app/components/filters/FilterSelector"
import { NotificationSystem } from "@/app/components/notifications/NotificationSystem"
import { PostToast } from "@/app/components/notifications/PostToast"
import { ChatInterface } from "@/app/components/chat/ChatInterface"
import { MobileNavigation } from "@/app/components/navigation/MobileNavigation"
import UserProfile from "@/app/components/profile/UserProfile"
import { AdvancedSearch } from "@/app/components/search/AdvancedSearch"
import { useIsMobile } from "@/hooks/use-mobile"

export function IntegratedHomePage() {
  const [showChat, setShowChat] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const isMobile = useIsMobile()

  // Exemplo de opções para o FilterSelector
  const filterOptions = [
    { id: "music", label: "Música", value: "music" },
    { id: "sports", label: "Esportes", value: "sports" },
    { id: "travel", label: "Viagem", value: "travel" },
    { id: "food", label: "Culinária", value: "food" },
    { id: "art", label: "Arte", value: "art" },
    { id: "technology", label: "Tecnologia", value: "technology" },
    { id: "books", label: "Livros", value: "books" },
    { id: "movies", label: "Filmes", value: "movies" },
    { id: "photography", label: "Fotografia", value: "photography" },
    { id: "fitness", label: "Fitness", value: "fitness" }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                OpenLove
              </h1>
              
              {/* FilterSelector Example */}
              <div className="w-64">
                <FilterSelector
                  options={filterOptions}
                  selectedOptions={selectedFilters}
                  onSelectionChange={setSelectedFilters}
                  maxSelections={5}
                  placeholder="Filtrar por interesses..."
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* NotificationSystem Example */}
              <NotificationSystem showBadge={true} showCenter={true} />
              
              <button
                onClick={() => setShowChat(!showChat)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                {showChat ? 'Fechar Chat' : 'Abrir Chat'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Search */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Busca Avançada
                </h2>
                <AdvancedSearch />
              </div>
            </div>
          </div>

          {/* Center Column - Profile Example */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <UserProfile username="exemplo" />
            </div>
          </div>
        </div>
      </main>

      {/* Chat Interface */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Chat
              </h2>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="h-full">
              <ChatInterface />
            </div>
          </div>
        </div>
      )}

      {/* PostToast Example */}
      <PostToast />

      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation />}

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Componentes Implementados:
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>✅ FilterSelector - Filtros múltiplos</li>
          <li>✅ NotificationSystem - Sistema de notificações</li>
          <li>✅ PostToast - Toast para novos posts</li>
          <li>✅ ChatInterface - Interface de chat</li>
          <li>✅ MobileNavigation - Navegação mobile</li>
          <li>✅ UserProfile - Página de perfil</li>
          <li>✅ AdvancedSearch - Busca avançada</li>
        </ul>
      </div>
    </div>
  )
} 