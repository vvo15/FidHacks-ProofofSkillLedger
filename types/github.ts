export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  watchers_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  topics: string[]
  visibility: string
  fork: boolean
  size: number
  owner: {
    login: string
    avatar_url: string
  }
  permissions?: {
    push: boolean
    pull: boolean
    admin: boolean
  }
}

export interface LanguageBreakdown {
  [language: string]: number
}

export interface Milestone {
  id: string
  title: string
  description: string
  iconName: string
  repo?: GitHubRepo
  value?: string | number
  accent?: string
}

export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}
