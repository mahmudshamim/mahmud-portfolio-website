'use client'

import { useState, useCallback, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&'

export function useScramble(originalText: string, speed = 0.05) {
  const [display, setDisplay]         = useState(originalText)
  const [isScrambling, setIsScrambling] = useState(false)
  const rafRef      = useRef<number>(0)
  const progressRef = useRef(0)

  const scramble = useCallback(() => {
    if (progressRef.current > 0 && progressRef.current < 1) return

    cancelAnimationFrame(rafRef.current)
    progressRef.current = 0
    setIsScrambling(true)

    const step = () => {
      progressRef.current = Math.min(1, progressRef.current + speed)
      const revealed = Math.floor(progressRef.current * originalText.length)

      const scrambled =
        originalText.slice(0, revealed) +
        Array.from(
          { length: originalText.length - revealed },
          () => CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join('')

      setDisplay(scrambled)

      if (progressRef.current < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setDisplay(originalText)
        setIsScrambling(false)
      }
    }

    rafRef.current = requestAnimationFrame(step)
  }, [originalText, speed])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    progressRef.current = 0
    setDisplay(originalText)
    setIsScrambling(false)
  }, [originalText])

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
  }, [])

  return { display, scramble, reset, cleanup, isScrambling }
}
