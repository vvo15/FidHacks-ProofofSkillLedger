import type { GitHubRepo, GitHubUser, LanguageBreakdown } from '@/types/github'

const GH_API = 'https://api.github.com'

async function ghFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${GH_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export async function getUser(token: string): Promise<GitHubUser> {
  return ghFetch<GitHubUser>('/user', token)
}

export async function getAllRepos(token: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = []
  let page = 1
  while (true) {
    const batch = await ghFetch<GitHubRepo[]>(
      `/user/repos?per_page=100&page=${page}&sort=pushed&direction=desc&visibility=public`,
      token,
    )
    repos.push(...batch)
    if (batch.length < 100) break
    page++
  }
  return repos.filter((r) => !r.fork)
}

export async function getRepoLanguages(
  token: string,
  owner: string,
  repo: string,
): Promise<LanguageBreakdown> {
  return ghFetch<LanguageBreakdown>(`/repos/${owner}/${repo}/languages`, token)
}
