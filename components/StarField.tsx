'use client'

import { useEffect, useState } from 'react'

// mulberry32 — fast, good quality 32-bit seeded PRNG
function mulberry32(seed: number) {
  let s = seed
  return function rand() {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

interface Star {
  id: number
  x: number
  y: number
  r: number
  opacity: number
  dur: number
  delay: number
}

function generateStars(seed: number, count: number): Star[] {
  const rand = mulberry32(seed)
  return Array.from({ length: count }, (_, id) => {
    const x       = rand() * 100
    const y       = rand() * 100
    const sizePick = rand()
    const r       = sizePick < 0.07 ? 2 : sizePick < 0.25 ? 1.5 : 1
    const opacity = 0.12 + rand() * 0.72
    const dur     = 2.2  + rand() * 3.8
    const delay   = rand() * 6
    return { id, x, y, r, opacity, dur, delay }
  })
}

interface Props {
  count?: number
}

export function StarField({ count = 90 }: Props) {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    // Seed is generated fresh per page-load so the sky looks different each visit
    const seed = Math.floor(Math.random() * 0xffffff)
    setStars(generateStars(seed, count))
  }, [count])

  return (
    <>
      {stars.map(s => (
        <div
          key={s.id}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left:   `${s.x}%`,
            top:    `${s.y}%`,
            width:   s.r * 2,
            height:  s.r * 2,
            borderRadius: '50%',
            background: 'rgba(210,225,255,0.95)',
            opacity: s.opacity,
            animation: `moonSparkle ${s.dur}s ease-in-out infinite ${s.delay}s`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}
