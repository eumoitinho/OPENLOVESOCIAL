"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle,  } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Camera,
  Edit,
  Settings,
  Upload,
  Grid3X3,
  List,
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
  Verified,
  X,
} from "lucide-react"

interface ProfileViewProps {
  profile: any
  setProfile: (profile: any) => void
}

export function ProfileView({ profile, setProfile }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [editedProfile, setEditedProfile] = useState(profile)

  // Remover mock de galeria
  // const galleryImages = [...]
  // Usar profile.galleryImages se existir, senão array vazio
  type GalleryImage = { id: string|number; url: string; caption: string; likes?: number; comments?: number }
  const galleryImages: GalleryImage[] = profile.galleryImages || []

  const handleSaveProfile = () => {
    setProfile(editedProfile)
    setIsEditing(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-2 sm:px-4">
      {/* Profile Header */}
      <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden mb-6">
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-40 sm:h-48 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          {/* Profile Info */}
          <div className="relative px-4 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 w-full">
                <div className="relative mx-auto sm:mx-0">
                  <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-white dark:border-gray-900 shadow-lg">
                    <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-3xl">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-2 right-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full w-8 h-8"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0 mt-4 sm:mt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                    {profile.isPremium && (
                      <div className="flex items-center gap-1">
                        <Verified className="w-5 h-5 text-pink-600" />
                        <Badge
                          variant="outline"
                          className="border-pink-600 text-pink-600 bg-pink-100 dark:bg-pink-900 dark:text-pink-300"
                        >
                          Premium
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{profile.bio}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Membro desde {new Date().getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-pink-300 dark:border-pink-700 text-pink-600 dark:text-pink-400 bg-transparent w-full sm:w-auto"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Editar Perfil</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={editedProfile.name}
                          onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editedProfile.bio}
                          onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Localização</Label>
                        <Input
                          id="location"
                          value={editedProfile.location}
                          onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveProfile} className="bg-pink-600 hover:bg-pink-700">
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="border-gray-300 dark:border-gray-600 bg-transparent w-full sm:w-auto">
                  <Settings className="w-4 h-4 mr-1" />
                  Configurações
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{profile.stats.posts}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{profile.followers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{profile.following}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Seguindo</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{profile.stats.likes}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Curtidas</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="gallery" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <TabsTrigger value="gallery">Galeria</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="about">Sobre</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-pink-100 dark:bg-pink-900 text-pink-600" : ""}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-pink-100 dark:bg-pink-900 text-pink-600" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="gallery" className="space-y-6">
          {/* Upload Section */}
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-pink-600" />
                Adicionar à Galeria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-pink-300 dark:border-pink-700 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Clique para adicionar fotos ou arraste aqui</p>
                <input type="file" multiple accept="image/*" className="hidden" />
              </div>
            </CardContent>
          </Card>

          {/* Gallery Grid */}
          <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-3" : "grid-cols-1"}`}>
            {galleryImages.map((image) => (
              <Card
                key={image.id}
                className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className="relative" onClick={() => setSelectedImage(image.url)}>
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.caption}
                    className={`w-full object-cover transition-transform group-hover:scale-105 ${
                      viewMode === "grid" ? "aspect-square" : "aspect-video"
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>

                {viewMode === "list" && (
                  <CardContent className="p-4">
                    <p className="text-gray-900 dark:text-white mb-2">{image.caption}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{image.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{image.comments}</span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Seus posts aparecerão aqui</p>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Seus eventos aparecerão aqui</p>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl">
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Interesses</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest: string) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Informações</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{profile.age} anos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0">
            <div className="relative">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Imagem ampliada"
                className="w-full h-auto rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 