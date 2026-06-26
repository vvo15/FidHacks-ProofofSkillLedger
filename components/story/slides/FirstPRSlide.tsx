'use client'

import { SlideShell } from '../SlideShell'
import { useMountTransition } from '../hooks'
import type { StorySlideProps } from '../types'

const SHIMMER: React.CSSProperties = {
  borderRadius: 6,
  background: 'rgba(155,127,212,0.12)',
  animation: 'iridescenceShift 2s ease infinite',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

export function FirstPRSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const pr = stats.firstPR

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
          first pr merged · breakthrough #5
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
          every journey begins with a single pull request.
        </p>

        {/* PR merge icon */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #9B7FD4 0%, #3D8A8A 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginTop: 8,
          boxShadow: '0 0 28px rgba(155,127,212,0.35)',
          animation: 'butterflyFloat 5s ease-in-out infinite',
        }}>
          ⤵
        </div>

        {pr === null ? (
          <div style={{ ...SHIMMER, width: 220, height: 80, marginTop: 8 }} />
        ) : pr ? (
          <>
            {/* Date */}
            <p
              style={{
                fontFamily: 'monospace', fontSize: 28, fontWeight: 700, lineHeight: 1,
                background: 'linear-gradient(150deg, #9B7FD4 0%, #5AACAB 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                margin: '8px 0 0',
              }}
            >
              {formatDate(pr.date)}
            </p>

            {/* Repo */}
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(61,138,138,0.75)', margin: 0 }}>
              {pr.repo}
            </p>

            {/* PR title card */}
            <div style={{
              marginTop: 4,
              padding: '12px 18px',
              borderRadius: 12,
              border: '1px solid rgba(155,127,212,0.2)',
              background: 'rgba(155,127,212,0.06)',
              maxWidth: 300, width: '100%',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: 'rgba(155,127,212,0.7)', fontSize: 14, flexShrink: 0, marginTop: 1 }}>●</span>
                <p style={{
                  fontFamily: 'monospace', fontSize: 12,
                  color: 'rgba(196,208,232,0.75)',
                  margin: 0, lineHeight: 1.5,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {pr.title}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(196,208,232,0.3)', marginTop: 16, textAlign: 'center' }}>
            no merged pull requests found for this year
          </p>
        )}
      </div>
    </SlideShell>
  )
}
