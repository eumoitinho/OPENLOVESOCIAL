"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, X, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  conversations: any[]
  messages: any[]
  activeChat: string | null
  setActiveChat: (chatId: string | null) => void
  newMessage: string
  setNewMessage: (message: string) => void
  handleSendMessage: () => void
}

export function ChatDialog({
  isOpen,
  setIsOpen,
  conversations,
  messages,
  activeChat,
  setActiveChat,
  newMessage,
  setNewMessage,
  handleSendMessage,
}: ChatDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md h-[600px] p-0 bg-white dark:bg-gray-900">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Mensagens</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>
          {!activeChat ? (
            <ScrollArea className="flex-1">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setActiveChat(conversation.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={conversation.user.avatar || "/placeholder.svg"}
                            alt={conversation.user.name}
                          />
                          <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                            {conversation.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                            {conversation.user.name}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{conversation.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-pink-500 text-white text-xs">{conversation.unreadCount}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                <Button variant="ghost" size="sm" onClick={() => setActiveChat(null)}>
                  <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={conversations.find((c) => c.id === activeChat)?.user.avatar || "/placeholder.svg"}
                    alt={conversations.find((c) => c.id === activeChat)?.user.name}
                  />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                    {conversations.find((c) => c.id === activeChat)?.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                    {conversations.find((c) => c.id === activeChat)?.user.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {conversations.find((c) => c.id === activeChat)?.user.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[70%] p-3 rounded-lg text-sm",
                          message.isOwn
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white",
                        )}
                      >
                        <p>{message.content}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            message.isOwn ? "text-pink-100" : "text-gray-500 dark:text-gray-400",
                          )}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 border-gray-300 dark:border-gray-600 focus:ring-pink-500 dark:focus:ring-pink-400"
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
