# Phase 7: Lesson Catalog — Pattern Map

**Mapped:** 2026-05-19
**Files analyzed:** 2 (HomeScreen.tsx modified, HomeScreen.test.tsx modified)
**Analogs found:** 2 / 2

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/screens/HomeScreen.tsx` | screen/component | CRUD + request-response | `src/screens/ParentScreen.tsx` | role-match (topic-grouped list with useLiveQuery) |
| `src/screens/HomeScreen.test.tsx` | test | — | `src/screens/ParentScreen.test.tsx` + existing `HomeScreen.test.tsx` | exact |

---

## Pattern Assignments

### `src/screens/HomeScreen.tsx` (screen, CRUD + request-response)

**Primary analog:** `src/screens/ParentScreen.tsx`
**Secondary analog:** current `src/screens/HomeScreen.tsx` (imports, loading guard, lock icon)

---

#### Imports pattern — copy from `src/screens/HomeScreen.tsx` lines 1–7, extend with sessions

```typescript
import { useNavigate } from 'react-router'
import { useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import RemyFox from '../components/RemyFox'
import { db } from '../db/db'
import type { TopicProgress } from '../db/db'
import { lessons } from '../curriculum/index'
```

Add `Session` to the db import and `Topic` from curriculum/types for the TOPICS constant:

```typescript
import type { TopicProgress, Session } from '../db/db'
import type { Topic } from '../curriculum/types'
```

---

#### TOPICS constant — copy from `src/screens/ParentScreen.tsx` lines 7–11

The catalog sections use the same ordered topic list as ParentScreen:

```typescript
const TOPICS: Array<{ key: Topic; label: string }> = [
  { key: 'addition', label: 'Addition' },
  { key: 'subtraction', label: 'Subtraction' },
  { key: 'word-problems', label: 'Word Problems' },
]
```

---

#### Two useLiveQuery hooks — extend from `src/screens/HomeScreen.tsx` line 29

Current HomeScreen has one hook. Phase 7 needs two — one per table. Pattern from HomeScreen (line 29) and ParentScreen (line 15) both use the same call shape:

```typescript
// Existing hook — keep as-is (src/screens/HomeScreen.tsx line 29)
const topicProgress = useLiveQuery(() => db.topicProgress.toArray())

// New hook — same pattern, different table (mirrors ParentScreen line 15)
const sessions = useLiveQuery(() => db.sessions.toArray())
```

Loading guard must check **both** for `undefined` (D-11). Copy guard from `src/screens/HomeScreen.tsx` lines 43–50, extend condition:

```typescript
// While either Dexie query is loading, show minimal loading shell
if (topicProgress === undefined || sessions === undefined) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full bg-surface gap-8 px-6"
      style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
    />
  )
}
```

---

#### Outer scroll container — new pattern (no exact analog exists)

No existing screen uses an inner scroll container. The catalog content must scroll while the Remy mascot header stays fixed. Use this layout shell based on the `height: 100dvh` + safe-area pattern already in HomeScreen (lines 54–58):

```typescript
<div
  className="relative flex flex-col bg-surface"
  style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
>
  {/* Fixed header zone — lock icon, Remy, heading */}
  <div className="flex flex-col items-center px-6 pt-6 gap-4 flex-shrink-0">
    {/* ... lock icon, <RemyFox />, <h1> ... */}
  </div>

  {/* Scrollable catalog — grows to fill remaining height */}
  <div className="flex-1 overflow-y-auto px-6 pb-6">
    {/* topic sections */}
  </div>
</div>
```

Key classes: `flex flex-col` on outer + `flex-1 overflow-y-auto` on the scroll child. This is the standard CSS pattern for a fixed header + scrollable body inside a 100dvh container. No existing file in the codebase uses it yet, but it follows the same `height: 100dvh` outer wrapper used on all screens.

---

#### Topic section + lesson card loop — copy structure from `src/screens/ParentScreen.tsx` lines 69–82

ParentScreen maps over TOPICS to render per-topic rows. The catalog extends this pattern into a two-level map (topic → lessons):

```typescript
// Analog: ParentScreen lines 69–82
{TOPICS.map(({ key, label }) => {
  const found = progress.find(p => p.topic === key)
  const hasData = Boolean(found)
  const accuracy = found?.accuracy ?? 0
  return (
    <ProgressBar key={key} label={label} accuracy={accuracy} hasData={hasData} />
  )
})}
```

For the catalog, extend to two levels:

```typescript
{TOPICS.map(({ key, label }) => {
  const topicLessons = lessons.filter(l => l.topic === key).sort((a, b) => a.order - b.order)
  const tp = topicProgress.find(p => p.topic === key)
  const accuracy = tp?.accuracy ?? null
  const isWeakest = weakestTopic === key  // derived from topicProgress (D-08)

  return (
    <section key={key}>
      {/* Section header with optional "Needs practice" badge */}
      <h2>{label}{isWeakest && <span>Needs practice</span>}</h2>

      {topicLessons.map(lesson => {
        const completed = completedLessonIds.has(lesson.id)  // derived from sessions
        return (
          <button
            key={lesson.id}
            onClick={() => navigate(`/lesson/${lesson.id}`)}
            className="w-full ... min-h-[44px]"
            style={{ touchAction: 'manipulation' }}
          >
            {lesson.title}
            {/* completion ring + accuracy dot */}
          </button>
        )
      })}
    </section>
  )
})}
```

---

#### Accuracy color logic — copy from `src/components/ProgressBar.tsx` line 21

```typescript
// src/components/ProgressBar.tsx line 21
const fillColor = clamped >= 0.7 ? 'bg-success' : 'bg-accent'
```

Apply same threshold for the accuracy dot on lesson cards (D-04, D-05):

```typescript
// accuracy is topic-level float 0–1 from TopicProgress; null if no data
const dotColor =
  accuracy === null ? 'bg-on-surface/20'   // gray — no data
  : accuracy >= 0.7  ? 'bg-success'         // green — strong
  :                    'bg-accent'          // blue — needs practice
```

---

#### Weakest-topic detection — extend `sortedLessons` logic from `src/screens/HomeScreen.tsx` lines 14–25

The existing `sortedLessons` pure function builds an `accuracyMap` from `TopicProgress[]`. The weakest-topic derivation re-uses the same map:

```typescript
// Derive weakest topic for D-08 badge (mirrors sortedLessons accuracyMap logic)
const weakestTopic: Topic | null = useMemo(() => {
  if (topicProgress.length === 0) return null
  const accuracyMap = new Map(topicProgress.map(p => [p.topic, p.accuracy]))
  // Only topics with recorded data are candidates (D-08: no badge if no data)
  let weakest: Topic | null = null
  let lowestAcc = Infinity
  for (const { key } of TOPICS) {           // TOPICS order = tie-break (D-09)
    const acc = accuracyMap.get(key)
    if (acc !== undefined && acc < lowestAcc) {
      lowestAcc = acc
      weakest = key
    }
  }
  return weakest
}, [topicProgress])
```

---

#### Completion set derivation — new useMemo pattern

```typescript
// Set of lessonIds with ≥1 session — used for checkmark ring (D-04)
const completedLessonIds = useMemo(
  () => new Set(sessions.map(s => s.lessonId)),
  [sessions]
)
```

---

#### Touch target on lesson card buttons — copy from `src/screens/HomeScreen.tsx` lines 60–62 (lock icon) and lines 88–91 (CTA)

Minimum touch target pattern used everywhere:

```typescript
// Secondary action (44px minimum) — src/screens/HomeScreen.tsx lines 60–62
className="... min-h-[44px] min-w-[44px] ..."
style={{ touchAction: 'manipulation' }}

// Primary action (64px) — src/screens/HomeScreen.tsx lines 88–91
className="... min-h-[64px] ..."
style={{ touchAction: 'manipulation' }}
```

Lesson cards are secondary interactive items → use `min-h-[44px]`. CTA-class prominence not needed per card.

---

#### Lock icon — keep unchanged from `src/screens/HomeScreen.tsx` lines 59–81

The absolute-positioned lock button in the top-right corner stays exactly as written. No change needed.

---

### `src/screens/HomeScreen.test.tsx` (test)

**Primary analog:** existing `src/screens/HomeScreen.test.tsx` (all current tests must pass)
**Secondary analog:** `src/screens/ParentScreen.test.tsx` (topic-grouped UI test patterns)

---

#### Test render helper — keep from `src/screens/HomeScreen.test.tsx` lines 10–28

```typescript
function renderHomeScreen() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/lesson/:lessonId" element={<div data-testid="lesson-screen" />} />
        <Route path="/lesson" element={<div data-testid="lesson-screen" />} />
        <Route path="/pin" element={<div data-testid="pin-screen" />} />
        <Route path="*" element={<NavigationCapture />} />
      </Routes>
    </MemoryRouter>
  )
}
```

No change to the helper — it already covers all routes needed for catalog navigation.

---

#### beforeEach DB reset — extend from `src/screens/HomeScreen.test.tsx` lines 31–33

Current code clears only `topicProgress`. Phase 7 adds `sessions`, so both tables need clearing:

```typescript
beforeEach(async () => {
  await db.topicProgress.clear()
  await db.sessions.clear()    // new — sessions used for completion detection
})
```

---

#### Async rendering assertions — copy from `src/screens/HomeScreen.test.tsx` lines 35–37

Use `findBy*` (async) for initial render assertions to allow useLiveQuery to resolve:

```typescript
// Pattern: findBy* for first assertion, then getBy* for subsequent synchronous checks
expect(await screen.findByText('Addition')).toBeInTheDocument()
expect(screen.getByText('Subtraction')).toBeInTheDocument()
expect(screen.getByText('Word Problems')).toBeInTheDocument()
```

Same pattern used in `src/screens/ParentScreen.test.tsx` lines 57–60.

---

#### Session seeding for completion test — copy from `src/screens/ParentScreen.test.tsx` lines 39–47

ParentScreen tests seed `topicProgress` directly. For completion detection, seed `sessions`:

```typescript
// Seed a completed session for a specific lessonId
await db.sessions.add({
  lessonId: 'addition-grade1-01',
  topic: 'addition',
  grade: 1,
  date: '2026-05-19' as ISODateString,
  correctCount: 3,
  totalCount: 3,
})
```

---

#### Touch target test — copy from `src/screens/HomeScreen.test.tsx` lines 45–49

```typescript
it('lesson card meets 44px minimum touch target', async () => {
  renderHomeScreen()
  // findAllByRole captures all lesson card buttons once useLiveQuery resolves
  const cards = await screen.findAllByRole('button', { name: /Adding to 10/i })
  expect(cards[0]).toHaveClass('min-h-[44px]')
})
```

---

#### Weakest-topic badge test — use `findByText` after seeding topicProgress

```typescript
it('shows "Needs practice" badge on weakest topic section when data exists', async () => {
  await db.topicProgress.put({
    topic: 'subtraction',
    accuracy: 0.4,
    attemptCount: 5,
    lastPracticed: '2026-05-19' as ISODateString,
  })
  await db.topicProgress.put({
    topic: 'addition',
    accuracy: 0.8,
    attemptCount: 5,
    lastPracticed: '2026-05-19' as ISODateString,
  })
  renderHomeScreen()
  expect(await screen.findByText(/Needs practice/i)).toBeInTheDocument()
})

it('does NOT show "Needs practice" badge when no topicProgress data', async () => {
  // db is empty (cleared in beforeEach)
  renderHomeScreen()
  await screen.findByText('Addition')   // wait for render to settle
  expect(screen.queryByText(/Needs practice/i)).not.toBeInTheDocument()
})
```

---

## Shared Patterns

### Loading guard (undefined check before render)
**Source:** `src/screens/HomeScreen.tsx` lines 43–50
**Apply to:** HomeScreen — extend to cover both `topicProgress` and `sessions`

```typescript
if (topicProgress === undefined || sessions === undefined) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full bg-surface gap-8 px-6"
      style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
    />
  )
}
```

### Touch target enforcement
**Source:** `src/screens/HomeScreen.tsx` lines 60–62, 88–91
**Apply to:** Every interactive element — lesson cards use `min-h-[44px]`, primary CTAs use `min-h-[64px]`

```typescript
// On every button/interactive element
style={{ touchAction: 'manipulation' }}
className="... min-h-[44px] ..."   // secondary items
className="... min-h-[64px] ..."   // primary CTAs
```

### Safe-area insets
**Source:** `src/screens/HomeScreen.tsx` line 57, `src/screens/ParentScreen.tsx` lines 37–41
**Apply to:** Outer container div on HomeScreen

```typescript
style={{
  height: '100dvh',
  paddingBottom: 'env(safe-area-inset-bottom)',
}}
```

ParentScreen also adds `paddingTop: 'env(safe-area-inset-top)'` — apply both on HomeScreen's new layout since content now scrolls from top.

### Accuracy color threshold
**Source:** `src/components/ProgressBar.tsx` line 21
**Apply to:** Accuracy dot on every lesson card

```typescript
accuracy >= 0.7 → green (bg-success)
accuracy < 0.7  → blue (bg-accent)
accuracy null   → gray (bg-on-surface/20)
```

### DB beforeEach reset in tests
**Source:** `src/screens/HomeScreen.test.tsx` lines 31–33, `src/screens/ParentScreen.test.tsx` lines 22–24
**Apply to:** HomeScreen.test.tsx — reset both `db.topicProgress` and `db.sessions`

---

## No Analog Found

| Pattern | Reason |
|---|---|
| Inner scrollable content area inside 100dvh fixed container | No existing screen uses a fixed header + scrolling body. All current screens either fit in viewport (`HomeScreen`, `PinScreen`) or use full-page scroll (`ParentScreen` with `flex-col`). Use `flex-1 overflow-y-auto` on the catalog div — standard CSS, no codebase analog needed. |

---

## Metadata

**Analog search scope:** `src/screens/`, `src/components/`, `src/curriculum/`, `src/db/`
**Files scanned:** 9 source files read directly + grep across all `.tsx`/`.ts` for touch-action and useLiveQuery patterns
**Pattern extraction date:** 2026-05-19
