"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from "@/components/ui/card"
import { ImageCropper } from './image-cropper'
import { Camera, Upload, Edit3, X, RotateCcw, Image as ImageIcon } from 'lucide-react'

interface EnhancedImageUploadProps {
  value?: string
  onChange: (imageUrl: string | null) => void
  label?: string
  aspectRatio?: number
  circularCrop?: boolean
  maxSizeMB?: number
  placeholder?: string
  className?: string
}

export const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({
  value,
  onChange,
  label,
  aspectRatio = 1,
  circularCrop = false,
  maxSizeMB = 5,
  placeholder,
  className = ""
}) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.')
      return
    }

    // Validar tamanho
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`A imagem deve ter no máximo ${maxSizeMB}MB.`)
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setOriginalImage(imageUrl)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleCropComplete = (croppedImage: string) => {
    onChange(croppedImage)
    setShowCropper(false)
    setOriginalImage(null)
  }

  const handleEdit = () => {
    if (value) {
      setOriginalImage(value)
      setShowCropper(true)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const renderPreview = () => {
    if (!value) return null

    return (
      <div className="relative group">
        <div className={`relative overflow-hidden ${circularCrop ? 'rounded-full' : 'rounded-lg'} ${aspectRatio === 1 ? 'w-24 h-24' : aspectRatio > 1 ? 'w-32 h-20' : 'w-20 h-32'} border-2 border-gray-200`}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          
          {/* Overlay com botões */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={handleEdit}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderUploadArea = () => {
    return (
      <Card 
        className={`border-2 border-dashed transition-all cursor-pointer ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${className}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className={`p-3 rounded-full bg-gray-100 mb-3 ${dragOver ? 'bg-blue-100' : ''}`}>
            {dragOver ? (
              <Upload className="w-6 h-6 text-blue-500" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {dragOver ? 'Solte a imagem aqui' : 'Clique para escolher uma imagem'}
            </p>
            <p className="text-xs text-gray-500">
              {placeholder || `JPG, PNG ou GIF até ${maxSizeMB}MB`}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium text-gray-900">{label}</label>
      )}
      
      <div className="flex items-center gap-4">
        {value ? renderPreview() : renderUploadArea()}
        
        {value && (
          <div className="flex-1 space-y-2">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Trocar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
                Remover
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Modal do cropper */}
      {showCropper && originalImage && (
        <ImageCropper
          isOpen={showCropper}
          onClose={() => {
            setShowCropper(false)
            setOriginalImage(null)
          }}
          imageSrc={originalImage}
          onCropComplete={handleCropComplete}
          aspectRatio={aspectRatio}
          circularCrop={circularCrop}
        />
      )}
    </div>
  )
}