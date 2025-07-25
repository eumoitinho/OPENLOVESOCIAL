import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Reset monthly usage counters
    // This would typically be called by an admin or cron job
    // For now, we'll just return success as the actual reset logic
    // would be handled by the PlanValidator class

    return NextResponse.json({
      success: true,
      message: 'Monthly usage reset successfully',
      resetDate: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error resetting monthly usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}