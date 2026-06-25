import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAllRepos, getRepoLanguages, getUser } from '@/lib/github'
import { getDominantLanguage } from '@/lib/milestones'
import { groupByLanguage } from '@/lib/graphData'
import { GraphView } from '@/components/graph/GraphView'

export default async function GraphPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/')

  const [user, repos] = await Promise.all([
    getUser(session.accessToken),
    getAllRepos(session.accessToken),
  ])

  // Only include repos the user owns or has push access to (proxy for "pushed a commit")
  const owned = repos.filter(r =>
    r.owner.login === user.login || r.permissions?.push === true
  ).slice(0, 80)

  const withLanguages = await Promise.all(
    owned.map(async (repo) => {
      try {
        const languages = await getRepoLanguages(
          session.accessToken!,
          repo.owner.login,
          repo.name,
        )
        return { ...repo, languages, dominantLanguage: getDominantLanguage(languages) }
      } catch {
        return { ...repo, languages: {}, dominantLanguage: null }
      }
    }),
  )

  const groups = groupByLanguage(withLanguages)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)]">
      <GraphView groups={groups} user={user} />
    </div>
  )
}
