"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
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

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5" />
                Meu Perfil
              </DialogTitle>
              <DialogDescription>
                Gerencie suas informações e configurações
              </DialogDescription>
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
        </DialogHeader>

        <div className="flex flex-col h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
              <TabsTrigger value="privacy">Privacidade</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="flex-1 mt-4">
              <div className="space-y-6 overflow-y-auto max-h-[60vh]">
                {/* Cover and Avatar */}
                <div className="relative">
                  <div className="h-48 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg relative">
                    <img
                      src={profile.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-4 right-4"
                      disabled={!isEditing}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute -bottom-16 left-6">
                    <div className="relative">
                      <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-900">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback className="text-2xl">
                          {profile.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-0 right-0"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="mt-20 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        {profile.isVerified && (
                          <BadgeCheckIcon className="w-6 h-6 text-blue-500" />
                        )}
                        {profile.isPremium && (
                          <Badge variant="secondary" className="bg-yellow-500 text-white">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{profile.username}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Nome</label>
                        {isEditing ? (
                          <Input
                            value={editData.name}
                            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1">{profile.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Username</label>
                        {isEditing ? (
                          <Input
                            value={editData.username}
                            onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1">{profile.username}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Bio</label>
                        {isEditing ? (
                          <Textarea
                            value={editData.bio}
                            onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                            className="mt-1"
                            rows={3}
                          />
                        ) : (
                          <p className="mt-1">{profile.bio}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Localização</label>
                        {isEditing ? (
                          <Input
                            value={editData.location}
                            onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {profile.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Tipo de Relacionamento</label>
                        {isEditing ? (
                          <Select value={editData.relationshipType} onValueChange={(value) => setEditData(prev => ({ ...prev, relationshipType: value }))}>
                            <SelectTrigger className="mt-1">
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
                          <p className="mt-1">{profile.relationshipType}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Telefone</label>
                        {isEditing ? (
                          <Input
                            value={editData.phone}
                            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {profile.phone || "Não informado"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Website</label>
                        {isEditing ? (
                          <Input
                            value={editData.website}
                            onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {profile.website || "Não informado"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Interesses</label>
                        {isEditing ? (
                          <Input
                            value={editData.interests}
                            onChange={(e) => setEditData(prev => ({ ...prev, interests: e.target.value }))}
                            className="mt-1"
                            placeholder="Separados por vírgula"
                          />
                        ) : (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {profile.interests.map((interest) => (
                              <Badge key={interest} variant="outline">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Estatísticas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profile.stats.posts}</div>
                          <div className="text-sm text-gray-500">Posts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profile.stats.followers}</div>
                          <div className="text-sm text-gray-500">Seguidores</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profile.stats.following}</div>
                          <div className="text-sm text-gray-500">Seguindo</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profile.stats.events}</div>
                          <div className="text-sm text-gray-500">Eventos</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Badges */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Conquistas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.badges.map((badge) => (
                          <Badge key={badge.name} variant="secondary" className="flex items-center gap-1">
                            {getBadgeIcon(badge.icon)}
                            {badge.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 mt-4">
              <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                <Card>
                  <CardHeader>
                    <CardTitle>Atividade Recente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm">{activity.content}</p>
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 mt-4">
              <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações da Conta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificações</p>
                        <p className="text-sm text-gray-500">Gerencie suas notificações</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Bell className="w-4 h-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Segurança</p>
                        <p className="text-sm text-gray-500">Configurações de segurança</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Shield className="w-4 h-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="flex-1 mt-4">
              <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Privacidade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Perfil Privado</p>
                        <p className="text-sm text-gray-500">Apenas seguidores aprovados podem ver seu perfil</p>
                      </div>
                      <Button variant={profile.isPrivate ? "default" : "outline"} size="sm">
                        {profile.isPrivate ? "Ativado" : "Desativado"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Mostrar Localização</p>
                        <p className="text-sm text-gray-500">Permitir que outros vejam sua localização</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Ativado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CardContent } from "@/components/ui/card"
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"