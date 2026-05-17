# Phase 5: Progress & Parent Section — Research

**Researched:** 2026-05-17
**Domain:** IndexedDB session recording, adaptive lesson ordering, PIN entry UX, parent dashboard data display
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**PIN Entry Point**
- D-01: Lock icon in corner of HomeScreen (position: Claude's discretion). Subtle, no "Parent" label.
- D-02: PIN input reuses `DigitGridWidget` pattern — 4 digits, display dots, no software keyboard.
- D-03: First-time flow: tap lock → CREATE PIN (enter + confirm, must match, then `storePinHash`). Mismatch = error + retry.
- D-04: Subsequent visits: enter PIN → `verifyPin()`. Wrong PIN = inline error, clears display, no lockout.
- D-05: PIN entry lives in a dedicated screen (`/pin`), navigated from lock icon. After verification → `/parent`.

**Parent Dashboard Layout**
- D-06: Progress bars with percentage. One row per topic: label, filled bar, percentage.
- D-07: Three topics always shown: addition, subtraction, word-problems. Show all even if no data.
- D-08: Empty state (no sessions): show friendly message instead of 0% bars.
- D-09: "Done" button navigates to `'/'`. Explicit handoff.
- D-10: No re-lock mechanism. Child can only tap Done to go home.

**Session Recording**
- D-11: Write `Session` record when celebration screen is reached (all problems done). Quit mid-session = no record.
- D-12: Session fields: `lessonId`, `topic`, `grade`, `date`, `correctCount`, `totalCount`.
- D-13: After writing Session, immediately upsert `TopicProgress`: aggregate all sessions for that topic.

**Adaptive Repetition**
- D-14: Adaptive works at lesson-selection level on HomeScreen, not problem-level.
- D-15: Rank lessons by topic accuracy, lowest first. Equal accuracy = curriculum order.
- D-16: Session composition unchanged (Phase 4 definition stands).

**TopicProgress Update**
- D-17: Pure aggregate query after each session: `sessions.where('topic').equals(topic)` → sum all correctCount/totalCount → write accuracy float.

### Claude's Discretion
- Lock icon design (size, position, icon style) — keep subtle
- PIN screen layout and visual style — mirror digit-grid aesthetic
- Progress bar component design (height, color, label placement) — use `--color-accent` or `--color-success`
- Error messaging copy for wrong PIN
- Exact threshold for "struggling" topic (70% accuracy recommended)
- HomeScreen lesson list ordering logic
- Loading/async states for Dexie queries in ParentScreen

### Deferred Ideas (OUT OF SCOPE)
- Session history view
- Struggle spotlight ranking
- Data export
- Multi-child support
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROG-01 | App tracks per-topic accuracy (addition, subtraction, word problems) across sessions | D-11 through D-13, D-17: Session write + TopicProgress upsert patterns documented below |
| PROG-02 | Practice sessions use error-adaptive repetition — topics with lower accuracy appear more frequently | D-14 through D-16: Lesson sorting by topic accuracy at HomeScreen level |
| PAR-01 | Parent section accessible from main screen behind a 4-digit PIN | D-01 through D-05: PinScreen route, `hashPin`/`storePinHash`/`verifyPin` helpers already in db.ts |
| PAR-02 | Parent dashboard shows accuracy per topic (addition, subtraction, word problems) | D-06 through D-10: `useLiveQuery` on topicProgress table, ProgressBar component |
</phase_requirements>

---

## Summary

Phase 5 wires together three tightly coupled capabilities: (1) session recording triggered at celebration screen, (2) adaptive lesson ordering on HomeScreen, and (3) a PIN-gated parent dashboard. All data infrastructure already exists in `src/db/db.ts` — the `Session`, `TopicProgress`, and `AppConfig` tables are defined, indexed, and tested. The PIN helper functions (`hashPin`, `storePinHash`, `verifyPin`) are production-ready. No new npm packages are required beyond what is already installed.

The biggest implementation risk is the write path: `PracticeScreen` currently has no session recording at all (Phase 4 left a TODO comment). The plan must inject a Dexie write into the `onStartPractice` callback of `ConfettiScreen` (the celebration screen branch in `PracticeScreen`), followed immediately by the `TopicProgress` aggregate upsert. This is a single location in a single file — contained, low-risk.

`dexie-react-hooks` (`useLiveQuery`) is already installed and in `package.json`. The `ParentScreen` is currently a stub (`export default function ParentScreen()`). The `PinScreen` does not yet exist — it needs a new file and a new route in `App.tsx`. HomeScreen already navigates to `/parent`; the plan must redirect that navigation to `/pin` instead.

**Primary recommendation:** Three parallel workstreams — (A) session write + aggregate upsert in PracticeScreen, (B) PinScreen + route, (C) ParentScreen + HomeScreen adaptive ordering. (A) is a dependency of (C) for real data but not for rendering; the plan can structure (A) as Wave 1 and (B)+(C) as Wave 2.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Session write (accuracy tracking) | PracticeScreen (client) | db.ts (storage) | Triggered at celebration screen, which lives in PracticeScreen |
| TopicProgress aggregate upsert | PracticeScreen (client) | db.ts (storage) | Runs immediately after session write, same callsite |
| PIN hash/verify | db.ts helpers | Web Crypto API | Already implemented; callers never handle raw PINs |
| PIN entry flow | PinScreen (new) | AppConfig table | PinScreen calls hashPin/storePinHash/verifyPin |
| Parent dashboard data | ParentScreen (client) | topicProgress table | useLiveQuery reads from IndexedDB; no server tier |
| Adaptive lesson ordering | HomeScreen (client) | topicProgress table | Sort lessons array by topic accuracy before render |
| Lock icon entry point | HomeScreen (client) | — | Tap navigates to /pin |

---

## Standard Stack

### Core (already installed — no new packages needed)

| Library | Installed Version | Purpose | Why Used |
|---------|------------------|---------|----------|
| Dexie | ^4.4.2 | IndexedDB ORM — Session, TopicProgress, AppConfig writes and reads | Project standard; db.ts already defines all tables |
| dexie-react-hooks | ^4.4.0 | `useLiveQuery` hook for reactive Dexie reads in React components | Already installed; enables ParentScreen to reactively display progress without manual effect wiring |
| React | ^19.2.6 | UI components | Project standard |
| React Router | ^7.15.0 | Route for `/pin` (new) | Project standard; App.tsx already wires routes |
| Tailwind CSS | ^4.3.0 | All styling | Project standard; design tokens in index.css |

**No new packages to install.** All dependencies are already present in `package.json`. [VERIFIED: package.json]

### Package Legitimacy Audit

> No new packages are introduced in this phase. All libraries are already installed from prior phases.

| Package | Registry | Status |
|---------|----------|--------|
| dexie | npm | Already installed — no audit needed |
| dexie-react-hooks | npm | Already installed — no audit needed |

**Packages removed due to slopcheck:** none (no new installs)
**Packages flagged as suspicious:** none

---

## Architecture Patterns

### System Architecture Diagram

```
HomeScreen ──lock tap──► /pin (PinScreen)
                              │
               no PIN stored  │  PIN stored
                    ▼         │       ▼
            CREATE mode       │   VERIFY mode
          enter + confirm     │   enter PIN
          storePinHash()      │   verifyPin()
                    └────────►│◄──────┘
                              │ success
                              ▼
                        /parent (ParentScreen)
                         useLiveQuery(topicProgress)
                         ProgressBar × 3 topics
                         Done ──────────────────► /

PracticeScreen (celebration branch)
  ├─ db.sessions.add(sessionRecord)     [D-11, D-12]
  └─ aggregate + db.topicProgress.put() [D-13, D-17]
           │
           ▼
     TopicProgress table (IndexedDB)
           │
           ▼
     HomeScreen: useLiveQuery(topicProgress)
     sort lessons by topic accuracy ascending → render list
```

### Recommended Project Structure (new files only)

```
src/
├── screens/
│   ├── PinScreen.tsx        # NEW — PIN creation + verification
│   ├── ParentScreen.tsx     # REPLACE stub — dashboard with progress bars
│   └── HomeScreen.tsx       # MODIFY — lock icon, adaptive lesson ordering
├── components/
│   └── ProgressBar.tsx      # NEW — reusable topic progress bar row
└── db/
    └── db.ts                # NO CHANGE — all helpers already present
```

### Pattern 1: Dexie `useLiveQuery` for reactive reads

**What:** `useLiveQuery` from `dexie-react-hooks` subscribes a React component to an IndexedDB query. The component re-renders automatically when the underlying data changes.

**When to use:** ParentScreen reading all `topicProgress` rows; HomeScreen reading topic accuracies for adaptive ordering.

**Example:**
```typescript
// Source: dexie-react-hooks package (already installed)
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { TopicProgress } from '../db/db'

// Returns undefined while loading, TopicProgress[] once resolved
const progress = useLiveQuery(() => db.topicProgress.toArray())

// Guard pattern — always required because useLiveQuery is initially undefined
if (progress === undefined) {
  return <div>Loading...</div>
}
```

[VERIFIED: dexie-react-hooks is installed at ^4.4.0 in package.json]

### Pattern 2: TopicProgress aggregate upsert (D-17)

**What:** After writing a Session, re-aggregate all sessions for that topic and put() the result.

**When to use:** Immediately after `db.sessions.add()` in the celebration callback.

**Example:**
```typescript
// Source: db.ts schema (sessions table indexed by topic)
import { db, toISODateString } from '../db/db'
import type { Topic } from '../curriculum/types'

async function recordSessionAndUpdateProgress(
  lessonId: string,
  topic: Topic,
  grade: 1 | 2 | 3,
  correctCount: number,
  totalCount: number
) {
  // D-11, D-12: Write session
  await db.sessions.add({
    lessonId,
    topic,
    grade,
    date: toISODateString(new Date()),
    correctCount,
    totalCount,
  })

  // D-13, D-17: Pure aggregate — never incremental
  const allSessionsForTopic = await db.sessions
    .where('topic')
    .equals(topic)
    .toArray()

  const totalCorrect = allSessionsForTopic.reduce((sum, s) => sum + s.correctCount, 0)
  const totalAnswered = allSessionsForTopic.reduce((sum, s) => sum + s.totalCount, 0)
  const accuracy = totalAnswered > 0 ? totalCorrect / totalAnswered : 0

  await db.topicProgress.put({
    topic,
    accuracy,
    attemptCount: allSessionsForTopic.length,
    lastPracticed: toISODateString(new Date()),
  })
}
```

[ASSUMED: pattern derived from db.ts schema and D-17 decision; not from an official Dexie example]

### Pattern 3: PinScreen state machine

**What:** A two-mode screen (CREATE vs VERIFY) driven by whether `appConfig.pinHash` exists. Uses local `useState` — no useReducer needed since flow is simple.

**When to use:** Only in PinScreen.tsx.

**Example:**
```typescript
// Mode detection: check if PIN has been set
const storedConfig = useLiveQuery(() => db.appConfig.get('pinHash'))
// storedConfig === undefined = loading
// storedConfig === null/undefined (record) = no PIN set → CREATE mode
// storedConfig.value = hash string → VERIFY mode

const mode: 'loading' | 'create' | 'verify' =
  storedConfig === undefined ? 'loading' :
  storedConfig == null ? 'create' : 'verify'
```

[ASSUMED: pattern derived from db.ts AppConfig structure; not from official docs]

### Pattern 4: PIN digit dot display

**What:** Show filled/empty dots rather than characters. 4 dots, filled up to `digits.length`.

**When to use:** PinScreen digit display (mirrors DigitGridWidget's display box concept).

```typescript
// 4 dots pattern — reuse DigitGridWidget's visual language
{[0, 1, 2, 3].map(i => (
  <div
    key={i}
    className={`w-5 h-5 rounded-full border-2 ${
      i < digits.length
        ? 'bg-primary border-primary'
        : 'border-on-surface/30 bg-transparent'
    }`}
  />
))}
```

[ASSUMED: design pattern — not from official docs]

### Pattern 5: Adaptive lesson ordering on HomeScreen

**What:** Sort lessons by the accuracy of their topic, lowest accuracy first. Ties use curriculum order (`lesson.order`).

**When to use:** HomeScreen lesson rendering (D-14 through D-16).

```typescript
// Source: derived from db.ts TopicProgress interface and curriculum types.ts
const topicProgress = useLiveQuery(() => db.topicProgress.toArray())

function sortedLessons(lessons: Lesson[], progress: TopicProgress[] | undefined): Lesson[] {
  if (!progress || progress.length === 0) return lessons // No data → curriculum order

  const accuracyByTopic = Object.fromEntries(
    progress.map(p => [p.topic, p.accuracy])
  )

  return [...lessons].sort((a, b) => {
    const accA = accuracyByTopic[a.topic] ?? 1 // Unknown topic = treat as 100% (no struggle)
    const accB = accuracyByTopic[b.topic] ?? 1
    if (accA !== accB) return accA - accB // Lowest accuracy first
    return a.order - b.order             // Tie-break: curriculum order
  })
}
```

[ASSUMED: sorting logic — not from official docs]

### Anti-Patterns to Avoid

- **Incremental accuracy update:** Do NOT add `newCorrect / newTotal` to an existing accuracy value. Always re-aggregate from all sessions for that topic (D-17). Prevents drift from floating-point accumulation.
- **Raw PIN storage:** Never pass raw digits to `db.appConfig.put()` directly. Always call `hashPin(pin)` then `storePinHash(hash)`. The `storePinHash` function enforces this with a regex guard. [VERIFIED: db.ts]
- **PIN in localStorage:** The project uses Dexie/IndexedDB for all PIN state. Do not use `localStorage` for the PIN hash.
- **Writing Session on mid-session quit:** Only write on celebration screen reached (D-11). Do not write if the child navigates away early.
- **Showing 0% bars in empty state:** D-08 explicitly says hide the progress section entirely when no sessions exist — show a friendly message instead of zeros.
- **Using `useLiveQuery` return value without undefined guard:** `useLiveQuery` returns `undefined` on first render (loading). Always guard before rendering.
- **Navigating directly to /parent without PIN:** After D-05, the HomeScreen lock icon must navigate to `/pin`, not `/parent`. Currently HomeScreen navigates to `/parent` — this must change.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reactive IndexedDB reads | Manual `useEffect` + state for Dexie queries | `useLiveQuery` from dexie-react-hooks | Already installed; handles cleanup, loading state, and re-render on DB change automatically |
| SHA-256 PIN hashing | Custom hash or MD5 | `hashPin()` from db.ts (uses `crypto.subtle.digest`) | Already implemented, already tested, enforces at storage boundary |
| PIN verification | String comparison of raw digits | `verifyPin()` from db.ts | Already implemented; handles stored-hash lookup and comparison |
| TopicProgress accumulation | Storing a running total and adding to it | Pure aggregate from sessions table | Avoids float drift; simpler to reason about at v1 scale (D-17) |
| Progress bar | CSS width calculation logic inline | `ProgressBar` component with `accuracy: number` prop | Encapsulates the `width: ${accuracy * 100}%` calculation, color logic, and label formatting once |

**Key insight:** The entire data layer for this phase already exists. The work is writing the integration code that calls existing helpers at the right moments.

---

## Common Pitfalls

### Pitfall 1: `useLiveQuery` undefined on first render

**What goes wrong:** `progress.map(...)` throws because `progress` is `undefined` during the initial async load.

**Why it happens:** `useLiveQuery` is asynchronous — it returns `undefined` until the IndexedDB query resolves.

**How to avoid:** Always write `if (progress === undefined) return <LoadingState />` before using the result.

**Warning signs:** "Cannot read properties of undefined (reading 'map')" error in console.

---

### Pitfall 2: Session written before celebration renders (timing)

**What goes wrong:** Writing to Dexie synchronously before the `ConfettiScreen` renders causes a race where the component re-renders mid-celebration, or the write blocks rendering.

**Why it happens:** Awaiting an async write inside a synchronous React render path.

**How to avoid:** Trigger the session write in a `useEffect` that fires once when `state.phase === 'celebration'`, OR write it in the callback that dispatches the `ADVANCE`-to-celebration action (in a `useEffect` watching for `celebration` phase). Do not write in the reducer.

**Warning signs:** Celebration screen flickers or Dexie write errors surface in the celebration phase.

---

### Pitfall 3: HomeScreen navigates to `/parent` instead of `/pin`

**What goes wrong:** Tapping the lock icon goes directly to the parent dashboard, bypassing the PIN gate entirely.

**Why it happens:** HomeScreen currently has `navigate('/parent')` on the "Parent" button (existing code from Phase 1 stub). Phase 5 must change this to `navigate('/pin')`.

**How to avoid:** Update the lock icon button's `onClick` to `navigate('/pin')`. The `/parent` route stays registered for post-PIN navigation.

**Warning signs:** Parent dashboard is accessible without entering a PIN.

---

### Pitfall 4: `storePinHash` called with raw PIN

**What goes wrong:** `storePinHash('1234')` throws "argument must be a SHA-256 hex digest (64 hex chars)".

**Why it happens:** Caller skips the `hashPin` step.

**How to avoid:** Always: `const hash = await hashPin(rawPin); await storePinHash(hash)`.

**Warning signs:** Runtime error in PinScreen during first-time PIN creation.

---

### Pitfall 5: TopicProgress `put()` on non-existent topic key

**What goes wrong:** If `topicProgress.put()` is called for a topic that has never been tracked, it creates a new record — which is the desired behavior. No pitfall here. The risk is the inverse: forgetting that `TopicProgress.topic` is the primary key, so `put()` is an upsert (not insert-only).

**How to avoid:** Use `put()` (not `add()`) for all TopicProgress writes. `add()` would throw on the second session for the same topic.

**Warning signs:** "Key already exists" error on the second session completion.

---

### Pitfall 6: Lesson sort mutates the original array

**What goes wrong:** `lessons.sort(...)` mutates the exported `lessons` array from `curriculum/index.ts`, causing subsequent renders to see a permanently reordered curriculum.

**Why it happens:** `Array.sort` is in-place.

**How to avoid:** Always spread first: `[...lessons].sort(...)`.

**Warning signs:** Lesson order is different on every render; tests that rely on curriculum order fail non-deterministically.

---

### Pitfall 7: PIN confirm-mismatch UX — clearing only one input

**What goes wrong:** On mismatch in CREATE mode, if only the "confirm" input is cleared but the first entry is kept, the user types a new confirm against an old first entry they may have forgotten.

**How to avoid:** On mismatch, clear BOTH digit buffers and show error. Return user to step 1 of the create flow.

---

## Code Examples

### Session write integration point in PracticeScreen

The celebration phase is triggered when `state.phase === 'celebration'` (line 139 in PracticeScreen.tsx). The session write belongs in a `useEffect` that fires exactly once when this phase is entered:

```typescript
// In PracticeScreen.tsx — add after existing useEffects
useEffect(() => {
  if (state.phase !== 'celebration' || !currentLesson) return
  // D-11: Only write on celebration (complete session)
  recordSessionAndUpdateProgress(
    lessonId!,
    currentLesson.topic,
    currentLesson.grade,
    sessionStats.correctCount,
    sessionStats.totalCount
  ).catch(err => {
    // Non-blocking — celebration still shows even if write fails
    console.error('[PracticeScreen] session write failed', err)
  })
}, [state.phase]) // eslint-disable-line react-hooks/exhaustive-deps
```

**Note:** PracticeScreen currently does not track `correctCount` or `totalCount` in state. The plan must add these counters to `PracticeState` and update them in the reducer:
- `CORRECT_ANSWER` action → increment `correctCount` and `totalCount`
- `BEGIN_REVEAL` action (3 wrong) → increment `totalCount` only (not `correctCount`)

[ASSUMED: integration approach derived from PracticeScreen.tsx analysis; not from official docs]

### ProgressBar component sketch

```typescript
// src/components/ProgressBar.tsx
interface ProgressBarProps {
  label: string    // "Addition", "Subtraction", "Word Problems"
  accuracy: number // 0–1 float; undefined/null → no data
  hasData: boolean
}

export function ProgressBar({ label, accuracy, hasData }: ProgressBarProps) {
  const pct = Math.round(accuracy * 100)
  const fillColor = accuracy >= 0.7 ? 'bg-success' : 'bg-accent'

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-sm font-semibold text-on-surface">
        <span>{label}</span>
        <span>{hasData ? `${pct}%` : '—'}</span>
      </div>
      <div className="h-4 rounded-full bg-on-surface/10 overflow-hidden">
        {hasData && (
          <div
            className={`h-full rounded-full ${fillColor} transition-all`}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label}: ${pct}%`}
          />
        )}
      </div>
    </div>
  )
}
```

[ASSUMED: component design — not from official docs]

---

## Runtime State Inventory

> This is a new-feature phase (not rename/refactor). No runtime state migration is required.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | `sessions` and `topicProgress` tables exist in MathTutorDB schema (db.ts version 1) but are empty — no existing records to migrate | None — tables are ready for first writes |
| Live service config | None — no external services | None |
| OS-registered state | None | None |
| Secrets/env vars | None — PIN hash stored in IndexedDB `appConfig` table, not env vars | None |
| Build artifacts | None | None |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | Build + test | ✓ | (project running) | — |
| fake-indexeddb | Vitest tests for Dexie | ✓ | ^6.2.5 (package.json) | — |
| dexie-react-hooks | ParentScreen useLiveQuery | ✓ | ^4.4.0 (package.json) | Manual useEffect+useState pattern |
| Web Crypto API (`crypto.subtle`) | `hashPin()` in db.ts | ✓ (Safari/jsdom both support) | — | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None — all required packages already installed.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.6 + @testing-library/react ^16.3.2 |
| Config file | vite.config.ts (`test.environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROG-01 | Session is written to IndexedDB when celebration is reached | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ✅ (extend existing) |
| PROG-01 | TopicProgress is upserted after session write | unit | `npx vitest run src/db/db.test.ts` | ✅ (extend existing) |
| PROG-01 | TopicProgress accuracy = correctCount / totalCount across sessions | unit | `npx vitest run src/db/db.test.ts` | ✅ (extend existing) |
| PROG-02 | HomeScreen sorts lessons by topic accuracy ascending | unit | `npx vitest run src/screens/HomeScreen.test.tsx` | ✅ (extend existing) |
| PROG-02 | Equal accuracy falls back to curriculum order | unit | `npx vitest run src/screens/HomeScreen.test.tsx` | ✅ (extend existing) |
| PAR-01 | Entering correct 4-digit PIN navigates to /parent | unit | `npx vitest run src/screens/PinScreen.test.tsx` | ❌ Wave 0 |
| PAR-01 | Wrong PIN shows error message, stays on /pin | unit | `npx vitest run src/screens/PinScreen.test.tsx` | ❌ Wave 0 |
| PAR-01 | First-time flow: enter + confirm PIN stores hash via storePinHash | unit | `npx vitest run src/screens/PinScreen.test.tsx` | ❌ Wave 0 |
| PAR-01 | Mismatch in create flow shows error and clears both inputs | unit | `npx vitest run src/screens/PinScreen.test.tsx` | ❌ Wave 0 |
| PAR-02 | ParentScreen renders progress bar for each of 3 topics | unit | `npx vitest run src/screens/ParentScreen.test.tsx` | ❌ Wave 0 |
| PAR-02 | Empty state message shown when no sessions recorded | unit | `npx vitest run src/screens/ParentScreen.test.tsx` | ❌ Wave 0 |
| PAR-02 | Done button navigates to / | unit | `npx vitest run src/screens/ParentScreen.test.tsx` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/screens/PinScreen.test.tsx` — covers PAR-01 (PIN creation, verification, error states)
- [ ] `src/screens/ParentScreen.test.tsx` — covers PAR-02 (progress bars, empty state, Done button)
- [ ] `src/screens/PinScreen.tsx` — new component (test file created first)
- [ ] `src/components/ProgressBar.tsx` — new component (tested via ParentScreen tests)

**Note on testing Dexie with useLiveQuery:** `fake-indexeddb/auto` is already wired in `src/test/setup.ts` — it provides a real IndexedDB API in jsdom. Tests that need to seed progress data should write directly to `db.sessions` and `db.topicProgress` in `beforeEach`. Use `await db.sessions.clear()` and `await db.topicProgress.clear()` in `beforeEach` to prevent cross-test contamination (same pattern as `db.appConfig.clear()` in `db.test.ts`).

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes — PIN gate | SHA-256 hash via Web Crypto API; `hashPin` + `storePinHash` + `verifyPin` already enforce this |
| V3 Session Management | No | No server session; PIN verification is per-screen-visit only |
| V4 Access Control | Yes — parent section gated | PinScreen must be the only path to `/parent`; App.tsx route must not expose `/parent` directly without PIN state |
| V5 Input Validation | Yes — PIN digits | Only accept digits 0–9; max length 4; reject non-digit input silently |
| V6 Cryptography | Yes — PIN storage | `crypto.subtle.digest('SHA-256')` — already implemented in `hashPin()`; never store raw PIN |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Raw PIN in storage | Information Disclosure | `hashPin` + `storePinHash` enforce SHA-256 before any DB write |
| Direct navigation to `/parent` bypassing PIN | Elevation of Privilege | `/parent` route in App.tsx must rely on PinScreen to set verified state (navigation-level gate, not route-level auth — acceptable for v1 local-only context) |
| PIN brute force | Elevation of Privilege | v1: no lockout per D-04. Risk accepted: local device, physical access required, parent controls the device |
| Digits composited to non-numeric | Tampering | DigitGrid pattern only exposes 0–9 buttons; no text input field; no parse risk |

**Security note on v1 PIN gate:** The PIN is a convenience gate, not a security boundary — a determined child with device access could clear the app's storage. This is acknowledged and accepted per project constraints (local-only, no backend). The SHA-256 requirement (CR-01 in PROJECT.md) is satisfied by the existing `hashPin`/`storePinHash` implementation.

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 5 |
|-----------|------------------|
| All interactive elements minimum 44×44 CSS pixels | PIN digit buttons, Done button, lock icon must all meet this — inherit from global CSS rule in index.css |
| `touch-action: manipulation` on interactive elements | All buttons in PinScreen and ParentScreen |
| `100dvh` on all screen containers | PinScreen and ParentScreen must use `style={{ height: '100dvh' }}` |
| `env(safe-area-inset-bottom)` | All screens apply this in paddingBottom |
| No backend, no accounts | Confirmed: all data is Dexie/localStorage only |
| No keyboard input | PIN entry uses DigitGridWidget pattern (tap-only) — no `<input type="text">` |
| Tailwind 4 (CSS-first, no config.js) | Utility classes only; design tokens from `@theme` in index.css |
| Import from `react-router` not `react-router-dom` | PinScreen: `import { useNavigate } from 'react-router'` |
| `db` singleton only in `src/db/db.ts` | Do not instantiate Dexie elsewhere |
| Vitest + fake-indexeddb for tests | Dexie tests work in jsdom; no separate test DB setup needed |

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| Manual `useEffect` + `useState` for IndexedDB reads | `useLiveQuery` from dexie-react-hooks | Already installed; use it — eliminates boilerplate and handles cleanup |
| Polling for data freshness | Reactive subscription via `useLiveQuery` | ParentScreen stays live; if a session completes while parent is viewing, progress updates instantly |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `recordSessionAndUpdateProgress` implementation pattern (useEffect on phase=celebration) | Code Examples | If PracticeScreen's phase state shape changes, callsite must adapt |
| A2 | TopicProgress `put()` upsert pattern (aggregate from all sessions each time) | Pattern 2 | If session count becomes large (thousands), pure aggregate may become slow — but this is v1 and acceptable |
| A3 | PinScreen uses `useLiveQuery` to detect CREATE vs VERIFY mode | Pattern 3 | If `useLiveQuery` behaves unexpectedly for single-record lookup, may need `db.appConfig.get('pinHash')` in a `useEffect` instead |
| A4 | Sorting approach: accuracy unknown topics default to 1.0 | Pattern 5 | If user expectation is that unknown topics appear first (encouraging exploration), default should be 0 instead |
| A5 | `correctCount` and `totalCount` are not currently tracked in PracticeState | Code Examples | If Phase 4 already added these (not visible in current PracticeScreen.tsx), dedup accordingly |
| A6 | Lock icon replaces existing "Parent" text link in HomeScreen | Architecture | The current HomeScreen has a text button that navigates to `/parent`; plan must change its destination to `/pin` |

**Confirmed non-assumptions (verified from codebase):**
- `dexie-react-hooks` installed [VERIFIED: package.json]
- `hashPin`, `storePinHash`, `verifyPin`, `setConfig` all implemented in db.ts [VERIFIED: src/db/db.ts]
- `Session`, `TopicProgress`, `AppConfig` table schemas defined and indexed [VERIFIED: src/db/db.ts]
- `fake-indexeddb/auto` wired in test setup [VERIFIED: src/test/setup.ts]
- HomeScreen currently navigates to `/parent` (not `/pin`) [VERIFIED: src/screens/HomeScreen.tsx]
- PracticeScreen has no session recording (TODO Phase 5 comment at bottom) [VERIFIED: src/screens/PracticeScreen.tsx]
- ParentScreen is a stub with no data [VERIFIED: src/screens/ParentScreen.tsx]
- PinScreen does not exist [VERIFIED: filesystem listing]
- `correctCount`/`totalCount` are NOT in PracticeState [VERIFIED: src/screens/PracticeScreen.tsx interface]

---

## Open Questions (RESOLVED)

1. **Should the lock icon replace the existing "Parent" text link or be added alongside it?**
   - What we know: HomeScreen has a visible "Parent" text button that navigates to `/parent`. D-01 says lock icon should be subtle.
   - What's unclear: Whether to remove the text link entirely (cleaner, correct per D-01) or keep it alongside the lock icon (redundant, contradicts D-01 "subtle").
   - RESOLVED: Remove the text link; replace with the lock icon only. The icon is the single entry point. Plan 05-03 Task 2 removes the "Parent" text button and adds the lock icon in the top-right corner.

2. **Where does `PracticeScreen` get `lesson.topic` and `lesson.grade` for the session write?**
   - What we know: PracticeScreen receives `lessonId` from URL params. It does NOT currently load the full `Lesson` object — it only filters `problems` by `lessonId`.
   - What's unclear: How to get `topic` and `grade` for the session record without duplicating the lesson lookup.
   - RESOLVED: Add `const currentLesson = lessons.find(l => l.id === lessonId)` to PracticeScreen (mirrors how LessonScreen does it). `lessons` is already exported from `curriculum/index.ts`. Plan 05-01 Task 2 adds this lookup.

3. **Does HomeScreen need to display lessons at all currently?**
   - What we know: HomeScreen currently has a single "Start Learning" button that navigates to `/lesson` (no lesson selection UI). The adaptive ordering (D-15) implies a lesson list.
   - What's unclear: Phase 5 CONTEXT.md says adaptive ordering affects "which lesson is highlighted/suggested" — but there may not be a lesson list UI yet.
   - RESOLVED: Phase 5 does NOT introduce a full lesson picker UI. On "Start Learning" tap, the weakest-topic lesson is auto-selected and the app navigates to `/lesson/${selectedLesson.id}`. This satisfies D-14/D-15 without building a 27-lesson picker. Plan 05-03 Task 2 implements this.

---

## Sources

### Primary (HIGH confidence)
- `src/db/db.ts` — Complete Dexie schema, PIN helpers, all table definitions verified by direct file read
- `package.json` — All installed dependency versions verified by direct file read
- `src/screens/PracticeScreen.tsx` — Session recording gap (TODO comment) and PracticeState shape verified
- `src/screens/HomeScreen.tsx` — Current navigation to `/parent` (not `/pin`) verified
- `src/screens/ParentScreen.tsx` — Stub state verified (no data)
- `src/test/setup.ts` — fake-indexeddb wiring verified
- `src/index.css` — Design tokens verified
- `src/components/DigitGridWidget.tsx` — Pattern to reuse for PIN entry verified

### Secondary (MEDIUM confidence)
- `dexie-react-hooks` useLiveQuery API — inferred from package presence and standard Dexie documentation patterns [ASSUMED]
- TopicProgress aggregate upsert approach — derived from db.ts schema + D-17 decision [ASSUMED]

### Tertiary (LOW confidence)
- None — all claims are either verified from codebase or clearly labeled ASSUMED

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json; no new installs required
- Architecture: HIGH — derived directly from existing codebase structure and locked CONTEXT.md decisions
- Pitfalls: HIGH — most identified directly from codebase inspection (HomeScreen/parent navigation, PracticeState missing counters, etc.)
- Test map: HIGH — existing test patterns verified from db.test.ts and PracticeScreen.test.tsx

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (stable stack; Dexie and React Router APIs are stable)
