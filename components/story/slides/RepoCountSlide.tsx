'use client'

import { useCountUp, useMountTransition } from '../hooks'
import { SlideShell } from '../SlideShell'
import type { StorySlideProps } from '../types'

function WingAccent({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 80 50"
      width={80}
      height={50}
      style={{
        transform: flip ? 'scaleX(-1)' : undefined,
        opacity: 0.35,
        flexShrink: 0,
      }}
    >
      <path
        d="M70,25 C55,8 30,2 8,12 C2,16 2,22 8,26 C20,32 45,28 70,25"
        fill="none"
        stroke="url(#ra)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M65,32 C50,22 30,20 10,28"
        fill="none"
        stroke="url(#ra)"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity={0.6}
      />
      <defs>
        <linearGradient id="ra" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C4A860" />
          <stop offset="100%" stopColor="#A8637A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function RepoCountSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const count = useCountUp(visible ? stats.totalRepos : null, 1900)

  const caption =
    stats.totalRepos >= 50 ? 'An impressive body of work.' :
    stats.totalRepos >= 20 ? 'You keep showing up.' :
    'Every great project starts here.'

  return (
    <SlideShell>
      <div
        className="flex flex-col items-center justify-center gap-6 px-8 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <p style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.5)' }}>
          you shipped
        </p>

        <div className="flex flex-col items-center gap-3">
          {/* Wing accents flanking the number */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <WingAccent flip />
            <div style={{ filter: 'drop-shadow(0 0 24px rgba(184,150,80,0.5))' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 'clamp(5rem, 20vw, 8.5rem)',
                  lineHeight: 1,
                  background: 'linear-gradient(150deg, #C4A060 0%, #B87A8A 65%, #9B7FD4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'block',
                }}
              >
                {count ?? ' '}
              </span>
            </div>
            <WingAccent />
          </div>

          <span style={{ fontFamily: 'monospace', fontSize: 20, color: 'rgba(168,99,122,0.9)' }}>
            {stats.totalRepos === 1 ? 'repository' : 'repositories'}
          </span>
        </div>

        <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(180,200,235,0.32)', maxWidth: 260 }}>
          {caption}
        </p>
      </div>
    </SlideShell>
  )
}
