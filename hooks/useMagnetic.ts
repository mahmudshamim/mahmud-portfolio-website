'use client'

import { useRef, useEffect } from 'react'

export function useMagnetic(strength = 0.45, radius = 130) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      if (dist < radius) {
        const f = (1 - dist / radius) * strength
        el.style.transform = `translate(${dx * f}px, ${dy * f}px)`
      }
    }

    const onLeave = () => {
      el.style.transform = 'translate(0px, 0px)'
      el.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
    }

    const onEnter = () => {
      el.style.transition = 'transform 0.1s ease'
    }

    window.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('mouseenter', onEnter)

    return () => {
      window.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('mouseenter', onEnter)
    }
  }, [strength, radius])

  return ref
}
