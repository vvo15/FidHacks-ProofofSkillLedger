'use client'

import { SlideShell } from '../SlideShell'
import { useMountTransition, useCountUp } from '../hooks'
import type { StorySlideProps } from '../types'

const SHIMMER: React.CSSProperties = {
  borderRadius: 6,
  background: 'rgba(155,127,212,0.12)',
  animation: 'iridescenceShift 2s ease infinite',
}

export function BugSlayerSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const count = useCountUp(stats.issuesClosed)

  const fix = stats.fastestFix
  const fixLabel = fix
    ? fix.hours < 1
      ? `${Math.round(fix.hours * 60)}m in ${fix.repo}`
      : fix.hours < 24
        ? `${fix.hours.toFixed(1)}h in ${fix.repo}`
        : `${(fix.hours / 24).toFixed(1)}d in ${fix.repo}`
    : null

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
          bug slayer · micro-win #2
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
          every closed issue is a small victory.
        </p>

        {/* Trophy visual */}
        <div style={{
          fontSize: 52, lineHeight: 1, marginTop: 8,
          filter: 'drop-shadow(0 0 18px rgba(196,168,96,0.45))',
          animation: 'butterflyFloat 4s ease-in-out infinite',
        }}>
          🏆
        </div>

        {/* Issue count */}
        <div style={{ lineHeight: 1, textAlign: 'center' }}>
          {stats.issuesClosed === null ? (
            <div style={{ ...SHIMMER, width: 140, height: 80 }} />
          ) : (
            <span
              style={{
                fontFamily: 'monospace', fontSize: 80, fontWeight: 800, lineHeight: 1,
                background: 'linear-gradient(150deg, #C4A060 0%, #A8637A 55%, #9B7FD4 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              {count ?? '…'}
            </span>
          )}
        </div>

        <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(196,208,232,0.5)', margin: 0 }}>
          {stats.issuesClosed === null
            ? 'issues closed'
            : stats.issuesClosed === 1
              ? 'bug squashed'
              : 'bugs squashed'}
        </p>

        {/* Fastest fix */}
        {fix && fixLabel && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 20px',
              borderRadius: 12,
              border: '1px solid rgba(196,168,96,0.25)',
              background: 'rgba(196,168,96,0.06)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.35)', margin: '0 0 4px' }}>
              fastest fix
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(196,168,96,0.9)', margin: 0 }}>
              ⚡ {fixLabel}
            </p>
          </div>
        )}

        {stats.issuesClosed === 0 && (
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(196,208,232,0.3)', marginTop: 8 }}>
            zero issues filed — or zero left open. both are wins.
          </p>
        )}
      </div>
    </SlideShell>
  )
}
