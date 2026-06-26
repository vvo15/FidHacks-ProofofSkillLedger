'use client'

import { Handle, Position } from '@xyflow/react'
import { Star } from 'lucide-react'
import type { RepoWithLanguages } from '@/lib/milestones'
import { getLanguageColor } from '@/lib/graphData'
import { useState } from 'react'

interface RepoNodeProps {
  data: RepoWithLanguages
  selected?: boolean
}

const BUBBLE = 84

export function RepoNode({ data, selected }: RepoNodeProps) {
  const color = data.dominantLanguage ? getLanguageColor(data.dominantLanguage) : '#6B7280'
  const label = data.name;
  const [size] = useState(() => Math.random() * 70 + 30);

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          opacity: 0,
          width: 0,
          height: 0,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          border: 'none',
          pointerEvents: 'none',
        }}
      />

      <div
        className="hover:scale-120 flex flex-col items-center rounded-full justify-center gap-0.5 cursor-pointer select-none relative"
        style={{
          width: BUBBLE,
          height: BUBBLE,
          // borderRadius: '50%',

          // boxShadow: selected
          //   ? `0 0 6px rgba(255,255,255,0.9), 0 0 18px ${color}, 0 0 42px ${color}cc, 0 0 80px ${color}77, 0 0 130px ${color}44`
          //   : `0 0 10px ${color}ee, 0 0 28px ${color}99, 0 0 58px ${color}55`,
          transition: 'box-shadow, scale 0.25s ease',
        }}
      >
        <span className="absolute size-full -z-1 blur-md "
          style={{
            background: `radial-gradient(circle at 50% 50%,
            rgba(255,255,255,0.98) 0%,
            ${selected ? "#FFFFFF" : color} 14%,
            transparent 50%
            )`,
            scale: `${size}%`,
          }}
        ></span>
        <span
          className="font-mono leading-tight text-center whitespace-nowrap"
          style={{
            fontSize: 8.5,
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            // maxWidth: BUBBLE - 16,
            // overflow: 'hidden',
            // whiteSpace: 'nowrap',
            // textOverflow: 'ellipsis',
          }}
        >
          {label}
        </span>
        {data.stargazers_count > 0 && (
          <span
            className="flex items-center gap-0.5 font-mono"
            style={{
              fontSize: 7.5,
              color: 'rgba(255,255,255,0.72)',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            }}
          >
            <Star style={{ width: 7, height: 7 }} />
            {data.stargazers_count}
          </span>
        )}
      </div>
    </>
  )
}
