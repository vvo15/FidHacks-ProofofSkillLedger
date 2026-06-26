'use client'

import { useMountTransition } from '../hooks'
import { SlideShell } from '../SlideShell'
import type { StorySlideProps } from '../types'

export function LanguageSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const lang = stats.favoriteLanguage

  return (
    <SlideShell>
      <div
        className="flex flex-col items-center justify-center gap-8 px-8 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <p style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.5)' }}>
          your signature language
        </p>

        {lang ? (
          <>
            {/* Layered glow rings in the language's color */}
            <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
              {/* Outer ambient bloom */}
              <div style={{
                position: 'absolute',
                width: 220, height: 220,
                borderRadius: '55% 45% 60% 40% / 45% 55% 45% 55%',
                background: `radial-gradient(circle, ${lang.color}18 0%, transparent 70%)`,
              }} />
              {/* Mid ring */}
              <div style={{
                position: 'absolute',
                width: 150, height: 150,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${lang.color}28 0%, transparent 65%)`,
                animation: 'butterflyFloat 5s ease-in-out infinite',
              }} />
              {/* Inner ring */}
              <div style={{
                position: 'absolute',
                width: 88, height: 88,
                borderRadius: '50%',
                border: `1px solid ${lang.color}50`,
                boxShadow: `0 0 20px ${lang.color}44, inset 0 0 14px ${lang.color}22`,
              }} />

              {/* Language name */}
              <div style={{ filter: `drop-shadow(0 0 18px ${lang.color}cc)` }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 'clamp(1.8rem, 7vw, 3rem)',
                  color: lang.color,
                  position: 'relative',
                  zIndex: 2,
                }}>
                  {lang.name}
                </span>
              </div>
            </div>

            {/* Wing veins — subtle arc lines echoing the language color */}
            <svg viewBox="0 0 240 30" width={240} height={30} style={{ opacity: 0.3 }}>
              <path d="M10,15 Q60,3 120,15 Q180,27 230,15" fill="none" stroke={lang.color} strokeWidth="1" strokeLinecap="round" />
              <path d="M30,15 Q80,6 120,15 Q160,24 210,15" fill="none" stroke={lang.color} strokeWidth="0.6" strokeLinecap="round" />
            </svg>

            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(196,208,232,0.4)', maxWidth: 280 }}>
              your most-reached-for language in the last 10 projects
            </p>
          </>
        ) : (
          <span style={{ fontFamily: 'monospace', fontSize: 24, color: 'rgba(196,208,232,0.3)' }}>—</span>
        )}
      </div>
    </SlideShell>
  )
}
