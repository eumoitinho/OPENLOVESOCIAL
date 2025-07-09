"use client"

import type React from "react"
import { useState } from "react"
import { Play, Download, Share2, Heart, MoreVertical, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface MediaItem {
  id: string
  type: "image" | "video"
  url: string
  thumbnail?: string
  title?: string
  description?: string
  duration?: number
  size: number
  dimensions: { width: number; height: number }
  createdAt: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  stats: {
    likes: number
    downloads: number
    views: number
  }
  isLiked?: boolean
  tags?: string[]
}

interface MediaGalleryProps {
  items: MediaItem[]
  columns?: number
  showStats?: boolean
  showAuthor?: boolean
  onLike?: (itemId: string) => void
  onDownload?: (itemId: string) => void
  onShare?: (itemId: string) => void
  onDelete?: (itemId: string) => void
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  columns = 3,
  showStats = true,
  showAuthor = true,
  onLike,
  onDownload,
  onShare,
  onDelete,
}) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const openLightbox = (item: MediaItem, index: number) => {
    setSelectedItem(item)
    setSelectedIndex(index)
  }

  const navigateLightbox = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev" ? (selectedIndex - 1 + items.length) % items.length : (selectedIndex + 1) % items.length

    setSelectedIndex(newIndex)
    setSelectedItem(items[newIndex])
  }

  const getGridCols = () => {
    switch (columns) {
      case 2:
        return "grid-cols-2"
      case 4:
        return "grid-cols-4"
      case 5:
        return "grid-cols-5"
      default:
        return "grid-cols-3"
    }
  }

  return (
    <>
      <div className={`grid ${getGridCols()} gap-4`}>
        {items.map((item, index) => (
          <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-square overflow-hidden">
              {/* Media Preview */}
              <div className="w-full h-full cursor-pointer" onClick={() => openLightbox(item, index)}>
                {item.type === "image" ? (
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.title || "Media"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.title || "Video"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-black/70 rounded-full p-3">
                        <Play className="h-6 w-6 text-white fill-white" />
                      </div>
                    </div>
                    {item.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(item.duration)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onLike?.(item.id)
                  }}
                >
                  <Heart className={`h-4 w-4 ${item.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDownload?.(item.id)
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onShare?.(item.id)
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="secondary" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onDownload?.(item.id)}>Baixar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShare?.(item.id)}>Compartilhar</DropdownMenuItem>
                    {onDelete && (
                      <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">
                        Excluir
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.tags[0]}
                  </Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <CardContent className="p-3">
              {item.title && <h3 className="font-medium text-sm mb-1 truncate">{item.title}</h3>}

              {showAuthor && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={item.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{item.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">{item.author.name}</span>
                </div>
              )}

              {showStats && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>{item.stats.likes} likes</span>
                    <span>{item.stats.views} views</span>
                  </div>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          {selectedItem && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedItem.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{selectedItem.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{selectedItem.author.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(selectedItem.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onLike?.(selectedItem.id)}>
                    <Heart className={`h-4 w-4 ${selectedItem.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    {selectedItem.stats.likes}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDownload?.(selectedItem.id)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onShare?.(selectedItem.id)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Media */}
              <div className="flex-1 relative flex items-center justify-center bg-black">
                {selectedItem.type === "image" ? (
                  <img
                    src={selectedItem.url || "/placeholder.svg"}
                    alt={selectedItem.title || "Media"}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video src={selectedItem.url} controls className="max-w-full max-h-full" autoPlay />
                )}

                {/* Navigation */}
                {items.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => navigateLightbox("prev")}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => navigateLightbox("next")}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                {selectedItem.title && <h3 className="font-medium mb-2">{selectedItem.title}</h3>}
                {selectedItem.description && (
                  <p className="text-sm text-muted-foreground mb-3">{selectedItem.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>
                      {selectedItem.dimensions.width} × {selectedItem.dimensions.height}
                    </span>
                    <span>{formatFileSize(selectedItem.size)}</span>
                    {selectedItem.duration && <span>{formatDuration(selectedItem.duration)}</span>}
                  </div>
                  <span>
                    {selectedIndex + 1} de {items.length}
                  </span>
                </div>

                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {selectedItem.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MediaGallery
