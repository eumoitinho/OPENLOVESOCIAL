"use client"

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Upload,
  X,
  DollarSign,
  Users,
  Lock,
  Globe,
  Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { useCanAccess } from '@/lib/plans/hooks'
import LocationPicker from '../location/LocationPicker'

interface CreateEventProps {
  onClose: () => void
  onEventCreated: (event: any) => void
}

interface EventFormData {
  title: string
  description: string
  category: string
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  is_online: boolean
  location_name: string
  location_address: string
  latitude?: number
  longitude?: number
  online_link: string
  type: 'public' | 'private' | 'paid'
  price?: number
  max_participants?: number
  min_age?: number
  max_age?: number
  tags: string[]
  cover_image?: File
}

const EVENT_CATEGORIES = [
  'Festa', 'Workshop', 'Meetup', 'Networking', 'Esporte', 'Cultural',
  'Música', 'Arte', 'Gastronomia', 'Tecnologia', 'Negócios', 'Educação',
  'Saúde', 'Fitness', 'Viagem', 'Lifestyle', 'Outro'
]

export default function CreateEvent({ onClose, onEventCreated }: CreateEventProps) {
  const { user } = useAuth()
  const canAccess = useCanAccess()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    is_online: false,
    location_name: '',
    location_address: '',
    online_link: '',
    type: 'public',
    tags: []
  })
  
  const [currentTag, setCurrentTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [monthlyUsage, setMonthlyUsage] = useState({ used: 0, limit: 0 })

  // Carregar uso mensal ao abrir
  useState(() => {
    if (user) {
      fetchMonthlyUsage()
    }
  })

  const fetchMonthlyUsage = async () => {
    try {
      const response = await fetch('/api/users/monthly-limits?type=events')
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
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório'
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória'
    if (!formData.category) newErrors.category = 'Categoria é obrigatória'
    if (!formData.start_date) newErrors.start_date = 'Data de início é obrigatória'
    if (!formData.start_time) newErrors.start_time = 'Hora de início é obrigatória'

    // Validar localização
    if (!formData.is_online && !formData.location_name.trim()) {
      newErrors.location_name = 'Local é obrigatório para eventos presenciais'
    }

    if (formData.is_online && !formData.online_link.trim()) {
      newErrors.online_link = 'Link é obrigatório para eventos online'
    }

    // Validar preço para eventos pagos
    if (formData.type === 'paid') {
      if (!canAccess.plan || canAccess.plan === 'free' || canAccess.plan === 'gold') {
        newErrors.type = 'Eventos pagos requerem plano Diamante'
      }
      if (!formData.price || formData.price <= 0) {
        newErrors.price = 'Preço é obrigatório para eventos pagos'
      }
    }

    // Validar datas
    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`)
    const now = new Date()
    
    if (startDateTime <= now) {
      newErrors.start_date = 'Data deve ser no futuro'
    }

    if (formData.end_date && formData.end_time) {
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`)
      if (endDateTime <= startDateTime) {
        newErrors.end_date = 'Data de término deve ser após o início'
      }
    }

    // Validar limites por plano
    if (monthlyUsage.used >= monthlyUsage.limit) {
      newErrors.general = `Limite mensal atingido (${monthlyUsage.limit} eventos por mês)`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Upload da imagem de capa se selecionada
      let coverImageUrl = ''
      if (formData.cover_image) {
        const imageFormData = new FormData()
        imageFormData.append('file', formData.cover_image)
        imageFormData.append('type', 'event_cover')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          coverImageUrl = uploadData.url
        }
      }

      // Criar evento
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        start_date: `${formData.start_date}T${formData.start_time}:00.000Z`,
        end_date: formData.end_date && formData.end_time 
          ? `${formData.end_date}T${formData.end_time}:00.000Z` 
          : null,
        is_online: formData.is_online,
        location_name: formData.is_online ? null : formData.location_name,
        location_address: formData.is_online ? null : formData.location_address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        online_link: formData.is_online ? formData.online_link : null,
        type: formData.type,
        price: formData.type === 'paid' ? formData.price : null,
        max_participants: formData.max_participants,
        min_age: formData.min_age,
        max_age: formData.max_age,
        tags: formData.tags,
        cover_image_url: coverImageUrl
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar evento')
      }

      const newEvent = await response.json()
      
      // Compartilhar automaticamente no feed se público
      if (formData.type === 'public') {
        try {
          await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'event_share',
              content: `Acabei de criar um evento! Quem vem? 🎉`,
              related_data: {
                event_id: newEvent.id,
                event_title: newEvent.title,
                event_date: newEvent.start_date,
                event_location: newEvent.location_name || 'Online'
              },
              visibility: 'public'
            })
          })
        } catch (error) {
          console.warn('Erro ao compartilhar evento no feed:', error)
        }
      }

      onEventCreated(newEvent)
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      setErrors({ general: error instanceof Error ? error.message : 'Erro inesperado' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo e tamanho
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, cover_image: 'Apenas imagens são permitidas' })
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors({ ...errors, cover_image: 'Imagem deve ter menos de 5MB' })
        return
      }
      
      setFormData({ ...formData, cover_image: file })
      setErrors({ ...errors, cover_image: '' })
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Criar Evento
          </DialogTitle>
        </DialogHeader>

        {/* Limitações de plano */}
        {monthlyUsage.limit > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              Eventos criados este mês: {monthlyUsage.used}/{monthlyUsage.limit}
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
              <Label htmlFor="title">Título do Evento *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Workshop de React para Iniciantes"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva seu evento, o que os participantes podem esperar..."
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
                  {EVENT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Imagem de capa */}
          <div>
            <Label>Imagem de Capa</Label>
            <div className="mt-2">
              {formData.cover_image ? (
                <div className="relative">
                  <img 
                    src={URL.createObjectURL(formData.cover_image)} 
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setFormData({ ...formData, cover_image: undefined })}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-dashed"
                >
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Clique para adicionar imagem</p>
                  </div>
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {errors.cover_image && <p className="text-red-500 text-sm mt-1">{errors.cover_image}</p>}
            </div>
          </div>

          {/* Data e hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
            </div>

            <div>
              <Label htmlFor="start_time">Hora de Início *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className={errors.start_time ? 'border-red-500' : ''}
              />
              {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
            </div>

            <div>
              <Label htmlFor="end_date">Data de Término</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
            </div>

            <div>
              <Label htmlFor="end_time">Hora de Término</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_online}
                onCheckedChange={(checked) => setFormData({ ...formData, is_online: checked })}
              />
              <Label>Evento online</Label>
            </div>

            {formData.is_online ? (
              <div>
                <Label htmlFor="online_link">Link do Evento *</Label>
                <Input
                  id="online_link"
                  value={formData.online_link}
                  onChange={(e) => setFormData({ ...formData, online_link: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  className={errors.online_link ? 'border-red-500' : ''}
                />
                {errors.online_link && <p className="text-red-500 text-sm mt-1">{errors.online_link}</p>}
              </div>
            ) : (
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
                required
                error={errors.location_name}
              />
            )}
          </div>

          {/* Configurações do evento */}
          <div className="space-y-4">
            <div>
              <Label>Tipo de Evento</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Público
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Privado
                    </div>
                  </SelectItem>
                  {(canAccess.plan === 'diamond') && (
                    <SelectItem value="paid">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Pago
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>

            {formData.type === 'paid' && (
              <div>
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="max_participants">Máx. Participantes</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={formData.max_participants || ''}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="min_age">Idade Mínima</Label>
                <Input
                  id="min_age"
                  type="number"
                  min="13"
                  max="99"
                  value={formData.min_age || ''}
                  onChange={(e) => setFormData({ ...formData, min_age: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="max_age">Idade Máxima</Label>
                <Input
                  id="max_age"
                  type="number"
                  min="13"
                  max="99"
                  value={formData.max_age || ''}
                  onChange={(e) => setFormData({ ...formData, max_age: parseInt(e.target.value) })}
                />
              </div>
            </div>
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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Criando...' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}