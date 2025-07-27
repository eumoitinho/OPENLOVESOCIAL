"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Filter, 
  MapPin, 
  Heart, 
  Users, 
  Calendar, 
  BadgeCheck,
  Crown,
  X,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ProfileFilters } from "@/app/hooks/useProfileExplore"

interface ExploreFiltersProps {
  filters: ProfileFilters
  onApplyFilters: (filters: ProfileFilters) => void
  onResetFilters: () => void
  loading?: boolean
  stats?: {
    totalFound: number
    onlineUsers: number
    verifiedUsers: number
    premiumUsers: number
    avgCompatibility: number
  }
}

const INTERESTS_OPTIONS = [
  "Fotografia", "Música", "Gastronomia", "Viagens", "Arte", "Esportes",
  "Leitura", "Cinema", "Dança", "Yoga", "Fitness", "Praia", "Natureza",
  "Tecnologia", "Jogos", "Pets", "Culinária", "Moda", "Teatro", "Festivais"
]

export function ExploreFilters({ 
  filters, 
  onApplyFilters, 
  onResetFilters, 
  loading,
  stats 
}: ExploreFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProfileFilters>(filters)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof ProfileFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleInterestToggle = (interest: string) => {
    const currentInterests = localFilters.interests || []
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest]
    
    handleFilterChange('interests', newInterests)
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
  }

  const handleReset = () => {
    setLocalFilters({})
    onResetFilters()
  }

  const hasActiveFilters = Object.keys(localFilters).some(key => {
    const value = localFilters[key as keyof ProfileFilters]
    return value !== undefined && value !== null && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true)
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Busca
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs"
            >
              {showAdvanced ? "Simples" : "Avançado"}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Busca por nome */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Buscar por nome ou usuário
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="search"
              placeholder="Digite um nome ou @usuário..."
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtros básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gênero */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gênero
            </Label>
            <Select 
              value={localFilters.gender || 'all'} 
              onValueChange={(value) => handleFilterChange('gender', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
                <SelectItem value="non-binary">Não-binário</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de relacionamento */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Tipo de relacionamento
            </Label>
            <Select 
              value={localFilters.relationshipType || 'all'} 
              onValueChange={(value) => handleFilterChange('relationshipType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="single">Solteiro(a)</SelectItem>
                <SelectItem value="couple">Casal</SelectItem>
                <SelectItem value="polyamorous">Poliamor</SelectItem>
                <SelectItem value="open">Relacionamento aberto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros avançados */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            <Separator />

            {/* Faixa etária */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Faixa etária: {localFilters.minAge || 18} - {localFilters.maxAge || 65} anos
              </Label>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500">Idade mínima</Label>
                  <Slider
                    value={[localFilters.minAge || 18]}
                    onValueChange={([value]) => handleFilterChange('minAge', value)}
                    min={18}
                    max={65}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Idade máxima</Label>
                  <Slider
                    value={[localFilters.maxAge || 65]}
                    onValueChange={([value]) => handleFilterChange('maxAge', value)}
                    min={18}
                    max={65}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Distância */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Distância máxima: {localFilters.maxDistance || 50}km
              </Label>
              <Slider
                value={[localFilters.maxDistance || 50]}
                onValueChange={([value]) => handleFilterChange('maxDistance', value)}
                min={1}
                max={200}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Localização */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Localização específica
              </Label>
              <Input
                id="location"
                placeholder="Ex: São Paulo, Rio de Janeiro..."
                value={localFilters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Interesses */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Interesses ({localFilters.interests?.length || 0} selecionados)
              </Label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_OPTIONS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={localFilters.interests?.includes(interest) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:scale-105",
                      localFilters.interests?.includes(interest) && 
                      "bg-pink-600 text-white hover:bg-pink-700"
                    )}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                    {localFilters.interests?.includes(interest) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preferências especiais */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Preferências especiais</Label>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Apenas perfis verificados</span>
                  </div>
                  <Switch
                    checked={localFilters.verified || false}
                    onCheckedChange={(checked) => handleFilterChange('verified', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Apenas usuários premium</span>
                  </div>
                  <Switch
                    checked={localFilters.premium || false}
                    onCheckedChange={(checked) => handleFilterChange('premium', checked)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Estatísticas */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalFound}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Encontrados
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {stats.onlineUsers}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Online
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {stats.verifiedUsers}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Verificados
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {stats.avgCompatibility}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Compatibilidade
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-3">
          <Button 
            onClick={handleApply}
            disabled={loading}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Buscar Perfis
          </Button>
          
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
