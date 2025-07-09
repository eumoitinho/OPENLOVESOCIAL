"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Create a single supabase client for interacting with your database
export const supabase = createClientComponentClient<Database>()

// Function to create client-side Supabase client
export const createClientSupabaseClient = () => {
  return createClientComponentClient<Database>()
}
