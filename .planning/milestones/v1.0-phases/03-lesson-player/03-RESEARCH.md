# Phase 3: Lesson Player - Research

**Researched:** 2026-05-14
**Domain:** Audio playback (Howler.js), iOS Safari audio unlock, React state machine, CSS celebration animation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Unlock screen shows Remy the Fox mascot + lesson title + "Tap anywhere to start". Entire screen is a single tap target.
- **D-02:** First tap unlocks audio AND loads Step 1 instantly. No intermediate screen. Tap → lesson begins.
- **D-03:** iOS Safari audio unlock is satisfied by this first deliberate tap (LESS-04). After unlock, all subsequent audio plays automatically.
- **D-04:** Child taps to advance between steps. Audio plays automatically when step appears; visual cue lights up after audio finishes to prompt the tap. Child controls the pace.
- **D-05:** Replay: each step card has a dedicated replay icon. Tapping it restarts that step's audio from the beginning.
- **D-06:** If audio is unavailable (404 or load error), step displays normally (text + equation) and lesson proceeds silently. No error indicator shown to the child.
- **D-07 (Claude's discretion):** One step fills the screen at a time. No scrollable history. Full-screen per-step layout.
- **D-08:** After the last step, child taps advance and sees a celebration screen with confetti/stars + large "Start Practice" button. No Remy on this screen.
- **D-09:** Child taps "Start Practice" to navigate to practice screen. No auto-advance.
- **D-10:** Celebration screen is lesson-end only (not the session-end celebration in Phase 4 FEED-04).

### Claude's Discretion
- Step card visual design (card styling, animation for step transitions, "Next" indicator appearance) — maintain warm vibrant palette and Nunito font from Phase 1
- Confetti/stars implementation (CSS animation vs. lightweight library) — keep it lightweight; no Lottie or heavy libs for this screen
- Progress indicator within the worked example (dot indicators showing step N of M) — include if it fits without clutter
- Exact replay icon (circular arrow, speaker icon) — standard replay convention

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LESS-01 | Each lesson begins with a guided worked example that walks through a sample problem step by step with narration | State machine pattern: `unlock → step[0] → step[1] → ... → celebration`; Howl per-step lifecycle |
| LESS-02 | All lesson instructions and problem text are narrated aloud (pre-recorded audio) | Howler.js `new Howl({ src, onend })` per step; audio path `/audio/lessons/{id}/step-{N}.mp3` |
| LESS-03 | Kid can tap any narrated segment to replay it | `howl.stop(); howl.play()` inside the dedicated replay icon tap handler |
| LESS-04 | Audio playback is unlocked via the first deliberate user tap (satisfies iOS Safari gesture requirement) | First tap handler must call `howl.play()` synchronously in the event handler — not in `useEffect` |
</phase_requirements>

---

## Summary

Phase 3 replaces the `LessonScreen.tsx` stub with a complete interactive lesson player. The player takes a child from an audio-unlocked start screen through a narrated, step-by-step worked example, and hands off to the practice screen via a celebration screen.

The core technical challenge is iOS Safari's audio autoplay restriction. All audio must be initiated from within a synchronous user-event handler — never from `useEffect` or `setTimeout`. Howler.js 2.2.4 handles the Web Audio / HTML5 duality but still requires the first `play()` call to happen inside the click/touch event. The unlock screen's full-screen tap handler is the single designated unlock point for the entire session; all subsequent Howl instances play automatically once this unlock occurs.

The lesson flow is a deterministic linear state machine with five states: `unlock → playing → between-steps → celebration → done`. `useReducer` handles state transitions cleanly — each state maps to a distinct UI and audio behavior. The machine never goes backward. Howl instances are per-step and created at component mount (or on demand), with `onloaderror` and `onplayerror` suppressed silently per D-06.

Celebration is a pure CSS `@keyframes` animation — scattered colored squares/stars raining down with `translateY` and `rotate`, using `nth-child` random delays. No library, no Lottie, no canvas — just CSS variables and a handful of `div` elements created at render time.

**Primary recommendation:** One `useReducer` state machine in `LessonScreen.tsx`, one `Howl` instance per step created at mount, `onend` callback dispatches `AUDIO_ENDED` action to show the "Next" indicator. Entire screen is a touch target during unlock; step cards contain replay icon only.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| iOS audio unlock | Browser / Client | — | Must be synchronous inside DOM event handler — cannot be delegated to any server or async layer |
| Step audio playback | Browser / Client | — | Howler.js runs entirely client-side; Web Audio API |
| Lesson state machine | Browser / Client | — | Component-local `useReducer`; no persistence needed in Phase 3 |
| Step content rendering | Browser / Client | — | Static curriculum data already loaded; pure React render |
| Celebration animation | Browser / Client | — | CSS `@keyframes` — GPU-composited, zero JS overhead |
| Lesson data loading | Browser / Client | — | Imports from `src/curriculum/index.ts` — no network fetch |
| Navigation to Practice | Browser / Client | — | React Router `useNavigate('/practice')` |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| howler | 2.2.4 | Audio playback management | Specified in CLAUDE.md; handles Web Audio / HTML5 Audio duality, cross-browser quirks, and the iOS unlock pool automatically |
| @types/howler | 2.2.12 | TypeScript types for Howler | Companion types package; project uses strict TypeScript |
| React (existing) | 19.2.x | UI + state machine via useReducer | Already installed |
| React Router (existing) | 7.x | Navigation to /practice on completion | Already installed |
| Tailwind CSS (existing) | 4.x | Styling, touch targets, layout | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS `@keyframes` (native) | — | Celebration confetti animation | Lightweight; no install; GPU-accelerated |
| Motion (framer-motion) | 12.x | Step card entrance/exit transitions | Claude's discretion — only if step-card animation needs spring physics; not required for MVP |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| howler | Web Audio API directly | Howler abstracts unlock pool, format fallback, and error handling — hand-rolling this is the exact "don't hand-roll" problem |
| CSS confetti | canvas-confetti npm package | Adds ~13 KB; pure CSS achieves the same effect at zero bundle cost for this simple use case |
| useReducer state machine | XState | XState is powerful but overkill for a 5-state linear machine with no parallel states |

**Installation (new packages only):**
```bash
npm install howler
npm install --save-dev @types/howler
```

**Version verification:**
```
howler@2.2.4   — verified via npm view, last published 2023-09-19
@types/howler@2.2.12 — verified via npm view
```

Note: howler 2.2.4 is the latest stable release (dist-tags.latest). The project CLAUDE.md lists "Howler.js 2.x" as the intended version.

---

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| howler | npm | ~11 yrs (2014) | High (widely referenced) | github.com/goldfire/howler.js | [OK] | Approved |
| @types/howler | npm | ~8 yrs | High | github.com/DefinitelyTyped/DefinitelyTyped | [OK] | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
User Tap (first)
       │
       ▼
┌─────────────────┐
│  Unlock Screen  │  ← Full-screen tap target (D-01, D-02)
│  Remy + Title   │    onClick: dispatch(UNLOCK) + howl.play()
└────────┬────────┘    (iOS audio context unlocked here — LESS-04)
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  Step Screen  (state: playing | between-steps)      │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  StepCard                                   │   │
│  │  - text (LessonStep.text)                   │   │
│  │  - equation (LessonStep.equation, optional) │   │
│  │  - replay icon (D-05) → howl.stop().play()  │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  [Howl plays on step entry → onend → show Next]    │
│  [Child taps Next → dispatch(ADVANCE)]             │
│  [dot progress indicator: step N of M]             │
│                                                     │
│  Audio error (404 / loaderror / playerror):        │
│  → silent; step shown without audio (D-06)         │
└────────────────────┬────────────────────────────────┘
                     │ last step advanced
                     ▼
┌─────────────────────────────────────────────────────┐
│  Celebration Screen  (state: celebration)           │
│                                                     │
│  CSS confetti @keyframes (div.confetti-piece)      │
│  "You did it!" heading                              │
│  "Start Practice" button → navigate('/practice')   │
│  (D-08, D-09)                                      │
└─────────────────────────────────────────────────────┘
```

### State Machine

```typescript
// States
type LessonState =
  | { phase: 'unlock' }
  | { phase: 'playing';       stepIndex: number }
  | { phase: 'between-steps'; stepIndex: number }
  | { phase: 'celebration' }

// Actions
type LessonAction =
  | { type: 'UNLOCK' }          // first tap → unlock audio + enter step 0
  | { type: 'AUDIO_ENDED' }     // howl onend → show Next indicator
  | { type: 'ADVANCE' }         // child taps Next → next step or celebration
  | { type: 'REPLAY' }          // replay icon tap → restart current step audio
```

**Transition table:**

| From | Action | To |
|------|--------|----|
| unlock | UNLOCK | playing (stepIndex: 0) |
| playing | AUDIO_ENDED | between-steps (same stepIndex) |
| between-steps | ADVANCE (not last) | playing (stepIndex + 1) |
| between-steps | ADVANCE (last step) | celebration |
| playing / between-steps | REPLAY | playing (same stepIndex) |

**REPLAY detail:** dispatching REPLAY while already in `playing` stops the current Howl and replays from zero. It keeps `stepIndex` unchanged and returns to `playing` state.

### Recommended Project Structure
```
src/
├── screens/
│   └── LessonScreen.tsx         # Main lesson player — replaces stub
├── components/
│   ├── RemyFox.tsx              # Existing; used on unlock screen
│   ├── StepCard.tsx             # New: renders one LessonStep (text + equation + replay icon)
│   └── ConfettiScreen.tsx       # New: CSS confetti + "Start Practice" button
├── hooks/
│   └── useLessonAudio.ts        # New: Howl lifecycle management (per-step Howl instances)
└── curriculum/
    ├── types.ts                 # Existing: LessonStep, WorkedExample, Lesson
    └── index.ts                 # Existing: lessons export
```

### Pattern 1: iOS Audio Unlock via Synchronous Click Handler

**What:** The very first `Howl.play()` call in the session must occur inside a synchronous DOM event handler — not in a `useEffect`, not in a Promise `.then()`, not in a `setTimeout`.

**When to use:** The unlock screen's `onClick` / `onTouchEnd` handler — and only there.

**Example:**
```typescript
// Source: howler.js docs + iOS Safari audio policy (MDN Best Practices)
function handleUnlockTap() {
  // CORRECT: play() inside synchronous event handler — unlocks AudioContext
  dispatch({ type: 'UNLOCK' })
  stepHowls[0].play()    // ← must be here, not in useEffect triggered by dispatch
}

// WRONG — AudioContext will NOT be unlocked:
// useEffect(() => { stepHowls[0].play() }, [phase])
```

**Why:** iOS WebKit's autoplay policy requires a "user activation" — the play must happen in the synchronous call stack of a user-initiated event. React's state update batching and `useEffect` scheduling both break the synchronous chain. [CITED: MDN Web Audio API Best Practices]

### Pattern 2: Per-Step Howl Instance with onend Callback

**What:** Create one `Howl` per `LessonStep` at component mount. Use `onend` to dispatch `AUDIO_ENDED`. Use `onloaderror` / `onplayerror` to silently suppress errors (D-06).

**When to use:** `useLessonAudio` hook, called once from `LessonScreen`.

**Example:**
```typescript
// Source: howler.js README (github.com/goldfire/howler.js)
function createStepHowl(src: string, onEnd: () => void): Howl {
  return new Howl({
    src: [src],
    html5: false,          // Web Audio for short clips; better gapless performance
    onend: onEnd,
    onloaderror: (_id, _err) => { /* silent fallback per D-06 */ },
    onplayerror: (_id, _err) => { /* silent fallback per D-06 */ },
  })
}

// In useLessonAudio hook:
const howls = useMemo(() =>
  steps.map((step, i) =>
    createStepHowl(step.narrationAudio, () => dispatch({ type: 'AUDIO_ENDED' }))
  ),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []  // created once at mount; steps are stable curriculum data
)

useEffect(() => {
  return () => howls.forEach(h => h.unload())  // cleanup on unmount
}, [howls])
```

### Pattern 3: Replay

**What:** Stop the current Howl and immediately play it again from position 0. `stop()` resets seek to 0.

**Example:**
```typescript
// Source: howler.js README
function handleReplay(stepIndex: number) {
  howls[stepIndex].stop()
  howls[stepIndex].play()
  dispatch({ type: 'REPLAY' })
}
```

**Note:** `stop()` followed by `play()` is idempotent regardless of current playback state — safe whether audio is currently playing, paused, or finished.

### Pattern 4: CSS Confetti Animation

**What:** Render N `div.confetti-piece` elements with `position: fixed`, random `left` percentages, random `animation-delay`, and a `@keyframes` that translates from top to bottom with rotation.

**When to use:** `ConfettiScreen.tsx` component rendered during `celebration` state.

**Example:**
```typescript
// Source: CSS animation research — standard approach, verified structurally sound
// ASSUMED: specific implementation (generate pieces in JS, vary via inline style)
const CONFETTI_COLORS = ['#FF6B35', '#FFD23F', '#3B82F6', '#22C55E', '#FF4757']
const PIECE_COUNT = 40

export function ConfettiScreen({ onStartPractice }: { onStartPractice: () => void }) {
  const pieces = Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${(i * 2.5 + Math.floor(i / 5) * 3) % 100}%`,
    delay: `${(i * 0.07) % 1.5}s`,
    size: i % 3 === 0 ? 10 : 8,
  }))

  return (
    <div style={{ height: '100dvh', position: 'relative', overflow: 'hidden' }}>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            position: 'fixed',
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
          }}
        />
      ))}
      <h1>You did it!</h1>
      <button onClick={onStartPractice} style={{ touchAction: 'manipulation' }}>
        Start Practice
      </button>
    </div>
  )
}
```

CSS (in `index.css` or component-scoped):
```css
@keyframes confetti-fall {
  0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
.confetti-piece {
  animation: confetti-fall 1.8s ease-in forwards;
  border-radius: 2px;
}
```

### Anti-Patterns to Avoid

- **Playing audio in `useEffect`:** Breaks iOS audio unlock — `useEffect` runs after render, outside the synchronous event stack.
- **Single shared Howl for all steps:** Cannot replay a step while "next" is loaded. Per-step instances give clean isolation.
- **Not calling `howl.unload()` on unmount:** Howl holds Web Audio buffers in memory. Always unload in the cleanup function.
- **Using `html5: true` for short narration clips:** HTML5 Audio introduces startup latency for short files. Web Audio (default) is faster for clips under 30 seconds.
- **Checking `howl.state()` before `play()`:** Unnecessary and racy. Howler queues play until load completes automatically (`preload: true` by default).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| iOS audio unlock pool | Custom AudioContext.resume() unlock manager | `howler` (Howler.autoUnlock=true default) | Howler maintains a shared pool of unlocked HTML5 Audio nodes for mobile; recreating this is error-prone |
| Cross-format audio fallback | mp3/ogg detection logic | `howler` (src array: `['file.webm', 'file.mp3']`) | Howler probes codec support and picks the first playable format |
| Audio error normalization | try/catch around Audio.play() | `howler` onloaderror / onplayerror | Native error codes differ between browsers; Howler normalizes them |
| Confetti particle system | Canvas-based particle physics | CSS `@keyframes` + `transform: translateY` | CSS animations are GPU-composited; no JS frame loop; ~0 KB |

**Key insight:** Howler's value is entirely in the iOS unlock pool and HTML5 Audio error handling. The library is 7 KB gzipped — it earns its weight by eliminating the exact category of bugs that plague audio in kids apps.

---

## Common Pitfalls

### Pitfall 1: Playing audio outside the synchronous event handler

**What goes wrong:** Audio plays fine in Chrome desktop, silently fails on iPad Safari. The `AudioContext` remains suspended because no user gesture chain connects to the `play()` call.

**Why it happens:** iOS requires the `play()` call to occur within the synchronous call stack of a trusted user event (click, touchend). React's `useEffect` and state batching break this chain.

**How to avoid:** In the unlock screen `onClick`, call `howls[0].play()` **before** or **alongside** `dispatch({ type: 'UNLOCK' })`. Do not wait for the state update to trigger a `useEffect` that then plays audio.

**Warning signs:** Audio works in dev (Chrome) but not in Safari; audio works after repeated tapping but not the first time.

### Pitfall 2: Multiple `onend` dispatch calls when replaying

**What goes wrong:** Each `play()` call on the same Howl instance registers the `onend` callback independently — if the Howl was constructed with `onend` in the options, it fires once per play call. But if you also call `howl.on('end', handler)` programmatically, you can double-register.

**Why it happens:** `new Howl({ onend })` and `howl.on('end', fn)` both register event listeners and they stack.

**How to avoid:** Use only the constructor option `onend` — never call `howl.on('end', ...)` separately. The per-step Howl pattern (one Howl per step, created once) avoids this entirely.

**Warning signs:** "Next" indicator flashes twice, or state advances by 2 steps on completion.

### Pitfall 3: Howl instances not unloaded on screen unmount

**What goes wrong:** Navigating away from LessonScreen and back causes audio to ghost-play from previous instances, or memory grows unbounded.

**Why it happens:** Howl holds decoded audio buffers in the Web Audio context unless explicitly unloaded.

**How to avoid:** `useEffect` cleanup: `return () => howls.forEach(h => h.unload())`.

**Warning signs:** Audio clips from previous lesson play when entering a new lesson; memory usage grows across lesson restarts.

### Pitfall 4: Replay tap during active playback creates overlapping audio

**What goes wrong:** Child taps replay before audio has finished — the current audio continues while a new play starts, causing doubled/overlapping audio.

**Why it happens:** `howl.play()` without first calling `howl.stop()` will play a new "instance" of the sound on top of the existing one (Howler's sprite/multi-play model).

**How to avoid:** Always call `howl.stop()` before `howl.play()` in the replay handler. `stop()` resets seek to 0 and terminates current playback.

**Warning signs:** Audio sounds doubled or echoey on replay.

### Pitfall 5: 404 audio files cause unhandled promise rejection

**What goes wrong:** During development (and in production before audio files are recorded), `/audio/lessons/{id}/step-{N}.mp3` returns 404. Without error handlers, this produces console errors; with promise-based patterns it can throw.

**Why it happens:** Howler uses XMLHttpRequest for Web Audio loading; a 404 triggers `onloaderror`.

**How to avoid:** Always provide `onloaderror` and `onplayerror` handlers in the Howl constructor. Per D-06, these handlers are no-ops — the lesson proceeds silently.

**Warning signs:** Console errors in dev; lesson freezes at a step if error causes the `onend` never to fire (confirm: `onloaderror` should also trigger the "treat as silent" path, not leave the state machine stuck in `playing`).

**Critical:** When audio fails to load, `onend` will never fire. The step will display but the child will see no "Next" indicator and cannot advance. The `onloaderror` handler must dispatch `AUDIO_ENDED` (or transition directly to `between-steps`) so the child is never stuck.

---

## Code Examples

### Verified Patterns from Official Sources

### useLessonAudio Hook Sketch
```typescript
// Source: howler.js README (github.com/goldfire/howler.js)
import { Howl } from 'howler'
import { useMemo, useEffect } from 'react'
import type { LessonStep } from '../curriculum/types'

export function useLessonAudio(
  steps: LessonStep[],
  onStepEnded: () => void,
) {
  const howls = useMemo(() =>
    steps.map(step =>
      new Howl({
        src: [step.narrationAudio],
        onend: onStepEnded,
        onloaderror: () => onStepEnded(),  // CRITICAL: advance on error (see Pitfall 5)
        onplayerror: () => onStepEnded(),  // same: never leave state machine stuck
      })
    ),
    // Stable: curriculum steps never change between renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    return () => howls.forEach(h => h.unload())
  }, [howls])

  return howls
}
```

### LessonScreen State Machine Sketch
```typescript
// Source: React docs useReducer (react.dev/reference/react/useReducer) [ASSUMED pattern]
type Phase = 'unlock' | 'playing' | 'between-steps' | 'celebration'
interface LessonState { phase: Phase; stepIndex: number }
type LessonAction =
  | { type: 'UNLOCK' }
  | { type: 'AUDIO_ENDED' }
  | { type: 'ADVANCE'; totalSteps: number }
  | { type: 'REPLAY' }

function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'UNLOCK':
      return { phase: 'playing', stepIndex: 0 }
    case 'AUDIO_ENDED':
      return { ...state, phase: 'between-steps' }
    case 'ADVANCE':
      if (state.stepIndex + 1 >= action.totalSteps) {
        return { phase: 'celebration', stepIndex: state.stepIndex }
      }
      return { phase: 'playing', stepIndex: state.stepIndex + 1 }
    case 'REPLAY':
      return { ...state, phase: 'playing' }
    default:
      return state
  }
}
```

### Unlock Tap Handler (iOS-safe)
```typescript
// Source: iOS Safari audio policy — MDN Web Audio API Best Practices
// [CITED: developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices]
function handleUnlockTap() {
  // play() is called synchronously inside the click handler — AudioContext unlocked
  howls[0].play()
  dispatch({ type: 'UNLOCK' })
}

// Bind to the full-screen div:
<div
  onClick={handleUnlockTap}
  style={{ height: '100dvh', touchAction: 'manipulation' }}
>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `mobileAutoEnable` Howler option | `Howler.autoUnlock = true` (default) | Howler v2 | No code needed — unlock is automatic after first `play()` in event handler |
| Per-sound AudioContext | Shared global AudioContext via `Howler.ctx` | Howler v2 | All Howl instances share one unlocked context; unlock once, play everywhere |
| Manual Audio() element pool for mobile | Howler HTML5 Audio pool | Howler v2.1+ | Howler maintains an unlocked node pool; no custom management needed |

**Deprecated/outdated:**
- `mobileAutoEnable`: Old Howler v1 option name. In v2 the global `Howler.autoUnlock` defaults to `true` — no explicit code required.
- Calling `Howler.ctx.resume()` manually: Howler does this automatically after the first user-gesture-triggered `play()`. Manual resume is needed only if you bypass Howler entirely.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `onloaderror` firing on 404 ensures `onend` never fires — so `onloaderror` must also dispatch `AUDIO_ENDED` | Common Pitfalls / Code Examples | If wrong: silent audio still fires `onend` via some internal Howler path, causing double-dispatch. Low risk — verifiable in integration test. |
| A2 | `html5: false` (Web Audio mode) is better for short narration clips | Standard Stack | If wrong: Web Audio could have latency issues on older iPad hardware; mitigation is adding `html5: true` as a fallback option |
| A3 | Confetti pieces generated from `Array.from` with deterministic left values (no `Math.random`) | Code Examples | `Math.random()` in render would work fine; the deterministic approach just avoids hydration mismatch risk (not applicable here — SPA, not SSR) |

**If this table is empty:** N/A — three assumptions logged above.

---

## Open Questions (RESOLVED)

1. **Should Howl instances use `html5: true` or default Web Audio?**
   - What we know: Web Audio is faster for short clips; HTML5 is better for large files. These are short narration clips (~3–10 seconds each).
   - What's unclear: Whether older iPads (A12 chip) have Web Audio decode performance issues with many simultaneous Howl instances in memory.
   - RESOLVED: Use default (`html5: false`). Web Audio mode is faster for short clips. If audio latency is reported on older hardware during QA, switch to `html5: true` as a targeted fix.

2. **Should all step Howls be created at mount, or lazily on step entry?**
   - What we know: Creating all at mount front-loads any potential memory cost; creating lazily reduces peak memory.
   - What's unclear: How many steps the largest lesson has (checking curriculum data confirms max ~5 steps per lesson).
   - RESOLVED: Create all at mount. Max 5 Howl instances is negligible memory; it eliminates any "first play latency" on step entry.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | howler install | ✓ | (confirmed by package.json presence) | — |
| howler (npm) | LESS-02, LESS-03, LESS-04 | Not yet installed | 2.2.4 (latest) | — |
| @types/howler (npm) | TypeScript types | Not yet installed | 2.2.12 | — |
| Audio files `/audio/lessons/` | LESS-02 | ✗ (directory does not exist) | — | D-06: silent fallback; lesson proceeds without audio |
| Vitest + jsdom | Phase tests | ✓ | (confirmed by existing test suite — 31 tests passing) | — |

**Missing dependencies with no fallback:**
- None blocking execution. `howler` install is a Wave 0 task.

**Missing dependencies with fallback:**
- Audio files: per D-06, 404 is handled silently. Planner must ensure `onloaderror` dispatches `AUDIO_ENDED` to prevent stuck state.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + @testing-library/react 16.x |
| Config file | `vite.config.ts` (test block) |
| Quick run command | `npx vitest run src/screens/LessonScreen.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LESS-01 | Unlock tap transitions to step 0 | unit | `npx vitest run src/screens/LessonScreen.test.tsx` | ❌ Wave 0 |
| LESS-01 | Advancing through all steps reaches celebration | unit | `npx vitest run src/screens/LessonScreen.test.tsx` | ❌ Wave 0 |
| LESS-02 | Howl.play() called on step entry (via mock) | unit | `npx vitest run src/screens/LessonScreen.test.tsx` | ❌ Wave 0 |
| LESS-03 | Replay icon tap calls howl.stop() then howl.play() | unit | `npx vitest run src/screens/LessonScreen.test.tsx` | ❌ Wave 0 |
| LESS-04 | play() called synchronously in unlock handler (not in useEffect) | unit | `npx vitest run src/screens/LessonScreen.test.tsx` | ❌ Wave 0 |
| LESS-04 | No audio plays before the first tap | unit | `npx vitest run src/screens/LessonScreen.test.tsx` | ❌ Wave 0 |
| D-06 | onloaderror dispatches AUDIO_ENDED (no stuck state) | unit | `npx vitest run src/hooks/useLessonAudio.test.ts` | ❌ Wave 0 |

**Howler mock strategy:** Howler.js uses Web Audio API not available in jsdom. The test file must mock the `howler` module:
```typescript
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(({ onend, onloaderror, onplayerror }) => ({
    play: vi.fn(() => { onend?.() }),   // synchronous for tests
    stop: vi.fn(),
    unload: vi.fn(),
    _callbacks: { onend, onloaderror, onplayerror },
  }))
}))
```

### Sampling Rate
- **Per task commit:** `npx vitest run src/screens/LessonScreen.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green (31 existing + new Phase 3 tests) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/screens/LessonScreen.test.tsx` — covers LESS-01, LESS-02, LESS-03, LESS-04
- [ ] `src/hooks/useLessonAudio.test.ts` — covers D-06 (onloaderror → AUDIO_ENDED)
- [ ] Howler module mock (can be inline or in `src/test/setup.ts`)

---

## Security Domain

> This phase introduces no authentication, no user input processing, no data persistence, no network requests, and no external service calls. The only external dependency is loading static MP3 files from the same origin. ASVS categories are not applicable.

| ASVS Category | Applies | Notes |
|---------------|---------|-------|
| V2 Authentication | No | No auth in this phase |
| V3 Session Management | No | No session tokens |
| V4 Access Control | No | No access gating |
| V5 Input Validation | No | No user text input; tap targets only |
| V6 Cryptography | No | No crypto operations |

**One note:** Audio files are loaded from `/audio/lessons/{lessonId}/step-{N}.mp3` — same-origin static files. If a future phase adds user-controlled `lessonId` values that feed into this path, path traversal validation will be needed. In Phase 3, `lessonId` comes from the curriculum module (static import), not from user input — no risk.

---

## Sources

### Primary (HIGH confidence)
- [howler.js README](https://github.com/goldfire/howler.js/blob/master/README.md) — Howl constructor API, play/stop/unload, onend/onloaderror/onplayerror callbacks
- [MDN Web Audio API Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) — iOS user gesture requirement for AudioContext
- `src/curriculum/types.ts` — LessonStep, WorkedExample, Lesson interfaces (verified in codebase)
- `package.json` — confirmed stack (React 19.2, Tailwind 4, Vitest 4, React Router 7)
- `src/index.css` — confirmed design tokens (color palette, Nunito font, 100dvh pattern)

### Secondary (MEDIUM confidence)
- [npm registry: howler@2.2.4](https://www.npmjs.com/package/howler) — version and publish date verified
- [npm registry: @types/howler@2.2.12](https://www.npmjs.com/package/@types/howler) — version verified
- [howlerjs.com](https://howlerjs.com) — confirms library homepage and version 2.2.3/2.2.4

### Tertiary (LOW confidence)
- WebSearch results on iOS Safari audio unlock patterns — confirmed by MDN primary source
- WebSearch results on CSS confetti patterns — structural approach verified; specific implementation is [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack (howler): HIGH — verified via npm registry + official README + slopcheck OK
- iOS audio unlock pattern: HIGH — verified via MDN official docs + howler README
- State machine pattern (useReducer): HIGH — verified via React official docs pattern
- CSS confetti approach: MEDIUM — verified structural approach; exact implementation is discretionary
- Pitfall 5 (onloaderror → AUDIO_ENDED): MEDIUM — logical from Howler architecture; verifiable in integration test

**Research date:** 2026-05-14
**Valid until:** 2026-11-14 (howler 2.x is stable; iOS audio policy is stable)
