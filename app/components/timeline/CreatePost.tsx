"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Globe, 
  Users, 
  ImageIcon, 
  Video, 
  BarChart3, 
  Send, 
  Mic, 
  Plus, 
  X, 
  Square, 
  Crown,
  Lock,
  type LucideIcon 
} from "lucide-react"
import { toast } from "sonner"
import Compressor from "compressorjs"
import { usePaywall } from '@/lib/plans/paywall'
import PaywallModal from '@/components/plan-limits/PaywallModal'
import { useCanAccess } from '@/lib/plans/hooks'
import PremiumLockBadge from '@/app/components/premium/PremiumLockBadge'

interface PostOption {
  id: string
  title: string
  icon: LucideIcon
  premium?: boolean
  description?: string
}

interface CreatePostProps {
  onPostCreated?: (post: any) => void
  currentUser?: any
  profile?: any
  loading?: boolean
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
}

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
}

const notificationVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: -10 },
  exit: { opacity: 0, y: -20 },
}

const lineVariants = {
  initial: { scaleX: 0, x: "-50%" },
  animate: {
    scaleX: 1,
    x: "0%",
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    scaleX: 0,
    x: "50%",
    transition: { duration: 0.2, ease: "easeIn" },
  },
}

const transition = { type: "spring", bounce: 0, duration: 0.4 }

export default function CreatePost(props: CreatePostProps) {
  const { onPostCreated, currentUser, profile, loading } = props
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState<"public" | "friends_only">("public")
  const [internalLoading, setInternalLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const [showPoll, setShowPoll] = useState(false)
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""])
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const allowedTypes = ["image/jpeg", "image/png", "video/mp4", "audio/mp3", "audio/wav", "audio/m4a"]
  const IMAGE_MAX_SIZE = 10 * 1024 * 1024
  const AUDIO_MAX_SIZE = 25 * 1024 * 1024
  const getMaxVideoSize = (plano: string) => (plano === "gold" ? 25 * 1024 * 1024 : 50 * 1024 * 1024)

  // Hooks para verificação de planos
  const { paywall, requireFeature, closePaywall } = usePaywall()
  const canAccess = useCanAccess()
  
  const userPlan = profile?.plano || "free"
  const isPremium = userPlan !== "free"

  const visibilityOptions = [
    { id: "public", title: "Público", icon: Globe },
    { id: "friends_only", title: "Amigos", icon: Users },
  ]

  const postOptions: PostOption[] = [
    { id: "image", title: "Imagem", icon: ImageIcon },
    { id: "video", title: "Vídeo", icon: Video },
    { 
      id: "audio", 
      title: "Áudio", 
      icon: Mic, 
      premium: true,
      description: "Gravar áudio (apenas assinantes)"
    },
    { 
      id: "enquete", 
      title: "Enquete", 
      icon: BarChart3, 
      premium: true,
      description: "Criar enquete (apenas assinantes)"
    },
  ]

  // Recording timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    if (isRecording) {
      intervalId = setInterval(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(intervalId)
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setRecordedBlob(blob)
        const file = new File([blob], `recording-${Date.now()}.wav`, { type: "audio/wav" })
        setAudio(file)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      toast.error("Erro ao acessar o microfone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const handleVisibilityClick = (optionId: "public" | "friends_only") => {
    setVisibility(optionId)
    setActiveNotification(optionId)
    setTimeout(() => setActiveNotification(null), 1500)
  }

  const handleOptionClick = (optionId: string) => {
    const option = postOptions.find(opt => opt.id === optionId)
    
    // Verificar se é uma funcionalidade premium
    if (option?.premium && !isPremium) {
      toast.error("Esta funcionalidade está disponível apenas para assinantes")
      return
    }

    if (optionId === "image") {
      document.getElementById("image-upload")?.click()
    } else if (optionId === "video") {
      document.getElementById("video-upload")?.click()
    } else if (optionId === "audio") {
      setShowAudioRecorder(!showAudioRecorder)
      if (!showAudioRecorder) {
        setSelectedOptions((prev) => [...prev, optionId])
      } else {
        setSelectedOptions((prev) => prev.filter((id) => id !== optionId))
        setAudio(null)
        setRecordedBlob(null)
      }
    } else if (optionId === "enquete") {
      setShowPoll(!showPoll)
      if (!showPoll) {
        setSelectedOptions((prev) => [...prev, optionId])
      } else {
        setSelectedOptions((prev) => prev.filter((id) => id !== optionId))
        setPollOptions(["", ""])
      }
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      )
    }
    setActiveNotification(optionId)
    setTimeout(() => setActiveNotification(null), 1500)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type))
    
    if (imageFiles.length === 0) {
      toast.error("Por favor, selecione apenas arquivos de imagem válidos (JPG, PNG, GIF, WEBP)")
      return
    }

    // Verificar tamanho dos arquivos
    for (const file of imageFiles) {
      if (file.size > IMAGE_MAX_SIZE) {
        toast.error(`Imagem "${file.name}" muito grande. Máximo 10MB por arquivo.`)
        return
      }
    }

    // Verificar limites do plano
    const maxImages = userPlan === "free" ? 1 : userPlan === "gold" ? 5 : 10
    
    if (images.length + imageFiles.length > maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitido para seu plano`)
      return
    }

    // Processar e adicionar imagens imediatamente
    setImages((prev) => [...prev, ...imageFiles])
    
    // Adicionar à lista de opções selecionadas
    setSelectedOptions((prev) => 
      prev.includes("image") ? prev : [...prev, "image"]
    )

    // Mostrar notificação de sucesso
    toast.success(`${imageFiles.length} imagem${imageFiles.length > 1 ? 's' : ''} adicionada${imageFiles.length > 1 ? 's' : ''}!`)
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!["video/mp4"].includes(file.type)) {
      toast.error("Tipo de vídeo não permitido. Apenas MP4.")
      return
    }

    // Verificar se pode fazer upload de vídeo
    if (!canAccess.canUploadVideos) {
      requireFeature('upload_video')
      return
    }
    
    const maxSize = canAccess.limits.maxVideoSize
    if (file.size > maxSize) {
      toast.error(`Vídeo muito grande. Máximo ${Math.round(maxSize / (1024 * 1024))}MB para seu plano`)
      return
    }

    // Para debug, vamos aceitar o vídeo diretamente
    setVideo(file)
    // Adicionar à lista de opções selecionadas
    setSelectedOptions((prev) => 
      prev.includes("video") ? prev : [...prev, "video"]
    )
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index)
      // Se não há mais imagens, remover da lista de opções selecionadas
      if (newImages.length === 0) {
        setSelectedOptions((prevOptions) => prevOptions.filter((id) => id !== "image"))
      }
      return newImages
    })
  }

  const removeVideo = () => {
    setVideo(null)
  }

  const removeAudio = () => {
    setAudio(null)
    setRecordedBlob(null)
    setShowAudioRecorder(false)
    setSelectedOptions((prev) => prev.filter((id) => id !== "audio"))
  }

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""])
    }
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index))
    }
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && images.length === 0 && !video && !audio && !showPoll) {
      toast.error("Por favor, escreva algo ou adicione mídia para postar")
      return
    }

    if (showPoll && pollOptions.filter((option) => option.trim()).length < 2) {
      toast.error("A enquete deve ter pelo menos 2 opções preenchidas")
      return
    }

    if (content.length > 2000) {
      toast.error("Post muito longo (máximo 2000 caracteres)")
      return
    }

    if (!currentUser) {
      toast.error("Você precisa estar logado para criar posts")
      return
    }

    setInternalLoading(true)
    try {
      const formData = new FormData()
      formData.append("content", content)
      formData.append("visibility", visibility)

      images.forEach((image) => {
        formData.append("images", image)
      })

      if (video) {
        formData.append("video", video)
      }

      if (audio) {
        formData.append("audio", audio)
      }

      if (showPoll) {
        formData.append("poll", JSON.stringify(pollOptions.filter((option) => option.trim())))
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || "Erro ao criar post")
        setInternalLoading(false)
        return
      }

      const result = await response.json()
      toast.success("Post criado com sucesso!")
      setContent("")
      setImages([])
      setVideo(null)
      setAudio(null)
      setSelectedOptions([])
      setShowPoll(false)
      setPollOptions(["", ""])
      setShowAudioRecorder(false)
      setRecordedBlob(null)
      if (onPostCreated) onPostCreated(result)
    } catch (error) {
      toast.error("Erro ao criar post. Tente novamente.")
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <div className="relative">
      <Card className="openlove-card border rounded-xl shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-3 sm:p-4">
          <form onSubmit={handlePostSubmit}>
            <div className="flex gap-2 sm:gap-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name || profile?.name} />
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs sm:text-sm">
                  {(profile?.full_name || profile?.name)?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3 min-w-0">
                <Textarea
                  placeholder="No que você está pensando?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[60px] sm:min-h-[80px] resize-none border-none p-0 focus-visible:ring-0 post-modal-textarea bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={2000}
                />

                {/* Audio Recorder Section */}
                <AnimatePresence>
                  {showAudioRecorder && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 p-3 sm:p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-800"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm sm:text-base">
                          <Mic className="w-4 h-4 text-pink-600" />
                          Gravar Áudio
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOptionClick("audio")}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <X size={14} />
                        </Button>
                      </div>

                      <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <button
                          type="button"
                          className={cn(
                            "group w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-300",
                            isRecording
                              ? "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25"
                              : "bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40",
                          )}
                          onClick={isRecording ? stopRecording : startRecording}
                        >
                          {isRecording ? (
                            <Square className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                          ) : (
                            <Mic className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                          )}
                        </button>

                        <span className="font-mono text-sm text-pink-600 dark:text-pink-400">
                          {formatTime(recordingTime)}
                        </span>

                        <div className="h-3 w-48 sm:w-64 flex items-center justify-center gap-0.5">
                          {[...Array(32)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-0.5 rounded-full transition-all duration-300",
                                isRecording
                                  ? "bg-gradient-to-t from-pink-500 to-purple-500 animate-pulse"
                                  : "bg-pink-200 dark:bg-pink-800 h-1",
                              )}
                              style={
                                isRecording
                                  ? {
                                      height: `${20 + Math.random() * 80}%`,
                                      animationDelay: `${i * 0.05}s`,
                                    }
                                  : undefined
                              }
                            />
                          ))}
                        </div>

                        <p className="text-xs text-pink-600 dark:text-pink-400 text-center">
                          {isRecording
                            ? "Gravando... Clique no quadrado para parar"
                            : "Clique no microfone para gravar"}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Poll Section */}
                <AnimatePresence>
                  {showPoll && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 p-3 sm:p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-800"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm sm:text-base">
                          <BarChart3 className="w-4 h-4 text-pink-600" />
                          Criar Enquete
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOptionClick("enquete")}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {pollOptions.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder={`Opção ${index + 1}`}
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                              className="flex-1 border-pink-200 dark:border-pink-800 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                              maxLength={100}
                            />
                            {pollOptions.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePollOption(index)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X size={14} />
                              </Button>
                            )}
                          </div>
                        ))}
                        {pollOptions.length < 4 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addPollOption}
                            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:text-pink-400 dark:hover:text-pink-300 dark:hover:bg-pink-900/20"
                          >
                            <Plus size={14} />
                            Adicionar opção
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Media Preview */}
                {(images.length > 0 || video || audio) && (
                  <div className="space-y-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <ImageIcon className="w-4 h-4" />
                      Mídia selecionada
                    </div>
                    
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {images.map((image, index) => (
                          <div key={`${image.name}-${index}`} className="relative aspect-square group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                              onLoad={(e) => {
                                // Garantir que a imagem foi carregada
                                console.log(`Imagem ${index + 1} carregada:`, image.name)
                              }}
                              onError={(e) => {
                                console.error(`Erro ao carregar imagem ${index + 1}:`, image.name)
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shadow-lg"
                                onClick={() => removeImage(index)}
                                title="Remover imagem"
                              >
                                <X size={14} />
                              </Button>
                            </div>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {(image.size / (1024 * 1024)).toFixed(1)}MB
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {video && (
                      <div className="relative">
                        <video
                          src={URL.createObjectURL(video)}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg"
                          controls
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={removeVideo}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    )}
                    {audio && (
                      <div className="relative p-3 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full">
                            <Mic size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{audio.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(audio.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                          <audio src={URL.createObjectURL(audio)} controls className="h-8" />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={removeAudio}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Visibility and Options Toolbar */}
                <div className="relative">
                  <AnimatePresence>
                    {activeNotification && (
                      <motion.div
                        variants={notificationVariants as any}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50"
                      >
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs whitespace-nowrap">
                          {[...visibilityOptions, ...postOptions].find((item) => item.id === activeNotification)?.title}{" "}
                          selecionado!
                        </div>
                        <motion.div
                          variants={lineVariants as any}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="absolute -bottom-1 left-1/2 w-full h-[2px] bg-gradient-to-r from-pink-500 to-purple-600 origin-left"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      {/* Visibility Options */}
                      {visibilityOptions.map((option) => (
                        <motion.button
                          key={option.id}
                          type="button"
                          variants={buttonVariants as any}
                          initial={false}
                          animate="animate"
                          custom={visibility === option.id}
                          onClick={() => handleVisibilityClick(option.id as "public" | "friends_only")}
                          transition={transition as any}
                          className={cn(
                            "relative flex items-center rounded-lg px-2 sm:px-3 py-1.5 sm:py-2",
                            "text-xs sm:text-sm font-medium transition-colors duration-300",
                            visibility === option.id
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              : "text-gray-500 dark:text-gray-400 hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-900/20 dark:hover:text-pink-400",
                          )}
                        >
                          <option.icon
                            size={14}
                            className={cn(visibility === option.id ? "text-pink-600 dark:text-pink-400" : "")}
                          />
                          <AnimatePresence initial={false}>
                            {visibility === option.id && (
                              <motion.span
                                variants={spanVariants as any}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={transition as any}
                                className="overflow-hidden text-pink-600 dark:text-pink-400 ml-1"
                              >
                                {option.title}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      ))}

                      {/* Post Options */}
                      {postOptions.map((option) => {
                        const isSelected = selectedOptions.includes(option.id) ||
                          (option.id === "image" && images.length > 0) ||
                          (option.id === "video" && video) ||
                          (option.id === "audio" && (audio || showAudioRecorder)) ||
                          (option.id === "enquete" && showPoll)
                        
                        const ButtonComponent = (
                          <motion.button
                            key={option.id}
                            type="button"
                            variants={buttonVariants as any}
                            initial={false}
                            animate="animate"
                            custom={isSelected}
                            onClick={() => handleOptionClick(option.id)}
                            transition={transition as any}
                            className={cn(
                              "relative flex items-center rounded-lg px-2 sm:px-3 py-1.5 sm:py-2",
                              "text-xs sm:text-sm font-medium transition-colors duration-300",
                              isSelected
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                : "text-gray-500 dark:text-gray-400 hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-900/20 dark:hover:text-pink-400",
                              !isPremium && option.premium && "opacity-50 cursor-not-allowed"
                            )}
                            title={option.premium && !isPremium ? "Funcionalidade disponível apenas para assinantes" : undefined}
                          >
                            <option.icon
                              size={14}
                              className={cn(
                                isSelected
                                  ? "text-pink-600 dark:text-pink-400"
                                  : "",
                              )}
                            />
                          <AnimatePresence initial={false}>
                            {(selectedOptions.includes(option.id) ||
                              (option.id === "image" && images.length > 0) ||
                              (option.id === "video" && video) ||
                              (option.id === "audio" && (audio || showAudioRecorder)) ||
                              (option.id === "enquete" && showPoll)) && (
                              <motion.span
                                variants={spanVariants as any}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={transition as any}
                                className="overflow-hidden text-pink-600 dark:text-pink-400 ml-1"
                              >
                                {option.title}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{content.length}/2000</span>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={
                          !!loading ||
                          internalLoading ||
                          (!content.trim() && images.length === 0 && !video && !audio && !showPoll)
                        }
                        className={cn(
                          "flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm",
                          "font-medium transition-all duration-200",
                          !loading &&
                            !internalLoading &&
                            (content.trim() || images.length > 0 || video || audio || showPoll)
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:shadow-pink-500/25 hover:from-pink-600 hover:to-purple-700"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed",
                        )}
                      >
                        <Send size={14} className="sm:w-4 sm:h-4" />
                        {!!loading || internalLoading ? "Postando..." : "Publicar"}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Hidden file inputs */}
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Paywall Modal */}
      {paywall.config && (
        <PaywallModal
          isOpen={paywall.isOpen}
          onClose={closePaywall}
          feature={paywall.config.feature}
          title={paywall.config.title}
          description={paywall.config.description}
          requiredPlan={paywall.config.requiredPlan}
        />
      )}
    </div>
  )
}
