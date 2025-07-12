"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { Heart, Users, MapPin, Calendar, X } from "lucide-react"

interface OpenDatesPreferences {
  age_min: number
  age_max: number
  distance_max: number
  gender_preference: string[]
  relationship_type_preference: string[]
  interests_preference: string[]
  is_active: boolean
}

const availableInterests = [
  "viagens", "fotografia", "música", "arte", "gastronomia", "esportes",
  "tecnologia", "literatura", "cinema", "dança", "yoga", "meditação",
  "natureza", "festivais", "cultura", "moda", "beleza", "saúde",
  "política", "filosofia", "história", "ciência", "negócios", "voluntariado"
]

const relationshipTypes = [
  "single", "couple", "poly", "open", "swinger", "bdsm", "vanilla"
]

const genderOptions = [
  "mulher", "homem", "casal", "trans", "não-binário", "fluido"
]

export function OpenDatesPreferences() {
  const [preferences, setPreferences] = useState<OpenDatesPreferences>({
    age_min: 18,
    age_max: 50,
    distance_max: 50,
    gender_preference: [],
    relationship_type_preference: [],
    interests_preference: [],
    is_active: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Carregar preferências
  const fetchPreferences = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/open-dates/preferences')
      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          setPreferences(data.preferences)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error)
    } finally {
      setLoading(false)
    }
  }

  // Salvar preferências
  const savePreferences = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/open-dates/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })
      
      if (response.ok) {
        toast({
          title: "Preferências salvas!",
          description: "Suas preferências foram atualizadas com sucesso.",
        })
      } else {
        throw new Error('Erro ao salvar preferências')
      }
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas preferências.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchPreferences()
  }, [user])

  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests_preference: prev.interests_preference.includes(interest)
        ? prev.interests_preference.filter(i => i !== interest)
        : [...prev.interests_preference, interest]
    }))
  }

  const toggleGender = (gender: string) => {
    setPreferences(prev => ({
      ...prev,
      gender_preference: prev.gender_preference.includes(gender)
        ? prev.gender_preference.filter(g => g !== gender)
        : [...prev.gender_preference, gender]
    }))
  }

  const toggleRelationshipType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      relationship_type_preference: prev.relationship_type_preference.includes(type)
        ? prev.relationship_type_preference.filter(t => t !== type)
        : [...prev.relationship_type_preference, type]
    }))
  }

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando preferências...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Heart className="w-8 h-8 text-pink-600" />
          Preferências Open Dates
        </h2>
        <p className="text-gray-600">
          Configure suas preferências para encontrar pessoas mais compatíveis
        </p>
      </div>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Status do Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="active-status" className="text-base font-medium">
                Perfil Ativo
              </Label>
              <p className="text-sm text-gray-500">
                {preferences.is_active 
                  ? "Seu perfil está visível para outros usuários" 
                  : "Seu perfil está oculto"
                }
              </p>
            </div>
            <Switch
              id="active-status"
              checked={preferences.is_active}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, is_active: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Idade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Faixa de Idade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{preferences.age_min} anos</span>
              <span>{preferences.age_max} anos</span>
            </div>
            <Slider
              value={[preferences.age_min, preferences.age_max]}
              onValueChange={([min, max]) => setPreferences(prev => ({ 
                ...prev, 
                age_min: min, 
                age_max: max 
              }))}
              max={80}
              min={18}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Distância */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Distância Máxima
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-2xl font-bold text-pink-600">
                {preferences.distance_max}km
              </span>
            </div>
            <Slider
              value={[preferences.distance_max]}
              onValueChange={([distance]) => setPreferences(prev => ({ 
                ...prev, 
                distance_max: distance 
              }))}
              max={100}
              min={5}
              step={5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Gênero */}
      <Card>
        <CardHeader>
          <CardTitle>Preferência de Gênero</CardTitle>
          <p className="text-sm text-gray-500">
            Selecione os gêneros que você gostaria de conhecer
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {genderOptions.map((gender) => (
              <Badge
                key={gender}
                variant={preferences.gender_preference.includes(gender) ? "default" : "outline"}
                className="cursor-pointer hover:bg-pink-100"
                onClick={() => toggleGender(gender)}
              >
                {gender}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tipo de Relacionamento */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Relacionamento</CardTitle>
          <p className="text-sm text-gray-500">
            Que tipo de relacionamento você está buscando?
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {relationshipTypes.map((type) => (
              <Badge
                key={type}
                variant={preferences.relationship_type_preference.includes(type) ? "default" : "outline"}
                className="cursor-pointer hover:bg-pink-100"
                onClick={() => toggleRelationshipType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interesses */}
      <Card>
        <CardHeader>
          <CardTitle>Interesses</CardTitle>
          <p className="text-sm text-gray-500">
            Selecione seus interesses para encontrar pessoas com gostos similares
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map((interest) => (
              <Badge
                key={interest}
                variant={preferences.interests_preference.includes(interest) ? "default" : "outline"}
                className="cursor-pointer hover:bg-pink-100"
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.location.href = '/open-dates'}
        >
          Voltar ao Open Dates
        </Button>
        <Button
          className="flex-1"
          onClick={savePreferences}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar Preferências"}
        </Button>
      </div>
    </div>
  )
} 