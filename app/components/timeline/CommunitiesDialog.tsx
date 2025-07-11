"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Input } from "../../../components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/motion-tabs"
import { 
  Search, 
  Users, 
  Heart, 
  MapPin, 
  Calendar, 
  Star, 
  Plus,
  Globe,
  Lock,
  TrendingUp
} from "lucide-react"

interface CommunitiesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Community {
  id: string
  name: string
  description: string
  avatar: string
  coverImage: string
  members: number
  isPrivate: boolean
  category: string
  location: string
  tags: string[]
  isJoined: boolean
  isModerator: boolean
}

export const CommunitiesDialog = function CommunitiesDialog({ open, onOpenChange }: CommunitiesDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("discover")
  // Remover MOCK_COMMUNITIES
  const [communities, setCommunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const fetchCommunities = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/communities")
        if (!res.ok) throw new Error("Erro ao buscar comunidades")
        const json = await res.json()
        setCommunities(json.data || [])
      } catch (err: any) {
        setError(err.message || "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    fetchCommunities()
  }, [open])

  const filteredCommunities = communities.filter((community: any) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.tags && community.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  )

  const joinedCommunities = communities.filter(c => c.isJoined)
  const discoverCommunities = communities.filter(c => !c.isJoined)

  const handleJoinCommunity = (communityId: string) => {
    console.log("Entrando na comunidade:", communityId)
    // Implementar lógica de entrar na comunidade
  }

  const handleLeaveCommunity = (communityId: string) => {
    console.log("Saindo da comunidade:", communityId)
    // Implementar lógica de sair da comunidade
  }

  const CommunityCard = ({ community }: { community: Community }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-32">
        <img
          src={community.coverImage}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-2 right-2">
          {community.isPrivate ? (
            <Badge variant="secondary" className="bg-black/50 text-white">
              <Lock className="w-3 h-3 mr-1" />
              Privada
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-green-500/20 text-green-600">
              <Globe className="w-3 h-3 mr-1" />
              Pública
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-12 h-12 border-2 border-white shadow-md">
            <AvatarImage src={community.avatar} alt={community.name} />
            <AvatarFallback className="text-sm font-semibold">
              {community.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{community.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{community.category}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {community.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            {community.members.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {community.location}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {community.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {community.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{community.tags.length - 3}
            </Badge>
          )}
        </div>

        <Button
          variant={community.isJoined ? "outline" : "default"}
          size="sm"
          className="w-full"
          onClick={() => community.isJoined 
            ? handleLeaveCommunity(community.id)
            : handleJoinCommunity(community.id)
          }
        >
          {community.isJoined ? "Sair" : "Entrar"}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Comunidades
          </DialogTitle>
          <DialogDescription>
            Descubra e participe de comunidades que compartilham seus interesses
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar comunidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="discover">Descobrir</TabsTrigger>
              <TabsTrigger value="joined">Minhas Comunidades</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh]">
                {filteredCommunities
                  .filter(c => !c.isJoined)
                  .map((community) => (
                    <CommunityCard key={community.id} community={community} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="joined" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh]">
                {filteredCommunities
                  .filter(c => c.isJoined)
                  .map((community) => (
                    <CommunityCard key={community.id} community={community} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh]">
                {communities
                  .sort((a, b) => b.members - a.members)
                  .slice(0, 6)
                  .map((community) => (
                    <CommunityCard key={community.id} community={community} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Create Community Button */}
          <div className="mt-4 pt-4 border-t">
            <Button className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Criar Nova Comunidade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 