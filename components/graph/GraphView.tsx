'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { BookOpen, Sun, Moon, LogOut } from 'lucide-react'
import type { GitHubUser } from '@/types/github'
import type { LanguageGroup } from '@/lib/graphData'
import type { RepoWithLanguages } from '@/lib/milestones'
import { LanguageNode } from '@/components/graph/LanguageNode'
import { RepoNode } from '@/components/graph/RepoNode'
import { ConstellationEdge } from '@/components/graph/ConstellationEdge'
import { RepoPanel } from '@/components/ui/RepoPanel'
import { signOutAction } from '@/app/actions'

const NODE_TYPES = { languageNode: LanguageNode, repoNode: RepoNode }
const EDGE_TYPES = { constellation: ConstellationEdge }

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

// Mulberry32 — fast seeded PRNG so server and client produce identical layouts
function mulberry32(seed: number) {
  let s = seed
  return () => {
    s = s + 0x6d2b79f5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
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

  // Deterministic seed from group data so server + client render identically
  const seed = groups.reduce((acc, g) =>
    (Math.imul(acc ^ g.repos.length, 1664525) + g.language.charCodeAt(0)) | 0, 0x9e3779b9)
  const rng = mulberry32(seed)

  // Most-repos language goes to center; rest arranged via golden-angle phyllotaxis spiral.
  // The golden angle (≈137.5°) guarantees no two nodes share an angular line, producing
  // an organic, non-repeating spread for any number of languages.
  const sorted = [...groups].sort((a, b) => b.repos.length - a.repos.length)
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)) // ≈ 2.399 rad = 137.508°
  // C controls ring density; nearest-neighbor distance ≈ 1.72 × C ≈ 776px
  // (comfortably larger than the 600px default orbit diameter)
  const SPIRAL_C = 450

  // Per-group top-5: sorted IDs + one shared angVel so they orbit in lockstep
  const top5Data = new Map<string, { repoIds: string[]; angVel: number }>()
  groups.forEach(g => {
    const repoIds = [...g.repos]
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, 5)
      .map(r => `repo-${r.id}`)
    top5Data.set(g.language, { repoIds, angVel: 0.000012 + rng() * 0.000006 })
  })
  const top5Ids = new Set([...top5Data.values()].flatMap(d => d.repoIds))

  type Entry = { group: LanguageGroup; langX: number; langY: number }
  const layout: Entry[] = sorted.map((group, i) => {
    let cx: number, cy: number
    if (i === 0) {
      // Dominant language at the origin
      cx = 0
      cy = 0
    } else {
      // Phyllotaxis position + small jitter for organic feel
      const r = SPIRAL_C * Math.sqrt(i) + (rng() - 0.5) * SPIRAL_C * 0.25
      const angle = i * GOLDEN_ANGLE + (rng() - 0.5) * 0.4
      cx = Math.round(Math.cos(angle) * r)
      cy = Math.round(Math.sin(angle) * r)
    }
    return { group, langX: cx - LANG_HALF_W, langY: cy - LANG_HALF_H }
  })

  const langOrbitRadii = new Map<string, number[]>()

  layout.forEach(({ group, langX, langY }) => {
    const cx = langX + LANG_HALF_W
    const cy = langY + LANG_HALF_H
    const n = group.repos.length

    // At n=40 the expanded orbit is 1.5× the node's default radius; grows logarithmically
    const scaleFactor = 1 + 0.5 * Math.min(1, Math.log(n + 1) / Math.log(41))

    nodes.push({
      id: `lang-${group.language}`,
      type: 'languageNode',
      position: { x: langX, y: langY },
      data: { language: group.language, repoCount: group.repos.length, color: group.color, orbitRadii: [], showOrbits: true },
      draggable: true,
    })

    group.repos.forEach((repo, ri) => {
      const repoNodeId = `repo-${repo.id}`
      const top5Info = top5Data.get(group.language)!
      const top5Rank = top5Info.repoIds.indexOf(repoNodeId)
      const isTop5 = top5Rank !== -1

      // Top-5 nodes: evenly spaced, same speed; others: random
      const baseAngle = isTop5
        ? (2 * Math.PI * top5Rank) / top5Info.repoIds.length
        : (2 * Math.PI * ri) / n + (rng() - 0.5) * (0.9 / Math.max(n, 1))
      const angVel = isTop5
        ? top5Info.angVel
        : (ri % 2 === 0 ? 1 : -1) * (0.000010 + rng() * 0.000018)

      const radius = 170 + rng() * 130
      if (isTop5) {
        const arr = langOrbitRadii.get(group.language) ?? []
        arr[top5Rank] = radius
        langOrbitRadii.set(group.language, arr)
      }
      const expandedRadius = radius * scaleFactor

      orbits.set(`repo-${repo.id}`, {
        langId: `lang-${group.language}`,
        baseAngle,
        radius,
        expandedRadius,
        angVel,
        floatPhase: rng() * Math.PI * 2,
        floatSpeed: 0.000040 + rng() * 0.000060,
        floatAmp:   12 + rng() * 20,
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

  // Fill in orbit radii for language nodes
  for (const node of nodes) {
    if (node.type !== 'languageNode') continue
    const d = node.data as { language: string; orbitRadii: number[] }
    d.orbitRadii = (langOrbitRadii.get(d.language) ?? []).filter(Boolean)
  }

  // Constellation lines: Prim's MST on language node positions
  // Guarantees every language is reachable without connecting all pairs
  if (layout.length > 1) {
    const pts = layout.map(({ group, langX, langY }) => ({
      id: `lang-${group.language}`,
      x: langX + LANG_HALF_W,
      y: langY + LANG_HALF_H,
    }))

    const inTree = new Set<string>([pts[0].id])
    const mstEdges: Array<{ a: string; b: string }> = []

    while (inTree.size < pts.length) {
      let bestDist = Infinity, bestA = '', bestB = ''
      for (const a of pts) {
        if (!inTree.has(a.id)) continue
        for (const b of pts) {
          if (inTree.has(b.id)) continue
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < bestDist) { bestDist = d; bestA = a.id; bestB = b.id }
        }
      }
      mstEdges.push({ a: bestA, b: bestB })
      inTree.add(bestB)
    }

    // BFS connectivity verification
    const adj = new Map(pts.map(p => [p.id, [] as string[]]))
    for (const { a, b } of mstEdges) { adj.get(a)!.push(b); adj.get(b)!.push(a) }
    const visited = new Set([pts[0].id])
    const q = [pts[0].id]
    while (q.length) {
      for (const nb of adj.get(q.shift()!)!) {
        if (!visited.has(nb)) { visited.add(nb); q.push(nb) }
      }
    }
    console.assert(
      visited.size === pts.length,
      `Constellation not fully connected: reached ${visited.size}/${pts.length}`,
    )

    for (const { a, b } of mstEdges) {
      edges.push({
        id: `constellation-${a}-${b}`,
        source: a,
        target: b,
        type: 'constellation',
        style: { stroke: 'rgba(255,255,255,0.22)', strokeWidth: 1, pointerEvents: 'none' as const },
      })
    }
  }

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
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isDark = mounted && resolvedTheme === 'dark'

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
      // Show edges only for top-5 repos; constellation lines keep their own opacity
      setEdges(prev => prev.map(edge => {
        if (edge.id.startsWith('constellation-')) return edge
        return {
          ...edge,
          style: {
            ...edge.style,
            opacity: top5IdsRef.current.has(edge.target) ? 0.14 : 0,
          },
        }
      }))
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
          data: {
            ...node.data,
            showOrbits: node.id !== expandedLang,
          },
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
          },
        }
      }
      return node
    }))

    setEdges(prev => prev.map(edge => {
      if (edge.id.startsWith('constellation-')) return edge
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

  const onExpandLang = useCallback((langId: string) => {
    if (expandedLangRef.current === langId) return
    const prev = expandedLangRef.current
    const now = Date.now()
    if (prev) radiusTxRef.current.set(prev, { startedAt: now, expanding: false })
    radiusTxRef.current.set(langId, { startedAt: now, expanding: true })
    expandedLangRef.current = langId
    setExpandedLang(langId)
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
    <div
      className="relative flex-1 h-full"
      style={isDark ? {
        background: 'radial-gradient(ellipse at 50% 40%, #0c1524 0%, #060a12 45%, #020408 100%)'
      } : undefined}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
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
        <Background variant={BackgroundVariant.Dots} bgColor={isDark ? 'transparent' : 'var(--background)'} size={1} gap={28} />
        <Controls showInteractive={false} />

        <Panel position="top-left">
          <div className="w-72 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="font-display text-base text-[var(--foreground)] leading-none whitespace-nowrap">butterfly effect</span>
              <span className="h-4 w-px bg-[var(--border)]" />
              <img src={user.avatar_url} alt={user.login} className="h-5 w-5 rounded-full" />
              <span className="font-mono text-xs text-[var(--muted)]">@{user.login}</span>
            </div>
            <SearchBar
              groups={groups}
              top5Ids={top5IdsRef.current}
              onSelect={setSelectedRepo}
              onExpandLang={onExpandLang}
            />
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
  return (
    <Link
      href="/insights"
      className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 font-mono text-xs text-[var(--foreground)] shadow-sm transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <BookOpen className="h-3.5 w-3.5" />
      Insights
    </Link>
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

function SearchBar({
  groups,
  top5Ids,
  onSelect,
  onExpandLang,
}: {
  groups: LanguageGroup[]
  top5Ids: Set<string>
  onSelect: (repo: RepoWithLanguages) => void
  onExpandLang: (langId: string) => void
}) {
  const [query, setQuery] = useState('')
  const { setCenter, getNodes } = useReactFlow()

  const allRepos = useMemo(
    () => groups.flatMap(g => g.repos),
    [groups],
  )

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allRepos
      .filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q),
      )
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
  }, [query, allRepos])

  function handleSelect(repo: RepoWithLanguages) {
    setQuery('')

    const repoNodeId = `repo-${repo.id}`
    const isTop5 = top5Ids.has(repoNodeId)
    const langGroup = groups.find(g => g.repos.some(r => r.id === repo.id))
    const langId = langGroup ? `lang-${langGroup.language}` : null

    function focusAndOpen() {
      const rfNode = getNodes().find(n => n.id === repoNodeId)
      if (rfNode) {
        setCenter(
          rfNode.position.x + BUBBLE_HALF,
          rfNode.position.y + BUBBLE_HALF,
          { zoom: 1.8, duration: 800 },
        )
      }
      onSelect(repo)
    }

    if (!isTop5 && langId) {
      onExpandLang(langId)
      setTimeout(focusAndOpen, SPRING_MS + 100)
    } else {
      focusAndOpen()
    }
  }

  return (
    <div className="relative mt-2">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search projects…"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
      />
      {results.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg">
          {results.map(repo => (
            <button
              key={repo.id}
              onMouseDown={() => handleSelect(repo)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-mono text-xs hover:bg-[var(--surface-raised)]"
            >
              <span className="truncate text-[var(--foreground)]">{repo.name}</span>
              <span className="shrink-0 text-[var(--muted)]">★ {repo.stargazers_count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
