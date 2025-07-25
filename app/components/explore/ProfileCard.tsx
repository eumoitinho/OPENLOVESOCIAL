"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Star, 
  Users, 
  MessageCircle, 
  BadgeCheck,
  Crown,
  Clock,
  Eye,
  UserPlus,
  Bookmark,
  MoreHorizontal,
  Zap,
  Target,
  Award
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { RobustAvatar } from "@/app/components/ui/robust-avatar"
import { ExploreProfile } from "@/app/hooks/useProfileExplore"

interface ProfileCardProps {
  profile: ExploreProfile
  onLike?: (profileId: string) => void
  onMessage?: (profileId: string) => void
  onFollow?: (profileId: string) => void
  onSave?: (profileId: string) => void
  onViewProfile?: (profileId: string) => void
  currentUser?: {
    id: string
    name: string
    username: string
  }
}

export function ProfileCard({
  profile,
  onLike,
  onMessage,
  onFollow,
  onSave,
  onViewProfile,
  currentUser
}: ProfileCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showFullBio, setShowFullBio] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(profile.id)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave?.(profile.id)
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    onFollow?.(profile.id)
  }

  const handleMessage = () => {
    onMessage?.(profile.id)
  }

  const handleViewProfile = () => {
    onViewProfile?.(profile.username)
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 dark:bg-green-900/20"
    if (score >= 60) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
    if (score >= 40) return "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
    return "text-red-600 bg-red-50 dark:bg-red-900/20"
  }

  const getCompatibilityIcon = (score: number) => {
    if (score >= 80) return <Zap className="w-3 h-3" />
    if (score >= 60) return <Target className="w-3 h-3" />
    if (score >= 40) return <Award className="w-3 h-3" />
    return <Star className="w-3 h-3" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="relative overflow-hidden border-gray-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300 group">
        {/* Header com Avatar e Status */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <RobustAvatar
                  src={profile.avatar}
                  name={profile.name}
                  size="lg"
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={handleViewProfile}
                />
                {profile.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 
                    className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-pink-600 dark:hover:text-pink-400 transition-colors truncate"
                    onClick={handleViewProfile}
                  >
                    {profile.name}
                  </h3>
                  {profile.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                  {profile.isPremium && (
                    <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>@{profile.username}</span>
                  {profile.age && (
                    <>
                      <span>•</span>
                      <span>{profile.age} anos</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status de Compatibilidade */}
          {profile.compatibilityScore > 0 && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg",
              getCompatibilityColor(profile.compatibilityScore)
            )}>
              {getCompatibilityIcon(profile.compatibilityScore)}
              <span className="text-sm font-medium">
                {profile.compatibilityScore}% compatível
              </span>
              <span className="text-xs opacity-75">
                • {profile.commonInterests.length} interesses em comum
              </span>
            </div>
          )}

          {/* Localização e Distância */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{profile.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{profile.distance}km</span>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className={cn(
                "leading-relaxed",
                !showFullBio && "line-clamp-3"
              )}>
                {profile.bio}
              </p>
              {profile.bio.length > 100 && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 text-xs mt-1 font-medium"
                >
                  {showFullBio ? "Ver menos" : "Ver mais"}
                </button>
              )}
            </div>
          )}

          {/* Interesses */}
          {profile.interests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Interesses
              </h4>
              <div className="flex flex-wrap gap-1">
                {profile.interests.slice(0, 5).map((interest, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className={cn(
                      "text-xs",
                      profile.commonInterests.includes(interest) && 
                      "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800"
                    )}
                  >
                    {interest}
                  </Badge>
                ))}
                {profile.interests.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.interests.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {profile.stats.followers}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Seguidores
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {profile.stats.posts}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Posts
              </div>
            </div>
          </div>

          {/* Status Online */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className={cn(
              "w-2 h-2 rounded-full",
              profile.isOnline ? "bg-green-500" : "bg-gray-400"
            )}></div>
            <span>
              {profile.isOnline 
                ? "Online agora" 
                : profile.lastSeen 
                  ? `Visto ${new Date(profile.lastSeen).toLocaleDateString()}`
                  : "Offline"
              }
            </span>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
              onClick={handleMessage}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Mensagem
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLike}
              className={cn(
                "transition-all duration-200",
                isLiked && "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
              )}
            >
              <Heart className={cn(
                "w-4 h-4", 
                isLiked && "fill-current"
              )} />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleFollow}
              className={cn(
                "transition-all duration-200",
                isFollowing && "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
              )}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSave}
              className={cn(
                "transition-all duration-200",
                isSaved && "bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400"
              )}
            >
              <Bookmark className={cn(
                "w-4 h-4", 
                isSaved && "fill-current"
              )} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}