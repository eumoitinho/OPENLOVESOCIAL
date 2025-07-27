"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Heart, 
  Eye, 
  Calendar,
  BarChart3,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/app/lib/supabase-browser"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalViews: number
  growthRate: number
  engagementRate: number
  topPosts: Array<{
    id: string
    title: string
    likes: number
    comments: number
    views: number
  }>
  userActivity: Array<{
    date: string
    users: number
    posts: number
    interactions: number
  }>
}

interface AnalyticsDashboardProps {
  className?: string
  isAdmin?: boolean
}

export function AnalyticsDashboard({ className, isAdmin = false }: AnalyticsDashboardProps) {
  const { user } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const supabase = createClient()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simular dados de analytics (em produção, isso viria de APIs reais)
        const mockData: AnalyticsData = {
          totalUsers: 15420,
          activeUsers: 8234,
          totalPosts: 45678,
          totalLikes: 234567,
          totalComments: 12345,
          totalViews: 987654,
          growthRate: 12.5,
          engagementRate: 8.7,
          topPosts: [
            {
              id: "1",
              title: "Como conheci meu amor no OpenLove",
              likes: 1234,
              comments: 89,
              views: 5678
            },
            {
              id: "2",
              title: "Dicas para um primeiro encontro perfeito",
              likes: 987,
              comments: 67,
              views: 4321
            },
            {
              id: "3",
              title: "História de sucesso: 2 anos juntos",
              likes: 756,
              comments: 45,
              views: 3456
            }
          ],
          userActivity: [
            { date: "2024-01-01", users: 1200, posts: 450, interactions: 2300 },
            { date: "2024-01-02", users: 1350, posts: 520, interactions: 2800 },
            { date: "2024-01-03", users: 1420, posts: 480, interactions: 2600 },
            { date: "2024-01-04", users: 1580, posts: 600, interactions: 3200 },
            { date: "2024-01-05", users: 1650, posts: 580, interactions: 3100 },
            { date: "2024-01-06", users: 1720, posts: 620, interactions: 3400 },
            { date: "2024-01-07", users: 1800, posts: 650, interactions: 3600 }
          ]
        }

        setData(mockData)

      } catch (err) {
        console.error('Erro ao buscar analytics:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAnalytics()
    }
  }, [user, timeRange, supabase])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    return num > 0 ? `+${num}%` : `${num}%`
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className || ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={`text-center py-12 ${className || ''}`}>
        <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Erro ao carregar analytics
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Visão geral do desempenho da plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 dias
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 dias
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90 dias
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(data.totalUsers)}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
              <span className="text-green-500">{formatPercentage(data.growthRate)}</span>
              <span className="ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Usuários Ativos
            </CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(data.activeUsers)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Últimos 30 dias
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total de Posts
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(data.totalPosts)}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
              <span className="text-green-500">+15.2%</span>
              <span className="ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Engajamento
            </CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {data.engagementRate}%
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
              <span className="text-green-500">+2.1%</span>
              <span className="ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Curtidas
            </CardTitle>
            <Heart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(data.totalLikes)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total de curtidas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Comentários
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(data.totalComments)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total de comentários
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Visualizações
            </CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(data.totalViews)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total de visualizações
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Dados Detalhados */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
          <TabsTrigger value="top-posts">Posts Populares</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade dos Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.userActivity.map((day, index) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {new Date(day.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{day.users}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        <span>{day.posts}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{day.interactions}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Posts Mais Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{formatNumber(post.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{formatNumber(post.comments)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatNumber(post.views)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      #{index + 1}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg text-white">
                  <h4 className="font-semibold mb-2">Crescimento de Usuários</h4>
                  <p className="text-3xl font-bold">{formatPercentage(data.growthRate)}</p>
                  <p className="text-sm opacity-90">vs mês anterior</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg text-white">
                  <h4 className="font-semibold mb-2">Taxa de Engajamento</h4>
                  <p className="text-3xl font-bold">{data.engagementRate}%</p>
                  <p className="text-sm opacity-90">média mensal</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg text-white">
                  <h4 className="font-semibold mb-2">Posts por Dia</h4>
                  <p className="text-3xl font-bold">1,234</p>
                  <p className="text-sm opacity-90">média dos últimos 7 dias</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg text-white">
                  <h4 className="font-semibold mb-2">Tempo Médio</h4>
                  <p className="text-3xl font-bold">12m</p>
                  <p className="text-sm opacity-90">tempo na plataforma</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
