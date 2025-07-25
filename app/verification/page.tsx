'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, Button, Progress, Avatar, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea } from '@heroui/react'
import { Shield, Camera, Clock, CheckCircle, XCircle, Upload, AlertTriangle, Info } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface VerificationRequest {
  id: string
  verification_code: string
  required_text: string
  day_of_week: string
  photo_url: string | null
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired'
  attempt_number: number
  created_at: string
  expires_at: string
  submitted_at: string | null
  reviewed_at: string | null
  rejection_reason: string | null
}

interface VerificationStatus {
  is_verified: boolean
  current_request: VerificationRequest | null
  total_attempts: number
  max_attempts: number
  restricted_actions: string[]
  can_request_verification: boolean
}

export default function VerificationPage() {
  const router = useRouter()
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [error, setError] = useState<string | null>(null)

  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchVerificationStatus()
  }, [])

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/verification/request')
      const data = await response.json()

      if (response.ok) {
        setStatus(data.data)
      } else {
        setError(data.error || 'Erro ao carregar status de verificação')
      }
    } catch (error) {
      console.error('Error fetching verification status:', error)
      setError('Erro ao conectar com servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRequest = async () => {
    try {
      setCreating(true)
      setError(null)

      const response = await fetch('/api/verification/request', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        await fetchVerificationStatus()
        onOpen()
      } else {
        setError(data.error || 'Erro ao criar solicitação')
      }
    } catch (error) {
      console.error('Error creating verification request:', error)
      setError('Erro ao criar solicitação')
    } finally {
      setCreating(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Apenas imagens JPEG, PNG ou WebP são aceitas')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo 10MB')
        return
      }

      setSelectedFile(file)
      setError(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadPhoto = async () => {
    if (!selectedFile || !status?.current_request) return

    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('request_id', status.current_request.id)
      formData.append('photo', selectedFile)

      const response = await fetch('/api/verification/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        await fetchVerificationStatus()
        setSelectedFile(null)
        setPreview(null)
        onClose()
      } else {
        setError(data.error || 'Erro ao enviar foto')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      setError('Erro ao enviar foto')
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (requestStatus: string) => {
    switch (requestStatus) {
      case 'pending': return 'warning'
      case 'submitted': return 'primary'
      case 'approved': return 'success'
      case 'rejected': return 'danger'
      case 'expired': return 'default'
      default: return 'default'
    }
  }

  const getStatusText = (requestStatus: string) => {
    switch (requestStatus) {
      case 'pending': return 'Aguardando foto'
      case 'submitted': return 'Em análise'
      case 'approved': return 'Aprovado'
      case 'rejected': return 'Rejeitado'
      case 'expired': return 'Expirado'
      default: return requestStatus
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expirado'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m restantes`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-12">
            <Progress size="sm" isIndeterminate className="max-w-md mx-auto" />
            <p className="mt-4 text-gray-600">Carregando status de verificação...</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (status?.is_verified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Perfil Verificado!</h1>
            <p className="text-gray-600 mb-6">
              Seu perfil foi verificado com sucesso. Agora você pode usar todas as funcionalidades da plataforma.
            </p>
            <Button color="primary" onPress={() => router.push('/profile')}>
              Ver Perfil
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Verificação de Perfil</h1>
        <p className="text-gray-600">
          Verifique seu perfil para acessar todas as funcionalidades da plataforma
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardBody>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Restrictions Info */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Restrições para perfis não verificados:</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Não é possível comentar em posts</li>
                <li>• Não é possível enviar mensagens</li>
                <li>• Não é possível postar fotos ou vídeos</li>
                <li>• Apenas posts de texto são permitidos</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Current Request */}
      {status?.current_request ? (
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Solicitação Atual</h3>
                <Chip color={getStatusColor(status.current_request.status)} size="sm">
                  {getStatusText(status.current_request.status)}
                </Chip>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>Tentativa {status.current_request.attempt_number} de {status.max_attempts}</p>
                {status.current_request.status === 'pending' && (
                  <p className="text-orange-600 font-medium">
                    {getTimeRemaining(status.current_request.expires_at)}
                  </p>
                )}
              </div>
            </div>

            {status.current_request.status === 'pending' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Texto obrigatório:</h4>
                  <p className="font-mono text-lg bg-white p-3 rounded border">
                    {status.current_request.required_text}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Instruções:</h4>
                  <ol className="space-y-1 text-sm text-gray-700 pl-4">
                    <li>1. Escreva o texto acima em um papel ou cartão</li>
                    <li>2. Tire uma foto segurando o papel próximo ao seu rosto</li>
                    <li>3. Certifique-se de que tanto você quanto o texto estejam claramente visíveis</li>
                    <li>4. A foto deve ser nítida e bem iluminada</li>
                    <li>5. Faça upload da foto usando o botão abaixo</li>
                  </ol>
                </div>

                <Button 
                  color="primary" 
                  startContent={<Camera className="w-4 h-4" />}
                  onPress={onOpen}
                >
                  Enviar Foto
                </Button>
              </div>
            )}

            {status.current_request.status === 'submitted' && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Foto enviada com sucesso!</h4>
                <p className="text-gray-600">
                  Nossa equipe analisará sua foto em até 48 horas.
                </p>
                {status.current_request.submitted_at && (
                  <p className="text-sm text-gray-500 mt-2">
                    Enviado em: {formatDate(status.current_request.submitted_at)}
                  </p>
                )}
              </div>
            )}

            {status.current_request.status === 'rejected' && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Solicitação Rejeitada</h4>
                {status.current_request.rejection_reason && (
                  <p className="text-red-700 mb-4">{status.current_request.rejection_reason}</p>
                )}
                <p className="text-sm text-red-600">
                  Você pode tentar novamente com uma nova solicitação.
                </p>
              </div>
            )}

            {status.current_request.photo_url && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Foto enviada:</h4>
                <div className="relative w-32 h-32">
                  <Image
                    src={status.current_request.photo_url}
                    alt="Foto de verificação"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardBody className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verificar Perfil</h3>
            <p className="text-gray-600 mb-6">
              Para usar todas as funcionalidades, você precisa verificar seu perfil com uma foto.
            </p>
            
            {status?.can_request_verification ? (
              <Button 
                color="primary" 
                size="lg"
                isLoading={creating}
                onPress={handleCreateRequest}
              >
                Iniciar Verificação
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-red-600 mb-4">
                  Você atingiu o limite de {status?.max_attempts} tentativas de verificação.
                </p>
                <p className="text-sm text-gray-600">
                  Entre em contato com o suporte para assistência.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>Enviar Foto de Verificação</ModalHeader>
          <ModalBody>
            {status?.current_request && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Certifique-se de que sua foto inclui:</h4>
                  <p className="font-mono text-sm bg-white p-2 rounded border mb-3">
                    {status.current_request.required_text}
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>✓ Seu rosto claramente visível</li>
                    <li>✓ O texto escrito em papel</li>
                    <li>✓ Boa iluminação</li>
                    <li>✓ Imagem nítida</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />

                  {preview && (
                    <div className="relative w-full h-64">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onClose}>
              Cancelar
            </Button>
            <Button
              color="primary"
              isLoading={uploading}
              isDisabled={!selectedFile}
              onPress={handleUploadPhoto}
            >
              Enviar Foto
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Attempts Progress */}
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4">Tentativas de Verificação</h3>
          <div className="flex items-center gap-4">
            <Progress 
              value={(status?.total_attempts || 0) / (status?.max_attempts || 3) * 100}
              className="flex-1"
              color={status?.total_attempts === status?.max_attempts ? "danger" : "primary"}
            />
            <span className="text-sm text-gray-600">
              {status?.total_attempts || 0} / {status?.max_attempts || 3}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Cada usuário tem direito a {status?.max_attempts || 3} tentativas de verificação.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}