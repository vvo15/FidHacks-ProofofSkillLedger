import type { GitHubUser } from '@/types/github'
import type { LanguageGroup } from '@/lib/graphData'
import type { RepoWithLanguages } from '@/lib/milestones'

export interface CommitStat {
  repoId: number
  owner: string
  name: string
  count: number
}

export interface StoryStats {
  user: GitHubUser
  year?: number
  totalRepos: number
  languageGroups: LanguageGroup[]
  favoriteLanguage: { name: string; color: string } | null
  mostStarredRepo: RepoWithLanguages | null
  recentLanguages: string[]
  commitStats: CommitStat[] | null
  totalCommits: number | null
  mostCommittedRepo: { name: string; count: number } | null
}

export interface StorySlideProps {
  stats: StoryStats
  isActive: boolean
  progress: number
}

export type StorySlideComponent = React.ComponentType<StorySlideProps>
