"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ImageIcon, Calendar, Globe, UserCheck } from "lucide-react"

interface CreatePostFormProps {
  newPost: any
  setNewPost: (post: any) => void
  handleCreatePost: () => void
}

export function CreatePostForm({ newPost, setNewPost, handleCreatePost }: CreatePostFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const currentUser = {
    name: "João Vitor",
    username: "joao_vitor",
    avatar: "/placeholder.svg?height=40&width=40",
  }

  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-pink-200 dark:border-pink-800">
            <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">@{currentUser.username}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Textarea
          placeholder="O que está acontecendo?"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          onFocus={() => setIsExpanded(true)}
          className="min-h-[80px] border-gray-300 dark:border-gray-600 focus:ring-pink-500 dark:focus:ring-pink-400 resize-none bg-gray-50 dark:bg-gray-800"
        />

        {isExpanded && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Visibility Settings */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                {newPost.visibility === "public" ? (
                  <Globe className="w-4 h-4 text-pink-600" />
                ) : (
                  <UserCheck className="w-4 h-4 text-pink-600" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {newPost.visibility === "public" ? "Público" : "Apenas amigos"}
                </span>
              </div>
              <Select
                value={newPost.visibility}
                onValueChange={(value) => setNewPost({ ...newPost, visibility: value })}
              >
                <SelectTrigger className="w-40 border-pink-300 dark:border-pink-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Público
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Apenas amigos
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is-event"
                checked={newPost.isEvent}
                onCheckedChange={(checked) => setNewPost({ ...newPost, isEvent: checked })}
              />
              <Label htmlFor="is-event" className="text-gray-700 dark:text-gray-300">
                Este é um evento
              </Label>
            </div>

            {/* Event Details */}
            {newPost.isEvent && (
              <div className="space-y-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Detalhes do Evento</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="event-date" className="text-gray-700 dark:text-gray-300">
                      Data
                    </Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={newPost.eventDetails.date}
                      onChange={(e) =>
                        setNewPost({
                          ...newPost,
                          eventDetails: { ...newPost.eventDetails, date: e.target.value },
                        })
                      }
                      className="border-pink-300 dark:border-pink-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-time" className="text-gray-700 dark:text-gray-300">
                      Horário
                    </Label>
                    <Input
                      id="event-time"
                      type="time"
                      value={newPost.eventDetails.time}
                      onChange={(e) =>
                        setNewPost({
                          ...newPost,
                          eventDetails: { ...newPost.eventDetails, time: e.target.value },
                        })
                      }
                      className="border-pink-300 dark:border-pink-700"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="event-location" className="text-gray-700 dark:text-gray-300">
                    Local
                  </Label>
                  <Input
                    id="event-location"
                    placeholder="Onde será o evento?"
                    value={newPost.eventDetails.location}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        eventDetails: { ...newPost.eventDetails, location: e.target.value },
                      })
                    }
                    className="border-pink-300 dark:border-pink-700"
                  />
                </div>
                <div>
                  <Label htmlFor="max-participants" className="text-gray-700 dark:text-gray-300">
                    Máximo de Participantes
                  </Label>
                  <Input
                    id="max-participants"
                    type="number"
                    min="1"
                    value={newPost.eventDetails.maxParticipants}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        eventDetails: { ...newPost.eventDetails, maxParticipants: Number.parseInt(e.target.value) },
                      })
                    }
                    className="border-pink-300 dark:border-pink-700"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20">
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Foto
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPost({ ...newPost, image: e.target.files?.[0] || null })}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                    asChild
                  >
                    <span>
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Imagem
                    </span>
                  </Button>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="border-gray-300 dark:border-gray-600"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.content.trim()}
                  className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:via-rose-700 hover:to-purple-700 text-white"
                >
                  Postar
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isExpanded && newPost.content && (
          <div className="flex justify-end">
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.content.trim()}
              className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:via-rose-700 hover:to-purple-700 text-white"
            >
              Postar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
