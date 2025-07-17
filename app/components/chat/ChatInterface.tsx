"use client"

import { useState, useEffect, useRef } from "react"
import { useIsMounted } from "@/hooks/use-is-mounted"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useConversations } from "@/app/hooks/useConversations"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { ConversationList } from "./ConversationList"
import { FileUpload } from "./FileUpload"

interface ChatInterfaceProps {
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

export function ChatInterface({ className, isOpen = false, onClose }: ChatInterfaceProps) {
  const { user } = useAuth()
  const { 
    conversations, 
    messages, 
    activeConversation, 
    loading, 
    sendMessage, 
    fetchMessages, 
    markAsRead,
    setTyping 
  } = useConversations(user?.id)
  
  const isMounted = useIsMounted()

  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showConversationList, setShowConversationList] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeConversationData = conversations.find(conv => conv.id === activeConversation)

  // Auto-scroll para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Marcar como lida quando abrir conversa
  useEffect(() => {
    if (activeConversation) {
      markAsRead(activeConversation)
    }
  }, [activeConversation, markAsRead])

  // Indicar digitação
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout

    if (isTyping && activeConversation) {
      setTyping(activeConversation, true)
      
      typingTimeout = setTimeout(() => {
        // Verificar se componente ainda está montado antes de atualizar estado
        if (isMounted.current) {
          setIsTyping(false)
          setTyping(activeConversation, false)
        }
      }, 3000)
    } else if (!isTyping && activeConversation) {
      setTyping(activeConversation, false)
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [isTyping, activeConversation, setTyping])

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return

    try {
      await sendMessage(activeConversation, message.trim())
      setMessage("")
      setIsTyping(false)
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    if (!isTyping) {
      setIsTyping(true)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!activeConversation) return

    try {
      // Aqui você implementaria o upload do arquivo
      // Por enquanto, vamos apenas enviar o nome do arquivo
      await sendMessage(activeConversation, `Arquivo: ${file.name}`, 'file')
      setShowFileUpload(false)
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoje"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem"
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  return (
    <div className={`flex h-full ${className || ''}`}>
      {/* Lista de Conversas (Mobile) */}
      <AnimatePresence>
        {showConversationList && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-10"
          >
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={(id) => {
                fetchMessages(id)
                setShowConversationList(false)
              }}
              onClose={() => setShowConversationList(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interface Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            {/* Botão de menu (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowConversationList(true)}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>

            {/* Informações da conversa */}
            {activeConversationData ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activeConversationData.participants[0]?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                    {activeConversationData.participants[0]?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {activeConversationData.name || activeConversationData.participants[0]?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {activeConversationData.participants.length} participante{activeConversationData.participants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Selecione uma conversa
                </h3>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            {activeConversationData && (
              <>
                <Button variant="ghost" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-4 h-4" />
                </Button>
              </>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isOwnMessage = msg.sender_id === user?.id
                    const showDate = index === 0 || 
                      formatDate(msg.created_at) !== formatDate(messages[index - 1]?.created_at)

                    return (
                      <div key={msg.id}>
                        {/* Separador de data */}
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <Badge variant="secondary" className="text-xs">
                              {formatDate(msg.created_at)}
                            </Badge>
                          </div>
                        )}

                        {/* Mensagem */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                            {!isOwnMessage && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={msg.sender?.avatar_url} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                                  {msg.sender?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={`rounded-lg px-3 py-2 ${
                              isOwnMessage 
                                ? 'bg-pink-500 text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-pink-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )
                  })}
                  
                  {/* Indicador de digitação */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-end gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                            {activeConversationData?.participants[0]?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input de Mensagem */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                  />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {/* Emoji picker */}}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Upload de arquivo */}
                <AnimatePresence>
                  {showFileUpload && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      <FileUpload onFileSelect={handleFileUpload} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Estado vazio */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma conversa selecionada
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Selecione uma conversa para começar a mensagem
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Conversas (Desktop) */}
      <div className="hidden md:block w-80 border-l border-gray-200 dark:border-gray-700">
        <ConversationList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={fetchMessages}
        />
      </div>
    </div>
  )
} 