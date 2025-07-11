"use client"

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react'

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
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Configuração ICE para produção
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Adicione aqui seus TURN servers de produção:
    // Exemplo comercial: https://www.twilio.com/docs/stun-turn
    process.env.NEXT_PUBLIC_TURN_URL
      ? {
          urls: process.env.NEXT_PUBLIC_TURN_URL,
          username: process.env.NEXT_PUBLIC_TURN_USERNAME,
          credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
        }
      : undefined,
  ].filter(Boolean) as RTCIceServer[]

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers,
    })

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0])
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          to: remoteUser?.id,
          from: currentUserId,
        }))
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall()
      }
    }

    return pc
  }, [currentUserId, remoteUser?.id, iceServers])

  // Conectar ao servidor de sinalização
  const connectSignaling = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'wss://webrtc.openlove.com.br'
    const ws = new WebSocket(SIGNALING_URL)
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'register',
        userId: currentUserId,
      }))
    }

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'call-offer':
          handleIncomingCall(data)
          break
        case 'call-answer':
          handleCallAnswer(data)
          break
        case 'ice-candidate':
          handleIceCandidate(data)
          break
        case 'call-reject':
          handleCallReject()
          break
        case 'call-end':
          handleCallEnd()
          break
      }
    }

    ws.onerror = (error) => {
      console.error('Erro na conexão WebSocket:', error)
    }

    ws.onclose = () => {
      // Reconectar automaticamente em produção
      setTimeout(connectSignaling, 2000)
    }

    wsRef.current = ws
  }, [currentUserId])

  // Iniciar chamada
  const startCall = useCallback(async (userId: string, userName: string, type: 'audio' | 'video') => {
    try {
      connectSignaling()
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      })

      setLocalStream(stream)
      setRemoteUser({ id: userId, name: userName })
      setCallType(type)
      setIsOutgoingCall(true)

      const pc = createPeerConnection()
      peerConnection.current = pc

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      wsRef.current?.send(JSON.stringify({
        type: 'call-offer',
        offer,
        to: userId,
        from: currentUserId,
        callType: type,
      }))

    } catch (error) {
      console.error('Erro ao iniciar chamada:', error)
      alert('Erro ao acessar câmera/microfone. Verifique as permissões.')
    }
  }, [connectSignaling, createPeerConnection, currentUserId])

  // Responder chamada
  const answerCall = useCallback(async () => {
    if (!peerConnection.current || !callType) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      })

      setLocalStream(stream)
      setIsIncomingCall(false)
      setIsCallActive(true)

      stream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, stream)
      })

      const answer = await peerConnection.current.createAnswer()
      await peerConnection.current.setLocalDescription(answer)

      wsRef.current?.send(JSON.stringify({
        type: 'call-answer',
        answer,
        to: remoteUser?.id,
        from: currentUserId,
      }))

    } catch (error) {
      console.error('Erro ao responder chamada:', error)
      alert('Erro ao acessar câmera/microfone. Verifique as permissões.')
    }
  }, [callType, currentUserId, remoteUser?.id])

  // Finalizar chamada
  const endCall = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close()
      peerConnection.current = null
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'call-end',
        to: remoteUser?.id,
        from: currentUserId,
      }))
    }

    setRemoteStream(null)
    setIsCallActive(false)
    setIsIncomingCall(false)
    setIsOutgoingCall(false)
    setCallType(null)
    setRemoteUser(null)
    setIsMuted(false)
    setIsVideoEnabled(true)
  }, [localStream, currentUserId, remoteUser?.id])

  // Rejeitar chamada
  const rejectCall = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'call-reject',
        to: remoteUser?.id,
        from: currentUserId,
      }))
    }

    setIsIncomingCall(false)
    setCallType(null)
    setRemoteUser(null)
  }, [currentUserId, remoteUser?.id])

  // Handlers para mensagens do servidor
  const handleIncomingCall = useCallback((data: any) => {
    setRemoteUser({ id: data.from, name: data.userName || 'Usuário' })
    setCallType(data.callType)
    setIsIncomingCall(true)

    const pc = createPeerConnection()
    peerConnection.current = pc

    pc.setRemoteDescription(new RTCSessionDescription(data.offer))
  }, [createPeerConnection])

  const handleCallAnswer = useCallback((data: any) => {
    if (peerConnection.current) {
      peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer))
      setIsOutgoingCall(false)
      setIsCallActive(true)
    }
  }, [])

  const handleIceCandidate = useCallback((data: any) => {
    if (peerConnection.current) {
      peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate))
    }
  }, [])

  const handleCallReject = useCallback(() => {
    setIsOutgoingCall(false)
    setCallType(null)
    setRemoteUser(null)
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
  }, [localStream])

  const handleCallEnd = useCallback(() => {
    endCall()
  }, [endCall])

  // Controles de áudio/vídeo
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }, [localStream])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }, [localStream])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      endCall()
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [endCall])

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