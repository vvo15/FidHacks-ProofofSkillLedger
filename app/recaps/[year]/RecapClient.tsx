'use client'

import { useRouter } from 'next/navigation'
import { StoryViewer } from '@/components/story/StoryViewer'
import type { GitHubUser } from '@/types/github'
import type { LanguageGroup } from '@/lib/graphData'

interface Props {
  groups: LanguageGroup[]
  prevYearGroups: LanguageGroup[]
  user: GitHubUser
  year: number
}

export function RecapClient({ groups, prevYearGroups, user, year }: Props) {
  const router = useRouter()
  return (
    <StoryViewer
      groups={groups}
      prevYearGroups={prevYearGroups}
      user={user}
      year={year}
      onClose={() => router.push('/insights')}
    />
  )
}
