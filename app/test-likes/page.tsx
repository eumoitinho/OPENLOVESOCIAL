import { LikeTestComponent } from "@/app/components/test/LikeTestComponent"
import { NotificationSystem } from "@/app/components/notifications/NotificationSystem"

export default function TestLikesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header com sistema de notificações */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                OpenLove - Teste de Curtidas
              </h1>
            </div>
            
            {/* Sistema de notificações */}
            <div className="flex items-center space-x-4">
              <NotificationSystem />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="py-8">
        <LikeTestComponent />
      </main>

      {/* Footer informativo */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sistema de Curtidas com Notificações
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Este é um sistema completo de curtidas que inclui notificações em tempo real, 
              badges visuais, contadores automáticos e integração com o sistema de notificações. 
              Teste curtindo os posts acima e veja as notificações aparecerem no badge rosa!
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
