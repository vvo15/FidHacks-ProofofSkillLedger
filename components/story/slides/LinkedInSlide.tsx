'use client'

import { useState } from 'react'
import { useMountTransition } from '../hooks'
import { SlideShell } from '../SlideShell'
import type { StorySlideProps, StoryStats } from '../types'

function generatePost(stats: StoryStats): string {
  const lines: string[] = []

  const yearLabel = stats.year ? `${stats.year} ` : ''
  lines.push(`🦋 ${yearLabel}GitHub Wrapped`)
  lines.push('')

  const langCount = stats.languageGroups.length
  lines.push(
    `📦 ${stats.totalRepos} ${stats.totalRepos === 1 ? 'repository' : 'repositories'} across ${langCount} ${langCount === 1 ? 'language' : 'languages'}`,
  )

  if (stats.favoriteLanguage) {
    lines.push(`💻 Signature language: ${stats.favoriteLanguage.name}`)
  }

  if (stats.mostStarredRepo && stats.mostStarredRepo.stargazers_count > 0) {
    lines.push(
      `⭐ Most starred: ${stats.mostStarredRepo.name} (${stats.mostStarredRepo.stargazers_count} ★)`,
    )
  }

  if (stats.totalCommits !== null && stats.totalCommits > 0) {
    lines.push(`🔢 ${stats.totalCommits.toLocaleString()} commits`)
  }

  lines.push('')

  const taglines = [
    'Building in public, one commit at a time.',
    'The code never lies.',
    'Shipping is a habit.',
    'Another year in the IDE.',
  ]
  lines.push(taglines[stats.totalRepos % taglines.length])
  lines.push('')

  const tags = ['#GitHub', '#OpenSource', '#Developer']
  if (stats.favoriteLanguage) {
    tags.push(`#${stats.favoriteLanguage.name.replace(/[^a-zA-Z0-9]/g, '')}`)
  }
  tags.push('#BuildInPublic')
  lines.push(tags.join(' '))

  return lines.join('\n')
}

export function LinkedInSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const [copied, setCopied] = useState(false)
  const post = generatePost(stats)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(post)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // clipboard not available — nothing to do gracefully
    }
  }

  return (
    <SlideShell>
      <div
        className="flex flex-col items-center justify-center gap-6 px-6 w-full"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
          paddingBottom: 110,
        }}
      >
        <p
          style={{
            fontFamily: 'monospace', fontSize: 12,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(196,208,232,0.5)',
          }}
        >
          share your story
        </p>

        {/* Post preview card */}
        <div
          className="w-full rounded-2xl text-left"
          style={{
            maxWidth: 360,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '18px 20px',
          }}
        >
          {/* Mock LinkedIn profile row */}
          <div className="flex items-center gap-2.5" style={{ marginBottom: 12 }}>
            <img
              src={stats.user.avatar_url}
              alt=""
              style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.15)',
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: 'sans-serif', fontSize: 12,
                  color: 'rgba(196,208,232,0.85)', fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {stats.user.name ?? stats.user.login}
              </div>
              <div
                style={{ fontFamily: 'sans-serif', fontSize: 10, color: 'rgba(196,208,232,0.35)' }}
              >
                Just now
              </div>
            </div>
          </div>

          {/* Post body */}
          <pre
            style={{
              fontFamily: 'monospace', fontSize: 11,
              lineHeight: 1.75,
              color: 'rgba(196,208,232,0.68)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
            }}
          >
            {post}
          </pre>
        </div>
      </div>

      {/*
        Fixed position so this button sits above the navigation-zone overlay divs
        that cover the slide area with pointer-events: auto. The nav zones have no
        explicit z-index; position: fixed creates a new stacking context at z-200
        which wins regardless of the overlay order inside the StoryViewer.
      */}
      <div
        style={{
          position: 'fixed',
          bottom: 44,
          left: '50%',
          transform: `translateX(-50%) scale(${visible ? 1 : 0.88})`,
          zIndex: 200,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <button
          onClick={handleCopy}
          style={{
            fontFamily: 'monospace', fontSize: 13,
            padding: '11px 28px',
            borderRadius: 100,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(14px)',
            transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease',
            border: copied
              ? '1px solid rgba(61,138,138,0.55)'
              : '1px solid rgba(123,94,167,0.55)',
            background: copied
              ? 'rgba(61,138,138,0.18)'
              : 'rgba(123,94,167,0.18)',
            color: copied
              ? 'rgba(94,158,142,0.95)'
              : 'rgba(155,127,212,0.95)',
            boxShadow: copied
              ? '0 0 24px rgba(61,138,138,0.3)'
              : '0 0 24px rgba(123,94,167,0.3)',
          }}
        >
          {copied ? '✓  copied to clipboard' : 'Copy LinkedIn post'}
        </button>
      </div>
    </SlideShell>
  )
}
