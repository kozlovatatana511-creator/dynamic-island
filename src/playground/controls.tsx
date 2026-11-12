import { motion } from 'motion/react'
import { useId, type ReactNode } from 'react'

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Group({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-white/[0.045] ring-1 ring-white/[0.06]">{children}</div>
}

export function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3 px-3.5 py-2">
      <div className="min-w-0">
        <div className="text-[13px] text-white/90">{label}</div>
        {hint && <div className="text-[11px] leading-tight text-white/40">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className="relative flex h-[26px] w-[44px] cursor-pointer items-center rounded-full p-[2px] transition-colors duration-300"
      style={{ background: value ? '#30d158' : 'rgba(255,255,255,0.16)', justifyContent: value ? 'flex-end' : 'flex-start' }}
    >
      <motion.span layout transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.3 }} className="block h-[22px] w-[22px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.3)]" />
    </button>
  )
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (v: T) => void
}) {
  const id = useId()
  return (
    <div className="flex rounded-[10px] bg-black/40 p-[2px] ring-1 ring-white/[0.06]">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className="relative flex-1 cursor-pointer whitespace-nowrap rounded-[8px] px-2.5 py-1 text-[12px] font-medium transition-colors"
          style={{ color: o.value === value ? '#fff' : 'rgba(255,255,255,0.5)' }}
        >
          {o.value === value && (
            <motion.span
              layoutId={id}
              className="absolute inset-0 rounded-[8px] bg-white/[0.14] shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
              transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.2 }}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  )
}

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  format,
  label,
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
  label: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex items-center gap-2.5">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lab-range w-[120px]"
        style={{ ['--pct' as string]: `${pct}%` }}
      />
      <span className="w-10 text-right text-[12px] tabular-nums text-white/60">{format ? format(value) : value}</span>
    </div>
  )
}
