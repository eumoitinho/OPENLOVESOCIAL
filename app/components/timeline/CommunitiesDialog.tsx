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
  Users,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Lock,
  Globe,
  Star,
  Heart,
  Share2,
  MoreVertical,
  Camera,
  Music,
  Coffee,
  Wine,
  Gamepad2,
  BookOpen,
  Palette,
  Dumbbell,
  Globe as GlobeIcon,
  Tag,
  UserPlus,
  Shield,
  Crown,
  TrendingUp,
  Calendar,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Community {
  id: string
  name: string
  description: string
  category: string
  image: string
  members: number
  isPrivate: boolean
  isPremium: boolean
  isJoined: boolean
  isLiked: boolean
  tags: string[]
  recentActivity: {
    type: "post" | "event" | "member"
    content: string
    timestamp: string
    user?: {
      name: string
      avatar: string
    }
  }[]
  moderators: {
    name: string
    avatar: string
    role: "admin" | "moderator"
  }[]
}

interface CommunitiesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommunitiesDialog({ open, onOpenChange }: CommunitiesDialogProps) {
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: "1",
      name: "Casais Livres SP",
      description: "Comunidade para casais que vivem relacionamentos abertos em São Paulo. Compartilhe experiências, organize encontros e conecte-se com pessoas que pensam como você.",
      category: "Social",
      image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
      members: 1247,
      isPrivate: false,
      isPremium: false,
      isJoined: true,
      isLiked: true,
      tags: ["casais", "são paulo", "relacionamentos"],
      recentActivity: [
        {
          type: "post",
          content: "Novo post: Dicas para o primeiro encontro com outro casal",
          timestamp: "2h",
          user: {
            name: "Amanda & Carlos",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png"
          }
        },
        {
          type: "event",
          content: "Evento criado: Encontro mensal no próximo sábado",
          timestamp: "4h",
          user: {
            name: "Lisa & João",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png"
          }
        },
        {
          type: "member",
          content: "15 novos membros se juntaram",
          timestamp: "1 dia"
        }
      ],
      moderators: [
        {
          name: "Amanda & Carlos",
          avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
          role: "admin"
        },
        {
          name: "Rafael Alves",
          avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
          role: "moderator"
        }
      ]
    },
    {
      id: "2",
      name: "Fotografia Íntima",
      description: "Grupo para fotógrafos e modelos que trabalham com fotografia artística e íntima. Compartilhe técnicas, organize workshops e conecte-se com profissionais.",
      category: "Arte",
      image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto",
      members: 892,
      isPrivate: true,
      isPremium: true,
      isJoined: false,
      isLiked: false,
      tags: ["fotografia", "arte", "profissional"],
      recentActivity: [
        {
          type: "post",
          content: "Workshop de fotografia em Cascais - vagas limitadas",
          timestamp: "1h",
          user: {
            name: "Lisa & João",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png"
          }
        }
      ],
      moderators: [
        {
          name: "Lisa & João",
          avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
          role: "admin"
        }
      ]
    },
    {
      id: "3",
      name: "Liberdade e Respeito",
      description: "Fórum para discussões sobre relacionamentos modernos, liberdade sexual e respeito mútuo. Um espaço seguro para compartilhar experiências e aprender.",
      category: "Discussão",
      image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png",
      members: 2156,
      isPrivate: false,
      isPremium: false,
      isJoined: true,
      isLiked: true,
      tags: ["discussão", "liberdade", "respeito"],
      recentActivity: [
        {
          type: "post",
          content: "Nova discussão: Como estabelecer limites em relacionamentos abertos",
          timestamp: "30 min",
          user: {
            name: "Miguel Santos",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png"
          }
        }
      ],
      moderators: [
        {
          name: "Miguel Santos",
          avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
          role: "admin"
        }
      ]
    }
  ])

  const [createCommunityOpen, setCreateCommunityOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("discover")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    { id: "all", name: "Todas", icon: GlobeIcon },
    { id: "social", name: "Social", icon: Users },
    { id: "arte", name: "Arte", icon: Palette },
    { id: "discussão", name: "Discussão", icon: MessageCircle },
    { id: "fitness", name: "Fitness", icon: Dumbbell },
    { id: "cultura", name: "Cultura", icon: BookOpen },
    { id: "musica", name: "Música", icon: Music },
    { id: "games", name: "Games", icon: Gamepad2 },
  ]

  const handleJoin = (communityId: string) => {
    setCommunities(prev =>
      prev.map(community =>
        community.id === communityId
          ? {
              ...community,
              isJoined: !community.isJoined,
              members: community.isJoined ? community.members - 1 : community.members + 1
            }
          : community
      )
    )
  }

  const handleLike = (communityId: string) => {
    setCommunities(prev =>
      prev.map(community =>
        community.id === communityId
          ? { ...community, isLiked: !community.isLiked }
          : community
      )
    )
  }

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || community.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const joinedCommunities = communities.filter(c => c.isJoined)
  const recommendedCommunities = communities.filter(c => !c.isJoined)

  const CreateCommunityForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      category: "",
      isPrivate: false,
      tags: ""
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      // Implementar criação da comunidade
      setCreateCommunityOpen(false)
    }

    return (
      <Dialog open={createCommunityOpen} onOpenChange={setCreateCommunityOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Criar Nova Comunidade
            </DialogTitle>
            <DialogDescription>
              Crie um espaço para conectar pessoas com interesses similares
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Comunidade</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Casais Livres SP"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <category.icon className="w-4 h-4" />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva sua comunidade..."
                rows={4}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Ex: casais, são paulo, relacionamentos"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" className="flex-1">
                Criar Comunidade
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreateCommunityOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 sm:p-6 bg-white dark:bg-gray-900">
          <DialogHeader className="p-4 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Comunidades
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Conecte-se com grupos que compartilham seus interesses
                </DialogDescription>
              </div>
              <Button onClick={() => setCreateCommunityOpen(true)} size="sm" className="text-xs">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Criar Comunidade</span>
                <span className="sm:hidden">Criar</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="flex flex-col h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-2 sm:mx-4 mt-2 sm:mt-4">
                <TabsTrigger value="discover" className="text-xs">Descobrir</TabsTrigger>
                <TabsTrigger value="joined" className="text-xs">Minhas</TabsTrigger>
                <TabsTrigger value="trending" className="text-xs">Trending</TabsTrigger>
              </TabsList>

              <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 px-2 sm:px-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar comunidades..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 sm:pl-10 text-sm"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 text-sm">
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <category.icon className="w-4 h-4" />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="discover" className="flex-1 mt-2 sm:mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto max-h-[60vh] px-2 sm:px-4">
                  {filteredCommunities.filter(c => !c.isJoined).map((community) => (
                    <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={community.image}
                          alt={community.name}
                          className="w-full h-32 sm:h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          {community.isPremium && (
                            <Badge variant="secondary" className="bg-yellow-500 text-white text-xs px-1 py-0.5">
                              <Star className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Premium</span>
                            </Badge>
                          )}
                          {community.isPrivate && (
                            <Badge variant="secondary" className="bg-gray-500 text-white text-xs px-1 py-0.5">
                              <Lock className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Privada</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardHeader className="p-3 sm:p-4">
                        <CardTitle className="text-base sm:text-lg line-clamp-1">{community.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                          {community.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{community.members.toLocaleString()} membros</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {community.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
                                #{tag}
                              </Badge>
                            ))}
                            {community.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                +{community.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleJoin(community.id)}
                              className="flex-1 text-xs"
                            >
                              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Entrar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(community.id)}
                            >
                              <Heart className={cn("w-3 h-3 sm:w-4 sm:h-4", community.isLiked && "fill-red-500 text-red-500")} />
                            </Button>
                            <Button variant="ghost" size="sm" className="hidden sm:flex">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="joined" className="flex-1 mt-2 sm:mt-4">
                <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[60vh] px-2 sm:px-4">
                  {joinedCommunities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                      <p className="text-sm sm:text-base">Você ainda não participa de comunidades</p>
                      <Button onClick={() => setActiveTab("discover")} className="mt-2 text-xs">
                        Descobrir Comunidades
                      </Button>
                    </div>
                  ) : (
                    joinedCommunities.map((community) => (
                      <Card key={community.id} className="overflow-hidden">
                        <div className="flex">
                          <img
                            src={community.image}
                            alt={community.name}
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
                          />
                          <div className="flex-1 p-3 sm:p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                  <h3 className="font-semibold text-sm sm:text-lg line-clamp-1">{community.name}</h3>
                                  {community.isPremium && (
                                    <Badge variant="secondary" className="bg-yellow-500 text-white text-xs px-1 py-0.5">
                                      <Star className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">Premium</span>
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2">
                                  {community.description}
                                </p>
                                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                  <span>{community.members.toLocaleString()} membros</span>
                                  <span>•</span>
                                  <span>{community.recentActivity.length} atividades recentes</span>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="text-xs">
                                Ver Comunidade
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="trending" className="flex-1 mt-2 sm:mt-4">
                <div className="text-center py-8 text-gray-500 px-4">
                  <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">Comunidades em alta em breve</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      
      <CreateCommunityForm />
    </>
  )
} 