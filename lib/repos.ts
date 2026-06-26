import { getAllRepos, getRepoLanguages } from './github'
import { getDominantLanguage, type RepoWithLanguages } from './milestones'

export async function getReposWithLanguages(
  token: string,
  userLogin: string,
): Promise<RepoWithLanguages[]> {
  const repos = await getAllRepos(token)
  const owned = repos
    .filter(r => r.owner.login === userLogin || r.permissions?.push === true)
    .slice(0, 80)

  return Promise.all(
    owned.map(async repo => {
      try {
        const languages = await getRepoLanguages(token, repo.owner.login, repo.name)
        return { ...repo, languages, dominantLanguage: getDominantLanguage(languages) }
      } catch {
        return { ...repo, languages: {}, dominantLanguage: null }
      }
    }),
  )
}
