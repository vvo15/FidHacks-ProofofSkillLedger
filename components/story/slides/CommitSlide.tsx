'use client'

import { useCountUp, useMountTransition } from '../hooks'
import { SlideShell } from '../SlideShell'
import type { StorySlideProps } from '../types'

export function CommitSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const count = useCountUp(visible && stats.totalCommits !== null ? stats.totalCommits : null, 2100)
  const loading = stats.totalCommits === null

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
          you made
        </p>

        <div className="flex flex-col items-center gap-3">
          <div style={{ filter: loading ? undefined : 'drop-shadow(0 0 28px rgba(90,172,171,0.45))' }}>
            {loading ? (
              // Shimmering placeholder while the server action resolves
              <span
                style={{
                  fontFamily: 'monospace', fontWeight: 700,
                  fontSize: 'clamp(5rem, 20vw, 8.5rem)', lineHeight: 1,
                  background: 'linear-gradient(90deg, #2a2040 25%, #4a3870 50%, #2a2040 75%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'iridescenceShift 1.8s ease infinite',
                  display: 'block',
                }}
              >
                ···
              </span>
            ) : (
              <span
                style={{
                  fontFamily: 'monospace', fontWeight: 700,
                  fontSize: 'clamp(5rem, 20vw, 8.5rem)', lineHeight: 1,
                  background: 'linear-gradient(150deg, #9B7FD4 0%, #5AACAB 55%, #8EC49E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'block',
                }}
              >
                {count ?? 0}
              </span>
            )}
          </div>

          <span style={{ fontFamily: 'monospace', fontSize: 20, color: 'rgba(94,158,142,0.85)' }}>
            commits
          </span>
        </div>

        {stats.mostCommittedRepo && (
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(180,200,235,0.35)', maxWidth: 280 }}>
            {stats.mostCommittedRepo.count} of them in{' '}
            <span style={{ color: 'rgba(155,127,212,0.7)' }}>{stats.mostCommittedRepo.name}</span>
          </p>
        )}
      </div>
    </SlideShell>
  )
}
