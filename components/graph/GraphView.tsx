'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTheme } from 'next-themes'
import { BookOpen, Sun, Moon, LogOut } from 'lucide-react'
import type { GitHubUser } from '@/types/github'
import type { LanguageGroup } from '@/lib/graphData'
import type { RepoWithLanguages } from '@/lib/milestones'
import { LanguageNode } from '@/components/graph/LanguageNode'
import { RepoNode } from '@/components/graph/RepoNode'
import { RepoPanel } from '@/components/ui/RepoPanel'
import { signOutAction } from '@/app/actions'

const NODE_TYPES = { languageNode: LanguageNode, repoNode: RepoNode }

const LANG_HALF_W = 60
const LANG_HALF_H = 60
const BUBBLE_HALF = 42
const SPRING_MS = 1000  // radius spring duration — matches the CSS shoot-out spring

// Approximates cubic-bezier(0.22, 1.15, 0.36, 1) with ~15% overshoot
function easeOutSpring(t: number): number {
  const c1 = 2.2
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

interface RadiusTx {
  startedAt: number
  expanding: boolean
}

interface OrbitParams {
  langId: string
  baseAngle: number
  radius: number          // orbit radius in default (top-5) view
  expandedRadius: number  // orbit radius when language is expanded
  angVel: number          // rad/ms — positive = CCW, negative = CW
  floatPhase: number
  floatSpeed: number      // rad/ms
  floatAmp: number        // px
}

function buildInitialGraph(groups: LanguageGroup[]): {
  nodes: Node[]
  edges: Edge[]
  orbits: Map<string, OrbitParams>
  top5Ids: Set<string>
} {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const orbits = new Map<string, OrbitParams>()

  if (groups.length === 0) return { nodes, edges, orbits, top5Ids: new Set() }

  // Most-repos language goes to center; rest evenly distributed on a ring
  const sorted = [...groups].sort((a, b) => b.repos.length - a.repos.length)
  const centerGroup = sorted[0]
  const ringGroups = sorted.slice(1)

  const CLUSTER_REACH = 350
  let ringRadius = 0
  if (ringGroups.length === 1) {
    ringRadius = CLUSTER_REACH * 2
  } else if (ringGroups.length > 1) {
    const minRingToRing = CLUSTER_REACH / Math.sin(Math.PI / ringGroups.length)
    ringRadius = Math.max(CLUSTER_REACH * 2, minRingToRing)
  }

  // Top 5 most recently pushed repos per language group
  const top5Ids = new Set(
    groups.flatMap(g =>
      [...g.repos]
        .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
        .slice(0, 5)
        .map(r => `repo-${r.id}`)
    )
  )

  type Entry = { group: LanguageGroup; langX: number; langY: number }
  const layout: Entry[] = [
    { group: centerGroup, langX: -LANG_HALF_W, langY: -LANG_HALF_H },
    ...ringGroups.map((group, i) => {
      const angle = (2 * Math.PI * i) / ringGroups.length - Math.PI / 2
      return {
        group,
        langX: Math.round(Math.cos(angle) * ringRadius) - LANG_HALF_W,
        langY: Math.round(Math.sin(angle) * ringRadius) - LANG_HALF_H,
      }
    }),
  ]

  layout.forEach(({ group, langX, langY }) => {
    const cx = langX + LANG_HALF_W
    const cy = langY + LANG_HALF_H
    const n = group.repos.length

    // Expanded base: arc-spacing ≥ 110px → r ≥ n·110/(2π)
    const expandedBase = Math.max(220, (n * 110) / (2 * Math.PI))
    // Range scales faster than base (28px/repo vs ~17.5px/repo), capped at 600px
    const expandedRange = Math.max(80, Math.min(600, n * 28))

    nodes.push({
      id: `lang-${group.language}`,
      type: 'languageNode',
      position: { x: langX, y: langY },
      data: { language: group.language, repoCount: group.repos.length, color: group.color },
      draggable: true,
    })

    group.repos.forEach((repo, ri) => {
      const baseAngle = (2 * Math.PI * ri) / n + (Math.random() - 0.5) * (0.9 / Math.max(n, 1))
      const radius = 170 + Math.random() * 130
      const expandedRadius = expandedBase + Math.random() * expandedRange
      const angVel = (ri % 2 === 0 ? 1 : -1) * (0.000010 + Math.random() * 0.000018)

      orbits.set(`repo-${repo.id}`, {
        langId: `lang-${group.language}`,
        baseAngle,
        radius,
        expandedRadius,
        angVel,
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: 0.000040 + Math.random() * 0.000060,
        floatAmp:   12 + Math.random() * 20,
      })

      nodes.push({
        id: `repo-${repo.id}`,
        type: 'repoNode',
        position: { x: cx - BUBBLE_HALF, y: cy - BUBBLE_HALF },
        data: repo as unknown as Record<string, unknown>,
        draggable: false,
        style: { opacity: 0, pointerEvents: 'none' as const },
      })

      edges.push({
        id: `e-${group.language}-${repo.id}`,
        source: `lang-${group.language}`,
        target: `repo-${repo.id}`,
        type: 'straight',
        style: { stroke: group.color, strokeWidth: 1, opacity: 0 },
      })
    })
  })

  return { nodes, edges, orbits, top5Ids }
}

function orbitPos(
  orbit: OrbitParams,
  langPos: { x: number; y: number },
  elapsed: number,
  baseR: number,
): { x: number; y: number } {
  const cx = langPos.x + LANG_HALF_W
  const cy = langPos.y + LANG_HALF_H
  const angle = orbit.baseAngle + elapsed * orbit.angVel
  const r = baseR + Math.sin(orbit.floatPhase + elapsed * orbit.floatSpeed) * orbit.floatAmp
  return {
    x: cx + Math.cos(angle) * r - BUBBLE_HALF,
    y: cy + Math.sin(angle) * r - BUBBLE_HALF,
  }
}

interface GraphViewProps {
  groups: LanguageGroup[]
  user: GitHubUser
}

export function GraphView({ groups, user }: GraphViewProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const { nodes: initNodes, edges: initEdges, orbits: initOrbits, top5Ids: initTop5 } = useMemo(
    () => buildInitialGraph(groups),
    [groups],
  )

  const orbitsRef      = useRef(initOrbits)
  const frameRef       = useRef<number | undefined>(undefined)
  const startRef       = useRef<number | null>(null)
  const hoverCountRef  = useRef(0)
  const pauseAccumRef  = useRef(0)
  const pauseStartRef  = useRef<number | null>(null)
  const top5IdsRef      = useRef(initTop5)
  const expandedLangRef = useRef<string | null>(null)
  const hasStartedRef   = useRef(false)
  const radiusTxRef     = useRef<Map<string, RadiusTx>>(new Map())

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)
  const [selectedRepo, setSelectedRepo]  = useState<RepoWithLanguages | null>(null)
  const [expandedLang, setExpandedLang]  = useState<string | null>(null)

  // ── Shoot-out then orbit ──────────────────────────────────────────────────
  useEffect(() => {
    // Phase 1 — spring out; only top-5 repos appear
    const shootTimer = setTimeout(() => {
      setNodes(prev => {
        const langPos = new Map(
          prev.filter(n => n.type === 'languageNode').map(n => [n.id, n.position]),
        )
        return prev.map(node => {
          if (node.type !== 'repoNode') return node
          const orbit = orbitsRef.current.get(node.id)
          if (!orbit) return node
          const lp = langPos.get(orbit.langId)
          if (!lp) return node
          const isTop5 = top5IdsRef.current.has(node.id)
          return {
            ...node,
            position: orbitPos(orbit, lp, 0, orbit.radius),
            style: {
              opacity: isTop5 ? 1 : 0,
              pointerEvents: isTop5 ? 'all' as const : 'none' as const,
              ...(isTop5 && {
                transition: 'transform 1s cubic-bezier(0.22, 1.15, 0.36, 1), opacity 0.4s ease',
              }),
            },
          }
        })
      })
      // Show edges only for top-5 repos
      setEdges(prev => prev.map(edge => ({
        ...edge,
        style: {
          ...edge.style,
          opacity: top5IdsRef.current.has(edge.target) ? 0.14 : 0,
        },
      })))
      hasStartedRef.current = true
    }, 60)

    // Phase 2 — continuous orbital drift via rAF
    const driftTimer = setTimeout(() => {
      startRef.current = Date.now()

      const tick = () => {
        const now = Date.now()
        const activePause = pauseStartRef.current !== null ? now - pauseStartRef.current : 0
        const elapsed = now - (startRef.current ?? 0) - pauseAccumRef.current - activePause

        setNodes(prev => {
          const langPos = new Map(
            prev.filter(n => n.type === 'languageNode').map(n => [n.id, n.position]),
          )
          return prev.map(node => {
            if (node.type !== 'repoNode') return node
            const orbit = orbitsRef.current.get(node.id)
            if (!orbit) return node
            const lp = langPos.get(orbit.langId)
            if (!lp) return node
            // Radius spring: animate between orbit.radius ↔ orbit.expandedRadius
            const tx = radiusTxRef.current.get(orbit.langId)
            const isExpandedLang = expandedLangRef.current === orbit.langId
            let baseR: number
            if (tx) {
              const rawT = Math.min(1, (now - tx.startedAt) / SPRING_MS)
              if (rawT >= 1) {
                radiusTxRef.current.delete(orbit.langId)
                baseR = isExpandedLang ? orbit.expandedRadius : orbit.radius
              } else {
                const eased = easeOutSpring(rawT)
                baseR = tx.expanding
                  ? orbit.radius + (orbit.expandedRadius - orbit.radius) * eased
                  : orbit.expandedRadius + (orbit.radius - orbit.expandedRadius) * eased
              }
            } else {
              baseR = isExpandedLang ? orbit.expandedRadius : orbit.radius
            }

            const s = node.style as { opacity?: number; pointerEvents?: string } | undefined
            return {
              ...node,
              style: {
                opacity: s?.opacity,
                pointerEvents: s?.pointerEvents as React.CSSProperties['pointerEvents'],
              },
              position: orbitPos(orbit, lp, elapsed, baseR),
            }
          })
        })

        frameRef.current = requestAnimationFrame(tick)
      }

      frameRef.current = requestAnimationFrame(tick)
    }, 1200)

    return () => {
      clearTimeout(shootTimer)
      clearTimeout(driftTimer)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Expand / collapse a language constellation ────────────────────────────
  useEffect(() => {
    if (!hasStartedRef.current) return

    setNodes(prev => prev.map(node => {
      if (node.type === 'languageNode') {
        const faded = expandedLang !== null && node.id !== expandedLang
        return {
          ...node,
          style: {
            opacity: faded ? 0.06 : 1,
            pointerEvents: (faded ? 'none' : undefined) as React.CSSProperties['pointerEvents'],
            transition: 'opacity 0.35s ease',
          },
        }
      }
      if (node.type === 'repoNode') {
        const orbit = orbitsRef.current.get(node.id)
        if (!orbit) return node
        const visible = expandedLang === null
          ? top5IdsRef.current.has(node.id)
          : orbit.langId === expandedLang
        return {
          ...node,
          style: {
            opacity: visible ? 1 : 0,
            pointerEvents: (visible ? 'all' : 'none') as React.CSSProperties['pointerEvents'],
            transition: 'opacity 0.4s ease',
          },
        }
      }
      return node
    }))

    setEdges(prev => prev.map(edge => {
      const isExpanded = expandedLang !== null
        ? edge.source === expandedLang
        : top5IdsRef.current.has(edge.target)
      return {
        ...edge,
        style: { ...edge.style, opacity: isExpanded ? 0.14 : 0 },
      }
    }))
  }, [expandedLang])

  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    if (node.type === 'repoNode') {
      setSelectedRepo(node.data as unknown as RepoWithLanguages)
      return
    }
    if (node.type !== 'languageNode') return

    const prev = expandedLangRef.current
    const next = prev === node.id ? null : node.id
    const now = Date.now()

    if (prev) radiusTxRef.current.set(prev, { startedAt: now, expanding: false })
    if (next) radiusTxRef.current.set(next, { startedAt: now, expanding: true })

    expandedLangRef.current = next
    setExpandedLang(next)
    setSelectedRepo(null)
  }, [])

  const onPaneClick = useCallback(() => {
    const prev = expandedLangRef.current
    if (prev) radiusTxRef.current.set(prev, { startedAt: Date.now(), expanding: false })
    expandedLangRef.current = null
    setExpandedLang(null)
    setSelectedRepo(null)
  }, [])

  const onNodeMouseEnter = useCallback(() => {
    hoverCountRef.current++
    if (hoverCountRef.current === 1) {
      pauseStartRef.current = Date.now()
    }
  }, [])

  const onNodeMouseLeave = useCallback(() => {
    hoverCountRef.current = Math.max(0, hoverCountRef.current - 1)
    if (hoverCountRef.current === 0 && pauseStartRef.current !== null) {
      pauseAccumRef.current += Date.now() - pauseStartRef.current
      pauseStartRef.current = null
    }
  }, [])

  return (
    <div className="relative flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        colorMode={isDark ? 'dark' : 'light'}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} size={1} gap={28} />
        <Controls showInteractive={false} />

        <Panel position="top-left">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 shadow-sm">
            <span className="font-display text-base text-[var(--foreground)] leading-none">storybook</span>
            <span className="h-4 w-px bg-[var(--border)]" />
            <img src={user.avatar_url} alt={user.login} className="h-5 w-5 rounded-full" />
            <span className="font-mono text-xs text-[var(--muted)]">@{user.login}</span>
          </div>
        </Panel>

        <Panel position="top-right">
          <div className="flex items-center gap-2">
            <ViewAsStoryButton />
            <ThemeToggle isDark={isDark} setTheme={setTheme} />
            <form action={signOutAction}>
              <button
                type="submit"
                title="Sign out"
                className="flex items-center justify-center h-[38px] w-[38px] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <LogOut className="h-3.5 w-3.5 text-[var(--muted)]" />
              </button>
            </form>
          </div>
        </Panel>
      </ReactFlow>

      <RepoPanel repo={selectedRepo} onClose={() => setSelectedRepo(null)} />
    </div>
  )
}

function ViewAsStoryButton() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        onBlur={() => setOpen(false)}
        className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 font-mono text-xs text-[var(--foreground)] shadow-sm transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <BookOpen className="h-3.5 w-3.5" />
        View as Story
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-mono text-[10px] text-[var(--muted)] shadow-lg whitespace-nowrap z-50">
          Coming soon
        </div>
      )}
    </div>
  )
}

function ThemeToggle({ isDark, setTheme }: { isDark: boolean; setTheme: (t: string) => void }) {
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light' : 'Switch to dark'}
      className="flex items-center justify-center h-[38px] w-[38px] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      {isDark
        ? <Sun className="h-3.5 w-3.5 text-[var(--foreground)]" />
        : <Moon className="h-3.5 w-3.5 text-[var(--foreground)]" />}
    </button>
  )
}
