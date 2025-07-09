"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ExternalLink, Crown } from "lucide-react"

interface AdProps {
  type?: "sidebar" | "timeline" | "banner"
  dismissible?: boolean
  onDismiss?: () => void
}

const ADS_DATA = [
  {
    id: "premium-upgrade",
    type: "upgrade",
    title: "Upgrade para Premium",
    description: "Desbloqueie recursos exclusivos e remova anúncios",
    cta: "Assinar Agora",
    color: "bg-gradient-to-r from-blue-500 to-purple-600",
    icon: <Crown className="w-5 h-5" />,
  },
  {
    id: "local-business",
    type: "external",
    title: "Café Central",
    description: "O melhor café da cidade! Venha nos visitar.",
    cta: "Saiba Mais",
    image: "/cozy-corner-cafe.png",
    color: "bg-amber-50 border-amber-200",
  },
  {
    id: "event-promotion",
    type: "external",
    title: "Festival de Música 2024",
    description: "Não perca o maior evento musical do ano!",
    cta: "Comprar Ingressos",
    image: "/vibrant-music-festival.png",
    color: "bg-purple-50 border-purple-200",
  },
  {
    id: "tech-course",
    type: "external",
    title: "Curso de Programação",
    description: "Aprenda a programar do zero ao avançado",
    cta: "Inscrever-se",
    image: "/programming-course.png",
    color: "bg-green-50 border-green-200",
  },
]

export default function Advertisement({ type = "sidebar", dismissible = true, onDismiss }: AdProps) {
  const [dismissed, setDismissed] = useState(false)

  // Randomly select an ad
  const ad = ADS_DATA[Math.floor(Math.random() * ADS_DATA.length)]

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const handleClick = () => {
    if (ad.type === "upgrade") {
      window.location.href = "/pricing"
    } else {
      // Track ad click
      console.log("Ad clicked:", ad.id)
    }
  }

  if (dismissed) return null

  if (type === "banner") {
    return (
      <Card className={`${ad.color} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {ad.icon && <div className="p-2 bg-white/20 rounded-full">{ad.icon}</div>}
              <div>
                <h3 className="font-semibold text-white">{ad.title}</h3>
                <p className="text-sm text-white/90">{ad.description}</p>
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
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary" className="text-xs">
              Anúncio
            </Badge>
            {dismissible && (
              <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            {ad.image && (
              <img src={ad.image || "/placeholder.svg"} alt={ad.title} className="w-16 h-16 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">{ad.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{ad.description}</p>
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
          <Badge variant="secondary" className="text-xs">
            Anúncio
          </Badge>
          {dismissible && (
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-5 w-5 p-0">
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {ad.image && (
          <img src={ad.image || "/placeholder.svg"} alt={ad.title} className="w-full h-20 rounded object-cover mb-2" />
        )}

        <h3 className="font-semibold text-sm mb-1">{ad.title}</h3>
        <p className="text-xs text-gray-600 mb-2">{ad.description}</p>

        <Button size="sm" onClick={handleClick} className="w-full h-7 text-xs">
          {ad.type === "upgrade" && <Crown className="w-3 h-3 mr-1" />}
          {ad.cta}
        </Button>
      </CardContent>
    </Card>
  )
}
