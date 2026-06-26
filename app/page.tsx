import { signInWithGitHub } from './actions'
import { GitBranch, ArrowRight } from 'lucide-react'
import { StarField } from '@/components/StarField'

// Nebula blobs — low-opacity organic shapes, no neon
const NEBULAE = [
  { x: '-6%',  y: '52%',  w: '52%', h: '62%', color: '#7B5EA7', rx: '55% 45% 55% 45% / 40% 60% 40% 60%', rot: '-22deg', o: 0.07 },
  { x: '54%',  y: '-8%',  w: '52%', h: '55%', color: '#3D8A8A', rx: '45% 55% 45% 55% / 60% 40% 60% 40%', rot:  '18deg', o: 0.07 },
  { x: '28%',  y: '28%',  w: '50%', h: '48%', color: '#121e3a', rx: '50%',                                 rot:    '0deg', o: 0.22 },
  { x: '58%',  y: '58%',  w: '38%', h: '38%', color: '#A8637A', rx: '65% 35% 60% 40% / 40% 65% 35% 60%', rot:  '30deg', o: 0.055 },
]

export default async function LandingPage() {
  return (
    <main
      className="dark relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 38% 28%, #0b1a30 0%, #060d1c 50%, #020508 100%)',
      }}
    >
      {/* Nebula glows */}
      {NEBULAE.map((n, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: n.x, top: n.y,
            width: n.w, height: n.h,
            borderRadius: n.rx,
            background: `radial-gradient(ellipse at 50% 50%, ${n.color} 0%, transparent 70%)`,
            transform: `rotate(${n.rot})`,
            opacity: n.o,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Star field — client component, generates a random seed per page load */}
      <StarField count={90} />

      {/* Page content */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col gap-10">
        <span className="font-mono text-xs tracking-widest uppercase text-[var(--muted)]">
          butterfly effect
        </span>

        <div className="flex flex-col gap-4">
          <h1
            className="font-display leading-tight tracking-tight"
            style={{
              fontSize: 'clamp(2.8rem, 8vw, 4.5rem)',
              background: 'linear-gradient(145deg, rgba(220,232,255,0.95) 0%, rgba(190,210,240,0.78) 55%, rgba(155,127,212,0.65) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Your code, as a story.
          </h1>
          <p className="font-sans w-full text-lg text-[var(--muted)] leading-relaxed" style={{ maxWidth: 460 }}>
            Visualise your GitHub contributions as an interactive graph — every
            project, every language, every milestone.
          </p>
        </div>

        <form action={signInWithGitHub}>
          <button
            type="submit"
            className="group inline-flex items-center gap-3 rounded-full px-6 py-3.5 font-sans text-sm font-medium text-[var(--foreground)] transition-all duration-200 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            style={{
              border: '1px solid rgba(155,127,212,0.35)',
              background: 'rgba(155,127,212,0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <GitBranch className="h-4 w-4" />
            Sign in with GitHub
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </form>
      </div>

      <footer className="absolute bottom-8 font-mono text-xs text-[var(--muted)]">
        butterfly effect
      </footer>
    </main>
  )
}
