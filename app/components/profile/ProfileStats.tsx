"use client"

import React from 'react'
import { Card, CardBody, CardHeader, Chip } from '@heroui/react'
import { 
  Users, 
  UserPlus, 
  Eye, 
  FileText, 
  Crown, 
  Shield,
  Calendar,
  MapPin,
  Globe,
  Clock
} from 'lucide-react'

interface ProfileStatsProps {
  profile: {
    id: string
    username: string
    full_name: string
    bio?: string
    avatar_url?: string
    is_verified?: boolean
    is_premium?: boolean
    is_active?: boolean
    last_seen?: string
    created_at: string
    plano?: string
    stats?: {
      posts?: number
      followers?: number
      following?: number
      profile_views?: number
    }
    privacy?: {
      is_own_profile: boolean
      can_view_private_content: boolean
    }
  }
  canViewPrivateContent: boolean
}

export default function ProfileStats({ profile, canViewPrivateContent }: ProfileStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getLastSeenStatus = () => {
    if (!profile.last_seen) return 'Nunca visto'
    
    const lastSeen = new Date(profile.last_seen)
    const now = new Date()
    const diffInHours = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Online agora'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h atrás`
    if (diffInHours < 48) return 'Ontem'
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return lastSeen.toLocaleDateString('pt-BR')
  }

  const getPlanInfo = () => {
    const planConfig = {
      free: { label: 'Grátis', color: 'bg-gray-100 text-gray-800', icon: null },
      gold: { label: 'Gold', color: 'bg-yellow-100 text-yellow-800', icon: Crown },
      diamante: { label: 'Diamante', color: 'bg-blue-100 text-blue-800', icon: Crown },
      diamante_anual: { label: 'Diamante Anual', color: 'bg-purple-100 text-purple-800', icon: Crown }
    }
    
    return planConfig[profile.plano as keyof typeof planConfig] || planConfig.free
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(profile.stats?.posts || 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(profile.stats?.followers || 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Seguidores</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(profile.stats?.following || 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Seguindo</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {canViewPrivateContent ? formatNumber(profile.stats?.profile_views || 0) : '•••'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Visualizações</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Conta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Informações da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Membro desde</div>
                <div className="font-medium">{formatDate(profile.created_at)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Último acesso</div>
                <div className="font-medium">{getLastSeenStatus()}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {profile.is_verified && (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                <Shield className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
            )}
            
            {profile.is_premium && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
            
            {profile.plano && profile.plano !== 'free' && (() => {
              const planInfo = getPlanInfo()
              const IconComponent = planInfo.icon
              return (
                <Badge className={planInfo.color}>
                  {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                  {planInfo.label}
                </Badge>
              )
            })()}
            
            <Badge variant={profile.is_active ? 'default' : 'secondary'}>
              <div className={`w-2 h-2 rounded-full mr-2 ${profile.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
              {profile.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais - Apenas para próprio perfil */}
      {profile.privacy?.is_own_profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Privacidade & Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Perfil público</span>
              <Badge variant="outline">Sim</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Aceita mensagens</span>
              <Badge variant="outline">Seguidores</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Mostra última conexão</span>
              <Badge variant="outline">Não</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Indexar no Google</span>
              <Badge variant="outline">Sim</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}