"use client"

import { useState } from "react"
import { Button, Card, CardBody, Chip, Tabs, Tab } from "@heroui/react"
import { 
  Users, 
  Grid3X3, 
  List, 
  Filter, 
  RefreshCw, 
  Sparkles,
  TrendingUp,
  MapPin,
  Heart,
  Search,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useProfileExplore } from "@/app/hooks/useProfileExplore"
import { ProfileCard } from "./ProfileCard"
import { ExploreFilters } from "./ExploreFilters"

interface ExploreProfilesProps {
  currentUser?: {
    name: string
    username: string
    avatar: string
    id?: string
  }
  onMessageUser?: (userId: string) => void
  onViewProfile?: (userId: string) => void
}

export function ExploreProfiles({ 
  currentUser, 
  onMessageUser, 
  onViewProfile 
}: ExploreProfilesProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState("all")

  const {
    profiles,
    loading,
    error,
    hasMore,
    filters,
    stats,
    loadMore,
    applyFilters,
    refresh,
    resetFilters
  } = useProfileExplore({
    autoFetch: !!currentUser?.id
  })

  const handleLike = (profileId: string) => {
    console.log('👍 Liked profile:', profileId)
    // Implementar lógica de like
  }

  const handleMessage = (profileId: string) => {
    console.log('💬 Message profile:', profileId)
    onMessageUser?.(profileId)
  }

  const handleFollow = (profileId: string) => {
    console.log('➕ Follow profile:', profileId)
    // Implementar lógica de seguir
  }

  const handleSave = (profileId: string) => {
    console.log('🔖 Save profile:', profileId)
    // Implementar lógica de salvar
  }

  const handleViewProfile = (profileId: string) => {
    console.log('👁️ View profile:', profileId)
    onViewProfile?.(profileId)
  }

  // Filtrar perfis por abas
  const getFilteredProfiles = () => {
    switch (activeTab) {
      case "online":
        return profiles.filter(p => p.isOnline)
      case "verified":
        return profiles.filter(p => p.isVerified)
      case "compatible":
        return profiles.filter(p => p.compatibilityScore >= 70)
      case "nearby":
        return profiles.filter(p => p.distance <= 10)
      default:
        return profiles
    }
  }

  const filteredProfiles = getFilteredProfiles()

  const renderProfileGrid = () => (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      viewMode === 'grid' 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
        : "grid-cols-1 max-w-2xl mx-auto"
    )}>
      {filteredProfiles.map((profile, index) => (
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ProfileCard
            profile={profile}
            onLike={handleLike}
            onMessage={handleMessage}
            onFollow={handleFollow}
            onSave={handleSave}
            onViewProfile={handleViewProfile}
            currentUser={currentUser}
          />
        </motion.div>
      ))}
    </div>
  )

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Nenhum perfil encontrado
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Não encontramos perfis que correspondam aos seus filtros. Tente ajustar os critérios de busca.
      </p>
      <div className="flex gap-3 justify-center">
        <Button onClick={resetFilters} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Limpar Filtros
        </Button>
        <Button onClick={() => setShowFilters(true)}>
          <Filter className="w-4 h-4 mr-2" />
          Ajustar Filtros
        </Button>
      </div>
    </motion.div>
  )

  const renderErrorState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Erro ao carregar perfis
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {error}
      </p>
      <Button onClick={refresh}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Tentar novamente
      </Button>
    </motion.div>
  )

  const renderLoadingState = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (!currentUser?.id) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando usuário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Explorar Perfis
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Encontre pessoas interessantes próximas a você
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <ExploreFilters
            filters={filters}
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
            loading={loading}
            stats={stats}
          />
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Todos
            {profiles.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {profiles.length}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="online" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Online
            {profiles.filter(p => p.isOnline).length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {profiles.filter(p => p.isOnline).length}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="verified" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Verificados
            {profiles.filter(p => p.isVerified).length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {profiles.filter(p => p.isVerified).length}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="compatible" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Compatíveis
            {profiles.filter(p => p.compatibilityScore >= 70).length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {profiles.filter(p => p.compatibilityScore >= 70).length}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="nearby" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Próximos
            {profiles.filter(p => p.distance <= 10).length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {profiles.filter(p => p.distance <= 10).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das abas */}
        <TabsContent value={activeTab} className="space-y-6">
          {loading && profiles.length === 0 && renderLoadingState()}
          {error && renderErrorState()}
          {!loading && !error && filteredProfiles.length === 0 && renderEmptyState()}
          {!loading && !error && filteredProfiles.length > 0 && renderProfileGrid()}
          
          {/* Load More */}
          {hasMore && filteredProfiles.length > 0 && (
            <div className="text-center py-8">
              <Button
                onClick={loadMore}
                disabled={loading}
                variant="outline"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Carregar mais perfis
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}