'use client'

import { useState, useEffect } from 'react'
import { UserPlus, UserCheck, UserX, Users, Clock } from 'lucide-react'
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react'
import { cn } from '@/lib/utils'
import FollowButton from './FollowButton'

interface FriendshipStatus {
  isFriend: boolean
  isFollowing: boolean
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted'
  followersCount: number
  mutualFollow: boolean
}

interface FriendshipButtonProps {
  userId: string
  initialStatus?: Partial<FriendshipStatus>
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showFollowButton?: boolean
  className?: string
  onStatusChange?: (status: FriendshipStatus) => void
}

export default function FriendshipButton({
  userId,
  initialStatus = {},
  size = 'md',
  showFollowButton = true,
  className,
  onStatusChange
}: FriendshipButtonProps) {
  const [status, setStatus] = useState<FriendshipStatus>({
    isFriend: false,
    isFollowing: false,
    friendshipStatus: 'none',
    followersCount: 0,
    mutualFollow: false,
    ...initialStatus
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch current relationship status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [friendshipRes, followRes] = await Promise.all([
          fetch(`/api/friends/${userId}`),
          fetch(`/api/users/${userId}/follow`)
        ])

        if (friendshipRes.ok) {
          const friendshipData = await friendshipRes.json()
          setStatus(prev => ({
            ...prev,
            isFriend: friendshipData.data?.isFriend || false,
            friendshipStatus: friendshipData.data?.status || 'none'
          }))
        }

        if (followRes.ok) {
          const followData = await followRes.json()
          setStatus(prev => ({
            ...prev,
            isFollowing: followData.data?.isFollowing || false,
            followersCount: followData.data?.followersCount || 0,
            mutualFollow: followData.data?.mutualFollow || false
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar status de relacionamento:', error)
      }
    }

    fetchStatus()
  }, [userId])

  const handleFriendRequest = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
      })

      if (response.ok) {
        const newStatus = {
          ...status,
          friendshipStatus: 'pending_sent' as const
        }
        setStatus(newStatus)
        onStatusChange?.(newStatus)
      } else {
        const error = await response.json()
        console.error('Erro ao enviar solicitação:', error.error)
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação de amizade:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFriendResponse = async (accept: boolean) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          request_id: userId, // Em uma implementação real, seria o ID da solicitação
          accept 
        })
      })

      if (response.ok) {
        const newStatus = {
          ...status,
          isFriend: accept,
          friendshipStatus: accept ? 'accepted' as const : 'none' as const,
          isFollowing: accept ? true : status.isFollowing
        }
        setStatus(newStatus)
        onStatusChange?.(newStatus)
      }
    } catch (error) {
      console.error('Erro ao responder solicitação:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnfriend = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/friends/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const newStatus = {
          ...status,
          isFriend: false,
          friendshipStatus: 'none' as const
        }
        setStatus(newStatus)
        onStatusChange?.(newStatus)
      }
    } catch (error) {
      console.error('Erro ao desfazer amizade:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowChange = (isFollowing: boolean, followersCount: number) => {
    const newStatus = {
      ...status,
      isFollowing,
      followersCount
    }
    setStatus(newStatus)
    onStatusChange?.(newStatus)
  }

  const getFriendshipButton = () => {
    switch (status.friendshipStatus) {
      case 'none':
        return (
          <Button
            size={size}
            color="primary"
            variant="bordered"
            startContent={<UserPlus className="w-4 h-4" />}
            onPress={handleFriendRequest}
            isLoading={isLoading}
            className={cn(className)}
          >
            Adicionar amigo
          </Button>
        )
      
      case 'pending_sent':
        return (
          <Button
            size={size}
            color="default"
            variant="bordered"
            startContent={<Clock className="w-4 h-4" />}
            isDisabled
            className={cn('opacity-60', className)}
          >
            Solicitação enviada
          </Button>
        )
      
      case 'pending_received':
        return (
          <div className="flex gap-2">
            <Button
              size={size}
              color="success"
              variant="solid"
              startContent={<UserCheck className="w-4 h-4" />}
              onPress={() => handleFriendResponse(true)}
              isLoading={isLoading}
            >
              Aceitar
            </Button>
            <Button
              size={size}
              color="danger"
              variant="bordered"
              startContent={<UserX className="w-4 h-4" />}
              onPress={() => handleFriendResponse(false)}
              isLoading={isLoading}
            >
              Recusar
            </Button>
          </div>
        )
      
      case 'accepted':
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button
                size={size}
                color="success"
                variant="solid"
                startContent={<Users className="w-4 h-4" />}
                className={cn(className)}
              >
                Amigos
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="unfriend"
                color="danger"
                startContent={<UserX className="w-4 h-4" />}
                onPress={handleUnfriend}
              >
                Desfazer amizade
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="flex items-center gap-2">
      {getFriendshipButton()}
      
      {showFollowButton && !status.isFriend && (
        <FollowButton
          userId={userId}
          initialFollowing={status.isFollowing}
          initialFollowersCount={status.followersCount}
          size={size}
          variant="bordered"
          onFollowChange={handleFollowChange}
        />
      )}
      
      {status.mutualFollow && status.friendshipStatus === 'none' && (
        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          Vocês se seguem mutuamente
        </div>
      )}
    </div>
  )
}