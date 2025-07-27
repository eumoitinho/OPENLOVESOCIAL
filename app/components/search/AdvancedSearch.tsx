"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, X, MapPin, Calendar, Users, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FilterSelector } from "@/app/components/filters/FilterSelector"
import { createClient } from "@/app/lib/supabase-browser"

interface AdvancedSearchProps {
  className?: string
}

interface SearchResult {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  location?: string
  interests: string[]
  followers_count: number
  posts_count: number
  verified: boolean
  premium: boolean
}

interface SearchFilters {
  query: string
  location: string[]
  ageRange: string[]
  interests: string[]
  verified: boolean
  premium: boolean
  hasPosts: boolean
  hasFollowers: boolean
}

export function AdvancedSearch({ className }: AdvancedSearchProps) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: [],
    ageRange: [],
    interests: [],
    verified: false,
    premium: false,
    hasPosts: false,
    hasFollowers: false
  })
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("users")

  const supabase = createClient()

  // Opções de filtros
  const locationOptions = [
    { id: "sp", label: "São Paulo" },
    { id: "rj", label: "Rio de Janeiro" },
    { id: "mg", label: "Minas Gerais" },
    { id: "rs", label: "Rio Grande do Sul" },
    { id: "pr", label: "Paraná" },
    { id: "sc", label: "Santa Catarina" },
    { id: "go", label: "Goiás" },
    { id: "ba", label: "Bahia" }
  ]

  const ageRangeOptions = [
    { id: "18-25", label: "18-25 anos" },
    { id: "26-35", label: "26-35 anos" },
    { id: "36-45", label: "36-45 anos" },
    { id: "46-55", label: "46-55 anos" },
    { id: "55+", label: "55+ anos" }
  ]

  const interestOptions = [
    { id: "music", label: "Música" },
    { id: "sports", label: "Esportes" },
    { id: "travel", label: "Viagem" },
    { id: "food", label: "Culinária" },
    { id: "art", label: "Arte" },
    { id: "technology", label: "Tecnologia" },
    { id: "books", label: "Livros" },
    { id: "movies", label: "Filmes" },
    { id: "photography", label: "Fotografia" },
    { id: "fitness", label: "Fitness" },
    { id: "gaming", label: "Jogos" },
    { id: "fashion", label: "Moda" }
  ]

  // Buscar resultados
  const searchUsers = async () => {
    if (!query.trim() && Object.values(filters).every(v => 
      Array.isArray(v) ? v.length === 0 : !v
    )) return

    try {
      setLoading(true)

      let queryBuilder = supabase
        .from('users')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          bio,
          location,
          interests,
          birth_date,
          verified,
          premium,
          followers:follows!follows_followed_id_fkey(count),
          posts:posts(count)
        `)

      // Aplicar filtros
      if (query.trim()) {
        queryBuilder = queryBuilder.or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`)
      }

      if (filters.location.length > 0) {
        queryBuilder = queryBuilder.in('location', filters.location)
      }

      if (filters.interests.length > 0) {
        queryBuilder = queryBuilder.overlaps('interests', filters.interests)
      }

      if (filters.verified) {
        queryBuilder = queryBuilder.eq('verified', true)
      }

      if (filters.premium) {
        queryBuilder = queryBuilder.eq('premium', true)
      }

      const { data, error } = await queryBuilder.limit(50)

      if (error) throw error

      // Processar resultados
      const processedResults = (data || []).map((user: any) => ({
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        location: user.location,
        interests: user.interests || [],
        followers_count: user.followers?.[0]?.count || 0,
        posts_count: user.posts?.[0]?.count || 0,
        verified: user.verified,
        premium: user.premium
      }))

      // Aplicar filtros adicionais
      let filteredResults = processedResults

      if (filters.hasPosts) {
        filteredResults = filteredResults.filter(user => user.posts_count > 0)
      }

      if (filters.hasFollowers) {
        filteredResults = filteredResults.filter(user => user.followers_count > 0)
      }

      // Filtrar por faixa etária
      if (filters.ageRange.length > 0) {
        filteredResults = filteredResults.filter(user => {
          if (!user.birth_date) return false
          
          const age = calculateAge(user.birth_date)
          return filters.ageRange.some(range => {
            const [min, max] = range.split('-').map(Number)
            return age >= min && (max ? age <= max : true)
          })
        })
      }

      setResults(filteredResults)

    } catch (err) {
      console.error('Erro na busca:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const handleSearch = () => {
    searchUsers()
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      location: [],
      ageRange: [],
      interests: [],
      verified: false,
      premium: false,
      hasPosts: false,
      hasFollowers: false
    })
    setQuery("")
  }

  const hasActiveFilters = () => {
    return query.trim() || 
           filters.location.length > 0 ||
           filters.ageRange.length > 0 ||
           filters.interests.length > 0 ||
           filters.verified ||
           filters.premium ||
           filters.hasPosts ||
           filters.hasFollowers
  }

  return (
    <div className={className}>
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar usuários, posts, hashtags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 ${hasActiveFilters() ? 'border-pink-500 text-pink-500' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-1">
                {Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : v).length}
              </Badge>
            )}
          </Button>
          
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Localização */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Localização
                  </label>
                  <FilterSelector
                    options={locationOptions}
                    selectedOptions={filters.location}
                    onSelectionChange={(selected) => setFilters(prev => ({ ...prev, location: selected }))}
                    maxSelections={3}
                    placeholder="Selecione localizações..."
                  />
                </div>

                {/* Faixa Etária */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Faixa Etária
                  </label>
                  <FilterSelector
                    options={ageRangeOptions}
                    selectedOptions={filters.ageRange}
                    onSelectionChange={(selected) => setFilters(prev => ({ ...prev, ageRange: selected }))}
                    maxSelections={2}
                    placeholder="Selecione faixas..."
                  />
                </div>

                {/* Interesses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Heart className="w-4 h-4 inline mr-1" />
                    Interesses
                  </label>
                  <FilterSelector
                    options={interestOptions}
                    selectedOptions={filters.interests}
                    onSelectionChange={(selected) => setFilters(prev => ({ ...prev, interests: selected }))}
                    maxSelections={5}
                    placeholder="Selecione interesses..."
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Verificados</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.premium}
                    onChange={(e) => setFilters(prev => ({ ...prev, premium: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Premium</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasPosts}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasPosts: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Com posts</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasFollowers}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasFollowers: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Com seguidores</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpar filtros
                </Button>

                <Button onClick={handleSearch} disabled={loading}>
                  Aplicar filtros
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {user.full_name}
                    </h3>
                    {user.verified && (
                      <Badge className="bg-blue-500 text-white text-xs">✓</Badge>
                    )}
                    {user.premium && (
                      <Badge className="bg-yellow-500 text-white text-xs">★</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    @{user.username}
                  </p>
                  
                  {user.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {user.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {user.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {user.location}
                      </span>
                    )}
                    <span>{user.followers_count} seguidores</span>
                    <span>{user.posts_count} posts</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/profile/${user.username}`}
                >
                  Ver perfil
                </Button>
              </motion.div>
            ))}
          </div>
        ) : hasActiveFilters() ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tente ajustar seus filtros de busca.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Faça uma busca
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Digite algo para começar a buscar usuários.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 
