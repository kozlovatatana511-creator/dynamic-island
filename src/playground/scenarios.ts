import { KIND_ORDER } from '../island/meta'
import { useIsland } from '../island/store'
import type { Kind } from '../island/types'

type Step = [delayMs: number, run: () => void]

const t = (kind: Kind) => () => useIsland.getState().trigger(kind)
const collapse = () => useIsland.getState().setExpanded(null)

let timers: number[] = []

export const SCENARIOS: { id: string; label: string; hint: string; steps: () => Step[] }[] = [
  {
    id: 'morning',
    label: 'Morning flow',
    hint: 'Unlock → charge → music',
    steps: () => [
      [0, t('unlock')],
      [2700, t('charging')],
      [5400, t('music')],
      [8600, t('notification')],
      [13500, t('event')],
    ],
  },
  {
    id: 'stack',
    label: 'Multitask',
    hint: 'Music + download split',
    steps: () => [
      [0, t('music')],
      [700, collapse],
      [1300, t('download')],
      [1900, collapse],
      [3200, t('clipboard')],
    ],
  },
  {
    id: 'call',
    label: 'Call over music',
    hint: 'Interrupt & resume',
    steps: () => [
      [0, t('music')],
      [700, collapse],
      [1600, t('call')],
    ],
  },
  {
    id: 'stress',
    label: 'Stress test',
    hint: '40 events in 5s',
    steps: () =>
      Array.from({ length: 40 }, (_, i): Step => [
        i * 125,
        () => {
          const st = useIsland.getState()
          const r = Math.random()
          if (r < 0.15) return st.setExpanded(st.expandedId ? null : (st.activities.find((a) => a.kind !== 'call')?.id ?? null))
          if (r < 0.4) return st.trigger('hud', { variant: 'volume', value: Math.random() })
          const kinds = KIND_ORDER.filter((k) => k !== 'call')
          st.trigger(kinds[Math.floor(Math.random() * kinds.length)])
        },
      ]),
  },
]

export function runScenario(id: string) {
  timers.forEach(clearTimeout)
  timers = []
  const sc = SCENARIOS.find((s) => s.id === id)
  if (!sc) return
  useIsland.getState().clearAll()
  for (const [delay, run] of sc.steps()) timers.push(window.setTimeout(run, delay + 150))
}
