"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, Users, Building, Calendar, Filter, X } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface SearchResult {
  id: string
  [key: string]: any
}

interface SearchContentProps {
  initialQuery: string
  initialType: string
  initialInterests: string[]
}

const SEARCH_TYPES = [
  { value: "users", label: "Pessoas", icon: Users },
  { value: "communities", label: "Comunidades", icon: Building },
  { value: "events", label: "Eventos", icon: Calendar },
]

const INTEREST_OPTIONS = [
  "Tecnologia",
  "Esportes",
  "Arte",
  "Música",
  "Culinária",
  "Viagem",
  "Leitura",
  "Jogos",
  "Fitness",
  "Fotografia",
]

const SearchContent: React.FC<SearchContentProps> = ({ initialQuery, initialType, initialInterests }) => {
  const [query, setQuery] = useState(initialQuery)
  const [searchType, setSearchType] = useState(initialType)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const performSearch = useCallback(
    async (resetResults = true) => {
      setLoading(true)

      try {
        const params = new URLSearchParams({
          query: query.trim(),
          type: searchType,
          limit: "20",
          offset: resetResults ? "0" : offset.toString() })

        if (selectedInterests.length > 0) {
          params.append("interests", selectedInterests.join(","))
        }

        const response = await fetch(`/api/search?${params}`)
        const data = await response.json()

        if (response.ok) {
          if (resetResults) {
            setResults(data.data || [])
            setOffset(20)
          } else {
            setResults((prev) => [...prev, ...(data.data || [])])
            setOffset((prev) => prev + 20)
          }
          setHasMore((data.data || []).length === 20)
        } else {
          console.error("Erro na busca:", data.error)
        }
      } catch (error) {
        console.error("Erro na busca:", error)
      } finally {
        setLoading(false)
      }
    },
    [query, searchType, selectedInterests, offset],
  )

  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.append("q", query.trim())
    if (searchType !== "users") params.append("type", searchType)
    if (selectedInterests.length > 0) params.append("interests", selectedInterests.join(","))

    const newURL = `/search${params.toString() ? `?${params.toString()}` : ""}`
    router.replace(newURL)
  }, [query, searchType, selectedInterests, router])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() || selectedInterests.length > 0) {
        performSearch(true)
        updateURL()
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchType, selectedInterests, performSearch, updateURL])

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const clearFilters = () => {
    setSelectedInterests([])
    setShowFilters(false)
  }

  const renderUserResult = (user: any) => (
    <Link
      key={user.id}
      href={`/profile/${user.username}`}
      className="block bg-white rounded-lg shadow-sm border p-3 xs:p-4 hover:shadow-md transition-shadow"
    >
              <div className="flex items-center space-x-3 xs:space-x-4">
        <div className="flex-shrink-0">
          {user.avatar_url ? (
              <img src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} className="w-10 h-10 xs:w-12 xs:h-12 rounded-full" />
          ) : (
              <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 xs:w-6 xs:h-6 text-blue-600" />
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center space-x-1 xs:space-x-2">
            <h3 className="text-sm xs:text-lg font-medium text-gray-900 truncate">{user.full_name}</h3>
            {user.is_verified && <span className="text-blue-500 text-xs xs:text-sm">✓</span>}
          </div>
          <p className="text-xs xs:text-sm text-gray-500">@{user.username}</p>
          {user.bio && <p className="text-xs xs:text-sm text-gray-700 mt-1 line-clamp-2">{user.bio}</p>}
          {user.location && <p className="text-[10px] xs:text-xs text-gray-500 mt-1">{user.location}</p>}
        </div>
      </div>
      {user.interests && user.interests.length > 0 && (
        <div className="mt-2 xs:mt-3 flex flex-wrap gap-0.5 xs:gap-1">
          {user.interests.slice(0, 3).map((interest: string) => (
            <span key={interest} className="px-1.5 xs:px-2 py-0.5 xs:py-1 bg-blue-100 text-blue-800 text-[10px] xs:text-xs rounded-full">
              {interest}
            </span>
          ))}
          {user.interests.length > 3 && (
            <span className="px-1.5 xs:px-2 py-0.5 xs:py-1 bg-gray-100 text-gray-600 text-[10px] xs:text-xs rounded-full">
              +{user.interests.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  )

  const renderCommunityResult = (community: any) => (
    <Link
      key={community.id}
      href={`/communities/${community.slug}`}
      className="block bg-white rounded-lg shadow-sm border p-3 xs:p-4 hover:shadow-md transition-shadow"
    >
              <div className="flex items-start space-x-3 xs:space-x-4">
        <div className="flex-shrink-0">
          {community.image_url ? (
            <img
              src={community.image_url || "/placeholder.svg"}
              alt={community.name}
                className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg object-cover"
            />
          ) : (
              <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Building className="w-5 h-5 xs:w-6 xs:h-6 text-green-600" />
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
            <h3 className="text-sm xs:text-lg font-medium text-gray-900">{community.name}</h3>
            <p className="text-xs xs:text-sm text-gray-500">{community.member_count} membros</p>
            <p className="text-xs xs:text-sm text-gray-700 mt-1 line-clamp-2">{community.description}</p>
          {community.interest_categories && (
            <span
              className="inline-block mt-2 px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: `${community.interest_categories.color}20`,
                color: community.interest_categories.color }}
            >
              {community.interest_categories.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  )

  const renderEventResult = (event: any) => (
    <Link
      key={event.id}
      href={`/events/${event.id}`}
      className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {event.image_url ? (
            <img
              src={event.image_url || "/placeholder.svg"}
              alt={event.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
          <p className="text-sm text-gray-500">
            {new Date(event.start_date).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit" })}
          </p>
          <p className="text-sm text-gray-700 mt-1 line-clamp-2">{event.description}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{event.location || (event.is_online ? "Online" : "Local não informado")}</span>
              {event.price > 0 && <span>R$ {event.price}</span>}
              <span>
                {event.current_participants}
                {event.max_participants && `/${event.max_participants}`} participantes
              </span>
            </div>
            {event.communities && <span className="text-xs text-blue-600">{event.communities.name}</span>}
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Openlove
            </Link>
            <nav className="flex space-x-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/communities" className="text-gray-700 hover:text-blue-600">
                Comunidades
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-blue-600">
                Eventos
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar pessoas, comunidades ou eventos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Search Type Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {SEARCH_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => setSearchType(type.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      searchType === type.value
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                {selectedInterests.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedInterests.length}
                  </span>
                )}
              </button>

              {selectedInterests.length > 0 && (
                <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Interest Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Interesses</h4>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedInterests.includes(interest)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {interest}
                      {selectedInterests.includes(interest) && <X className="inline w-3 h-3 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && results.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Buscando...</p>
            </div>
          )}

          {!loading && results.length === 0 && (query.trim() || selectedInterests.length > 0) && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum resultado encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">Tente ajustar sua busca ou filtros.</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado
                  {results.length !== 1 ? "s" : ""}
                </h2>
              </div>

              <div className="grid gap-4">
                {results.map((result) => {
                  if (searchType === "users") return renderUserResult(result)
                  if (searchType === "communities") return renderCommunityResult(result)
                  if (searchType === "events") return renderEventResult(result)
                  return null
                })}
              </div>

              {hasMore && (
                <div className="text-center pt-6">
                  <button
                    onClick={() => performSearch(false)}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Carregando..." : "Carregar mais"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default SearchContent
