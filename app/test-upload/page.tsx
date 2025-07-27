"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function TestUploadPage() {
  const [images, setImages] = useState<File[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast.error("Por favor, selecione apenas arquivos de imagem")
      return
    }

    setImages(prev => [...prev, ...imageFiles])
    toast.success(`${imageFiles.length} imagem(s) adicionada(s)!`)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const testObjectURL = (file: File) => {
    const url = URL.createObjectURL(file)
    console.log('URL criada:', url)
    return url
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Teste de Upload de Imagens</h1>
        
        {/* Upload básico */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Simples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
            />
            
            <div>
              <strong>Total de imagens:</strong> {images.length}
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={`${image.name}-${index}`} className="space-y-2">
                    <div className="relative aspect-square border rounded-lg overflow-hidden">
                      <img
                        src={testObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log(`Imagem ${index + 1} carregada`)}
                        onError={() => console.error(`Erro na imagem ${index + 1}`)}
                      />
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Nome:</strong> {image.name}</div>
                      <div><strong>Tamanho:</strong> {(image.size / (1024 * 1024)).toFixed(2)}MB</div>
                      <div><strong>Tipo:</strong> {image.type}</div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeImage(index)}
                        className="w-full"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>URL.createObjectURL disponível:</strong> {typeof URL.createObjectURL}</div>
              <div><strong>FileReader disponível:</strong> {typeof FileReader}</div>
              <div><strong>Navigator disponível:</strong> {typeof navigator}</div>
              <div><strong>User Agent:</strong> {navigator?.userAgent || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
