"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface WatermarkOverlayProps {
  username: string
  className?: string
  density?: number
  opacity?: number
}

export function WatermarkOverlay({ 
  username, 
  className, 
  density = 5, 
  opacity = 0.15 
}: WatermarkOverlayProps) {
  // Use effect to handle window size changes
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 })
  
  React.useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  const currentDateTime = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  })

  const watermarkText = `@${username} • ${currentDateTime}`
  
  // Criar array de posições para repetir a marca d'água em diagonal
  const watermarkPositions = React.useMemo(() => {
    const positions = []
    const spacing = 180 // Espaçamento entre marcas d'água
    const rows = Math.ceil(dimensions.height / spacing) + 3
    const cols = Math.ceil(dimensions.width / spacing) + 3
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        positions.push({
          id: row * cols + col,
          top: `${row * spacing - 90}px`,
          left: `${col * spacing - 90}px`,
          transform: `rotate(-35deg)` // Rotação diagonal fixa
        })
      }
    }
    return positions
  }, [dimensions])

  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none z-10 overflow-hidden select-none",
        className
      )}
      style={{ 
        background: "transparent"
      }}
    >
      {watermarkPositions.map((position) => (
        <div
          key={position.id}
          className="absolute whitespace-nowrap text-white font-semibold text-sm tracking-wider"
          style={{
            top: position.top,
            left: position.left,
            transform: position.transform,
            opacity: opacity,
            textShadow: "0 0 6px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.5), 0 0 18px rgba(0,0,0,0.3)",
            userSelect: "none",
            pointerEvents: "none",
            fontFamily: "monospace",
            letterSpacing: "0.1em"
          }}
        >
          {watermarkText}
        </div>
      ))}
    </div>
  )
}
