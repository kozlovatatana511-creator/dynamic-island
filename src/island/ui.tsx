import { AnimatePresence, motion, useSpring, useTransform, type Transition } from 'motion/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { TRACKS } from './meta'
import { useIsland } from './store'

/** Re-renders at most `fps` times a second while mounted. */
export function useNow(fps = 30, active = true) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = 0
    const loop = (t: number) => {
      if (t - last >= 1000 / fps) {
        last = t
        setNow(Date.now())
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [fps, active])
  return now
}

/** The island's master spring, honouring the playground's preset and slow-motion. */
export function useIslandSpring(scale = 1, bounceScale = 1): Transition {
  const duration = useIsland((s) => s.settings.duration)
  const bounce = useIsland((s) => s.settings.bounce)
  const slowmo = useIsland((s) => s.settings.slowmo)
  return useMemo(
    () => ({ type: 'spring', visualDuration: duration * scale * slowmo, bounce: Math.min(0.9, bounce * bounceScale) }),
    [duration, bounce, slowmo, scale, bounceScale],
  )
}

export const C = {
  green: '#30d158',
  orange: '#ff9f0a',
  red: '#ff453a',
  blue: '#0a84ff',
  purple: '#bf5af2',
  indigo: '#5e5ce6',
  yellow: '#ffd60a',
  teal: '#64d2ff',
  dim: 'rgba(255,255,255,0.56)',
  faint: 'rgba(255,255,255,0.12)',
}

type Tone = 'neutral' | 'green' | 'red' | 'orange' | 'white' | 'ghost' | 'blue'
const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: 'rgba(255,255,255,0.14)', fg: '#fff' },
  ghost: { bg: 'rgba(255,255,255,0)', fg: '#fff' },
  white: { bg: '#fff', fg: '#000' },
  green: { bg: C.green, fg: '#fff' },
  red: { bg: C.red, fg: '#fff' },
  orange: { bg: 'rgba(255,159,10,0.24)', fg: C.orange },
  blue: { bg: C.blue, fg: '#fff' },
}

export function IslandButton({
  children,
  onPress,
  size = 36,
  tone = 'neutral',
  label,
  wide,
}: {
  children: ReactNode
  onPress: () => void
  size?: number
  tone?: Tone
  label: string
  wide?: boolean
}) {
  const t = TONES[tone]
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      data-island-control
      onClick={(e) => {
        e.stopPropagation()
        onPress()
      }}
      whileHover={{ scale: 1.06, filter: 'brightness(1.15)' }}
      whileTap={{ scale: 0.86 }}
      transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.4 }}
      className="grid shrink-0 cursor-pointer place-items-center rounded-full outline-none"
      style={{
        height: size,
        minWidth: size,
        padding: wide ? '0 14px' : 0,
        background: t.bg,
        color: t.fg,
      }}
    >
      {children}
    </motion.button>
  )
}

/** Crossfades between icons with a blur-scale swap. */
export function SwapIcon({ id, children }: { id: string; children: ReactNode }) {
  return (
    <span className="relative grid place-items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={id}
          className="grid place-items-center"
          initial={{ opacity: 0, scale: 0.4, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.4, filter: 'blur(4px)' }}
          transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.35 }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/** Per-character rolling text: changed glyphs slide in vertically, like iOS counters. */
export function RollingText({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const chars = text.split('')
  return (
    <span className={`inline-flex tabular-nums ${className ?? ''}`} style={style} aria-label={text}>
      {chars.map((ch, i) => (
        <span key={chars.length - i} className="relative inline-flex overflow-hidden" aria-hidden>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ch}
              className="inline-block"
              initial={{ y: '-70%', opacity: 0, filter: 'blur(2px)' }}
              animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: '70%', opacity: 0, filter: 'blur(2px)' }}
              transition={{ type: 'spring', visualDuration: 0.32, bounce: 0.2 }}
            >
              {ch === ' ' ? '\u00a0' : ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}

const BAR_TIMINGS = [0.9, 0.62, 0.78, 0.55, 0.7]

export function Equalizer({ playing, color, bars = 4, height = 16 }: { playing: boolean; color: string; bars?: number; height?: number }) {
  return (
    <div className="flex items-center gap-[2.5px]" style={{ height }}>
      {Array.from({ length: bars }, (_, i) => (
        <motion.span
          key={i}
          className="block w-[3px] origin-center rounded-full"
          style={{ height, background: color }}
          animate={playing ? { scaleY: [0.3, 1, 0.45, 0.85, 0.3] } : { scaleY: 0.2 }}
          transition={
            playing
              ? { duration: BAR_TIMINGS[i % BAR_TIMINGS.length] * 1.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }
              : { type: 'spring', visualDuration: 0.4, bounce: 0.3 }
          }
        />
      ))}
    </div>
  )
}

export function ProgressRing({
  value,
  size = 20,
  stroke = 2.5,
  color = C.blue,
  track = 'rgba(255,255,255,0.16)',
  children,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const v = useSpring(value, { visualDuration: 0.4, bounce: 0 })
  useEffect(() => v.set(value), [v, value])
  const offset = useTransform(v, (x) => circ * (1 - Math.max(0, Math.min(1, x))))
  return (
    <span className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      {children && <span className="absolute inset-0 grid place-items-center">{children}</span>}
    </span>
  )
}

export function AlbumArt({ track, size, radius }: { track: number; size: number; radius: number }) {
  const t = TRACKS[track]
  const [a, b, c] = t.colors
  return (
    <motion.span
      layout={false}
      className="relative block shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `radial-gradient(120% 120% at 15% 10%, ${a} 0%, transparent 55%), radial-gradient(100% 100% at 90% 90%, ${c} 0%, transparent 60%), linear-gradient(135deg, ${b}, ${c})`,
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.18)',
      }}
    >
      <span
        className="absolute rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          left: size * 0.38,
          top: size * 0.12,
          background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.75), ${a} 40%, transparent 72%)`,
          filter: `blur(${Math.max(1, size / 22)}px)`,
          opacity: 0.85,
        }}
      />
    </motion.span>
  )
}

export function BatteryGlyph({ level, color, width = 26 }: { level: number; color: string; width?: number }) {
  const h = width * 0.48
  return (
    <span className="relative inline-flex items-center" style={{ width: width + 3, height: h }}>
      <span
        className="relative block h-full overflow-hidden"
        style={{ width, borderRadius: h * 0.32, boxShadow: 'inset 0 0 0 1.2px rgba(255,255,255,0.4)', padding: 2 }}
      >
        <motion.span
          className="block h-full"
          style={{ background: color, borderRadius: h * 0.18, originX: 0 }}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.round(level * 100)}%` }}
          transition={{ type: 'spring', visualDuration: 0.9, bounce: 0.1, delay: 0.15 }}
        />
      </span>
      <span className="ml-[1.5px] block rounded-r-sm" style={{ width: 2, height: h * 0.38, background: 'rgba(255,255,255,0.4)' }} />
    </span>
  )
}

/** Generic strip layout used by compact views and slim alerts. */
export function Strip({ leading, trailing, pad = 10 }: { leading: ReactNode; trailing: ReactNode; pad?: number }) {
  return (
    <div className="flex h-full w-full items-center justify-between" style={{ paddingLeft: pad, paddingRight: pad }}>
      <div className="flex min-w-0 items-center gap-2">{leading}</div>
      <div className="flex min-w-0 items-center gap-2">{trailing}</div>
    </div>
  )
}

export function IconTile({ children, bg, size = 40, radius = 11 }: { children: ReactNode; bg: string; size?: number; radius?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center text-white"
      style={{ width: size, height: size, borderRadius: radius, background: bg, boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.2)' }}
    >
      {children}
    </span>
  )
}

/** A pulsing dot used for recording / call indicators. */
export function PulseDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span className="relative grid place-items-center" style={{ width: size * 2, height: size * 2 }}>
      <motion.span
        className="absolute rounded-full"
        style={{ width: size, height: size, background: color }}
        animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.span
        className="rounded-full"
        style={{ width: size, height: size, background: color, boxShadow: `0 0 8px ${color}` }}
        animate={{ opacity: [1, 0.55, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </span>
  )
}
