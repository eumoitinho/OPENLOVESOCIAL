"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, X, ImageIcon, Video, File, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { validateMediaFile, formatFileSize, getImageDimensions, getVideoDuration } from "@/lib/media-utils"

interface MediaFile {
  id: string
  file: File
  preview?: string
  type: "image" | "video"
  dimensions?: { width: number; height: number }
  duration?: number
  uploadProgress: number
  isUploading: boolean
  error?: string
}

interface MediaUploadProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  acceptedTypes?: string[]
  maxFileSize?: number
  disabled?: boolean
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onUpload,
  maxFiles = 5,
  acceptedTypes = ["image/*", "video/*"],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  disabled = false,
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }

  const processFile = async (file: File): Promise<MediaFile> => {
    const validation = validateMediaFile(file)

    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    const mediaFile: MediaFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: validation.fileType!,
      uploadProgress: 0,
      isUploading: false,
    }

    // Create preview
    if (validation.fileType === "image" || validation.fileType === "video") {
      mediaFile.preview = await createPreview(file)
    }

    // Get dimensions for images
    if (validation.fileType === "image") {
      try {
        mediaFile.dimensions = await getImageDimensions(file)
      } catch (error) {
        console.warn("Could not get image dimensions:", error)
      }
    }

    // Get duration for videos
    if (validation.fileType === "video") {
      try {
        mediaFile.duration = await getVideoDuration(file)
      } catch (error) {
        console.warn("Could not get video duration:", error)
      }
    }

    return mediaFile
  }

  const handleFileSelect = async (files: FileList) => {
    const fileArray = Array.from(files)

    if (mediaFiles.length + fileArray.length > maxFiles) {
      toast({
        title: "Muitos arquivos",
        description: `Você pode enviar no máximo ${maxFiles} arquivos.`,
        variant: "destructive",
      })
      return
    }

    const newMediaFiles: MediaFile[] = []

    for (const file of fileArray) {
      try {
        const mediaFile = await processFile(file)
        newMediaFiles.push(mediaFile)
      } catch (error) {
        toast({
          title: "Erro no arquivo",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        })
      }
    }

    setMediaFiles((prev) => [...prev, ...newMediaFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeFile = (id: string) => {
    setMediaFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleUpload = async () => {
    if (mediaFiles.length === 0) return

    const filesToUpload = mediaFiles.filter((f) => !f.isUploading && !f.error)

    if (filesToUpload.length === 0) return

    try {
      // Update upload status
      setMediaFiles((prev) =>
        prev.map((file) =>
          filesToUpload.some((f) => f.id === file.id) ? { ...file, isUploading: true, uploadProgress: 0 } : file,
        ),
      )

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setMediaFiles((prev) =>
          prev.map((file) =>
            file.isUploading && file.uploadProgress < 90 ? { ...file, uploadProgress: file.uploadProgress + 10 } : file,
          ),
        )
      }, 200)

      await onUpload(filesToUpload.map((f) => f.file))

      clearInterval(progressInterval)

      // Complete upload
      setMediaFiles((prev) =>
        prev.map((file) =>
          filesToUpload.some((f) => f.id === file.id) ? { ...file, isUploading: false, uploadProgress: 100 } : file,
        ),
      )

      toast({
        title: "Upload concluído",
        description: `${filesToUpload.length} arquivo(s) enviado(s) com sucesso.`,
      })

      // Clear files after successful upload
      setTimeout(() => {
        setMediaFiles([])
      }, 2000)
    } catch (error) {
      setMediaFiles((prev) =>
        prev.map((file) =>
          filesToUpload.some((f) => f.id === file.id) ? { ...file, isUploading: false, error: "Erro no upload" } : file,
        ),
      )

      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao enviar os arquivos. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-8 w-8" />
      case "video":
        return <Video className="h-8 w-8" />
      default:
        return <File className="h-8 w-8" />
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`
          border-2 border-dashed transition-colors
          ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              {isDragging ? "Solte os arquivos aqui" : "Clique ou arraste arquivos"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Suporte para imagens e vídeos até {formatFileSize(maxFileSize)}
            </p>
            <p className="text-xs text-muted-foreground">Máximo de {maxFiles} arquivos</p>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* File List */}
      {mediaFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Arquivos selecionados ({mediaFiles.length})</h3>
            <Button
              onClick={handleUpload}
              disabled={disabled || mediaFiles.some((f) => f.isUploading) || mediaFiles.length === 0}
              size="sm"
            >
              {mediaFiles.some((f) => f.isUploading) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Arquivos
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-3">
            {mediaFiles.map((mediaFile) => (
              <Card key={mediaFile.id} className="p-3">
                <div className="flex items-center gap-3">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    {mediaFile.preview ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        {mediaFile.type === "image" ? (
                          <img
                            src={mediaFile.preview || "/placeholder.svg"}
                            alt={mediaFile.file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video src={mediaFile.preview} className="w-full h-full object-cover" muted />
                        )}
                        {mediaFile.type === "video" && mediaFile.duration && (
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                            {formatDuration(mediaFile.duration)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        {getFileIcon(mediaFile.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{mediaFile.file.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(mediaFile.file.size)}</span>
                      {mediaFile.dimensions && (
                        <span>
                          • {mediaFile.dimensions.width}×{mediaFile.dimensions.height}
                        </span>
                      )}
                      {mediaFile.duration && <span>• {formatDuration(mediaFile.duration)}</span>}
                    </div>

                    {/* Progress Bar */}
                    {mediaFile.isUploading && (
                      <div className="mt-2">
                        <Progress value={mediaFile.uploadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{mediaFile.uploadProgress}% enviado</p>
                      </div>
                    )}

                    {/* Error */}
                    {mediaFile.error && <p className="text-xs text-destructive mt-1">{mediaFile.error}</p>}

                    {/* Success */}
                    {mediaFile.uploadProgress === 100 && !mediaFile.isUploading && (
                      <p className="text-xs text-green-600 mt-1">✓ Enviado com sucesso</p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(mediaFile.id)}
                    disabled={mediaFile.isUploading}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaUpload
