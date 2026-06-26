'use client'

import { SlideShell } from '../SlideShell'
import { useMountTransition, useCountUp } from '../hooks'
import type { StorySlideProps } from '../types'

const SHIMMER: React.CSSProperties = {
  borderRadius: 6,
  background: 'rgba(155,127,212,0.12)',
  animation: 'iridescenceShift 2s ease infinite',
}

export function GreenStreakSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const longest = useCountUp(stats.longestStreak)
  const current = useCountUp(stats.currentStreak)

  // 14-dot chain showing the streak visually
  const dotCount = 14
  const streak = stats.currentStreak ?? 0

  return (
    <SlideShell>
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          padding: '0 28px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.38)', margin: 0 }}>
          green streak · micro-win #3
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
          consistency is the quiet superpower.
        </p>

        {/* Longest streak */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          {stats.longestStreak === null ? (
            <div style={{ ...SHIMMER, width: 160, height: 84, margin: '0 auto' }} />
          ) : (
            <>
              <span
                style={{
                  fontFamily: 'monospace', fontSize: 88, fontWeight: 800, lineHeight: 1,
                  background: 'linear-gradient(150deg, #8EC49E 0%, #3D8A8A 55%, #9B7FD4 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >
                {longest ?? '…'}
              </span>
              <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(196,208,232,0.5)', margin: '2px 0 0' }}>
                day longest streak
              </p>
            </>
          )}
        </div>

        {/* Dot chain — last 14 days, lit = active in current streak */}
        {stats.currentStreak !== null && (
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {Array.from({ length: dotCount }).map((_, i) => {
              const daysAgo = dotCount - 1 - i
              const isActive = daysAgo < streak
              return (
                <div
                  key={i}
                  style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: isActive
                      ? 'linear-gradient(135deg, #8EC49E, #3D8A8A)'
                      : 'rgba(255,255,255,0.08)',
                    boxShadow: isActive ? '0 0 6px rgba(142,196,158,0.5)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              )
            })}
          </div>
        )}

        {/* Current streak */}
        {stats.currentStreak !== null && stats.currentStreak > 0 && (
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(142,196,158,0.7)', margin: 0 }}>
              🔥 {current ?? '…'} day current streak
            </p>
          </div>
        )}

        {stats.longestStreak === 0 && stats.currentStreak !== null && (
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(196,208,232,0.3)', marginTop: 8, textAlign: 'center' }}>
            streak data reflects recent activity via events API
          </p>
        )}
      </div>
    </SlideShell>
  )
}
