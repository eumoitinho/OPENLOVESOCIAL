"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Calendar, MapPin, Globe, Camera, Upload } from "lucide-react"
import SignOut from "../components/auth/SignOut"
import MediaUpload from "../components/media/MediaUpload"
import MediaGallery from "../components/media/MediaGallery"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Database } from "../lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Media = Database["public"]["Tables"]["media"]["Row"]

interface ProfileContentProps {
  user: SupabaseUser
  profile: Profile | null
  initialMedia: Media[]
}

const ProfileContent: React.FC<ProfileContentProps> = ({ user, profile, initialMedia }) => {
  const [media, setMedia] = useState<Media[]>(initialMedia)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleUploadSuccess = (newMedia: any) => {
    setMedia((prev) => [newMedia, ...prev])
    setUploadSuccess("Mídia enviada com sucesso!")
    setUploadError(null)
    setTimeout(() => setUploadSuccess(null), 3000)

    // Se for foto de perfil, recarregar a página para atualizar o header
    if (newMedia.isProfilePicture) {
      router.refresh()
    }
  }

  const handleUploadError = (error: string) => {
    setUploadError(error)
    setUploadSuccess(null)
  }

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/upload?id=${mediaId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Erro ao deletar mídia")
      }

      setMedia((prev) => prev.filter((item) => item.id !== mediaId))
      setUploadSuccess("Mídia removida com sucesso!")
      setTimeout(() => setUploadSuccess(null), 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar mídia"
      setUploadError(errorMessage)
    }
  }

  const handleSetProfilePicture = async (mediaId: string) => {
    try {
      const response = await fetch("/api/profile/picture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mediaId }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Erro ao definir foto de perfil")
      }

      // Atualizar estado local
      setMedia((prev) =>
        prev.map((item) => ({
          ...item,
          is_profile_picture: item.id === mediaId,
        })),
      )

      setUploadSuccess("Foto de perfil atualizada!")
      setTimeout(() => setUploadSuccess(null), 3000)

      // Recarregar página para atualizar header
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao definir foto de perfil"
      setUploadError(errorMessage)
    }
  }

  const profilePicture = media.find((item) => item.is_profile_picture)
  const otherMedia = media.filter((item) => !item.is_profile_picture)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                ConnectHub
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/communities"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Comunidades
              </Link>
              <SignOut />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Mensagens de feedback */}
          {uploadSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {uploadSuccess}
            </div>
          )}
          {uploadError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{uploadError}</div>
          )}

          {/* Profile Header */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 relative">
                    {profilePicture ? (
                      <img
                        className="h-20 w-20 rounded-full object-cover"
                        src={profilePicture.url || "/placeholder.svg"}
                        alt={profile?.full_name || "Foto de perfil"}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-10 w-10 text-blue-600" />
                      </div>
                    )}
                    <button
                      onClick={() => setShowUpload(!showUpload)}
                      className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                      title="Alterar foto de perfil"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="ml-6">
                    <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name || user.email}</h1>
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
                    Nome completo
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile?.full_name || "Não informado"}
                  </dd>
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
                {profile?.website && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        {profile.website}
                      </a>
                    </dd>
                  </div>
                )}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Membro desde
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(profile?.created_at || user.created_at).toLocaleDateString("pt-BR")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Upload Section */}
          {showUpload && (
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Upload de Mídia</h3>
                  <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                    ×
                  </button>
                </div>
                <MediaUpload
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  maxFiles={5} onUpload={function (files: File[]): Promise<void> {
                    throw new Error("Function not implemented.")
                  } }                />
              </div>
            </div>
          )}

          {/* Media Gallery */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Minha Mídia ({media.length} {media.length === 1 ? "arquivo" : "arquivos"})
                </h3>
                <button
                  onClick={() => setShowUpload(!showUpload)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </button>
              </div>
              <MediaGallery
                items={media.map((item) => ({
                  id: item.id,
                  url: item.url,
                  type: item.file_type,
                  size: item.file_size,
                  dimensions: { width: item.width ?? 0, height: item.height ?? 0 },
                  createdAt: item.created_at,
                  filename: item.filename,
                  originalName: item.original_name,
                  mimeType: item.mime_type,
                  isProfilePicture: item.is_profile_picture,
                  author: {
                    id: profile?.id || "",
                    name: profile?.full_name || user.email || "",
                    avatar: profilePicture?.url || "",
                  },
                  stats: {
                    likes: 0,
                    downloads: 0,
                    shares: 0,
                    views: 0,
                  },
                }))}
                onDelete={handleDeleteMedia}
                columns={4}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfileContent
