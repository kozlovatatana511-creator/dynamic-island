import type { ComponentType } from 'react'
import type { Activity, Kind } from './types'
import * as A from './views/alerts'
import * as L from './views/live'

type View = ComponentType<{ a: Activity }>
interface Views {
  expanded: View
  compact?: View
  minimal?: View
}

const v = <K extends Kind>(views: {
  expanded: ComponentType<{ a: Extract<Activity, { kind: K }> }>
  compact?: ComponentType<{ a: Extract<Activity, { kind: K }> }>
  minimal?: ComponentType<{ a: Extract<Activity, { kind: K }> }>
}) => views as unknown as Views

export const VIEWS: Record<Kind, Views> = {
  music: v<'music'>({ expanded: L.MusicExpanded, compact: L.MusicCompact, minimal: L.MusicMinimal }),
  download: v<'download'>({ expanded: L.DownloadExpanded, compact: L.DownloadCompact, minimal: L.DownloadMinimal }),
  timer: v<'timer'>({ expanded: L.TimerExpanded, compact: L.TimerCompact, minimal: L.TimerMinimal }),
  call: v<'call'>({ expanded: L.CallExpanded, compact: L.CallCompact, minimal: L.CallMinimal }),
  recording: v<'recording'>({ expanded: L.RecordingExpanded, compact: L.RecordingCompact, minimal: L.RecordingMinimal }),
  hud: v<'hud'>({ expanded: A.HudView }),
  notification: v<'notification'>({ expanded: A.NotificationView }),
  bluetooth: v<'bluetooth'>({ expanded: A.BluetoothView }),
  charging: v<'charging'>({ expanded: A.ChargingView }),
  lowBattery: v<'lowBattery'>({ expanded: A.LowBatteryView }),
  focus: v<'focus'>({ expanded: A.FocusView }),
  clipboard: v<'clipboard'>({ expanded: A.ClipboardView }),
  unlock: v<'unlock'>({ expanded: A.UnlockView }),
  event: v<'event'>({ expanded: A.EventView }),
  screenshot: v<'screenshot'>({ expanded: A.ScreenshotView }),
}
