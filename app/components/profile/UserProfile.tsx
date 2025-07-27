"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { Button, Card, CardBody, CardHeader, Chip, Divider, Image, Link, User, Spinner, Badge } from "@heroui/react"
import { AvatarBadge } from "@/app/components/ui/avatar-badge"
import { RobustAvatar } from "@/app/components/ui/robust-avatar"
import MediaGallery from '@/app/components/profile/MediaGallery'
import ProfileStats from '@/app/components/profile/ProfileStats'
import PrivateContentGuard from '@/app/components/profile/PrivateContentGuard'
import { useAuth } from "@/app/components/auth/AuthProvider"
import { toast } from "sonner"
import PlanAdCard from '@/app/components/ads/PlanAdCard'
import PremiumAction from '@/app/components/premium/PremiumAction'
import { useCanAccess } from "@/lib/plans/hooks"
import { Tabs } from "@/components/ui/tabs"

interface Profile {
  id: string
  username: string
  full_name: string
  bio?: string
  avatar_url?: string
  is_verified?: boolean
  is_premium?: boolean
  is_active?: boolean
  last_seen?: string
  created_at: string
  plano?: string
  stats?: {
    posts?: number
    followers?: number
    following?: number
    profile_views?: number
  }
  privacy?: {
    is_own_profile: boolean
    can_view_private_content: boolean
  }
}

interface Post {
  id: string
  content: string
  media_urls?: string[]
  media_types?: string[]
  hashtags?: string[]
  visibility: 'public' | 'friends_only' | 'private'
  location?: string
  is_premium_content?: boolean
  stats: {
    likes?: number
    comments?: number
    shares?: number
    views?: number
  }
  created_at: string
  updated_at: string
}

interface MediaPost {
  id: string
  media_urls: string[]
  media_types: string[]
  created_at: string
}

interface UserProfileProps {
  username?: string
  isView?: boolean // Se true, funciona como view na home
}

export default function UserProfile({ username, isView = false }: UserProfileProps) {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const profileUsername = username || params.username as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("posts")
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [canViewPrivateContent, setCanViewPrivateContent] = useState(false)

  const canAccess = useCanAccess()

  useEffect(() => {
    if (profileUsername) {
      fetchProfile()
    }
  }, [profileUsername])

  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/profile/${profileUsername}`)
      if (!response.ok) {
        throw new Error("Perfil não encontrado")
      }
      
      const data = await response.json()
      setProfile(data.profile)
      setPosts(data.posts || [])
      setMediaPosts(data.media_posts || [])
      setIsFollowing(data.is_following || false)
      setIsOwnProfile(data.is_own_profile || false)
      setCanViewPrivateContent(data.can_view_private_content || false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!profile || !currentUser) return

    try {
      const response = await fetch("/api/follows", {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json" },
        body: JSON.stringify({ following_id: profile.id }) })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setProfile(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            followers: isFollowing ? (prev.stats?.followers || 0) - 1 : (prev.stats?.followers || 0) + 1,
            posts: prev.stats?.posts || 0,
            following: prev.stats?.following || 0,
            profile_views: prev.stats?.profile_views || 0
          }
        } : null)
        
        toast.success(isFollowing ? "Deixou de seguir" : "Começou a seguir")
      }
    } catch (error) {
      toast.error("Erro ao seguir/deixar de seguir")
    }
  }

  const handleMessage = () => {
    if (!profile) return
    router.push(`/messages?user=${profile.username}`)
  }

  const handleEditProfile = () => {
    router.push("/profile/edit")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:user-x" className="w-16 h-16 mx-auto text-default-400 mb-4" />
          <h2 className="text-xl font-semibold text-default-900 mb-2">Perfil não encontrado</h2>
          <p className="text-default-500 mb-4">{error || "Este usuário não existe ou foi removido."}</p>
          <Button color="primary" onPress={() => router.push("/home")}>
            Voltar para Home
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Se for uma view na home, usar layout mais compacto
  if (isView) {
    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <RobustAvatar
                    src={profile?.avatar_url}
                    email={currentUser?.email}
                    name={profile?.name}
                    username={profile?.username}
                    size="lg"
                    isVerified={profile?.is_verified}
                    isPremium={profile?.is_premium}
                    createdAt={profile?.created_at}
                    className="h-20 w-20 border-4 border-white dark:border-gray-700 shadow-lg"
                  />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">@{profile.username}</p>
                  {profile.bio && (
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2">{profile.bio}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                {isOwnProfile ? (
                  <Button color="primary" onPress={handleEditProfile} className="text-xs sm:text-sm">
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button 
                      color={isFollowing ? "default" : "primary"}
                      variant={isFollowing ? "bordered" : "solid"}
                      onPress={handleFollow}
                      className="text-xs sm:text-sm"
                    >
                      {isFollowing ? "Seguindo" : "Seguir"}
                    </Button>
                    <Button variant="bordered" onPress={handleMessage} className="text-xs sm:text-sm">
                      Mensagem
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats?.posts?.toLocaleString() || "0"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Posts</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats?.followers?.toLocaleString() || "0"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Seguidores</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats?.following?.toLocaleString() || "0"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Seguindo</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats?.profile_views?.toLocaleString() || "0"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Visualizações</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Posts Recentes</h2>
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <AvatarBadge
                        src={profile.avatar_url}
                        alt={profile.name}
                        fallback={profile.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                        size="sm"
                        isVerified={profile.is_verified}
                        isPremium={profile.is_premium}
                        createdAt={profile.created_at}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs sm:text-sm">{profile.name}</span>
                          <span className="text-xs text-gray-500">
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">{post.content}</p>
                        {post.media_urls && post.media_urls.length > 0 && (
                          <div className="mb-2">
                            <Image
                              src={post.media_urls[0]}
                              alt="Post media"
                              className="rounded-lg max-h-32 object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{post.stats?.likes || 0} curtidas</span>
                          <span>{post.stats?.comments || 0} comentários</span>
                          {post.stats?.shares && <span>{post.stats.shares} compartilhamentos</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon icon="lucide:file-text" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-xs sm:text-sm text-gray-500">Nenhum post ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Layout completo para página de perfil
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        <Card className="overflow-visible">
          <CardBody className="p-0">
            {/* Cover Image */}
            <div className="relative h-32 sm:h-48 md:h-64">
              <Image
                removeWrapper
                alt="Profile cover"
                className="object-cover w-full h-full"
                src={profile.avatar_url ? 
                  `https://img.heroui.chat/image/landscape?w=1200&h=400&u=${profile.id}` : 
                  "https://img.heroui.chat/image/landscape?w=1200&h=400&u=1"
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              
              {/* Overlay de informações */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-white">
                  {profile.is_premium && (
                    <Badge color="warning" variant="flat" size="sm" className="bg-yellow-500/20 text-yellow-200">
                      Premium
                    </Badge>
                  )}
                  {profile.is_verified && (
                    <Badge color="primary" variant="flat" size="sm" className="bg-blue-500/20 text-blue-200">
                      Verificado
                    </Badge>
                  )}
                  {!profile.is_active && (
                    <Badge color="default" variant="flat" size="sm" className="bg-gray-500/20 text-gray-200">
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="px-3 sm:px-4 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex items-end">
                  <RobustAvatar
                    src={profile.avatar_url}
                    email={currentUser?.email}
                    name={profile.name}
                    username={profile.username}
                    size="xl"
                    isVerified={profile.is_verified}
                    isPremium={profile.is_premium}
                    createdAt={profile.created_at}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 -mt-8 sm:-mt-10 md:-mt-12 z-10"
                  />
                  <div className="ml-3 sm:ml-4">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold">{profile.full_name}</h1>
                      {profile.is_verified && (
                        <Badge color="success" variant="flat" size="sm">
                          <Icon icon="lucide:check" className="w-3 h-3" />
                        </Badge>
                      )}
                      {profile.is_premium && (
                        <Badge color="warning" variant="flat" size="sm">
                          <Icon icon="lucide:crown" className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <p className="text-small text-default-500">@{profile.username}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button color="primary" onPress={handleEditProfile}>
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button 
                        color={isFollowing ? "default" : "primary"}
                        variant={isFollowing ? "bordered" : "solid"}
                        onPress={handleFollow}
                      >
                        {isFollowing ? "Seguindo" : "Seguir"}
                      </Button>
                      <Button variant="bordered" onPress={handleMessage}>
                        Mensagem
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {profile.bio && (
                <p className="mt-3 sm:mt-4 text-default-700 text-sm sm:text-base">{profile.bio}</p>
              )}
              
              {/* Profile Details */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-small text-default-500">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:map-pin" className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{profile.location}</span>
                  </div>
                )}
                {profile.birth_date && (
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:calendar" className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">
                      {getAge(profile.birth_date)} anos • Entrou em {formatDate(profile.created_at)}
                    </span>
                  </div>
                )}
              </div>
              
              <Divider className="my-3 sm:my-4" />
              
              {/* Stats */}
              <div className="flex justify-between">
                <div className="flex gap-4 sm:gap-6">
                  <div className="text-center">
                    <p className="font-semibold text-sm sm:text-base">
                      {profile.stats?.posts?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs sm:text-small text-default-500">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm sm:text-base">
                      {profile.stats?.followers?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs sm:text-small text-default-500">Seguidores</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm sm:text-base">
                      {profile.stats?.following?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs sm:text-small text-default-500">Seguindo</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm sm:text-base">
                      {profile.stats?.profile_views?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs sm:text-small text-default-500">Visualizações</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabs */}
        <Tabs 
          aria-label="Profile sections" 
          className="mt-4"
          color="primary"
          variant="underlined"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          <Tab key="posts" title="Posts">
            <Card>
              <CardBody>
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="border-b border-default-200 pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <RobustAvatar
                            src={profile.avatar_url}
                            email={currentUser?.email}
                            name={profile.full_name}
                            username={profile.username}
                            size="sm"
                            isVerified={profile.is_verified}
                            isPremium={profile.is_premium}
                            createdAt={profile.created_at}
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{profile.full_name}</span>
                              <span className="text-xs text-default-500">
                                {formatDate(post.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-default-700 mb-2">{post.content}</p>
                            {post.media_urls && post.media_urls.length > 0 && (
                              <div className="mb-2">
                                <Image
                                  src={post.media_urls[0]}
                                  alt="Post media"
                                  className="rounded-lg max-h-64 object-cover"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-default-500">
                              <span>{post.stats?.likes || 0} curtidas</span>
                              <span>{post.stats?.comments || 0} comentários</span>
                              {post.stats?.shares && <span>{post.stats.shares} compartilhamentos</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon icon="lucide:file-text" className="w-12 h-12 mx-auto text-default-400 mb-4" />
                    <p className="text-default-500">Nenhum post ainda</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Tab>
          
          <Tab key="media" title="Galeria">
            <Card>
              <CardBody>
                <MediaGallery 
                  mediaPosts={mediaPosts}
                  canViewPrivateContent={canViewPrivateContent}
                />
              </CardBody>
            </Card>
          </Tab>
          
          <Tab key="stats" title="Estatísticas">
            <Card>
              <CardBody>
                <ProfileStats 
                  profile={profile}
                  canViewPrivateContent={canViewPrivateContent}
                />
              </CardBody>
            </Card>
          </Tab>
          
          <Tab key="about" title="Sobre">
            <Card>
              <CardBody>
                <div className="space-y-4">
                  {profile.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">Sobre</h3>
                      <p className="text-sm text-default-700">{profile.bio}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold mb-2">Informações da Conta</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-default-500">Membro desde:</span>
                        <span>{formatDate(profile.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Status:</span>
                        <span className={profile.is_active ? "text-success" : "text-default-500"}>
                          {profile.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      {profile.is_premium && (
                        <div className="flex justify-between">
                          <span className="text-default-500">Tipo de conta:</span>
                          <span className="text-warning">Premium</span>
                        </div>
                      )}
                      {profile.plano && profile.plano !== 'free' && (
                        <div className="flex justify-between">
                          <span className="text-default-500">Plano:</span>
                          <span className="text-primary capitalize">{profile.plano}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}
