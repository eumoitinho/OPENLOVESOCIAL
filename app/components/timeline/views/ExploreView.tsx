"use client"

import React from "react"
import { Search, UserPlus, UserMinus, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Tipos podem ser centralizados
type User = {
  id: string
  name: string
  username: string
  avatar: string
  location: string
  age: number
  interests: string[]
  isPremium: boolean
  isFollowing: boolean
  mutualFriends: number
}

type SearchFilters = {
  location: string
  ageRange: string
  interests: string
  isPremium: boolean
}

interface ExploreViewProps {
  users: User[]
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  searchFilters: SearchFilters
  onSearchFiltersChange: (filters: SearchFilters) => void
  onToggleFollow: (username:string) => void
}

export function ExploreView({
  users,
  searchQuery,
  onSearchQueryChange,
  searchFilters,
  onSearchFiltersChange,
  onToggleFollow
}: ExploreViewProps) {

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean) => {
    onSearchFiltersChange({ ...searchFilters, [key]: value });
  }

  return (
    <div className="border-x border-openlove-200 min-h-screen">
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-openlove-200 p-4">
        <h2 className="text-xl font-bold text-openlove-800">Explorar</h2>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-openlove-400 w-4 h-4" />
          <Input
            placeholder="Buscar pessoas..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10 border-openlove-300 focus:ring-openlove-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Select
            value={searchFilters.location}
            onValueChange={(value) => handleFilterChange("location", value)}
          >
            <SelectTrigger className="border-openlove-300">
              <SelectValue placeholder="Localização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value="São Paulo">São Paulo</SelectItem>
              <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
              <SelectItem value="Belo Horizonte">Belo Horizonte</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={searchFilters.ageRange}
            onValueChange={(value) => handleFilterChange("ageRange", value)}
          >
            <SelectTrigger className="border-openlove-300">
              <SelectValue placeholder="Idade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value="18-25">18-25 anos</SelectItem>
              <SelectItem value="26-35">26-35 anos</SelectItem>
              <SelectItem value="36+">36+ anos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="divide-y divide-openlove-200">
        {users.map((user) => (
          <div key={user.id} className="p-4 hover:bg-openlove-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-r from-openlove-400 to-openlove-500 text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-openlove-800">{user.name}</h3>
                    {user.isPremium && (
                      <Badge variant="outline" className="text-xs border-openlove-600 text-openlove-600">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-openlove-500">@{user.username}</p>
                  <p className="text-xs text-openlove-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {user.location} • {user.age} anos
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.interests.slice(0, 3).map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs bg-openlove-200">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  {user.mutualFriends > 0 && (
                    <p className="text-xs text-openlove-600 mt-1">{user.mutualFriends} amigos em comum</p>
                  )}
                </div>
              </div>
              <Button
                variant={user.isFollowing ? "outline" : "default"}
                size="sm"
                onClick={() => onToggleFollow(user.username)}
                className={cn(
                  user.isFollowing
                    ? "border-openlove-300 text-openlove-600 hover:bg-openlove-100"
                    : "bg-gradient-to-r from-openlove-500 to-openlove-600 hover:from-openlove-600 hover:to-openlove-700 text-white",
                )}
              >
                {user.isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-1" />
                    Seguindo
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Seguir
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
