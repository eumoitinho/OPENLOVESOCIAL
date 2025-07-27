"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Eye, Heart, MessageCircle, Users, Target, Calendar, Lightbulb, RefreshCw } from "lucide-react"
import { Card, CardBody, CardHeader, Button, Chip, Progress } from "@heroui/react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { Tabs } from "@/components/ui/tabs"
import { Tooltip } from "@/components/ui/tooltip"

interface Analytics {
  period: string
  analytics: {
    stats: {
      profileViews: number
      likesReceived: number
      superLikesReceived: number
      messagesReceived: number
      followersGained: number
      likesSent: number
      superLikesSent: number
      messagesSent: number
      profilesViewed: number
    }
    matches: number
    conversionRates: {
      viewToLike: number
      likeToMatch: number
      matchToMessage: number
    }
    dailyStats: Array<{
      date: string
      profileViews: number
      likesReceived: number
      likesSent: number
      messages: number
      totalInteractions: number
    }>
    demographics: {
      ageGroups: Record<string, number>
      genders: Record<string, number>
      totalAnalyzed: number
    }
    interestAnalysis: {
      commonInterests: Record<string, number>
      compatibilityScores: number[]
      averageCompatibility: number
    }
    summary: {
      totalInteractions: number
      averageInteractionsPerDay: number
      popularityScore: number
      activityScore: number
    }
  }
  insights: Array<{
    type: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    action: string | null
  }>
  profile: {
    completeness: number
    attractiveness: number
    activity: number
  }
}

interface ProfileAnalyticsProps {
  className?: string
}

export default function ProfileAnalytics({ className }: ProfileAnalyticsProps) {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/profiles/analytics?period=${period}&insights=true`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar analytics')
      }

      setAnalytics(data)
    } catch (err) {
      console.error('Erro ao buscar analytics:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm sm:text-base">Carregando analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar analytics</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics} variant="bordered" size="sm">
            Tentar novamente
          </Button>
        </div>
      </Card>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics do Perfil
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Insights sobre seu desempenho e compatibilidade
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          
          <Button onClick={fetchAnalytics} variant="bordered" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-medium">Completude do Perfil</h3>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.profile.completeness}%
                </div>
                <Progress value={analytics.profile.completeness} className="mt-2" />
              </div>
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-medium">Atratividade</h3>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(analytics.profile.attractiveness)}`}>
                  {analytics.profile.attractiveness}%
                </div>
                <Progress value={analytics.profile.attractiveness} className="mt-2" />
              </div>
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500 flex-shrink-0" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-medium">Atividade</h3>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(analytics.profile.activity)}`}>
                  {analytics.profile.activity}%
                </div>
                <Progress value={analytics.profile.activity} className="mt-2" />
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Visualizações</div>
                <div className="text-lg sm:text-xl font-bold">{formatNumber(analytics.analytics.stats.profileViews)}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Curtidas</div>
                <div className="text-lg sm:text-xl font-bold">{formatNumber(analytics.analytics.stats.likesReceived)}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mensagens</div>
                <div className="text-lg sm:text-xl font-bold">{formatNumber(analytics.analytics.stats.messagesReceived)}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Matches</div>
                <div className="text-lg sm:text-xl font-bold">{formatNumber(analytics.analytics.matches)}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Insights */}
      {analytics.insights && analytics.insights.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Lightbulb className="w-5 h-5" />
              Insights e Recomendações
            </div>
            <p className="text-sm text-gray-600">
              Dicas personalizadas para melhorar seu perfil
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {analytics.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <Chip 
                    size="sm"
                    variant="flat"
                    className={`${getPriorityColor(insight.priority)} text-xs self-start`}
                  >
                    {insight.priority.toUpperCase()}
                  </Chip>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base">
                      {insight.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <Button size="sm" variant="bordered" className="text-xs w-full sm:w-auto">
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Charts */}
      <Tabs defaultSelectedKey="timeline" className="w-full">
        <Tab key="timeline" title="Timeline">
          <div className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Interações ao Longo do Tempo</h3>
            </CardHeader>
            <CardBody>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minWidth={300}>
                  <LineChart data={analytics.analytics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="profileViews" stroke="#8884d8" name="Visualizações" />
                    <Line type="monotone" dataKey="likesReceived" stroke="#82ca9d" name="Curtidas Recebidas" />
                    <Line type="monotone" dataKey="likesSent" stroke="#ffc658" name="Curtidas Enviadas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
          </div>
        </Tab>
        
        <Tab key="demographics" title="Demografia">
          <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Faixa Etária dos Interessados</h3>
              </CardHeader>
              <CardBody>
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={200} minWidth={250}>
                    <PieChart>
                      <Pie
                        data={Object.entries(analytics.analytics.demographics.ageGroups).map(([key, value]) => ({
                          name: key,
                          value
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(analytics.analytics.demographics.ageGroups).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Gênero dos Interessados</h3>
              </CardHeader>
              <CardBody>
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={200} minWidth={250}>
                    <BarChart data={Object.entries(analytics.analytics.demographics.genders).map(([key, value]) => ({
                      name: key,
                      value
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>
          </div>
        </Tab>
        
        <Tab key="conversions" title="Conversões">
          <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium">Visualização → Curtida</h3>
              </CardHeader>
              <CardBody>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {analytics.analytics.conversionRates.viewToLike.toFixed(1)}%
                </div>
                <Progress value={analytics.analytics.conversionRates.viewToLike} className="mt-2" />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium">Curtida → Match</h3>
              </CardHeader>
              <CardBody>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {analytics.analytics.conversionRates.likeToMatch.toFixed(1)}%
                </div>
                <Progress value={analytics.analytics.conversionRates.likeToMatch} className="mt-2" />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium">Match → Mensagem</h3>
              </CardHeader>
              <CardBody>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {analytics.analytics.conversionRates.matchToMessage.toFixed(1)}%
                </div>
                <Progress value={analytics.analytics.conversionRates.matchToMessage} className="mt-2" />
              </CardBody>
            </Card>
          </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}
