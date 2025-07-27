'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardBody, Button, Badge, Input } from "@heroui/react"
import { Search, Plus, Users, Crown, Lock, TrendingUp } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { usePaywall } from "@/lib/plans/paywall"
import { useCanAccess } from "@/lib/plans/hooks"
import PaywallModal from '@/components/plan-limits/PaywallModal'
import PlanIndicator from '@/components/plan-limits/PlanIndicator'
import { Tabs } from "@/components/ui/tabs"

interface Community {
  id: string
  name: string
  slug: string
  description: string
  category_id: string
  image_url: string | null
  banner_url: string | null
  is_private: boolean
  is_verified: boolean
  member_count: number
  created_by: string
  created_at: string
  updated_at: string
  membership?: {
    id: string
    role: string
    joined_at: string
    status: string
  }
}

interface CommunityUsage {
  communitiesJoined: number
  maxCommunities: number
  canJoinMore: boolean
}

export default function CommunitiesPage() {
  const { user } = useAuth()
  const { paywall, requireFeature, closePaywall } = usePaywall()
  const canAccess = useCanAccess()
  
  const [activeTab, setActiveTab] = useState('discover')
  const [searchTerm, setSearchTerm] = useState('')
  const [communities, setCommunities] = useState<Community[]>([])
  const [myCommunities, setMyCommunities] = useState<Community[]>([])
  const [usage, setUsage] = useState<CommunityUsage>({ communitiesJoined: 0, maxCommunities: 0, canJoinMore: false })
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)

  // Buscar comunidades
  useEffect(() => {
    if (activeTab === 'discover') {
      fetchCommunities()
    } else if (activeTab === 'my-communities') {
      fetchMyCommunities()
    }
  }, [activeTab, searchTerm])

  const fetchCommunities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (canAccess.currentPlan === 'free') params.append('verified', 'true')
      
      const response = await fetch(`/api/communities?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setCommunities(data.communities || [])
      }
    } catch (error) {
      console.error('Erro ao buscar comunidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyCommunities = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/communities/my')
      const data = await response.json()
      
      if (response.ok) {
        setMyCommunities(data.communities || [])
        setUsage(data.usage || { communitiesJoined: 0, maxCommunities: 0, canJoinMore: false })
      }
    } catch (error) {
      console.error('Erro ao buscar minhas comunidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) return
    
    // Verificar limitações usando paywall
    if (!requireFeature('join_community')) {
      return
    }
    
    setJoining(communityId)
    try {
      const response = await fetch('/api/communities/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId })
      })
      
      if (response.ok) {
        // Atualizar lista de comunidades
        fetchCommunities()
        fetchMyCommunities()
      } else {
        const error = await response.json()
        console.error('Erro ao participar:', error.error)
      }
    } catch (error) {
      console.error('Erro ao participar da comunidade:', error)
    } finally {
      setJoining(null)
    }
  }

  const handleCreateCommunity = () => {
    if (!requireFeature('create_community')) {
      return
    }
    
    // Implementar modal de criação de comunidade
    console.log('Criar comunidade...')
  }

  const CommunityCard = ({ community }: { community: Community }) => (
    <Card className="w-full">
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {community.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{community.name}</h3>
                {community.is_verified && (
                  <Badge color="primary" variant="flat" size="sm">
                    <Crown className="w-3 h-3 mr-1" />
                    Verificada
                  </Badge>
                )}
                {community.is_private && (
                  <Badge color="warning" variant="flat" size="sm">
                    <Lock className="w-3 h-3 mr-1" />
                    Privada
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{community.description}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{community.member_count} membros</span>
          </div>
          
          {activeTab === 'discover' && (
            <Button
              color="primary"
              size="sm"
              onPress={() => handleJoinCommunity(community.id)}
              isLoading={joining === community.id}
              disabled={joining === community.id}
            >
              {joining === community.id ? 'Participando...' : 'Participar'}
            </Button>
          )}
          
          {activeTab === 'my-communities' && community.membership && (
            <Badge 
              color={community.membership.role === 'admin' ? 'success' : 'default'} 
              variant="flat"
            >
              {community.membership.role === 'admin' ? 'Admin' : 
               community.membership.role === 'moderator' ? 'Moderador' : 'Membro'}
            </Badge>
          )}
        </div>
      </CardBody>
    </Card>
  )

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Comunidades</h2>
        <p className="text-gray-600 mb-4">Faça login para descobrir e participar de comunidades.</p>
        <Button color="primary">Fazer Login</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Comunidades</h1>
        <div className="flex items-center gap-4">
          <PlanIndicator variant="compact" />
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={handleCreateCommunity}
            disabled={!canAccess.canCreateCommunities}
          >
            Criar Comunidade
          </Button>
        </div>
      </div>

      <Tabs 
        selectedKey={activeTab} 
        onSelectionChange={(key) => setActiveTab(key as string)}
        className="mb-6"
      >
        <Tab key="discover" title="Descobrir">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Buscar comunidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                className="flex-1"
              />
              {canAccess.currentPlan === 'free' && (
                <Badge color="warning" variant="flat">
                  Apenas verificadas
                </Badge>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Carregando comunidades...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {communities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
                {communities.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Nenhuma comunidade encontrada</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Tab>
        
        <Tab key="my-communities" title="Minhas Comunidades">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium">
                  {usage.communitiesJoined} / {usage.maxCommunities === -1 ? '∞' : usage.maxCommunities} comunidades
                </span>
              </div>
              {!usage.canJoinMore && usage.maxCommunities > 0 && (
                <Badge color="danger" variant="flat">
                  Limite atingido
                </Badge>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Carregando suas comunidades...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
                {myCommunities.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Você ainda não participa de nenhuma comunidade</p>
                    <Button 
                      color="primary" 
                      variant="light" 
                      onPress={() => setActiveTab('discover')}
                      className="mt-2"
                    >
                      Descobrir Comunidades
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Tab>
      </Tabs>

      {/* Paywall Modal */}
      {paywall.config && (
        <PaywallModal
          isOpen={paywall.isOpen}
          onClose={closePaywall}
          feature={paywall.config.feature}
          title={paywall.config.title}
          description={paywall.config.description}
          requiredPlan={paywall.config.requiredPlan}
        />
      )}
    </div>
  )
}
