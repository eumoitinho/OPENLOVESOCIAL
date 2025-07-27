"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Flag, 
  AlertTriangle, 
  X, 
  Send, 
  CheckCircle,
  User,
  MessageCircle,
  Image,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/app/lib/supabase-browser"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface ReportSystemProps {
  targetId: string
  targetType: 'user' | 'post' | 'message' | 'comment'
  targetData?: {
    id: string
    title?: string
    content?: string
    user?: {
      id: string
      name: string
      username: string
      avatar_url?: string
    }
  }
  onClose?: () => void
  className?: string
}

interface ReportReason {
  id: string
  label: string
  description: string
  category: 'spam' | 'inappropriate' | 'harassment' | 'fake' | 'other'
}

const reportReasons: ReportReason[] = [
  {
    id: "spam",
    label: "Spam",
    description: "Conteúdo repetitivo ou não solicitado",
    category: "spam"
  },
  {
    id: "inappropriate",
    label: "Conteúdo Inadequado",
    description: "Conteúdo ofensivo ou impróprio",
    category: "inappropriate"
  },
  {
    id: "harassment",
    label: "Assédio",
    description: "Comportamento abusivo ou intimidatório",
    category: "harassment"
  },
  {
    id: "fake",
    label: "Conta Falsa",
    description: "Perfil falso ou enganoso",
    category: "fake"
  },
  {
    id: "violence",
    label: "Violência",
    description: "Conteúdo violento ou ameaçador",
    category: "inappropriate"
  },
  {
    id: "copyright",
    label: "Violação de Direitos Autorais",
    description: "Uso não autorizado de conteúdo",
    category: "other"
  },
  {
    id: "other",
    label: "Outro",
    description: "Outro motivo não listado",
    category: "other"
  }
]

export function ReportSystem({ 
  targetId, 
  targetType, 
  targetData, 
  onClose,
  className 
}: ReportSystemProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleOpen = () => {
    setIsOpen(true)
    setError(null)
    setIsSubmitted(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedReason("")
    setDescription("")
    setError(null)
    onClose?.()
  }

  const handleSubmit = async () => {
    if (!user?.id || !selectedReason) {
      setError("Por favor, selecione um motivo para a denúncia")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const { error: reportError } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          target_id: targetId,
          target_type: targetType,
          reason: selectedReason,
          description: description.trim() || null,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (reportError) throw reportError

      setIsSubmitted(true)
      
      // Fechar após 2 segundos
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (err) {
      console.error('Erro ao enviar denúncia:', err)
      setError('Erro ao enviar denúncia. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTargetIcon = () => {
    switch (targetType) {
      case 'user': return <User className="w-4 h-4" />
      case 'post': return <FileText className="w-4 h-4" />
      case 'message': return <MessageCircle className="w-4 h-4" />
      case 'comment': return <MessageCircle className="w-4 h-4" />
      default: return <Flag className="w-4 h-4" />
    }
  }

  const getTargetLabel = () => {
    switch (targetType) {
      case 'user': return 'Usuário'
      case 'post': return 'Post'
      case 'message': return 'Mensagem'
      case 'comment': return 'Comentário'
      default: return 'Item'
    }
  }

  return (
    <div className={className}>
      {/* Botão de Denúncia */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10"
      >
        <Flag className="w-4 h-4 mr-1" />
        Denunciar
      </Button>

      {/* Modal de Denúncia */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center">
                      <Flag className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Denunciar {getTargetLabel()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Ajude-nos a manter a comunidade segura
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {isSubmitted ? (
                    /* Sucesso */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Denúncia Enviada
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Obrigado por nos ajudar a manter a comunidade segura. Nossa equipe irá analisar sua denúncia.
                      </p>
                    </motion.div>
                  ) : (
                    /* Formulário */
                    <>
                      {/* Item sendo denunciado */}
                      {targetData && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            {targetData.user && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={targetData.user.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-xs">
                                  {targetData.user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getTargetIcon()}
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {targetData.user?.name || targetData.title || `ID: ${targetId}`}
                                </span>
                                {targetData.user && (
                                  <span className="text-xs text-gray-500">
                                    @{targetData.user.username}
                                  </span>
                                )}
                              </div>
                              {targetData.content && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {targetData.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Motivos */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Selecione o motivo da denúncia
                        </h4>
                        <div className="space-y-2">
                          {reportReasons.map((reason) => (
                            <button
                              key={reason.id}
                              onClick={() => setSelectedReason(reason.id)}
                              className={`w-full p-3 text-left rounded-lg border transition-colors duration-200 ${
                                selectedReason === reason.id
                                  ? 'border-red-500 bg-red-50 dark:bg-red-950/10'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className={`w-4 h-4 rounded-full border-2 ${
                                    selectedReason === reason.id
                                      ? 'border-red-500 bg-red-500'
                                      : 'border-gray-300 dark:border-gray-600'
                                  }`}>
                                    {selectedReason === reason.id && (
                                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                    {reason.label}
                                  </h5>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {reason.description}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Descrição adicional */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Descrição adicional (opcional)
                        </label>
                        <Textarea
                          placeholder="Forneça mais detalhes sobre a denúncia..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="min-h-[100px]"
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {description.length}/500 caracteres
                        </p>
                      </div>

                      {/* Erro */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Ações */}
                      <div className="flex items-center gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={handleClose}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={!selectedReason || isSubmitting}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Enviar Denúncia
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
} 
