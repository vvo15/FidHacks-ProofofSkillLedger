'use client'

import { getLanguageColor } from '@/lib/graphData'
import { SlideShell } from '../SlideShell'
import { useMountTransition } from '../hooks'
import type { StorySlideProps } from '../types'

export function LanguageUnlockedSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)

  const newLangs = stats.newLanguages ?? []
  const prevLangs = stats.languageGroups
    .map(g => g.language)
    .filter(l => !newLangs.includes(l) && l !== 'Unknown')
    .slice(0, 3)

  const hasNewLangs = newLangs.length > 0
  const hasPrevYear = prevLangs.length > 0 || newLangs.length > 0

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
          language unlocked · breakthrough #4
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
          new tools, new possibilities.
        </p>

        {hasNewLangs ? (
          <>
            {/* Unlocked badge */}
            <div style={{
              fontSize: 48, lineHeight: 1, marginTop: 8,
              animation: 'butterflyFloat 4.5s ease-in-out infinite',
              filter: 'drop-shadow(0 0 14px rgba(155,127,212,0.5))',
            }}>
              🔓
            </div>

            {/* New language chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 280 }}>
              {newLangs.map(lang => {
                const color = getLanguageColor(lang)
                return (
                  <div
                    key={lang}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '8px 16px',
                      borderRadius: 100,
                      border: `1px solid ${color}55`,
                      background: `${color}12`,
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: 'rgba(196,208,232,0.9)' }}>
                      {lang}
                    </span>
                  </div>
                )
              })}
            </div>

            <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(196,208,232,0.38)', margin: 0 }}>
              first time in your repos this year
            </p>

            {/* Previous stack */}
            {hasPrevYear && prevLangs.length > 0 && (
              <div style={{ marginTop: 4, textAlign: 'center' }}>
                <p style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.28)', margin: '0 0 8px' }}>
                  added to your stack of
                </p>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {prevLangs.map(lang => {
                    const color = getLanguageColor(lang)
                    return (
                      <span
                        key={lang}
                        style={{
                          fontFamily: 'monospace', fontSize: 11,
                          padding: '3px 10px',
                          borderRadius: 100,
                          border: `1px solid rgba(255,255,255,0.1)`,
                          color: `${color}`,
                          opacity: 0.55,
                        }}
                      >
                        {lang}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, lineHeight: 1, marginTop: 16 }}>⚡</div>
            <p style={{ fontFamily: 'monospace', fontSize: 15, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
              you went deep, not wide.
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(196,208,232,0.38)', margin: 0, textAlign: 'center' }}>
              same language stack as last year — mastery in progress.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 8, maxWidth: 280 }}>
              {stats.languageGroups.slice(0, 4).map(g => (
                <span
                  key={g.language}
                  style={{
                    fontFamily: 'monospace', fontSize: 12,
                    padding: '4px 12px',
                    borderRadius: 100,
                    border: `1px solid ${g.color}44`,
                    color: g.color,
                  }}
                >
                  {g.language}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </SlideShell>
  )
}
