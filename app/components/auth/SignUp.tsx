"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Crown, Star, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
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
    description: "Perfeito para começar",
    features: ["5 curtidas por dia", "Mensagens limitadas", "Perfil básico", "Anúncios"],
    icon: Star,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
  },
  {
    id: "premium",
    name: "Premium",
    price: "R$ 29,90",
    period: "/mês",
    description: "Mais recursos e visibilidade",
    features: [
      "Curtidas ilimitadas",
      "Mensagens ilimitadas",
      "Ver quem visitou seu perfil",
      "Filtros avançados",
      "Sem anúncios",
      "Boost no perfil",
    ],
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 49,90",
    period: "/mês",
    description: "Para criadores de conteúdo",
    features: [
      "Todos os recursos Premium",
      "Vender conteúdo exclusivo",
      "Criar programas/cursos",
      "Analytics avançados",
      "Suporte prioritário",
      "Comissão reduzida (15%)",
    ],
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
]

export default function SignUp() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Etapa 1
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",

    // Etapa 2
    profileType: "",
    interests: [] as string[],
    bio: "",
    age: "",
    location: "",
    canSellContent: false,
    offersPrograms: false,

    // Etapa 3
    selectedPlan: "free",
  })

  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

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
          formData.password === formData.confirmPassword
        )
      case 2:
        return formData.profileType && formData.age && formData.location
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
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Criar perfil na tabela users
        const userData: User = {
          id: authData.user.id,
          email: formData.email,
          username: authData.user.email?.split("@")[0] || "user_" + authData.user.id.substring(0, 8),
          name: formData.fullName,
          bio: formData.bio || null,
          location: formData.location || null,
          age: formData.age ? Number(formData.age) : null,
          interests: formData.interests,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: userError } = await supabase.from("users").insert([userData])

        if (userError) throw userError

        // 3. Se não for plano gratuito, redirecionar para pagamento
        if (formData.selectedPlan !== "free") {
          const priceIds = {
            premium: "price_premium_monthly", // Substituir pelos IDs reais do Stripe
            pro: "price_pro_monthly",
          }

          const response = await fetch("/api/mercadopago/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              priceId: priceIds[formData.selectedPlan as keyof typeof priceIds],
              userId: authData.user.id,
            }),
          })

          const { url } = await response.json()
          if (url) {
            window.location.href = url
            return
          }
        }

        // 4. Redirecionar para dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Erro no cadastro:", error)
      alert("Erro ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Criar Conta - ConnectHub</CardTitle>
          <CardDescription>Etapa {step} de 3</CardDescription>
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
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Cidade, Estado"
                  />
                </div>
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

              <div className="grid gap-4">
                {PLANS.map((plan) => {
                  const Icon = plan.icon
                  const isSelected = formData.selectedPlan === plan.id

                  return (
                    <div
                      key={plan.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleInputChange("selectedPlan", plan.id)}
                    >
                      {plan.popular && <Badge className="absolute -top-2 left-4 bg-purple-500">Mais Popular</Badge>}

                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${plan.bgColor}`}>
                            <Icon className={`h-5 w-5 ${plan.color}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{plan.name}</h4>
                            <p className="text-gray-600 text-sm">{plan.description}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold">{plan.price}</div>
                          <div className="text-sm text-gray-500">{plan.period}</div>
                        </div>
                      </div>

                      <ul className="mt-4 space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
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
            ) : (
              <Button onClick={handleSubmit} disabled={!validateStep(3) || loading} className="flex items-center gap-2">
                {loading ? "Criando conta..." : "Criar Conta"}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
