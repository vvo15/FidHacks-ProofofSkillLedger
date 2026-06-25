import type { GitHubRepo, GitHubUser, LanguageBreakdown, Milestone } from '@/types/github'

export interface RepoWithLanguages extends GitHubRepo {
  languages: LanguageBreakdown
  dominantLanguage: string | null
}

export function getDominantLanguage(languages: LanguageBreakdown): string | null {
  const entries = Object.entries(languages)
  if (entries.length === 0) return null
  return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0]
}

export function computeMilestones(
  repos: RepoWithLanguages[],
  user: GitHubUser,
): Milestone[] {
  if (repos.length === 0) return []

  const sorted = [...repos].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const milestones: Milestone[] = []

  // First repository ever
  const firstRepo = sorted[0]
  milestones.push({
    id: 'first-repo',
    title: 'Hello, World.',
    description: `Your first repository: ${firstRepo.name}`,
    iconName: 'Rocket',
    repo: firstRepo,
    value: new Date(firstRepo.created_at).getFullYear(),
    accent: '#4F46E5',
  })

  // First repo per language (top 5 by distinct languages, ordered by first occurrence)
  const seenLanguages = new Set<string>()
  for (const repo of sorted) {
    if (!repo.dominantLanguage || seenLanguages.has(repo.dominantLanguage)) continue
    seenLanguages.add(repo.dominantLanguage)
    milestones.push({
      id: `first-lang-${repo.dominantLanguage}`,
      title: `First ${repo.dominantLanguage} Project`,
      description: repo.name,
      iconName: 'Code2',
      repo,
      value: repo.dominantLanguage,
      accent: '#0EA5E9',
    })
    if (seenLanguages.size >= 5) break
  }

  // Most starred repo
  const mostStarred = [...repos].sort(
    (a, b) => b.stargazers_count - a.stargazers_count,
  )[0]
  if (mostStarred.stargazers_count > 0) {
    milestones.push({
      id: 'most-starred',
      title: 'Fan Favourite',
      description: `${mostStarred.name} earned ${mostStarred.stargazers_count} stars`,
      iconName: 'Star',
      repo: mostStarred,
      value: mostStarred.stargazers_count,
      accent: '#F59E0B',
    })
  }

  // Polyglot milestone
  const languageCount = new Set(repos.map((r) => r.dominantLanguage).filter(Boolean)).size
  if (languageCount >= 3) {
    milestones.push({
      id: 'polyglot',
      title: 'Polyglot',
      description: `You've shipped projects in ${languageCount} different languages`,
      iconName: 'Globe2',
      value: languageCount,
      accent: '#10B981',
    })
  }

  // Account age
  const accountAge = new Date().getFullYear() - new Date(user.created_at).getFullYear()
  if (accountAge >= 1) {
    milestones.push({
      id: 'account-age',
      title: 'GitHub Veteran',
      description: `You've been shipping for ${accountAge} year${accountAge > 1 ? 's' : ''}`,
      iconName: 'CalendarDays',
      value: accountAge,
      accent: '#8B5CF6',
    })
  }

  // Prolific
  milestones.push({
    id: 'prolific',
    title: 'Prolific',
    description: `${repos.length} original public repositories and counting`,
    iconName: 'Library',
    value: repos.length,
    accent: '#EC4899',
  })

  return milestones
}
