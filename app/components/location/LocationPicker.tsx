"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { 
  MapPin, 
  Loader2,
  Navigation,
  Search,
  X
} from 'lucide-react'
import { cn } from "@/lib/utils"

interface LocationData {
  name: string
  address: string
  latitude: number
  longitude: number
  place_id?: string
}

interface LocationPickerProps {
  onLocationSelected: (location: LocationData) => void
  placeholder?: string
  required?: boolean
  error?: string
  initialValue?: LocationData
  className?: string
}

// Simulando dados de locais (em produção, usar Google Places API)
const MOCK_LOCATIONS = [
  {
    name: "Shopping Morumbi",
    address: "Av. Roque Petroni Júnior, 1089 - Morumbi, São Paulo - SP",
    latitude: -23.6181,
    longitude: -46.6975,
    place_id: "mock_1"
  },
  {
    name: "Parque Ibirapuera",
    address: "Av. Paulista, 1578 - Bela Vista, São Paulo - SP",
    latitude: -23.5873,
    longitude: -46.6578,
    place_id: "mock_2"
  },
  {
    name: "Centro Cultural Banco do Brasil",
    address: "R. Álvares Penteado, 112 - Centro Histórico de São Paulo, São Paulo - SP",
    latitude: -23.5467,
    longitude: -46.6386,
    place_id: "mock_3"
  },
  {
    name: "Arena Corinthians",
    address: "Av. Miguel Ignácio Curi, 111 - Artur Alvim, São Paulo - SP",
    latitude: -23.5452,
    longitude: -46.4741,
    place_id: "mock_4"
  },
  {
    name: "Museu de Arte de São Paulo",
    address: "Av. Paulista, 1578 - Bela Vista, São Paulo - SP",
    latitude: -23.5616,
    longitude: -46.6556,
    place_id: "mock_5"
  }
]

export default function LocationPicker({ 
  onLocationSelected, 
  placeholder = "Buscar local...",
  required = false,
  error,
  initialValue,
  className 
}: LocationPickerProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<LocationData[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialValue || null)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Localização não disponível:', error)
        }
      )
    }
  }, [])

  // Buscar sugestões
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const searchLocations = async () => {
      setLoading(true)
      try {
        // Em produção, usar Google Places API
        // const response = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`)
        
        // Mock search - filtrar locais baseado na query
        const filtered = MOCK_LOCATIONS.filter(location =>
          location.name.toLowerCase().includes(query.toLowerCase()) ||
          location.address.toLowerCase().includes(query.toLowerCase())
        )
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 300))
        
        setSuggestions(filtered)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Erro ao buscar locais:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    searchLocations()
  }, [query])

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location)
    setQuery(location.name)
    setShowSuggestions(false)
    onLocationSelected(location)
  }

  const useCurrentLocation = () => {
    if (!userLocation) return

    setLoading(true)
    
    // Em produção, usar reverse geocoding
    setTimeout(() => {
      const currentLocation: LocationData = {
        name: "Localização Atual",
        address: "Sua localização atual",
        latitude: userLocation.lat,
        longitude: userLocation.lng
      }
      
      handleLocationSelect(currentLocation)
      setLoading(false)
    }, 500)
  }

  const clearLocation = () => {
    setSelectedLocation(null)
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  return (
    <div className={cn("relative", className)}>
      <Label className="text-sm font-medium">
        Local {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="mt-1 relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (selectedLocation && e.target.value !== selectedLocation.name) {
                setSelectedLocation(null)
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className={cn(
              "pl-10 pr-20",
              error && "border-red-500"
            )}
          />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            {selectedLocation && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearLocation}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
        </div>

        {/* Botão para usar localização atual */}
        {userLocation && !selectedLocation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={useCurrentLocation}
            className="mt-2 w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Usar minha localização atual
          </Button>
        )}

        {/* Sugestões */}
        {showSuggestions && suggestions.length > 0 && (
          <Card 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto"
          >
            <CardContent className="p-0">
              {suggestions.map((location, index) => (
                <button
                  key={location.place_id || index}
                  type="button"
                  onClick={() => handleLocationSelect(location)}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{location.name}</p>
                      <p className="text-xs text-gray-600 truncate">{location.address}</p>
                      {userLocation && (
                        <p className="text-xs text-gray-500 mt-1">
                          {calculateDistance(
                            userLocation.lat, 
                            userLocation.lng, 
                            location.latitude, 
                            location.longitude
                          ).toFixed(1)}km de distância
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Sugestões vazias */}
        {showSuggestions && query.length >= 2 && suggestions.length === 0 && !loading && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1">
            <CardContent className="p-4 text-center">
              <Search className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Nenhum local encontrado</p>
              <p className="text-xs text-gray-500 mt-1">
                Tente buscar por nome do local ou endereço
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {/* Local selecionado */}
      {selectedLocation && (
        <Card className="mt-2 bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-green-800">{selectedLocation.name}</p>
                <p className="text-xs text-green-700">{selectedLocation.address}</p>
                {userLocation && selectedLocation.latitude && selectedLocation.longitude && (
                  <p className="text-xs text-green-600 mt-1">
                    {calculateDistance(
                      userLocation.lat, 
                      userLocation.lng, 
                      selectedLocation.latitude, 
                      selectedLocation.longitude
                    ).toFixed(1)}km de você
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
