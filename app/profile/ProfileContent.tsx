"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Calendar, MapPin, Globe } from "lucide-react"
import SignOut from "../components/auth/SignOut"
import type { User as SupabaseUser } from "@supabase/supabase-js"

// Definir tipos baseados na tabela users
type Profile = {
  id: string
  email: string
  username: string
  name: string
  first_name?: string
  last_name?: string
  bio?: string
  avatar_url?: string
  location?: string
  birth_date?: string
  interests?: string[]
  created_at: string
  updated_at: string
}

interface ProfileContentProps {
  user: SupabaseUser
  profile: Profile | null
  initialMedia: any[]
}

const ProfileContent: React.FC<ProfileContentProps> = ({ user, profile, initialMedia }) => {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                OpenLove
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/home"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <SignOut />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Profile Header */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 relative">
                    {profile?.avatar_url ? (
                      <img
                        className="h-20 w-20 rounded-full object-cover"
                        src={profile.avatar_url}
                        alt={profile?.name || "Foto de perfil"}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-10 w-10 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="ml-6">
                    <h1 className="text-2xl font-bold text-gray-900">{profile?.name || user.email}</h1>
                    <p className="text-gray-600">@{profile?.username}</p>
                    {profile?.bio && <p className="text-gray-700 mt-2">{profile.bio}</p>}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Editar Perfil
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Informações do Perfil</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Nome de usuário
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">@{profile?.username}</dd>
                </div>
                {profile?.location && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Localização
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.location}</dd>
                  </div>
                )}
                {profile?.birth_date && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Data de nascimento
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(profile.birth_date).toLocaleDateString('pt-BR')}
                    </dd>
                  </div>
                )}
                {profile?.interests && profile.interests.length > 0 && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Interesses
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Mídia temporariamente desabilitada */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Galeria de Mídia</h3>
              <p className="text-gray-500">Funcionalidade de mídia será implementada em breve.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfileContent
