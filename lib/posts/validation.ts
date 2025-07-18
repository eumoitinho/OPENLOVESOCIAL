import { z } from 'zod'
import { 
  PostVisibility, 
  MediaType, 
  ReactionType, 
  PostType,
  POST_CONSTANTS 
} from '@/types/post'

// ===== SHARED SCHEMAS =====
const MediaFileSchema = z.object({
  url: z.string().url('URL da mídia inválida'),
  type: z.nativeEnum(MediaType),
  size: z.number().positive('Tamanho do arquivo deve ser positivo'),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  thumbnailUrl: z.string().url().optional(),
  altText: z.string().max(200, 'Texto alternativo deve ter no máximo 200 caracteres').optional(),
})

const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Latitude inválida'),
  longitude: z.number().min(-180).max(180, 'Longitude inválida'),
  name: z.string().min(1, 'Nome da localização é obrigatório').max(100, 'Nome muito longo'),
  city: z.string().max(50).optional(),
  state: z.string().max(50).optional(),
  country: z.string().max(50).optional(),
})

const PollOptionSchema = z.object({
  text: z.string()
    .min(1, 'Opção não pode estar vazia')
    .max(POST_CONSTANTS.MAX_POLL_OPTION_LENGTH, `Opção deve ter no máximo ${POST_CONSTANTS.MAX_POLL_OPTION_LENGTH} caracteres`),
})

const PollSchema = z.object({
  question: z.string()
    .min(1, 'Pergunta da enquete é obrigatória')
    .max(200, 'Pergunta deve ter no máximo 200 caracteres'),
  options: z.array(PollOptionSchema)
    .min(2, 'Enquete deve ter pelo menos 2 opções')
    .max(POST_CONSTANTS.MAX_POLL_OPTIONS, `Enquete pode ter no máximo ${POST_CONSTANTS.MAX_POLL_OPTIONS} opções`),
  allowMultipleVotes: z.boolean().default(false),
  expiresIn: z.number().positive().optional(), // hours
})

const EventDetailsSchema = z.object({
  title: z.string()
    .min(1, 'Título do evento é obrigatório')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  startDate: z.date().min(new Date(), 'Data de início deve ser no futuro'),
  endDate: z.date().optional(),
  location: LocationSchema.optional(),
  isOnline: z.boolean().default(false),
  maxAttendees: z.number().positive().max(10000, 'Máximo de 10.000 participantes').optional(),
}).refine(
  (data) => !data.endDate || data.endDate > data.startDate,
  {
    message: 'Data de término deve ser posterior à data de início',
    path: ['endDate'],
  }
)

// ===== POST SCHEMAS =====
export const PostCreateSchema = z.object({
  content: z.string()
    .min(1, 'Conteúdo do post é obrigatório')
    .max(POST_CONSTANTS.MAX_CONTENT_LENGTH, `Post deve ter no máximo ${POST_CONSTANTS.MAX_CONTENT_LENGTH} caracteres`),
  type: z.nativeEnum(PostType),
  visibility: z.nativeEnum(PostVisibility).default(PostVisibility.PUBLIC),
  media: z.array(MediaFileSchema)
    .max(POST_CONSTANTS.MAX_MEDIA_FILES, `Máximo de ${POST_CONSTANTS.MAX_MEDIA_FILES} arquivos de mídia`)
    .optional(),
  hashtags: z.array(z.string().regex(/^[a-zA-Z0-9_]+$/, 'Hashtag inválida'))
    .max(POST_CONSTANTS.MAX_HASHTAGS, `Máximo de ${POST_CONSTANTS.MAX_HASHTAGS} hashtags`)
    .optional(),
  mentions: z.array(z.string().uuid('ID de usuário inválido'))
    .max(POST_CONSTANTS.MAX_MENTIONS, `Máximo de ${POST_CONSTANTS.MAX_MENTIONS} menções`)
    .optional(),
  location: LocationSchema.optional(),
  poll: PollSchema.optional(),
  eventDetails: EventDetailsSchema.optional(),
  isPremiumContent: z.boolean().default(false),
  price: z.number().positive('Preço deve ser positivo').optional(),
}).refine(
  (data) => {
    // Se é conteúdo premium, preço é obrigatório
    if (data.isPremiumContent && !data.price) {
      return false
    }
    return true
  },
  {
    message: 'Preço é obrigatório para conteúdo premium',
    path: ['price'],
  }
).refine(
  (data) => {
    // Validar tamanho total dos arquivos de mídia
    if (data.media) {
      const totalSize = data.media.reduce((sum, file) => sum + file.size, 0)
      return totalSize <= POST_CONSTANTS.MAX_MEDIA_SIZE
    }
    return true
  },
  {
    message: `Tamanho total dos arquivos não pode exceder ${POST_CONSTANTS.MAX_MEDIA_SIZE / (1024 * 1024)}MB`,
    path: ['media'],
  }
)

export const PostUpdateSchema = PostCreateSchema.partial().omit(['type'])

// ===== COMMENT SCHEMAS =====
export const CommentCreateSchema = z.object({
  postId: z.string().uuid('ID do post inválido'),
  content: z.string()
    .min(1, 'Comentário não pode estar vazio')
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres'),
  parentId: z.string().uuid('ID do comentário pai inválido').optional(),
})

export const CommentUpdateSchema = z.object({
  content: z.string()
    .min(1, 'Comentário não pode estar vazio')
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres'),
})

// ===== ENGAGEMENT SCHEMAS =====
export const ReactionSchema = z.object({
  postId: z.string().uuid('ID do post inválido'),
  reaction: z.nativeEnum(ReactionType),
})

export const SavePostSchema = z.object({
  postId: z.string().uuid('ID do post inválido'),
})

// ===== QUERY SCHEMAS =====
export const PostsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.number()
    .positive()
    .max(100, 'Limite máximo de 100 posts por página')
    .default(POST_CONSTANTS.DEFAULT_POSTS_LIMIT),
  userId: z.string().uuid().optional(),
  visibility: z.array(z.nativeEnum(PostVisibility)).optional(),
  type: z.array(z.nativeEnum(PostType)).optional(),
  hasMedia: z.boolean().optional(),
  hashtag: z.string().regex(/^[a-zA-Z0-9_]+$/, 'Hashtag inválida').optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().positive().max(1000, 'Raio máximo de 1000km'),
  }).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(['created_at', 'engagement', 'trending']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).refine(
  (data) => !data.dateTo || !data.dateFrom || data.dateTo >= data.dateFrom,
  {
    message: 'Data final deve ser posterior à data inicial',
    path: ['dateTo'],
  }
)

export const CommentsQuerySchema = z.object({
  postId: z.string().uuid('ID do post inválido'),
  cursor: z.string().optional(),
  limit: z.number()
    .positive()
    .max(50, 'Limite máximo de 50 comentários por página')
    .default(POST_CONSTANTS.DEFAULT_COMMENTS_LIMIT),
  sortBy: z.enum(['created_at', 'likes']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  includeReplies: z.boolean().default(true),
})

// ===== FILE UPLOAD SCHEMAS =====
export const FileUploadSchema = z.object({
  file: z.instanceof(File, 'Arquivo inválido'),
  type: z.nativeEnum(MediaType),
}).refine(
  (data) => {
    // Validar tipo de arquivo baseado na extensão
    const fileName = data.file.name.toLowerCase()
    const fileType = data.type
    
    switch (fileType) {
      case MediaType.IMAGE:
        return /\.(jpg|jpeg|png|gif|webp|avif)$/.test(fileName)
      case MediaType.VIDEO:
        return /\.(mp4|webm|mov|avi)$/.test(fileName)
      case MediaType.AUDIO:
        return /\.(mp3|wav|ogg|m4a)$/.test(fileName)
      case MediaType.DOCUMENT:
        return /\.(pdf|doc|docx|txt)$/.test(fileName)
      default:
        return false
    }
  },
  {
    message: 'Tipo de arquivo não suportado',
    path: ['file'],
  }
).refine(
  (data) => data.file.size <= POST_CONSTANTS.MAX_MEDIA_SIZE,
  {
    message: `Arquivo deve ter no máximo ${POST_CONSTANTS.MAX_MEDIA_SIZE / (1024 * 1024)}MB`,
    path: ['file'],
  }
)

// ===== FORM VALIDATION SCHEMAS =====
export const PostFormSchema = z.object({
  content: z.string()
    .min(1, 'Conteúdo do post é obrigatório')
    .max(POST_CONSTANTS.MAX_CONTENT_LENGTH, `Post deve ter no máximo ${POST_CONSTANTS.MAX_CONTENT_LENGTH} caracteres`),
  visibility: z.nativeEnum(PostVisibility).default(PostVisibility.PUBLIC),
  media: z.array(z.instanceof(File)).max(POST_CONSTANTS.MAX_MEDIA_FILES).optional(),
  location: LocationSchema.optional(),
  poll: z.object({
    question: z.string().min(1, 'Pergunta da enquete é obrigatória'),
    options: z.array(z.string().min(1, 'Opção não pode estar vazia'))
      .min(2, 'Enquete deve ter pelo menos 2 opções')
      .max(POST_CONSTANTS.MAX_POLL_OPTIONS),
    allowMultipleVotes: z.boolean().default(false),
    expiresIn: z.number().positive().optional(),
  }).optional(),
  eventDetails: EventDetailsSchema.optional(),
  isPremiumContent: z.boolean().default(false),
  price: z.number().positive().optional(),
})

// ===== VALIDATION UTILITIES =====
export function validatePost(data: unknown) {
  return PostCreateSchema.safeParse(data)
}

export function validateComment(data: unknown) {
  return CommentCreateSchema.safeParse(data)
}

export function validatePostsQuery(data: unknown) {
  return PostsQuerySchema.safeParse(data)
}

export function validateFileUpload(file: File, type: MediaType) {
  return FileUploadSchema.safeParse({ file, type })
}

// ===== ERROR FORMATTING =====
export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {}
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.')
    formattedErrors[path] = error.message
  })
  
  return formattedErrors
}

// ===== CONTENT VALIDATION =====
export function validateHashtags(content: string): string[] {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g
  const hashtags: string[] = []
  let match

  while ((match = hashtagRegex.exec(content)) !== null) {
    const hashtag = match[1]
    if (hashtag.length <= 50 && !hashtags.includes(hashtag)) {
      hashtags.push(hashtag)
    }
  }

  return hashtags.slice(0, POST_CONSTANTS.MAX_HASHTAGS)
}

export function validateMentions(content: string, userIds: string[]): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1]
    // In a real app, you'd resolve usernames to user IDs
    // For now, we'll assume userIds array contains valid IDs
    if (userIds.includes(username) && !mentions.includes(username)) {
      mentions.push(username)
    }
  }

  return mentions.slice(0, POST_CONSTANTS.MAX_MENTIONS)
}

export function sanitizeContent(content: string): string {
  // Remove potentially dangerous HTML/script tags
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

// ===== TYPE EXPORTS =====
export type PostCreateInput = z.infer<typeof PostCreateSchema>
export type PostUpdateInput = z.infer<typeof PostUpdateSchema>
export type CommentCreateInput = z.infer<typeof CommentCreateSchema>
export type CommentUpdateInput = z.infer<typeof CommentUpdateSchema>
export type PostsQueryInput = z.infer<typeof PostsQuerySchema>
export type CommentsQueryInput = z.infer<typeof CommentsQuerySchema>
export type PostFormInput = z.infer<typeof PostFormSchema>