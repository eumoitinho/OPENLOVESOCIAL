"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

// Tipos podem ser centralizados
type NewPostState = {
  content: string
  image: File | null
  isEvent: boolean
  eventDetails: {
    date: string
    time: string
    location: string
    maxParticipants: number
  }
}

interface CreatePostDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  newPost: NewPostState
  onNewPostChange: (newState: NewPostState) => void
  onCreatePost: () => void
}

export const CreatePostDialog = React.memo(function CreatePostDialog({
  isOpen,
  onOpenChange,
  newPost,
  onNewPostChange,
  onCreatePost }: CreatePostDialogProps) {
  const handleFieldChange = React.useCallback((field: keyof NewPostState, value: any) => {
    onNewPostChange({ ...newPost, [field]: value })
  }, [newPost, onNewPostChange])

  const handleEventDetailChange = React.useCallback((field: keyof NewPostState["eventDetails"], value: any) => {
    onNewPostChange({
      ...newPost,
      eventDetails: { ...newPost.eventDetails, [field]: value } })
  }, [newPost, onNewPostChange])

  const handleContentChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleFieldChange("content", e.target.value)
  }, [handleFieldChange])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-openlove-500 to-openlove-600 hover:from-openlove-600 hover:to-openlove-700 shadow-lg hover:shadow-xl z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-white" style={{ direction: 'ltr', unicodeBidi: 'normal' }}>
        <DialogHeader>
          <DialogTitle className="text-openlove-800">Criar Novo Post</DialogTitle>
          <DialogDescription className="text-openlove-600">
            Compartilhe seus momentos com a comunidade OpenLove
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <textarea
            placeholder="O que está acontecendo?"
            value={newPost.content}
            onChange={handleContentChange}
            className="min-h-[100px] w-full resize-none border-0 focus-visible:ring-0 text-base bg-transparent outline-none post-modal-textarea border border-openlove-300 focus:ring-openlove-500"
            maxLength={2000}
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            style={{
              direction: 'ltr',
              unicodeBidi: 'normal',
              textAlign: 'left',
              writingMode: 'horizontal-tb',
              textOrientation: 'mixed'
            }}
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="is-event"
              checked={newPost.isEvent}
              onCheckedChange={(checked) => handleFieldChange("isEvent", checked)}
            />
            <Label htmlFor="is-event" className="text-openlove-700">Este é um evento</Label>
          </div>
          {newPost.isEvent && (
            <div className="space-y-3 p-4 bg-openlove-100 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="event-date" className="text-openlove-700">Data</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newPost.eventDetails.date}
                    onChange={(e) => handleEventDetailChange("date", e.target.value)}
                    className="border-openlove-300"
                  />
                </div>
                <div>
                  <Label htmlFor="event-time" className="text-openlove-700">Horário</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={newPost.eventDetails.time}
                    onChange={(e) => handleEventDetailChange("time", e.target.value)}
                    className="border-openlove-300"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="event-location" className="text-openlove-700">Local</Label>
                <Input
                  id="event-location"
                  placeholder="Onde será o evento?"
                  value={newPost.eventDetails.location}
                  onChange={(e) => handleEventDetailChange("location", e.target.value)}
                  className="border-openlove-300"
                />
              </div>
              <div>
                <Label htmlFor="max-participants" className="text-openlove-700">Máximo de Participantes</Label>
                <Input
                  id="max-participants"
                  type="number"
                  min="1"
                  value={newPost.eventDetails.maxParticipants}
                  onChange={(e) => handleEventDetailChange("maxParticipants", Number.parseInt(e.target.value))}
                  className="border-openlove-300"
                />
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFieldChange("image", e.target.files?.[0] || null)}
              className="flex-1 border-openlove-300"
            />
            <Button
              onClick={onCreatePost}
              disabled={!newPost.content.trim()}
              className="bg-gradient-to-r from-openlove-500 to-openlove-600 hover:from-openlove-600 hover:to-openlove-700 text-white"
            >
              Postar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
