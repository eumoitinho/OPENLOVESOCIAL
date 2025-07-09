"use client"

import { useState, useEffect, type RefObject } from "react"

export function useOnScreen(ref: RefObject<Element>): boolean {
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting)
    })

    if (ref.current) {
      observer.observe(ref.current)
    }

    const currentRef = ref.current

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [ref])

  return isIntersecting
}
