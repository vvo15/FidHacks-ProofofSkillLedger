'use client'

import { useMountTransition } from '../hooks'
import { SlideShell } from '../SlideShell'
import type { StorySlideProps } from '../types'

export function IntroSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)

  return (
    <SlideShell>
      <div
        className="flex flex-col items-center justify-center gap-9 px-8 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          transition: 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Avatar — gradient ring: gold → rose → amethyst → teal */}
        <div style={{
          padding: 2.5,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C4A860 0%, #A8637A 33%, #7B5EA7 66%, #3D8A8A 100%)',
          boxShadow: '0 0 28px rgba(123,94,167,0.35), 0 0 56px rgba(61,138,138,0.2)',
        }}>
          <div style={{ padding: 2, borderRadius: '50%', background: '#050812' }}>
            <img
              src={stats.user.avatar_url}
              alt={stats.user.login}
              style={{ width: 86, height: 86, borderRadius: '50%', display: 'block' }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p style={{
            fontFamily: 'monospace', fontSize: 11,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(90,172,171,0.75)',
          }}>
            @{stats.user.login}
          </p>

          {/* Headline — iridescent gradient */}
          <div style={{ filter: 'drop-shadow(0 0 22px rgba(123,94,167,0.45))' }}>
            <h1 style={{
              fontFamily: 'var(--font-display, Georgia, serif)',
              fontSize: 'clamp(2.4rem, 9vw, 3.8rem)',
              lineHeight: 1.15,
              margin: 0,
              background: 'linear-gradient(140deg, #C8D6F0 0%, #9B7FD4 45%, #5AACAB 80%, #8EC49E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {stats.year ?? 'Your Year'}<br />in Code
            </h1>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(180,200,235,0.38)' }}>
            {stats.totalRepos} repositories
          </span>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(123,94,167,0.55)' }} />
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(180,200,235,0.38)' }}>
            {stats.languageGroups.length} languages
          </span>
        </div>
      </div>
    </SlideShell>
  )
}
