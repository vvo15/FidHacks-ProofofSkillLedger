'use client'

import { motion, AnimatePresence } from 'motion/react'
import { X, Star, GitFork, AlertCircle, ExternalLink, Calendar, Tag } from 'lucide-react'
import type { RepoWithLanguages } from '@/lib/milestones'
import { getLanguageColor, getLanguagePercent } from '@/lib/graphData'

interface RepoPanelProps {
  repo: RepoWithLanguages | null
  onClose: () => void
}

export function RepoPanel({ repo, onClose }: RepoPanelProps) {
  return (
    <AnimatePresence>
      {repo && (
        <motion.aside
          key={repo.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="absolute right-0 top-0 h-full w-[360px] flex flex-col bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl z-10 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-5 border-b border-[var(--border)] sticky top-0 bg-[var(--surface)]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                repository
              </span>
              <h2 className="font-display text-xl text-[var(--foreground)] truncate leading-snug">
                {repo.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="mt-1 flex-shrink-0 rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-6 p-5">
            {/* Description */}
            {repo.description && (
              <p className="font-sans text-sm text-[var(--muted)] leading-relaxed">
                {repo.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-5">
              <Stat icon={<Star className="h-3.5 w-3.5" />} label={repo.stargazers_count} />
              <Stat icon={<GitFork className="h-3.5 w-3.5" />} label={repo.forks_count} />
              <Stat icon={<AlertCircle className="h-3.5 w-3.5" />} label={repo.open_issues_count} />
            </div>

            {/* Language breakdown */}
            {Object.keys(repo.languages).length > 0 && (
              <div className="flex flex-col gap-2.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  languages
                </span>
                <LanguageBar languages={repo.languages} />
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {getLanguagePercent(repo.languages).map(({ language, pct }) => (
                    <div key={language} className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getLanguageColor(language) }}
                      />
                      <span className="font-sans text-xs text-[var(--foreground)]">{language}</span>
                      <span className="font-mono text-[10px] text-[var(--muted)]">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                timeline
              </span>
              <div className="flex flex-col gap-1.5">
                <DateRow label="Created" date={repo.created_at} />
                <DateRow label="Last push" date={repo.pushed_at} />
              </div>
            </div>

            {/* Topics */}
            {repo.topics.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] flex items-center gap-1.5">
                  <Tag className="h-3 w-3" />
                  topics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {repo.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--foreground)]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Link */}
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 font-sans text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function Stat({ icon, label }: { icon: React.ReactNode; label: number }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--muted)]">
      {icon}
      <span>{label}</span>
    </div>
  )
}

function DateRow({ label, date }: { label: string; date: string }) {
  const formatted = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return (
    <div className="flex items-center gap-2 font-sans text-xs">
      <Calendar className="h-3.5 w-3.5 text-[var(--muted)] flex-shrink-0" />
      <span className="text-[var(--muted)]">{label}</span>
      <span className="text-[var(--foreground)]">{formatted}</span>
    </div>
  )
}

function LanguageBar({ languages }: { languages: Record<string, number> }) {
  const percents = getLanguagePercent(languages)
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full gap-px">
      {percents.map(({ language, pct }) => (
        <div
          key={language}
          style={{ width: `${pct}%`, backgroundColor: getLanguageColor(language) }}
          title={`${language}: ${pct}%`}
        />
      ))}
    </div>
  )
}
