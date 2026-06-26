'use client'

import { useEffect, useState } from 'react'

export function useCountUp(target: number | null, duration = 1600): number | null {
  const [value, setValue] = useState<number | null>(null)

  useEffect(() => {
    if (target === null) return
    setValue(0)
    const start = Date.now()
    let frame: number
    const tick = () => {
      const elapsed = Date.now() - start
      const t = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 4) // easeOutQuart
      setValue(Math.round(eased * target))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}

export function useMountTransition(delay = 30): boolean {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(id)
  }, [delay])
  return visible
}
