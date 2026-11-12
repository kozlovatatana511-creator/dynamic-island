import {
  ArrowClockwise,
  CheckCircle,
  DownloadSimple,
  FileArchive,
  FileVideo,
  FolderOpen,
  Microphone,
  MicrophoneSlash,
  Package,
  Pause,
  Phone,
  PhoneDisconnect,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Stop,
  Timer,
  X,
} from '@phosphor-icons/react'
import { motion } from 'motion/react'
import {
  TRACKS,
  downloadProgress,
  formatBytes,
  formatClock,
  musicPosition,
  timerRemaining,
} from '../meta'
import { useIsland } from '../store'
import type { Activity } from '../types'
import {
  AlbumArt,
  C,
  Equalizer,
  IconTile,
  IslandButton,
  ProgressRing,
  PulseDot,
  RollingText,
  Strip,
  SwapIcon,
  useNow,
} from '../ui'

type P<K extends Activity['kind']> = { a: Extract<Activity, { kind: K }> }

const update = (id: string, patch: object) => useIsland.getState().update(id, patch)
const dismiss = (id: string) => useIsland.getState().dismiss(id)

/* ───────────────────────────── Music ───────────────────────────── */

function togglePlay(a: P<'music'>['a']) {
  const now = Date.now()
  update(a.id, { playing: !a.data.playing, base: musicPosition(a.data, now), since: now })
}
function skip(a: P<'music'>['a'], dir: 1 | -1) {
  update(a.id, { track: (a.data.track + dir + TRACKS.length) % TRACKS.length, base: 0, since: Date.now(), playing: true })
}

export function MusicCompact({ a }: P<'music'>) {
  const t = TRACKS[a.data.track]
  return (
    <Strip
      pad={7}
      leading={<AlbumArt track={a.data.track} size={22} radius={6} />}
      trailing={
        <span className="pr-1">
          <Equalizer playing={a.data.playing} color={t.accent} />
        </span>
      }
    />
  )
}

export function MusicMinimal({ a }: P<'music'>) {
  return <AlbumArt track={a.data.track} size={20} radius={10} />
}

export function MusicExpanded({ a }: P<'music'>) {
  const now = useNow(30, a.data.playing)
  const t = TRACKS[a.data.track]
  const pos = musicPosition(a.data, now)
  const pct = pos / t.length
  return (
    <div className="flex h-full flex-col px-[18px] pb-4 pt-4">
      <div className="flex items-center gap-3.5">
        <motion.div initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', visualDuration: 0.5, bounce: 0.35 }}>
          <AlbumArt track={a.data.track} size={58} radius={14} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold tracking-[-0.01em] text-white">{t.title}</div>
          <div className="truncate text-[13px] text-white/55">{t.artist}</div>
        </div>
        <Equalizer playing={a.data.playing} color={t.accent} bars={5} height={20} />
      </div>

      <div className="mt-3.5 flex items-center gap-2.5 text-[11px] font-medium tabular-nums text-white/50">
        <span className="w-8">{formatClock(pos)}</span>
        <div className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-white/15">
          <div className="absolute inset-y-0 left-0 rounded-full bg-white/90" style={{ width: `${pct * 100}%` }} />
        </div>
        <span className="w-8 text-right">-{formatClock(t.length - pos)}</span>
      </div>

      <div className="mt-2.5 flex items-center justify-between px-1">
        <IslandButton label="Shuffle" tone="ghost" size={32} onPress={() => {}}>
          <Shuffle size={17} className="text-white/50" />
        </IslandButton>
        <div className="flex items-center gap-5">
          <IslandButton label="Previous" tone="ghost" size={40} onPress={() => skip(a, -1)}>
            <SkipBack size={24} weight="fill" />
          </IslandButton>
          <IslandButton label={a.data.playing ? 'Pause' : 'Play'} tone="ghost" size={44} onPress={() => togglePlay(a)}>
            <SwapIcon id={a.data.playing ? 'pause' : 'play'}>
              {a.data.playing ? <Pause size={32} weight="fill" /> : <Play size={32} weight="fill" />}
            </SwapIcon>
          </IslandButton>
          <IslandButton label="Next" tone="ghost" size={40} onPress={() => skip(a, 1)}>
            <SkipForward size={24} weight="fill" />
          </IslandButton>
        </div>
        <IslandButton label="Repeat" tone="ghost" size={32} onPress={() => {}}>
          <Repeat size={17} className="text-white/50" />
        </IslandButton>
      </div>
    </div>
  )
}

/* ──────────────────────────── Download ─────────────────────────── */

function fileIcon(name: string, size: number) {
  if (/\.(mp4|mov|mkv)$/i.test(name)) return <FileVideo size={size} weight="fill" />
  if (/\.(zip|rar|7z)$/i.test(name)) return <FileArchive size={size} weight="fill" />
  return <Package size={size} weight="fill" />
}

function DoneCheck({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <motion.circle cx="12" cy="12" r="11" fill={C.green} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.5 }} />
      <motion.path
        d="M7 12.5l3.2 3.2L17 9"
        fill="none"
        stroke="#fff"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  )
}

export function DownloadCompact({ a }: P<'download'>) {
  const now = useNow(20, !a.data.doneAt)
  const p = downloadProgress(a.data, now)
  const done = !!a.data.doneAt
  return (
    <Strip
      pad={8}
      leading={
        <SwapIcon id={done ? 'done' : 'dl'}>
          {done ? (
            <DoneCheck size={20} />
          ) : (
            <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: 'rgba(10,132,255,0.22)', color: C.blue }}>
              <motion.span animate={a.data.paused ? { y: 0 } : { y: [-1.5, 1.5, -1.5] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
                <DownloadSimple size={13} weight="bold" />
              </motion.span>
            </span>
          )}
        </SwapIcon>
      }
      trailing={
        done ? (
          <span className="pr-1 text-[13px] font-semibold" style={{ color: C.green }}>
            Done
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <RollingText text={`${Math.floor(p * 100)}%`} className="text-[13px] font-semibold" style={{ color: C.blue }} />
            <ProgressRing value={p} size={18} stroke={2.6} color={a.data.paused ? C.dim : C.blue} />
          </span>
        )
      }
    />
  )
}

export function DownloadMinimal({ a }: P<'download'>) {
  const now = useNow(20, !a.data.doneAt)
  const p = downloadProgress(a.data, now)
  return a.data.doneAt ? <DoneCheck size={20} /> : <ProgressRing value={p} size={20} stroke={2.6} />
}

export function DownloadExpanded({ a }: P<'download'>) {
  const now = useNow(30, !a.data.doneAt)
  const d = a.data
  const p = downloadProgress(d, now)
  const done = !!d.doneAt
  // Simulated jitter so the speed readout feels alive.
  const speed = d.speed * (0.92 + 0.08 * Math.sin(now / 420))
  const left = d.paused ? null : Math.ceil(((1 - p) * d.size) / d.speed)
  const togglePause = () => {
    const t = Date.now()
    update(a.id, { paused: !d.paused, base: downloadProgress(d, t) * d.size, since: t })
  }
  return (
    <div className="flex h-full flex-col justify-center gap-3 px-[18px]">
      <div className="flex items-center gap-3">
        <IconTile bg={done ? `linear-gradient(160deg, #4cd964, #1f9e45)` : `linear-gradient(160deg, #3fa0ff, #0a5fd8)`} size={42}>
          <SwapIcon id={done ? 'done' : 'file'}>{done ? <CheckCircle size={22} weight="fill" /> : fileIcon(d.file, 22)}</SwapIcon>
        </IconTile>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold tracking-[-0.01em] text-white">{d.file}</div>
          <div className="truncate text-[12px] tabular-nums text-white/55">
            {done
              ? `Completed · ${formatBytes(d.size)}`
              : d.paused
                ? `Paused · ${formatBytes(p * d.size)} of ${formatBytes(d.size)}`
                : `${formatBytes(p * d.size)} of ${formatBytes(d.size)} · ${formatBytes(speed)}/s · ${left}s left`}
          </div>
        </div>
        {done ? (
          <IslandButton label="Show in folder" size={34} onPress={() => dismiss(a.id)}>
            <FolderOpen size={17} weight="fill" />
          </IslandButton>
        ) : (
          <div className="flex gap-2">
            <IslandButton label={d.paused ? 'Resume' : 'Pause'} size={34} onPress={togglePause}>
              <SwapIcon id={d.paused ? 'r' : 'p'}>{d.paused ? <ArrowClockwise size={16} weight="bold" /> : <Pause size={16} weight="fill" />}</SwapIcon>
            </IslandButton>
            <IslandButton label="Cancel" size={34} onPress={() => dismiss(a.id)}>
              <X size={15} weight="bold" />
            </IslandButton>
          </div>
        )}
      </div>
      <div className="relative h-[6px] overflow-hidden rounded-full bg-white/12">
        <motion.div
          className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
          style={{ width: `${p * 100}%` }}
          animate={{ backgroundColor: done ? C.green : d.paused ? '#8e8e93' : C.blue }}
        >
          {!done && !d.paused && (
            <motion.div
              className="absolute inset-y-0 w-16"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)' }}
              animate={{ x: ['-4rem', '28rem'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}

/* ───────────────────────────── Timer ───────────────────────────── */

export function TimerCompact({ a }: P<'timer'>) {
  const now = useNow(10, !a.data.paused)
  const rem = timerRemaining(a.data, now)
  return (
    <Strip
      pad={9}
      leading={<Timer size={19} weight="fill" color={C.orange} />}
      trailing={<RollingText text={formatClock(Math.ceil(rem / 1000))} className="pr-1 text-[14px] font-semibold" style={{ color: C.orange }} />}
    />
  )
}

export function TimerMinimal({ a }: P<'timer'>) {
  const now = useNow(10, !a.data.paused)
  return <ProgressRing value={timerRemaining(a.data, now) / a.data.duration} size={20} stroke={2.6} color={C.orange} track="rgba(255,159,10,0.2)" />
}

export function TimerExpanded({ a }: P<'timer'>) {
  const now = useNow(10, !a.data.paused)
  const d = a.data
  const rem = timerRemaining(d, now)
  if (d.doneAt) {
    return (
      <div className="flex h-full items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <motion.span animate={{ rotate: [0, -14, 14, -14, 14, 0] }} transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.5 }}>
            <Timer size={30} weight="fill" color={C.orange} />
          </motion.span>
          <div>
            <div className="text-[12px] font-medium" style={{ color: C.orange }}>
              Timer
            </div>
            <div className="text-[20px] font-semibold tracking-[-0.02em] text-white">Time's up</div>
          </div>
        </div>
        <IslandButton label="Stop" tone="orange" size={40} wide onPress={() => dismiss(a.id)}>
          <span className="text-[14px] font-semibold">Stop</span>
        </IslandButton>
      </div>
    )
  }
  const togglePause = () => {
    const t = Date.now()
    update(a.id, { paused: !d.paused, base: timerRemaining(d, t), since: t })
  }
  return (
    <div className="flex h-full items-center justify-between px-5">
      <div className="flex gap-2.5">
        <IslandButton label={d.paused ? 'Resume' : 'Pause'} tone="orange" size={44} onPress={togglePause}>
          <SwapIcon id={d.paused ? 'play' : 'pause'}>{d.paused ? <Play size={20} weight="fill" /> : <Pause size={20} weight="fill" />}</SwapIcon>
        </IslandButton>
        <IslandButton label="Cancel" size={44} onPress={() => dismiss(a.id)}>
          <X size={18} weight="bold" />
        </IslandButton>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-[13px] font-medium" style={{ color: C.orange }}>
          Timer
        </span>
        <RollingText text={formatClock(Math.ceil(rem / 1000))} className="text-[40px] font-light tracking-[-0.02em]" style={{ color: C.orange }} />
      </div>
    </div>
  )
}

/* ────────────────────────────── Call ───────────────────────────── */

function Avatar({ name, hue, size }: { name: string; hue: number; size: number }) {
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(160deg, hsl(${hue} 70% 62%), hsl(${hue + 30} 65% 42%))`,
      }}
    >
      {initials}
    </span>
  )
}

export function CallCompact({ a }: P<'call'>) {
  const now = useNow(4)
  return (
    <Strip
      pad={9}
      leading={
        <span className="flex items-center gap-1.5" style={{ color: C.green }}>
          <Phone size={17} weight="fill" />
        </span>
      }
      trailing={
        <span className="flex items-center gap-2 pr-1">
          <RollingText text={formatClock((now - a.data.since) / 1000)} className="text-[13px] font-semibold" style={{ color: C.green }} />
          <Equalizer playing={!a.data.muted} color={C.green} bars={4} height={13} />
        </span>
      }
    />
  )
}

export function CallMinimal() {
  return <Phone size={16} weight="fill" color={C.green} />
}

export function CallExpanded({ a }: P<'call'>) {
  const now = useNow(4, a.data.status === 'active')
  const d = a.data
  const ringing = d.status === 'ringing'
  return (
    <div className="flex h-full items-center gap-3 px-[18px]">
      <motion.span animate={ringing ? { scale: [1, 1.06, 1] } : { scale: 1 }} transition={{ duration: 1, repeat: ringing ? Infinity : 0 }}>
        <Avatar name={d.name} hue={d.hue} size={48} />
      </motion.span>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-white/55">{ringing ? 'mobile' : <RollingText text={formatClock((now - d.since) / 1000)} />}</div>
        <div className="truncate text-[17px] font-semibold tracking-[-0.01em] text-white">{d.name}</div>
      </div>
      {ringing ? (
        <div className="flex gap-3">
          <IslandButton label="Decline" tone="red" size={46} onPress={() => dismiss(a.id)}>
            <PhoneDisconnect size={22} weight="fill" />
          </IslandButton>
          <span className="relative grid place-items-center">
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: C.green }}
              animate={{ scale: [1, 1.45], opacity: [0.45, 0] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut' }}
            />
            <IslandButton
              label="Accept"
              tone="green"
              size={46}
              onPress={() => {
                update(a.id, { status: 'active', since: Date.now() })
                useIsland.getState().setExpanded(null)
              }}
            >
              <Phone size={22} weight="fill" />
            </IslandButton>
          </span>
        </div>
      ) : (
        <div className="flex gap-3">
          <IslandButton label={d.muted ? 'Unmute' : 'Mute'} tone={d.muted ? 'white' : 'neutral'} size={44} onPress={() => update(a.id, { muted: !d.muted })}>
            <SwapIcon id={d.muted ? 'm' : 'u'}>{d.muted ? <MicrophoneSlash size={20} weight="fill" /> : <Microphone size={20} weight="fill" />}</SwapIcon>
          </IslandButton>
          <IslandButton label="End call" tone="red" size={44} onPress={() => dismiss(a.id)}>
            <PhoneDisconnect size={20} weight="fill" />
          </IslandButton>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── Recording ─────────────────────────── */

export function RecordingCompact({ a }: P<'recording'>) {
  const now = useNow(4)
  return (
    <Strip
      pad={6}
      leading={<PulseDot color={C.red} size={8} />}
      trailing={<RollingText text={formatClock((now - a.data.since) / 1000)} className="pr-2 text-[13px] font-semibold" style={{ color: C.red }} />}
    />
  )
}

export function RecordingMinimal() {
  return <PulseDot color={C.red} size={7} />
}

export function RecordingExpanded({ a }: P<'recording'>) {
  const now = useNow(4)
  return (
    <div className="flex h-full items-center gap-3 px-[18px]">
      <PulseDot color={C.red} size={10} />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-white">Screen recording</div>
        <RollingText text={formatClock((now - a.data.since) / 1000)} className="text-[12px] text-white/55" />
      </div>
      <IslandButton label="Stop recording" tone="white" size={40} onPress={() => {
        dismiss(a.id)
        useIsland.getState().trigger('screenshot')
      }}>
        <Stop size={16} weight="fill" color={C.red} />
      </IslandButton>
    </div>
  )
}
