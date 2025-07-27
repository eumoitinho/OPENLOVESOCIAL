"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Textarea } from "../../../components/ui/textarea"
import { Switch } from "../../../components/ui/switch"
import { Label } from "../../../components/ui/label"
import {
  Send,
  Copy,
  Share2,
  MessageCircle,
  Mail,
  Link,
  Users,
  Globe,
  Lock,
  BadgeCheckIcon,
  Check,
  X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface User {
  id: string
  name: string
  username: string
  avatar: string
  verified: boolean
  premium: boolean
  isOnline: boolean
}

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  postContent: string
  postAuthor: {
    name: string
    username: string
    avatar: string
    verified: boolean
    premium: boolean
  }
  postImages?: string[]
  postVideo?: string
  currentUser: {
    name: string
    username: string
    avatar: string
  }
  onShareToDirect?: (userId: string, message: string) => void
  onShareToTimeline?: (message: string, isPublic: boolean) => void
  onCopyLink?: () => void
}

export function ShareDialog({
  isOpen,
  onClose,
  postId,
  postContent,
  postAuthor,
  postImages,
  postVideo,
  currentUser,
  onShareToDirect,
  onShareToTimeline,
  onCopyLink }: ShareDialogProps) {
  const [activeTab, setActiveTab] = useState<"direct" | "timeline" | "link">("direct")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Mock data - em produção viria da API
  const recentUsers: User[] = [
    {
      id: "1",
      name: "Amanda & Carlos",
      username: "@amandacarlos",
      avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
      verified: true,
      premium: true,
      isOnline: true },
    {
      id: "2",
      name: "Sofia Mendes",
      username: "@sofia_livre",
      avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
      verified: false,
      premium: false,
      isOnline: false },
    {
      id: "3",
      name: "Lisa & João",
      username: "@lisajoao",
      avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
      verified: true,
      premium: true,
      isOnline: true },
  ]

  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleShareToDirect = async () => {
    if (selectedUsers.size === 0) return

    setIsSharing(true)
    try {
      for (const userId of selectedUsers) {
        await onShareToDirect?.(userId, message)
      }
      onClose()
    } finally {
      setIsSharing(false)
    }
  }

  const handleShareToTimeline = async () => {
    setIsSharing(true)
    try {
      await onShareToTimeline?.(message, isPublic)
      onClose()
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await onCopyLink?.()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Erro ao copiar link:", error)
    }
  }

  const getSharePreview = () => {
    return (
      <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={postAuthor.avatar} alt={postAuthor.name} />
            <AvatarFallback>{postAuthor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{postAuthor.name}</span>
              {postAuthor.verified && (
                <BadgeCheckIcon className="w-4 h-4 fill-sky-500 text-white" />
              )}
              {postAuthor.premium && (
                <Badge variant="outline" className="text-xs border-pink-600 text-pink-600">
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{postContent}</p>
            {(postImages?.length || postVideo) && (
              <div className="mt-2 text-xs text-gray-500">
                {postImages?.length ? `${postImages.length} foto${postImages.length > 1 ? 's' : ''}` : ''}
                {postVideo && ' Vídeo'}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar Post
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("direct")}
              className={cn(
                "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "direct"
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Direct
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={cn(
                "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "timeline"
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              Timeline
            </button>
            <button
              onClick={() => setActiveTab("link")}
              className={cn(
                "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "link"
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <Link className="w-4 h-4 inline mr-2" />
              Link
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "direct" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Enviar para:</h3>
                  <div className="space-y-2">
                    {recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => handleUserToggle(user.id)}
                      >
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{user.name}</span>
                            {user.verified && (
                              <BadgeCheckIcon className="w-4 h-4 fill-sky-500 text-white" />
                            )}
                            {user.premium && (
                              <Badge variant="outline" className="text-xs border-pink-600 text-pink-600">
                                Premium
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{user.username}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 transition-colors",
                          selectedUsers.has(user.id)
                            ? "bg-pink-500 border-pink-500"
                            : "border-gray-300"
                        )}>
                          {selectedUsers.has(user.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium">
                    Mensagem (opcional):
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Adicione uma mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {message.length}/500
                  </div>
                </div>

                {getSharePreview()}
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timeline-message" className="text-sm font-medium">
                    Adicione um comentário:
                  </Label>
                  <Textarea
                    id="timeline-message"
                    placeholder="O que você pensa sobre isso?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {message.length}/500
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="public-share" className="text-sm">
                      Compartilhar publicamente
                    </Label>
                    <Switch
                      id="public-share"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    {isPublic ? <Globe className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    {isPublic ? "Público" : "Amigos"}
                  </div>
                </div>

                {getSharePreview()}
              </div>
            )}

            {activeTab === "link" && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Link className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-semibold mb-2">Compartilhar Link</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Copie o link deste post para compartilhar em outras plataformas
                  </p>
                  <Button
                    onClick={handleCopyLink}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Link Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Link
                      </>
                    )}
                  </Button>
                </div>

                {getSharePreview()}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {activeTab === "direct" && (
              <Button
                onClick={handleShareToDirect}
                disabled={selectedUsers.size === 0 || isSharing}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                {isSharing ? "Enviando..." : `Enviar (${selectedUsers.size})`}
              </Button>
            )}
            {activeTab === "timeline" && (
              <Button
                onClick={handleShareToTimeline}
                disabled={isSharing}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                {isSharing ? "Compartilhando..." : "Compartilhar"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
