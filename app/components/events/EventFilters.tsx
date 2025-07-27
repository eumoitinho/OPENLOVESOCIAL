"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { 
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Star,
  X
} from 'lucide-react'
import { cn } from "@/lib/utils"

interface EventFiltersProps {
  filters: EventFilters
  onFiltersChange: (filters: EventFilters) => void
  userLocation?: {lat: number, lng: number} | null
}

interface EventFilters {
  category?: string
  type?: 'all' | 'public' | 'private' | 'paid'
  dateRange?: 'today' | 'this_week' | 'this_month' | 'custom'
  location?: 'nearby' | 'online' | 'all'
  priceRange?: 'free' | 'paid' | 'all'
  distance?: number
  minParticipants?: number
  maxParticipants?: number
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all'
  verified?: boolean
}

const EVENT_CATEGORIES = [
  'Festa', 'Workshop', 'Meetup', 'Networking', 'Esporte', 'Cultural',
  'Música', 'Arte', 'Gastronomia', 'Tecnologia', 'Negócios', 'Educação',
  'Saúde', 'Fitness', 'Viagem', 'Lifestyle', 'Outro'
]

export default function EventFilters({ 
  filters, 
  onFiltersChange, 
  userLocation 
}: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = (key: keyof EventFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      type: 'all',
      dateRange: 'this_week',
      location: 'all',
      priceRange: 'all'
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category) count++
    if (filters.type && filters.type !== 'all') count++
    if (filters.dateRange && filters.dateRange !== 'this_week') count++
    if (filters.location && filters.location !== 'all') count++
    if (filters.priceRange && filters.priceRange !== 'all') count++
    if (filters.distance && filters.distance < 50) count++
    if (filters.minParticipants) count++
    if (filters.maxParticipants) count++
    if (filters.timeOfDay && filters.timeOfDay !== 'all') count++
    if (filters.verified) count++
    return count
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Menos' : 'Mais'} filtros
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Categoria */}
          <div>
            <Label>Categoria</Label>
            <Select 
              value={filters.category || ''} 
              onValueChange={(value) => updateFilters('category', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {EVENT_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo */}
          <div>
            <Label>Tipo</Label>
            <Select 
              value={filters.type || 'all'} 
              onValueChange={(value) => updateFilters('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="public">Públicos</SelectItem>
                <SelectItem value="private">Privados</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div>
            <Label>Período</Label>
            <Select 
              value={filters.dateRange || 'this_week'} 
              onValueChange={(value) => updateFilters('dateRange', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="this_week">Esta semana</SelectItem>
                <SelectItem value="this_month">Este mês</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Localização */}
          <div>
            <Label>Localização</Label>
            <Select 
              value={filters.location || 'all'} 
              onValueChange={(value) => updateFilters('location', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {userLocation && (
                  <SelectItem value="nearby">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Próximos
                    </div>
                  </SelectItem>
                )}
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros avançados */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Preço */}
              <div>
                <Label>Preço</Label>
                <Select 
                  value={filters.priceRange || 'all'} 
                  onValueChange={(value) => updateFilters('priceRange', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer preço</SelectItem>
                    <SelectItem value="free">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Gratuitos
                      </div>
                    </SelectItem>
                    <SelectItem value="paid">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Pagos
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Horário do dia */}
              <div>
                <Label>Horário</Label>
                <Select 
                  value={filters.timeOfDay || 'all'} 
                  onValueChange={(value) => updateFilters('timeOfDay', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer horário</SelectItem>
                    <SelectItem value="morning">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Manhã (6h-12h)
                      </div>
                    </SelectItem>
                    <SelectItem value="afternoon">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Tarde (12h-18h)
                      </div>
                    </SelectItem>
                    <SelectItem value="evening">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Noite (18h-24h)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Criadores verificados */}
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={filters.verified || false}
                  onCheckedChange={(checked) => updateFilters('verified', checked)}
                />
                <Label className="text-sm">
                  Apenas criadores verificados
                </Label>
              </div>
            </div>

            {/* Distância (apenas se localização estiver disponível) */}
            {userLocation && filters.location === 'nearby' && (
              <div>
                <Label>
                  Distância máxima: {filters.distance || 50}km
                </Label>
                <div className="mt-2">
                  <Slider
                    value={[filters.distance || 50]}
                    onValueChange={([value]) => updateFilters('distance', value)}
                    max={100}
                    min={1}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1km</span>
                    <span>100km</span>
                  </div>
                </div>
              </div>
            )}

            {/* Número de participantes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mín. Participantes</Label>
                <Select 
                  value={filters.minParticipants?.toString() || ''} 
                  onValueChange={(value) => updateFilters('minParticipants', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer número</SelectItem>
                    <SelectItem value="5">5+ pessoas</SelectItem>
                    <SelectItem value="10">10+ pessoas</SelectItem>
                    <SelectItem value="20">20+ pessoas</SelectItem>
                    <SelectItem value="50">50+ pessoas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Máx. Participantes</Label>
                <Select 
                  value={filters.maxParticipants?.toString() || ''} 
                  onValueChange={(value) => updateFilters('maxParticipants', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem limite</SelectItem>
                    <SelectItem value="10">Até 10 pessoas</SelectItem>
                    <SelectItem value="25">Até 25 pessoas</SelectItem>
                    <SelectItem value="50">Até 50 pessoas</SelectItem>
                    <SelectItem value="100">Até 100 pessoas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
