"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Calendar,
  Star,
  UserPlus,
  Bookmark,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  BadgeCheck,
  Users,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Map,
  Camera,
  Edit,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/components/auth/AuthProvider"

// Mock data para perfis
const mockProfiles = [
  {
    id: 1,
    name: "Ana Silva",
    username: "@anasilva",
    profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
    backgroundImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=200&fit=crop",
    verified: true,
    tags: ["Música", "Viagem", "Fotografia"],
    location: "São Paulo, SP",
    joinedDate: "2023",
    description: "Apaixonada por música e viagens. Sempre em busca de novas experiências e conexões autênticas.",
    rating: 4.8,
    followers: 1247,
    following: 892,
    isOnline: true,
    lastSeen: "2 min atrás",
    interests: ["Música", "Viagem", "Fotografia", "Culinária", "Arte"],
    languages: ["Português", "Inglês", "Espanhol"],
    relationshipStatus: "Solteira",
    age: 28,
    occupation: "Designer",
    education: "Universidade de São Paulo",
  },
  {
    id: 2,
    name: "Carlos Mendes",
    username: "@carlosmendes",
    profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
    backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
    verified: false,
    tags: ["Esporte", "Tecnologia", "Leitura"],
    location: "Rio de Janeiro, RJ",
    joinedDate: "2022",
    description: "Entusiasta de tecnologia e esportes. Gosto de ler e aprender coisas novas todos os dias.",
    rating: 4.5,
    followers: 856,
    following: 567,
    isOnline: false,
    lastSeen: "1 hora atrás",
    interests: ["Esporte", "Tecnologia", "Leitura", "Cinema", "Jogos"],
    languages: ["Português", "Inglês"],
    relationshipStatus: "Solteiro",
    age: 32,
    occupation: "Desenvolvedor",
    education: "PUC-Rio",
  },
  {
    id: 3,
    name: "Mariana Costa",
    username: "@marianacosta",
    profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
    backgroundImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=200&fit=crop",
    verified: true,
    tags: ["Arte", "Dança", "Yoga"],
    location: "Belo Horizonte, MG",
    joinedDate: "2024",
    description: "Artista e instrutora de yoga. Acredito na conexão entre corpo, mente e espírito.",
    rating: 4.9,
    followers: 2103,
    following: 445,
    isOnline: true,
    lastSeen: "Agora",
    interests: ["Arte", "Dança", "Yoga", "Meditação", "Natureza"],
    languages: ["Português", "Inglês", "Francês"],
    relationshipStatus: "Solteira",
    age: 26,
    occupation: "Artista",
    education: "Escola de Belas Artes",
  },
  {
    id: 4,
    name: "Pedro Santos",
    username: "@pedrosantos",
    profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
    backgroundImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=200&fit=crop",
    verified: false,
    tags: ["Culinária", "Vinho", "História"],
    location: "Porto Alegre, RS",
    joinedDate: "2023",
    description: "Chef de cozinha apaixonado por vinhos e história. Adoro compartilhar experiências gastronômicas.",
    rating: 4.7,
    followers: 1567,
    following: 723,
    isOnline: false,
    lastSeen: "3 horas atrás",
    interests: ["Culinária", "Vinho", "História", "Viagem", "Literatura"],
    languages: ["Português", "Inglês", "Italiano"],
    relationshipStatus: "Solteiro",
    age: 35,
    occupation: "Chef",
    education: "Escola de Gastronomia",
  },
]

export default function ProfilesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profiles, setProfiles] = useState(mockProfiles)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedAge, setSelectedAge] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("recent")

  const locations = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Porto Alegre, RS"]
  const ageRanges = ["18-25", "26-35", "36-45", "46+"]
  const allInterests = ["Música", "Viagem", "Fotografia", "Esporte", "Tecnologia", "Leitura", "Arte", "Dança", "Yoga", "Culinária", "Vinho", "História"]

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLocation = !selectedLocation || profile.location === selectedLocation
    
    const matchesAge = !selectedAge || (() => {
      const [min, max] = selectedAge.split("-").map(Number)
      if (selectedAge === "46+") return profile.age >= 46
      return profile.age >= min && profile.age <= max
    })()
    
    const matchesInterests = selectedInterests.length === 0 || 
                           selectedInterests.some(interest => profile.interests.includes(interest))
    
    return matchesSearch && matchesLocation && matchesAge && matchesInterests
  })

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "followers":
        return b.followers - a.followers
      case "recent":
        return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
      default:
        return 0
    }
  })

  const handleFollow = (profileId: number) => {
    setProfiles(prev => prev.map(profile => 
      profile.id === profileId 
        ? { ...profile, followers: profile.followers + 1 }
        : profile
    ))
  }

  const handleSave = (profileId: number) => {
    console.log("Salvando perfil:", profileId)
  }

  const ProfileCard = ({ profile }: { profile: any }) => (
    <Card className="relative w-full overflow-hidden shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
      {/* Background Header */}
      <div className="relative h-32 sm:h-40">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Online Status */}
        <div className="absolute top-3 right-3">
          <div className={cn(
            "w-3 h-3 rounded-full border-2 border-white",
            profile.isOnline ? "bg-green-500" : "bg-gray-400"
          )} />
        </div>
      </div>

      <CardContent className="relative px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Profile Avatar - Overlapping the background */}
        <div className="flex justify-center -mt-12 sm:-mt-16 mb-3 sm:mb-4">
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-lg">
            <AvatarImage src={profile.profileImage || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback className="text-lg sm:text-xl font-semibold">
              {profile.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Profile Info */}
        <div className="text-center space-y-2 mb-4">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {profile.name}
            </h3>
            {profile.verified && <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 fill-blue-500 text-white flex-shrink-0" />}
          </div>

          <p className="text-sm sm:text-base text-muted-foreground font-medium truncate">
            {profile.username}
          </p>

          {/* Tags */}
          {profile.tags && (
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {profile.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                  {tag}
                </Badge>
              ))}
              {profile.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{profile.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mt-3">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-24 sm:max-w-none">{profile.location}</span>
              </div>
            )}
            {profile.age && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{profile.age} anos</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-4 line-clamp-2">
          {profile.description}
        </p>

        <Separator className="my-4" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-gray-900 dark:text-white">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {profile.rating}
            </div>
            <div className="text-xs text-muted-foreground">Avaliação</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{profile.followers}</div>
            <div className="text-xs text-muted-foreground">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{profile.following}</div>
            <div className="text-xs text-muted-foreground">Seguindo</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1" size="sm" onClick={() => handleFollow(profile.id)}>
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="text-sm">Seguir</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSave(profile.id)}>
            <Bookmark className="w-4 h-4 mr-2" />
            <span className="text-sm">Salvar</span>
          </Button>
          <Button variant="outline" size="sm">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <h1 className="text-lg font-semibold">Perfis</h1>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar perfis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Localização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAge} onValueChange={setSelectedAge}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Idade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {ageRanges.map(age => (
                    <SelectItem key={age} value={age}>{age}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais Recentes</SelectItem>
                  <SelectItem value="rating">Melhor Avaliados</SelectItem>
                  <SelectItem value="followers">Mais Seguidores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Interest Tags */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {allInterests.map(interest => (
                <Button
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedInterests(prev => 
                      prev.includes(interest) 
                        ? prev.filter(i => i !== interest)
                        : [...prev, interest]
                    )
                  }}
                >
                  {interest}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        <div className="mb-4">
          <p className="text-muted-foreground">
            Encontrados {sortedProfiles.length} perfis
          </p>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedProfiles.map((profile) => (
              <Card key={profile.id} className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-48 h-32 sm:h-auto">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${profile.backgroundImage})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Avatar */}
                  <div className="absolute bottom-2 left-2">
                    <Avatar className="w-12 h-12 border-2 border-white">
                      <AvatarImage src={profile.profileImage} />
                      <AvatarFallback>
                        {profile.name.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <CardContent className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{profile.name}</h3>
                        {profile.verified && <BadgeCheck className="w-4 h-4 fill-blue-500 text-white" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{profile.username}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {profile.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{profile.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{profile.followers} seguidores</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleFollow(profile.id)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Seguir
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Mensagem
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {sortedProfiles.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum perfil encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros de busca para encontrar mais perfis.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 