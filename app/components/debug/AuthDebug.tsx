"use client"

import { useAuth } from "@/app/components/auth/AuthProvider"
import { useState } from "react"

export default function AuthDebug() {
  const { user, loading, session } = useAuth()
  const [isVisible, setIsVisible] = useState(false)

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className=""
      >
        
      </button>
      
      {isVisible && (
        <div className="bg-black text-white p-4 rounded mt-2 text-xs max-w-sm">
          <h3 className="font-bold mb-2">Auth Debug Info:</h3>
          <div className="space-y-1">
            <div>Loading: {loading ? "true" : "false"}</div>
            <div>User: {user ? user.id : "null"}</div>
            <div>Email: {user?.email || "null"}</div>
            <div>Email Confirmed: {user?.email_confirmed_at ? "true" : "false"}</div>
            <div>Session: {session ? "active" : "null"}</div>
            <div>URL: {typeof window !== "undefined" ? window.location.pathname : "server"}</div>
          </div>
        </div>
      )}
    </div>
  )
} 
