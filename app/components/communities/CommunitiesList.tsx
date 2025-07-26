"use client"

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Button, Chip, Input, Avatar } from '@heroui/react'
import { 
  Users, 
  Search,
  Plus,
  Crown,
  Lock,
  Globe,
  TrendingUp,
  Calendar,
  MapPin,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { useCanAccess } from '@/lib/plans/hooks'
import CreateCommunity from './CreateCommunity'

interface Community {
  id: string
  name: string
  description: string
  avatar_url?: string
  cover_image_url?: string
  category: string
  type: 'public' | 'private' | 'premium'
  location?: string
  creator: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    is_verified: boolean
  }
  stats: {
    members_count: number
    posts_count: number
    active_members: number
  }
  is_member: boolean
  membership_status?: 'pending' | 'approved' | 'rejected'
  created_at: string
}

interface CommunitiesListProps {
  view?: 'all' | 'my_communities' | 'trending'
}

const COMMUNITY_CATEGORIES = [
  'Tecnologia', 'Arte', 'Música', 'Esporte', 'Culinária', 'Viagem',
  'Negócios', 'Educação', 'Saúde', 'Fitness', 'Gaming', 'Fotografia',
  'Literatura', 'Cinema', 'Moda', 'Lifestyle', 'Outro'
]

export default function CommunitiesList({ view = 'all' }: CommunitiesListProps) {
  const { user } = useAuth()
  const canAccess = useCanAccess()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [joinLoading, setJoinLoading] = useState<string | null>(null)

  useEffect(() => {
    loadCommunities()
  }, [view, selectedCategory])

  const loadCommunities = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (view === 'my_communities') params.append('my_communities', 'true')
      if (view === 'trending') params.append('trending', 'true')
      if (selectedCategory) params.append('category', selectedCategory)
      
      const response = await fetch(`/api/communities?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar comunidades')
      
      const data = await response.json()
      setCommunities(data.communities || [])
    } catch (error) {
      console.error('Erro ao carregar comunidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) return

    setJoinLoading(communityId)
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Erro ao entrar na comunidade')

      const data = await response.json()
      
      // Atualizar comunidade local
      setCommunities(communities.map(community => 
        community.id === communityId 
          ? { 
              ...community, 
              is_member: data.status === 'approved',
              membership_status: data.status,
              stats: {
                ...community.stats,
                members_count: data.status === 'approved' 
                  ? community.stats.members_count + 1 
                  : community.stats.members_count
              }
            }
          : community
      ))
    } catch (error) {
      console.error('Erro ao entrar na comunidade:', error)
    } finally {
      setJoinLoading(null)
    }
  }

  const handleCreateCommunity = () => {
    // Verificar se pode criar comunidades
    if (!canAccess.features.canCreateCommunities) {
      // Mostrar modal de upgrade
      return
    }
    
    setShowCreateModal(true)
  }

  const getCommunityTypeIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-600" />
      case 'private':
        return <Lock className="w-4 h-4 text-gray-600" />
      case 'premium':
        return <Crown className="w-4 h-4 text-yellow-600" />
      default:
        return <Globe className="w-4 h-4 text-green-600" />
    }
  }

  const getJoinButton = (community: Community) => {
    if (!user) {
      return (
        <Button variant="outline" size="sm">
          Fazer Login
        </Button>
      )
    }

    if (community.is_member) {
      return (
        <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
          Membro
        </Button>
      )
    }

    if (community.membership_status === 'pending') {
      return (
        <Button variant="outline" size="sm" disabled>
          Pendente
        </Button>
      )
    }

    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleJoinCommunity(community.id)}
        disabled={joinLoading === community.id}
      >
        {joinLoading === community.id ? 'Entrando...' : 'Entrar'}
      </Button>
    )
  }

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {view === 'all' && 'Todas as Comunidades'}
            {view === 'my_communities' && 'Minhas Comunidades'}
            {view === 'trending' && 'Comunidades em Alta'}
          </h1>
          <p className="text-gray-600">
            Conecte-se com pessoas que compartilham seus interesses
          </p>
        </div>
        
        <Button onClick={handleCreateCommunity} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Criar Comunidade
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar comunidades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas as categorias</option>
          {COMMUNITY_CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Communities Grid */}
      {filteredCommunities.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma comunidade encontrada</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory
                ? 'Tente ajustar os filtros de busca'
                : view === 'my_communities'
                  ? 'Você ainda não é membro de nenhuma comunidade'
                  : 'Seja o primeiro a criar uma comunidade'
              }
            </p>
            {canAccess.features.canCreateCommunities && (
              <Button onClick={handleCreateCommunity}>
                Criar Primeira Comunidade
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              {community.cover_image_url && (
                <div className="h-32 overflow-hidden">
                  <img 
                    src={community.cover_image_url} 
                    alt={community.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={community.avatar_url} />
                    <AvatarFallback>
                      {community.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg line-clamp-1">
                        {community.name}
                      </CardTitle>
                      {getCommunityTypeIcon(community.type)}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {community.category}
                      </Badge>
                      {community.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {community.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {community.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{community.stats.members_count} membros</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{community.stats.active_members} ativos</span>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={community.creator.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {community.creator.full_name?.charAt(0) || community.creator.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">
                      por {community.creator.full_name || community.creator.username}
                    </span>
                  </div>

                  {getJoinButton(community)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateModal && (
        <CreateCommunity
          onClose={() => setShowCreateModal(false)}
          onCommunityCreated={(newCommunity) => {
            setCommunities([newCommunity, ...communities])
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}