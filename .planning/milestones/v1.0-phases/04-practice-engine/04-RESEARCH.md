# Phase 4: Practice Engine - Research

**Researched:** 2026-05-15
**Domain:** React useReducer state machine, touch input (digit grid + multiple choice), feedback escalation, CSS-only animation, component reuse
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Problem pool is lesson-specific — all problems where `problem.lessonId === lesson.id`. No cross-lesson mixing.
- **D-02:** Show all lesson problems (~5 per lesson), shuffled at session start. No fixed cap.
- **D-03:** After 3 wrong attempts, advance to next problem. Failed problem is NOT re-inserted.
- **D-04:** Multiple-choice tap immediately registers as the answer — no select-then-confirm.
- **D-05:** Digit grid composes answer in display box; child taps Check to submit.
- **D-06:** Backspace removes last digit. No clear-all.
- **D-07:** Wrong answer encouragement appears inline below the problem question. Phrases rotate and maintain warm tone.
- **D-08:** Hint after 2nd wrong attempt replaces encouragement in the same slot. No layout shift.
- **D-09:** After 3rd wrong attempt correct answer is highlighted green; after ~1.5s pause, auto-advances.
- **D-10:** Reuse existing `ConfettiScreen`. Pass `buttonLabel="Back to Home"` and navigate to `'/'`.
- **D-11:** `ConfettiScreen` gains `buttonLabel?: string` prop. Default `'Start Practice'` — backwards compatible.
- **D-12:** After celebration button, navigate to `'/'`.

### Claude's Discretion

- State machine structure (useReducer shape, action types) — follow LessonScreen pattern from Phase 3
- Visual design of digit display box, grid layout, answer option cards
- Confetti/animation choice for correct-answer feedback per problem — keep lightweight, no Lottie for per-problem moments
- Encouragement phrase copy (warm, rotating, Remy the Fox voice)
- Hint content per problem — placeholder or representative; exact hint text is content, not architecture

### Deferred Ideas (OUT OF SCOPE)

- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PRAC-01 | Kid can answer practice problems via multiple choice — 4 large-touch-target options, no keyboard | MultipleChoiceWidget with 2×2 grid, 64px min-height cards, immediate tap-to-submit (D-04) |
| PRAC-02 | Kid can answer fill-in-the-blank via tappable digit grid (0–9), no software keyboard | DigitGridWidget with inputMode suppression, display box, Check button, backspace (D-05, D-06) |
| PRAC-03 | Practice problems follow immediately after each lesson's guided example | Navigation from LessonScreen ConfettiScreen routes to `/practice` — lessonId must flow through |
| FEED-01 | After 2 wrong attempts, app shows a hint | `attemptCount >= 2` branch in reducer; hint replaces encouragement in FeedbackSlot |
| FEED-02 | After 3 wrong attempts, reveal correct answer and advance — no infinite retry | `attemptCount >= 3` triggers REVEAL action; 1.5s setTimeout then ADVANCE |
| FEED-03 | Encouragement phrases on wrong answers rotate and maintain warm, non-punishing tone | Rotating array of 5 phrases indexed by `phraseIndex % phrases.length` |
| FEED-04 | Session end triggers a completion celebration screen with visual reward | ConfettiScreen rendered when `problemIndex >= problemPool.length` |
</phase_requirements>

---

## Summary

Phase 4 replaces a four-line stub (`PracticeScreen.tsx`) with a fully working practice session. The implementation is self-contained in the React component tree — no new npm packages required. All dependencies are already installed. The work divides into three areas: (1) a useReducer state machine modeled directly on the LessonScreen pattern, (2) two input widgets (MultipleChoiceWidget and DigitGridWidget), and (3) a small prop extension to ConfettiScreen.

The most significant architectural decision that emerged from codebase analysis is the lessonId routing gap: `App.tsx` currently routes `<Route path="/practice" element={<PracticeScreen />} />` with no params, but PracticeScreen needs to know which lesson's problems to load. The current LessonScreen navigates to `/practice` with no lessonId passed. This must be resolved — either by adding a route param (`/practice/:lessonId`) or by passing the lessonId as route state. This is a structural prerequisite that must land in Plan 1 before any widget work begins.

A secondary finding: the curriculum `Problem` schema has no `hint` field. The UI-SPEC references "problem-specific hint from curriculum data" — but `Object.keys(problems[0])` confirms the field does not exist. All hints in Phase 4 will fall back to the generic fallback text ("Think about what number makes the equation balance."). No schema change is needed; the fallback path is sufficient for Phase 4.

**Primary recommendation:** Follow the LessonScreen useReducer pattern exactly. Model the state machine first, then build the two input widgets as pure presentational components that dispatch actions up.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Session state (problem index, attempt count, phase) | Browser / Client | — | Local ephemeral state; no persistence in Phase 4 |
| Problem pool construction (filter + shuffle) | Browser / Client | — | Pure in-memory computation from imported curriculum array |
| Multiple-choice rendering and submission | Browser / Client | — | Presentational widget dispatching to reducer |
| Digit grid composition and submission | Browser / Client | — | Presentational widget, no keyboard, dispatching to reducer |
| Feedback escalation logic | Browser / Client | — | Reducer pure function; state machine transition |
| Session-end celebration | Browser / Client | — | ConfettiScreen already implemented; needs buttonLabel prop |
| Routing (lessonId flow) | Browser / Client | — | React Router useParams or useLocation state — no backend |
| Progress recording | — (OUT OF SCOPE) | — | Phase 5 responsibility — no Dexie writes in Phase 4 |

---

## Standard Stack

### Core (already installed — no new packages)

| Library | Installed Version | Purpose | Why Standard |
|---------|------------------|---------|--------------|
| React | 19.2.6 | UI rendering, useReducer, hooks | Project standard; already in use |
| TypeScript | ~6.0.2 | Type safety for state/action unions | Project standard |
| React Router | 7.15.0 | `useNavigate`, `useParams`, `useLocation` | Project standard; routing already wired |
| Tailwind CSS | 4.3.0 | Utility classes, responsive grid, color tokens | Project standard; CSS-first tokens in `src/index.css` |

[VERIFIED: codebase — package.json]

### Supporting (already installed)

| Library | Installed Version | Purpose | When to Use |
|---------|------------------|---------|-------------|
| @testing-library/react | 16.3.2 | Unit tests for PracticeScreen | All new screen tests |
| @testing-library/user-event | 14.6.1 | Simulating tap/click events in tests | Widget interaction tests |
| Vitest | 4.1.6 | Test runner | All tests |

[VERIFIED: codebase — package.json]

### No New Packages Required

This phase installs zero new dependencies. All capability is covered by the existing stack.

**Installation:** Nothing to install.

---

## Package Legitimacy Audit

No new packages are introduced in Phase 4. All code uses libraries already present in `package.json` and verified as working in Phases 1–3.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| (none) | — | — | — | — | — | — |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
LessonScreen (Phase 3)
  └── ConfettiScreen [Start Practice → navigate('/practice/:lessonId')]
        |
        ▼
PracticeScreen (mounts with lessonId from route param or location state)
  |
  ├── [setup] problems.filter(p => p.lessonId === lessonId)
  │          → shuffle → problemPool[]
  |
  ├── useReducer(practiceReducer, initialState)
  │     State: { phase, problemIndex, attemptCount, composedDigits, phraseIndex }
  |
  ├── phase === 'answering'
  │     ├── ProgressDots (decorative)
  │     ├── ProblemQuestion (text)
  │     ├── FeedbackSlot (encouragement | hint | empty)
  │     └── [switch problem.type]
  │           ├── MultipleChoiceWidget → dispatch SUBMIT_ANSWER
  │           └── DigitGridWidget     → dispatch COMPOSE_DIGIT | BACKSPACE | SUBMIT_ANSWER
  |
  ├── phase === 'revealing' (after 3rd wrong)
  │     ├── Same layout, correct answer highlighted
  │     └── setTimeout 1500ms → dispatch ADVANCE
  |
  └── phase === 'celebration'
        └── ConfettiScreen buttonLabel="Back to Home" onStartPractice={() => navigate('/')}
```

### Recommended Project Structure

```
src/
├── screens/
│   └── PracticeScreen.tsx        # Main screen — state machine, layout orchestration
├── components/
│   ├── ConfettiScreen.tsx        # MODIFIED: add buttonLabel?: string prop
│   ├── MultipleChoiceWidget.tsx  # NEW: 2×2 grid of answer cards
│   ├── DigitGridWidget.tsx       # NEW: digit display box + 3×4 key grid
│   └── FeedbackSlot.tsx          # NEW: inline encouragement/hint slot
└── screens/
    └── PracticeScreen.test.tsx   # NEW: unit tests
```

### Pattern 1: useReducer State Machine (follow LessonScreen exactly)

**What:** A typed discriminated union `PracticeAction` and a pure `practiceReducer` function. All state transitions live in the reducer — components only dispatch actions.

**When to use:** Any screen with multi-step UI state where phase transitions must be predictable.

**State shape:**
```typescript
// Source: LessonScreen.tsx pattern, adapted for practice session

type PracticePhase = 'answering' | 'revealing' | 'celebration'

interface PracticeState {
  phase: PracticePhase
  problemIndex: number        // index into shuffled problemPool[]
  attemptCount: number        // resets to 0 on problem advance (D-03 per-problem counter)
  composedDigits: string      // digit-grid input accumulation ('' = empty)
  phraseIndex: number         // which encouragement phrase to show next (rotates)
}

type PracticeAction =
  | { type: 'CORRECT_ANSWER' }          // immediate correct submission
  | { type: 'WRONG_ANSWER' }            // wrong submission; increment attempt + rotate phrase
  | { type: 'ADVANCE'; totalProblems: number }  // move to next problem (or celebration)
  | { type: 'COMPOSE_DIGIT'; digit: string }    // digit-grid: append digit
  | { type: 'BACKSPACE' }               // digit-grid: remove last digit
  | { type: 'BEGIN_REVEAL' }            // 3rd wrong: enter revealing phase

function practiceReducer(state: PracticeState, action: PracticeAction): PracticeState {
  switch (action.type) {
    case 'CORRECT_ANSWER':
      return { ...state, phase: 'answering' }  // caller does setTimeout → ADVANCE
    case 'WRONG_ANSWER':
      return {
        ...state,
        attemptCount: state.attemptCount + 1,
        composedDigits: '',          // clear digit grid on wrong
        phraseIndex: state.phraseIndex + 1,
      }
    case 'BEGIN_REVEAL':
      return { ...state, phase: 'revealing' }
    case 'ADVANCE': {
      const next = state.problemIndex + 1
      if (next >= action.totalProblems) return { ...state, phase: 'celebration' }
      return { phase: 'answering', problemIndex: next, attemptCount: 0, composedDigits: '', phraseIndex: state.phraseIndex }
    }
    case 'COMPOSE_DIGIT':
      return { ...state, composedDigits: state.composedDigits + action.digit }
    case 'BACKSPACE':
      return { ...state, composedDigits: state.composedDigits.slice(0, -1) }
    default:
      return state
  }
}
```

[ASSUMED: reducer shape — authored per LessonScreen pattern and CONTEXT.md decisions]

### Pattern 2: Shuffle Once Per Problem (stable across re-renders)

**What:** Shuffle `choices` exactly once when the problem mounts. Use `useMemo` keyed on `problem.id`.

**When to use:** Any list that must be randomized at render but not on every re-render.

```typescript
// Source: CONTEXT.md specifics + Phase 2 D-08 (choices are unordered)
const shuffledChoices = useMemo(
  () => [...problem.choices].sort(() => Math.random() - 0.5),
  [problem.id]   // re-shuffles only when problem changes
)
```

[ASSUMED: useMemo pattern — standard React pattern]

### Pattern 3: Digit Grid — Suppress Software Keyboard on iOS Safari

**What:** An `<input>` or editable element on iOS will trigger the software keyboard unless explicitly suppressed. The digit grid is a custom tap UI, so the keyboard must never appear.

**How:** Do NOT use an `<input>` element as the backing store. Use a plain React string state (`composedDigits`). The display box is a `<div>` or `<p>` — not an input — so iOS Safari will never show the keyboard.

```typescript
// No <input> element in DigitGridWidget.
// Display box is a <div> showing `composedDigits || '_'`
// Digit keys are <button> elements that dispatch COMPOSE_DIGIT
// No inputMode, no type="number", no contentEditable anywhere in the widget.
```

[ASSUMED: iOS keyboard suppression via non-input display — based on PLAT-01/PRAC-02 requirements and iOS Safari behavior]

**Critical:** `inputMode="none"` on an input only suppresses the keyboard on Android; iOS Safari ignores it for `type="text"`. The only reliable solution on iOS is to avoid `<input>` entirely.

### Pattern 4: Feedback Escalation

**What:** A single `FeedbackSlot` below the problem that shows different content based on `attemptCount`:
- `attemptCount === 0` → empty (height reserved, visually invisible)
- `attemptCount === 1` → encouragement phrase (rotated)
- `attemptCount >= 2` → fallback hint text

```typescript
// Source: CONTEXT.md D-07, D-08, UI-SPEC FeedbackSlot
const ENCOURAGEMENT_PHRASES = [
  "Nice try! Give it another go.",
  "Almost! You can do it.",
  "Keep going — you're doing great!",
  "Not quite, but don't give up!",
  "Hmm, try again!",
]

const FALLBACK_HINT = "Think about what number makes the equation balance."

function getFeedbackText(attemptCount: number, phraseIndex: number): string | null {
  if (attemptCount === 0) return null
  if (attemptCount === 1) return ENCOURAGEMENT_PHRASES[phraseIndex % ENCOURAGEMENT_PHRASES.length]
  return FALLBACK_HINT   // all hints fall back — no hint field in curriculum schema
}
```

[VERIFIED: codebase — curriculum.json has no hint field confirmed by `Object.keys(problems[0])`]

### Pattern 5: 1.5s Reveal Auto-Advance

**What:** After 3rd wrong answer, show correct answer, then auto-advance after 1.5 seconds. Use `useEffect` watching `phase === 'revealing'`.

```typescript
// Source: CONTEXT.md D-09, UI-SPEC Interaction Contract
useEffect(() => {
  if (state.phase !== 'revealing') return
  const timer = setTimeout(() => {
    dispatch({ type: 'ADVANCE', totalProblems: problemPool.length })
  }, 1500)
  return () => clearTimeout(timer)   // cleanup if component unmounts
}, [state.phase])
```

[ASSUMED: useEffect timeout pattern — standard React pattern for timed transitions]

### Pattern 6: ConfettiScreen buttonLabel Prop Extension

**What:** Add `buttonLabel?: string` prop with default `'Start Practice'`. Phase 3 usage is unchanged. Phase 4 passes `'Back to Home'`.

```typescript
// Source: ConfettiScreen.tsx (read directly — current interface shown below)

// CURRENT (Phase 3):
interface ConfettiScreenProps {
  onStartPractice: () => void
}

// EXTENDED (Phase 4):
interface ConfettiScreenProps {
  onStartPractice: () => void
  buttonLabel?: string   // default: 'Start Practice' — backwards compatible (D-11)
}

// Button text:
<button aria-label={buttonLabel ?? 'Start Practice'} onClick={onStartPractice}>
  {buttonLabel ?? 'Start Practice'}
</button>
```

[VERIFIED: codebase — ConfettiScreen.tsx read directly]

### Pattern 7: Routing — lessonId Flow Gap

**What:** `App.tsx` currently defines `<Route path="/practice" element={<PracticeScreen />} />` with no route params. LessonScreen navigates to `/practice` with no lessonId. PracticeScreen needs the lessonId to filter the problem pool.

**Current state:** LessonScreen (line 111): `navigate('/practice')` — no param.

**Resolution options (Claude's discretion):**

Option A — Route param: Change route to `/practice/:lessonId`, update LessonScreen to `navigate('/practice/' + lesson.id)`, PracticeScreen reads `useParams<{lessonId: string}>()`. Mirrors how LessonScreen itself reads `lessonId`.

Option B — Location state: Keep route as `/practice`, pass state: `navigate('/practice', { state: { lessonId: lesson.id } })`, PracticeScreen reads `useLocation().state?.lessonId`. Fallback to `lessons[0].id` if absent.

**Recommendation:** Option A (route param). Consistent with how LessonScreen itself works. State in URL is more debuggable. App.tsx route change is a one-liner. LessonScreen navigation update is a one-liner. Matches the project pattern `lessonId` already established.

[VERIFIED: codebase — App.tsx and LessonScreen.tsx read directly]

### Anti-Patterns to Avoid

- **Using `<input>` for digit display:** Triggers iOS software keyboard (violates PRAC-02). Use a `<div>` display box driven by state string.
- **Re-shuffling on every render:** `Math.random()` in render body will reshuffle on every state update. Use `useMemo([problem.id])`.
- **Inserting failed problems at queue end:** D-03 explicitly forbids this. After 3 wrong, advance only.
- **Using `as const` on reducer state:** Use `satisfies` or explicit type annotations to get discriminated union narrowing without runtime overhead (project pattern from 02-02).
- **Forgetting `clearTimeout` cleanup:** The 1.5s reveal timer must be cleaned up if the component unmounts (e.g., user navigates away). Always return `() => clearTimeout(timer)` from the useEffect.
- **Animating with Motion/Lottie per-problem:** CONTEXT.md Claude's Discretion explicitly says no Lottie for per-problem moments. Use CSS `@keyframes` only.
- **Setting `overflow: hidden` on the wrong element:** The root `html/body/#root` already has `overflow: hidden` from `src/index.css`. Do not re-declare on PracticeScreen. The digit grid's scroll behaviour is contained within the screen's `100dvh` container.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Shuffle choices | Custom Fisher-Yates | `[...arr].sort(() => Math.random() - 0.5)` inside `useMemo` | Sufficient for 4 items; no randomness library needed |
| Celebration screen | Custom confetti | Existing `ConfettiScreen` component (D-10) | Already implemented, tested, and animated |
| State machine | Custom event bus | `useReducer` with typed action union (LessonScreen pattern) | Matches codebase convention |
| Digit composition | `<input type="number">` | String state + button dispatch | Avoids iOS keyboard (PRAC-02) |
| Timed auto-advance | Custom polling | `setTimeout` inside `useEffect` with cleanup | Standard React pattern |
| CSS animation (correct flash, wrong pulse) | Motion/GSAP | CSS `@keyframes` + `animation` property | Keeps bundle light; per-problem moments don't need library-level control |

**Key insight:** This phase adds zero dependencies. Every problem it solves is correctly addressed by existing React patterns and the CSS already in `src/index.css`.

---

## Runtime State Inventory

> Omitted — this is a greenfield screen implementation (replacing a stub), not a rename/refactor/migration phase.

---

## Common Pitfalls

### Pitfall 1: iOS Software Keyboard Appearing in Digit Grid

**What goes wrong:** An `<input>` element — even with `inputMode="none"` or `type="tel"` — can still trigger the iOS Safari software keyboard in some configurations, pushing the layout up and breaking the full-screen experience.

**Why it happens:** iOS Safari's keyboard invocation is tied to focus on any `<input>`, `<textarea>`, or `contentEditable` element. `inputMode="none"` is not reliably honoured on iOS (it works on Android Chrome).

**How to avoid:** Never use an `<input>` element inside `DigitGridWidget`. The composed digit string lives in `practiceState.composedDigits`. The display box is a `<div>` or `<p>` — not focusable, not editable. Digit keys are `<button>` elements. No `contentEditable`.

**Warning signs:** During manual iPad testing, tapping a digit key shows the keyboard or shifts the layout upward.

### Pitfall 2: Shuffle Instability Causing Answer Flicker

**What goes wrong:** Calling `Math.random()` inside the render function or inside a component without `useMemo` causes choices to reshuffle on every state update (e.g., every wrong-answer tap re-renders and shuffles again).

**Why it happens:** React re-renders on every state change. Without memoization, any function call in the render body re-executes.

**How to avoid:** Wrap the shuffle in `useMemo(() => [...problem.choices].sort(() => Math.random() - 0.5), [problem.id])`. The dependency array ensures re-shuffle only when the problem changes.

**Warning signs:** Answer option cards visually reorder after each wrong tap.

### Pitfall 3: Attempt Counter Not Resetting Per Problem

**What goes wrong:** If `attemptCount` is part of session-level state and is not reset on problem advance, a child who got 2 wrong answers on problem 1 will immediately see the hint on the first wrong answer of problem 2.

**Why it happens:** Forgetting to reset `attemptCount: 0` in the `ADVANCE` action branch of the reducer.

**How to avoid:** The `ADVANCE` case in `practiceReducer` always resets `attemptCount: 0` and `composedDigits: ''`. Verified by test.

**Warning signs:** A unit test that simulates 2 wrong answers on problem 1 then advances shows `attemptCount > 0` at the start of problem 2.

### Pitfall 4: Missing Timer Cleanup Causes State Update After Unmount

**What goes wrong:** React logs "Warning: Can't perform a React state update on an unmounted component" when the 1.5s reveal timer fires after the user has navigated away.

**Why it happens:** `setTimeout` callbacks fire regardless of component lifecycle.

**How to avoid:** Always return `() => clearTimeout(timer)` from the `useEffect` that sets the reveal timer.

**Warning signs:** Console warning in development; potential memory leak in production.

### Pitfall 5: App.test.tsx Routing Test Breaks After Route Change

**What goes wrong:** `App.test.tsx` has `render(<MemoryRouter initialEntries={['/practice']}>)` and asserts `screen.getByText('Practice')`. After PracticeScreen is replaced, that text no longer exists, and after any route param change the test path must also update.

**Why it happens:** The test was written for the stub. It hardcodes a text string that the stub renders but the real screen will not.

**How to avoid:** Plan 1 (route + stub replacement) must also update `App.test.tsx` to match the new PracticeScreen initial render state (e.g., first problem question text, or a reliable aria-label).

**Warning signs:** `npm run test` fails on the App routing suite after plan 1 lands.

### Pitfall 6: ConfettiScreen Backwards Compatibility Break

**What goes wrong:** Changing `ConfettiScreen`'s `aria-label` and button text from hardcoded `'Start Practice'` to `buttonLabel ?? 'Start Practice'` but forgetting to update the `aria-label` attribute as well breaks the existing LessonScreen test (`getByRole('button', { name: /start practice/i })`).

**Why it happens:** The aria-label and visible text must stay in sync.

**How to avoid:** Both the visible text and `aria-label` should read `buttonLabel ?? 'Start Practice'`. Run `LessonScreen.test.tsx` after the ConfettiScreen change to confirm no regression.

**Warning signs:** `LessonScreen.test.tsx` fails on "shows celebration screen after last step is advanced" after the ConfettiScreen prop change.

### Pitfall 7: Multi-Digit Answers (up to 3 digits) in Display Box

**What goes wrong:** Assuming answers are single-digit. Grade 2–3 digit-grid problems have answers up to 850 (3 digits). A display box sized for 1–2 digits will overflow or clip.

**Why it happens:** Grade 1 is all multiple-choice; the developer may prototype with grade 1 data only.

**How to avoid:** Digit display box must accommodate up to 3 characters at 40px Display size (confirmed: max answer in curriculum is 850, i.e., 3 digits). Width should be explicit (e.g., `min-w-[120px]`) or use flexible sizing.

**Warning signs:** A 3-digit answer clips or overflows the display box visually.

---

## Code Examples

### Reducer Structure (follow LessonScreen)

```typescript
// Source: src/screens/LessonScreen.tsx (read directly)
// LessonScreen uses this exact pattern — Phase 4 mirrors it.

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

// Usage:
const [state, dispatch] = useReducer(lessonReducer, { phase: 'unlock', stepIndex: 0 })
```

### ConfettiScreen Current Interface

```typescript
// Source: src/components/ConfettiScreen.tsx (read directly)
interface ConfettiScreenProps {
  onStartPractice: () => void
  // Phase 4 adds: buttonLabel?: string
}
// Button element:
// aria-label="Start Practice"
// onClick={onStartPractice}
// Text: "Start Practice"
```

### Digit Grid Key Layout (3×4 grid)

```
Row 0: [7] [8] [9]
Row 1: [4] [5] [6]
Row 2: [1] [2] [3]
Row 3: [⌫] [0] [Check]
```

```typescript
// Source: UI-SPEC DigitGridWidget
// CSS: grid grid-cols-3 gap-4
// Each key: min-h-[64px] min-w-[64px] (64px — exceeds 44px Apple HIG minimum for ages 6–9)
// style={{ touchAction: 'manipulation' }} on every button
```

### CSS Animation for Wrong-Answer Pulse (no Motion library)

```css
/* Source: src/index.css pattern — extend for Phase 4 */
@keyframes wrong-pulse {
  0%   { border-color: transparent; }
  50%  { border-color: #FF6B35; }   /* --color-primary */
  100% { border-color: transparent; }
}

.wrong-pulse {
  animation: wrong-pulse 300ms ease-in-out 1;
}
```

```typescript
// Apply via className toggle:
const [showWrongPulse, setShowWrongPulse] = useState(false)

function handleWrong() {
  setShowWrongPulse(true)
  setTimeout(() => setShowWrongPulse(false), 300)
  dispatch({ type: 'WRONG_ANSWER' })
}
// className={`...base classes... ${showWrongPulse ? 'wrong-pulse border-2' : ''}`}
```

### Full-Screen Container (established project pattern)

```typescript
// Source: LessonScreen.tsx + PracticeScreen.tsx stub (both use this)
<div
  className="flex flex-col bg-surface w-full"
  style={{
    height: '100dvh',
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  }}
>
```

### Curriculum Problem Pool Construction

```typescript
// Source: src/curriculum/index.ts + types.ts (read directly)
import { problems } from '../curriculum/index'
import type { Problem } from '../curriculum/types'

// Filter by lessonId (D-01), then shuffle (D-02)
const raw = problems.filter(p => p.lessonId === lessonId)
const shuffled = [...raw].sort(() => Math.random() - 0.5)
// ~5 problems per lesson guaranteed by curriculum.json (27 lessons × 5 = 135 problems)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `inputMode="none"` on `<input>` for iOS keyboard suppression | No `<input>` element at all; custom button grid | Established practice for kids touch apps | Reliable — iOS Safari ignores inputMode; button grid is the only safe approach |
| `100vh` for full-screen | `100dvh` | Phase 1 decision | Correct on iOS Safari with dynamic toolbar; `100vh` causes bottom content clipping |
| Hardcoded aria-label strings | Prop-driven aria-label | Phase 4 (ConfettiScreen extension) | Backwards compatible with default value |

**Deprecated/outdated:**
- `100vh`: Project is committed to `100dvh` (Phase 1 D-01, CLAUDE.md). Do not use `100vh` anywhere.
- `react-router-dom` import: Project uses `react-router` v7 unified package (01-01 decision). All imports are from `'react-router'`.
- `inputMode="none"` on `<input>` for iOS: Unreliable. Use button-grid approach.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Reducer shape (state fields, action union) as specified in Pattern 1 | Architecture Patterns | Low — follows LessonScreen exactly; easily adjusted in planning |
| A2 | `useMemo([problem.id])` for stable shuffle | Architecture Patterns | Low — standard React pattern; worse case is a warning, not a bug |
| A3 | `useEffect` watching `phase === 'revealing'` for 1.5s timer | Architecture Patterns | Low — standard React pattern |
| A4 | Route param approach (Option A) recommended for lessonId flow | Pattern 7 | Medium — if LessonScreen tests are brittle the extra navigate call may break them; planner should update App.test.tsx in the same plan |

---

## Open Questions (RESOLVED)

1. **Which plan handles the App.tsx route change (`/practice` → `/practice/:lessonId`)?**
   - What we know: The route change is a prerequisite for PracticeScreen to work. It also requires updating LessonScreen's `navigate('/practice')` call and `App.test.tsx`.
   - What's unclear: Whether this should be Plan 1 task 0 or a prerequisite committed before practice widget work begins.
   - Recommendation: Put it in Plan 1, Task 1 — before any widget implementation. It's a 3-line change across 2 files + 1 test update.

2. **Hint text: all-fallback or add hints to curriculum.json?**
   - What we know: `curriculum.json` Problem objects have no `hint` field. The type (`BaseProblem`) also has no `hint` field. The UI-SPEC says "problem-specific hint from curriculum data; fallback if none present."
   - What's unclear: Whether Phase 4 should add `hint?: string` to `BaseProblem` and add hint text to `curriculum.json`, or just use the fallback for all problems.
   - Recommendation: Use fallback for all problems in Phase 4. Adding hint content to 53 digit-grid problems is a content task, not an architecture task. The fallback path is defined and sufficient. Note in a `// TODO Phase 5 content:` comment.

---

## Environment Availability

> Step 2.6: This phase has no external tool dependencies beyond the existing project runtime.

All required tools confirmed available in Phases 1–3 and unchanged:

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev server, npm scripts | ✓ | (project runs) | — |
| Vite | Dev server + build | ✓ | 8.0.12 | — |
| TypeScript | Type checking | ✓ | ~6.0.2 | — |
| Vitest | Test runner | ✓ | 4.1.6 | — |

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| Config file | `vite.config.ts` (test block: environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts') |
| Quick run command | `npx vitest run src/screens/PracticeScreen.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PRAC-01 | Multiple choice renders 4 cards with ≥64px height | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| PRAC-01 | Tapping a card submits answer immediately (no confirm step) | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| PRAC-02 | Digit grid renders without triggering input element | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| PRAC-02 | Digit keys compose answer in display box | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| PRAC-02 | Backspace removes last digit | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| PRAC-02 | Check button disabled when display is empty | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| FEED-01 | Hint appears after 2nd wrong answer | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| FEED-01 | Hint replaces encouragement in same slot (no new DOM node) | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| FEED-02 | After 3rd wrong, correct answer is highlighted | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| FEED-02 | After 1.5s reveal, app advances to next problem | unit (with vi.useFakeTimers) | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| FEED-03 | Encouragement phrase appears after 1st wrong answer | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| FEED-04 | ConfettiScreen shown after all problems answered | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| FEED-04 | ConfettiScreen button label is "Back to Home" | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| D-03 | Attempt counter resets to 0 after problem advance | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 |
| D-11 | ConfettiScreen default buttonLabel="Start Practice" is unchanged | regression | `npx vitest run src/screens/LessonScreen.test.tsx` | ✅ exists (update expected) |

**Note on `vi.useFakeTimers`:** The FEED-02 auto-advance test must use `vi.useFakeTimers()` and `vi.advanceTimersByTime(1500)` to test the `setTimeout` without actually waiting. This is the Vitest 4.x standard pattern.

### Sampling Rate

- **Per task commit:** `npx vitest run src/screens/PracticeScreen.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/screens/PracticeScreen.test.tsx` — covers all PRAC-01, PRAC-02, FEED-01 through FEED-04 behaviors listed above
- [ ] CSS `@keyframes wrong-pulse` in `src/index.css` — needed for wrong-answer feedback animation

*(Existing test infrastructure — `setup.ts`, `vitest` config, `@testing-library/react` — already in place. No framework install needed.)*

---

## Security Domain

> This phase has no authentication, data persistence, network calls, or cryptographic operations. It is a client-side UI phase with no external data flow.

ASVS categories not applicable to Phase 4:
- V2 Authentication — no auth in this phase
- V3 Session Management — practice session is ephemeral in-memory state, never persisted
- V4 Access Control — no protected routes introduced
- V5 Input Validation — user input is tap-based numeric composition; answer is compared with `=== problem.answer` (number equality, safe)
- V6 Cryptography — not applicable

No threat patterns require mitigation in Phase 4.

---

## Project Constraints (from CLAUDE.md)

All directives from `CLAUDE.md` apply to Phase 4 implementation:

| Directive | Application in Phase 4 |
|-----------|------------------------|
| iPad Safari, touch-first | All interactive elements use `touch-action: manipulation`; no mouse-assumption patterns |
| No keyboard input | DigitGridWidget must NOT use `<input>` elements; tap-only composition |
| All interactive elements ≥ 44×44 CSS px | Digit grid keys are 64×64px; answer cards are ≥64px height; backspace and Check are ≥44px |
| `touch-action: manipulation` on interactive elements | Every `<button>` in both widgets |
| `user-select: none` on lesson content | Problem question text and equation text |
| `100dvh` on screen containers | PracticeScreen full-screen container |
| `env(safe-area-inset-*)` | PracticeScreen container padding |
| Tailwind 4 CSS-first tokens | Use `bg-surface`, `text-on-surface`, `bg-accent`, `bg-success`, `bg-primary` — no new color values |
| Nunito font, warm color palette | No new fonts or colors; all tokens from `src/index.css @theme` |
| No Lottie for per-problem moments | CSS `@keyframes` only for correct flash and wrong pulse |
| No backend, no Dexie writes in Phase 4 | No `db.*` calls anywhere in PracticeScreen — Phase 5 scope |
| Import from `react-router` not `react-router-dom` | All React Router imports use `'react-router'` |

---

## Sources

### Primary (HIGH confidence)

- `src/screens/LessonScreen.tsx` — useReducer pattern, state machine shape, navigation patterns (read directly from codebase)
- `src/components/ConfettiScreen.tsx` — current interface, button implementation, aria patterns (read directly)
- `src/curriculum/types.ts` — Problem discriminated union, BaseProblem schema (read directly)
- `src/curriculum/index.ts` — `problems` export, `satisfies` pattern (read directly)
- `src/curriculum/curriculum.json` — confirmed 135 problems, 0 hint fields, max answer 850 (3 digits), 82 MC / 53 DG split (verified via Node.js runtime)
- `src/App.tsx` — current route definitions, lessonId gap confirmed (read directly)
- `src/index.css` — color tokens, existing `@keyframes confetti-fall`, global button rules (read directly)
- `package.json` — all installed versions confirmed (read directly)
- `.planning/phases/04-practice-engine/04-CONTEXT.md` — all locked decisions D-01 through D-12 (read directly)
- `.planning/phases/04-practice-engine/04-UI-SPEC.md` — component inventory, interaction contract, color assignments (read directly)

### Secondary (MEDIUM confidence)

- `CLAUDE.md` — project constraints and conventions applied throughout
- `.planning/REQUIREMENTS.md` — PRAC-01 through FEED-04 requirement text (read directly)

### Tertiary (LOW confidence)

- iOS Safari `inputMode="none"` unreliability on `<input>` elements — based on training knowledge; project avoids `<input>` entirely so this is moot

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all packages verified from package.json directly; no new packages required
- Architecture: HIGH — state machine pattern verified from LessonScreen source; routing gap verified from App.tsx; curriculum schema verified from runtime Node.js execution
- Pitfalls: HIGH — digit grid iOS keyboard pitfall verified from requirements (PRAC-02 "no software keyboard"); shuffle pitfall is a standard React anti-pattern; attempt counter reset verified from CONTEXT.md D-03; timer cleanup is universal React pattern; App.test.tsx regression verified from reading the existing test

**Research date:** 2026-05-15
**Valid until:** 2026-06-15 (stable stack — no fast-moving dependencies introduced)
