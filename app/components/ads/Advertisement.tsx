"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  X, 
  ExternalLink, 
  Crown, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Calendar,
  MapPin,
  Star,
  Heart,
  Share2,
  MessageCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdMetrics {
  impressions: number
  clicks: number
  ctr: number
  spend: number
  conversions?: number
}

interface Advertiser {
  id: string
  name: string
  logo: string
  verified: boolean
  category: string
}

interface AdProps {
  type?: "sidebar" | "timeline" | "banner" | "story" | "carousel"
  dismissible?: boolean
  onDismiss?: () => void
  showMetrics?: boolean
  onAdClick?: (adId: string) => void
  onAdImpression?: (adId: string) => void
}

interface AdData {
  id: string
  type: "upgrade" | "external" | "brand" | "event" | "product"
  title: string
  description: string
  cta: string
  color: string
  icon?: React.ReactNode
  image?: string
  advertiser?: Advertiser
  metrics?: AdMetrics
  targetAudience?: string[]
  budget?: number
  duration?: string
  category?: string
  tags?: string[]
  isSponsored?: boolean
  priority?: "low" | "medium" | "high"
}

const ADS_DATA: AdData[] = [
  {
    id: "premium-upgrade",
    type: "upgrade",
    title: "Upgrade para Premium",
    description: "Desbloqueie recursos exclusivos e remova anúncios",
    cta: "Assinar Agora",
    color: "bg-gradient-to-r from-blue-500 to-purple-600",
    icon: <Crown className="w-5 h-5" />,
    category: "subscription",
    priority: "high"
  },
  {
    id: "cafe-central",
    type: "brand",
    title: "Café Central",
    description: "O melhor café da cidade! Ambiente acolhedor para encontros especiais.",
    cta: "Reservar Mesa",
    image: "/cozy-corner-cafe.png",
    color: "bg-amber-50 border-amber-200",
    advertiser: {
      id: "cafe-central",
      name: "Café Central",
      logo: "/cozy-corner-cafe.png",
      verified: true,
      category: "Gastronomia"
    },
    metrics: {
      impressions: 15420,
      clicks: 1234,
      ctr: 8.0,
      spend: 450.00
    },
    targetAudience: ["Casais", "Profissionais", "Amantes de café"],
    budget: 500,
    duration: "30 dias",
    category: "Gastronomia",
    tags: ["café", "encontros", "romântico"],
    isSponsored: true,
    priority: "medium"
  },
  {
    id: "festival-musica",
    type: "event",
    title: "Festival de Música 2024",
    description: "Não perca o maior evento musical do ano! Música, amor e conexões.",
    cta: "Comprar Ingressos",
    image: "/vibrant-music-festival.png",
    color: "bg-purple-50 border-purple-200",
    advertiser: {
      id: "festival-music",
      name: "Festival de Música",
      logo: "/vibrant-music-festival.png",
      verified: true,
      category: "Eventos"
    },
    metrics: {
      impressions: 28900,
      clicks: 2156,
      ctr: 7.5,
      spend: 1200.00,
      conversions: 89
    },
    targetAudience: ["Jovens", "Casais", "Amantes de música"],
    budget: 1500,
    duration: "15 dias",
    category: "Eventos",
    tags: ["música", "festival", "diversão"],
    isSponsored: true,
    priority: "high"
  },
  {
    id: "curso-programacao",
    type: "product",
    title: "Curso de Programação",
    description: "Aprenda a programar do zero ao avançado. Carreira promissora!",
    cta: "Inscrever-se",
    image: "/programming-course.png",
    color: "bg-green-50 border-green-200",
    advertiser: {
      id: "tech-academy",
      name: "Tech Academy",
      logo: "/programming-course.png",
      verified: false,
      category: "Educação"
    },
    metrics: {
      impressions: 8900,
      clicks: 567,
      ctr: 6.4,
      spend: 300.00
    },
    targetAudience: ["Profissionais", "Estudantes", "Carreira"],
    budget: 400,
    duration: "20 dias",
    category: "Educação",
    tags: ["programação", "carreira", "tecnologia"],
    isSponsored: true,
    priority: "medium"
  },
  {
    id: "spa-relaxamento",
    type: "brand",
    title: "Spa Relaxamento",
    description: "Momentos de paz e relaxamento para casais. Massagens especiais.",
    cta: "Agendar",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400",
    color: "bg-pink-50 border-pink-200",
    advertiser: {
      id: "spa-relax",
      name: "Spa Relaxamento",
      logo: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=100",
      verified: true,
      category: "Bem-estar"
    },
    metrics: {
      impressions: 12300,
      clicks: 987,
      ctr: 8.0,
      spend: 600.00
    },
    targetAudience: ["Casais", "Bem-estar", "Relaxamento"],
    budget: 700,
    duration: "25 dias",
    category: "Bem-estar",
    tags: ["spa", "relaxamento", "casais"],
    isSponsored: true,
    priority: "medium"
  }
]

export default function Advertisement({ 
  type = "sidebar", 
  dismissible = true, 
  onDismiss,
  showMetrics = false,
  onAdClick,
  onAdImpression
}: AdProps) {
  const [dismissed, setDismissed] = useState(false)
  const [ad] = useState(() => ADS_DATA[Math.floor(Math.random() * ADS_DATA.length)])

  useEffect(() => {
    // Track impression
    onAdImpression?.(ad.id)
  }, [ad.id, onAdImpression])

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const handleClick = () => {
    onAdClick?.(ad.id)
    
    if (ad.type === "upgrade") {
      window.location.href = "/pricing"
    } else {
      // Track ad click
      console.log("Ad clicked:", ad.id)
    }
  }

  if (dismissed) return null

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

  if (type === "banner") {
    return (
      <Card className={`${ad.color} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {ad.advertiser && (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={ad.advertiser.logo} />
                  <AvatarFallback>{ad.advertiser.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              {ad.icon && <div className="p-2 bg-white/20 rounded-full">{ad.icon}</div>}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{ad.title}</h3>
                  {ad.isSponsored && (
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                      Patrocinado
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-white/90">{ad.description}</p>
                {showMetrics && ad.metrics && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/80">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatNumber(ad.metrics.impressions)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer className="w-3 h-3" />
                      {formatNumber(ad.metrics.clicks)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {ad.metrics.ctr}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="secondary" onClick={handleClick} className="flex items-center gap-1">
                {ad.type === "upgrade" ? <Crown className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                {ad.cta}
              </Button>
              {dismissible && (
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-white/70 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === "timeline") {
    return (
      <Card className={`${ad.color} border`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Anúncio
              </Badge>
              {ad.isSponsored && (
                <Badge variant="outline" className="text-xs">
                  Patrocinado
                </Badge>
              )}
              {ad.advertiser?.verified && (
                <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                  Verificado
                </Badge>
              )}
            </div>
            {dismissible && (
              <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            {ad.image && (
              <img src={ad.image} alt={ad.title} className="w-16 h-16 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {ad.advertiser && (
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={ad.advertiser.logo} />
                    <AvatarFallback className="text-xs">{ad.advertiser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <h3 className="font-semibold text-sm">{ad.title}</h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">{ad.description}</p>
              
              {showMetrics && ad.metrics && (
                <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatNumber(ad.metrics.impressions)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointer className="w-3 h-3" />
                    {formatNumber(ad.metrics.clicks)}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {ad.metrics.ctr}%
                  </span>
                </div>
              )}
              
              <Button size="sm" onClick={handleClick} className="h-7 text-xs">
                {ad.cta}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sidebar ad
  return (
    <Card className={`${ad.color} border`}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">
              Anúncio
            </Badge>
            {ad.isSponsored && (
              <Badge variant="outline" className="text-xs">
                Patrocinado
              </Badge>
            )}
          </div>
          {dismissible && (
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-5 w-5 p-0">
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {ad.image && (
          <img src={ad.image} alt={ad.title} className="w-full h-20 rounded object-cover mb-2" />
        )}

        <div className="flex items-center gap-2 mb-1">
          {ad.advertiser && (
            <Avatar className="w-4 h-4">
              <AvatarImage src={ad.advertiser.logo} />
              <AvatarFallback className="text-xs">{ad.advertiser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          <h3 className="font-semibold text-sm">{ad.title}</h3>
        </div>
        
        <p className="text-xs text-gray-600 mb-2">{ad.description}</p>

        {showMetrics && ad.metrics && (
          <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(ad.metrics.impressions)}
            </span>
            <span className="flex items-center gap-1">
              <MousePointer className="w-3 h-3" />
              {formatNumber(ad.metrics.clicks)}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {ad.metrics.ctr}%
            </span>
          </div>
        )}

        <Button size="sm" onClick={handleClick} className="w-full h-7 text-xs">
          {ad.type === "upgrade" && <Crown className="w-3 h-3 mr-1" />}
          {ad.cta}
        </Button>
      </CardContent>
    </Card>
  )
}
