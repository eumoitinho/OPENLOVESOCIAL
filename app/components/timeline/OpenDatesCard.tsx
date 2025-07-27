"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight, Heart, Star, Users, Calendar, MapPin, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface OpenDatesCardData {
  id: string
  user_id: string
  title: string
  subtitle: string
  description: string
  image_url: string
  icon: string
  colors: {
    primary: string
    secondary: string
    text: string
    shadow: string
  }
  user?: {
    full_name: string
    username: string
    avatar_url?: string
    age?: number
    location?: string
    interests?: string[]
    profile_type?: string
  }
  distance?: number
  common_interests?: string[]
}

interface OpenDatesCardProps {
  card: OpenDatesCardData
  index: number
  onLike: (cardId: string) => void
  onPass: (cardId: string) => void
  onSuperLike: (cardId: string) => void
  totalCards: number
}

export function OpenDatesCard({ 
  card, 
  index, 
  onLike, 
  onPass, 
  onSuperLike, 
  totalCards 
}: OpenDatesCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null)
  
  const zIndex = totalCards - index
  const yOffset = index * 30
  const xOffset = index * 5

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "heart":
        return <Heart className="h-5 w-5" />
      case "star":
        return <Star className="h-5 w-5" />
      case "users":
        return <Users className="h-5 w-5" />
      case "calendar":
        return <Calendar className="h-5 w-5" />
      default:
        return <Heart className="h-5 w-5" />
    }
  }

  const handleDragEnd = (event: any, info: any) => {
    if (index === 0) {
      const distance = Math.sqrt(Math.pow(info.offset.x, 2) + Math.pow(info.offset.y, 2))
      const threshold = 150
      
      if (distance > threshold) {
        if (info.offset.x > 0) {
          onLike(card.id)
        } else {
          onPass(card.id)
        }
      }
    }
    setIsDragging(false)
    setDragDirection(null)
  }

  const handleDrag = (event: any, info: any) => {
    if (index === 0) {
      setIsDragging(true)
      if (info.offset.x > 50) {
        setDragDirection('right')
      } else if (info.offset.x < -50) {
        setDragDirection('left')
      } else {
        setDragDirection(null)
      }
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 100, x: xOffset }}
      animate={{
        opacity: 1,
        y: yOffset,
        x: xOffset,
        scale: 1 - index * 0.04,
        rotateZ: index * -3 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 50,
        mass: 1 }}
      style={{
        zIndex,
        boxShadow: `0 ${10 + index * 5}px ${30 + index * 10}px ${card.colors.shadow}`,
        backgroundColor: card.colors.primary }}
      className="absolute left-0 top-0 h-full w-full cursor-grab overflow-hidden rounded-2xl active:cursor-grabbing"
      drag={index === 0 ? "x" : false}
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.6}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: 1.05,
        boxShadow: `0 ${15 + index * 5}px ${40 + index * 10}px ${card.colors.shadow}` }}
    >
      <motion.div
        className="relative flex h-full flex-col overflow-hidden rounded-2xl"
        style={{ color: card.colors.text }}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between p-4">
          <div 
            className="rounded-full bg-opacity-20 p-2" 
            style={{ backgroundColor: `${card.colors.text}20` }}
          >
            {getIconComponent(card.icon)}
          </div>
          <div 
            className="rounded-full bg-opacity-20 p-2" 
            style={{ backgroundColor: `${card.colors.text}20` }}
          >
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        {/* Card Title */}
        <div className="px-4 py-2">
          <h2 className="text-3xl font-bold">{card.title}</h2>
          <h3 className="text-xl font-medium" style={{ color: `${card.colors.text}99` }}>
            {card.subtitle}
          </h3>
        </div>

        {/* Card Image */}
        <div className="mt-2 overflow-hidden px-4">
          <div
            className="aspect-video w-full overflow-hidden rounded-xl bg-cover bg-center"
            style={{
              backgroundImage: `url(${card.image_url})`,
              boxShadow: `0 10px 30px ${card.colors.shadow}` }}
          />
        </div>

        {/* User Info */}
        {card.user && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/20">
                <AvatarImage src={card.user.avatar_url} alt={card.user.full_name} />
                <AvatarFallback className="text-sm font-semibold">
                  {card.user.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{card.user.full_name}</h4>
                <div className="flex items-center gap-2 text-sm opacity-80">
                  {card.user.age && <span>{card.user.age} anos</span>}
                  {card.user.location && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{card.user.location}</span>
                      </div>
                    </>
                  )}
                  {card.distance && (
                    <>
                      <span>•</span>
                      <span>{Math.round(card.distance)}km</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Common Interests */}
            {card.common_interests && card.common_interests.length > 0 && (
              <div className="mt-3">
                <p className="text-sm opacity-80 mb-2">Interesses em comum:</p>
                <div className="flex flex-wrap gap-1">
                  {card.common_interests.slice(0, 3).map((interest, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="text-xs"
                      style={{ backgroundColor: `${card.colors.text}20`, color: card.colors.text }}
                    >
                      {interest}
                    </Badge>
                  ))}
                  {card.common_interests.length > 3 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ backgroundColor: `${card.colors.text}20`, color: card.colors.text }}
                    >
                      +{card.common_interests.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Card Footer */}
        <div className="mt-auto p-4">
          <div
            className="rounded-full px-3 py-1 text-sm mb-3"
            style={{
              backgroundColor: `${card.colors.text}20`,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem" }}
          >
            <Heart className="h-4 w-4" />
            {card.subtitle}
          </div>
          <p className="text-sm opacity-80 mb-4">{card.description}</p>
          
          {/* Action Buttons */}
          {index === 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPass(card.id)}
                className="flex-1"
                style={{ 
                  borderColor: `${card.colors.text}40`,
                  color: card.colors.text 
                }}
              >
                Passar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSuperLike(card.id)}
                className="flex-1"
                style={{ 
                  borderColor: `${card.colors.text}40`,
                  color: card.colors.text 
                }}
              >
                <Star className="w-4 h-4 mr-1" />
                Super
              </Button>
              <Button
                size="sm"
                onClick={() => onLike(card.id)}
                className="flex-1"
                style={{ 
                  backgroundColor: card.colors.secondary,
                  color: card.colors.text 
                }}
              >
                <Heart className="w-4 h-4 mr-1" />
                Curtir
              </Button>
            </div>
          )}
        </div>

        {/* Drag indicator for the top card */}
        {index === 0 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 flex-col items-center">
            <motion.div
              className="h-1 w-10 rounded-full"
              style={{ backgroundColor: `${card.colors.text}40` }}
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
            />
          </div>
        )}

        {/* Drag direction indicators */}
        {isDragging && index === 0 && (
          <AnimatePresence>
            {dragDirection === 'right' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute top-1/2 right-4 -translate-y-1/2"
              >
                <div className="bg-green-500 text-white p-3 rounded-full">
                  <Heart className="w-8 h-8" />
                </div>
              </motion.div>
            )}
            {dragDirection === 'left' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute top-1/2 left-4 -translate-y-1/2"
              >
                <div className="bg-red-500 text-white p-3 rounded-full">
                  <ArrowUpRight className="w-8 h-8" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  )
} 
