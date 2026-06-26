'use client'

// Butterfly-moonlight color palette
const WING_L = '#7B5EA7'   // amethyst — upper-left wing
const WING_R = '#3D8A8A'   // deep teal — upper-right wing
const WING_LO = '#A8637A'  // dusty rose — lower-left wing
const WING_RO = '#6B5EA7'  // iris — lower-right wing
const SPARKLE = 'rgba(210,225,255,0.8)'

const SPARKLES = [
  { x: '11%',  y: '17%', r: 1.5, dur: 3.2, delay: 0.0  },
  { x: '83%',  y: '11%', r: 2.0, dur: 2.9, delay: 0.9  },
  { x: '76%',  y: '79%', r: 1.5, dur: 3.6, delay: 1.7  },
  { x: '17%',  y: '73%', r: 2.0, dur: 2.7, delay: 0.5  },
  { x: '93%',  y: '47%', r: 1.0, dur: 4.1, delay: 2.2  },
  { x: '5%',   y: '53%', r: 1.0, dur: 3.8, delay: 1.4  },
  { x: '53%',  y: '91%', r: 1.5, dur: 3.0, delay: 0.7  },
  { x: '47%',  y: '5%',  r: 1.0, dur: 3.4, delay: 2.5  },
  { x: '37%',  y: '83%', r: 1.0, dur: 4.3, delay: 1.1  },
  { x: '67%',  y: '28%', r: 1.5, dur: 2.8, delay: 0.3  },
  { x: '28%',  y: '33%', r: 1.0, dur: 3.9, delay: 1.8  },
  { x: '88%',  y: '64%', r: 1.0, dur: 3.1, delay: 0.6  },
]

export function SlideShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">
      {/* Upper wing glows — amethyst left, teal right */}
      <div style={{
        position: 'absolute', width: '68%', height: '135%',
        left: '-10%', top: '-18%',
        borderRadius: '55% 45% 55% 45% / 40% 60% 40% 60%',
        background: `radial-gradient(ellipse at 72% 42%, ${WING_L}22 0%, transparent 62%)`,
        transform: 'rotate(-18deg)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '68%', height: '135%',
        right: '-10%', top: '-18%',
        borderRadius: '45% 55% 45% 55% / 60% 40% 60% 40%',
        background: `radial-gradient(ellipse at 28% 42%, ${WING_R}22 0%, transparent 62%)`,
        transform: 'rotate(18deg)',
        pointerEvents: 'none',
      }} />

      {/* Lower wing glows — rose left, iris right */}
      <div style={{
        position: 'absolute', width: '52%', height: '68%',
        left: '-2%', bottom: '-12%',
        borderRadius: '65% 35% 40% 60% / 25% 75% 25% 75%',
        background: `radial-gradient(ellipse at 78% 22%, ${WING_LO}18 0%, transparent 68%)`,
        transform: 'rotate(-24deg)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '52%', height: '68%',
        right: '-2%', bottom: '-12%',
        borderRadius: '35% 65% 60% 40% / 75% 25% 75% 25%',
        background: `radial-gradient(ellipse at 22% 22%, ${WING_RO}18 0%, transparent 68%)`,
        transform: 'rotate(24deg)',
        pointerEvents: 'none',
      }} />

      {/* Moonlight sparkles */}
      {SPARKLES.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: s.x, top: s.y,
          width: s.r * 2, height: s.r * 2,
          borderRadius: '50%',
          background: SPARKLE,
          boxShadow: `0 0 ${s.r * 4}px ${s.r * 2}px ${SPARKLE}`,
          animation: `moonSparkle ${s.dur}s ease-in-out infinite ${s.delay}s`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Slide content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}
