import { useState, useEffect, useCallback } from "react"

export interface ProfileFilters {
  gender?: string
  relationshipType?: string
  minAge?: number
  maxAge?: number
  maxDistance?: number
  interests?: string[]
  location?: string
  verified?: boolean
  premium?: boolean
  search?: string
}

export interface ExploreProfile {
  id: string
  name: string
  username: string
  avatar: string | null
  bio: string
  location: string
  age: number | null
  gender: string
  relationshipType: string
  interests: string[]
  commonInterests: string[]
  compatibilityScore: number
  distance: number
  isVerified: boolean
  isPremium: boolean
  isOnline: boolean
  lastSeen: string | null
  memberSince: string
  stats: {
    followers: number
    following: number
    posts: number
    likes: number
  }
}

interface ExploreResponse {
  data: ExploreProfile[]
  hasMore: boolean
  page: number
  limit: number
  total: number
  filters: ProfileFilters
  stats: {
    totalFound: number
    afterAgeFilter: number
    afterDistanceFilter: number
    afterInterestsFilter: number
    onlineUsers: number
    verifiedUsers: number
    premiumUsers: number
    avgCompatibility: number
  }
}

interface UseProfileExploreOptions {
  initialFilters?: ProfileFilters
  limit?: number
  autoFetch?: boolean
}

export function useProfileExplore(options: UseProfileExploreOptions = {}) {
  const {
    initialFilters = {},
    limit = 20,
    autoFetch = true
  } = options

  const [profiles, setProfiles] = useState<ExploreProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ProfileFilters>(initialFilters)
  const [stats, setStats] = useState<any>(null)
  const [initialized, setInitialized] = useState(false)

  const buildQueryParams = useCallback((currentFilters: ProfileFilters, pageNumber: number) => {
    const params = new URLSearchParams()
    
    params.append('page', pageNumber.toString())
    params.append('limit', limit.toString())
    
    if (currentFilters.gender && currentFilters.gender !== 'all') {
      params.append('gender', currentFilters.gender)
    }
    
    if (currentFilters.relationshipType && currentFilters.relationshipType !== 'all') {
      params.append('relationshipType', currentFilters.relationshipType)
    }
    
    if (currentFilters.minAge) {
      params.append('minAge', currentFilters.minAge.toString())
    }
    
    if (currentFilters.maxAge) {
      params.append('maxAge', currentFilters.maxAge.toString())
    }
    
    if (currentFilters.maxDistance) {
      params.append('maxDistance', currentFilters.maxDistance.toString())
    }
    
    if (currentFilters.interests && currentFilters.interests.length > 0) {
      params.append('interests', currentFilters.interests.join(','))
    }
    
    if (currentFilters.location) {
      params.append('location', currentFilters.location)
    }
    
    if (currentFilters.verified) {
      params.append('verified', 'true')
    }
    
    if (currentFilters.premium) {
      params.append('premium', 'true')
    }
    
    if (currentFilters.search) {
      params.append('search', currentFilters.search)
    }
    
    return params.toString()
  }, [limit])

  const fetchProfiles = useCallback(async (
    currentFilters: ProfileFilters, 
    pageNumber: number = 1, 
    append: boolean = false
  ) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const queryParams = buildQueryParams(currentFilters, pageNumber)
      console.log('🔍 [Profile Explore] Fetching profiles with params:', queryParams)

      const response = await fetch(`/api/profiles/explore?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json' } })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ExploreResponse = await response.json()

      if (append) {
        setProfiles(prev => [...prev, ...data.data])
      } else {
        setProfiles(data.data)
      }

      setHasMore(data.hasMore)
      setPage(pageNumber)
      setStats(data.stats)

      console.log('✅ [Profile Explore] Profiles loaded:', data.data.length)
      console.log('📊 [Profile Explore] Stats:', data.stats)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('❌ [Profile Explore] Error:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [loading, buildQueryParams])

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchProfiles(filters, page + 1, true)
    }
  }, [hasMore, loading, page, filters, fetchProfiles])

  const applyFilters = useCallback((newFilters: ProfileFilters) => {
    console.log('🔧 [Profile Explore] Applying filters:', newFilters)
    setFilters(newFilters)
    setPage(1)
    setProfiles([])
    setHasMore(true)
    setError(null)
    fetchProfiles(newFilters, 1, false)
  }, [fetchProfiles])

  const refresh = useCallback(() => {
    console.log('🔄 [Profile Explore] Refreshing with current filters')
    setPage(1)
    setProfiles([])
    setHasMore(true)
    setError(null)
    fetchProfiles(filters, 1, false)
  }, [filters, fetchProfiles])

  const resetFilters = useCallback(() => {
    console.log('🔄 [Profile Explore] Resetting filters')
    const defaultFilters = {}
    setFilters(defaultFilters)
    setPage(1)
    setProfiles([])
    setHasMore(true)
    setError(null)
    fetchProfiles(defaultFilters, 1, false)
  }, [fetchProfiles])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && !initialized) {
      console.log('🚀 [Profile Explore] Initial fetch')
      setInitialized(true)
      fetchProfiles(filters, 1, false)
    }
  }, [autoFetch, initialized, filters, fetchProfiles])

  return {
    profiles,
    loading,
    error,
    hasMore,
    page,
    filters,
    stats,
    loadMore,
    applyFilters,
    refresh,
    resetFilters
  }
}
