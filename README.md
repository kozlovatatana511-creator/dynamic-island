# Dynamic Island for Windows — Island Lab

A motion prototype of a macOS/iOS-style Dynamic Island for Windows 10/11. The playground shows a mock monitor with the island fused to the top edge, plus a sidebar for firing triggers and tuning every visual and motion parameter.

The stack is **React 19 + TypeScript + Vite** with **[Motion](https://motion.dev)** for all animation. The UI uses Phosphor icons and Inter. The real app will wrap this in **Tauri 2**, with a Rust layer for system integrations. That part isn't built yet.

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck + production build
```

## What's in the lab

- **Live activities**: now playing, download, timer, incoming/active call, screen recording. Each has compact, expanded and "minimal" (side bubble) layouts.
- **Alerts**: volume/brightness HUD, notification, earbuds connected, charging, low battery, focus mode, clipboard, Windows Hello unlock, upcoming event, screenshot.
- **Idle dashboard**: click the empty island to open the clock, weather and quick actions.
- **Multitasking**: a second live activity splits off as a bubble. Liquid merge makes it separate and rejoin like a droplet. Click the bubble to swap.
- **Gestures**: click to expand, drag down to pull it open (with rubber-band resistance), press-squish, and optional expand-on-hover.
- **Tuning**: notch vs. floating pill, shoulder radius, continuous (squircle) corners, spring presets, duration/bounce sliders, 3×/8× slow motion, content blur, wallpapers, and a Win10/Win11 taskbar.
- **Scenarios**: scripted flows, including a 40-event stress test.

Keyboard: `1`–`9` trigger · `E` expand · `Esc` collapse · `C` clear. In dev, `island.getState()` in the console exposes the store.

## How it's built

- `src/island/Island.tsx` is the engine. Size and corner geometry live in shared motion values driven by one spring. Three layers read those values, so they never drift apart: the shadow, the liquid background with SVG goo filter and concave "shoulders", and the content.
- Content crossfades with a blur-scale morph. It is laid out at its *target* size, so text never reflows during the morph.
- `src/island/store.ts` is a Zustand store that holds activities, priority resolution (urgent → alert → pinned/primary live → idle) and a clock tick for timeouts.
- `src/island/meta.ts` holds per-activity sizes, priorities and mock data. `src/island/views/*` holds the views.
- Time-based state (playback position, download bytes, timer) is derived from timestamps. The store doesn't tick every frame.
