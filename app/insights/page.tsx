import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/github'
import { getReposWithLanguages } from '@/lib/repos'
import { groupByLanguage, getLanguageColor } from '@/lib/graphData'
import { groupReposByYear, getActiveYears, computeLanguageDelta } from '@/lib/insights'
import { getSuggestions } from '@/lib/growth'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

// ── Year card ──────────────────────────────────────────────────────────────────

function YearCard({
  year,
  repoCount,
  topLanguage,
  topLanguageColor,
  langBreakdown,
  isCurrentYear,
}: {
  year: number
  repoCount: number
  topLanguage: string | null
  topLanguageColor: string
  langBreakdown: Array<{ language: string; color: string; count: number }>
  isCurrentYear: boolean
}) {
  const maxCount = Math.max(...langBreakdown.map(l => l.count), 1)

  return (
    <Link
      href={`/recaps/${year}`}
      className="group flex-shrink-0"
      style={{ width: 176 }}
    >
      <div className="h-full flex flex-col gap-4 rounded-xl p-5 border border-[var(--border)] bg-[var(--surface)] transition-colors group-hover:bg-[var(--surface-raised)]">
        {/* Year + count */}
        <div>
          <span
            className="font-display font-bold leading-none block"
            style={{
              fontSize: 38,
              color: isCurrentYear ? 'var(--accent)' : 'var(--foreground)',
            }}
          >
            {year}
          </span>
          <span className="font-mono text-xs text-[var(--muted)] mt-1 block">
            {repoCount} {repoCount === 1 ? 'repo' : 'repos'}
          </span>
        </div>

        {/* Top language */}
        {topLanguage && (
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: topLanguageColor, flexShrink: 0,
              }}
            />
            <span className="font-mono text-xs text-[var(--muted)] truncate">
              {topLanguage}
            </span>
          </div>
        )}

        {/* Mini language bars */}
        <div className="flex flex-col gap-1.5 flex-1 justify-end">
          {langBreakdown.slice(0, 4).map(l => (
            <div key={l.language} className="flex items-center gap-2">
              <div
                style={{
                  height: 2,
                  width: `${(l.count / maxCount) * 100}%`,
                  background: l.color,
                  opacity: 0.65,
                  minWidth: 4,
                  borderRadius: 1,
                }}
              />
              <span className="font-mono shrink-0 text-[var(--muted)]" style={{ fontSize: 9 }}>
                {l.language}
              </span>
            </div>
          ))}
        </div>

        {/* Hover cue */}
        <span className="font-mono text-xs text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
          View recap →
        </span>
      </div>
    </Link>
  )
}

// ── Delta row ──────────────────────────────────────────────────────────────────

function DeltaRow({
  language,
  color,
  currentCount,
  prevCount,
  delta,
  projectType,
  maxCount,
}: {
  language: string
  color: string
  currentCount: number
  prevCount: number
  delta: number
  projectType: string
  maxCount: number
}) {
  const isNew  = prevCount === 0 && currentCount > 0
  const isGone = currentCount === 0 && prevCount > 0

  const deltaLabel = isNew ? 'new' : (delta > 0 ? `+${delta}` : `${delta}`);
  const deltaColor =
    isNew  || delta > 0 ? '#15803d' :   // green-700
    isGone || delta < 0 ? '#b91c1c' :   // red-700
    'var(--muted)'

    const maxTotal = Math.max(currentCount, prevCount, 1)

  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-[var(--border)] last:border-0">
      {/* Dot + name */}
      <div className="flex items-center gap-2" style={{ width: 136, flexShrink: 0 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span className="font-mono text-xs text-[var(--foreground)] truncate">{language}</span>
      </div>

      {/* Bar */}
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="relative h-1.5 rounded-sm bg-[var(--border)]">
          <div
            className="absolute top-0 z-1 h-full rounded-sm bg-[var(--muted)] opacity-50 mix-blend-lighten"
            style={{
              width: `${(prevCount > 0 ? (prevCount / maxTotal) : ((prevCount+1) / (maxTotal+1))) * 100}%`,
              backgroundColor: prevCount > 0 ? 'var(--muted)' : 'transparent',
            }}
          >
          </div>
          <div
            className="absolute top-0 h-full rounded-sm"
            style={{ width: `${(currentCount > 0 ? (currentCount / maxTotal) : ((currentCount+1) / (maxTotal+1))) * 100}%`, background: color, opacity: 0.7 }}
          />
        </div>
        <span className="font-mono text-[var(--muted)]" style={{ fontSize: 9 }}>{projectType}</span>
      </div>

      {/* Delta */}
      <div className="font-mono text-xs text-right" style={{ width: 36, flexShrink: 0, color: deltaColor }}>
        {deltaLabel}
      </div>
    </div>
  )
}

// ── Growth suggestion card ─────────────────────────────────────────────────────

function SuggestionCard({
  language,
  suggestions,
}: {
  language: string
  suggestions: Array<{ library: string; why: string; tags: string[] }>
}) {
  const color = getLanguageColor(language)

  return (
    <div className="flex flex-col gap-4 rounded-xl p-5 border border-[var(--border)] bg-[var(--surface)]">
      {/* Language header */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xl font-semibold" style={{ color }}>
          {language}
        </span>
      </div>
      <p className="font-mono text-xs text-[var(--muted)] leading-relaxed" style={{ marginTop: -8 }}>
        You ship a lot of {language}. These tools might level up your stack:
      </p>

      <div className="flex flex-col gap-4">
        {suggestions.map(s => (
          <div key={s.library} className="flex flex-col gap-1">
            <span className="font-mono text-sm font-semibold text-[var(--foreground)]">
              {s.library}
            </span>
            <span className="font-mono text-xs text-[var(--muted)] leading-relaxed">
              {s.why}
            </span>
            <div className="flex gap-1.5 flex-wrap mt-1">
              {s.tags.map(tag => (
                <span
                  key={tag}
                  className="font-mono rounded px-1.5 py-0.5 text-[var(--muted)] border border-[var(--border)] bg-[var(--surface-raised)]"
                  style={{ fontSize: 9 }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function InsightsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/')

  const user = await getUser(session.accessToken)
  const withLanguages = await getReposWithLanguages(session.accessToken, user.login)

  const byYear = groupReposByYear(withLanguages)
  const activeYears = getActiveYears(withLanguages, 5)

  const yearCards = activeYears.map(year => {
    const repos = byYear.get(year) ?? []
    const groups = groupByLanguage(repos)
    const topGroup = groups[0]
    return {
      year,
      repoCount: repos.length,
      topLanguage: topGroup?.language ?? null,
      topLanguageColor: topGroup ? topGroup.color : '#6B7280',
      langBreakdown: groups.map(g => ({ language: g.language, color: g.color, count: g.repos.length })),
    }
  })

  const deltaEntries =
    activeYears.length >= 2
      ? computeLanguageDelta(byYear.get(activeYears[0]) ?? [], byYear.get(activeYears[1]) ?? [])
      : []

  const deltaMaxCount = Math.max(...deltaEntries.map(e => Math.max(e.currentCount, e.prevCount)), 1)

  const recentGroups = groupByLanguage(byYear.get(activeYears[0]) ?? withLanguages)
  const topLangs = recentGroups.slice(0, 3).map(g => g.language)
  const suggestions = getSuggestions(topLangs)

  const currentYear = activeYears[0]
  const prevYear    = activeYears[1]

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-14">

        {/* Header */}
        <div className="flex flex-col gap-3">
          <Link
            href="/graph"
            className="flex items-center gap-1.5 w-fit font-mono text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            back to graph
          </Link>

          <div>
            <p className="font-mono text-xs text-[var(--muted)] mb-1.5">@{user.login}&apos;s</p>
            <h1 className="font-display text-[var(--foreground)]" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', lineHeight: 1.15 }}>
              GitHub Insights
            </h1>
          </div>
        </div>

        {/* Year cards */}
        {yearCards.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-xs text-[var(--muted)] uppercase tracking-widest">
              Your GitHub Story
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {yearCards.map((card, i) => (
                <YearCard key={card.year} {...card} isCurrentYear={i === 0} />
              ))}
            </div>
          </section>
        )}

        {/* Language delta */}
        {deltaEntries.length > 0 && prevYear && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-mono text-xs text-[var(--muted)] uppercase tracking-widest">
                Your Stack is Shifting
              </h2>
              <p className="font-mono text-xs text-[var(--muted)]">
                {currentYear} vs {prevYear}
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 font-mono text-[var(--muted)]" style={{ fontSize: 10 }}>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-6 rounded-sm bg-[var(--foreground)]" style={{ opacity: 0.55 }} />
                {currentYear}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-6 rounded-sm bg-[var(--foreground)]" style={{ opacity: 0.18 }} />
                {prevYear}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-1">
              {deltaEntries.map(entry => (
                <DeltaRow key={entry.language} {...entry} maxCount={deltaMaxCount} />
              ))}
            </div>
          </section>
        )}

        {/* Suggested growth */}
        {suggestions.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-white text-lg flex items-center gap-1 tracking-widest">
                  Polaris
                </h2>
              </div>
              <p className="font-mono text-xs text-[var(--muted)]">
                Suggestions for growth based on what you build
              </p>
            </div>

            <div className="grid gap-3">
              {suggestions.map(s => (
                <SuggestionCard key={s.language} language={s.language} suggestions={s.suggestions} />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="border-t border-[var(--border)] pt-4">
          <span className="font-mono text-xs text-[var(--muted)]">butterfly effect</span>
        </div>

      </div>
    </div>
  )
}
