export type Kind =
  | 'music'
  | 'download'
  | 'timer'
  | 'call'
  | 'recording'
  | 'hud'
  | 'notification'
  | 'bluetooth'
  | 'charging'
  | 'lowBattery'
  | 'focus'
  | 'clipboard'
  | 'unlock'
  | 'event'
  | 'screenshot'

/**
 * Time-based state is stored as `base` + `since` so views derive the live value
 * from the clock instead of the store ticking every frame.
 */
export interface DataMap {
  music: { track: number; playing: boolean; base: number; since: number }
  download: {
    file: string
    size: number
    speed: number
    base: number
    since: number
    paused: boolean
    doneAt: number | null
  }
  timer: { duration: number; base: number; since: number; paused: boolean; doneAt: number | null }
  call: { name: string; status: 'ringing' | 'active'; since: number; muted: boolean; hue: number }
  recording: { since: number }
  hud: { variant: 'volume' | 'brightness'; value: number }
  notification: { app: string; title: string; body: string; hue: number }
  bluetooth: { device: string; left: number; right: number; case: number }
  charging: { level: number }
  lowBattery: { level: number }
  focus: { mode: 'dnd' | 'sleep' | 'work'; on: boolean }
  clipboard: { text: string }
  unlock: { user: string }
  event: { title: string; minutes: number; where: string }
  screenshot: { hue: number }
}

export type Activity<K extends Kind = Kind> = {
  [P in K]: { id: string; kind: P; createdAt: number; data: DataMap[P] }
}[K]

export type Presentation = 'live' | 'alert'

export interface Size {
  w: number
  h: number
}

export type PresetName = 'apple' | 'snappy' | 'bouncy' | 'gentle' | 'custom'

export interface Settings {
  style: 'attached' | 'floating'
  idle: 'pill' | 'hidden'
  shoulder: number
  squircle: boolean
  liquid: boolean
  hoverExpand: boolean
  autoPeek: boolean
  alertScale: number
  squish: boolean
  pullGesture: boolean
  preset: PresetName
  duration: number
  bounce: number
  slowmo: number
  contentBlur: boolean
  wallpaper: number
  taskbar: 'win11' | 'win10'
  mic: boolean
  camera: boolean
  volume: number
  brightness: number
}

export type ViewMode = 'idle' | 'home' | 'compact' | 'expanded' | 'alert'

export interface ResolvedView {
  mode: ViewMode
  activity: Activity | null
  secondary: Activity | null
}
