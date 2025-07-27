"use client"

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Chip, Progress } from "@heroui/react"
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Users, 
  TrendingUp, 
  Calendar,
  Crown,
  Star,
  Lock,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCanAccess } from '@/lib/plans/hooks'
import PremiumFeature from '@/app/components/premium/PremiumFeature'

interface PlanStatsProps {
  userId?: string
  className?: string
}

interface UserStats {
  profileViews: number
  likes: number
  comments: number
  followers: number
  posts: number
  engagementRate: number
  reachGrowth: number
  topPerformingPost?: {
    id: string
    content: string
    likes: number
    comments: number
  }
}

export default function PlanStats({ userId, className }: PlanStatsProps) {
  const canAccess = useCanAccess()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/analytics/stats${userId ? `?userId=${userId}` : ''}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatsForPlan = () => {
    if (!stats) return null

    const baseStats = [
      {
        title: 'Visualizações do Perfil',
        value: stats.profileViews,
        icon: Eye,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        available: true
      },
      {
        title: 'Curtidas Recebidas',
        value: stats.likes,
        icon: Heart,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        available: true
      },
      {
        title: 'Comentários',
        value: stats.comments,
        icon: MessageCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        available: true
      },
      {
        title: 'Seguidores',
        value: stats.followers,
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        available: true
      }
    ]

    const goldStats = [
      {
        title: 'Taxa de Engajamento',
        value: `${stats.engagementRate.toFixed(1)}%`,
        icon: TrendingUp,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        available: canAccess.canSendMessages
      },
      {
        title: 'Crescimento do Alcance',
        value: `+${stats.reachGrowth}%`,
        icon: BarChart3,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        available: canAccess.canSendMessages
      }
    ]

    const diamanteStats = [
      {
        title: 'Análise Detalhada',
        value: 'Disponível',
        icon: Calendar,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        available: canAccess.canAccessAnalytics
      }
    ]

    return [...baseStats, ...goldStats, ...diamanteStats]
  }

  const statsData = getStatsForPlan()

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="w-5 h-5" />
            Estatísticas
          </h3>
          <Chip variant="bordered" className="flex items-center gap-1">
            {!canAccess.canSendMessages && <Lock className="w-3 h-3" />}
            {canAccess.canSendMessages && !canAccess.canAccessAnalytics && <Crown className="w-3 h-3 text-yellow-500" />}
            {canAccess.canAccessAnalytics && <Star className="w-3 h-3 text-purple-500" />}
            {!canAccess.canSendMessages ? 'Gratuito' : 
             !canAccess.canAccessAnalytics ? 'Open Ouro' : 'Open Diamante'}
          </Chip>
        </div>
      </CardHeader>

      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statsData?.map((stat, index) => (
            <div key={index}>
              {stat.available ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className={cn("p-2 rounded-full", stat.bgColor)}>
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {stat.title}
                    </p>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ) : (
                <PremiumFeature
                  feature="advanced_analytics"
                  requiredPlan={stat.title.includes('Análise') ? 'diamante' : 'gold'}
                  showUpgradeButton={false}
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className={cn("p-2 rounded-full", stat.bgColor)}>
                      <stat.icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {stat.title}
                      </p>
                      <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </PremiumFeature>
              )}
            </div>
          ))}
        </div>

        {/* Progress indicators for premium plans */}
        {canAccess.canSendMessages && stats && (
          <div className="mt-6 space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Meta de Engajamento</span>
                <span className="font-medium">{stats.engagementRate.toFixed(1)}% / 5%</span>
              </div>
              <Progress value={Math.min(stats.engagementRate * 20, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Crescimento Mensal</span>
                <span className="font-medium">{stats.reachGrowth}% / 10%</span>
              </div>
              <Progress value={Math.min(stats.reachGrowth * 10, 100)} className="h-2" />
            </div>
          </div>
        )}

        {/* Top performing post for Diamante users */}
        {canAccess.canAccessAnalytics && stats?.topPerformingPost && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Post com Melhor Performance
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {stats.topPerformingPost.content}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-pink-500" />
                {stats.topPerformingPost.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                {stats.topPerformingPost.comments}
              </span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
} 