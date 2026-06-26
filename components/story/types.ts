import type { GitHubUser } from '@/types/github'
import type { LanguageGroup } from '@/lib/graphData'
import type { RepoWithLanguages } from '@/lib/milestones'

export interface CommitStat {
  repoId: number
  owner: string
  name: string
  count: number
}

export interface WeeklyCommit {
  weekStart: string
  count: number
}

export interface StackLayer {
  language: string
  color: string
  pct: number
}

export interface Archetype {
  title: string
  emoji: string
  traits: string[]
  description: string
}

export interface StoryStats {
  user: GitHubUser
  year?: number

  // Core repo stats (computed immediately)
  totalRepos: number
  languageGroups: LanguageGroup[]
  favoriteLanguage: { name: string; color: string } | null
  mostStarredRepo: RepoWithLanguages | null
  recentLanguages: string[]

  // Commit stats (async — fetchCommitStats)
  commitStats: CommitStat[] | null
  totalCommits: number | null
  mostCommittedRepo: { name: string; count: number } | null

  // Slide 1: Commit Confetti (async — fetchActivityData)
  weeklyCommits: WeeklyCommit[] | null

  // Slide 2: Bug Slayer (async — fetchSearchStats)
  issuesClosed: number | null
  fastestFix: { repo: string; hours: number } | null

  // Slide 3: Green Streak (async — fetchActivityData)
  currentStreak: number | null
  longestStreak: number | null

  // Slide 4: Language Unlocked (computed immediately from prevYearGroups)
  newLanguages: string[] | null

  // Slide 5: First PR Merged (async — fetchSearchStats)
  firstPR: { date: string; repo: string; title: string } | null

  // Slide 6: Biggest Refactor (async — fetchSearchStats)
  biggestRefactor: { repo: string; message: string; sha: string } | null

  // Slide 7: Lab Count (computed immediately)
  newReposCount: number
  mostForkedRepo: { name: string; forks: number } | null

  // Slide 8: Collab Spark (async — fetchCollabData)
  collabSparkRepo: { name: string; contributorCount: number } | null

  // Slide 9: Moonshot Moment (async — fetchActivityData)
  moonshotPR: { repo: string; filesChanged: number; title: string } | null

  // Slide 10: Stack Evolution (computed immediately from Q1 vs Q4 repos)
  stackEvolution: { before: StackLayer[]; after: StackLayer[] } | null

  // Slide 11: Review Rank (async — fetchSearchStats)
  reviewsGiven: number | null

  // Slide 12: Dev Archetype (computed in slide from all available stats)
  archetype: Archetype | null
}

export interface StorySlideProps {
  stats: StoryStats
  isActive: boolean
  progress: number
}

export type StorySlideComponent = React.ComponentType<StorySlideProps>
