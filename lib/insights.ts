import type { RepoWithLanguages } from './milestones'
import { getLanguageColor } from './graphData'

export function groupReposByYear(repos: RepoWithLanguages[]): Map<number, RepoWithLanguages[]> {
  const map = new Map<number, RepoWithLanguages[]>()
  for (const repo of repos) {
    const year = new Date(repo.pushed_at).getFullYear()
    const existing = map.get(year) ?? []
    existing.push(repo)
    map.set(year, existing)
  }
  return map
}

export function getActiveYears(
  repos: RepoWithLanguages[],
  maxYears = 5,
): number[] {
  const byYear = groupReposByYear(repos)
  const currentYear = new Date().getFullYear()
  const candidates = Array.from({ length: maxYears }, (_, i) => currentYear - i)
  return candidates.filter(y => (byYear.get(y)?.length ?? 0) > 0)
}

// ── Language delta ────────────────────────────────────────────────────────────

export interface LanguageDeltaEntry {
  language: string
  color: string
  currentCount: number
  prevCount: number
  delta: number
  projectType: string
}

const LANG_PROJECT_TYPE: Record<string, string> = {
  TypeScript: 'web / fullstack',
  JavaScript: 'web / scripting',
  Python: 'data science / ML',
  Rust: 'systems / performance',
  Go: 'backend / CLIs',
  Java: 'backend / enterprise',
  'C++': 'systems / game dev',
  C: 'systems / embedded',
  Ruby: 'web backend',
  Swift: 'iOS / macOS',
  Kotlin: 'Android / JVM',
  PHP: 'web backend',
  'C#': '.NET / game dev',
  Dart: 'cross-platform mobile',
  Vue: 'web frontend',
  Svelte: 'web frontend',
  Elixir: 'distributed / functional',
  Haskell: 'functional / academic',
  Scala: 'data engineering',
  R: 'data science / statistics',
  Shell: 'devops / scripting',
  Lua: 'scripting / game dev',
  Zig: 'systems / low-level',
}

export function getProjectType(language: string): string {
  return LANG_PROJECT_TYPE[language] ?? 'general development'
}

export function computeLanguageDelta(
  currentRepos: RepoWithLanguages[],
  prevRepos: RepoWithLanguages[],
): LanguageDeltaEntry[] {
  const count = (repos: RepoWithLanguages[]) => {
    const map = new Map<string, number>()
    for (const r of repos) {
      const lang = r.dominantLanguage ?? 'Unknown'
      map.set(lang, (map.get(lang) ?? 0) + 1)
    }
    return map
  }

  const current = count(currentRepos)
  const prev = count(prevRepos)
  const all = new Set([...current.keys(), ...prev.keys()])

  return [...all]
    .map(lang => ({
      language: lang,
      color: getLanguageColor(lang),
      currentCount: current.get(lang) ?? 0,
      prevCount: prev.get(lang) ?? 0,
      delta: (current.get(lang) ?? 0) - (prev.get(lang) ?? 0),
      projectType: getProjectType(lang),
    }))
    .filter(e => e.currentCount > 0 || e.prevCount > 0)
    .sort((a, b) => b.currentCount - a.currentCount || Math.abs(b.delta) - Math.abs(a.delta))
}
