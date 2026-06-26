'use client'

import { useState } from 'react'
import { SlideShell } from '../SlideShell'
import { useMountTransition } from '../hooks'
import type { StorySlideProps, StoryStats, Archetype } from '../types'

function computeArchetype(stats: StoryStats): Archetype {
  const langCount = stats.languageGroups.length
  const commits = stats.totalCommits ?? 0
  const streak = stats.longestStreak ?? 0
  const reviews = stats.reviewsGiven ?? 0
  const newLangs = stats.newLanguages?.length ?? 0
  const forks = stats.mostForkedRepo?.forks ?? 0
  const moonshot = stats.moonshotPR?.filesChanged ?? 0
  const hasRefactor = !!stats.biggestRefactor
  const issues = stats.issuesClosed ?? 0

  const traits: string[] = []
  if (commits > 500)     traits.push('prolific committer')
  else if (commits > 100) traits.push('consistent coder')
  if (streak > 30)       traits.push('marathon builder')
  if (langCount >= 5)    traits.push('polyglot dev')
  if (newLangs > 0)      traits.push('language explorer')
  if (reviews > 50)      traits.push('code mentor')
  if (hasRefactor)       traits.push('refactor artist')
  if (forks > 5)         traits.push('open source contributor')
  if (moonshot > 30)     traits.push('bold architect')
  if (issues > 20)       traits.push('bug slayer')
  if (traits.length === 0) traits.push('steady builder', 'reliable shipper')

  const top3 = traits.slice(0, 3)

  if (reviews >= 100) return { title: 'The Code Sensei', emoji: '🏮', traits: top3, description: 'You make every team better. Your reviews are the ones developers actually look forward to.' }
  if (streak > 30 && hasRefactor) return { title: 'The Midnight Refactorer', emoji: '🦋', traits: top3, description: 'You ship clean code at all hours. Your git history is a meditation on quality.' }
  if (langCount >= 5 && newLangs > 0) return { title: 'The Language Collector', emoji: '🗺️', traits: top3, description: "Why pick one language when you can master them all? Curiosity is your superpower." }
  if (forks > 10) return { title: 'The Open Source Explorer', emoji: '🌿', traits: top3, description: 'Your code travels far. Other developers build their dreams on top of yours.' }
  if (moonshot > 30) return { title: 'The Bold Architect', emoji: '🏗️', traits: top3, description: 'Your PRs move mountains. When you ship, everyone notices.' }
  if (newLangs > 1) return { title: 'The Curious Builder', emoji: '🔭', traits: top3, description: "Always learning, always shipping. The unknown is just an opportunity you haven't taken yet." }
  if (hasRefactor || issues > 20) return { title: 'The Clean Code Craftsman', emoji: '✨', traits: top3, description: 'You delete code like it\'s art. Less is more, and your codebase proves it.' }
  if (commits > 300) return { title: 'The Relentless Shipper', emoji: '🚀', traits: top3, description: 'Commit by commit, you build mountains. Consistency is your silent superpower.' }
  return { title: 'The Steady Builder', emoji: '🛠️', traits: top3, description: 'Consistent, reliable, always delivering. The backbone of every great engineering team.' }
}

function generatePost(stats: StoryStats, archetype: Archetype): string {
  const yearLabel = stats.year ? `${stats.year} ` : ''
  const lines: string[] = [
    `🦋 ${yearLabel}GitHub Wrapped`,
    '',
    `${archetype.emoji} ${archetype.title}`,
    archetype.description,
    '',
  ]
  if (stats.totalCommits) lines.push(`📦 ${stats.totalCommits.toLocaleString()} commits across ${stats.totalRepos} repos`)
  if (stats.favoriteLanguage) lines.push(`💻 Signature language: ${stats.favoriteLanguage.name}`)
  if (stats.mostStarredRepo?.stargazers_count) lines.push(`⭐ Most starred: ${stats.mostStarredRepo.name} (${stats.mostStarredRepo.stargazers_count} ★)`)
  if (stats.longestStreak) lines.push(`🔥 Longest streak: ${stats.longestStreak} days`)
  lines.push('', '#GitHub #BuildInPublic #Developer' + (stats.favoriteLanguage ? ` #${stats.favoriteLanguage.name.replace(/[^a-zA-Z0-9]/g, '')}` : ''))
  return lines.join('\n')
}

export function DevArchetypeSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const [copied, setCopied] = useState(false)
  const archetype = computeArchetype(stats)
  const post = generatePost(stats, archetype)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(post)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <SlideShell>
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          padding: '0 28px', paddingBottom: 100,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.38)', margin: 0 }}>
          dev archetype · visual #12
        </p>

        {/* Emoji */}
        <div style={{
          fontSize: 64, lineHeight: 1, marginTop: 4,
          animation: 'butterflyFloat 5s ease-in-out infinite',
          filter: 'drop-shadow(0 0 20px rgba(155,127,212,0.5))',
        }}>
          {archetype.emoji}
        </div>

        {/* Title */}
        <p
          style={{
            fontFamily: 'monospace', fontSize: 22, fontWeight: 700, lineHeight: 1.2,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #C4A060 0%, #A8637A 40%, #9B7FD4 70%, #3D8A8A 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            margin: 0,
          }}
        >
          {archetype.title}
        </p>

        {/* Description */}
        <p style={{
          fontFamily: 'monospace', fontSize: 12,
          color: 'rgba(196,208,232,0.55)',
          textAlign: 'center', lineHeight: 1.65,
          margin: 0, maxWidth: 270,
        }}>
          {archetype.description}
        </p>

        {/* Trait chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 280, marginTop: 4 }}>
          {archetype.traits.map(trait => (
            <span
              key={trait}
              style={{
                fontFamily: 'monospace', fontSize: 9,
                padding: '4px 10px', borderRadius: 100,
                border: '1px solid rgba(155,127,212,0.3)',
                color: 'rgba(196,208,232,0.5)',
                background: 'rgba(155,127,212,0.07)',
              }}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Copy-to-clipboard button — fixed to escape nav-zone overlay */}
      <div
        style={{
          position: 'fixed', bottom: 44, left: '50%',
          transform: `translateX(-50%) scale(${visible ? 1 : 0.88})`,
          zIndex: 200,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <button
          onClick={handleCopy}
          style={{
            fontFamily: 'monospace', fontSize: 13,
            padding: '11px 28px', borderRadius: 100,
            cursor: 'pointer', whiteSpace: 'nowrap',
            backdropFilter: 'blur(14px)',
            transition: 'background 0.3s, border-color 0.3s, color 0.3s, box-shadow 0.3s',
            border: copied ? '1px solid rgba(61,138,138,0.55)' : '1px solid rgba(123,94,167,0.55)',
            background: copied ? 'rgba(61,138,138,0.18)' : 'rgba(123,94,167,0.18)',
            color: copied ? 'rgba(94,158,142,0.95)' : 'rgba(155,127,212,0.95)',
            boxShadow: copied ? '0 0 24px rgba(61,138,138,0.3)' : '0 0 24px rgba(123,94,167,0.3)',
          }}
        >
          {copied ? '✓  copied to clipboard' : 'Copy wrapped post'}
        </button>
      </div>
    </SlideShell>
  )
}
