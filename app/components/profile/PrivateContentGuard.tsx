"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, UserPlus, Eye, Shield, Heart } from 'lucide-react'

interface PrivateContentGuardProps {
  isFollowing: boolean
  isOwnProfile: boolean
  canViewPrivateContent: boolean
  onFollow: () => void
  profileName: string
  profileUsername: string
  children: React.ReactNode
}

export default function PrivateContentGuard({
  isFollowing,
  isOwnProfile,
  canViewPrivateContent,
  onFollow,
  profileName,
  profileUsername,
  children
}: PrivateContentGuardProps) {
  
  if (canViewPrivateContent) {
    return <>{children}</>
  }

  return (
    <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Conteúdo Privado
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
          {isOwnProfile ? (
            "Este é o seu perfil privado. Outros usuários precisam te seguir para ver este conteúdo."
          ) : (
            <>
              <span className="font-medium">{profileName}</span> (@{profileUsername}) compartilha este conteúdo apenas com seguidores.
            </>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Perfil Protegido
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Apenas Seguidores
          </Badge>
        </div>

        {!isOwnProfile && (
          <div className="space-y-3">
            <Button
              onClick={onFollow}
              className="flex items-center gap-2"
              size="lg"
            >
              <UserPlus className="w-4 h-4" />
              {isFollowing ? "Seguindo" : "Seguir"}
            </Button>
            
            <p className="text-sm text-gray-500">
              {isFollowing ? (
                "Sua solicitação está pendente de aprovação"
              ) : (
                "Siga este perfil para ver posts, fotos e mais conteúdo"
              )}
            </p>
          </div>
        )}

        {/* Estatísticas públicas */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 w-full">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">•••</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">•••</div>
              <div className="text-xs text-gray-500">Seguindo</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">•••</div>
              <div className="text-xs text-gray-500">Seguidores</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}