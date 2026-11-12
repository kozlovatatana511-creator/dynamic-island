import {
  Bed,
  Briefcase,
  CalendarBlank,
  ChatCircleText,
  Copy,
  EnvelopeSimple,
  Hash,
  Headphones,
  Lightning,
  Moon,
  Scan,
  SpeakerHigh,
  SpeakerLow,
  SpeakerNone,
  SpeakerSlash,
  Sun,
  SunDim,
  Waveform,
  type Icon,
} from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useIsland } from '../store'
import type { Activity } from '../types'
import { BatteryGlyph, C, IconTile, IslandButton, ProgressRing, RollingText, Strip, SwapIcon } from '../ui'

type P<K extends Activity['kind']> = { a: Extract<Activity, { kind: K }> }

/* ─────────────────────────────── HUD ─────────────────────────────── */

export function HudView({ a }: P<'hud'>) {
  const { variant, value } = a.data
  const vol = variant === 'volume'
  let IconC: Icon = Sun
  let iconId = 'sun'
  if (vol) {
    ;[IconC, iconId] = value === 0 ? [SpeakerSlash, 'mute'] : value < 0.34 ? [SpeakerNone, 'none'] : value < 0.67 ? [SpeakerLow, 'low'] : [SpeakerHigh, 'high']
  } else if (value < 0.5) {
    ;[IconC, iconId] = [SunDim, 'dim']
  }
  return (
    <div className="flex h-full items-center gap-3 px-4">
      <SwapIcon id={iconId}>
        <IconC size={19} weight="fill" color="#fff" />
      </SwapIcon>
      <div className="relative h-[6px] flex-1 overflow-hidden rounded-full bg-white/18">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: vol ? '#fff' : C.yellow }}
          initial={false}
          animate={{ width: `${value * 100}%` }}
          transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.2 }}
        />
      </div>
      <RollingText text={String(Math.round(value * 100))} className="w-7 justify-end text-[13px] font-semibold text-white/80" />
    </div>
  )
}

/* ─────────────────────────── Notification ────────────────────────── */

const APP_ICONS: Record<string, Icon> = { Messages: ChatCircleText, Mail: EnvelopeSimple, Slack: Hash, Discord: Waveform }

export function NotificationView({ a }: P<'notification'>) {
  const d = a.data
  const AppIcon = APP_ICONS[d.app] ?? ChatCircleText
  return (
    <div className="flex h-full items-center gap-3 px-4">
      <motion.span initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', visualDuration: 0.45, bounce: 0.45, delay: 0.05 }}>
        <IconTile bg={`linear-gradient(160deg, hsl(${d.hue} 75% 60%), hsl(${d.hue + 20} 80% 40%))`} size={44} radius={12}>
          <AppIcon size={24} weight="fill" />
        </IconTile>
      </motion.span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[14px] font-semibold tracking-[-0.01em] text-white">{d.title}</span>
          <span className="shrink-0 text-[11px] text-white/45">now</span>
        </div>
        <div className="truncate text-[13px] leading-snug text-white/60">{d.body}</div>
        <div className="text-[11px] text-white/35">{d.app}</div>
      </div>
    </div>
  )
}

/* ──────────────────────────── Bluetooth ──────────────────────────── */

export function BluetoothView({ a }: P<'bluetooth'>) {
  const d = a.data
  const ring = (v: number, label: string, delay: number) => (
    <motion.span
      className="flex flex-col items-center gap-0.5"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.3, delay }}
    >
      <ProgressRing value={v / 100} size={30} stroke={3} color={v < 25 ? C.red : C.green} track="rgba(48,209,88,0.18)">
        <span className="text-[9px] font-semibold text-white">{label}</span>
      </ProgressRing>
    </motion.span>
  )
  return (
    <div className="flex h-full items-center gap-3 px-4">
      <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', visualDuration: 0.5, bounce: 0.5 }}>
        <IconTile bg="linear-gradient(160deg, #f5f5f7, #c7c7cc)" size={44} radius={22}>
          <Headphones size={24} weight="fill" color="#1c1c1e" />
        </IconTile>
      </motion.span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold text-white">{d.device}</div>
        <div className="text-[12px]" style={{ color: C.green }}>
          Connected
        </div>
      </div>
      <div className="flex gap-2">
        {ring(d.left, 'L', 0.12)}
        {ring(d.right, 'R', 0.18)}
        {ring(d.case, '◼', 0.24)}
      </div>
    </div>
  )
}

/* ───────────────────────── Charging / Battery ────────────────────── */

export function ChargingView({ a }: P<'charging'>) {
  return (
    <Strip
      pad={14}
      leading={
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
          <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', visualDuration: 0.5, bounce: 0.55, delay: 0.1 }}>
            <Lightning size={16} weight="fill" color={C.green} />
          </motion.span>
          Charging
        </span>
      }
      trailing={
        <span className="flex items-center gap-2">
          <span className="text-[13px] font-semibold tabular-nums" style={{ color: C.green }}>
            {a.data.level}%
          </span>
          <BatteryGlyph level={a.data.level / 100} color={C.green} />
        </span>
      }
    />
  )
}

export function LowBatteryView({ a }: P<'lowBattery'>) {
  return (
    <Strip
      pad={14}
      leading={<span className="text-[13px] font-semibold text-white">Low Battery</span>}
      trailing={
        <span className="flex items-center gap-2">
          <motion.span className="text-[13px] font-semibold tabular-nums" style={{ color: C.red }} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
            {a.data.level}%
          </motion.span>
          <BatteryGlyph level={a.data.level / 100} color={C.red} />
        </span>
      }
    />
  )
}

/* ────────────────────────────── Focus ────────────────────────────── */

const FOCUS = {
  dnd: { label: 'Do Not Disturb', Icon: Moon, color: C.indigo },
  sleep: { label: 'Sleep', Icon: Bed, color: C.teal },
  work: { label: 'Work', Icon: Briefcase, color: C.orange },
}

export function FocusView({ a }: P<'focus'>) {
  const f = FOCUS[a.data.mode]
  const on = a.data.on
  return (
    <Strip
      pad={14}
      leading={
        <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
          <motion.span
            className="grid h-6 w-6 place-items-center rounded-full"
            initial={{ rotate: -90, scale: 0.5 }}
            animate={{ rotate: 0, scale: 1, backgroundColor: on ? f.color : 'rgba(255,255,255,0.15)' }}
            transition={{ type: 'spring', visualDuration: 0.5, bounce: 0.4 }}
          >
            <f.Icon size={14} weight="fill" color="#fff" />
          </motion.span>
          {f.label}
        </span>
      }
      trailing={
        <span className="text-[13px] font-semibold" style={{ color: on ? f.color : C.dim }}>
          {on ? 'On' : 'Off'}
        </span>
      }
    />
  )
}

/* ──────────────────────────── Clipboard ──────────────────────────── */

export function ClipboardView({ a }: P<'clipboard'>) {
  return (
    <Strip
      pad={14}
      leading={
        <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
          <motion.span initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.5 }}>
            <Copy size={17} weight="fill" color={C.blue} />
          </motion.span>
          Copied
        </span>
      }
      trailing={
        <span className="max-w-[200px] truncate rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11.5px] text-white/70">{a.data.text}</span>
      }
    />
  )
}

/* ───────────────────────────── Unlock ────────────────────────────── */

export function UnlockView({ a }: P<'unlock'>) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setOk(true), 950)
    return () => clearTimeout(t)
  }, [a.createdAt])
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="relative grid h-16 w-16 place-items-center">
        <SwapIcon id={ok ? 'ok' : 'scan'}>
          {ok ? (
            <svg width="62" height="62" viewBox="0 0 64 64">
              <motion.circle cx="32" cy="32" r="28" fill="none" stroke={C.green} strokeWidth="3.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }} />
              <motion.path d="M21 33l7.5 7.5L44 25" fill="none" stroke={C.green} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.3, ease: [0.65, 0, 0.35, 1] }} />
            </svg>
          ) : (
            <span className="relative block">
              <Scan size={62} weight="light" color="#fff" />
              <motion.span
                className="absolute inset-x-2 h-[2px] rounded-full"
                style={{ background: C.teal, boxShadow: `0 0 10px ${C.teal}` }}
                animate={{ top: ['18%', '80%', '18%'] }}
                transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity }}
              />
            </span>
          )}
        </SwapIcon>
      </div>
      <SwapIcon id={ok ? 'w' : 's'}>
        <span className="text-[13px] font-semibold text-white">{ok ? `Welcome, ${a.data.user}` : 'Looking for you…'}</span>
      </SwapIcon>
    </div>
  )
}

/* ────────────────────────────── Event ────────────────────────────── */

export function EventView({ a }: P<'event'>) {
  const d = new Date()
  return (
    <div className="flex h-full items-center gap-3 px-4">
      <span className="flex h-11 w-11 shrink-0 flex-col items-center overflow-hidden rounded-xl bg-white">
        <span className="w-full py-[1px] text-center text-[8.5px] font-bold uppercase tracking-wide text-white" style={{ background: C.red }}>
          {d.toLocaleDateString('en-US', { weekday: 'short' })}
        </span>
        <span className="text-[20px] font-semibold leading-[26px] text-black">{d.getDate()}</span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: C.red }}>
          <CalendarBlank size={12} weight="fill" /> in {a.data.minutes} min
        </div>
        <div className="truncate text-[14px] font-semibold text-white">{a.data.title}</div>
        <div className="truncate text-[12px] text-white/50">{a.data.where}</div>
      </div>
      <IslandButton label="Join" tone="blue" size={32} wide onPress={() => useIsland.getState().dismiss(a.id)}>
        <span className="text-[13px] font-semibold">Join</span>
      </IslandButton>
    </div>
  )
}

/* ──────────────────────────── Screenshot ─────────────────────────── */

export function ScreenshotView({ a }: P<'screenshot'>) {
  const h = a.data.hue
  return (
    <div className="flex h-full items-center gap-3 px-3">
      <motion.span
        className="relative block h-[38px] w-[60px] shrink-0 overflow-hidden rounded-md"
        style={{ background: `linear-gradient(135deg, hsl(${h} 80% 60%), hsl(${h + 60} 70% 35%))`, boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}
        initial={{ scale: 1.6, rotate: -6 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', visualDuration: 0.5, bounce: 0.35 }}
      >
        <motion.span className="absolute inset-0 bg-white" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} />
      </motion.span>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-white">Screenshot saved</div>
        <div className="truncate text-[11.5px] text-white/50">Pictures › Screenshots</div>
      </div>
    </div>
  )
}
