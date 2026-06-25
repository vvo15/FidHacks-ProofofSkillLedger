import type { LanguageBreakdown } from '@/types/github'
import type { RepoWithLanguages } from './milestones'

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  PHP: '#4F5D95',
  'C#': '#178600',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  R: '#198CE7',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Lua: '#000080',
  Zig: '#ec915c',
  Nix: '#7e7eff',
}

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? '#6B7280'
}

export interface LanguageGroup {
  language: string
  color: string
  repos: RepoWithLanguages[]
}

export function groupByLanguage(repos: RepoWithLanguages[]): LanguageGroup[] {
  const map = new Map<string, RepoWithLanguages[]>()

  for (const repo of repos) {
    const lang = repo.dominantLanguage ?? 'Unknown'
    const existing = map.get(lang) ?? []
    existing.push(repo)
    map.set(lang, existing)
  }

  return Array.from(map.entries())
    .map(([language, groupRepos]) => ({
      language,
      color: getLanguageColor(language),
      repos: groupRepos.sort((a, b) => b.stargazers_count - a.stargazers_count),
    }))
    .sort((a, b) => b.repos.length - a.repos.length)
}

export function getLanguagePercent(languages: LanguageBreakdown): { language: string; pct: number }[] {
  const total = Object.values(languages).reduce((s, n) => s + n, 0)
  if (total === 0) return []
  return Object.entries(languages)
    .map(([language, bytes]) => ({ language, pct: Math.round((bytes / total) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6)
}
