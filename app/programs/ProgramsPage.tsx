"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, Users, Star, BookOpen, Code, Palette, TrendingUp, Heart, Camera } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import type { Database } from "@/app/lib/database.types"

interface Program {
  id: string
  title: string
  description: string
  price: number
  category: string
  duration: string
  level: "beginner" | "intermediate" | "advanced"
  thumbnail_url?: string
  created_at: string
  instructor: {
    id: string
    full_name: string
    avatar_url?: string
  }
  students_count: number
  rating: number
  lessons_count: number
}

const CATEGORIES = [
  { value: "all", label: "Todas as Categorias", icon: BookOpen },
  { value: "business", label: "Negócios", icon: TrendingUp },
  { value: "technology", label: "Tecnologia", icon: Code },
  { value: "design", label: "Design", icon: Palette },
  { value: "lifestyle", label: "Estilo de Vida", icon: Heart },
  { value: "photography", label: "Fotografia", icon: Camera },
]

const LEVELS = [
  { value: "all", label: "Todos os Níveis" },
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
]

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const { user } = useAuth()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchPrograms()
  }, [])

  useEffect(() => {
    filterPrograms()
  }, [programs, searchTerm, selectedCategory, selectedLevel, priceRange])

  const fetchPrograms = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("programs")
        .select(`
          *,
          instructor:profiles(id, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPrograms(data || [])
    } catch (error) {
      console.error("Erro ao carregar programas:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPrograms = () => {
    let filtered = programs

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (program) =>
          program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.instructor.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por categoria
    if (selectedCategory !== "all") {
      filtered = filtered.filter((program) => program.category === selectedCategory)
    }

    // Filtro por nível
    if (selectedLevel !== "all") {
      filtered = filtered.filter((program) => program.level === selectedLevel)
    }

    // Filtro por preço
    if (priceRange !== "all") {
      switch (priceRange) {
        case "free":
          filtered = filtered.filter((program) => program.price === 0)
          break
        case "low":
          filtered = filtered.filter((program) => program.price > 0 && program.price <= 50)
          break
        case "medium":
          filtered = filtered.filter((program) => program.price > 50 && program.price <= 200)
          break
        case "high":
          filtered = filtered.filter((program) => program.price > 200)
          break
      }
    }

    setFilteredPrograms(filtered)
  }

  const handleEnroll = async (programId: string, price: number) => {
    if (!user) {
      alert("Faça login para se matricular")
      return
    }

    try {
      const response = await fetch("/api/programs/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }) })

      if (response.ok) {
        alert("Matrícula realizada com sucesso!")
        fetchPrograms()
      } else {
        const error = await response.json()
        alert(error.message || "Erro ao se matricular")
      }
    } catch (error) {
      console.error("Erro ao se matricular:", error)
      alert("Erro ao processar matrícula")
    }
  }

  const getCategoryIcon = (category: string) => {
    const categoryConfig = CATEGORIES.find((c) => c.value === category)
    return categoryConfig ? categoryConfig.icon : BookOpen
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Iniciante"
      case "intermediate":
        return "Intermediário"
      case "advanced":
        return "Avançado"
      default:
        return level
    }
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
        <h1 className="text-3xl font-bold mb-2">Programas e Cursos</h1>
        <p className="text-gray-600">Aprenda com os melhores instrutores da plataforma</p>
      </div>

      {/* Filtros */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar programas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => {
                  const Icon = category.icon
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Preço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os preços</SelectItem>
                <SelectItem value="free">Gratuito</SelectItem>
                <SelectItem value="low">Até R$ 50</SelectItem>
                <SelectItem value="medium">R$ 50 - R$ 200</SelectItem>
                <SelectItem value="high">Acima de R$ 200</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedLevel("all")
                setPriceRange("all")
              }}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Programas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => {
          const CategoryIcon = getCategoryIcon(program.category)
          return (
            <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {program.thumbnail_url ? (
                  <img
                    src={program.thumbnail_url || "/placeholder.svg"}
                    alt={program.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <CategoryIcon className="w-12 h-12 text-white" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-blue-500">
                    {program.price === 0 ? "Grátis" : `R$ ${program.price.toFixed(2)}`}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge className={getLevelColor(program.level)}>{getLevelLabel(program.level)}</Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CategoryIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500 capitalize">{program.category}</span>
                </div>

                <h3 className="font-semibold mb-2 line-clamp-2">{program.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{program.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={program.instructor.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{program.instructor.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{program.instructor.full_name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{program.students_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>{program.rating.toFixed(1)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleEnroll(program.id, program.price)}
                  className="w-full"
                  variant={program.price === 0 ? "outline" : "default"}
                >
                  {program.price === 0 ? "Começar Grátis" : "Matricular-se"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredPrograms.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum programa encontrado</p>
          <p className="text-gray-400">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  )
}
