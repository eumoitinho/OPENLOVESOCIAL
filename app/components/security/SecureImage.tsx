"use client"

import React from "react"
import { WatermarkOverlay } from "./WatermarkOverlay"
import { cn } from "@/lib/utils"

interface SecureImageProps {
  src: string
  alt: string
  className?: string
  viewerUsername: string
  onClick?: () => void
  watermarkDensity?: number
  watermarkOpacity?: number
}

export function SecureImage({
  src,
  alt,
  className,
  viewerUsername,
  onClick,
  watermarkDensity = 5,
  watermarkOpacity = 0.15
}: SecureImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)} onClick={onClick}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        style={{ userSelect: "none" }}
      />
      <WatermarkOverlay 
        username={viewerUsername}
        density={watermarkDensity}
        opacity={watermarkOpacity}
      />
    </div>
  )
}