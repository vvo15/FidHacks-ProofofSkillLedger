import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/github'
import { getReposWithLanguages } from '@/lib/repos'
import { groupByLanguage } from '@/lib/graphData'
import { GraphView } from '@/components/graph/GraphView'

export default async function GraphPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/')

  const user = await getUser(session.accessToken)
  const withLanguages = await getReposWithLanguages(session.accessToken, user.login)

  const groups = groupByLanguage(withLanguages)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)]">
      <GraphView groups={groups} user={user} />
    </div>
  )
}
