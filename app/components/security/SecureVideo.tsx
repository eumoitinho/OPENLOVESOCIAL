"use client"

import React, { useRef, useState } from "react"
import { WatermarkOverlay } from "./WatermarkOverlay"
import { cn } from "@/lib/utils"
import { Play, Pause } from "lucide-react"

interface SecureVideoProps {
  src: string
  poster?: string
  className?: string
  viewerUsername: string
  onClick?: () => void
  watermarkDensity?: number
  watermarkOpacity?: number
  controls?: boolean
}

export function SecureVideo({
  src,
  poster,
  className,
  viewerUsername,
  onClick,
  watermarkDensity = 5,
  watermarkOpacity = 0.15,
  controls = true
}: SecureVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVideoClick = () => {
    if (onClick) {
      onClick()
    } else {
      togglePlay()
    }
  }

  return (
    <div 
      className={cn("relative overflow-hidden cursor-pointer group", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video 
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onContextMenu={(e) => e.preventDefault()}
        style={{ userSelect: "none" }}
        muted
        loop
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
      />
      
      <WatermarkOverlay 
        username={viewerUsername}
        density={watermarkDensity}
        opacity={watermarkOpacity}
      />
      
      {controls && showControls && (
        <div 
          className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={handleVideoClick}
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-3">
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}