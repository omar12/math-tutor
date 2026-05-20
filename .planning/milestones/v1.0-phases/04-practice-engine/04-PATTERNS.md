# Phase 4: Practice Engine - Pattern Map

**Mapped:** 2026-05-15
**Files analyzed:** 7 (5 primary + 2 new widget components)
**Analogs found:** 7 / 7

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/screens/PracticeScreen.tsx` | screen (state machine) | event-driven | `src/screens/LessonScreen.tsx` | exact |
| `src/screens/PracticeScreen.test.tsx` | test | — | `src/screens/LessonScreen.test.tsx` | exact |
| `src/components/MultipleChoiceWidget.tsx` | component | event-driven | `src/components/StepCard.tsx` | role-match |
| `src/components/DigitGridWidget.tsx` | component | event-driven | `src/components/StepCard.tsx` | role-match |
| `src/components/FeedbackSlot.tsx` | component | transform | `src/components/StepCard.tsx` | role-match |
| `src/components/ConfettiScreen.tsx` | component (modify) | request-response | self | exact |
| `src/App.tsx` | config/routing (modify) | request-response | self | exact |

---

## Pattern Assignments

### `src/screens/PracticeScreen.tsx` (screen, event-driven)

**Analog:** `src/screens/LessonScreen.tsx`

**Imports pattern** (lines 1–7):
```typescript
import { useReducer, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import RemyFox from '../components/RemyFox'
import { StepCard } from '../components/StepCard'
import { ConfettiScreen } from '../components/ConfettiScreen'
import { useLessonAudio } from '../hooks/useLessonAudio'
import { lessons } from '../curriculum/index'
```

PracticeScreen imports to use instead:
```typescript
import { useReducer, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ConfettiScreen } from '../components/ConfettiScreen'
import { problems } from '../curriculum/index'
import type { Problem } from '../curriculum/types'
// Plus the three new widgets once created:
// import { MultipleChoiceWidget } from '../components/MultipleChoiceWidget'
// import { DigitGridWidget } from '../components/DigitGridWidget'
// import { FeedbackSlot } from '../components/FeedbackSlot'
```

Note: all React Router imports use `'react-router'` (not `'react-router-dom'`). Verified in LessonScreen line 2.

**State machine types pattern** (lines 9–21 of LessonScreen):
```typescript
// LessonScreen exact pattern — copy structure, replace names and fields
type LessonPhase = 'unlock' | 'playing' | 'between-steps' | 'celebration'

interface LessonState {
  phase: LessonPhase
  stepIndex: number
}

type LessonAction =
  | { type: 'UNLOCK' }
  | { type: 'AUDIO_ENDED' }
  | { type: 'ADVANCE'; totalSteps: number }
  | { type: 'REPLAY' }
```

PracticeScreen state machine — same structural pattern, different fields:
```typescript
type PracticePhase = 'answering' | 'revealing' | 'celebration'

interface PracticeState {
  phase: PracticePhase
  problemIndex: number       // index into shuffled problemPool[]
  attemptCount: number       // resets to 0 per problem (D-03)
  composedDigits: string     // digit-grid composition; '' = empty
  phraseIndex: number        // rotates through encouragement phrases (FEED-03)
}

type PracticeAction =
  | { type: 'CORRECT_ANSWER' }
  | { type: 'WRONG_ANSWER' }
  | { type: 'ADVANCE'; totalProblems: number }
  | { type: 'COMPOSE_DIGIT'; digit: string }
  | { type: 'BACKSPACE' }
  | { type: 'BEGIN_REVEAL' }
```

**Reducer pure function pattern** (lines 22–38 of LessonScreen):
```typescript
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

Key structural rules to copy:
- Switch on `action.type`
- Return `{ ...state, ... }` for partial updates
- Return entirely new object for phase transitions
- `default: return state` always present
- ADVANCE checks boundary and transitions to `celebration` when past last item

**useReducer + useParams initialization pattern** (lines 40–46):
```typescript
export default function LessonScreen() {
  const { lessonId } = useParams<{ lessonId?: string }>()
  const lesson = lessons.find(l => l.id === lessonId) ?? lessons[0]
  const steps = lesson.workedExample.steps

  const navigate = useNavigate()
  const [state, dispatch] = useReducer(lessonReducer, { phase: 'unlock', stepIndex: 0 })
```

PracticeScreen equivalent — note route will be `/practice/:lessonId` (requires App.tsx change):
```typescript
export default function PracticeScreen() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()

  // Build problem pool once — filter then shuffle (D-01, D-02)
  const problemPool = useMemo<Problem[]>(() => {
    const raw = problems.filter(p => p.lessonId === lessonId)
    return [...raw].sort(() => Math.random() - 0.5)
  }, [lessonId])  // re-runs only if lessonId changes (i.e. never during session)

  const [state, dispatch] = useReducer(practiceReducer, {
    phase: 'answering',
    problemIndex: 0,
    attemptCount: 0,
    composedDigits: '',
    phraseIndex: 0,
  })
```

**useEffect for timed auto-advance (revealing phase)** — follow LessonScreen's useEffect pattern (lines 56–70) for cleanup:
```typescript
// LessonScreen useEffect pattern for side-effects tied to phase:
useEffect(() => {
  if (state.phase === 'playing') {
    // ...do work...
  }
}, [state.phase, state.stepIndex, howls])

// PracticeScreen adaptation — 1.5s auto-advance after reveal (D-09):
useEffect(() => {
  if (state.phase !== 'revealing') return
  const timer = setTimeout(() => {
    dispatch({ type: 'ADVANCE', totalProblems: problemPool.length })
  }, 1500)
  return () => clearTimeout(timer)   // cleanup on unmount (Pitfall 4)
}, [state.phase, problemPool.length])
```

**Conditional render pattern** (lines 90–113 of LessonScreen):
```typescript
// LessonScreen uses early-return if-branches for each phase:
if (state.phase === 'unlock') {
  return ( <div ...>...</div> )
}
if (state.phase === 'celebration') {
  return <ConfettiScreen onStartPractice={() => navigate('/practice')} />
}
// fallthrough renders the main phase UI
```

PracticeScreen uses same pattern:
```typescript
if (state.phase === 'celebration') {
  return (
    <ConfettiScreen
      onStartPractice={() => navigate('/')}
      buttonLabel="Back to Home"
    />
  )
}
// fallthrough renders 'answering' | 'revealing' phases
```

**Full-screen container pattern** (lines 119–122 of LessonScreen):
```typescript
<div
  className="flex flex-col items-center justify-center gap-6 bg-surface w-full"
  style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)', paddingTop: 'env(safe-area-inset-top)' }}
>
```

**Progress dots pattern** (lines 123–139 of LessonScreen):
```typescript
<div
  className="flex gap-2"
  aria-label={`Step ${state.stepIndex + 1} of ${totalSteps}`}
>
  {steps.map((_, i) => (
    <div
      key={i}
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: i === state.stepIndex ? '#FF6B35' : 'rgba(255, 107, 53, 0.2)',
      }}
    />
  ))}
</div>
```

PracticeScreen dots — use 8px (decorative only, smaller than lesson dots per UI-SPEC):
```typescript
<div
  className="flex gap-2"
  aria-label={`Problem ${state.problemIndex + 1} of ${problemPool.length}`}
>
  {problemPool.map((_, i) => (
    <div
      key={i}
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: i < state.problemIndex
          ? '#FF6B35'                     // answered (filled)
          : i === state.problemIndex
          ? '#FF6B35'                     // current (filled same color)
          : 'rgba(255, 107, 53, 0.2)',    // remaining (outline tint)
      }}
    />
  ))}
</div>
```

**Dispatch from child (button) pattern** (lines 160–168 of LessonScreen):
```typescript
<button
  className="bg-primary text-white rounded-full min-h-[64px] min-w-[64px] flex items-center justify-center text-2xl font-bold active:opacity-80"
  style={{ touchAction: 'manipulation' }}
  onClick={() => dispatch({ type: 'ADVANCE', totalSteps })}
  aria-label="Next step"
>
  →
</button>
```

---

### `src/screens/PracticeScreen.test.tsx` (test)

**Analog:** `src/screens/LessonScreen.test.tsx`

**Test file imports and setup pattern** (lines 1–9 of LessonScreen.test.tsx):
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Howl } from 'howler'
import LessonScreen from './LessonScreen'
import { lessons } from '../curriculum/index'

describe('LessonScreen', () => {
  beforeEach(() => { vi.clearAllMocks() })
```

PracticeScreen test equivalent:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import PracticeScreen from './PracticeScreen'
import { problems } from '../curriculum/index'

// Helper: render PracticeScreen with a specific lessonId in the route
function renderWithRoute(lessonId: string) {
  return render(
    <MemoryRouter initialEntries={[`/practice/${lessonId}`]}>
      <Routes>
        <Route path="/practice/:lessonId" element={<PracticeScreen />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PracticeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()          // needed for FEED-02 1.5s auto-advance test
  })
  afterEach(() => {
    vi.useRealTimers()
  })
```

**Screen assertion pattern** (lines 11–15 of LessonScreen.test.tsx):
```typescript
it('shows unlock screen with Remy, lesson title, and tap instruction before first tap', () => {
  render(<MemoryRouter><LessonScreen /></MemoryRouter>)
  expect(screen.getByText('Tap anywhere to start')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /remy/i })).toBeInTheDocument()
})
```

**act() wrapping for state updates triggered by callbacks** (lines 38–45):
```typescript
act(() => { HowlMock.mock.calls[0][0].onend() })
// Now in between-steps — Next button visible
const nextBtn = screen.getByRole('button', { name: /next step/i })
```

**Timed transition test pattern using vi.useFakeTimers** — used for FEED-02 (1.5s reveal):
```typescript
it('auto-advances after 1.5s reveal on 3rd wrong answer — FEED-02', () => {
  renderWithRoute('addition-grade1-01')
  // ... submit 3 wrong answers ...
  act(() => { vi.advanceTimersByTime(1500) })
  // assert next problem is shown
})
```

**Regression pattern** (lines 47–59 of LessonScreen.test.tsx) — step through multiple states:
```typescript
for (let i = 0; i < steps.length; i++) {
  act(() => { HowlMock.mock.calls[i][0].onend() })
  fireEvent.click(screen.getByRole('button', { name: /next step/i }))
}
expect(screen.getByText('You did it!')).toBeInTheDocument()
expect(screen.getByRole('button', { name: /start practice/i })).toBeInTheDocument()
```

**App.test.tsx — test that must be updated in Plan 1** (lines 25–30 of App.test.tsx):
```typescript
// CURRENT — tests the stub, must be updated after PracticeScreen is replaced:
it('renders PracticeScreen at /practice', () => {
  render(
    <MemoryRouter initialEntries={['/practice']}>
      <App />
    </MemoryRouter>
  )
  expect(screen.getByText('Practice')).toBeInTheDocument()
})

// UPDATED — must change to /practice/:lessonId route and match real initial render:
it('renders PracticeScreen at /practice/:lessonId', () => {
  render(
    <MemoryRouter initialEntries={['/practice/addition-grade1-01']}>
      <App />
    </MemoryRouter>
  )
  // Assert something present in the real PracticeScreen initial state
  // e.g. the first problem's question text, or the progress dots aria-label
  expect(screen.getByLabelText(/problem 1 of/i)).toBeInTheDocument()
})
```

---

### `src/components/MultipleChoiceWidget.tsx` (component, event-driven)

**Analog:** `src/components/StepCard.tsx` (closest presentational component pattern)

**StepCard card shell pattern** (lines 8–9 of StepCard.tsx):
```typescript
<div className="flex flex-col bg-white rounded-2xl shadow-sm p-8 w-4/5 max-w-lg">
```

**StepCard button with touch pattern** (lines 14–19 of StepCard.tsx):
```typescript
<button
  aria-label="Replay this step"
  className="self-end mt-6 min-h-[44px] min-w-[44px] flex items-center justify-center"
  style={{ touchAction: 'manipulation' }}
  onClick={onReplay}
>
```

MultipleChoiceWidget component structure — props dispatch up, no internal state:
```typescript
interface MultipleChoiceWidgetProps {
  choices: number[]         // already shuffled by parent via useMemo
  correctAnswer: number
  phase: 'answering' | 'revealing'
  onSubmit: (choice: number) => void
}

export function MultipleChoiceWidget({ choices, correctAnswer, phase, onSubmit }: MultipleChoiceWidgetProps) {
  // 2×2 grid (portrait) — responsive to 1×4 on landscape via CSS grid
  return (
    <div className="grid grid-cols-2 gap-4 w-full px-6">
      {choices.map((choice) => {
        const isCorrectReveal = phase === 'revealing' && choice === correctAnswer
        return (
          <button
            key={choice}
            aria-label={String(choice)}
            className={[
              'bg-white rounded-2xl shadow-sm min-h-[64px] flex items-center justify-center',
              'text-4xl font-bold text-on-surface active:opacity-80',
              isCorrectReveal ? 'border-2 border-success bg-success/10' : '',
            ].join(' ')}
            style={{ touchAction: 'manipulation' }}
            onClick={() => phase === 'answering' && onSubmit(choice)}
            disabled={phase === 'revealing'}
          >
            {choice}
          </button>
        )
      })}
    </div>
  )
}
```

**Wrong-answer pulse animation** — add to `src/index.css` alongside `confetti-fall` (lines 48–57):
```css
/* Phase 3 existing pattern: */
@keyframes confetti-fall {
  0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}

/* Phase 4 addition — same file, same section: */
@keyframes wrong-pulse {
  0%   { border-color: transparent; }
  50%  { border-color: #FF6B35; }
  100% { border-color: transparent; }
}

.wrong-pulse {
  animation: wrong-pulse 300ms ease-in-out 1;
  border-width: 2px;
}
```

**useMemo shuffle pattern** — in PracticeScreen, not the widget (widget receives pre-shuffled choices):
```typescript
// In PracticeScreen, keyed on problem.id so it re-shuffles only when problem changes
const currentProblem = problemPool[state.problemIndex]
const shuffledChoices = useMemo(() => {
  if (currentProblem.type !== 'multiple-choice') return []
  return [...currentProblem.choices].sort(() => Math.random() - 0.5)
}, [currentProblem.id])  // stable across re-renders of same problem (Pitfall 2)
```

---

### `src/components/DigitGridWidget.tsx` (component, event-driven)

**Analog:** `src/components/StepCard.tsx` (presentational component with dispatch-up pattern)

**Critical: no `<input>` element** — iOS keyboard pitfall (Pitfall 1 in RESEARCH.md). Display box is a `<div>`, not an input.

**StepCard equation display pattern** (lines 10–12 of StepCard.tsx):
```typescript
{equation && (
  <p className="text-4xl font-bold text-center text-on-surface mt-8">{equation}</p>
)}
```

DigitGridWidget structure — display box + grid of buttons:
```typescript
interface DigitGridWidgetProps {
  composedDigits: string      // from PracticeState.composedDigits
  correctAnswer: number       // for reveal phase display
  phase: 'answering' | 'revealing'
  onDigit: (digit: string) => void
  onBackspace: () => void
  onSubmit: () => void
}

export function DigitGridWidget({ composedDigits, correctAnswer, phase, onDigit, onBackspace, onSubmit }: DigitGridWidgetProps) {
  const displayValue = phase === 'revealing'
    ? String(correctAnswer)
    : composedDigits || '_'

  return (
    <div className="flex flex-col gap-4 px-6 w-full">
      {/* Display box — <div> not <input> to suppress iOS keyboard (PRAC-02) */}
      <div
        className={[
          'bg-white rounded-2xl shadow-sm min-h-[64px] flex items-center justify-center',
          'text-4xl font-bold',
          phase === 'revealing' ? 'text-success' : composedDigits ? 'text-on-surface' : 'text-on-surface/30',
        ].join(' ')}
        aria-live="polite"
        aria-label={composedDigits ? `Your answer: ${composedDigits}` : 'Enter your answer'}
      >
        {displayValue}
      </div>

      {/* 3×4 key grid — layout: [7][8][9] / [4][5][6] / [1][2][3] / [⌫][0][Check] */}
      <div className="grid grid-cols-3 gap-4">
        {['7','8','9','4','5','6','1','2','3'].map(d => (
          <button
            key={d}
            className="bg-white rounded-xl shadow-sm min-h-[64px] min-w-[64px] text-2xl font-bold text-on-surface active:opacity-80"
            style={{ touchAction: 'manipulation' }}
            onClick={() => onDigit(d)}
            disabled={phase === 'revealing'}
            aria-label={d}
          >
            {d}
          </button>
        ))}
        {/* Bottom row */}
        <button aria-label="Delete last digit" ... onClick={onBackspace}>
          {/* inline SVG backspace icon — stroke="#FF6B35" matches StepCard replay icon pattern */}
        </button>
        <button aria-label="0" ...>{`0`}</button>
        <button
          aria-label="Check my answer"
          className="bg-accent text-white rounded-xl shadow-sm min-h-[64px] text-base font-bold active:opacity-80 disabled:opacity-40"
          style={{ touchAction: 'manipulation' }}
          disabled={composedDigits.length === 0 || phase === 'revealing'}
          onClick={onSubmit}
        >
          Check
        </button>
      </div>
    </div>
  )
}
```

**Backspace SVG inline pattern** — copy from StepCard.tsx lines 15–33 (same stroke-primary convention):
```typescript
// StepCard replay icon — follow this exact SVG pattern for backspace:
<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#FF6B35"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
>
  {/* Replace path data with backspace arrow paths */}
</svg>
```

---

### `src/components/FeedbackSlot.tsx` (component, transform)

**Analog:** Inline text in `src/screens/LessonScreen.tsx` (the "Tap anywhere to start" subtitle pattern)

**LessonScreen subtitle pattern** (line 104):
```typescript
<p className="text-xl text-on-surface/60">Tap anywhere to start</p>
```

FeedbackSlot — reserved height, text-only, aria-live:
```typescript
interface FeedbackSlotProps {
  attemptCount: number
  phraseIndex: number
}

const ENCOURAGEMENT_PHRASES = [
  "Nice try! Give it another go.",
  "Almost! You can do it.",
  "Keep going — you're doing great!",
  "Not quite, but don't give up!",
  "Hmm, try again!",
]

const FALLBACK_HINT = "Think about what number makes the equation balance."

export function FeedbackSlot({ attemptCount, phraseIndex }: FeedbackSlotProps) {
  let text: string | null = null
  if (attemptCount === 1) text = ENCOURAGEMENT_PHRASES[phraseIndex % ENCOURAGEMENT_PHRASES.length]
  else if (attemptCount >= 2) text = FALLBACK_HINT

  return (
    <div
      className="min-h-[48px] flex items-center justify-center px-6"
      aria-live="polite"      // screen reader announces text changes (UI-SPEC Accessibility)
    >
      {text && (
        <p className="text-lg text-primary text-center">{text}</p>
      )}
    </div>
  )
}
```

Note: `text-primary` maps to `#FF6B35` via `--color-primary` in `src/index.css` @theme. The `min-h-[48px]` reserves space to prevent layout shift (D-08).

---

### `src/components/ConfettiScreen.tsx` (modify — add `buttonLabel` prop)

**Analog:** Self — read the actual file

**Current interface** (lines 1–3 of ConfettiScreen.tsx):
```typescript
interface ConfettiScreenProps {
  onStartPractice: () => void
}
```

**Current button** (lines 32–38 of ConfettiScreen.tsx):
```typescript
<button
  className="bg-accent text-white text-xl font-bold rounded-3xl px-10 py-5 min-h-[64px] min-w-[200px] active:opacity-80 relative"
  style={{ touchAction: 'manipulation' }}
  aria-label="Start Practice"
  onClick={onStartPractice}
>
  Start Practice
</button>
```

**Modified interface** (backwards-compatible per D-11):
```typescript
interface ConfettiScreenProps {
  onStartPractice: () => void
  buttonLabel?: string        // default 'Start Practice' — Phase 3 usage unchanged
}
```

**Modified button** — both visible text and aria-label must use the prop (Pitfall 6):
```typescript
<button
  className="bg-accent text-white text-xl font-bold rounded-3xl px-10 py-5 min-h-[64px] min-w-[200px] active:opacity-80 relative"
  style={{ touchAction: 'manipulation' }}
  aria-label={buttonLabel ?? 'Start Practice'}
  onClick={onStartPractice}
>
  {buttonLabel ?? 'Start Practice'}
</button>
```

Phase 3 caller in LessonScreen (line 111) — unchanged, default applies:
```typescript
return <ConfettiScreen onStartPractice={() => navigate('/practice')} />
```

Phase 4 caller in PracticeScreen — passes both props:
```typescript
return (
  <ConfettiScreen
    onStartPractice={() => navigate('/')}
    buttonLabel="Back to Home"
  />
)
```

**Regression check:** After this change, run `npx vitest run src/screens/LessonScreen.test.tsx`. The test at line 58 asserts `getByRole('button', { name: /start practice/i })` — this must still pass because the default is `'Start Practice'`.

---

### `src/App.tsx` (modify — route param)

**Analog:** Self — current file

**Current route definition** (lines 8–14 of App.tsx):
```typescript
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/lesson" element={<LessonScreen />} />
      <Route path="/practice" element={<PracticeScreen />} />
      <Route path="/parent" element={<ParentScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

**Pattern reference — LessonScreen already uses `useParams`** (LessonScreen.tsx line 41):
```typescript
const { lessonId } = useParams<{ lessonId?: string }>()
```

**Modified route** — one-line change:
```typescript
<Route path="/practice/:lessonId" element={<PracticeScreen />} />
```

**LessonScreen caller must update** (LessonScreen.tsx line 111):
```typescript
// CURRENT:
return <ConfettiScreen onStartPractice={() => navigate('/practice')} />

// UPDATED — pass lessonId as route segment:
return <ConfettiScreen onStartPractice={() => navigate(`/practice/${lesson.id}`)} />
```

**App.test.tsx must update** (App.test.tsx lines 25–30):
```typescript
// CURRENT (targets stub text "Practice" which won't exist):
it('renders PracticeScreen at /practice', () => {
  render(<MemoryRouter initialEntries={['/practice']}><App /></MemoryRouter>)
  expect(screen.getByText('Practice')).toBeInTheDocument()
})

// UPDATED (targets route with lessonId param, asserts real content):
it('renders PracticeScreen at /practice/:lessonId', () => {
  render(
    <MemoryRouter initialEntries={['/practice/addition-grade1-01']}>
      <App />
    </MemoryRouter>
  )
  expect(screen.getByLabelText(/problem 1 of/i)).toBeInTheDocument()
})
```

---

## Shared Patterns

### Full-Screen Container
**Source:** `src/screens/LessonScreen.tsx` lines 119–122 and `src/screens/HomeScreen.tsx` lines 9–11
**Apply to:** `PracticeScreen.tsx` (the only new screen)
```typescript
<div
  className="flex flex-col bg-surface w-full"
  style={{
    height: '100dvh',
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  }}
>
```
Note: `overflow: hidden` is already set globally on `html, body, #root` in `src/index.css` line 25 — do NOT re-declare on PracticeScreen.

### Touch Target Sizing
**Source:** `src/index.css` lines 41–45 (global rule) + `src/components/ConfettiScreen.tsx` line 33 (explicit class)
**Apply to:** Every `<button>` in MultipleChoiceWidget, DigitGridWidget, and PracticeScreen
```css
/* Global in index.css — automatically applies min-height/min-width: */
button, [role="button"], a {
  touch-action: manipulation;
  user-select: none;
  min-height: 44px;
  min-width: 44px;
}
```
Explicit override for large targets (digit keys, answer cards):
```typescript
className="... min-h-[64px] min-w-[64px] ..."  // 64px on interactive targets for ages 6–9
```

### Navigation Pattern
**Source:** `src/screens/LessonScreen.tsx` lines 45 and 111; `src/screens/HomeScreen.tsx` line 9
**Apply to:** PracticeScreen
```typescript
const navigate = useNavigate()   // from 'react-router' (not 'react-router-dom')
// Usage:
navigate('/')                    // go to home
navigate(`/practice/${lesson.id}`)  // go to practice with param
```

### Color Token Usage
**Source:** `src/index.css` @theme block (lines 8–17)
**Apply to:** All new components — use Tailwind utility classes backed by these tokens, never raw hex
```css
@theme {
  --color-primary:    #FF6B35;  /* bg-primary, text-primary, border-primary, stroke-primary */
  --color-secondary:  #FFD23F;  /* bg-secondary */
  --color-accent:     #3B82F6;  /* bg-accent (Check Answer button, focus rings) */
  --color-success:    #22C55E;  /* bg-success, border-success, text-success (correct reveal) */
  --color-surface:    #FFF8F0;  /* bg-surface (all screen backgrounds) */
  --color-on-surface: #1C1917;  /* text-on-surface (all body text) */
}
```
Do not add new color values. All color needs are covered.

### Card Shell
**Source:** `src/components/StepCard.tsx` line 9
**Apply to:** Answer option cards in MultipleChoiceWidget; digit display box; digit keys
```typescript
className="bg-white rounded-2xl shadow-sm p-8"   // StepCard exact
// Variants used in Phase 4:
className="bg-white rounded-2xl shadow-sm"         // answer option card (padding via flex)
className="bg-white rounded-xl shadow-sm"          // digit grid key (smaller radius)
```

### Inline SVG Icon with `stroke-primary`
**Source:** `src/components/StepCard.tsx` lines 20–33
**Apply to:** Backspace key in DigitGridWidget
```typescript
<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#FF6B35"         // --color-primary — matches replay icon convention
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
>
```

### CSS Keyframe Animation
**Source:** `src/index.css` lines 48–57 (`confetti-fall` and `.confetti-piece`)
**Apply to:** `wrong-pulse` keyframe added to `src/index.css` for wrong-answer feedback
```css
/* Existing Phase 3 pattern to follow: */
@keyframes confetti-fall {
  0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
.confetti-piece {
  animation: confetti-fall 1.8s ease-in forwards;
  border-radius: 2px;
  position: fixed;
}
```

### `satisfies` Pattern for Curriculum Data
**Source:** `src/curriculum/index.ts` line 5
**Apply to:** Any new constant data arrays (e.g., `ENCOURAGEMENT_PHRASES` — though a simple typed `const` is fine there)
```typescript
export const curriculum = raw satisfies CurriculumData
```

---

## No Analog Found

All files have close analogs. No files require falling back to RESEARCH.md patterns exclusively — however the following files are net-new components with no direct analog (they inherit shared patterns):

| File | Role | Data Flow | Note |
|------|------|-----------|------|
| `src/components/MultipleChoiceWidget.tsx` | component | event-driven | No existing multi-choice widget; StepCard used as structural analog for card + button pattern |
| `src/components/DigitGridWidget.tsx` | component | event-driven | No existing digit-grid or custom numpad; StepCard button pattern + iOS keyboard avoidance from RESEARCH.md Pitfall 1 |
| `src/components/FeedbackSlot.tsx` | component | transform | No existing feedback/inline-message component; LessonScreen subtitle text used as style analog |

---

## Metadata

**Analog search scope:** `src/screens/`, `src/components/`, `src/curriculum/`, `src/App.tsx`, `src/index.css`
**Files scanned:** 10 source files read directly
**Pattern extraction date:** 2026-05-15
