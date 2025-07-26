import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PlanValidator } from '@/lib/plans/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validator = new PlanValidator()
    const usage = await validator.getPlanUsage(user.id)

    return NextResponse.json({
      success: true,
      data: {
        videosThisMonth: usage.videosThisMonth,
        eventsCreatedThisMonth: usage.eventsThisMonth,
        communitiesJoined: usage.communitiesJoined,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      }
    })
  } catch (error) {
    console.error('Error fetching monthly usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}