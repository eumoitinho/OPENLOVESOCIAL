export function validateMediaFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ]

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Tipo de arquivo não suportado. Use JPEG, PNG, GIF, WebP, MP4, WebM ou MOV.",
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "Arquivo muito grande. Tamanho máximo: 10MB.",
    }
  }

  return { isValid: true }
}

export function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split(".").pop()
  return `${userId}_${timestamp}_${randomString}.${extension}`
}

export function getMediaUrl(path: string): string {
  if (!path) return ""

  // If it's already a full URL, return as is
  if (path.startsWith("http")) return path

  // If it's a Supabase storage path, construct the full URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && path.startsWith("media/")) {
    return `${supabaseUrl}/storage/v1/object/public/${path}`
  }

  return path
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"))
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }

    img.src = url
  })
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("video/")) {
      reject(new Error("File is not a video"))
      return
    }

    const video = document.createElement("video")
    const url = URL.createObjectURL(file)

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(video.duration)
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load video"))
    }

    video.src = url
  })
}

// ===== NOVAS FUNÇÕES DE OTIMIZAÇÃO =====

// Configurações de otimização
export const OPTIMIZATION_CONFIG = {
  // Imagens
  image: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8, // 80% de qualidade
    format: 'webp' as const, // Formato mais eficiente
    thumbnail: {
      width: 300,
      height: 300,
      quality: 0.7
    }
  },
  // Vídeos
  video: {
    maxWidth: 1280,
    maxHeight: 720,
    maxDuration: 60, // 60 segundos máximo
    maxBitrate: 2000000, // 2Mbps
    format: 'mp4' as const
  }
}

// Função para redimensionar e comprimir imagens
export async function optimizeImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  } = {}
): Promise<{ blob: Blob; originalSize: number; optimizedSize: number; compressionRatio: number }> {
  const config = { ...OPTIMIZATION_CONFIG.image, ...options }
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      try {
        // Calcular novas dimensões mantendo proporção
        const { width, height } = calculateDimensions(
          img.width,
          img.height,
          config.maxWidth,
          config.maxHeight
        )
        
        // Configurar canvas
        canvas.width = width
        canvas.height = height
        
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
              compressionRatio
            })
          },
          `image/${config.format}`,
          config.quality
        )
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => reject(new Error('Falha ao carregar imagem'))
    img.src = URL.createObjectURL(file)
  })
}

// Função para criar thumbnail de imagem
export async function createImageThumbnail(
  file: File,
  width: number = OPTIMIZATION_CONFIG.image.thumbnail.width,
  height: number = OPTIMIZATION_CONFIG.image.thumbnail.height
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
        const scale = Math.max(width / img.width, height / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const x = (width - scaledWidth) / 2
        const y = (height - scaledHeight) / 2
        
        ctx?.drawImage(img, x, y, scaledWidth, scaledHeight)
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Falha ao criar thumbnail'))
          },
          'image/webp',
          OPTIMIZATION_CONFIG.image.thumbnail.quality
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
  options: {
    maxWidth?: number
    maxHeight?: number
    maxDuration?: number
    maxBitrate?: number
  } = {}
): Promise<{ blob: Blob; originalSize: number; optimizedSize: number; compressionRatio: number }> {
  const config = { ...OPTIMIZATION_CONFIG.video, ...options }
  
  // Para vídeos, vamos fazer validações básicas
  // Em produção, você deve usar FFmpeg.wasm para compressão real
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    
    video.onloadedmetadata = async () => {
      try {
        // Verificar duração
        if (video.duration > config.maxDuration) {
          reject(new Error(`Vídeo muito longo. Máximo: ${config.maxDuration}s`))
          return
        }
        
        // Verificar dimensões
        const { width, height } = calculateDimensions(
          video.videoWidth,
          video.videoHeight,
          config.maxWidth,
          config.maxHeight
        )
        
        // Se o vídeo já está dentro dos limites, retornar como está
        if (file.size <= config.maxBitrate * video.duration / 8) {
          resolve({
            blob: file,
            originalSize: file.size,
            optimizedSize: file.size,
            compressionRatio: 0
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
          compressionRatio: 0
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

// Função para detectar se o arquivo precisa de otimização
export function needsOptimization(file: File): boolean {
  const maxSize = 2 * 1024 * 1024 // 2MB
  
  // Se o arquivo é maior que 2MB, precisa de otimização
  if (file.size > maxSize) return true
  
  return false
}

// Função assíncrona para detectar se imagem precisa de redimensionamento
export async function needsImageResize(file: File): Promise<boolean> {
  if (!file.type.startsWith('image/')) return false
  
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const needsResize = img.width > OPTIMIZATION_CONFIG.image.maxWidth || 
                         img.height > OPTIMIZATION_CONFIG.image.maxHeight
      resolve(needsResize)
    }
    img.onerror = () => resolve(false)
    img.src = URL.createObjectURL(file)
  })
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
    savedMB,
    compressionRatio: Math.round(compressionRatio)
  }
}

// Função para validar e otimizar arquivo automaticamente
export async function validateAndOptimizeFile(file: File): Promise<{
  file: File | Blob
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  needsOptimization: boolean
}> {
  const validation = validateMediaFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }
  
  const originalSize = file.size
  let optimizedFile: File | Blob = file
  let optimizedSize = originalSize
  let compressionRatio = 0
  let needsOptimization = false
  
  // Otimizar imagem
  if (file.type.startsWith('image/')) {
    try {
      const result = await optimizeImage(file)
      optimizedFile = result.blob
      optimizedSize = result.optimizedSize
      compressionRatio = result.compressionRatio
      needsOptimization = compressionRatio > 0
    } catch (error) {
      console.warn('Falha na otimização de imagem:', error)
    }
  }
  
  // Otimizar vídeo
  if (file.type.startsWith('video/')) {
    try {
      const result = await optimizeVideo(file)
      optimizedFile = result.blob
      optimizedSize = result.optimizedSize
      compressionRatio = result.compressionRatio
      needsOptimization = compressionRatio > 0
    } catch (error) {
      console.warn('Falha na otimização de vídeo:', error)
    }
  }
  
  return {
    file: optimizedFile,
    originalSize,
    optimizedSize,
    compressionRatio,
    needsOptimization
  }
}
