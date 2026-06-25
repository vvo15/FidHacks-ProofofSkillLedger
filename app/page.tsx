import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { signInWithGitHub } from './actions'
import { GitBranch, ArrowRight } from 'lucide-react'

export default async function LandingPage() {
  // const session = await auth()
  // if (session) redirect('/graph')

  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-lg flex flex-col gap-10">
        {/* Eyebrow */}
        <span className="font-mono text-xs tracking-widest uppercase text-[var(--muted)]">
          github wrapped
        </span>

        {/* Heading */}
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-6xl leading-tight tracking-tight text-[var(--foreground)]">
            Your code,<br />as a story.
          </h1>
          <p className="font-sans text-lg text-[var(--muted)] leading-relaxed">
            Visualise your GitHub contributions as an interactive graph — every
            project, every language, every milestone.
          </p>
        </div>

        {/* Sign in */}
        <form action={signInWithGitHub}>
          <button
            type="submit"
            className="group inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3.5 font-sans text-sm font-medium text-[var(--foreground)] transition-all duration-200 hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            <GitBranch className="h-4 w-4" />
            Sign in with GitHub
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </form>
      </div>

      {/* Bottom decoration */}
      <footer className="absolute bottom-8 font-mono text-xs text-[var(--muted)]">
        storybook
      </footer>
    </main>
  )
}
