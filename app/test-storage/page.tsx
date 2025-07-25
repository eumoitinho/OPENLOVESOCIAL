"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function TestStoragePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione apenas arquivos de imagem")
        return
      }
      setSelectedFile(file)
      setUploadUrl(null)
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const testUpload = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo primeiro")
      return
    }

    setLoading(true)
    try {
      // Converter para base64
      const base64 = await convertToBase64(selectedFile)
      
      console.log("Arquivo selecionado:", selectedFile.name)
      console.log("Tamanho:", selectedFile.size, "bytes")
      console.log("Tipo:", selectedFile.type)
      console.log("Base64 (primeiros 100 chars):", base64.substring(0, 100))

      // Simular dados de teste para o registro
      const testData = {
        firstName: "Teste",
        lastName: "Usuario",
        username: `test_${Date.now()}`,
        email: `test_${Date.now()}@test.com`,
        password: "123456789",
        confirmPassword: "123456789",
        birthDate: "1990-01-01",
        profileType: "single_m",
        seeking: [],
        interests: ["Teste"],
        otherInterest: null,
        bio: "Usuário de teste",
        city: "São Paulo",
        uf: "SP",
        latitude: null,
        longitude: null,
        plan: "free",
        partner: null,
        avatar_url: base64,
        cover_url: null
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer upload')
      }

      console.log("Resposta do servidor:", result)
      toast.success("Upload realizado com sucesso!")
      
      // O avatar_url deveria estar nos logs da API ou retornado na resposta
      
    } catch (error) {
      console.error("Erro no teste:", error)
      toast.error(`Erro: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const testBuckets = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-buckets', {
        method: 'GET',
      })

      const result = await response.json()
      console.log("Buckets:", result)
      
      if (response.ok) {
        toast.success("Buckets verificados com sucesso!")
      } else {
        toast.error("Erro ao verificar buckets")
      }
      
    } catch (error) {
      console.error("Erro ao testar buckets:", error)
      toast.error("Erro ao testar buckets")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Teste de Storage do Supabase</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Teste de Upload de Avatar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
            
            {selectedFile && (
              <div className="space-y-2">
                <div><strong>Arquivo:</strong> {selectedFile.name}</div>
                <div><strong>Tamanho:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                <div><strong>Tipo:</strong> {selectedFile.type}</div>
                
                <div className="flex items-center gap-4">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={testUpload} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Testando..." : "Testar Upload"}
                    </Button>
                    
                    <Button 
                      onClick={testBuckets} 
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                    >
                      Verificar Buckets
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {uploadUrl && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div><strong>Upload bem-sucedido!</strong></div>
                <div className="text-sm break-all mt-2">
                  <strong>URL:</strong> {uploadUrl}
                </div>
                <img 
                  src={uploadUrl} 
                  alt="Uploaded" 
                  className="mt-2 w-32 h-32 object-cover rounded border"
                  onLoad={() => console.log("Imagem carregada do storage")}
                  onError={() => console.error("Erro ao carregar imagem do storage")}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p>1. Selecione uma imagem para testar</p>
              <p>2. Clique em "Testar Upload" para simular um cadastro</p>
              <p>3. Verifique o console do navegador para logs detalhados</p>
              <p>4. Verifique o console do servidor para logs da API</p>
              <p>5. Use "Verificar Buckets" para testar a conexão com o storage</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}