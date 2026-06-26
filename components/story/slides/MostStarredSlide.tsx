'use client'

import { useCountUp, useMountTransition } from '../hooks'
import { SlideShell } from '../SlideShell'
import type { StorySlideProps } from '../types'

function ButterflyIcon() {
  return (
    <svg
      viewBox="0 0 120 90"
      width={110}
      height={82}
      style={{ animation: 'butterflyFloat 5s ease-in-out infinite', overflow: 'visible' }}
      aria-hidden
    >
      <defs>
        <linearGradient id="bwL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#C4A060" />
          <stop offset="48%"  stopColor="#A8637A" />
          <stop offset="100%" stopColor="#7B5EA7" />
        </linearGradient>
        <linearGradient id="bwR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7B5EA7" />
          <stop offset="48%"  stopColor="#3D8A8A" />
          <stop offset="100%" stopColor="#5E9E8E" />
        </linearGradient>
        <filter id="wingGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Upper left wing */}
      <path
        d="M60,45 C54,14 8,4 2,26 C-2,44 18,64 42,59 C52,57 58,52 60,45"
        fill="url(#bwL)" opacity={0.88}
      />
      {/* Upper right wing */}
      <path
        d="M60,45 C66,14 112,4 118,26 C122,44 102,64 78,59 C68,57 62,52 60,45"
        fill="url(#bwR)" opacity={0.88}
      />
      {/* Lower left wing */}
      <path
        d="M60,45 C52,58 28,76 14,84 C2,90 2,76 16,66 C30,56 50,54 60,45"
        fill="url(#bwL)" opacity={0.72}
      />
      {/* Lower right wing */}
      <path
        d="M60,45 C68,58 92,76 106,84 C118,90 118,76 104,66 C90,56 70,54 60,45"
        fill="url(#bwR)" opacity={0.72}
      />

      {/* Wing vein marks */}
      <path d="M60,45 C50,30 25,18 8,22"    fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M60,45 C70,30 95,18 112,22"  fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M60,45 C50,55 32,68 18,80"   fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M60,45 C70,55 88,68 102,80"  fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.7" strokeLinecap="round" />

      {/* Body */}
      <path
        d="M60,26 C61.5,32 62,44 61.5,62 C61.5,66 60,68 60,68 C60,68 58.5,66 58.5,62 C58,44 58.5,32 60,26"
        fill="rgba(210,225,255,0.88)"
      />
      {/* Antennae */}
      <path d="M60,26 C55,18 49,11 45,7"    stroke="rgba(210,225,255,0.6)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M60,26 C65,18 71,11 75,7"    stroke="rgba(210,225,255,0.6)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="45" cy="7" r="2.2" fill="rgba(196,208,232,0.7)" />
      <circle cx="75" cy="7" r="2.2" fill="rgba(196,208,232,0.7)" />
    </svg>
  )
}

export function MostStarredSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const repo = stats.mostStarredRepo
  const stars = useCountUp(visible && repo ? repo.stargazers_count : null, 1700)

  return (
    <SlideShell>
      <div
        className="flex flex-col items-center justify-center gap-7 px-8 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <p style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.5)' }}>
          your most loved project
        </p>

        {repo ? (
          <>
            <div style={{ filter: 'drop-shadow(0 0 30px rgba(184,150,80,0.45))' }}>
              <ButterflyIcon />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div style={{ filter: 'drop-shadow(0 0 20px rgba(184,150,80,0.4))' }}>
                <span style={{
                  fontFamily: 'monospace', fontWeight: 700,
                  fontSize: 'clamp(3rem, 12vw, 5.5rem)', lineHeight: 1,
                  background: 'linear-gradient(145deg, #C4A060 0%, #B87A8A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'block',
                }}>
                  {stars ?? 0}
                </span>
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 16, color: 'rgba(168,99,122,0.8)' }}>
                stars
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <span style={{ fontFamily: 'monospace', fontSize: 17, color: 'rgba(196,208,232,0.82)' }}>
                {repo.name}
              </span>
              {repo.description && (
                <span style={{
                  fontFamily: 'monospace', fontSize: 11,
                  color: 'rgba(180,200,235,0.32)',
                  maxWidth: 280,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {repo.description}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <ButterflyIcon />
            <p style={{ fontFamily: 'monospace', color: 'rgba(196,208,232,0.3)' }}>
              No starred repos yet — keep building.
            </p>
          </>
        )}
      </div>
    </SlideShell>
  )
}
