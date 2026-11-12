import { CloudSun, Moon, MusicNotes, Record, Timer } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useIsland } from '../store'
import type { Kind } from '../types'
import { C, RollingText, useNow } from '../ui'

function Tile({ icon, label, color, kind, delay }: { icon: ReactNode; label: string; color: string; kind: Kind; delay: number }) {
  return (
    <motion.button
      type="button"
      data-island-control
      onClick={(e) => {
        e.stopPropagation()
        useIsland.getState().setExpanded(null)
        useIsland.getState().trigger(kind)
      }}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.35, delay }}
      className="flex flex-1 cursor-pointer flex-col items-start gap-1.5 rounded-2xl bg-white/[0.08] px-3 py-2.5 text-left"
    >
      <span className="grid h-6 w-6 place-items-center rounded-full" style={{ background: color }}>
        {icon}
      </span>
      <span className="text-[11.5px] font-medium text-white/85">{label}</span>
    </motion.button>
  )
}

export function HomeView() {
  const now = useNow(1)
  const d = new Date(now)
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return (
    <div className="flex h-full flex-col justify-between px-[18px] pb-4 pt-3.5">
      <div className="flex items-start justify-between">
        <div>
          <RollingText text={time} className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-white" />
          <div className="mt-1 text-[12px] font-medium text-white/55">{d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="text-[20px] font-semibold leading-none text-white">18°</div>
            <div className="mt-1 text-[11px] text-white/55">Partly cloudy</div>
          </div>
          <CloudSun size={30} weight="fill" color={C.yellow} />
        </div>
      </div>
      <div className="flex gap-2">
        <Tile kind="focus" label="Focus" color={C.indigo} delay={0.04} icon={<Moon size={13} weight="fill" />} />
        <Tile kind="timer" label="Timer" color={C.orange} delay={0.08} icon={<Timer size={13} weight="fill" />} />
        <Tile kind="recording" label="Record" color={C.red} delay={0.12} icon={<Record size={13} weight="fill" />} />
        <Tile kind="music" label="Music" color="#ff375f" delay={0.16} icon={<MusicNotes size={13} weight="fill" />} />
      </div>
    </div>
  )
}
