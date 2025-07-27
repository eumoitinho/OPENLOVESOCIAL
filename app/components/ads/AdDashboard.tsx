"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Calendar,
  Target,
  Settings,
  BarChart3,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  Edit,
  Trash2,
  Upload,
  CreditCard,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdCampaign {
  id: string
  name: string
  status: "draft" | "active" | "paused" | "completed"
  type: "banner" | "timeline" | "sidebar" | "story"
  title: string
  description: string
  cta: string
  image: string
  budget: number
  spent: number
  duration: string
  startDate: string
  endDate: string
  targetAudience: string[]
  category: string
  metrics: {
    impressions: number
    clicks: number
    ctr: number
    conversions: number
    spend: number
  }
  createdAt: string
}

interface AdvertiserProfile {
  id: string
  name: string
  logo: string
  email: string
  category: string
  verified: boolean
  balance: number
  totalSpent: number
  activeCampaigns: number
}

export default function AdDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null)

  // Mock data
  const advertiserProfile: AdvertiserProfile = {
    id: "adv-001",
    name: "Café Central",
    logo: "/cozy-corner-cafe.png",
    email: "contato@cafecentral.com",
    category: "Gastronomia",
    verified: true,
    balance: 1250.00,
    totalSpent: 3450.00,
    activeCampaigns: 2
  }

  const campaigns: AdCampaign[] = [
    {
      id: "camp-001",
      name: "Café para Casais",
      status: "active",
      type: "timeline",
      title: "Café Central",
      description: "O melhor café da cidade! Ambiente acolhedor para encontros especiais.",
      cta: "Reservar Mesa",
      image: "/cozy-corner-cafe.png",
      budget: 500,
      spent: 450,
      duration: "30 dias",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      targetAudience: ["Casais", "Profissionais", "Amantes de café"],
      category: "Gastronomia",
      metrics: {
        impressions: 15420,
        clicks: 1234,
        ctr: 8.0,
        conversions: 45,
        spend: 450
      },
      createdAt: "2024-01-01"
    },
    {
      id: "camp-002",
      name: "Promoção de Inverno",
      status: "paused",
      type: "sidebar",
      title: "Café Central - Promoção",
      description: "Aqueça-se com nossos cafés especiais de inverno!",
      cta: "Ver Promoções",
      image: "/cozy-corner-cafe.png",
      budget: 300,
      spent: 180,
      duration: "15 dias",
      startDate: "2024-01-15",
      endDate: "2024-01-30",
      targetAudience: ["Casais", "Amantes de café"],
      category: "Gastronomia",
      metrics: {
        impressions: 8900,
        clicks: 567,
        ctr: 6.4,
        conversions: 23,
        spend: 180
      },
      createdAt: "2024-01-15"
    }
  ]

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "paused": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-gray-100 text-gray-800"
      case "draft": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Play className="w-4 h-4" />
      case "paused": return <Pause className="w-4 h-4" />
      case "completed": return <CheckCircle className="w-4 h-4" />
      case "draft": return <Edit className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const totalMetrics = campaigns.reduce((acc, campaign) => ({
    impressions: acc.impressions + campaign.metrics.impressions,
    clicks: acc.clicks + campaign.metrics.clicks,
    conversions: acc.conversions + campaign.metrics.conversions,
    spend: acc.spend + campaign.metrics.spend
  }), { impressions: 0, clicks: 0, conversions: 0, spend: 0 })

  const overallCTR = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={advertiserProfile.logo} />
            <AvatarFallback className="text-lg">{advertiserProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{advertiserProfile.name}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <span>{advertiserProfile.category}</span>
              {advertiserProfile.verified && (
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  Verificado
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Saldo Disponível</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(advertiserProfile.balance)}</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-600 to-purple-600">
            <CreditCard className="w-4 h-4 mr-2" />
            Adicionar Saldo
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Impressões</p>
                <p className="text-2xl font-bold">{formatNumber(totalMetrics.impressions)}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Cliques</p>
                <p className="text-2xl font-bold">{formatNumber(totalMetrics.clicks)}</p>
              </div>
              <MousePointer className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CTR Médio</p>
                <p className="text-2xl font-bold">{overallCTR.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMetrics.spend)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaigns.slice(0, 3).map((campaign) => (
                  <div key={campaign.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatNumber(campaign.metrics.impressions)} impressões • {campaign.metrics.ctr}% CTR
                      </p>
                    </div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance dos Últimos 7 Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p>Gráfico de Performance</p>
                    <p className="text-sm">Dados em tempo real</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Campanhas de Anúncio</h2>
            <Dialog open={createCampaignOpen} onOpenChange={setCreateCampaignOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-600 to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Campanha</DialogTitle>
                  <DialogDescription>
                    Configure sua nova campanha de anúncio
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campaign-name">Nome da Campanha</Label>
                      <Input id="campaign-name" placeholder="Ex: Promoção de Verão" />
                    </div>
                    <div>
                      <Label htmlFor="campaign-type">Tipo de Anúncio</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="timeline">Timeline</SelectItem>
                          <SelectItem value="sidebar">Sidebar</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="campaign-title">Título do Anúncio</Label>
                    <Input id="campaign-title" placeholder="Título atrativo" />
                  </div>
                  <div>
                    <Label htmlFor="campaign-description">Descrição</Label>
                    <Textarea id="campaign-description" placeholder="Descreva seu produto ou serviço" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campaign-budget">Orçamento (R$)</Label>
                      <Input id="campaign-budget" type="number" placeholder="500" />
                    </div>
                    <div>
                      <Label htmlFor="campaign-duration">Duração (dias)</Label>
                      <Input id="campaign-duration" type="number" placeholder="30" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCreateCampaignOpen(false)}>
                      Cancelar
                    </Button>
                    <Button className="bg-gradient-to-r from-pink-600 to-purple-600">
                      <Zap className="w-4 h-4 mr-2" />
                      Criar Campanha
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <img 
                        src={campaign.image} 
                        alt={campaign.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {getStatusIcon(campaign.status)}
                            <span className="ml-1">{campaign.status}</span>
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{campaign.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {campaign.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {campaign.targetAudience.join(", ")}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {campaign.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">Orçamento: {formatCurrency(campaign.budget)}</p>
                        <p className="text-gray-600">Gasto: {formatCurrency(campaign.spent)}</p>
                        <p className="text-green-600 font-medium">
                          Restante: {formatCurrency(campaign.budget - campaign.spent)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Impressões</p>
                        <p className="font-semibold">{formatNumber(campaign.metrics.impressions)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cliques</p>
                        <p className="font-semibold">{formatNumber(campaign.metrics.clicks)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">CTR</p>
                        <p className="font-semibold">{campaign.metrics.ctr}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Conversões</p>
                        <p className="font-semibold">{campaign.metrics.conversions}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">Analytics Avançados</p>
                  <p className="text-sm">Métricas detalhadas e relatórios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input id="company-name" defaultValue={advertiserProfile.name} />
                </div>
                <div>
                  <Label htmlFor="company-email">Email</Label>
                  <Input id="company-email" defaultValue={advertiserProfile.email} />
                </div>
              </div>
              <div>
                <Label htmlFor="company-category">Categoria</Label>
                <Select defaultValue={advertiserProfile.category}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gastronomia">Gastronomia</SelectItem>
                    <SelectItem value="Eventos">Eventos</SelectItem>
                    <SelectItem value="Educação">Educação</SelectItem>
                    <SelectItem value="Bem-estar">Bem-estar</SelectItem>
                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="company-logo">Logo da Empresa</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={advertiserProfile.logo} />
                    <AvatarFallback>{advertiserProfile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Nova Logo
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-gradient-to-r from-pink-600 to-purple-600">
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
