import {
  Bell,
  BatteryWarning,
  CalendarBlank,
  Camera,
  Copy,
  DownloadSimple,
  Headphones,
  Lightning,
  Microphone,
  Moon,
  MusicNotes,
  Phone,
  Play,
  Record,
  ScanSmiley,
  SpeakerHigh,
  Sun,
  Timer,
  Trash,
  X,
  type Icon,
} from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { KIND_ORDER, META, PRESETS } from '../island/meta'
import { resolveView, useIsland } from '../island/store'
import type { Kind, PresetName } from '../island/types'
import { Group, Row, Section, Segmented, Slider, Toggle } from './controls'
import { SCENARIOS, runScenario } from './scenarios'
import { WALLPAPERS } from './wallpapers'

export const KIND_ICON: Record<Kind, { Icon: Icon; color: string }> = {
  music: { Icon: MusicNotes, color: '#ff375f' },
  download: { Icon: DownloadSimple, color: '#0a84ff' },
  timer: { Icon: Timer, color: '#ff9f0a' },
  call: { Icon: Phone, color: '#30d158' },
  recording: { Icon: Record, color: '#ff453a' },
  hud: { Icon: SpeakerHigh, color: '#8e8e93' },
  notification: { Icon: Bell, color: '#ff3b30' },
  bluetooth: { Icon: Headphones, color: '#64d2ff' },
  charging: { Icon: Lightning, color: '#30d158' },
  lowBattery: { Icon: BatteryWarning, color: '#ff453a' },
  focus: { Icon: Moon, color: '#5e5ce6' },
  clipboard: { Icon: Copy, color: '#0a84ff' },
  unlock: { Icon: ScanSmiley, color: '#64d2ff' },
  event: { Icon: CalendarBlank, color: '#ff453a' },
  screenshot: { Icon: Camera, color: '#bf5af2' },
}

function TriggerTile({ kind, index }: { kind: Kind; index: number }) {
  const active = useIsland((s) => s.activities.some((a) => a.kind === kind))
  const { Icon, color } = KIND_ICON[kind]
  const meta = META[kind]
  return (
    <motion.button
      type="button"
      onClick={() => useIsland.getState().trigger(kind)}
      whileTap={{ scale: 0.95 }}
      className="group relative flex cursor-pointer items-center gap-2.5 rounded-xl bg-white/[0.045] px-2.5 py-2 text-left ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.08]"
      title={`${meta.hint}${index < 9 ? ` — press ${index + 1}` : ''}`}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px]" style={{ background: color }}>
        <Icon size={16} weight="fill" color="#fff" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12.5px] font-medium text-white/90">{meta.label}</span>
        <span className="block truncate text-[10.5px] text-white/40">{meta.presentation === 'live' ? 'Live activity' : 'Alert'}</span>
      </span>
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#30d158] shadow-[0_0_6px_#30d158]"
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function ActiveList() {
  const activities = useIsland((s) => s.activities)
  const expandedId = useIsland((s) => s.expandedId)
  const pinnedId = useIsland((s) => s.pinnedId)
  const view = resolveView(activities, expandedId, pinnedId)
  if (!activities.length) return <div className="rounded-2xl bg-white/[0.03] px-3.5 py-3 text-[12px] text-white/35 ring-1 ring-white/[0.05]">Nothing running. Fire a trigger above.</div>
  return (
    <Group>
      <AnimatePresence initial={false}>
        {activities.map((a) => {
          const { Icon, color } = KIND_ICON[a.kind]
          const role = view.activity?.id === a.id ? 'Showing' : view.secondary?.id === a.id ? 'Bubble' : META[a.kind].presentation === 'live' ? 'Queued' : 'Alert'
          return (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5 overflow-hidden px-3.5 py-2"
            >
              <Icon size={15} weight="fill" color={color} />
              <span className="flex-1 truncate text-[12.5px] text-white/85">{META[a.kind].label}</span>
              <span className="text-[10.5px] uppercase tracking-wide text-white/35">{role}</span>
              {META[a.kind].presentation === 'live' && (
                <button type="button" title="Focus" onClick={() => useIsland.getState().pin(a.id)} className="cursor-pointer rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white">
                  <Play size={12} weight="fill" />
                </button>
              )}
              <button type="button" title="Dismiss" onClick={() => useIsland.getState().dismiss(a.id)} className="cursor-pointer rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white">
                <X size={12} weight="bold" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </Group>
  )
}

export function Sidebar() {
  const s = useIsland((st) => st.settings)
  const set = useIsland((st) => st.setSettings)
  const trigger = useIsland((st) => st.trigger)
  const clearAll = useIsland((st) => st.clearAll)

  return (
    <aside className="lab-scroll flex h-full w-[380px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-white/[0.06] bg-[#0d0d0f]/80 px-4 py-5 backdrop-blur-xl">
      <header className="px-1">
        <div className="text-[17px] font-semibold tracking-[-0.02em] text-white">Island Lab</div>
        <div className="text-[12px] text-white/45">Dynamic Island for Windows — motion prototype</div>
      </header>

      <Section title="Triggers">
        <div className="grid grid-cols-2 gap-1.5">
          {KIND_ORDER.map((k, i) => (
            <TriggerTile key={k} kind={k} index={i} />
          ))}
        </div>
      </Section>

      <Section title="Scenarios">
        <div className="grid grid-cols-2 gap-1.5">
          {SCENARIOS.map((sc) => (
            <motion.button
              key={sc.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => runScenario(sc.id)}
              className="cursor-pointer rounded-xl bg-white/[0.045] px-3 py-2 text-left ring-1 ring-white/[0.06] hover:bg-white/[0.08]"
            >
              <div className="text-[12.5px] font-medium text-white/90">{sc.label}</div>
              <div className="text-[10.5px] text-white/40">{sc.hint}</div>
            </motion.button>
          ))}
        </div>
      </Section>

      <Section title="System inputs">
        <Group>
          <Row label="Volume">
            <div className="flex items-center gap-2">
              <SpeakerHigh size={14} className="text-white/40" />
              <Slider label="Volume" value={s.volume} min={0} max={1} step={0.01} format={(v) => `${Math.round(v * 100)}`} onChange={(v) => {
                set({ volume: v })
                trigger('hud', { variant: 'volume', value: v })
              }} />
            </div>
          </Row>
          <Row label="Brightness">
            <div className="flex items-center gap-2">
              <Sun size={14} className="text-white/40" />
              <Slider label="Brightness" value={s.brightness} min={0} max={1} step={0.01} format={(v) => `${Math.round(v * 100)}`} onChange={(v) => {
                set({ brightness: v })
                trigger('hud', { variant: 'brightness', value: v })
              }} />
            </div>
          </Row>
          <Row label="Microphone in use" hint="Privacy indicator dot">
            <span className="flex items-center gap-2">
              <Microphone size={14} className="text-[#ff9f0a]" />
              <Toggle label="Microphone in use" value={s.mic} onChange={(v) => set({ mic: v })} />
            </span>
          </Row>
          <Row label="Camera in use">
            <span className="flex items-center gap-2">
              <Camera size={14} className="text-[#30d158]" />
              <Toggle label="Camera in use" value={s.camera} onChange={(v) => set({ camera: v })} />
            </span>
          </Row>
        </Group>
      </Section>

      <Section title="Island">
        <Group>
          <Row label="Style" hint={s.style === 'attached' ? 'Fused to the top edge' : 'Floating capsule'}>
            <Segmented value={s.style} onChange={(v) => set({ style: v })} options={[{ value: 'attached', label: 'Notch' }, { value: 'floating', label: 'Pill' }]} />
          </Row>
          <Row label="When idle">
            <Segmented value={s.idle} onChange={(v) => set({ idle: v })} options={[{ value: 'pill', label: 'Show' }, { value: 'hidden', label: 'Hide' }]} />
          </Row>
          <Row label="Shoulder radius" hint="Concave blend into the edge">
            <Slider label="Shoulder radius" value={s.shoulder} min={0} max={20} step={1} format={(v) => `${v}px`} onChange={(v) => set({ shoulder: v })} />
          </Row>
          <Row label="Continuous corners" hint="Squircle via CSS corner-shape">
            <Toggle label="Continuous corners" value={s.squircle} onChange={(v) => set({ squircle: v })} />
          </Row>
          <Row label="Liquid merge" hint="Gooey split for the side bubble">
            <Toggle label="Liquid merge" value={s.liquid} onChange={(v) => set({ liquid: v })} />
          </Row>
          <Row label="Expand on hover">
            <Toggle label="Expand on hover" value={s.hoverExpand} onChange={(v) => set({ hoverExpand: v })} />
          </Row>
          <Row label="Peek new activities" hint="Briefly expand when one starts">
            <Toggle label="Peek new activities" value={s.autoPeek} onChange={(v) => set({ autoPeek: v })} />
          </Row>
          <Row label="Pull to expand" hint="Drag the island down / up">
            <Toggle label="Pull to expand" value={s.pullGesture} onChange={(v) => set({ pullGesture: v })} />
          </Row>
          <Row label="Press squish">
            <Toggle label="Press squish" value={s.squish} onChange={(v) => set({ squish: v })} />
          </Row>
          <Row label="Alert duration">
            <Slider label="Alert duration" value={s.alertScale} min={0.5} max={3} step={0.1} format={(v) => `${v.toFixed(1)}×`} onChange={(v) => set({ alertScale: v })} />
          </Row>
        </Group>
      </Section>

      <Section title="Motion">
        <Group>
          <div className="px-3.5 py-2.5">
            <Segmented<PresetName>
              value={s.preset}
              onChange={(v) => set({ preset: v })}
              options={[...(Object.keys(PRESETS) as PresetName[]).map((k) => ({ value: k, label: PRESETS[k as keyof typeof PRESETS].label })), { value: 'custom', label: 'Custom' }]}
            />
          </div>
          <Row label="Duration" hint="Spring visual duration">
            <Slider label="Duration" value={s.duration} min={0.15} max={1.2} step={0.01} format={(v) => `${v.toFixed(2)}s`} onChange={(v) => set({ duration: v })} />
          </Row>
          <Row label="Bounce">
            <Slider label="Bounce" value={s.bounce} min={0} max={0.7} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => set({ bounce: v })} />
          </Row>
          <Row label="Slow motion" hint="Inspect every frame">
            <Segmented value={s.slowmo} onChange={(v) => set({ slowmo: v })} options={[1, 3, 8].map((v) => ({ value: v, label: `${v}×` }))} />
          </Row>
          <Row label="Content blur" hint="Blur-morph between states">
            <Toggle label="Content blur" value={s.contentBlur} onChange={(v) => set({ contentBlur: v })} />
          </Row>
        </Group>
      </Section>

      <Section title="Desktop">
        <Group>
          <div className="flex gap-2 px-3.5 py-3">
            {WALLPAPERS.map((w, i) => (
              <button
                key={w.name}
                type="button"
                title={w.name}
                onClick={() => set({ wallpaper: i })}
                className="h-9 flex-1 cursor-pointer rounded-lg transition-transform hover:scale-105"
                style={{ background: w.css, boxShadow: s.wallpaper === i ? '0 0 0 2px #0d0d0f, 0 0 0 4px #0a84ff' : 'inset 0 0 0 1px rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>
          <Row label="Taskbar">
            <Segmented value={s.taskbar} onChange={(v) => set({ taskbar: v })} options={[{ value: 'win11', label: 'Windows 11' }, { value: 'win10', label: 'Windows 10' }]} />
          </Row>
        </Group>
      </Section>

      <Section
        title="Running"
        action={
          <button type="button" onClick={clearAll} className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-white/45 hover:bg-white/10 hover:text-white">
            <Trash size={12} /> Clear
          </button>
        }
      >
        <ActiveList />
      </Section>
    </aside>
  )
}
