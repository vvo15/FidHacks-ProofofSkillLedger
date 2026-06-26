'use client'

import { SlideShell } from '../SlideShell'
import { useMountTransition, useCountUp } from '../hooks'
import type { StorySlideProps } from '../types'

const SHIMMER: React.CSSProperties = {
  borderRadius: 6,
  background: 'rgba(155,127,212,0.12)',
  animation: 'iridescenceShift 2s ease infinite',
}

interface BadgeInfo {
  label: string
  emoji: string
  color: string
  glow: string
  description: string
}

function getBadge(reviews: number): BadgeInfo {
  if (reviews >= 200) return { label: 'Architect', emoji: '🏛️', color: '#C4A060', glow: 'rgba(196,168,96,0.35)', description: 'The team leans on your judgment. Your reviews shape the codebase.' }
  if (reviews >= 51)  return { label: 'Mentor', emoji: '🏮', color: '#9B7FD4', glow: 'rgba(155,127,212,0.35)', description: 'You raise the bar for everyone. Developers grow from your feedback.' }
  if (reviews >= 11)  return { label: 'Contributor', emoji: '🤝', color: '#3D8A8A', glow: 'rgba(61,138,138,0.35)', description: 'An active voice in the team. You keep quality high.' }
  return { label: 'Rookie', emoji: '🌱', color: '#8EC49E', glow: 'rgba(142,196,158,0.3)', description: 'Every expert was once a beginner. The review habit starts here.' }
}

export function ReviewRankSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const count = useCountUp(stats.reviewsGiven)
  const badge = stats.reviewsGiven !== null ? getBadge(stats.reviewsGiven) : null

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
          review rank · milestone #11
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
          shaping code, shaping teammates.
        </p>

        {stats.reviewsGiven === null ? (
          <>
            <div style={{ ...SHIMMER, width: 80, height: 80, borderRadius: '50%', marginTop: 12 }} />
            <div style={{ ...SHIMMER, width: 160, height: 40, marginTop: 8 }} />
          </>
        ) : badge ? (
          <>
            {/* Badge icon */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `radial-gradient(circle, ${badge.glow} 0%, transparent 70%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 44, lineHeight: 1, marginTop: 8,
              animation: 'butterflyFloat 5s ease-in-out infinite',
              boxShadow: `0 0 32px ${badge.glow}`,
            }}>
              {badge.emoji}
            </div>

            {/* Badge label */}
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  fontFamily: 'monospace', fontSize: 36, fontWeight: 800, lineHeight: 1,
                  color: badge.color,
                  textShadow: `0 0 20px ${badge.glow}`,
                }}
              >
                {badge.label}
              </span>
            </div>

            {/* Review count */}
            <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(196,208,232,0.5)', margin: 0 }}>
              {count?.toLocaleString() ?? '…'} PR {stats.reviewsGiven === 1 ? 'review' : 'reviews'} given
            </p>

            {/* Description */}
            <p style={{
              fontFamily: 'monospace', fontSize: 11,
              color: 'rgba(196,208,232,0.38)', margin: '4px 0 0',
              textAlign: 'center', lineHeight: 1.6, maxWidth: 260,
            }}>
              {badge.description}
            </p>

            {/* Tier ladder */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {(['Rookie', 'Contributor', 'Mentor', 'Architect'] as const).map(tier => {
                const tb = getBadge(tier === 'Rookie' ? 0 : tier === 'Contributor' ? 11 : tier === 'Mentor' ? 51 : 200)
                const isActive = tb.label === badge.label
                return (
                  <span
                    key={tier}
                    style={{
                      fontFamily: 'monospace', fontSize: 9,
                      padding: '3px 8px', borderRadius: 100,
                      border: `1px solid ${isActive ? tb.color : 'rgba(255,255,255,0.08)'}`,
                      color: isActive ? tb.color : 'rgba(196,208,232,0.25)',
                      background: isActive ? `${tb.color}12` : 'transparent',
                    }}
                  >
                    {tier}
                  </span>
                )
              })}
            </div>
          </>
        ) : null}
      </div>
    </SlideShell>
  )
}
