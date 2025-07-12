"use client"

import { Button } from "../../../components/ui/button"
import { MessageCircle } from "lucide-react"

export function MessagesContent() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <MessageCircle className="w-16 h-16 text-gray-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sistema de Mensagens
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Acesse o sistema completo de mensagens com chat em tempo real e chamadas de voz/vídeo.
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = '/messages'}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            Abrir Mensagens
          </Button>
        </div>
      </div>
    </div>
  )
} 