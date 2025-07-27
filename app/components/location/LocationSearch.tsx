"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Location {
  id: number
  nome: string
  uf: string
  latitude: number
  longitude: number
}

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void
  placeholder?: string
  className?: string
  initialValue?: string
}

export function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Buscar cidade...",
  className = "",
  initialValue = ""
}: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounce para evitar muitas requisições
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setSelectedLocation(null)

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (value.length < 2) {
      setLocations([])
      setShowDropdown(false)
      return
    }

    searchTimeout.current = setTimeout(() => {
      searchLocations(value)
    }, 300)
  }

  const searchLocations = async (query: string) => {
    setIsLoading(true)
    setShowDropdown(true)

    try {
      // Usar a API do IBGE para buscar cidades
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=${encodeURIComponent(query)}`
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar localizações')
      }

      const data = await response.json()
      
      // Formatar os dados da API do IBGE
      const formattedLocations: Location[] = data.slice(0, 10).map((item: any) => ({
        id: item.id,
        nome: item.nome,
        uf: item.microrregiao.mesorregiao.UF.sigla,
        latitude: 0, // Será preenchido com coordenadas aproximadas
        longitude: 0
      }))

      setLocations(formattedLocations)
    } catch (error) {
      console.error('Erro ao buscar localizações:', error)
      setLocations([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location)
    setSearchTerm(`${location.nome}, ${location.uf}`)
    setShowDropdown(false)

    // Obter coordenadas da cidade
    try {
      const response = await fetch(`/api/location/coordinates?cityId=${location.id}`)
      if (response.ok) {
        const data = await response.json()
        const locationWithCoords = {
          ...location,
          latitude: data.coordinates.latitude,
          longitude: data.coordinates.longitude
        }
        onLocationSelect(locationWithCoords)
      } else {
        // Usar coordenadas aproximadas se não conseguir obter as precisas
        onLocationSelect(location)
      }
    } catch (error) {
      console.error('Erro ao obter coordenadas:', error)
      onLocationSelect(location)
    }
  }

  const clearLocation = () => {
    setSelectedLocation(null)
    setSearchTerm("")
    setLocations([])
    setShowDropdown(false)
    onLocationSelect({
      id: 0,
      nome: "",
      uf: "",
      latitude: 0,
      longitude: 0
    })
  }

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          onFocus={() => {
            if (locations.length > 0) setShowDropdown(true)
          }}
        />
        {selectedLocation && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearLocation}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && (locations.length > 0 || isLoading) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Buscando...</span>
            </div>
          ) : (
            <div className="py-1">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {location.nome}
                    </div>
                    <div className="text-sm text-gray-500">
                      {location.uf}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {location.uf}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Localização selecionada */}
      {selectedLocation && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedLocation.nome}, {selectedLocation.uf}
            </span>
          </div>
        </div>
      )}
    </div>
  )
} 
