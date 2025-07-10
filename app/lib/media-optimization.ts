// Configurações de otimização para rede social
export const MEDIA_OPTIMIZATION_CONFIG = {
  // Imagens
  images: {
    // Dimensões máximas para diferentes tipos de uso
    profile: {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.85,
      format: 'webp' as const
    },
    post: {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: 'webp' as const
    },
    story: {
      maxWidth: 1080,
      maxHeight: 1920,
      quality: 0.75,
      format: 'webp' as const
    },
    thumbnail: {
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.7,
      format: 'webp' as const
    }
  },
  
  // Vídeos
  videos: {
    // Configurações para diferentes tipos de vídeo
    story: {
      maxWidth: 720,
      maxHeight: 1280,
      maxDuration: 15, // 15 segundos para stories
      maxBitrate: 1500000, // 1.5Mbps
      format: 'mp4' as const
    },
    post: {
      maxWidth: 1280,
      maxHeight: 720,
      maxDuration: 60, // 60 segundos para posts
      maxBitrate: 2000000, // 2Mbps
      format: 'mp4' as const
    },
    profile: {
      maxWidth: 480,
      maxHeight: 480,
      maxDuration: 30, // 30 segundos para vídeos de perfil
      maxBitrate: 1000000, // 1Mbps
      format: 'mp4' as const
    }
  },
  
  // Limites gerais
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
    maxFilesPerUpload: 10
  }
}

// Tipos de mídia suportados
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
]

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/avi'
]

// Função para validar arquivo de mídia
export function validateMediaFile(file: File): { 
  isValid: boolean
  error?: string
  type: 'image' | 'video' | 'unsupported'
} {
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type)
  const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type)
  
  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP, GIF, MP4, WebM ou MOV.',
      type: 'unsupported'
    }
  }
  
  const maxSize = isImage ? MEDIA_OPTIMIZATION_CONFIG.limits.maxImageSize : MEDIA_OPTIMIZATION_CONFIG.limits.maxVideoSize
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${formatFileSize(maxSize)}.`,
      type: isImage ? 'image' : 'video'
    }
  }
  
  return {
    isValid: true,
    type: isImage ? 'image' : 'video'
  }
}

// Função para formatar tamanho de arquivo
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Função para otimizar imagem
export async function optimizeImage(
  file: File,
  config: keyof typeof MEDIA_OPTIMIZATION_CONFIG.images = 'post'
): Promise<{
  blob: Blob
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  dimensions: { width: number; height: number }
}> {
  const settings = MEDIA_OPTIMIZATION_CONFIG.images[config]
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      try {
        // Calcular novas dimensões mantendo proporção
        const { width, height } = calculateDimensions(
          img.naturalWidth,
          img.naturalHeight,
          settings.maxWidth,
          settings.maxHeight
        )
        
        // Configurar canvas
        canvas.width = width
        canvas.height = height
        
        // Aplicar suavização para melhor qualidade
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
        }
        
        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Converter para blob com qualidade otimizada
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao criar blob otimizado'))
              return
            }
            
            const originalSize = file.size
            const optimizedSize = blob.size
            const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100
            
            resolve({
              blob,
              originalSize,
              optimizedSize,
              compressionRatio,
              dimensions: { width, height }
            })
          },
          `image/${settings.format}`,
          settings.quality
        )
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => reject(new Error('Falha ao carregar imagem'))
    img.src = URL.createObjectURL(file)
  })
}

// Função para otimizar vídeo (simplificada - em produção usar FFmpeg.wasm)
export async function optimizeVideo(
  file: File,
  config: keyof typeof MEDIA_OPTIMIZATION_CONFIG.videos = 'post'
): Promise<{
  blob: Blob
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  duration: number
  dimensions: { width: number; height: number }
}> {
  const settings = MEDIA_OPTIMIZATION_CONFIG.videos[config]
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    
    video.onloadedmetadata = () => {
      try {
        // Verificar duração
        if (video.duration > settings.maxDuration) {
          reject(new Error(`Vídeo muito longo. Máximo: ${settings.maxDuration}s`))
          return
        }
        
        // Verificar dimensões
        const { width, height } = calculateDimensions(
          video.videoWidth,
          video.videoHeight,
          settings.maxWidth,
          settings.maxHeight
        )
        
        // Calcular bitrate atual
        const currentBitrate = (file.size * 8) / video.duration
        
        // Se o vídeo já está dentro dos limites, retornar como está
        if (currentBitrate <= settings.maxBitrate && 
            video.videoWidth <= settings.maxWidth && 
            video.videoHeight <= settings.maxHeight) {
          resolve({
            blob: file,
            originalSize: file.size,
            optimizedSize: file.size,
            compressionRatio: 0,
            duration: video.duration,
            dimensions: { width: video.videoWidth, height: video.videoHeight }
          })
          return
        }
        
        // Em produção, aqui você usaria FFmpeg.wasm para compressão real
        // Por enquanto, vamos apenas validar e retornar o arquivo original
        console.warn('Compressão de vídeo requer FFmpeg.wasm - retornando arquivo original')
        
        resolve({
          blob: file,
          originalSize: file.size,
          optimizedSize: file.size,
          compressionRatio: 0,
          duration: video.duration,
          dimensions: { width: video.videoWidth, height: video.videoHeight }
        })
      } catch (error) {
        reject(error)
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Falha ao carregar vídeo'))
    }
    
    video.src = url
  })
}

// Função auxiliar para calcular dimensões mantendo proporção
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight }
  
  // Redimensionar se exceder largura máxima
  if (width > maxWidth) {
    height = (height * maxWidth) / width
    width = maxWidth
  }
  
  // Redimensionar se exceder altura máxima
  if (height > maxHeight) {
    width = (width * maxHeight) / height
    height = maxHeight
  }
  
  return { width: Math.round(width), height: Math.round(height) }
}

// Função para detectar se arquivo precisa de otimização
export function needsOptimization(file: File): boolean {
  const validation = validateMediaFile(file)
  if (!validation.isValid) return false
  
  // Se o arquivo é maior que 2MB, precisa de otimização
  const threshold = 2 * 1024 * 1024 // 2MB
  return file.size > threshold
}

// Função para obter estatísticas de otimização
export function getOptimizationStats(originalSize: number, optimizedSize: number) {
  const savedBytes = originalSize - optimizedSize
  const savedMB = savedBytes / (1024 * 1024)
  const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100
  
  return {
    originalSize: formatFileSize(originalSize),
    optimizedSize: formatFileSize(optimizedSize),
    savedSize: formatFileSize(savedBytes),
    savedMB: parseFloat(savedMB.toFixed(2)),
    compressionRatio: Math.round(compressionRatio)
  }
}

// Função para criar thumbnail de imagem
export async function createImageThumbnail(
  file: File,
  width: number = 300,
  height: number = 300
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      try {
        canvas.width = width
        canvas.height = height
        
        // Calcular dimensões para crop central
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
        const scaledWidth = img.naturalWidth * scale
        const scaledHeight = img.naturalHeight * scale
        const x = (width - scaledWidth) / 2
        const y = (height - scaledHeight) / 2
        
        ctx?.drawImage(img, x, y, scaledWidth, scaledHeight)
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Falha ao criar thumbnail'))
          },
          'image/webp',
          0.7
        )
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => reject(new Error('Falha ao carregar imagem'))
    img.src = URL.createObjectURL(file)
  })
}

// Função para validar e otimizar arquivo automaticamente
export async function validateAndOptimizeFile(
  file: File,
  mediaType: 'image' | 'video' = 'image',
  config?: string
): Promise<{
  file: File
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  needsOptimization: boolean
  dimensions?: { width: number; height: number }
  duration?: number
}> {
  const validation = validateMediaFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }
  
  const originalSize = file.size
  let optimizedFile: File = file
  let optimizedSize = originalSize
  let compressionRatio = 0
  let needsOptimization = false
  let dimensions: { width: number; height: number } | undefined
  let duration: number | undefined
  
  // Otimizar imagem
  if (mediaType === 'image' || validation.type === 'image') {
    try {
      const imageConfig = config as keyof typeof MEDIA_OPTIMIZATION_CONFIG.images || 'post'
      const result = await optimizeImage(file, imageConfig)
      
      optimizedFile = new File([result.blob], file.name, {
        type: result.blob.type,
        lastModified: Date.now()
      })
      optimizedSize = result.optimizedSize
      compressionRatio = result.compressionRatio
      needsOptimization = compressionRatio > 0
      dimensions = result.dimensions
    } catch (error) {
      console.warn('Falha na otimização de imagem:', error)
    }
  }
  
  // Otimizar vídeo
  if (mediaType === 'video' || validation.type === 'video') {
    try {
      const videoConfig = config as keyof typeof MEDIA_OPTIMIZATION_CONFIG.videos || 'post'
      const result = await optimizeVideo(file, videoConfig)
      
      optimizedFile = new File([result.blob], file.name, {
        type: result.blob.type,
        lastModified: Date.now()
      })
      optimizedSize = result.optimizedSize
      compressionRatio = result.compressionRatio
      needsOptimization = compressionRatio > 0
      dimensions = result.dimensions
      duration = result.duration
    } catch (error) {
      console.warn('Falha na otimização de vídeo:', error)
    }
  }
  
  return {
    file: optimizedFile,
    originalSize,
    optimizedSize,
    compressionRatio,
    needsOptimization,
    dimensions,
    duration
  }
} 