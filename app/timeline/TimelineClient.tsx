"use client"

import Timeline from "@/app/components/timeline/Timeline"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"

interface TimelineClientProps {
  user: User
  profile: Profile | null
  followerCount: number
  followingCount: number
}

export default function TimelineClient({ user, profile, followerCount, followingCount }: TimelineClientProps) {
  // The original client component was complex and seemed to be causing issues.
  // It has been replaced with a direct rendering of the main Timeline component.
  // The props (user, profile, etc.) are available here if the Timeline component
  // needs to be adapted to use real data instead of sample data.
  return <Timeline />
}

