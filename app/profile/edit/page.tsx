"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Camera, MapPin, Calendar, Heart, Music, Book, Gamepad2, Plane, Coffee } from "lucide-react"

const INTERESTS = [
  { id: "technology", label: "Tecnologia", icon: <Gamepad2 className="w-4 h-4" /> },
  { id: "music", label: "Música", icon: <Music className="w-4 h-4" /> },
  { id: "sports", label: "Esportes", icon: <Heart className="w-4 h-4" /> },
  { id: "reading", label: "Leitura", icon: <Book className="w-4 h-4" /> },
  { id: "travel", label: "Viagens", icon: <Plane className="w-4 h-4" /> },
  { id: "food", label: "Gastronomia", icon: <Coffee className="w-4 h-4" /> },
  { id: "art", label: "Arte", icon: <Heart className="w-4 h-4" /> },
  { id: "fitness", label: "Fitness", icon: <Heart className="w-4 h-4" /> },
]

const PROFILE_TYPES = [
  { value: "personal", label: "Pessoal" },
  { value: "business", label: "Profissional" },
  { value: "creator", label: "Criador de Conteúdo" },
  { value: "organization", label: "Organização" },
]

export default function EditProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    birth_date: "",
    profile_type: "personal",
    interests: [] as string[],
    avatar_url: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin")
      return
    }
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram salvas com sucesso.",
        })
        router.push("/profile")
      } else {
        throw new Error("Erro ao atualizar perfil")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInterestToggle = (interestId: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }))
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Foto do Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{profile.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" className="flex items-center gap-2 bg-transparent">
                <Camera className="w-4 h-4" />
                Alterar Foto
              </Button>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="@seuusername"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Cidade, Estado"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="birth_date"
                      type="date"
                      value={profile.birth_date}
                      onChange={(e) => setProfile((prev) => ({ ...prev, birth_date: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profile.website}
                  onChange={(e) => setProfile((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://seusite.com"
                />
              </div>

              <div>
                <Label htmlFor="profile_type">Tipo de Perfil</Label>
                <Select
                  value={profile.profile_type}
                  onValueChange={(value) => setProfile((prev) => ({ ...prev, profile_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Interesses</CardTitle>
              <p className="text-sm text-gray-600">
                Selecione seus interesses para encontrar pessoas com gostos similares
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INTERESTS.map((interest) => (
                  <div
                    key={interest.id}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      profile.interests.includes(interest.id)
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleInterestToggle(interest.id)}
                  >
                    <Checkbox
                      checked={profile.interests.includes(interest.id)}
                      onChange={() => handleInterestToggle(interest.id)}
                    />
                    {interest.icon}
                    <span className="text-sm">{interest.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
