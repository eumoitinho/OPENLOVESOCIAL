import { useState, useEffect, useCallback } from 'react'

interface ForYouTimelineResponse {
  data: any[]
  hasMore: boolean
  page: number
  limit: number
  total: number
  algorithm: {
    totalCandidates: number
    rankedPosts: number
    diversifiedPosts: number
    finalPosts: number
  }
}

interface UseForYouTimelineOptions {
  initialPage?: number
  limit?: number
  autoFetch?: boolean
}

export function useForYouTimeline(options: UseForYouTimelineOptions = {}) {
  const {
    initialPage = 1,
    limit = 20,
    autoFetch = true
  } = options

  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(initialPage)
  const [algorithmStats, setAlgorithmStats] = useState<any>(null)
  const [initialized, setInitialized] = useState(false)

  const fetchPosts = useCallback(async (pageNumber: number = 1, append: boolean = false) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/timeline/for-you?page=${pageNumber}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ForYouTimelineResponse = await response.json()

      if (append) {
        setPosts(prev => [...prev, ...data.data])
      } else {
        setPosts(data.data)
      }

      setHasMore(data.hasMore)
      setPage(pageNumber)
      setAlgorithmStats(data.algorithm)

      console.log('📊 [For You Hook] Algorithm stats:', data.algorithm)
      console.log('🎯 [For You Hook] Posts loaded:', data.data.length)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('❌ [For You Hook] Error:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [limit])

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchPosts(page + 1, true)
    }
  }, [hasMore, loading, page, fetchPosts])

  const refresh = useCallback(() => {
    setPage(1)
    setPosts([])
    setHasMore(true)
    setError(null)
    setInitialized(false)
    fetchPosts(1, false)
  }, [fetchPosts])

  // Auto-fetch on mount
  useEffect(() => {
    console.log('🔍 [For You Hook] Effect conditions:', { autoFetch, initialized, loading })
    if (autoFetch && !initialized && !loading) {
      console.log('✅ [For You Hook] Starting fetchPosts')
      setInitialized(true)
      fetchPosts(1, false)
    }
  }, [autoFetch, initialized, loading, fetchPosts])

  return {
    posts,
    loading,
    error,
    hasMore,
    page,
    algorithmStats,
    loadMore,
    refresh,
    fetchPosts
  }
}