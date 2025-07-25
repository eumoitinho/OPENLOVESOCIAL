"use client"

import { useState } from "react"
import { createClient } from "@/app/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Crown, Star, Zap, Upload, X, Camera } from "lucide-react"
import { EnhancedImageUpload } from '@/app/components/ui/enhanced-image-upload'
import { useRouter } from "next/navigation"
import { LocationSearch } from "@/app/components/location/LocationSearch"
import PlanSelection from "@/app/components/auth/PlanSelection"
import type { Database } from "@/app/lib/database.types"
// Substituir o tipo User por um tipo manual baseado no schema SQL

type User = {
  id: string
  email: string
  username: string
  name: string
  bio?: string | null
  avatar_url?: string | null
  cover_url?: string | null
  location?: string | null
  age?: number | null
  gender?: string | null
  interests?: string[]
  relationship_status?: string | null
  looking_for?: string[]
  is_premium?: boolean
  premium_expires_at?: string | null
  is_verified?: boolean
  is_active?: boolean
  last_seen?: string
  created_at?: string
  updated_at?: string
  privacy_settings?: any
  stats?: any
}

const PROFILE_TYPES = [
  { value: "single_m", label: "Solteiro (Homem)", emoji: "👨" },
  { value: "single_f", label: "Solteira (Mulher)", emoji: "👩" },
  { value: "couple_mf", label: "Casal (M+F)", emoji: "👫" },
  { value: "couple_mm", label: "Casal (M+M)", emoji: "👬" },
  { value: "couple_ff", label: "Casal (F+F)", emoji: "👭" },
  { value: "trans", label: "Trans", emoji: "🏳️‍⚧️" },
  { value: "non_binary", label: "Não-binário", emoji: "⚧️" },
]

const INTERESTS = [
  "Encontros casuais",
  "Relacionamento sério",
  "Amizades",
  "Networking",
  "Eventos sociais",
  "Atividades em grupo",
  "Mentoria",
  "Negócios",
]

const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Ideal para começar e explorar recursos básicos",
    features: [
      "Participar de comunidades verificadas",
      "Upload ilimitado de fotos",
      "Upload de 1 vídeo",
      "Perfil básico"
    ],
    icon: Zap,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
  },
  {
    id: "gold",
    name: "Open Gold",
    price: "R$ 25,00",
    period: "/mês",
    description: "Mais recursos para quem quer se destacar",
    features: [
      "Participar de até 3 comunidades",
      "Criar até 2 eventos por mês",
      "Mensagens privadas com fotos",
      "Upload ilimitado de fotos e vídeos",
      "Perfil com destaque visual",
      "Suporte prioritário"
    ],
    icon: Crown,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    popular: true,
  },
  {
    id: "diamond",
    name: "Open Diamond",
    price: "R$ 45,90",
    period: "/mês",
    description: "Para quem quer o máximo de recursos",
    features: [
      "Participar de até 5 comunidades",
      "Criar até 10 eventos por mês",
      "Mensagens com fotos, vídeos e áudios",
      "Chamadas de voz e vídeo",
      "Perfil super destacado + badge verificado",
      "Criar comunidades privadas"
    ],
    icon: Star,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
]

export default function SignUp() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [createdUser, setCreatedUser] = useState<{ id: string; email: string } | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    id: number
    nome: string
    uf: string
    latitude: number
    longitude: number
  } | null>(null)
  const [formData, setFormData] = useState({
    // Etapa 1
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    username: "",

    // Etapa 2
    profileType: "",
    interests: [] as string[],
    bio: "",
    age: "",
    birthDate: "",
    location: "",
    canSellContent: false,
    offersPrograms: false,

    // Etapa 3
    selectedPlan: "free",
  })

  const router = useRouter()
  // Usar instância única do client
  const supabase = createClient()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.')
        return
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.')
        return
      }

      setProfileImage(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setProfileImage(null)
    setImagePreview(null)
  }

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.')
        return
      }

      // Validar tamanho (máximo 10MB para capa)
      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem de capa deve ter no máximo 10MB.')
        return
      }

      setCoverImage(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCover = () => {
    setCoverImage(null)
    setCoverPreview(null)
  }

  const handleLocationSelect = (location: {
    id: number
    nome: string
    uf: string
    latitude: number
    longitude: number
  }) => {
    setSelectedLocation(location)
    handleInputChange("location", `${location.nome}, ${location.uf}`)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return (
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          formData.fullName &&
          formData.username &&
          formData.password === formData.confirmPassword
        )
      case 2:
        return formData.profileType && formData.age && formData.birthDate && formData.location
      case 3:
        return formData.selectedPlan
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setLoading(true)
    try {
      // 1. Converter imagem para base64 se existir
      let avatarBase64 = null
      let coverBase64 = null
      if (profileImage) {
        const reader = new FileReader()
        avatarBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(profileImage)
        })
      }
      if (coverImage) {
        const reader = new FileReader()
        coverBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(coverImage)
        })
      }

      // 2. Enviar dados para a API de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.fullName.split(' ')[0],
          lastName: formData.fullName.split(' ').slice(1).join(' '),
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          birthDate: formData.birthDate,
          profileType: formData.profileType,
          seeking: [],
          interests: formData.interests,
          otherInterest: null,
          bio: formData.bio,
          city: selectedLocation?.nome || formData.location?.split(',')[0]?.trim(),
          uf: selectedLocation?.uf || formData.location?.split(',')[1]?.trim(),
          latitude: selectedLocation?.latitude || null,
          longitude: selectedLocation?.longitude || null,
          plan: formData.selectedPlan,
          partner: null,
          profilePicture: avatarBase64 ? { base64: avatarBase64 } : {},
          coverPicture: coverBase64 ? { base64: coverBase64 } : {}
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar conta')
      }

      // 3. Armazenar dados do usuário criado
      setCreatedUser({
        id: result.userId || result.user?.id,
        email: formData.email
      })

      // 4. Se for plano gratuito, redirecionar direto para timeline
      if (formData.selectedPlan === "free") {
        router.push("/timeline")
        return
      }

      // 5. Para planos pagos, ir para próxima etapa de pagamento
      setStep(4) // Nova etapa de pagamento

    } catch (error) {
      console.error("Erro no cadastro:", error)
      alert("Erro ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / 4) * 100
  
  const handlePlanSelect = (planId: string) => {
    setFormData(prev => ({ ...prev, selectedPlan: planId }))
  }
  
  const handlePaymentSuccess = () => {
    router.push("/timeline?payment=success")
  }
  
  const handlePaymentError = (error: string) => {
    console.error("Erro no pagamento:", error)
    alert("Erro no pagamento: " + error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Criar Conta - Openlove</CardTitle>
          <CardDescription>Etapa {step} de {formData.selectedPlan === 'free' ? 3 : 4}</CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Etapa 1: Dados Básicos */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="seu_usuario"
                />
                <p className="text-xs text-gray-500">Este será seu @username no OpenLove</p>
              </div>

              {/* Upload de Foto de Perfil */}
              <div className="space-y-2">
                <Label>Foto de Perfil (Opcional)</Label>
                <div className="flex items-center gap-4">
                  {/* Preview da imagem */}
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Botão de upload */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="profileImage"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {imagePreview ? "Trocar Foto" : "Escolher Foto"}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG ou GIF até 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload de Foto de Capa */}
              <div className="space-y-2">
                <Label>Foto de Capa (Opcional)</Label>
                <div className="flex items-center gap-4">
                  {/* Preview da imagem de capa */}
                  {coverPreview ? (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Preview Capa"
                        className="w-32 h-20 rounded-lg object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeCover}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-20 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Botão de upload */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="coverImage"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="coverImage"
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {coverPreview ? "Trocar Capa" : "Escolher Capa"}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG ou GIF até 10MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirme sua senha"
                />
              </div>

              {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                <p className="text-sm text-red-500">As senhas não coincidem</p>
              )}
            </div>
          )}

          {/* Etapa 2: Perfil Detalhado */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Perfil Detalhado</h3>

              <div className="space-y-2">
                <Label>Tipo de Perfil</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PROFILE_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      variant={formData.profileType === type.value ? "default" : "outline"}
                      className="justify-start h-auto p-3"
                      onClick={() => handleInputChange("profileType", type.value)}
                    >
                      <span className="mr-2">{type.emoji}</span>
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="18"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500">Você deve ter pelo menos 18 anos</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Localização *</Label>
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  placeholder="Buscar sua cidade..."
                  initialValue={formData.location}
                />
              </div>

              <div className="space-y-2">
                <Label>Interesses</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={formData.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Opcional)</Label>
                <textarea
                  id="bio"
                  className="w-full p-3 border rounded-md resize-none"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Opções de Monetização</h4>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canSellContent"
                    checked={formData.canSellContent}
                    onCheckedChange={(checked) => handleInputChange("canSellContent", checked)}
                  />
                  <Label htmlFor="canSellContent">Quero vender conteúdo exclusivo (fotos, vídeos, etc.)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="offersPrograms"
                    checked={formData.offersPrograms}
                    onCheckedChange={(checked) => handleInputChange("offersPrograms", checked)}
                  />
                  <Label htmlFor="offersPrograms">Quero oferecer programas/cursos/mentorias</Label>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 3: Seleção de Plano */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Escolha seu Plano</h3>

              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
                {PLANS.map((plan) => {
                  const Icon = plan.icon
                  const isSelected = formData.selectedPlan === plan.id

                  return (
                    <div
                      key={plan.id}
                      className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        isSelected ? "border-purple-500 bg-purple-50 shadow-lg" : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                      onClick={() => handleInputChange("selectedPlan", plan.id)}
                    >
                      {plan.popular && <Badge className="absolute -top-2 left-4 bg-purple-500">Mais Popular</Badge>}

                      <div className="text-center mb-4">
                        <div className={`p-3 rounded-xl ${plan.bgColor} mx-auto w-fit mb-3`}>
                          <Icon className={`h-6 w-6 ${plan.color}`} />
                        </div>
                        <h4 className="font-semibold text-xl mb-2">{plan.name}</h4>
                        <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                        <div className="mb-4">
                          <div className="text-3xl font-bold">{plan.price}</div>
                          <div className="text-sm text-gray-500">{plan.period}</div>
                        </div>
                      </div>

                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Etapa 4: Pagamento */}
          {step === 4 && createdUser && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Finalize sua assinatura
                </h3>
                <p className="text-gray-600 mb-6">
                  Complete o pagamento para ativar seu plano {PLANS.find(p => p.id === formData.selectedPlan)?.name}
                </p>
              </div>

              <PlanSelection
                onPlanSelect={handlePlanSelect}
                selectedPlan={formData.selectedPlan}
                userEmail={createdUser.email}
                userId={createdUser.id}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          )}

          {/* Botões de Navegação */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext} disabled={!validateStep(step)} className="flex items-center gap-2">
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : step === 3 ? (
              <Button onClick={handleSubmit} disabled={!validateStep(3) || loading} className="flex items-center gap-2">
                {loading ? "Criando conta..." : "Criar Conta"}
                <Check className="h-4 w-4" />
              </Button>
            ) : (
              // Etapa 4 - botões são gerenciados pelo PlanSelection
              <div></div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
