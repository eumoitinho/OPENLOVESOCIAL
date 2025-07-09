"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ImageIcon, Video, Music, FileText } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import type { Database } from "@/app/lib/database.types"

interface PaidContent {
  id: string
  title: string
  description: string
  price: number
  type: "photo" | "video" | "audio" | "document"
  thumbnail_url?: string
  content_url: string
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url?: string
  }
  purchases_count: number
  rating: number
}

const CONTENT_TYPES = [
  { value: "all", label: "Todos", icon: Filter },
  { value: "photo", label: "Fotos", icon: ImageIcon },
  { value: "video", label: "Vídeos", icon: Video },
  { value: "audio", label: "Áudios", icon: Music },
  { value: "document", label: "Documentos", icon: FileText },
]

export default function ContentPage() {
  const [contents, setContents] = useState<PaidContent[]>([])
  const [filteredContents, setFilteredContents] = useState<PaidContent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const { user } = useAuth()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchContents()
  }, [])

  useEffect(() => {
    filterContents()
  }, [contents, searchTerm, selectedType, priceRange])

  const fetchContents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("paid_content")
        .select(`
          *,
          author:profiles(id, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setContents(data || [])
    } catch (error) {
      console.error("Erro ao carregar conteúdos:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterContents = () => {
    let filtered = contents

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (content) =>
          content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.author.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por tipo
    if (selectedType !== "all") {
      filtered = filtered.filter((content) => content.type === selectedType)
    }

    // Filtro por preço
    if (priceRange !== "all") {
      switch (priceRange) {
        case "free":
          filtered = filtered.filter((content) => content.price === 0)
          break
        case "low":
          filtered = filtered.filter((content) => content.price > 0 && content.price <= 10)
          break
        case "medium":
          filtered = filtered.filter((content) => content.price > 10 && content.price <= 50)
          break
        case "high":
          filtered = filtered.filter((content) => content.price > 50)
          break
      }
    }

    setFilteredContents(filtered)
  }

  const handlePurchase = async (contentId: string, price: number) => {
    if (!user) {
      alert("Faça login para comprar conteúdo")
      return
    }

    try {
      const response = await fetch("/api/content/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      })

      if (response.ok) {
        alert("Conteúdo adquirido com sucesso!")
        fetchContents()
      } else {
        const error = await response.json()
        alert(error.message || "Erro ao comprar conteúdo")
      }
    } catch (error) {
      console.error("Erro ao comprar conteúdo:", error)
      alert("Erro ao processar compra")
    }
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = CONTENT_TYPES.find((t) => t.value === type)
    return typeConfig ? typeConfig.icon : FileText
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conteúdos Pagos</h1>
        <p className="text-gray-600">Descubra conteúdos exclusivos de criadores incríveis</p>
      </div>

      {/* Filtros */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar conteúdos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de conteúdo" />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Faixa de preço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os preços</SelectItem>
                <SelectItem value="free">Gratuito</SelectItem>
                <SelectItem value="low">Até R$ 10</SelectItem>
                <SelectItem value="medium">R$ 10 - R$ 50</SelectItem>
                <SelectItem value="high">Acima de R$ 50</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedType("all")
                setPriceRange("all")
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Conteúdos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredContents.map((content) => {
          const TypeIcon = getTypeIcon(content.type)
          return (
            <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {content.thumbnail_url ? (
                  <img
                    src={content.thumbnail_url || "/placeholder.svg"}
                    alt={content.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <TypeIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-500">
                    {content.price === 0 ? "Grátis" : `R$ ${content.price.toFixed(2)}`}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {content.type}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{content.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{content.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={content.author.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{content.author.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{content.author.full_name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-gray-500">{content.purchases_count} compras</div>
                  <div className="text-xs text-gray-500">⭐ {content.rating.toFixed(1)}</div>
                </div>

                <Button
                  onClick={() => handlePurchase(content.id, content.price)}
                  className="w-full"
                  variant={content.price === 0 ? "outline" : "default"}
                >
                  {content.price === 0 ? "Acessar Grátis" : `Comprar por R$ ${content.price.toFixed(2)}`}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredContents.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum conteúdo encontrado</p>
          <p className="text-gray-400">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  )
}
