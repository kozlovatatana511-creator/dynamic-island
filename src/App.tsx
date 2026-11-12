import { MotionConfig, motion } from 'motion/react'
import { useEffect } from 'react'
import { KIND_ORDER, META } from './island/meta'
import { resolveView, useIsland } from './island/store'
import { MockScreen } from './playground/MockScreen'
import { Sidebar } from './playground/Sidebar'

function useClock() {
  useEffect(() => {
    const id = window.setInterval(() => useIsland.getState().tick(Date.now()), 150)
    return () => window.clearInterval(id)
  }, [])
}

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return
      const st = useIsland.getState()
      const n = Number(e.key)
      if (n >= 1 && n <= 9) st.trigger(KIND_ORDER[n - 1])
      else if (e.key === 'Escape') st.setExpanded(null)
      else if (e.key === 'c') st.clearAll()
      else if (e.key === 'e') {
        const v = resolveView(st.activities, st.expandedId, st.pinnedId)
        st.setExpanded(v.mode === 'compact' ? v.activity!.id : v.mode === 'idle' ? 'home' : null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

function Readout() {
  const activities = useIsland((s) => s.activities)
  const expandedId = useIsland((s) => s.expandedId)
  const pinnedId = useIsland((s) => s.pinnedId)
  const v = resolveView(activities, expandedId, pinnedId)
  const chip = (k: string, val: string) => (
    <span className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 ring-1 ring-white/[0.06]">
      <span className="text-white/40">{k}</span>
      <motion.span key={val} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-medium text-white/85">
        {val}
      </motion.span>
    </span>
  )
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-[11.5px]">
      {chip('State', v.mode)}
      {chip('Showing', v.activity ? META[v.activity.kind].label : v.mode === 'home' ? 'Dashboard' : '—')}
      {chip('Bubble', v.secondary ? META[v.secondary.kind].label : '—')}
      {chip('Running', String(activities.length))}
    </div>
  )
}

export default function App() {
  useClock()
  useShortcuts()
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-screen w-screen overflow-hidden bg-[#08080a] text-white">
        <main className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-10 py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(80,90,140,0.18),transparent_70%)]" />
          <MockScreen />
          <Readout />
          <div className="text-center text-[11.5px] text-white/35">
            Click the island to expand · drag it down to pull open · click the side bubble to swap · keys{' '}
            <kbd className="lab-kbd">1</kbd>–<kbd className="lab-kbd">9</kbd> trigger · <kbd className="lab-kbd">E</kbd> expand ·{' '}
            <kbd className="lab-kbd">Esc</kbd> collapse · <kbd className="lab-kbd">C</kbd> clear
          </div>
        </main>
        <Sidebar />
      </div>
    </MotionConfig>
  )
}
