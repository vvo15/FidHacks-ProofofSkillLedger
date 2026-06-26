'use client'

import { SlideShell } from '../SlideShell'
import { useMountTransition } from '../hooks'
import type { StorySlideProps, StackLayer } from '../types'

function LangBars({ layers, label }: { layers: StackLayer[]; label: string }) {
  const maxPct = Math.max(...layers.map(l => l.pct), 1)
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <p style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.35)', margin: '0 0 8px', textAlign: 'center' }}>
        {label}
      </p>
      {layers.length === 0 ? (
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(196,208,232,0.25)', textAlign: 'center', marginTop: 12 }}>
          no activity
        </p>
      ) : (
        layers.map(l => (
          <div key={l.language} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div
                style={{
                  height: 3, borderRadius: 2,
                  width: `${(l.pct / maxPct) * 100}%`,
                  background: l.color,
                  opacity: 0.75,
                  minWidth: 4,
                }}
              />
              <span style={{ fontFamily: 'monospace', fontSize: 8, color: l.color, opacity: 0.7, whiteSpace: 'nowrap' }}>
                {l.pct}%
              </span>
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(196,208,232,0.45)' }}>
              {l.language}
            </span>
          </div>
        ))
      )}
    </div>
  )
}

export function StackEvolutionSlide({ stats }: StorySlideProps) {
  const visible = useMountTransition(40)
  const evo = stats.stackEvolution
  const year = stats.year ?? new Date().getFullYear()

  return (
    <SlideShell>
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          padding: '0 32px', width: '100%',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(196,208,232,0.38)', margin: 0 }}>
          stack evolution · milestone #10
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(196,208,232,0.6)', margin: 0, textAlign: 'center' }}>
          your stack is always evolving.
        </p>

        {/* Arrow icon */}
        <div style={{ fontSize: 36, lineHeight: 1, marginTop: 4 }}>
          📈
        </div>

        {evo ? (
          <div style={{ display: 'flex', gap: 20, width: '100%', maxWidth: 300, marginTop: 4 }}>
            <LangBars layers={evo.before} label={`Jan–Mar ${year}`} />

            {/* Divider */}
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

            <LangBars layers={evo.after} label={`Oct–Dec ${year}`} />
          </div>
        ) : (
          <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(196,208,232,0.3)', marginTop: 12, textAlign: 'center' }}>
            not enough data to compare quarters —<br />keep pushing this year.
          </p>
        )}

        <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(196,208,232,0.22)', margin: '8px 0 0', textAlign: 'center' }}>
          based on repos pushed each quarter
        </p>
      </div>
    </SlideShell>
  )
}
