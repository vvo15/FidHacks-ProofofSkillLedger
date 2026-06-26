'use client'

import { useRouter } from 'next/navigation'
import { StoryViewer } from '@/components/story/StoryViewer'
import type { GitHubUser } from '@/types/github'
import type { LanguageGroup } from '@/lib/graphData'

interface Props {
  groups: LanguageGroup[]
  user: GitHubUser
  year: number
}

export function RecapClient({ groups, user, year }: Props) {
  const router = useRouter()
  return (
    <StoryViewer
      groups={groups}
      user={user}
      year={year}
      onClose={() => router.push('/insights')}
    />
  )
}
