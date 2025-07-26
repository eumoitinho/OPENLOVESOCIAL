"use client"

import { useState, useRef } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input, Textarea, Select, SelectItem, Chip } from '@heroui/react'
import { 
  Users,
  Upload,
  X,
  Globe,
  Lock,
  Crown,
  Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { useCanAccess } from '@/lib/plans/hooks'
import LocationPicker from '../location/LocationPicker'
import PremiumLockBadge from '@/app/components/premium/PremiumLockBadge'

interface CreateCommunityProps {
  onClose: () => void
  onCommunityCreated: (community: any) => void
}

interface CommunityFormData {
  name: string
  description: string
  category: string
  type: 'public' | 'private' | 'premium'
  location_name?: string
  location_address?: string
  latitude?: number
  longitude?: number
  tags: string[]
  cover_image?: File
  avatar_image?: File
  rules: string
}

const COMMUNITY_CATEGORIES = [
  'Tecnologia', 'Arte', 'Música', 'Esporte', 'Culinária', 'Viagem',
  'Negócios', 'Educação', 'Saúde', 'Fitness', 'Gaming', 'Fotografia',
  'Literatura', 'Cinema', 'Moda', 'Lifestyle', 'Outro'
]

export default function CreateCommunity({ onClose, onCommunityCreated }: CreateCommunityProps) {
  const { user } = useAuth()
  const canAccess = useCanAccess()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    description: '',
    category: '',
    type: 'public',
    tags: [],
    rules: ''
  })
  
  const [currentTag, setCurrentTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [monthlyUsage, setMonthlyUsage] = useState({ used: 0, limit: 0 })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  // Carregar uso mensal ao abrir
  useState(() => {
    if (user) {
      fetchMonthlyUsage()
    }
  })

  const fetchMonthlyUsage = async () => {
    try {
      const response = await fetch('/api/users/monthly-limits?type=communities')
      if (response.ok) {
        const data = await response.json()
        setMonthlyUsage(data)
      }
    } catch (error) {
      console.error('Erro ao carregar uso mensal:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validações básicas
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória'
    if (!formData.category) newErrors.category = 'Categoria é obrigatória'

    // Validar tipo premium
    if (formData.type === 'premium' && canAccess.plan !== 'diamond') {
      newErrors.type = 'Comunidades premium requerem plano Diamante'
    }

    // Validar limites por plano
    if (monthlyUsage.used >= monthlyUsage.limit) {
      newErrors.general = `Limite mensal atingido (${monthlyUsage.limit} comunidades por mês)`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = (type: 'avatar' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo e tamanho
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, [`${type}_image`]: 'Apenas imagens são permitidas' })
        return
      }
      
      const maxSize = type === 'avatar' ? 2 * 1024 * 1024 : 5 * 1024 * 1024 // 2MB avatar, 5MB cover
      if (file.size > maxSize) {
        setErrors({ ...errors, [`${type}_image`]: `Imagem deve ter menos de ${maxSize / (1024 * 1024)}MB` })
        return
      }
      
      // Atualizar formData
      setFormData({ ...formData, [`${type}_image`]: file })
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        if (type === 'avatar') {
          setAvatarPreview(e.target?.result as string)
        } else {
          setCoverPreview(e.target?.result as string)
        }
      }
      reader.readAsDataURL(file)
      
      // Limpar erro
      setErrors({ ...errors, [`${type}_image`]: '' })
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      })
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Upload das imagens se selecionadas
      let avatarUrl = ''
      let coverUrl = ''
      
      if (formData.avatar_image) {
        const avatarFormData = new FormData()
        avatarFormData.append('file', formData.avatar_image)
        avatarFormData.append('type', 'community_avatar')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: avatarFormData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          avatarUrl = uploadData.url
        }
      }

      if (formData.cover_image) {
        const coverFormData = new FormData()
        coverFormData.append('file', formData.cover_image)
        coverFormData.append('type', 'community_cover')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: coverFormData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          coverUrl = uploadData.url
        }
      }

      // Criar comunidade
      const communityData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        location_name: formData.location_name,
        location_address: formData.location_address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        tags: formData.tags,
        rules: formData.rules,
        avatar_url: avatarUrl,
        cover_image_url: coverUrl
      }

      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(communityData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar comunidade')
      }

      const newCommunity = await response.json()
      onCommunityCreated(newCommunity)
    } catch (error) {
      console.error('Erro ao criar comunidade:', error)
      setErrors({ general: error instanceof Error ? error.message : 'Erro inesperado' })
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'public':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'private':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'premium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Globe className="w-4 h-4" />
      case 'private':
        return <Lock className="w-4 h-4" />
      case 'premium':
        return <Crown className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Criar Comunidade
          </DialogTitle>
        </DialogHeader>

        {/* Limitações de plano */}
        {monthlyUsage.limit > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              Comunidades criadas este mês: {monthlyUsage.used}/{monthlyUsage.limit}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Informações básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Comunidade *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Desenvolvedores React"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva sua comunidade e o que os membros podem esperar..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNITY_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Imagens */}
          <div className="grid grid-cols-2 gap-4">
            {/* Avatar */}
            <div>
              <Label>Avatar da Comunidade</Label>
              <div className="mt-2">
                {avatarPreview ? (
                  <div className="relative">
                    <img 
                      src={avatarPreview} 
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...formData, avatar_image: undefined })
                        setAvatarPreview(null)
                      }}
                      className="absolute top-0 right-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-full h-20 border-dashed"
                  >
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                      <p className="text-xs text-gray-600">Avatar</p>
                    </div>
                  </Button>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('avatar', e)}
                  className="hidden"
                />
                {errors.avatar_image && <p className="text-red-500 text-sm mt-1">{errors.avatar_image}</p>}
              </div>
            </div>

            {/* Cover */}
            <div>
              <Label>Capa da Comunidade</Label>
              <div className="mt-2">
                {coverPreview ? (
                  <div className="relative">
                    <img 
                      src={coverPreview} 
                      alt="Preview"
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...formData, cover_image: undefined })
                        setCoverPreview(null)
                      }}
                      className="absolute top-1 right-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full h-20 border-dashed"
                  >
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                      <p className="text-xs text-gray-600">Capa</p>
                    </div>
                  </Button>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('cover', e)}
                  className="hidden"
                />
                {errors.cover_image && <p className="text-red-500 text-sm mt-1">{errors.cover_image}</p>}
              </div>
            </div>
          </div>

          {/* Tipo de comunidade */}
          <div>
            <Label>Tipo de Comunidade</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { type: 'public', label: 'Pública', desc: 'Qualquer um pode ver e participar' },
                { type: 'private', label: 'Privada', desc: 'Apenas por convite' },
                { type: 'premium', label: 'Premium', desc: 'Conteúdo exclusivo pago' }
              ].map(({ type, label, desc }) => (
                <div
                  key={type}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.type === type 
                      ? getTypeColor(type)
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, type: type as any })}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(type)}
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{desc}</p>
                  {type === 'premium' && canAccess.plan !== 'diamond' && (
                    <p className="text-xs text-red-500 mt-1">Requer Diamante</p>
                  )}
                </div>
              ))}
            </div>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          {/* Localização */}
          <div>
            <LocationPicker
              onLocationSelected={(location) => {
                setFormData({
                  ...formData,
                  location_name: location.name,
                  location_address: location.address,
                  latitude: location.latitude,
                  longitude: location.longitude
                })
              }}
              placeholder="Buscar localização da comunidade..."
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Adicionar tag..."
              />
              <Button type="button" onClick={addTag}>Adicionar</Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Regras */}
          <div>
            <Label htmlFor="rules">Regras da Comunidade (Opcional)</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder="Defina as regras e diretrizes da sua comunidade..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Criando...' : 'Criar Comunidade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}