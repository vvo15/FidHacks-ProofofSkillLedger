'use client'

import { getStraightPath, useInternalNode, type EdgeProps } from '@xyflow/react'

const LANG_ORB = 120

export function ConstellationEdge({ id, source, target, style }: EdgeProps) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)

  if (!sourceNode || !targetNode) return null

  const sx = sourceNode.internals.positionAbsolute.x + LANG_ORB / 2
  const sy = sourceNode.internals.positionAbsolute.y + LANG_ORB / 2
  const tx = targetNode.internals.positionAbsolute.x + LANG_ORB / 2
  const ty = targetNode.internals.positionAbsolute.y + LANG_ORB / 2

  const [edgePath] = getStraightPath({ sourceX: sx, sourceY: sy, targetX: tx, targetY: ty })

  return (
    <path
      id={id}
      d={edgePath}
      style={style}
      fill="none"
      className="react-flow__edge-path"
    />
  )
}
