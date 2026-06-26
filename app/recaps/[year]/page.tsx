import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/github'
import { getReposWithLanguages } from '@/lib/repos'
import { groupByLanguage } from '@/lib/graphData'
import { groupReposByYear } from '@/lib/insights'
import { RecapClient } from './RecapClient'

export default async function RecapPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const { year: yearStr } = await params
  const year = parseInt(yearStr, 10)
  if (isNaN(year) || year < 2000 || year > 2100) redirect('/insights')

  const session = await auth()
  if (!session?.accessToken) redirect('/')

  const user = await getUser(session.accessToken)
  const withLanguages = await getReposWithLanguages(session.accessToken, user.login)

  const byYear = groupReposByYear(withLanguages)
  const yearRepos = byYear.get(year) ?? []
  if (yearRepos.length === 0) redirect('/insights')

  const groups = groupByLanguage(yearRepos)

  return <RecapClient groups={groups} user={user} year={year} />
}
