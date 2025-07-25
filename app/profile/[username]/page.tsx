"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Image,
  Link,
  Tabs,
  Tab,
  User,
  Spinner,
  Badge
} from "@heroui/react"
import { useAuth } from '@/app/components/auth/AuthProvider'
import { toast } from 'sonner'
import SimpleProfileFix from '@/app/components/profile/SimpleProfileFix'

interface Profile {
  id: string
  username: string
  name: string
  first_name?: string
  last_name?: string
  bio?: string
  avatar_url?: string
  cover_url?: string
  location?: string
  birth_date?: string
  gender?: 'male' | 'female' | 'couple' | 'other'
  relationship_status?: string
  interests?: string[]
  created_at: string
  is_premium?: boolean
  is_verified?: boolean
  premium_type?: 'free' | 'premium' | 'diamante'
  stats?: {
    posts?: number
    followers?: number
    following?: number
    friends?: number
    events?: number
    communities?: number
    profile_views?: number
  }
}

interface Post {
  id: string
  content: string
  media_urls?: string[]
  media_types?: string[]
  created_at: string
  likes_count: number
  comments_count: number
  is_liked?: boolean
}

export default function UserProfile() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const username = params.username as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [communities, setCommunities] = useState<any[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("posts")
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username])

  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/profile/${username}`)
      if (!response.ok) {
        throw new Error("Perfil não encontrado")
      }
      
      const data = await response.json()
      setProfile(data.profile)
      setPosts(data.posts || [])
      setEvents(data.events || [])
      setCommunities(data.communities || [])
      setFriends(data.friends || [])
      setIsFollowing(data.is_following || false)
      setIsOwnProfile(currentUser?.id === data.profile?.id)
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ following_id: profile.id }),
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setProfile(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            followers: isFollowing ? (prev.stats?.followers || 0) - 1 : (prev.stats?.followers || 0) + 1,
            posts: prev.stats?.posts || 0,
            following: prev.stats?.following || 0,
            friends: prev.stats?.friends || 0,
            events: prev.stats?.events || 0,
            communities: prev.stats?.communities || 0,
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
    return <SimpleProfileFix username={username} />
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

  const getGenderIcon = (gender?: string) => {
    switch (gender) {
      case 'male': return 'lucide:mars'
      case 'female': return 'lucide:venus'
      case 'couple': return 'lucide:heart'
      default: return 'lucide:user'
    }
  }

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'male': return 'Homem'
      case 'female': return 'Mulher'
      case 'couple': return 'Casal'
      default: return 'Não informado'
    }
  }

  const getPremiumBadge = (premiumType?: string) => {
    switch (premiumType) {
      case 'diamante':
        return (
          <Badge color="secondary" variant="flat" size="sm">
            <Icon icon="lucide:diamond" className="w-3 h-3" />
            <span className="ml-1">Diamante</span>
          </Badge>
        )
      case 'premium':
        return (
          <Badge color="warning" variant="flat" size="sm">
            <Icon icon="lucide:crown" className="w-3 h-3" />
            <span className="ml-1">Premium</span>
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        <Card className="overflow-visible">
          <CardBody className="p-0">
            {/* Cover Image */}
            <div className="relative h-40 sm:h-56 md:h-72">
              <Image
                removeWrapper
                alt="Profile cover"
                className="object-cover w-full h-full"
                src={profile.cover_url || "https://images.unsplash.com/photo-1519681393784-d120c3b35b5e?w=1200&h=400&fit=crop"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              
              {/* Premium Badge no Canto */}
              {profile.is_premium && (
                <div className="absolute top-4 right-4">
                  {getPremiumBadge(profile.premium_type)}
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="px-3 sm:px-4 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex items-end">
                  <Avatar
                    isBordered
                    color="primary"
                    size="lg"
                    src={profile.avatar_url || "https://img.heroui.chat/image/avatar?w=200&h=200&u=1"}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 -mt-8 sm:-mt-10 md:-mt-12 z-10"
                  />
                  <div className="ml-3 sm:ml-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold">{profile.name}</h1>
                      {profile.is_verified && (
                        <Badge color="success" variant="flat" size="sm">
                          <Icon icon="lucide:check" className="w-3 h-3" />
                          <span className="ml-1 hidden sm:inline">Verificado</span>
                        </Badge>
                      )}
                      {profile.is_premium && getPremiumBadge(profile.premium_type)}
                    </div>
                    <div className="flex items-center gap-2 text-small text-default-500">
                      <span>@{profile.username}</span>
                      {profile.gender && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Icon icon={getGenderIcon(profile.gender)} className="w-3 h-3" />
                            <span>{getGenderLabel(profile.gender)}</span>
                          </div>
                        </>
                      )}
                    </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 sm:mt-4 text-small text-default-500">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:map-pin" className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{profile.location}</span>
                  </div>
                )}
                {profile.birth_date && (
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:cake" className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{getAge(profile.birth_date)} anos</span>
                  </div>
                )}
                {profile.relationship_status && (
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:heart" className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{profile.relationship_status}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Icon icon="lucide:calendar-days" className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Entrou em {formatDate(profile.created_at)}</span>
                </div>
              </div>
              
              <Divider className="my-3 sm:my-4" />
              
              {/* Stats */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
                <div>
                  <p className="font-semibold text-sm sm:text-base">
                    {profile.stats?.posts?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-default-500">Posts</p>
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">
                    {profile.stats?.followers?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-default-500">Seguidores</p>
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">
                    {profile.stats?.following?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-default-500">Seguindo</p>
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">
                    {profile.stats?.friends?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-default-500">Amigos</p>
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">
                    {profile.stats?.events?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-default-500">Eventos</p>
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">
                    {profile.stats?.communities?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-default-500">Comunidades</p>
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
          <Tab key="posts" title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:file-text" className="w-4 h-4" />
              <span>Posts</span>
            </div>
          }>
            <Card>
              <CardBody>
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="border-b border-default-200 pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <Avatar
                            size="sm"
                            src={profile.avatar_url}
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{profile.name}</span>
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
                              <span>{post.likes_count} curtidas</span>
                              <span>{post.comments_count} comentários</span>
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
          
          <Tab key="events" title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:calendar" className="w-4 h-4" />
              <span>Eventos</span>
            </div>
          }>
            <Card>
              <CardBody>
                {events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((event) => (
                      <Card key={event.id} className="shadow-sm">
                        <CardBody className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-primary-100 p-2 rounded-lg">
                              <Icon icon="lucide:calendar-days" className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{event.title}</h4>
                              <p className="text-xs text-default-500 mt-1">{event.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-default-400">
                                <Icon icon="lucide:clock" className="w-3 h-3" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon icon="lucide:calendar" className="w-12 h-12 mx-auto text-default-400 mb-4" />
                    <p className="text-default-500">Nenhum evento ainda</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Tab>
          
          <Tab key="communities" title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:users" className="w-4 h-4" />
              <span>Comunidades</span>
            </div>
          }>
            <Card>
              <CardBody>
                {communities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {communities.map((community) => (
                      <Card key={community.id} className="shadow-sm">
                        <CardBody className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar
                              size="sm"
                              src={community.avatar}
                              className="flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{community.name}</h4>
                              <p className="text-xs text-default-500 mt-1">{community.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-default-400">
                                <Icon icon="lucide:users" className="w-3 h-3" />
                                <span>{community.members_count} membros</span>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon icon="lucide:users" className="w-12 h-12 mx-auto text-default-400 mb-4" />
                    <p className="text-default-500">Nenhuma comunidade ainda</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Tab>
          
          <Tab key="friends" title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:user-heart" className="w-4 h-4" />
              <span>Amigos</span>
            </div>
          }>
            <Card>
              <CardBody>
                {friends.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                      <Card key={friend.id} className="shadow-sm">
                        <CardBody className="p-4">
                          <div className="flex flex-col items-center text-center">
                            <Avatar
                              size="md"
                              src={friend.avatar_url}
                              className="mb-3"
                            />
                            <h4 className="font-semibold text-sm mb-1">{friend.name}</h4>
                            <p className="text-xs text-default-500">@{friend.username}</p>
                            <Button
                              size="sm"
                              variant="bordered"
                              className="mt-3"
                              onPress={() => router.push(`/profile/${friend.username}`)}
                            >
                              Ver perfil
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon icon="lucide:user-heart" className="w-12 h-12 mx-auto text-default-400 mb-4" />
                    <p className="text-default-500">Nenhum amigo ainda</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Tab>
          
          <Tab key="media" title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:image" className="w-4 h-4" />
              <span>Mídia</span>
            </div>
          }>
            <Card>
              <CardBody>
                <div className="text-center py-8">
                  <Icon icon="lucide:image" className="w-12 h-12 mx-auto text-default-400 mb-4" />
                  <p className="text-default-500">Nenhuma mídia ainda</p>
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}