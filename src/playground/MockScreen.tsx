import {
  BatteryHigh,
  CaretUp,
  ChatCircleDots,
  Compass,
  Folder,
  Gear,
  MagnifyingGlass,
  MusicNotes,
  SpeakerHigh,
  TerminalWindow,
  WifiHigh,
} from '@phosphor-icons/react'
import { Island } from '../island/Island'
import { useIsland } from '../island/store'
import { useNow } from '../island/ui'
import { WALLPAPERS } from './wallpapers'

function WinLogo({ size = 20 }: { size?: number }) {
  const g = size * 0.06
  const q = (size - g) / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="winlogo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5fc4ff" />
          <stop offset="1" stopColor="#0a6cff" />
        </linearGradient>
      </defs>
      {[0, 1].flatMap((x) => [0, 1].map((y) => <rect key={`${x}${y}`} x={x * (q + g)} y={y * (q + g)} width={q} height={q} rx={1} fill="url(#winlogo)" />))}
    </svg>
  )
}

const APPS = [
  { Icon: Folder, color: '#ffc83d' },
  { Icon: Compass, color: '#3fa9ff' },
  { Icon: TerminalWindow, color: '#d0d0d0' },
  { Icon: MusicNotes, color: '#ff4f7b' },
  { Icon: ChatCircleDots, color: '#7c7cff' },
  { Icon: Gear, color: '#a0a0a8' },
]

function Taskbar() {
  const style = useIsland((s) => s.settings.taskbar)
  const now = useNow(1)
  const d = new Date(now)
  const win11 = style === 'win11'
  return (
    <div
      className="absolute inset-x-0 bottom-0 flex h-12 items-center border-t border-white/[0.08] px-3"
      style={{ background: 'rgba(28,28,32,0.72)', backdropFilter: 'blur(30px) saturate(1.6)' }}
    >
      <div className={`flex flex-1 items-center gap-1 ${win11 ? 'justify-center' : 'justify-start'}`}>
        <span className="grid h-10 w-10 place-items-center rounded-md hover:bg-white/10">
          <WinLogo />
        </span>
        {win11 ? (
          <span className="grid h-10 w-10 place-items-center rounded-md text-white/85">
            <MagnifyingGlass size={19} />
          </span>
        ) : (
          <span className="flex h-8 w-52 items-center gap-2 rounded-sm bg-white/10 px-3 text-[12px] text-white/50">
            <MagnifyingGlass size={15} /> Type here to search
          </span>
        )}
        {APPS.map(({ Icon, color }, i) => (
          <span key={i} className="relative grid h-10 w-10 place-items-center rounded-md hover:bg-white/10">
            <Icon size={22} weight="fill" color={color} />
            {i < 3 && <span className={`absolute bottom-0.5 h-[3px] rounded-full ${i === 1 ? 'w-4 bg-[#4cc2ff]' : 'w-1.5 bg-white/45'}`} />}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3 text-white/85">
        <CaretUp size={14} />
        <span className="flex items-center gap-2">
          <WifiHigh size={16} />
          <SpeakerHigh size={16} />
          <BatteryHigh size={18} />
        </span>
        <span className="text-right text-[11px] leading-tight">
          <div>{d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
          <div>{d.toLocaleDateString('en-GB')}</div>
        </span>
      </div>
    </div>
  )
}

function FakeWindow() {
  return (
    <div
      className="absolute left-[9%] top-[22%] h-[50%] w-[44%] overflow-hidden rounded-lg border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
      style={{ background: 'rgba(32,32,36,0.78)', backdropFilter: 'blur(40px) saturate(1.4)' }}
    >
      <div className="flex h-9 items-center justify-between px-3 text-[11px] text-white/70">
        <span className="flex items-center gap-2">
          <Folder size={14} weight="fill" color="#ffc83d" /> Downloads
        </span>
        <span className="flex gap-4 text-white/50">
          <span>—</span>
          <span>▢</span>
          <span>✕</span>
        </span>
      </div>
      <div className="grid grid-cols-[110px_1fr] gap-3 border-t border-white/[0.06] p-3">
        <div className="space-y-2">
          {[60, 80, 50, 70, 40].map((w, i) => (
            <div key={i} className="h-2 rounded bg-white/10" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-white/10" />
              <div className="h-2 flex-1 rounded bg-white/[0.08]" />
              <div className="h-2 w-10 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MockScreen() {
  const wallpaper = useIsland((s) => s.settings.wallpaper)
  const attached = useIsland((s) => s.settings.style === 'attached')
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center">
      {/* Monitor */}
      <div
        className="relative w-full rounded-[22px] bg-[#050505] p-[10px] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9),inset_0_0_0_1px_rgba(255,255,255,0.08)]"
        style={{ paddingTop: attached ? 10 : 10 }}
      >
        <div
          className="relative aspect-[16/10] w-full overflow-hidden rounded-[12px]"
          onPointerDown={(e) => {
            if ((e.target as Element).closest('[data-island-root]')) return
            const { expandedId, setExpanded } = useIsland.getState()
            if (expandedId) setExpanded(null)
          }}
        >
          <div className="absolute inset-0 transition-[background] duration-700" style={{ background: WALLPAPERS[wallpaper].css }} />
          <FakeWindow />
          <Taskbar />
          <Island />
        </div>
      </div>
      {/* Stand */}
      <div className="h-10 w-28 bg-gradient-to-b from-[#1a1a1c] to-[#0c0c0d]" style={{ clipPath: 'polygon(12% 0, 88% 0, 100% 100%, 0 100%)' }} />
      <div className="h-2.5 w-64 rounded-t-md rounded-b-xl bg-gradient-to-b from-[#232326] to-[#0e0e10] shadow-[0_12px_30px_rgba(0,0,0,0.6)]" />
    </div>
  )
}
