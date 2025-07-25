"use client"

import { useAuth } from '@/app/components/auth/AuthProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAvatarPage() {
  const { user, profile } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Usuário não logado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Teste de Avatares</h1>
        
        {/* Dados do usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>User ID:</strong> {user.id}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>User Metadata Full Name:</strong> {user.user_metadata?.full_name || 'N/A'}
            </div>
            <div>
              <strong>User Metadata Avatar URL:</strong> {user.user_metadata?.avatar_url || 'N/A'}
            </div>
          </CardContent>
        </Card>

        {/* Dados do profile */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile ? (
              <>
                <div>
                  <strong>Profile ID:</strong> {profile.id}
                </div>
                <div>
                  <strong>Full Name:</strong> {profile.full_name || 'N/A'}
                </div>
                <div>
                  <strong>Username:</strong> {profile.username || 'N/A'}
                </div>
                <div>
                  <strong>Avatar URL:</strong> {profile.avatar_url || 'N/A'}
                </div>
                <div>
                  <strong>Email:</strong> {profile.email || 'N/A'}
                </div>
              </>
            ) : (
              <p>Profile não carregado</p>
            )}
          </CardContent>
        </Card>

        {/* Teste de avatares */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Avatares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar usando user_metadata */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={user.user_metadata?.avatar_url || "/placeholder-user.jpg"} 
                  alt={user.user_metadata?.full_name || user.email} 
                />
                <AvatarFallback>
                  {user.user_metadata?.full_name 
                    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('')
                    : user.email?.charAt(0).toUpperCase()
                  }
                </AvatarFallback>
              </Avatar>
              <div>
                <strong>De user_metadata:</strong>
                <br />
                <small>URL: {user.user_metadata?.avatar_url || 'Nenhuma'}</small>
              </div>
            </div>

            {/* Avatar usando profile */}
            {profile && (
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={profile.avatar_url || "/placeholder-user.jpg"} 
                    alt={profile.full_name || profile.email} 
                  />
                  <AvatarFallback>
                    {profile.full_name 
                      ? profile.full_name.split(' ').map((n: string) => n[0]).join('')
                      : profile.email?.charAt(0).toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <strong>De profile:</strong>
                  <br />
                  <small>URL: {profile.avatar_url || 'Nenhuma'}</small>
                </div>
              </div>
            )}

            {/* Avatar híbrido (implementação atual) */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={profile?.avatar_url || user.user_metadata?.avatar_url || "/placeholder-user.jpg"} 
                  alt={profile?.full_name || user.user_metadata?.full_name || user.email} 
                />
                <AvatarFallback>
                  {(profile?.full_name || user.user_metadata?.full_name)
                    ? (profile?.full_name || user.user_metadata.full_name).split(' ').map((n: string) => n[0]).join('')
                    : user.email?.charAt(0).toUpperCase()
                  }
                </AvatarFallback>
              </Avatar>
              <div>
                <strong>Híbrido (implementação atual):</strong>
                <br />
                <small>URL: {profile?.avatar_url || user.user_metadata?.avatar_url || 'Nenhuma'}</small>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}