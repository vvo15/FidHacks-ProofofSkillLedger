'use client'

import { SlideShell } from '../SlideShell'
import { useMountTransition, useCountUp } from '../hooks'
import type { StorySlideProps } from '../types'

const SHIMMER: React.CSSProperties = {
  borderRadius: 6,
  background: 'rgba(155,127,212,0.12)',
  animation: 'iridescenceShift 2s ease infinite',
}

export function CollabSparkSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const collab = stats.collabSparkRepo
  const count = useCountUp(collab?.contributorCount ?? null, 1000)

  // Network visual: dots arranged in a loose cluster
  const dotPositions = [
    { x: 0, y: 0 },
    { x: -34, y: -22 },
    { x: 34, y: -22 },
    { x: -50, y: 14 },
    { x: 50, y: 14 },
    { x: 0, y: 36 },
  ]

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
          collab spark · experiment #8
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
          the best code is built together.
        </p>

        {/* Network node visual */}
        <div style={{ position: 'relative', width: 120, height: 90, marginTop: 8 }}>
          {dotPositions.slice(0, collab ? Math.min(collab.contributorCount, 6) : 1).map((pos, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%', top: '50%',
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                width: i === 0 ? 16 : 10,
                height: i === 0 ? 16 : 10,
                borderRadius: '50%',
                background: i === 0
                  ? 'linear-gradient(135deg, #9B7FD4, #3D8A8A)'
                  : 'rgba(155,127,212,0.45)',
                boxShadow: i === 0
                  ? '0 0 12px rgba(155,127,212,0.5)'
                  : '0 0 6px rgba(61,138,138,0.3)',
                animation: `butterflyFloat ${3.5 + i * 0.4}s ease-in-out infinite ${i * 0.3}s`,
              }}
            />
          ))}
          {/* Lines from center to satellites */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            {dotPositions.slice(1, collab ? Math.min(collab.contributorCount, 6) : 1).map((pos, i) => (
              <line
                key={i}
                x1="60" y1="45"
                x2={60 + pos.x} y2={45 + pos.y}
                stroke="rgba(155,127,212,0.2)"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        {collab === null ? (
          <div style={{ ...SHIMMER, width: 200, height: 60, marginTop: 4 }} />
        ) : collab ? (
          <>
            <span
              style={{
                fontFamily: 'monospace', fontSize: 72, fontWeight: 800, lineHeight: 1,
                background: 'linear-gradient(150deg, #9B7FD4 0%, #3D8A8A 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              {count ?? '…'}
            </span>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(196,208,232,0.45)', margin: 0 }}>
              contributors in
            </p>
            <p style={{
              fontFamily: 'monospace', fontSize: 15, fontWeight: 600,
              color: 'rgba(196,208,232,0.82)', margin: 0,
              background: 'linear-gradient(90deg, #9B7FD4, #5AACAB)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {collab.name}
            </p>
          </>
        ) : (
          <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(196,208,232,0.4)', marginTop: 8, textAlign: 'center' }}>
            a solo year — every line of code,<br />all yours.
          </p>
        )}
      </div>
    </SlideShell>
  )
}
