import { create } from 'zustand'
import { DEFAULT_SETTINGS, META, PRESETS, createData, downloadProgress, isLive, timerRemaining } from './meta'
import type { Activity, DataMap, Kind, ResolvedView, Settings } from './types'

interface LogEntry {
  id: string
  t: number
  text: string
}

interface IslandState {
  activities: Activity[]
  /** Activity id, 'home' for the idle dashboard, or null. */
  expandedId: string | null
  pinnedId: string | null
  peekUntil: number
  settings: Settings
  log: LogEntry[]
  trigger: <K extends Kind>(kind: K, patch?: Partial<DataMap[K]>) => void
  update: <K extends Kind>(id: string, patch: Partial<DataMap[K]>) => void
  dismiss: (id: string) => void
  setExpanded: (id: string | null) => void
  pin: (id: string) => void
  clearAll: () => void
  setSettings: (patch: Partial<Settings>) => void
  tick: (now: number) => void
}

const uid = () => Math.random().toString(36).slice(2, 10)
const PEEK_MS = 2600

function withLog(log: LogEntry[], text: string): LogEntry[] {
  return [{ id: uid(), t: Date.now(), text }, ...log].slice(0, 40)
}

export const useIsland = create<IslandState>()((set, get) => ({
  activities: [],
  expandedId: null,
  pinnedId: null,
  peekUntil: 0,
  settings: DEFAULT_SETTINGS,
  log: [],

  trigger: (kind, patch) => {
    const now = Date.now()
    const { activities, settings, log } = get()
    const existing = activities.find((a) => a.kind === kind)
    const data = { ...createData(kind, now, existing?.data as DataMap[typeof kind] | undefined), ...patch }
    // Re-triggering keeps the id so content updates in place instead of crossfading.
    const act = { id: existing?.id ?? uid(), kind, createdAt: now, data } as Activity
    const next = [...activities.filter((a) => a.kind !== kind), act]
    const s: Partial<IslandState> = { activities: next, log: withLog(log, META[kind].label) }
    if (kind === 'call') {
      s.expandedId = act.id
      s.peekUntil = 0
      s.pinnedId = null
    } else if (META[kind].presentation === 'live' && settings.autoPeek && !existing) {
      s.expandedId = act.id
      s.peekUntil = now + PEEK_MS
      s.pinnedId = act.id
    }
    set(s)
  },

  update: (id, patch) =>
    set((st) => ({
      activities: st.activities.map((a) => (a.id === id ? ({ ...a, data: { ...a.data, ...patch } } as Activity) : a)),
    })),

  dismiss: (id) =>
    set((st) => {
      const a = st.activities.find((x) => x.id === id)
      return {
        activities: st.activities.filter((x) => x.id !== id),
        expandedId: st.expandedId === id ? null : st.expandedId,
        pinnedId: st.pinnedId === id ? null : st.pinnedId,
        log: a ? withLog(st.log, `${META[a.kind].label} dismissed`) : st.log,
      }
    }),

  setExpanded: (id) => set({ expandedId: id, peekUntil: 0 }),

  pin: (id) => set({ pinnedId: id, expandedId: id, peekUntil: 0 }),

  clearAll: () => set((st) => ({ activities: [], expandedId: null, pinnedId: null, peekUntil: 0, log: withLog(st.log, 'Cleared') })),

  setSettings: (patch) =>
    set((st) => {
      const next = { ...st.settings, ...patch }
      if (patch.preset && patch.preset !== 'custom') Object.assign(next, PRESETS[patch.preset])
      else if (patch.duration !== undefined || patch.bounce !== undefined) next.preset = 'custom'
      return { settings: next }
    }),

  tick: (now) => {
    const st = get()
    let changed = false
    let expandedId = st.expandedId
    let peekUntil = st.peekUntil
    const activities: Activity[] = []

    for (const a of st.activities) {
      const meta = META[a.kind]
      if (meta.presentation === 'alert') {
        if (now - a.createdAt > (meta.duration ?? 3) * st.settings.alertScale * 1000) {
          changed = true
          continue
        }
      } else if (a.kind === 'download') {
        if (a.data.doneAt && now - a.data.doneAt > 3800) {
          changed = true
          continue
        }
        if (!a.data.doneAt && downloadProgress(a.data, now) >= 1) {
          changed = true
          activities.push({ ...a, data: { ...a.data, doneAt: now } })
          continue
        }
      } else if (a.kind === 'timer') {
        if (a.data.doneAt && now - a.data.doneAt > 6000) {
          changed = true
          continue
        }
        if (!a.data.doneAt && !a.data.paused && timerRemaining(a.data, now) <= 0) {
          changed = true
          activities.push({ ...a, data: { ...a.data, doneAt: now } })
          continue
        }
      }
      activities.push(a)
    }

    if (peekUntil && now > peekUntil) {
      expandedId = null
      peekUntil = 0
      changed = true
    }
    if (expandedId && expandedId !== 'home' && !activities.some((a) => a.id === expandedId)) {
      expandedId = null
      changed = true
    }
    if (changed) set({ activities, expandedId, peekUntil })
  },
}))

export function resolveView(activities: Activity[], expandedId: string | null, pinnedId: string | null): ResolvedView {
  const lives = activities
    .filter(isLive)
    .sort(
      (a, b) =>
        Number(b.id === pinnedId) - Number(a.id === pinnedId) ||
        META[b.kind].priority - META[a.kind].priority ||
        b.createdAt - a.createdAt,
    )
  const alerts = activities.filter((a) => !isLive(a)).sort((a, b) => b.createdAt - a.createdAt)

  const urgent = lives.find(
    (a) => (a.kind === 'call' && a.data.status === 'ringing') || (a.kind === 'timer' && a.data.doneAt),
  )
  if (urgent) return { mode: 'expanded', activity: urgent, secondary: null }
  if (alerts[0]) return { mode: 'alert', activity: alerts[0], secondary: null }
  const primary = lives[0]
  if (primary && expandedId === primary.id) return { mode: 'expanded', activity: primary, secondary: null }
  if (primary) return { mode: 'compact', activity: primary, secondary: lives[1] ?? null }
  if (expandedId === 'home') return { mode: 'home', activity: null, secondary: null }
  return { mode: 'idle', activity: null, secondary: null }
}
