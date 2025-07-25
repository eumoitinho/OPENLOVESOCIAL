import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PlanValidator } from '@/lib/plans/server'
import { PLAN_LIMITS } from '@/lib/plans/config'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user plan
    const { data: userData } = await supabase
      .from('users')
      .select('plan_type, plan_expires_at')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const validator = new PlanValidator()
    const usage = await validator.getPlanUsage(user.id)
    const limits = PLAN_LIMITS[userData.plan_type || 'free']

    return NextResponse.json({
      success: true,
      data: {
        plan: userData.plan_type || 'free',
        planExpiresAt: userData.plan_expires_at,
        usage: {
          videos: {
            used: usage.videos,
            limit: limits.maxVideosPerMonth,
            remaining: limits.maxVideosPerMonth === -1 ? -1 : Math.max(0, limits.maxVideosPerMonth - usage.videos)
          },
          events: {
            used: usage.events,
            limit: limits.maxEventsPerMonth,
            remaining: limits.maxEventsPerMonth === -1 ? -1 : Math.max(0, limits.maxEventsPerMonth - usage.events)
          },
          communities: {
            used: usage.communities,
            limit: limits.maxCommunities,
            remaining: limits.maxCommunities === -1 ? -1 : Math.max(0, limits.maxCommunities - usage.communities)
          }
        },
        limits: {
          maxImages: limits.maxImages,
          maxVideoSize: limits.maxVideoSize,
          canUploadAudio: limits.canUploadAudio,
          canCreatePolls: limits.canCreatePolls,
          canCreatePaidContent: limits.canCreatePaidContent,
          canSendMessages: limits.canSendMessages,
          canMakeVoiceCalls: limits.canMakeVoiceCalls,
          canMakeVideoCalls: limits.canMakeVideoCalls
        }
      }
    })
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}