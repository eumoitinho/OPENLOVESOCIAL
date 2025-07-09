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
