'use client'

import { SlideShell } from '../SlideShell'
import { useMountTransition, useCountUp } from '../hooks'
import type { StorySlideProps } from '../types'

export function LabCountSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const count = useCountUp(stats.newReposCount, 1200)

  const forked = stats.mostForkedRepo
  const starred = stats.mostStarredRepo

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
          lab count · experiment #7
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
          ideas don&apos;t wait. neither do you.
        </p>

        {/* Flask icon */}
        <div style={{
          fontSize: 48, lineHeight: 1, marginTop: 8,
          animation: 'butterflyFloat 4s ease-in-out infinite',
          filter: 'drop-shadow(0 0 14px rgba(61,138,138,0.5))',
        }}>
          🧪
        </div>

        {/* New repo count */}
        <span
          style={{
            fontFamily: 'monospace', fontSize: 80, fontWeight: 800, lineHeight: 1,
            background: 'linear-gradient(150deg, #3D8A8A 0%, #8EC49E 55%, #9B7FD4 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}
        >
          {count ?? '…'}
        </span>

        <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(196,208,232,0.5)', margin: 0 }}>
          new {stats.newReposCount === 1 ? 'repo' : 'repos'} created this year
        </p>

        {/* Most starred this year */}
        {starred && starred.stargazers_count > 0 && (
          <div style={{
            marginTop: 12, padding: '10px 18px', borderRadius: 12,
            border: '1px solid rgba(61,138,138,0.2)',
            background: 'rgba(61,138,138,0.07)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, maxWidth: 280, width: '100%',
          }}>
            <p style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.3)', margin: 0 }}>
              most starred
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(196,208,232,0.8)', margin: 0 }}>
              {starred.name}
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(196,168,96,0.7)', margin: 0 }}>
              ⭐ {starred.stargazers_count.toLocaleString()}
              {forked && forked.forks > 0 ? `  ·  🍴 ${forked.forks} forks` : ''}
            </p>
          </div>
        )}

        {stats.newReposCount === 0 && (
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(196,208,232,0.3)', marginTop: 8, textAlign: 'center' }}>
            all your work this year went into existing projects
          </p>
        )}
      </div>
    </SlideShell>
  )
}
