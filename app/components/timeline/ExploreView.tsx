"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, UserPlus, UserMinus } from "lucide-react"

interface ExploreViewProps {
  users: any[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchFilters: any
  setSearchFilters: (filters: any) => void
  toggleFollow: (username: string) => void
}

export function ExploreView({
  users,
  searchQuery,
  setSearchQuery,
  searchFilters,
  setSearchFilters,
  toggleFollow,
}: ExploreViewProps) {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Explorar Pessoas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar pessoas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 dark:border-gray-600 focus:ring-pink-500 dark:focus:ring-pink-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={searchFilters.location}
              onValueChange={(value) => setSearchFilters({ ...searchFilters, location: value })}
            >
              <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
              onValueChange={(value) => setSearchFilters({ ...searchFilters, ageRange: value })}
            >
              <SelectTrigger className="border-gray-300 dark:border-gray-600">
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
        </CardContent>
      </Card>

      <div className="space-y-4">
        {users.map((user) => (
          <Card
            key={user.id}
            className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{user.name}</h3>
                      {user.isPremium && (
                        <Badge
                          variant="outline"
                          className="text-xs border-pink-600 text-pink-600 bg-pink-100 dark:bg-pink-900 dark:text-pink-300"
                        >
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {user.location} • {user.age} anos
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.interests.slice(0, 3).map((interest: string) => (
                        <Badge key={interest} variant="secondary" className="text-xs bg-gray-200 dark:bg-gray-700">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    {user.mutualFriends > 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {user.mutualFriends} amigos em comum
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant={user.isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleFollow(user.username)}
                  className={
                    user.isFollowing
                      ? "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      : "bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:via-rose-700 hover:to-purple-700 text-white"
                  }
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
