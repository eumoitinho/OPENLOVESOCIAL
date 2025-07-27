"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Search,
  UserCheck,
  Heart,
  Crown,
  MessageCircle,
  UserPlus,
  UserX,
  Shield,
  CheckCircle,
  Star,
  Filter
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface Participant {
  id: string
  user_id: string
  username: string
  full_name: string
  avatar_url?: string
  is_verified: boolean
  status: 'going' | 'interested'
  role: 'creator' | 'moderator' | 'participant'
  joined_at: string
  can_manage?: boolean
}

interface EventParticipantsProps {
  eventId: string
  canManage?: boolean
  maxParticipants?: number
}

export default function EventParticipants({ 
  eventId, 
  canManage = false,
  maxParticipants 
}: EventParticipantsProps) {
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('going')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadParticipants()
  }, [eventId])

  const loadParticipants = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${eventId}/participants`)
      if (!response.ok) throw new Error('Erro ao carregar participantes')
      
      const data = await response.json()
      setParticipants(data.participants || [])
    } catch (error) {
      console.error('Erro ao carregar participantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const promoteToModerator = async (userId: string) => {
    if (!canManage) return

    setActionLoading(`promote-${userId}`)
    try {
      const response = await fetch(`/api/events/${eventId}/participants/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'moderator' })
      })

      if (response.ok) {
        setParticipants(participants.map(p => 
          p.user_id === userId ? { ...p, role: 'moderator' } : p
        ))
      }
    } catch (error) {
      console.error('Erro ao promover participante:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const removeParticipant = async (userId: string) => {
    if (!canManage) return

    setActionLoading(`remove-${userId}`)
    try {
      const response = await fetch(`/api/events/${eventId}/participants/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setParticipants(participants.filter(p => p.user_id !== userId))
      }
    } catch (error) {
      console.error('Erro ao remover participante:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const sendMessage = async (userId: string) => {
    try {
      // Criar conversa direta
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          participants: [userId]
        })
      })

      if (response.ok) {
        const conversation = await response.json()
        // Redirecionar para a conversa (implementar navegação)
        window.location.href = `/chat/${conversation.id}`
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
    }
  }

  const filterParticipants = (status: 'going' | 'interested') => {
    return participants
      .filter(p => p.status === status)
      .filter(p => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          p.username.toLowerCase().includes(query) ||
          p.full_name?.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        // Ordenar por: criador > moderadores > verificados > outros
        if (a.role === 'creator') return -1
        if (b.role === 'creator') return 1
        if (a.role === 'moderator' && b.role !== 'moderator') return -1
        if (b.role === 'moderator' && a.role !== 'moderator') return 1
        if (a.is_verified && !b.is_verified) return -1
        if (b.is_verified && !a.is_verified) return 1
        return a.full_name?.localeCompare(b.full_name || '') || 0
      })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'creator':
        return (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
            <Crown className="w-3 h-3 mr-1" />
            Criador
          </Badge>
        )
      case 'moderator':
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            <Shield className="w-3 h-3 mr-1" />
            Moderador
          </Badge>
        )
      default:
        return null
    }
  }

  const goingParticipants = filterParticipants('going')
  const interestedParticipants = filterParticipants('interested')

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="font-medium">
              {participants.length} participante{participants.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {maxParticipants && (
            <div className="text-sm text-gray-600">
              {goingParticipants.length}/{maxParticipants} confirmados
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar participantes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="going" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Confirmados ({goingParticipants.length})
          </TabsTrigger>
          <TabsTrigger value="interested" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Interessados ({interestedParticipants.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="going" className="mt-4">
          {goingParticipants.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum participante confirmado</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Nenhum participante encontrado com essa busca'
                  : 'Seja o primeiro a se inscrever!'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {goingParticipants.map((participant) => (
                <Card key={participant.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={participant.avatar_url} />
                          <AvatarFallback>
                            {participant.full_name?.charAt(0) || participant.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {participant.full_name || participant.username}
                            </span>
                            {participant.is_verified && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                            {getRoleIcon(participant.role)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              @{participant.username}
                            </span>
                            {getRoleBadge(participant.role)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {user?.id !== participant.user_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendMessage(participant.user_id)}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}

                        {canManage && participant.role === 'participant' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => promoteToModerator(participant.user_id)}
                            disabled={actionLoading === `promote-${participant.user_id}`}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        )}

                        {canManage && participant.role !== 'creator' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeParticipant(participant.user_id)}
                            disabled={actionLoading === `remove-${participant.user_id}`}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="interested" className="mt-4">
          {interestedParticipants.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum interessado</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Nenhum interessado encontrado com essa busca'
                  : 'Ainda não há pessoas interessadas no evento'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {interestedParticipants.map((participant) => (
                <Card key={participant.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={participant.avatar_url} />
                          <AvatarFallback>
                            {participant.full_name?.charAt(0) || participant.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {participant.full_name || participant.username}
                            </span>
                            {participant.is_verified && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                            <Star className="w-4 h-4 text-yellow-500" />
                          </div>
                          <span className="text-sm text-gray-600">
                            @{participant.username}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {user?.id !== participant.user_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendMessage(participant.user_id)}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}

                        {canManage && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeParticipant(participant.user_id)}
                            disabled={actionLoading === `remove-${participant.user_id}`}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Show limit warning if near capacity */}
      {maxParticipants && goingParticipants.length >= maxParticipants * 0.9 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                Evento quase lotado! {maxParticipants - goingParticipants.length} vaga{maxParticipants - goingParticipants.length !== 1 ? 's' : ''} restante{maxParticipants - goingParticipants.length !== 1 ? 's' : ''}.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
