"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BadgeCheck, UserPlus, Bookmark, Star, Calendar, MapPin } from "lucide-react"

interface ProfileCardProps {
  profile: {
    id: string
    name: string
    username: string
    profileImage?: string
    backgroundImage?: string
    verified?: boolean
    tags?: string[]
    rating?: number
    followers?: number
    following?: number
    description?: string
    joinedDate?: string
    location?: string
    is_following?: boolean
  }
  onFollow?: (userId: string) => void
  onSave?: (userId: string) => void
}

export default function ProfileCard({ profile, onFollow, onSave }: ProfileCardProps) {
  return (
    <Card className="relative w-full max-w-[320px] sm:max-w-sm overflow-hidden shadow-xl border-0">
      {/* Background Header */}
      <div className="relative h-24 sm:h-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <CardContent className="relative px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Profile Avatar - Overlapping the background */}
        <div className="flex justify-center -mt-8 sm:-mt-12 mb-3 sm:mb-4">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white shadow-lg">
            <AvatarImage src={profile.profileImage || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback className="text-sm sm:text-lg font-semibold">
              {profile.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Profile Info */}
        <div className="text-center space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{profile.name}</h3>
            {profile.verified && <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 fill-blue-500 text-white flex-shrink-0" />}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{profile.username}</p>

          {/* Tags */}
          {profile.tags && profile.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-1 sm:mt-2">
              {profile.tags.slice(0, 2).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                  {tag}
                </Badge>
              ))}
              {profile.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  +{profile.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground mt-2 sm:mt-3">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-20 sm:max-w-none">{profile.location}</span>
              </div>
            )}
            {profile.joinedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="hidden sm:inline">Registrado {profile.joinedDate}</span>
                <span className="sm:hidden">{profile.joinedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed mb-3 sm:mb-4 line-clamp-2">
          {profile.description || "Usuário do OpenLove"}
        </p>

        <Separator className="my-3 sm:my-4" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              {profile.rating || 4.5}
            </div>
            <div className="text-xs text-muted-foreground">Avaliação</div>
          </div>
          <div className="text-center">
            <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
              {profile.followers || 0}
            </div>
            <div className="text-xs text-muted-foreground">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
              {profile.following || 0}
            </div>
            <div className="text-xs text-muted-foreground">Seguindo</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <Button 
            className="flex-1" 
            size="sm"
            variant={profile.is_following ? "outline" : "default"}
            onClick={() => onFollow?.(profile.id)}
          >
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">
              {profile.is_following ? "Seguindo" : "Seguir"}
            </span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSave?.(profile.id)}
          >
            <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Salvar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 