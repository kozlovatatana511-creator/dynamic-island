import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { HOME_SIZE, META } from './meta'
import { VIEWS } from './registry'
import { resolveView, useIsland } from './store'
import type { Activity, ResolvedView, Settings, Size } from './types'
import { C, useIslandSpring } from './ui'
import { HomeView } from './views/home'

const BASE_H = { attached: 32, floating: 37 } as const
const FLOAT_TOP = 10
const BUBBLE_GAP = 8
const DOTS_W = 22

function contentSize(view: ResolvedView, s: Settings, privacy: boolean): Size {
  const baseH = BASE_H[s.style]
  switch (view.mode) {
    case 'idle':
      if (s.idle === 'hidden' && !privacy) return { w: s.style === 'attached' ? 150 : 90, h: 0 }
      return { w: s.style === 'attached' ? 190 : 124, h: baseH }
    case 'home':
      return HOME_SIZE
    case 'compact':
      return { w: META[view.activity!.kind].compactW ?? 240, h: baseH }
    default:
      return META[view.activity!.kind].expanded
  }
}

function radiusFor(h: number, s: Settings) {
  const slim = h <= 48
  let r = s.style === 'attached' ? (slim ? Math.round(h * 0.42) : 32) : slim ? h / 2 : 38
  if (s.squircle && !slim) r *= 1.2
  return r
}

/** Rubber-band resistance for the pull gesture. */
const rubber = (y: number) => Math.sign(y) * 60 * (1 - 1 / (Math.abs(y) / 160 + 1))

const isControl = (e: Event) => !!(e.target as Element | null)?.closest?.('[data-island-control]')

/* The concave fillet that blends an attached island into the screen edge. */
function Shoulder({ side, size }: { side: 'left' | 'right'; size: MotionValue<number> }) {
  return (
    <motion.svg
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      className="absolute top-0 block"
      style={{
        width: size,
        height: size,
        [side === 'left' ? 'right' : 'left']: '100%',
        scaleX: side === 'right' ? -1 : 1,
      }}
    >
      <path d="M0,0 H1 V1 A1,1 0 0 0 0,0 Z" fill="#000" />
    </motion.svg>
  )
}

function renderContent(view: ResolvedView) {
  if (view.mode === 'idle') return null
  if (view.mode === 'home') return <HomeView />
  const a = view.activity!
  const V = VIEWS[a.kind]
  const Comp = view.mode === 'compact' ? (V.compact ?? V.expanded) : V.expanded
  return <Comp a={a} />
}

export function Island() {
  const settings = useIsland((s) => s.settings)
  const activities = useIsland((s) => s.activities)
  const expandedId = useIsland((s) => s.expandedId)
  const pinnedId = useIsland((s) => s.pinnedId)
  const view = useMemo(() => resolveView(activities, expandedId, pinnedId), [activities, expandedId, pinnedId])

  const attached = settings.style === 'attached'
  const baseH = BASE_H[settings.style]
  const privacy = settings.mic || settings.camera
  const dotsW = privacy && (view.mode === 'compact' || view.mode === 'idle') ? DOTS_W : 0
  const content = contentSize(view, settings, privacy)
  const target = {
    w: content.w + dotsW,
    h: content.h,
    r: radiusFor(content.h, settings),
    top: attached ? 0 : FLOAT_TOP,
  }
  const rt = attached ? 0 : target.r

  const spring = useIslandSpring()
  const contentSpring = useIslandSpring(0.85, 0.6)
  const slowmo = settings.slowmo

  /* Shared geometry: every layer reads these, so the shape, the liquid layer and the content never drift. */
  const W = useMotionValue(target.w)
  const H = useMotionValue(target.h)
  const R = useMotionValue(target.r)
  const RT = useMotionValue(rt)
  const TOP = useMotionValue(target.top)
  const SH = useMotionValue(attached ? settings.shoulder : 0)
  const split = useMotionValue(view.secondary ? 1 : 0)
  const pull = useMotionValue(0)

  useEffect(() => {
    animate(W, target.w, spring)
    animate(H, target.h, spring)
    animate(R, target.r, spring)
    animate(RT, rt, spring)
    animate(TOP, target.top, spring)
    animate(SH, attached ? settings.shoulder : 0, spring)
  }, [W, H, R, RT, TOP, SH, target.w, target.h, target.r, target.top, rt, attached, settings.shoulder, spring])

  // Keep rendering the last secondary while the bubble merges back in.
  const lastSecondary = useRef<Activity | null>(null)
  if (view.secondary) lastSecondary.current = view.secondary
  const bubbleAct = view.secondary ?? lastSecondary.current
  useEffect(() => {
    animate(split, view.secondary ? 1 : 0, { ...spring, bounce: Math.min(0.6, (spring as { bounce: number }).bounce + 0.1) })
  }, [split, view.secondary, spring])

  const dW = useTransform(() => W.get() + Math.abs(pull.get()) * 0.4)
  const dH = useTransform(() => Math.max(0, H.get() + pull.get()))
  const dSH = useTransform(() => Math.min(SH.get(), dH.get()))
  const bubbleX = useTransform(() => (dW.get() / 2 + BUBBLE_GAP + baseH / 2) * split.get() - baseH / 2)
  const bubbleScale = useTransform(split, (s) => 0.35 + 0.65 * s)
  const bubbleOpacity = useTransform(split, (s) => Math.min(1, s * 4))
  const bubbleRT = useTransform(RT, (r) => Math.min(baseH / 2, r))
  const bubbleSH = useTransform(() => Math.min(dSH.get(), 7) * split.get())
  const shadowOpacity = useTransform(dH, (h) => Math.max(0, Math.min(1, (h - 44) / 50)))

  const shape = {
    left: '50%',
    x: '-50%',
    top: TOP,
    width: dW,
    height: dH,
    borderTopLeftRadius: RT,
    borderTopRightRadius: RT,
    borderBottomLeftRadius: R,
    borderBottomRightRadius: R,
  } as const
  const bubbleShape = {
    left: '50%',
    top: TOP,
    width: baseH,
    height: baseH,
    x: bubbleX,
    scale: bubbleScale,
    originY: 0,
    borderTopLeftRadius: bubbleRT,
    borderTopRightRadius: bubbleRT,
    borderBottomLeftRadius: baseH / 2,
    borderBottomRightRadius: baseH / 2,
  } as const
  const sq = settings.squircle ? 'island-squircle' : ''

  /* Interaction */
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const hoverTimer = useRef<number | undefined>(undefined)
  const { setExpanded, dismiss, pin } = useIsland.getState()

  const handleTap = () => {
    switch (view.mode) {
      case 'idle':
        return setExpanded('home')
      case 'home':
        return setExpanded(null)
      case 'compact':
        return setExpanded(view.activity!.id)
      case 'alert':
        return dismiss(view.activity!.id)
      case 'expanded': {
        const a = view.activity!
        if (a.kind === 'call' && a.data.status === 'ringing') return
        if (a.kind === 'timer' && a.data.doneAt) return dismiss(a.id)
        return setExpanded(null)
      }
    }
  }
  const expandTarget = view.mode === 'compact' ? view.activity!.id : view.mode === 'idle' ? 'home' : null

  const onHoverStart = () => {
    setHovered(true)
    window.clearTimeout(hoverTimer.current)
    if (settings.hoverExpand && expandTarget) hoverTimer.current = window.setTimeout(() => setExpanded(expandTarget), 140)
  }
  const onHoverEnd = () => {
    setHovered(false)
    window.clearTimeout(hoverTimer.current)
    if (settings.hoverExpand && (view.mode === 'expanded' || view.mode === 'home'))
      hoverTimer.current = window.setTimeout(() => useIsland.getState().setExpanded(null), 380)
  }
  useEffect(() => () => window.clearTimeout(hoverTimer.current), [])

  const viewKey =
    view.mode === 'idle' || view.mode === 'home' ? view.mode : `${view.activity!.id}:${view.mode === 'compact' ? 'c' : 'x'}`
  const blur = settings.contentBlur ? 'blur(8px)' : 'blur(0px)'
  const collapsedLike = view.mode === 'idle' || view.mode === 'compact'
  const scale = pressed && settings.squish ? 0.965 : hovered && collapsedLike && !settings.hoverExpand ? 1.035 : 1

  return (
    <motion.div
      data-island-root
      className="absolute inset-x-0 top-0 z-40 h-0"
      style={{ originY: 0 }}
      animate={{ scale }}
      transition={{ type: 'spring', visualDuration: 0.35 * slowmo, bounce: 0.45 }}
    >
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="island-goo" x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Shadow layer */}
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute bg-black ${sq}`}
        style={{ ...shape, opacity: shadowOpacity, boxShadow: '0 18px 50px -10px rgba(0,0,0,0.6), 0 4px 14px rgba(0,0,0,0.35)' }}
      />

      {/* Liquid background layer: island, shoulders and bubble melt together through the goo filter */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[260px]"
        style={{ filter: settings.liquid ? 'url(#island-goo)' : undefined }}
      >
        {attached && settings.liquid && <div className="absolute inset-x-0 -top-3 h-[10px] bg-black" />}
        <motion.div className={`absolute bg-black ${sq}`} style={shape}>
          <Shoulder side="left" size={dSH} />
          <Shoulder side="right" size={dSH} />
        </motion.div>
        {bubbleAct && (
          <motion.div className="absolute bg-black" style={{ ...bubbleShape, opacity: bubbleOpacity }}>
            <Shoulder side="left" size={bubbleSH} />
            <Shoulder side="right" size={bubbleSH} />
          </motion.div>
        )}
      </div>

      {/* Content + interaction layer */}
      <motion.div
        role="button"
        tabIndex={0}
        aria-label="Dynamic Island"
        className={`absolute cursor-pointer overflow-hidden outline-none ${sq}`}
        style={{
          ...shape,
          touchAction: 'none',
          boxShadow: attached ? 'none' : 'inset 0 0 0 0.5px rgba(255,255,255,0.09)',
        }}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        onTapStart={(e) => !isControl(e) && setPressed(true)}
        onTapCancel={() => setPressed(false)}
        onTap={(e) => {
          setPressed(false)
          if (!isControl(e)) handleTap()
        }}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTap()}
        onPan={(_, info) => settings.pullGesture && pull.set(rubber(info.offset.y))}
        onPanEnd={(_, info) => {
          setPressed(false)
          if (!settings.pullGesture) return
          if (info.offset.y > 40 && expandTarget) setExpanded(expandTarget)
          else if (info.offset.y < -24 && !collapsedLike) handleTap()
          animate(pull, 0, { type: 'spring', visualDuration: 0.5 * slowmo, bounce: 0.5, velocity: info.velocity.y * 0.2 })
        }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={viewKey}
            className="absolute top-0"
            style={{
              left: '50%',
              marginLeft: -content.w / 2 - dotsW / 2,
              width: content.w,
              height: content.h,
              originY: 0,
            }}
            initial={{ opacity: 0, scale: 0.9, filter: blur }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { ...contentSpring, delay: 0.05 * slowmo } }}
            exit={{ opacity: 0, scale: 0.94, filter: blur, transition: { duration: 0.16 * slowmo, ease: 'easeOut' } }}
          >
            {renderContent(view)}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {dotsW > 0 && (
            <motion.div
              className="absolute right-[9px] flex gap-[4px]"
              style={{ top: baseH / 2 - 3 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.5 }}
            >
              {settings.camera && <span className="block h-1.5 w-1.5 rounded-full" style={{ background: C.green, boxShadow: `0 0 6px ${C.green}` }} />}
              {settings.mic && <span className="block h-1.5 w-1.5 rounded-full" style={{ background: C.orange, boxShadow: `0 0 6px ${C.orange}` }} />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bubble content */}
      {bubbleAct && (
        <motion.div
          role="button"
          aria-label={`Switch to ${META[bubbleAct.kind].label}`}
          className="absolute grid cursor-pointer place-items-center"
          style={{ ...bubbleShape, opacity: bubbleOpacity, pointerEvents: view.secondary ? 'auto' : 'none' }}
          onTap={() => view.secondary && pin(view.secondary.id)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={bubbleAct.id}
              initial={{ opacity: 0, scale: 0.5, filter: blur }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.5, filter: blur }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={contentSpring}
              className="grid place-items-center"
            >
              {(() => {
                const M = VIEWS[bubbleAct.kind].minimal
                return M ? <M a={bubbleAct} /> : null
              })()}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
