export default function GraphLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-6 w-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <span className="font-mono text-xs text-[var(--muted)]">loading your repos…</span>
      </div>
    </div>
  )
}
