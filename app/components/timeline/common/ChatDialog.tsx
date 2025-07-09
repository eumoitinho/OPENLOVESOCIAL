"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, ArrowLeft, Send } from "lucide-react"
import { cn } from "@/lib/utils"

// Tipos podem ser centralizados
type Conversation = {
  id: string
  user: {
    name: string
    avatar: string
    isOnline: boolean
  }
  lastMessage: string
  timestamp: string
  unreadCount: number
}

type Message = {
  id: string
  content: string
  timestamp: string
  isOwn: boolean
}

interface ChatDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  conversations: Conversation[]
  messages: Message[]
  activeChat: string | null
  onActiveChatChange: (id: string | null) => void
  newMessage: string
  onNewMessageChange: (message: string) => void
  onSendMessage: () => void
}

function ConversationsList({ conversations, onSelectChat }: { conversations: Conversation[], onSelectChat: (id: string) => void }) {
    return (
        <ScrollArea className="flex-1">
            <div className="divide-y divide-openlove-200">
                {conversations.map((conversation) => (
                    <div
                        key={conversation.id}
                        className="p-4 hover:bg-openlove-50 cursor-pointer"
                        onClick={() => onSelectChat(conversation.id)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                                    <AvatarFallback className="bg-openlove-200">
                                        {conversation.user.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {conversation.user.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm text-openlove-800">{conversation.user.name}</h4>
                                    <span className="text-xs text-openlove-500">{conversation.timestamp}</span>
                                </div>
                                <p className="text-sm text-openlove-600 truncate">{conversation.lastMessage}</p>
                            </div>
                            {conversation.unreadCount > 0 && (
                                <Badge className="bg-openlove-500 text-white text-xs">{conversation.unreadCount}</Badge>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

function ActiveChat({
    chatId,
    conversations,
    messages,
    newMessage,
    onNewMessageChange,
    onSendMessage,
    onBack
}: {
    chatId: string,
    conversations: Conversation[],
    messages: Message[],
    newMessage: string,
    onNewMessageChange: (msg: string) => void,
    onSendMessage: () => void,
    onBack: () => void
}) {
    const activeConversation = conversations.find((c) => c.id === chatId);
    if (!activeConversation) return null;

    return (
        <>
            <div className="flex items-center gap-3 p-4 border-b border-openlove-200">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 text-openlove-600" />
                </Button>
                <Avatar className="w-8 h-8">
                    <AvatarImage
                        src={activeConversation.user.avatar}
                        alt={activeConversation.user.name}
                    />
                    <AvatarFallback className="bg-openlove-200">
                        {activeConversation.user.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-medium text-sm text-openlove-800">
                        {activeConversation.user.name}
                    </h4>
                    <p className="text-xs text-openlove-500">
                        {activeConversation.user.isOnline ? "Online" : "Offline"}
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
                                        ? "bg-gradient-to-r from-openlove-500 to-openlove-600 text-white"
                                        : "bg-openlove-100 text-openlove-800",
                                )}
                            >
                                <p>{message.content}</p>
                                <p className={cn("text-xs mt-1", message.isOwn ? "text-openlove-100" : "text-openlove-500")}>
                                    {message.timestamp}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-openlove-200">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => onNewMessageChange(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
                        className="flex-1 border-openlove-300 focus:ring-openlove-500"
                    />
                    <Button
                        size="sm"
                        onClick={onSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-openlove-600 hover:bg-openlove-700"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </>
    )
}


export function ChatDialog({
  isOpen,
  onOpenChange,
  conversations,
  messages,
  activeChat,
  onActiveChatChange,
  newMessage,
  onNewMessageChange,
  onSendMessage,
}: ChatDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[600px] p-0 bg-white">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-openlove-200">
            <h3 className="font-semibold text-openlove-800">Mensagens</h3>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 text-openlove-600" />
            </Button>
          </div>
          {!activeChat ? (
            <ConversationsList conversations={conversations} onSelectChat={(id) => onActiveChatChange(id)} />
          ) : (
            <ActiveChat
                chatId={activeChat}
                conversations={conversations}
                messages={messages}
                newMessage={newMessage}
                onNewMessageChange={onNewMessageChange}
                onSendMessage={onSendMessage}
                onBack={() => onActiveChatChange(null)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
