"use client"

import React, { createContext, useContext, useRef, useState, useCallback } from 'react'

interface WebRTCContextType {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isCallActive: boolean
  isIncomingCall: boolean
  isOutgoingCall: boolean
  callType: 'audio' | 'video' | null
  remoteUser: { id: string; name: string } | null
  startCall: (userId: string, userName: string, type: 'audio' | 'video') => Promise<void>
  answerCall: () => Promise<void>
  endCall: () => void
  rejectCall: () => void
  toggleMute: () => void
  toggleVideo: () => void
  isMuted: boolean
  isVideoEnabled: boolean
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined)

export const useWebRTC = () => {
  const context = useContext(WebRTCContext)
  if (!context) {
    throw new Error('useWebRTC deve ser usado dentro de um WebRTCProvider')
  }
  return context
}

interface WebRTCProviderProps {
  children: React.ReactNode
  currentUserId: string
}

export const WebRTCProvider: React.FC<WebRTCProviderProps> = ({ children, currentUserId }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isIncomingCall, setIsIncomingCall] = useState(false)
  const [isOutgoingCall, setIsOutgoingCall] = useState(false)
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null)
  const [remoteUser, setRemoteUser] = useState<{ id: string; name: string } | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  const peerConnection = useRef<RTCPeerConnection | null>(null)

  // Configuração ICE simplificada
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers,
    })

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0])
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall()
      }
    }

    return pc
  }, [])

  // Iniciar chamada (simulado para demonstração)
  const startCall = useCallback(async (userId: string, userName: string, type: 'audio' | 'video') => {
    try {
      // Simular acesso à mídia
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      })

      setLocalStream(stream)
      setRemoteUser({ id: userId, name: userName })
      setCallType(type)
      setIsOutgoingCall(true)

      // Simular chamada ativa após 2 segundos
      setTimeout(() => {
        setIsOutgoingCall(false)
        setIsCallActive(true)
      }, 2000)

      console.log(`Iniciando chamada ${type} para ${userName}`)

    } catch (error) {
      console.error('Erro ao iniciar chamada:', error)
      alert('Erro ao acessar câmera/microfone. Verifique as permissões.')
    }
  }, [])

  // Responder chamada (simulado)
  const answerCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      })

      setLocalStream(stream)
      setIsIncomingCall(false)
      setIsCallActive(true)

      console.log('Chamada atendida')

    } catch (error) {
      console.error('Erro ao atender chamada:', error)
      alert('Erro ao acessar câmera/microfone. Verifique as permissões.')
    }
  }, [callType])

  // Encerrar chamada
  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop())
      setRemoteStream(null)
    }
    if (peerConnection.current) {
      peerConnection.current.close()
      peerConnection.current = null
    }

    setIsCallActive(false)
    setIsIncomingCall(false)
    setIsOutgoingCall(false)
    setCallType(null)
    setRemoteUser(null)
    setIsMuted(false)
    setIsVideoEnabled(true)

    console.log('Chamada encerrada')
  }, [localStream, remoteStream])

  // Rejeitar chamada
  const rejectCall = useCallback(() => {
    setIsIncomingCall(false)
    setCallType(null)
    setRemoteUser(null)
    console.log('Chamada rejeitada')
  }, [])

  // Alternar mudo
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }, [localStream])

  // Alternar vídeo
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }, [localStream])

  const value: WebRTCContextType = {
    localStream,
    remoteStream,
    isCallActive,
    isIncomingCall,
    isOutgoingCall,
    callType,
    remoteUser,
    startCall,
    answerCall,
    endCall,
    rejectCall,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoEnabled,
  }

  return (
    <WebRTCContext.Provider value={value}>
      {children}
    </WebRTCContext.Provider>
  )
} 