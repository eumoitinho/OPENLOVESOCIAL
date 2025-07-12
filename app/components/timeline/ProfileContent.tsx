"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/motion-tabs"
import {
  User,
  Edit,
  Camera,
  Settings,
  Heart,
  Users,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  Lock,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  BadgeCheckIcon,
  Crown,
  Award,
  Activity,
  Bookmark,
  MessageCircle,
  Share2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  coverImage: string
  bio: string
  location: string
  relationshipType: string
  birthDate: string
  isVerified: boolean
  isPremium: boolean
  isPrivate: boolean
  phone?: string
  website?: string
  interests: string[]
  stats: {
    posts: number
    followers: number
    following: number
    events: number
  }
  badges: {
    name: string
    icon: string
    description: string
  }[]
  recentActivity: {
    type: string
    content: string
    timestamp: string
  }[]
}

export function ProfileContent() {
  const [profile, setProfile] = useState<UserProfile>({
    id: "1",
    name: "João Silva",
    username: "@joaosilva",
    email: "joao@example.com",
    avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
    coverImage: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
    bio: "Apaixonado por liberdade, respeito e conexões autênticas. Explorando relacionamentos modernos com transparência e honestidade.",
    location: "São Paulo, SP",
    relationshipType: "Solteiro",
    birthDate: "1990-05-15",
    isVerified: true,
    isPremium: true,
    isPrivate: false,
    phone: "+55 11 99999-9999",
    website: "https://joaosilva.com",
    interests: ["fotografia", "viagens", "música", "esportes", "tecnologia"],
    stats: {
      posts: 42,
      followers: 1247,
      following: 892,
      events: 15
    },
    badges: [
      {
        name: "Verificado",
        icon: "BadgeCheckIcon",
        description: "Conta verificada"
      },
      {
        name: "Premium",
        icon: "Crown",
        description: "Membro premium"
      },
      {
        name: "Ativo",
        icon: "Activity",
        description: "Muito ativo na comunidade"
      }
    ],
    recentActivity: [
      {
        type: "post",
        content: "Compartilhou uma foto",
        timestamp: "2h"
      },
      {
        type: "event",
        content: "Participou do Workshop de Fotografia",
        timestamp: "1 dia"
      },
      {
        type: "community",
        content: "Entrou na comunidade Casais Livres SP",
        timestamp: "3 dias"
      }
    ]
  })

  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [editData, setEditData] = useState({
    name: profile.name,
    username: profile.username,
    bio: profile.bio,
    location: profile.location,
    relationshipType: profile.relationshipType,
    phone: profile.phone || "",
    website: profile.website || "",
    interests: profile.interests.join(", ")
  })

  const relationshipTypes = [
    "Solteiro",
    "Casal (M&H)",
    "Casal (M&M)",
    "Casal (H&H)",
    "Casal (M&H&M)",
    "Casal (H&M&H)",
    "Poliamor",
    "Outro"
  ]

  const handleSave = () => {
    setProfile(prev => ({
      ...prev,
      name: editData.name,
      username: editData.username,
      bio: editData.bio,
      location: editData.location,
      relationshipType: editData.relationshipType,
      phone: editData.phone || undefined,
      website: editData.website || undefined,
      interests: editData.interests.split(",").map(i => i.trim()).filter(Boolean)
    }))
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      name: profile.name,
      username: profile.username,
      bio: profile.bio,
      location: profile.location,
      relationshipType: profile.relationshipType,
      phone: profile.phone || "",
      website: profile.website || "",
      interests: profile.interests.join(", ")
    })
    setIsEditing(false)
  }

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "BadgeCheckIcon":
        return <BadgeCheckIcon className="w-4 h-4" />
      case "Crown":
        return <Crown className="w-4 h-4" />
      case "Activity":
        return <Activity className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas informações e configurações
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Info */}
        <div className="lg:w-1/3">
          <Card>
            <div className="relative h-32">
              <img
                src={profile.coverImage}
                alt="Cover"
                className="w-full h-full object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <CardContent className="p-6">
              <div className="flex justify-center -mt-12 mb-4">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-2xl font-semibold">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{profile.name}</h2>
                  {profile.isVerified && <BadgeCheckIcon className="w-5 h-5 text-blue-500" />}
                  {profile.isPremium && <Crown className="w-5 h-5 text-yellow-500" />}
                </div>
                <p className="text-muted-foreground">@{profile.username}</p>
                <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{profile.stats.posts}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{profile.stats.followers}</div>
                  <div className="text-sm text-muted-foreground">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{profile.stats.following}</div>
                  <div className="text-sm text-muted-foreground">Seguindo</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{profile.stats.events}</div>
                  <div className="text-sm text-muted-foreground">Eventos</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.relationshipType}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={profile.website} className="text-blue-500 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Interesses</h3>
                <div className="flex flex-wrap gap-1">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Badges</h3>
                <div className="space-y-2">
                  {profile.badges.map((badge, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {getBadgeIcon(badge.icon)}
                      <span>{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <div className="lg:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
              <TabsTrigger value="privacy">Privacidade</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Perfil</CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      {isEditing ? (
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profile.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Username</label>
                      {isEditing ? (
                        <Input
                          value={editData.username}
                          onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">@{profile.username}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    {isEditing ? (
                      <Textarea
                        value={editData.bio}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Localização</label>
                      {isEditing ? (
                        <Input
                          value={editData.location}
                          onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profile.location}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tipo de Relacionamento</label>
                      {isEditing ? (
                        <Select value={editData.relationshipType} onValueChange={(value) => setEditData(prev => ({ ...prev, relationshipType: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {relationshipTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profile.relationshipType}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Telefone</label>
                      {isEditing ? (
                        <Input
                          value={editData.phone}
                          onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profile.phone || "Não informado"}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Website</label>
                      {isEditing ? (
                        <Input
                          value={editData.website}
                          onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profile.website || "Não informado"}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Interesses</label>
                    {isEditing ? (
                      <Input
                        value={editData.interests}
                        onChange={(e) => setEditData(prev => ({ ...prev, interests: e.target.value }))}
                        placeholder="Separe por vírgulas"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.interests.map((interest, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da Conta</CardTitle>
                  <CardDescription>
                    Gerencie suas configurações de conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notificações</h3>
                      <p className="text-sm text-muted-foreground">Gerencie suas notificações</p>
                    </div>
                    <Button variant="outline">
                      <Bell className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Segurança</h3>
                      <p className="text-sm text-muted-foreground">Configurações de segurança</p>
                    </div>
                    <Button variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Preferências</h3>
                      <p className="text-sm text-muted-foreground">Preferências de uso</p>
                    </div>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Privacidade</CardTitle>
                  <CardDescription>
                    Controle quem pode ver seu perfil e conteúdo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Perfil Privado</h3>
                      <p className="text-sm text-muted-foreground">Apenas seguidores aprovados podem ver seu conteúdo</p>
                    </div>
                    <Button variant={profile.isPrivate ? "default" : "outline"}>
                      {profile.isPrivate ? "Ativo" : "Inativo"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Mostrar Localização</h3>
                      <p className="text-sm text-muted-foreground">Permitir que outros vejam sua localização</p>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Bloqueios</h3>
                      <p className="text-sm text-muted-foreground">Gerenciar usuários bloqueados</p>
                    </div>
                    <Button variant="outline">Gerenciar</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>
                    Suas atividades recentes na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.content}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 