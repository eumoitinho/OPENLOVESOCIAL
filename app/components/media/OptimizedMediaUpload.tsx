"use client"

import React, { useState } from 'react'
import { Upload, X, ImageIcon, Video, File, Loader2, Zap, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import { useOptimizedUpload } from '@/hooks/use-optimized-upload'
import { formatFileSize } from '@/lib/media-optimization'

interface OptimizedMediaUploadProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  disabled?: boolean
  autoOptimize?: boolean
  showStats?: boolean
}

export default function OptimizedMediaUpload({
  onUpload,
  maxFiles = 10,
  disabled = false,
  autoOptimize = true,
  showStats = true
}: OptimizedMediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    files,
    isProcessing,
    overallProgress,
    addFiles,
    removeFile,
    clearFiles,
    getStats,
    getOptimizedFiles
  } = useOptimizedUpload({
    maxFiles,
    autoOptimize,
    onProgress: (progress) => {
      console.log('Processamento:', progress)
    },
    onComplete: (processedFiles) => {
      const optimizedCount = processedFiles.filter(f => f.compressionRatio > 0).length
      if (optimizedCount > 0) {
        toast({
          title: 'Otimização concluída',
          description: `${optimizedCount} arquivo(s) otimizado(s) automaticamente!`,
        })
      }
    },
    onError: (error) => {
      toast({
        title: 'Erro na otimização',
        description: error,
        variant: 'destructive'
      })
    }
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      addFiles(fileList)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const fileList = event.dataTransfer.files
    if (fileList) {
      addFiles(fileList)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    let progressInterval: NodeJS.Timeout | null = null

    try {
      const optimizedFiles = getOptimizedFiles()
      
      // Simular progresso de upload
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) {
              clearInterval(progressInterval)
              progressInterval = null
            }
            return prev
          }
          return prev + 10
        })
      }, 200)

      await onUpload(optimizedFiles)

      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      setUploadProgress(100)

      // Mostrar estatísticas finais
      const stats = getStats()
      if (stats.optimizedFiles > 0) {
        toast({
          title: 'Upload concluído com otimização',
          description: `${stats.totalFiles} arquivo(s) enviado(s). ${formatFileSize(stats.savedSize)} economizados!`,
        })
      } else {
        toast({
          title: 'Upload concluído',
          description: `${stats.totalFiles} arquivo(s) enviado(s) com sucesso.`,
        })
      }

      // Limpar arquivos após upload
      setTimeout(() => {
        clearFiles()
        setIsUploading(false)
        setUploadProgress(0)
      }, 2000)

    } catch (error) {
      // Limpar interval em caso de erro
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      
      setIsUploading(false)
      setUploadProgress(0)
      toast({
        title: 'Erro no upload',
        description: 'Ocorreu um erro ao enviar os arquivos. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-6 w-6" />
      case 'video':
        return <Video className="h-6 w-6" />
      default:
        return <File className="h-6 w-6" />
    }
  }

  const getOptimizationBadge = (file: any) => {
    if (file.isOptimizing) {
      return (
        <Badge variant="secondary" className="text-xs">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Otimizando...
        </Badge>
      )
    }
    
    if (file.compressionRatio > 0) {
      return (
        <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
          <Zap className="w-3 h-3 mr-1" />
          -{file.compressionRatio}%
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline" className="text-xs">
        <CheckCircle className="w-3 h-3 mr-1" />
        Otimizado
      </Badge>
    )
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-pink-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <CardContent className="p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Suporta imagens (JPEG, PNG, WebP, GIF) e vídeos (MP4, WebM, MOV)
          </p>
          {autoOptimize && (
            <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Zap className="w-4 h-4" />
              Otimização automática ativada
            </div>
          )}
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {showStats && files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estatísticas de Otimização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total de arquivos</p>
                <p className="font-semibold">{stats.totalFiles}</p>
              </div>
              <div>
                <p className="text-gray-500">Tamanho original</p>
                <p className="font-semibold">{formatFileSize(stats.totalSize)}</p>
              </div>
              <div>
                <p className="text-gray-500">Arquivos otimizados</p>
                <p className="font-semibold text-green-600">{stats.optimizedFiles}</p>
              </div>
              <div>
                <p className="text-gray-500">Espaço economizado</p>
                <p className="font-semibold text-green-600">{formatFileSize(stats.savedSize)}</p>
              </div>
            </div>
            {stats.optimizedFiles > 0 && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Média de compressão: {stats.averageCompression}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progresso de Processamento */}
      {isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Processando arquivos...</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">{Math.round(overallProgress)}% concluído</p>
          </CardContent>
        </Card>
      )}

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Arquivos selecionados ({files.length}/{maxFiles})
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFiles}
              disabled={isUploading}
            >
              Limpar todos
            </Button>
          </div>
          
          {files.map((file) => (
            <Card key={file.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="relative">
                    {file.preview ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {file.type === 'image' ? (
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

                  {/* Informações do Arquivo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.originalFile.name}
                      </h5>
                      {getOptimizationBadge(file)}
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-4">
                        <span>Tamanho: {formatFileSize(file.optimizedFile.size)}</span>
                        {file.originalSize !== file.optimizedSize && (
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

                    {/* Progresso de Upload */}
                    {isUploading && (
                      <div className="mt-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          Enviando... {uploadProgress}%
                        </p>
                      </div>
                    )}

                    {/* Erro */}
                    {file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={isUploading}
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

      {/* Botão de Upload */}
      {files.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={disabled || isUploading || isProcessing}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Enviar {files.length} arquivo(s) otimizado(s)
            </>
          )}
        </Button>
      )}

      {/* Dicas de Otimização */}
      {autoOptimize && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Dicas de otimização:</strong> Imagens são automaticamente redimensionadas para máximo 1200px e convertidas para WebP. 
            Vídeos são limitados a 60 segundos e 2Mbps. Isso garante carregamento rápido e economia de dados.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 