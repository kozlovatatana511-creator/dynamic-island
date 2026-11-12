import type { Activity, DataMap, Kind, Presentation, PresetName, Settings, Size } from './types'

export interface Meta {
  label: string
  hint: string
  priority: number
  presentation: Presentation
  /** Alert lifetime in seconds, scaled by Settings.alertScale. */
  duration?: number
  compactW?: number
  expanded: Size
}

export const META: Record<Kind, Meta> = {
  call: { label: 'Incoming call', hint: 'Ringing → accept to go live', priority: 100, presentation: 'live', compactW: 250, expanded: { w: 404, h: 84 } },
  recording: { label: 'Screen recording', hint: 'Live timer, stop control', priority: 70, presentation: 'live', compactW: 220, expanded: { w: 360, h: 76 } },
  download: { label: 'Download', hint: 'Progress, speed, ETA', priority: 60, presentation: 'live', compactW: 270, expanded: { w: 404, h: 116 } },
  timer: { label: 'Timer', hint: 'Countdown, rings at zero', priority: 50, presentation: 'live', compactW: 236, expanded: { w: 380, h: 84 } },
  music: { label: 'Now playing', hint: 'Art, scrubber, controls', priority: 40, presentation: 'live', compactW: 286, expanded: { w: 420, h: 172 } },
  unlock: { label: 'Windows Hello', hint: 'Face scan → unlocked', priority: 99, presentation: 'alert', duration: 2.4, expanded: { w: 168, h: 152 } },
  hud: { label: 'Volume / Brightness', hint: 'System HUD replacement', priority: 95, presentation: 'alert', duration: 1.6, expanded: { w: 336, h: 44 } },
  notification: { label: 'Notification', hint: 'Message banner', priority: 90, presentation: 'alert', duration: 4.5, expanded: { w: 404, h: 80 } },
  bluetooth: { label: 'Earbuds connected', hint: 'Device + battery rings', priority: 88, presentation: 'alert', duration: 3.6, expanded: { w: 404, h: 80 } },
  charging: { label: 'Charging', hint: 'Plugged in strip', priority: 86, presentation: 'alert', duration: 2.6, expanded: { w: 330, h: 40 } },
  lowBattery: { label: 'Low battery', hint: 'Warning strip', priority: 86, presentation: 'alert', duration: 3.2, expanded: { w: 330, h: 40 } },
  focus: { label: 'Focus mode', hint: 'Do Not Disturb toggle', priority: 84, presentation: 'alert', duration: 2.2, expanded: { w: 312, h: 40 } },
  clipboard: { label: 'Copied', hint: 'Clipboard preview', priority: 82, presentation: 'alert', duration: 2.2, expanded: { w: 360, h: 44 } },
  event: { label: 'Upcoming event', hint: 'Calendar with join', priority: 80, presentation: 'alert', duration: 5, expanded: { w: 404, h: 80 } },
  screenshot: { label: 'Screenshot', hint: 'Capture saved', priority: 80, presentation: 'alert', duration: 2.6, expanded: { w: 320, h: 60 } },
}

export const KIND_ORDER: Kind[] = [
  'music', 'download', 'timer', 'call', 'recording', 'hud', 'notification', 'bluetooth',
  'charging', 'lowBattery', 'focus', 'clipboard', 'unlock', 'event', 'screenshot',
]

export const HOME_SIZE: Size = { w: 460, h: 158 }

export const PRESETS: Record<Exclude<PresetName, 'custom'>, { duration: number; bounce: number; label: string }> = {
  apple: { label: 'Apple', duration: 0.5, bounce: 0.28 },
  snappy: { label: 'Snappy', duration: 0.34, bounce: 0.16 },
  bouncy: { label: 'Bouncy', duration: 0.6, bounce: 0.45 },
  gentle: { label: 'Gentle', duration: 0.75, bounce: 0.08 },
}

export const DEFAULT_SETTINGS: Settings = {
  style: 'attached',
  idle: 'pill',
  shoulder: 10,
  squircle: true,
  liquid: true,
  hoverExpand: false,
  autoPeek: true,
  alertScale: 1,
  squish: true,
  pullGesture: true,
  preset: 'apple',
  duration: PRESETS.apple.duration,
  bounce: PRESETS.apple.bounce,
  slowmo: 1,
  contentBlur: true,
  wallpaper: 0,
  taskbar: 'win11',
  mic: false,
  camera: false,
  volume: 0.62,
  brightness: 0.8,
}

export const TRACKS = [
  { title: 'Neon Tide', artist: 'Lumen Park', length: 214, colors: ['#ff6a3d', '#ff2d7a', '#5b2bff'], accent: '#ff6a5c' },
  { title: 'Glass Hours', artist: 'Okeanos', length: 247, colors: ['#2af5ff', '#2b6bff', '#1b1464'], accent: '#5ab8ff' },
  { title: 'Afterglow FM', artist: 'Vera Lane', length: 198, colors: ['#ffd36a', '#ff8a3d', '#b2245b'], accent: '#ffb35c' },
  { title: 'Static Bloom', artist: 'The Halflights', length: 231, colors: ['#9dff8a', '#1fb57a', '#0d3b4a'], accent: '#6be39a' },
  { title: 'Paper Planes at Dawn', artist: 'Kiyo', length: 186, colors: ['#f0b3ff', '#8a5cff', '#21134d'], accent: '#c48bff' },
]

const FILES = [
  { file: 'Blender-4.4-windows-x64.msi', size: 382e6 },
  { file: 'Wallpapers-8K-Collection.zip', size: 640e6 },
  { file: 'Q3-Product-Review.mp4', size: 512e6 },
  { file: 'node-v24.11.0-x64.msi', size: 31e6 },
  { file: 'Design-Assets-v2.zip', size: 228e6 },
]

const NOTIFS = [
  { app: 'Messages', title: 'Alex Rivera', body: 'Are we still on for 7? I booked the table 🍜', hue: 140 },
  { app: 'Mail', title: 'Design review moved', body: 'The sync is now Thursday at 15:00 — new invite attached.', hue: 215 },
  { app: 'Slack', title: '#launch', body: 'Mira: build 2.4 is green, shipping to beta in 10', hue: 300 },
  { app: 'Discord', title: 'Kenji', body: 'yo the island animations are actually unreal', hue: 240 },
]

const CALLERS = [
  { name: 'Mom', hue: 340 },
  { name: 'Daniel Okafor', hue: 200 },
  { name: 'Sofia Marquez', hue: 30 },
]

const CLIPS = [
  'npm create tauri-app@latest',
  'https://github.com/dynamic-island/win',
  '#0A84FF',
  'The quick brown fox jumps over the lazy dog',
]

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const rand = (a: number, b: number) => a + Math.random() * (b - a)

export function createData<K extends Kind>(kind: K, now: number, prev?: DataMap[K]): DataMap[K] {
  const make = (): DataMap[Kind] => {
    switch (kind) {
      case 'music': {
        const p = prev as DataMap['music'] | undefined
        return { track: p ? (p.track + 1) % TRACKS.length : 0, playing: true, base: 0, since: now }
      }
      case 'download': {
        const f = pick(FILES)
        // Tuned so a download completes in a watchable 6–12s.
        const speed = f.size / rand(6, 12)
        return { ...f, speed, base: 0, since: now, paused: false, doneAt: null }
      }
      case 'timer':
        return { duration: 15_000, base: 15_000, since: now, paused: false, doneAt: null }
      case 'call':
        return { ...pick(CALLERS), status: 'ringing', since: now, muted: false }
      case 'recording':
        return { since: now }
      case 'hud':
        return { variant: 'volume', value: 0.6 }
      case 'notification':
        return pick(NOTIFS)
      case 'bluetooth':
        return { device: 'Nova Buds Pro', left: Math.round(rand(60, 100)), right: Math.round(rand(60, 100)), case: Math.round(rand(30, 90)) }
      case 'charging':
        return { level: Math.round(rand(35, 92)) }
      case 'lowBattery':
        return { level: 10 }
      case 'focus': {
        const p = prev as DataMap['focus'] | undefined
        return { mode: p?.mode ?? 'dnd', on: p ? !p.on : true }
      }
      case 'clipboard':
        return { text: pick(CLIPS) }
      case 'unlock':
        return { user: 'Tatiana' }
      case 'event':
        return { title: 'Design sync', minutes: 5, where: 'Teams · Room 4B' }
      case 'screenshot':
        return { hue: Math.round(rand(0, 360)) }
    }
  }
  return make() as DataMap[K]
}

export const isLive = (a: Activity) => META[a.kind].presentation === 'live'

export function musicPosition(d: DataMap['music'], now: number) {
  const len = TRACKS[d.track].length
  const pos = d.base + (d.playing ? (now - d.since) / 1000 : 0)
  return ((pos % len) + len) % len
}

export function downloadProgress(d: DataMap['download'], now: number) {
  if (d.doneAt) return 1
  const bytes = d.base + (d.paused ? 0 : ((now - d.since) / 1000) * d.speed)
  return Math.min(1, bytes / d.size)
}

export function timerRemaining(d: DataMap['timer'], now: number) {
  return Math.max(0, d.base - (d.paused ? 0 : now - d.since))
}

export function formatClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m % 60).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

export function formatBytes(b: number) {
  if (b >= 1e9) return `${(b / 1e9).toFixed(2)} GB`
  if (b >= 1e6) return `${(b / 1e6).toFixed(b >= 1e8 ? 0 : 1)} MB`
  return `${Math.round(b / 1e3)} KB`
}
