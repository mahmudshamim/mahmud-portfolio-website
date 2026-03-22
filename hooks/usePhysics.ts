'use client'

import { useEffect, useRef } from 'react'

export function usePhysics(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    // Physics engine is set up directly in Skills.tsx
  }, [canvasRef])

  return engineRef
}
