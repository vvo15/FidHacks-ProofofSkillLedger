'use server'

import { signIn, signOut } from '@/auth'
import { auth } from '@/auth'
import { getUser } from '@/lib/github'

export async function signInWithGitHub() {
  await signIn('github', { redirectTo: '/graph' })
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' })
}

export async function fetchCommitStats(
  repos: Array<{ id: number; owner: string; name: string }>,
): Promise<Array<{ id: number; count: number }>> {
  const session = await auth()
  if (!session?.accessToken) return []

  const token = session.accessToken
  const user = await getUser(token)

  const results = await Promise.allSettled(
    repos.map(async ({ id, owner, name }) => {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${name}/commits?author=${user.login}&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
          next: { revalidate: 3600 },
        },
      )
      if (!res.ok) return { id, count: 0 }
      const data = (await res.json()) as unknown[]
      return { id, count: data.length }
    }),
  )

  return results
    .filter(
      (r): r is PromiseFulfilledResult<{ id: number; count: number }> =>
        r.status === 'fulfilled',
    )
    .map(r => r.value)
}
