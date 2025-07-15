"use client"

import { useState } from "react"
import { MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

interface DistanceFilterProps {
  onDistanceChange: (distance: number) => void
  maxDistance?: number
  className?: string
}

export function DistanceFilter({ 
  onDistanceChange, 
  maxDistance = 100,
  className = "" 
}: DistanceFilterProps) {
  const [distance, setDistance] = useState(50)

  const handleDistanceChange = (value: number[]) => {
    const newDistance = value[0]
    setDistance(newDistance)
    onDistanceChange(newDistance)
  }

  const getDistanceLabel = (dist: number): string => {
    if (dist <= 5) return "Muito próximo"
    if (dist <= 20) return "Próximo"
    if (dist <= 50) return "Perto"
    if (dist <= 100) return "Distante"
    return "Muito distante"
  }

  const getDistanceColor = (dist: number): string => {
    if (dist <= 5) return "bg-green-500"
    if (dist <= 20) return "bg-blue-500"
    if (dist <= 50) return "bg-yellow-500"
    if (dist <= 100) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gray-500" />
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          Distância Máxima
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {distance}km
          </span>
          <Badge 
            variant="secondary" 
            className={`${getDistanceColor(distance)} text-white`}
          >
            {getDistanceLabel(distance)}
          </Badge>
        </div>

        <Slider
          value={[distance]}
          onValueChange={handleDistanceChange}
          max={maxDistance}
          min={1}
          step={1}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-gray-500">
          <span>1km</span>
          <span>{maxDistance}km</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Muito próximo (≤5km)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Próximo (≤20km)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>Perto (≤50km)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span>Distante (≤100km)</span>
        </div>
      </div>
    </div>
  )
} 