import ProfileDebug from '@/app/components/debug/ProfileDebug'

export default function DebugProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Debug: Problema de Perfil</h1>
        <ProfileDebug />
      </div>
    </div>
  )
} 