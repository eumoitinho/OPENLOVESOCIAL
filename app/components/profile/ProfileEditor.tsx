"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  User, 
  Camera, 
  Save, 
  X, 
  Upload,
  Check,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/app/lib/supabase-browser"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface ProfileData {
  full_name: string
  username: string
  bio: string
  location: string
  website: string
  birth_date: string
  interests: string[]
  avatar_url?: string
  cover_image?: string
}

interface ProfileEditorProps {
  className?: string
  onSave?: (profileData: ProfileData) => void
  onCancel?: () => void
}

const interestOptions = [
  { id: "music", label: "Música" },
  { id: "sports", label: "Esportes" },
  { id: "travel", label: "Viagem" },
  { id: "food", label: "Culinária" },
  { id: "art", label: "Arte" },
  { id: "technology", label: "Tecnologia" },
  { id: "books", label: "Livros" },
  { id: "movies", label: "Filmes" },
  { id: "photography", label: "Fotografia" },
  { id: "fitness", label: "Fitness" },
  { id: "gaming", label: "Jogos" },
  { id: "fashion", label: "Moda" },
  { id: "pets", label: "Animais" },
  { id: "cooking", label: "Cozinhar" },
  { id: "dancing", label: "Dança" }
]

export function ProfileEditor({ className, onSave, onCancel }: ProfileEditorProps) {
  const { user, profile } = useAuth()
  const [formData, setFormData] = useState<ProfileData>({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    birth_date: profile?.birth_date || '',
    interests: profile?.interests || []
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        birth_date: profile.birth_date || '',
        interests: profile.interests || []
      })
    }
  }, [profile])

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }))
  }

  const handleAvatarChange = (file: File) => {
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (file: File) => {
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      setError('Nome completo é obrigatório')
      return false
    }

    if (!formData.username.trim()) {
      setError('Nome de usuário é obrigatório')
      return false
    }

    if (formData.username.length < 3) {
      setError('Nome de usuário deve ter pelo menos 3 caracteres')
      return false
    }

    if (formData.username.includes(' ')) {
      setError('Nome de usuário não pode conter espaços')
      return false
    }

    if (formData.website && !formData.website.startsWith('http')) {
      setError('Website deve começar com http:// ou https://')
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!user?.id) return

    if (!validateForm()) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      let avatarUrl = formData.avatar_url
      let coverUrl = formData.cover_image

      // Upload avatar se houver arquivo novo
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile, 'avatars')
      }

      // Upload cover se houver arquivo novo
      if (coverFile) {
        coverUrl = await uploadImage(coverFile, 'covers')
      }

      // Atualizar perfil no banco
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          birth_date: formData.birth_date,
          interests: formData.interests,
          avatar_url: avatarUrl,
          cover_image: coverUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setSuccess('Perfil atualizado com sucesso!')
      
      // Chamar callback se fornecido
      onSave?.({
        ...formData,
        avatar_url: avatarUrl,
        cover_image: coverUrl
      })

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)

    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
      setError('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editar Perfil
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Atualize suas informações pessoais
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-700 dark:text-green-300">{success}</span>
          </div>
        </motion.div>
      )}

      {/* Imagens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avatar */}
        <div className="space-y-4">
          <Label>Foto de Perfil</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-lg">
                {formData.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleAvatarChange(file)
                }}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Alterar Foto
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG ou GIF até 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Cover */}
        <div className="space-y-4">
          <Label>Foto de Capa</Label>
          <div className="relative">
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
              {(coverPreview || profile?.cover_image) && (
                <img
                  src={coverPreview || profile?.cover_image}
                  alt="Capa"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleCoverChange(file)
                }}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Alterar Capa
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Nome Completo *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <Label htmlFor="username">Nome de Usuário *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="@seuusuario"
          />
        </div>

        <div>
          <Label htmlFor="location">Localização</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Sua cidade"
          />
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://seusite.com"
          />
        </div>

        <div>
          <Label htmlFor="birth_date">Data de Nascimento</Label>
          <Input
            id="birth_date"
            type="date"
            value={formatDate(formData.birth_date)}
            onChange={(e) => handleInputChange('birth_date', e.target.value)}
          />
        </div>
      </div>

      {/* Biografia */}
      <div>
        <Label htmlFor="bio">Biografia</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Conte um pouco sobre você..."
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.bio.length}/500 caracteres
        </p>
      </div>

      {/* Interesses */}
      <div>
        <Label>Interesses</Label>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Selecione até 5 interesses que melhor te descrevem
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {interestOptions.map((interest) => {
            const isSelected = formData.interests.includes(interest.id)
            const isDisabled = !isSelected && formData.interests.length >= 5
            
            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => handleInterestToggle(interest.id)}
                disabled={isDisabled}
                className={`
                  p-3 rounded-lg border text-left transition-colors duration-200
                  ${isSelected
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/10 text-pink-900 dark:text-pink-100'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-gray-100'
                  }
                  ${isDisabled && 'opacity-50 cursor-not-allowed'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{interest.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-pink-500" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-gray-500">
            {formData.interests.length}/5 selecionados
          </p>
          
          {formData.interests.length >= 5 && (
            <Badge variant="secondary" className="text-xs">
              Limite atingido
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
} 
