import { auth } from '@/auth'
import { getAllRepos, getRepoLanguages } from '@/lib/github'
import { getDominantLanguage } from '@/lib/milestones'

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const repos = await getAllRepos(session.accessToken)
  const limited = repos.slice(0, 60)

  const withLanguages = await Promise.all(
    limited.map(async (repo) => {
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

  return Response.json(withLanguages)
}
