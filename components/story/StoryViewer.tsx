'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { GitHubUser } from '@/types/github'
import type { LanguageGroup } from '@/lib/graphData'
import { getLanguageColor } from '@/lib/graphData'
import type { RepoWithLanguages } from '@/lib/milestones'
import { fetchCommitStats } from '@/app/actions'
import { ProgressBars } from './ProgressBars'
import { IntroSlide } from './slides/IntroSlide'
import { RepoCountSlide } from './slides/RepoCountSlide'
import { LanguageSlide } from './slides/LanguageSlide'
import { CommitSlide } from './slides/CommitSlide'
import { MostStarredSlide } from './slides/MostStarredSlide'
import { LinkedInSlide } from './slides/LinkedInSlide'
import type { StorySlideComponent, StoryStats } from './types'

const SLIDE_DURATION = 8000
const HOLD_THRESHOLD = 200

const SLIDES: StorySlideComponent[] = [
  IntroSlide,
  RepoCountSlide,
  LanguageSlide,
  CommitSlide,
  MostStarredSlide,
  LinkedInSlide,
]

function computeBaseStats(groups: LanguageGroup[], user: GitHubUser): StoryStats {
  const allRepos = groups.flatMap(g => g.repos)

  const last10 = [...allRepos]
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .slice(0, 10)

  const langFreq = new Map<string, { count: number; lastPushed: number }>()
  for (const repo of last10) {
    const lang = repo.dominantLanguage ?? 'Unknown'
    const pushed = new Date(repo.pushed_at).getTime()
    const existing = langFreq.get(lang)
    langFreq.set(lang, {
      count: (existing?.count ?? 0) + 1,
      lastPushed: Math.max(existing?.lastPushed ?? 0, pushed),
    })
  }

  const sortedLangs = [...langFreq.entries()]
    .sort((a, b) => b[1].count - a[1].count || b[1].lastPushed - a[1].lastPushed)

  const favLang = sortedLangs[0]
    ? { name: sortedLangs[0][0], color: getLanguageColor(sortedLangs[0][0]) }
    : null

  const mostStarred = allRepos.reduce<RepoWithLanguages | null>(
    (best, r) => (!best || r.stargazers_count > best.stargazers_count ? r : best),
    null,
  )

  return {
    user,
    totalRepos: allRepos.length,
    languageGroups: groups,
    favoriteLanguage: favLang,
    mostStarredRepo: mostStarred,
    recentLanguages: last10.map(r => r.dominantLanguage ?? 'Unknown'),
    commitStats: null,
    totalCommits: null,
    mostCommittedRepo: null,
  }
}

interface Props {
  groups: LanguageGroup[]
  user: GitHubUser
  year?: number
  onClose: () => void
}

export function StoryViewer({ groups, user, year, onClose }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [stats, setStats] = useState<StoryStats>(() => ({ ...computeBaseStats(groups, user), year }))

  const startRef = useRef(Date.now())
  const pauseAccumRef = useRef(0)
  const pauseStartRef = useRef<number | null>(null)
  const frameRef = useRef<number | undefined>(undefined)
  const currentRef = useRef(0)
  const holdStartRef = useRef(0)

  useEffect(() => { currentRef.current = currentSlide }, [currentSlide])

  // Reset slide timer
  useEffect(() => {
    startRef.current = Date.now()
    pauseAccumRef.current = 0
    pauseStartRef.current = null
    setProgress(0)
  }, [currentSlide])

  // Animation loop
  useEffect(() => {
    if (isPaused) {
      if (pauseStartRef.current === null) pauseStartRef.current = Date.now()
      cancelAnimationFrame(frameRef.current!)
      return
    }
    if (pauseStartRef.current !== null) {
      pauseAccumRef.current += Date.now() - pauseStartRef.current
      pauseStartRef.current = null
    }

    let frame: number
    const tick = () => {
      const elapsed = Date.now() - startRef.current - pauseAccumRef.current
      const p = Math.min(1, elapsed / SLIDE_DURATION)
      setProgress(p)
      if (p < 1) {
        frame = requestAnimationFrame(tick)
        frameRef.current = frame
      } else {
        const next = currentRef.current + 1
        if (next < SLIDES.length) setCurrentSlide(next)
        else onClose()
      }
    }
    frame = requestAnimationFrame(tick)
    frameRef.current = frame
    return () => cancelAnimationFrame(frame)
  }, [currentSlide, isPaused, onClose])

  // Load commit stats asynchronously
  useEffect(() => {
    const allRepos = groups.flatMap(g => g.repos)
    fetchCommitStats(allRepos.map(r => ({ id: r.id, owner: r.owner.login, name: r.name })))
      .then(results => {
        const repoMap = new Map(allRepos.map(r => [r.id, r]))
        const totalCommits = results.reduce((s, r) => s + r.count, 0)
        const mostCommitted = results.reduce<{ name: string; count: number } | null>((best, r) => {
          const repo = repoMap.get(r.id)
          if (!repo || r.count === 0) return best
          return !best || r.count > best.count ? { name: repo.name, count: r.count } : best
        }, null)
        setStats(prev => ({
          ...prev,
          commitStats: results.map(r => {
            const repo = repoMap.get(r.id)
            return { repoId: r.id, owner: repo?.owner.login ?? '', name: repo?.name ?? '', count: r.count }
          }),
          totalCommits,
          mostCommittedRepo: mostCommitted,
        }))
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const goBack = useCallback(() => {
    setCurrentSlide(s => Math.max(0, s - 1))
  }, [])

  const goForward = useCallback(() => {
    const next = currentRef.current + 1
    if (next < SLIDES.length) setCurrentSlide(next)
    else onClose()
  }, [onClose])

  // Arrow key + Escape navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goBack() }
      if (e.key === 'ArrowRight') { e.preventDefault(); goForward() }
      if (e.key === 'Escape')     { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goBack, goForward, onClose])

  function handleDown() {
    holdStartRef.current = Date.now()
    setIsPaused(true)
  }

  function handleUp(isLeft: boolean) {
    const held = Date.now() - holdStartRef.current
    setIsPaused(false)
    if (held < HOLD_THRESHOLD) {
      if (isLeft) goBack()
      else goForward()
    }
  }

  const Slide = SLIDES[currentSlide]

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col select-none"
      style={{
        background: [
          'radial-gradient(ellipse at 18% 82%, rgba(123,94,167,0.10) 0%, transparent 52%)',
          'radial-gradient(ellipse at 82% 18%, rgba(61,138,138,0.10) 0%, transparent 52%)',
          'radial-gradient(ellipse at 50% 35%, #0c1828 0%, #070e1c 48%, #030609 100%)',
        ].join(', '),
      }}
    >
      {/* Progress bars */}
      <div className="relative z-10 flex flex-col gap-3 px-4 pt-4">
        <ProgressBars count={SLIDES.length} current={currentSlide} progress={progress} />

        {/* Header row */}
        <div className="flex items-center gap-2">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="h-6 w-6 rounded-full ring-1 ring-white/20"
          />
          <span className="font-mono text-xs text-white/50">@{user.login}</span>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="flex items-center justify-center h-7 w-7 rounded-full transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Slide */}
      <div className="flex-1 relative overflow-hidden">
        <Slide key={currentSlide} stats={stats} isActive progress={progress} />

        {/* Navigation / pause zones — left half goes back, right half goes forward */}
        <div className="absolute inset-0 flex pointer-events-none">
          <div
            className="flex-1 pointer-events-auto"
            onMouseDown={handleDown}
            onMouseUp={() => handleUp(true)}
            onTouchStart={handleDown}
            onTouchEnd={() => handleUp(true)}
          />
          <div
            className="flex-1 pointer-events-auto"
            onMouseDown={handleDown}
            onMouseUp={() => handleUp(false)}
            onTouchStart={handleDown}
            onTouchEnd={() => handleUp(false)}
          />
        </div>
      </div>
    </div>
  )
}
