'use client'

interface Props {
  count: number
  current: number
  progress: number
}

export function ProgressBars({ count, current, progress }: Props) {
  return (
    <div className="flex w-full gap-1.5">
      {Array.from({ length: count }).map((_, i) => {
        const fill = i < current ? 1 : i === current ? progress : 0
        return (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${fill * 100}%`,
                background: 'rgba(255,255,255,0.9)',
                transition: i === current ? 'none' : 'width 0.1s ease',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
