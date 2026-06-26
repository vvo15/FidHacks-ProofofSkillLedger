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

// ── Helpers ────────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): string {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() - d.getUTCDay())
  return d.toISOString().slice(0, 10)
}

function computeStreak(
  days: string[],
  today: string,
): { currentStreak: number; longestStreak: number } {
  if (days.length === 0) return { currentStreak: 0, longestStreak: 0 }
  const sorted = [...new Set(days)].sort()
  let longestStreak = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round(
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86_400_000,
    )
    if (diff === 1) { run++; if (run > longestStreak) longestStreak = run }
    else run = 1
  }
  const daysSinceLast = Math.round(
    (new Date(today).getTime() - new Date(sorted[sorted.length - 1]).getTime()) / 86_400_000,
  )
  let currentStreak = 0
  if (daysSinceLast <= 1) {
    currentStreak = 1
    for (let i = sorted.length - 2; i >= 0; i--) {
      const diff = Math.round(
        (new Date(sorted[i + 1]).getTime() - new Date(sorted[i]).getTime()) / 86_400_000,
      )
      if (diff === 1) currentStreak++
      else break
    }
  }
  return { currentStreak, longestStreak }
}

// ── fetchActivityData ──────────────────────────────────────────────────────────
// Uses the GitHub Events API to derive weekly commit heatmap, activity streaks,
// and the biggest PR (by files changed) merged this year.

export async function fetchActivityData(year: number): Promise<{
  weeklyCommits: Array<{ weekStart: string; count: number }>
  currentStreak: number
  longestStreak: number
  moonshotPR: { repo: string; filesChanged: number; title: string } | null
}> {
  const session = await auth()
  if (!session?.accessToken) {
    return { weeklyCommits: [], currentStreak: 0, longestStreak: 0, moonshotPR: null }
  }

  const token = session.accessToken
  const user = await getUser(token)
  const login = user.login
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  const pages = await Promise.allSettled(
    [1, 2, 3].map(page =>
      fetch(`https://api.github.com/users/${login}/events?per_page=100&page=${page}`, {
        headers,
        next: { revalidate: 1800 },
      }).then(r => (r.ok ? r.json() : [])),
    ),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allEvents: any[] = pages
    .filter(
      (r): r is PromiseFulfilledResult<any[]> =>
        r.status === 'fulfilled' && Array.isArray(r.value),
    )
    .flatMap(r => r.value)
    .filter(e => new Date(e.created_at as string).getFullYear() === year)

  const weeklyMap = new Map<string, number>()
  const activeDays = new Set<string>()

  for (const event of allEvents) {
    const dateStr = event.created_at as string
    activeDays.add(dateStr.slice(0, 10))
    if (event.type === 'PushEvent') {
      const weekStart = getWeekStart(new Date(dateStr))
      const size: number = (event.payload?.size as number) ?? (event.payload?.commits as unknown[])?.length ?? 0
      weeklyMap.set(weekStart, (weeklyMap.get(weekStart) ?? 0) + size)
    }
  }

  const weeklyCommits = [...weeklyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([weekStart, count]) => ({ weekStart, count }))

  const today = new Date().toISOString().slice(0, 10)
  const { currentStreak, longestStreak } = computeStreak([...activeDays], today)

  let moonshotPR: { repo: string; filesChanged: number; title: string } | null = null
  for (const event of allEvents) {
    if (event.type !== 'PullRequestEvent') continue
    const pr = event.payload?.pull_request
    if (!pr?.merged) continue
    const filesChanged: number = (pr.changed_files as number) ?? 0
    if (!moonshotPR || filesChanged > moonshotPR.filesChanged) {
      moonshotPR = {
        repo: ((event.repo?.name as string) ?? '').split('/')[1] ?? (event.repo?.name as string) ?? '?',
        filesChanged,
        title: (pr.title as string) ?? 'Untitled PR',
      }
    }
  }

  return { weeklyCommits, currentStreak, longestStreak, moonshotPR }
}

// ── fetchSearchStats ───────────────────────────────────────────────────────────
// Uses GitHub Search API to fetch issue counts, first PR, review count, and
// the biggest "refactor" commit for the given year.

export async function fetchSearchStats(year: number): Promise<{
  issuesClosed: number
  fastestFix: { repo: string; hours: number } | null
  firstPR: { date: string; repo: string; title: string } | null
  reviewsGiven: number
  biggestRefactor: { repo: string; message: string; sha: string } | null
}> {
  const session = await auth()
  if (!session?.accessToken) {
    return { issuesClosed: 0, fastestFix: null, firstPR: null, reviewsGiven: 0, biggestRefactor: null }
  }

  const token = session.accessToken
  const user = await getUser(token)
  const login = user.login
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  const cache = { next: { revalidate: 3600 } } as const
  const range = `${year}-01-01..${year}-12-31`

  const [issuesRes, firstPRRes, reviewsRes, refactorRes] = await Promise.allSettled([
    fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(`is:issue is:closed author:${login} closed:${range}`)}&per_page=30&sort=updated&order=desc`,
      { headers, ...cache },
    ),
    fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(`is:pr is:merged author:${login} merged:${range}`)}&per_page=1&sort=created&order=asc`,
      { headers, ...cache },
    ),
    fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(`is:pr reviewed-by:${login} updated:${range}`)}&per_page=1`,
      { headers, ...cache },
    ),
    fetch(
      `https://api.github.com/search/commits?q=${encodeURIComponent(`author:${login} author-date:${range} refactor`)}&sort=author-date&order=desc&per_page=5`,
      {
        headers: { ...headers, Accept: 'application/vnd.github.cloak-preview+json' },
        ...cache,
      },
    ),
  ])

  let issuesClosed = 0
  let fastestFix: { repo: string; hours: number } | null = null
  if (issuesRes.status === 'fulfilled' && issuesRes.value.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await issuesRes.value.json()
    issuesClosed = (data.total_count as number) ?? 0
    for (const item of (data.items as any[]) ?? []) {
      if (!item.created_at || !item.closed_at) continue
      const hours =
        (new Date(item.closed_at as string).getTime() -
          new Date(item.created_at as string).getTime()) /
        3_600_000
      const repo = ((item.repository_url as string) ?? '').split('/').slice(-1)[0] ?? '?'
      if (hours > 0 && (!fastestFix || hours < fastestFix.hours)) {
        fastestFix = { repo, hours: Math.round(hours * 10) / 10 }
      }
    }
  }

  let firstPR: { date: string; repo: string; title: string } | null = null
  if (firstPRRes.status === 'fulfilled' && firstPRRes.value.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await firstPRRes.value.json()
    const item = (data.items as any[])?.[0]
    if (item) {
      firstPR = {
        date: (item.pull_request?.merged_at as string) ?? (item.created_at as string) ?? '',
        repo: ((item.repository_url as string) ?? '').split('/').slice(-1)[0] ?? '?',
        title: (item.title as string) ?? '',
      }
    }
  }

  let reviewsGiven = 0
  if (reviewsRes.status === 'fulfilled' && reviewsRes.value.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await reviewsRes.value.json()
    reviewsGiven = (data.total_count as number) ?? 0
  }

  let biggestRefactor: { repo: string; message: string; sha: string } | null = null
  if (refactorRes.status === 'fulfilled' && refactorRes.value.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await refactorRes.value.json()
    const item = (data.items as any[])?.[0]
    if (item) {
      biggestRefactor = {
        repo: (item.repository?.name as string) ?? '?',
        message: ((item.commit?.message as string) ?? '').split('\n')[0].slice(0, 80),
        sha: ((item.sha as string) ?? '').slice(0, 7),
      }
    }
  }

  return { issuesClosed, fastestFix, firstPR, reviewsGiven, biggestRefactor }
}

// ── fetchCollabData ────────────────────────────────────────────────────────────
// Fetches contributor counts for the top repos to find the most collaborative one.

export async function fetchCollabData(
  repos: Array<{ owner: string; name: string }>,
): Promise<{ collabSparkRepo: { name: string; contributorCount: number } | null }> {
  const session = await auth()
  if (!session?.accessToken) return { collabSparkRepo: null }

  const token = session.accessToken
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  const results = await Promise.allSettled(
    repos.slice(0, 5).map(async ({ owner, name }) => {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${name}/contributors?per_page=30&anon=false`,
        { headers, next: { revalidate: 3600 } },
      )
      if (!res.ok) return null
      const contributors = (await res.json()) as Array<{ login: string }>
      return { name, contributorCount: contributors.length }
    }),
  )

  const repoStats = results
    .filter(
      (r): r is PromiseFulfilledResult<{ name: string; contributorCount: number } | null> =>
        r.status === 'fulfilled',
    )
    .map(r => r.value)
    .filter(
      (v): v is { name: string; contributorCount: number } => v !== null && v.contributorCount >= 2,
    )

  if (repoStats.length === 0) return { collabSparkRepo: null }
  const best = repoStats.sort((a, b) => b.contributorCount - a.contributorCount)[0]
  return { collabSparkRepo: { name: best.name, contributorCount: best.contributorCount } }
}
