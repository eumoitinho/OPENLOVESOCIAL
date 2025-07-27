"use client"

import React from "react"
import { Trash2, Download, Share2, Eye, Heart, User, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MediaItem {
  id: string
  url: string
  type: string
  size: number
  dimensions: { width: number; height: number }
  createdAt: string
  filename: string
  originalName: string
  mimeType: string
  isProfilePicture: boolean
  author: {
    id: string
    name: string
    avatar: string
  }
  stats: {
    likes: number
    downloads: number
    shares: number
    views: number
  }
}

interface MediaGalleryProps {
  items: MediaItem[]
  onDelete?: (id: string) => void
  onDownload?: (id: string) => void
  onShare?: (id: string) => void
  onLike?: (id: string) => void
  columns?: number
  showAuthor?: boolean
  showStats?: boolean
  showActions?: boolean
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  onDelete,
  onDownload,
  onShare,
  onLike,
  columns = 3,
  showAuthor = true,
  showStats = true,
  showActions = true }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric" })
  }

  const isImage = (mimeType: string): boolean => {
    return mimeType.startsWith("image/")
  }

  const isVideo = (mimeType: string): boolean => {
    return mimeType.startsWith("video/")
  }

  const getFileIcon = (mimeType: string) => {
    if (isImage(mimeType)) return "🖼️"
    if (isVideo(mimeType)) return "🎥"
    return "📄"
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6" }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <FileText className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma mídia encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">Comece fazendo upload de alguns arquivos.</p>
      </div>
    )
  }

  return (
    <div className={`grid gap-4 ${gridCols[columns as keyof typeof gridCols] || gridCols[3]}`}>
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            {/* Media Preview */}
            <div className="relative aspect-square bg-gray-100">
              {isImage(item.mimeType) ? (
                <img
                  src={item.url}
                  alt={item.originalName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : isVideo(item.mimeType) ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{getFileIcon(item.mimeType)}</div>
                    <div className="text-sm text-gray-600">{item.originalName}</div>
                  </div>
                </div>
              )}

              {/* Profile Picture Badge */}
              {item.isProfilePicture && (
                <Badge className="absolute top-2 left-2 bg-blue-500 text-white">
                  Foto de Perfil
                </Badge>
              )}

              {/* Actions Overlay */}
              {showActions && (
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    {onDownload && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onDownload(item.id)}
                        className="bg-white text-gray-900 hover:bg-gray-100"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {onShare && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onShare(item.id)}
                        className="bg-white text-gray-900 hover:bg-gray-100"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Media Info */}
            <div className="p-4">
              {/* Title and Type */}
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-900 truncate" title={item.originalName}>
                  {item.originalName}
                </h4>
                <p className="text-xs text-gray-500">
                  {item.mimeType} • {formatFileSize(item.size)}
                </p>
                {item.dimensions.width > 0 && item.dimensions.height > 0 && (
                  <p className="text-xs text-gray-500">
                    {item.dimensions.width} × {item.dimensions.height}
                  </p>
                )}
              </div>

              {/* Author */}
              {showAuthor && (
                <div className="flex items-center mb-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={item.author.avatar} alt={item.author.name} />
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600 truncate">{item.author.name}</span>
                </div>
              )}

              {/* Stats */}
              {showStats && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {item.stats.views}
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {item.stats.likes}
                    </span>
                    <span className="flex items-center">
                      <Download className="h-3 w-3 mr-1" />
                      {item.stats.downloads}
                    </span>
                  </div>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default MediaGallery 
