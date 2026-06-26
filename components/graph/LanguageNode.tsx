'use client'

import { Handle, Position } from '@xyflow/react'

export interface LanguageNodeData {
  language: string
  repoCount: number
  color: string
  orbitRadii: number[]
  showOrbits: boolean
}

interface LanguageNodeProps {
  data: LanguageNodeData
}

const ORB = 120

export function LanguageNode({ data }: LanguageNodeProps) {
  const { color } = data
  return (
    <>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          opacity: 0,
          width: 0,
          height: 0,
          bottom: '50%',
          left: '50%',
          transform: 'translate(-50%, 50%)',
          border: 'none',
          pointerEvents: 'none',
        }}
      />
      <Handle
        id="cin"
        type="target"
        position={Position.Top}
        style={{
          opacity: 0,
          width: 0,
          height: 0,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: 'none',
          pointerEvents: 'none',
        }}
      />

      {data.showOrbits && data.orbitRadii.length > 0 && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: ORB,
            height: ORB,
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          {data.orbitRadii.map((r, idx) => (
            <circle
              key={idx}
              cx={ORB / 2}
              cy={ORB / 2}
              r={r}
              fill="none"
              stroke={color}
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          ))}
        </svg>
      )}
      <div
        className="flex flex-col items-center justify-center gap-1 select-none cursor-pointer"
        style={{
          width: ORB,
          height: ORB,
          borderRadius: '50%',
          boxShadow: `0 0 14px ${color}, 0 0 36px ${color}cc, 0 0 68px ${color}77, 0 0 110px ${color}44`,
        }}
      >
        <span
          className="font-sans font-semibold leading-none text-center"
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.97)',
            textShadow: '0 1px 4px rgba(0,0,0,0.75)',
            maxWidth: ORB - 20,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {data.language}
        </span>
        <span
          className="font-mono leading-none text-center"
          style={{
            fontSize: 9,
            color: 'rgba(255,255,255,0.72)',
            textShadow: '0 1px 3px rgba(0,0,0,0.65)',
          }}
        >
          {data.repoCount} repo{data.repoCount !== 1 ? 's' : ''}
        </span>
      </div>
    </>
  )
}
