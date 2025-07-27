import { useState, useCallback } from "react"
import { 
  validateAndOptimizeFile, 
  getOptimizationStats, 
  needsOptimization,
  MEDIA_OPTIMIZATION_CONFIG 
} from '../lib/media-optimization'

interface OptimizedFile {
  id: string
  originalFile: File
  optimizedFile: File
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  type: 'image' | 'video'
  preview?: string
  dimensions?: { width: number; height: number }
  duration?: number
  isOptimizing: boolean
  error?: string
}

interface UseOptimizedUploadOptions {
  maxFiles?: number
  autoOptimize?: boolean
  imageConfig?: keyof typeof MEDIA_OPTIMIZATION_CONFIG.images
  videoConfig?: keyof typeof MEDIA_OPTIMIZATION_CONFIG.videos
  onProgress?: (progress: number) => void
  onComplete?: (files: OptimizedFile[]) => void
  onError?: (error: string) => void
}

export function useOptimizedUpload(options: UseOptimizedUploadOptions = {}) {
  const {
    maxFiles = MEDIA_OPTIMIZATION_CONFIG.limits.maxFilesPerUpload,
    autoOptimize = true,
    imageConfig = 'post',
    videoConfig = 'post',
    onProgress,
    onComplete,
    onError
  } = options

  const [files, setFiles] = useState<OptimizedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)

  // Função para criar preview
  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }, [])

  // Função para processar um arquivo
  const processFile = useCallback(async (file: File): Promise<OptimizedFile> => {
    const id = Math.random().toString(36).substr(2, 9)
    const type = file.type.startsWith('image/') ? 'image' : 'video'
    
    // Adicionar arquivo à lista com status de processamento
    const newFile: OptimizedFile = {
      id,
      originalFile: file,
      optimizedFile: file,
      originalSize: file.size,
      optimizedSize: file.size,
      compressionRatio: 0,
      type,
      isOptimizing: true
    }

    setFiles(prev => [...prev, newFile])

    try {
      // Criar preview
      newFile.preview = await createPreview(file)

      // Otimizar se necessário
      if (autoOptimize && needsOptimization(file)) {
        const config = type === 'image' ? imageConfig : videoConfig
        const result = await validateAndOptimizeFile(file, type, config)
        
        newFile.optimizedFile = result.file
        newFile.optimizedSize = result.optimizedSize
        newFile.compressionRatio = result.compressionRatio
        newFile.dimensions = result.dimensions
        newFile.duration = result.duration
        
        // Atualizar preview se a otimização mudou o arquivo
        if (result.needsOptimization) {
          newFile.preview = await createPreview(result.file)
        }
      }

      newFile.isOptimizing = false
      
      // Atualizar arquivo na lista
      setFiles(prev => prev.map(f => f.id === id ? newFile : f))
      
      return newFile
    } catch (error) {
      newFile.isOptimizing = false
      newFile.error = error instanceof Error ? error.message : 'Erro desconhecido'
      
      setFiles(prev => prev.map(f => f.id === id ? newFile : f))
      throw error
    }
  }, [autoOptimize, imageConfig, videoConfig, createPreview])

  // Função para adicionar arquivos
  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList)
    
    if (files.length + fileArray.length > maxFiles) {
      const error = `Limite de ${maxFiles} arquivos excedido`
      onError?.(error)
      return
    }

    setIsProcessing(true)
    setOverallProgress(0)

    try {
      const processedFiles: OptimizedFile[] = []
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        
        try {
          const processedFile = await processFile(file)
          processedFiles.push(processedFile)
          
          // Atualizar progresso
          const progress = ((i + 1) / fileArray.length) * 100
          setOverallProgress(progress)
          onProgress?.(progress)
        } catch (error) {
          console.error(`Erro ao processar arquivo ${file.name}:`, error)
          // Continuar com outros arquivos
        }
      }

      onComplete?.(processedFiles)
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Erro ao processar arquivos')
    } finally {
      setIsProcessing(false)
      setOverallProgress(0)
    }
  }, [files.length, maxFiles, processFile, onProgress, onComplete, onError])

  // Função para remover arquivo
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  // Função para limpar todos os arquivos
  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  // Função para obter estatísticas gerais
  const getStats = useCallback(() => {
    const optimizedFiles = files.filter(f => f.compressionRatio > 0)
    
    if (optimizedFiles.length === 0) {
      return {
        totalFiles: files.length,
        totalSize: files.reduce((acc, f) => acc + f.originalSize, 0),
        optimizedFiles: 0,
        savedSize: 0,
        averageCompression: 0
      }
    }

    const totalOriginalSize = files.reduce((acc, f) => acc + f.originalSize, 0)
    const totalOptimizedSize = files.reduce((acc, f) => acc + f.optimizedSize, 0)
    const savedSize = totalOriginalSize - totalOptimizedSize
    const averageCompression = optimizedFiles.reduce((acc, f) => acc + f.compressionRatio, 0) / optimizedFiles.length

    return {
      totalFiles: files.length,
      totalSize: totalOriginalSize,
      optimizedFiles: optimizedFiles.length,
      savedSize,
      averageCompression: Math.round(averageCompression)
    }
  }, [files])

  // Função para obter arquivos otimizados para upload
  const getOptimizedFiles = useCallback(() => {
    return files.map(f => f.optimizedFile)
  }, [files])

  return {
    files,
    isProcessing,
    overallProgress,
    addFiles,
    removeFile,
    clearFiles,
    getStats,
    getOptimizedFiles
  }
} 
