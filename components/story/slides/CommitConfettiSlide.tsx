'use client'

import { SlideShell } from '../SlideShell'
import { useMountTransition, useCountUp } from '../hooks'
import type { StorySlideProps } from '../types'

const SHIMMER: React.CSSProperties = {
  borderRadius: 6,
  background: 'rgba(155,127,212,0.12)',
  animation: 'iridescenceShift 2s ease infinite',
}

export function CommitConfettiSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const count = useCountUp(stats.totalCommits)

  const weekly = stats.weeklyCommits
  const maxW = weekly && weekly.length > 0 ? Math.max(...weekly.map(w => w.count), 1) : 1

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
          commit confetti · micro-win #1
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
          you were on fire this year 🔥
        </p>

        {/* Big number */}
        <div style={{ lineHeight: 1, marginTop: 4 }}>
          {stats.totalCommits === null ? (
            <div style={{ ...SHIMMER, width: 180, height: 84 }} />
          ) : (
            <span
              style={{
                fontFamily: 'monospace', fontSize: 88, fontWeight: 800, lineHeight: 1,
                background: 'linear-gradient(150deg, #C4A060 0%, #B87A8A 55%, #9B7FD4 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              {count?.toLocaleString() ?? '…'}
            </span>
          )}
        </div>

        <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(196,208,232,0.45)', margin: 0 }}>
          commits across {stats.totalRepos} {stats.totalRepos === 1 ? 'repo' : 'repos'}
        </p>

        {/* Weekly heatmap */}
        {weekly && weekly.length > 0 ? (
          <div style={{ marginTop: 16, width: '100%', maxWidth: 300 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.28)', margin: '0 0 8px', textAlign: 'center' }}>
              most explosive weeks
            </p>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 48 }}>
              {weekly.slice(-16).map((w, i, arr) => {
                const isTop = w.count === Math.max(...arr.map(x => x.count))
                return (
                  <div
                    key={w.weekStart}
                    title={`${w.count} commits`}
                    style={{
                      flex: 1,
                      height: Math.max(4, (w.count / maxW) * 48),
                      borderRadius: 2,
                      background: isTop
                        ? 'linear-gradient(180deg, #C4A060 0%, #9B7FD4 100%)'
                        : 'linear-gradient(180deg, #9B7FD4 0%, #3D8A8A 100%)',
                      opacity: isTop ? 0.95 : 0.3 + (i / arr.length) * 0.4,
                    }}
                  />
                )
              })}
            </div>
          </div>
        ) : stats.totalCommits !== null ? (
          <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(196,208,232,0.22)', marginTop: 16 }}>
            weekly breakdown available for recent activity
          </p>
        ) : null}
      </div>
    </SlideShell>
  )
}
