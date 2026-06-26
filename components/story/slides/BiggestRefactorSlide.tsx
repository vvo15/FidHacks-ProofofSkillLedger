'use client'

import { SlideShell } from '../SlideShell'
import { useMountTransition } from '../hooks'
import type { StorySlideProps } from '../types'

const SHIMMER: React.CSSProperties = {
  borderRadius: 6,
  background: 'rgba(155,127,212,0.12)',
  animation: 'iridescenceShift 2s ease infinite',
}

export function BiggestRefactorSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const ref = stats.biggestRefactor

  return (
    <SlideShell>
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          padding: '0 28px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.38)', margin: 0 }}>
          biggest refactor · breakthrough #6
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
          great code isn&apos;t written — it&apos;s rewritten.
        </p>

        {/* Broom icon */}
        <div style={{
          fontSize: 52, lineHeight: 1, marginTop: 8,
          animation: 'butterflyFloat 5s ease-in-out infinite',
          filter: 'drop-shadow(0 0 12px rgba(168,99,122,0.4))',
        }}>
          🧹
        </div>

        {ref === null ? (
          <div style={{ ...SHIMMER, width: 240, height: 70, marginTop: 4 }} />
        ) : ref ? (
          <>
            {/* Commit message */}
            <div style={{
              width: '100%', maxWidth: 300,
              padding: '14px 18px',
              borderRadius: 12,
              border: '1px solid rgba(168,99,122,0.25)',
              background: 'rgba(168,99,122,0.07)',
            }}>
              <p style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.3)', margin: '0 0 8px' }}>
                commit message
              </p>
              <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(196,208,232,0.82)', margin: 0, lineHeight: 1.5 }}>
                &ldquo;{ref.message}&rdquo;
              </p>
            </div>

            {/* Repo + sha */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(168,99,122,0.8)' }}>
                {ref.repo}
              </span>
              <span style={{ color: 'rgba(196,208,232,0.2)', fontSize: 10 }}>·</span>
              <span
                style={{
                  fontFamily: 'monospace', fontSize: 11,
                  padding: '2px 8px', borderRadius: 4,
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(196,208,232,0.35)',
                }}
              >
                {ref.sha}
              </span>
            </div>
          </>
        ) : (
          <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(196,208,232,0.3)', marginTop: 16, textAlign: 'center' }}>
            no refactor commits found — or your code was perfect to begin with.
          </p>
        )}
      </div>
    </SlideShell>
  )
}
