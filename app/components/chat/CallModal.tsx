"use client"

import React, { useEffect, useRef } from 'react'
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useWebRTC } from './WebRTCContext'

const CallModal: React.FC = () => {
  const {
    localStream,
    remoteStream,
    isCallActive,
    isIncomingCall,
    isOutgoingCall,
    callType,
    remoteUser,
    answerCall,
    endCall,
    rejectCall,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoEnabled,
  } = useWebRTC()

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  if (!isCallActive && !isIncomingCall && !isOutgoingCall) {
    return null
  }

  const isVideoCall = callType === 'video'

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">
            {isIncomingCall ? 'Chamada recebida' : isOutgoingCall ? 'Chamando...' : 'Chamada ativa'}
          </h3>
          {remoteUser && (
            <div className="flex items-center justify-center gap-3 mt-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={"/placeholder-user.jpg"} />
                <AvatarFallback>{remoteUser.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{remoteUser.name}</p>
                <p className="text-sm text-muted-foreground">
                  {isVideoCall ? 'Chamada de vídeo' : 'Chamada de voz'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Video Streams */}
        {isVideoCall && isCallActive && (
          <div className="relative mb-6">
            {/* Remote Video */}
            <div className="w-full h-64 bg-muted rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            {/* Local Video */}
            <div className="absolute top-2 right-2 w-24 h-16 bg-muted rounded overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Audio Call Interface */}
        {!isVideoCall && isCallActive && (
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Volume2 className="h-12 w-12 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Chamada de voz ativa</p>
          </div>
        )}

        {/* Incoming Call */}
        {isIncomingCall && (
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Chamada recebida</p>
          </div>
        )}

        {/* Outgoing Call */}
        {isOutgoingCall && (
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-12 w-12 text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Chamando...</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {isIncomingCall ? (
            <>
              <Button
                onClick={rejectCall}
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <Button
                onClick={answerCall}
                size="lg"
                className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700"
              >
                <Phone className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <>
              {isCallActive && (
                <>
                  <Button
                    onClick={toggleMute}
                    variant={isMuted ? "destructive" : "outline"}
                    size="lg"
                    className="rounded-full w-12 h-12"
                  >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  {isVideoCall && (
                    <Button
                      onClick={toggleVideo}
                      variant={!isVideoEnabled ? "destructive" : "outline"}
                      size="lg"
                      className="rounded-full w-12 h-12"
                    >
                      {!isVideoEnabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>
                  )}
                </>
              )}
              <Button
                onClick={endCall}
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CallModal 