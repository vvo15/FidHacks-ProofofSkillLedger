'use client'

import { SlideShell } from '../SlideShell'
import { useMountTransition, useCountUp } from '../hooks'
import type { StorySlideProps } from '../types'

const SHIMMER: React.CSSProperties = {
  borderRadius: 6,
  background: 'rgba(155,127,212,0.12)',
  animation: 'iridescenceShift 2s ease infinite',
}

export function MoonshotMomentSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const pr = stats.moonshotPR
  const files = useCountUp(pr?.filesChanged ?? null, 1000)

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
          moonshot moment · experiment #9
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
          your boldest swing of the year.
        </p>

        {/* Rocket */}
        <div style={{
          fontSize: 52, lineHeight: 1, marginTop: 8,
          animation: 'butterflyFloat 3.5s ease-in-out infinite',
          filter: 'drop-shadow(0 0 16px rgba(196,168,96,0.4))',
        }}>
          🚀
        </div>

        {pr === null ? (
          <div style={{ ...SHIMMER, width: 220, height: 80, marginTop: 4 }} />
        ) : pr ? (
          <>
            {/* Files changed — big number */}
            <div style={{ textAlign: 'center', lineHeight: 1 }}>
              <span
                style={{
                  fontFamily: 'monospace', fontSize: 80, fontWeight: 800, lineHeight: 1,
                  background: 'linear-gradient(150deg, #C4A060 0%, #A8637A 55%, #9B7FD4 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >
                {files ?? '…'}
              </span>
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(196,208,232,0.45)', margin: 0 }}>
              {(pr.filesChanged === 1 ? 'file' : 'files')} changed in one PR
            </p>

            {/* PR title */}
            <div style={{
              width: '100%', maxWidth: 300,
              padding: '12px 18px', borderRadius: 12,
              border: '1px solid rgba(196,168,96,0.2)',
              background: 'rgba(196,168,96,0.06)',
            }}>
              <p style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.28)', margin: '0 0 6px' }}>
                {pr.repo}
              </p>
              <p style={{
                fontFamily: 'monospace', fontSize: 12,
                color: 'rgba(196,208,232,0.78)', margin: 0, lineHeight: 1.5,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {pr.title}
              </p>
            </div>
          </>
        ) : (
          <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(196,208,232,0.3)', marginTop: 16, textAlign: 'center' }}>
            no merged pull requests in events history for this year
          </p>
        )}
      </div>
    </SlideShell>
  )
}
