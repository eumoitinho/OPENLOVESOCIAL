"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, X, ImageIcon, Video, File, Loader2, Zap, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { 
  validateMediaFile, 
  formatFileSize, 
  getImageDimensions, 
  getVideoDuration,
  validateAndOptimizeFile,
  getOptimizationStats,
  needsOptimization,
  needsImageResize
} from "../../lib/media-utils"

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
  // Novas propriedades para otimização
  originalSize?: number
  optimizedSize?: number
  compressionRatio?: number
  isOptimized?: boolean
  isOptimizing?: boolean
}

interface MediaUploadProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  acceptedTypes?: string[]
  maxFileSize?: number
  disabled?: boolean
  autoOptimize?: boolean // Nova prop para otimização automática
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onUpload,
  maxFiles = 5,
  acceptedTypes = ["image/*", "video/*"],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  disabled = false,
  autoOptimize = true, // Ativar otimização por padrão
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

    // Determinar tipo de arquivo baseado no MIME type
    const fileType = file.type.startsWith("image/") ? "image" : "video"

    const mediaFile: MediaFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: fileType,
      uploadProgress: 0,
      isUploading: false,
      originalSize: file.size,
    }

    // Create preview
    if (fileType === "image" || fileType === "video") {
      mediaFile.preview = await createPreview(file)
    }

    // Get dimensions for images
    if (fileType === "image") {
      try {
        mediaFile.dimensions = await getImageDimensions(file)
      } catch (error) {
        console.warn("Could not get image dimensions:", error)
      }
    }

    // Get duration for videos
    if (fileType === "video") {
      try {
        mediaFile.duration = await getVideoDuration(file)
      } catch (error) {
        console.warn("Could not get video duration:", error)
      }
    }

    return mediaFile
  }

  const optimizeFile = async (mediaFile: MediaFile): Promise<MediaFile> => {
    if (!autoOptimize) return mediaFile

    try {
      setMediaFiles(prev => 
        prev.map(f => f.id === mediaFile.id ? { ...f, isOptimizing: true } : f)
      )

      const result = await validateAndOptimizeFile(mediaFile.file)
      
             // Criar novo arquivo otimizado
       const optimizedFile = new File([result.file], mediaFile.file.name, {
         type: result.file instanceof Blob ? result.file.type : mediaFile.file.type
       })

      const updatedMediaFile: MediaFile = {
        ...mediaFile,
        file: optimizedFile,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        compressionRatio: result.compressionRatio,
        isOptimized: result.needsOptimization,
        isOptimizing: false,
      }

      // Atualizar preview se necessário
      if (result.needsOptimization && (mediaFile.type === "image" || mediaFile.type === "video")) {
        updatedMediaFile.preview = await createPreview(optimizedFile)
      }

      return updatedMediaFile
    } catch (error) {
      console.warn("Falha na otimização:", error)
      return { ...mediaFile, isOptimizing: false }
    }
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const remainingSlots = maxFiles - mediaFiles.length

    if (fileArray.length > remainingSlots) {
      toast({
        title: "Limite de arquivos excedido",
        description: `Você pode enviar no máximo ${maxFiles} arquivos.`,
        variant: "destructive",
      })
      return
    }

    const newMediaFiles: MediaFile[] = []

    for (const file of fileArray) {
      try {
        const processedFile = await processFile(file)
        const optimizedFile = await optimizeFile(processedFile)
        newMediaFiles.push(optimizedFile)
      } catch (error) {
        toast({
          title: "Erro ao processar arquivo",
          description: error instanceof Error ? error.message : "Arquivo inválido",
          variant: "destructive",
        })
      }
    }

    setMediaFiles((prev) => [...prev, ...newMediaFiles])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
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

      // Mostrar estatísticas de otimização
      const optimizedFiles = filesToUpload.filter(f => f.isOptimized)
      if (optimizedFiles.length > 0) {
        const totalSaved = optimizedFiles.reduce((acc, f) => acc + (f.originalSize || 0) - (f.optimizedSize || 0), 0)
        const stats = getOptimizationStats(
          optimizedFiles.reduce((acc, f) => acc + (f.originalSize || 0), 0),
          optimizedFiles.reduce((acc, f) => acc + (f.optimizedSize || 0), 0)
        )
        
        toast({
          title: "Upload concluído com otimização",
          description: `${filesToUpload.length} arquivo(s) enviado(s). ${stats.savedSize} economizados!`,
        })
      } else {
        toast({
          title: "Upload concluído",
          description: `${filesToUpload.length} arquivo(s) enviado(s) com sucesso.`,
        })
      }

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

  const getOptimizationBadge = (file: MediaFile) => {
    if (file.isOptimizing) {
      return (
        <Badge variant="secondary" className="text-xs">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Otimizando...
        </Badge>
      )
    }
    
    if (file.isOptimized && file.compressionRatio && file.compressionRatio > 0) {
      return (
        <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
          <Zap className="w-3 h-3 mr-1" />
          -{file.compressionRatio}%
        </Badge>
      )
    }
    
    return null
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging
            ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
            : "border-gray-300 dark:border-gray-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Suporta imagens (JPEG, PNG, GIF, WebP) e vídeos (MP4, WebM, MOV)
          </p>
          {autoOptimize && (
            <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Zap className="w-4 h-4" />
              Otimização automática ativada
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* File List */}
      {mediaFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Arquivos selecionados ({mediaFiles.length}/{maxFiles})
          </h4>
          {mediaFiles.map((file) => (
            <Card key={file.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="relative">
                    {file.preview ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {file.type === "image" ? (
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={file.preview}
                            className="w-full h-full object-cover"
                            muted
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.file.name}
                      </h5>
                      {getOptimizationBadge(file)}
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-4">
                        <span>Tamanho: {formatFileSize(file.file.size)}</span>
                        {file.originalSize && file.originalSize !== file.file.size && (
                          <span className="line-through text-gray-400">
                            {formatFileSize(file.originalSize)}
                          </span>
                        )}
                      </div>
                      
                      {file.dimensions && (
                        <span>
                          Dimensões: {file.dimensions.width} × {file.dimensions.height}
                        </span>
                      )}
                      
                      {file.duration && (
                        <span>Duração: {Math.round(file.duration)}s</span>
                      )}
                    </div>

                    {/* Upload Progress */}
                    {file.isUploading && (
                      <div className="mt-2">
                        <Progress value={file.uploadProgress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          Enviando... {file.uploadProgress}%
                        </p>
                      </div>
                    )}

                    {/* Error */}
                    {file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {file.isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={file.isUploading}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {mediaFiles.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={disabled || mediaFiles.some((f) => f.isUploading || f.error)}
          className="w-full"
        >
          {mediaFiles.some((f) => f.isUploading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Enviar {mediaFiles.length} arquivo(s)
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export default MediaUpload
