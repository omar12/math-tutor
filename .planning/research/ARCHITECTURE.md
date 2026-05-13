# Architecture Patterns

**Domain:** Kids math tutor web app (grades 1-3, local-first, no backend)
**Researched:** 2026-05-12
**Confidence:** HIGH (established React patterns + MDN IndexedDB verification)

---

## Recommended Architecture

The app is a **single-page React application** organized as a state machine at the top level,
routing between two fully isolated modes: the Kid Flow and the Parent Section. All persistence
goes to IndexedDB. Curriculum content lives in static JSON files bundled with the app — no API
calls, no server.

```
┌─────────────────────────────────────────────────────────┐
│                     App Shell                           │
│  (Mode router: "kid" | "parent-locked" | "parent-open") │
└────────────────┬────────────────────────────────────────┘
                 │
       ┌─────────┴──────────┐
       │                    │
┌──────▼──────┐    ┌────────▼────────────┐
│  Kid Flow   │    │   Parent Section    │
│             │    │                     │
│ ┌─────────┐ │    │ ┌─────────────────┐ │
│ │ Lesson  │ │    │ │   PIN Gate      │ │
│ │ Player  │ │    │ └────────┬────────┘ │
│ └────┬────┘ │    │          │          │
│      │      │    │ ┌────────▼────────┐ │
│ ┌────▼────┐ │    │ │ Progress        │ │
│ │Practice │ │    │ │ Dashboard       │ │
│ │ Engine  │ │    │ └─────────────────┘ │
│ └────┬────┘ │    └────────────────────┘
│      │      │
│ ┌────▼────┐ │
│ │ Topic   │ │
│ │ Map /   │ │
│ │ Home    │ │
│ └─────────┘ │
└─────────────┘
       │
       │  reads/writes
       ▼
┌──────────────────────────────────────────┐
│              Storage Layer               │
│  IndexedDB via idb-keyval or Dexie.js    │
│  ┌──────────────┐  ┌───────────────────┐ │
│  │ progress     │  │ session           │ │
│  │ object store │  │ object store      │ │
│  └──────────────┘  └───────────────────┘ │
└──────────────────────────────────────────┘
       ▲
       │  read-only at startup
┌──────┴───────────────────────────────────┐
│           Curriculum Layer               │
│   Static JSON files (bundled as assets)  │
│   grade-1.json, grade-2.json, ...        │
└──────────────────────────────────────────┘
```

---

## Component Boundaries

### 1. App Shell

**Responsibility:** Top-level mode router. Reads persisted mode state, renders either Kid Flow or
Parent Section. Owns the PIN verification transition.

**Communicates with:** Global store (mode slice), PIN Gate.

**Does NOT do:** Lesson logic, progress computation, audio.

**Key decision:** Mode is one of three values — `kid`, `parent-locked`, `parent-open`. The
`parent-locked` state means the parent icon was tapped but the PIN has not been entered. This
keeps the kid UI and parent UI cleanly separated at a single routing gate rather than scattered
access checks throughout the tree.

---

### 2. Curriculum Layer (data, not a component)

**Responsibility:** Static JSON files describing the full content hierarchy. Imported at build
time or lazy-loaded by grade. No runtime generation.

**Schema (nested hierarchy):**

```typescript
// curriculum/grade-1.json (representative shape)
{
  "gradeId": "g1",
  "gradeLabel": "Grade 1",
  "topics": [
    {
      "topicId": "g1-addition-basics",
      "title": "Addition Basics",
      "order": 1,
      "lessons": [
        {
          "lessonId": "g1-add-l1",
          "title": "What is adding?",
          "order": 1,
          "narrationScript": [
            { "segmentId": "s1", "audioFile": "g1-add-l1-s1.mp3", "durationMs": 3200 },
            { "segmentId": "s2", "audioFile": "g1-add-l1-s2.mp3", "durationMs": 2800 }
          ],
          "animationSequence": [
            { "step": 1, "trigger": "segmentId:s1", "animationId": "apples-appear" },
            { "step": 2, "trigger": "segmentId:s2", "animationId": "apples-combine" }
          ],
          "problems": [
            {
              "problemId": "g1-add-l1-p1",
              "type": "numeric-input",
              "stem": "2 + 3 = ?",
              "answer": 5,
              "distractors": [4, 6],
              "difficulty": 1
            }
          ]
        }
      ]
    }
  ]
}
```

**Design rationale:**
- One JSON file per grade allows lazy-loading: grade 2 data isn't parsed until the child reaches it.
- `narrationScript` is a flat ordered array of segments; the Lesson Player walks them sequentially.
- `animationSequence` ties animation steps to narration segment IDs rather than wall-clock times,
  making audio/animation sync declarative and resilient to audio load delays.
- `problems` live inside the lesson they follow; this keeps curriculum self-contained and means
  adding a new lesson is purely a JSON edit with no code change required.
- `type` on problems allows the renderer to pick the right input widget (`numeric-input`,
  `multiple-choice`, `word-problem`) without hard-coded conditionals per problem.

**Content/code separation:** A curriculum author edits JSON only. The React components are
fully content-agnostic — they render whatever the current lesson object describes. This is
the most important architectural invariant: no new lesson should ever require a code deploy.

---

### 3. Lesson Player

**Responsibility:** Orchestrates a single lesson: sequences narration segments, triggers
corresponding animation steps, advances automatically, handles pause/replay.

**Communicates with:**
- Audio Manager (issues "play segment X" commands, receives "segment ended" events)
- Animation Engine (receives trigger events keyed to segment IDs)
- Global store lesson slice (writes current step index, completion flag)
- Curriculum layer (reads `narrationScript` and `animationSequence` from lesson object)

**Does NOT do:** Problem evaluation, progress persistence, parent data.

**Internal state (local React state, not global store):**
- `currentSegmentIndex: number`
- `playerStatus: 'loading' | 'playing' | 'paused' | 'complete'`

Local state is appropriate here because this state is ephemeral — losing it on unmount is
correct (re-entering the lesson restarts it).

---

### 4. Audio Manager (singleton service, not a React component)

**Responsibility:** Manages the Web Audio API or HTMLAudioElement pool. Preloads audio for
the current lesson on lesson entry. Plays segments on demand. Emits `onSegmentEnd` callback.

**Communicates with:** Lesson Player (takes commands, calls back on completion).

**Implementation pattern:** A plain TypeScript class instantiated once at app startup and stored
in a React context. Components call `audioManager.play(segmentId)` — they do not manage Audio
objects directly.

**Preloading strategy:** On lesson entry, preload all `.mp3` files for that lesson's
`narrationScript` into an object keyed by `segmentId`. This avoids mid-lesson load stalls on
iPads where network (or PWA cache) latency would interrupt narration.

**Safari/iOS constraint:** iOS Safari requires audio playback to be initiated inside a user
gesture handler. The "Start" button tap on the lesson entry screen must trigger the first
`audio.play()` call inside its event handler. Subsequent segments can be chained via
`onended` callbacks without a new user gesture.

---

### 5. Animation Engine

**Responsibility:** Renders lesson animations in sync with narration. Receives trigger events
from the Lesson Player and advances the animation sequence accordingly.

**Communicates with:** Lesson Player (listens for segment trigger events).

**Implementation options (choose one at project start):**
- Lottie-web for designer-authored animations (JSON animation files)
- Framer Motion for code-authored animations (no external tool dependency)

**Trigger contract:** The Lesson Player emits `animationTrigger(segmentId)` when a segment
starts playing. The Animation Engine finds all steps in `animationSequence` whose `trigger`
matches and runs them. This is a push model — Lesson Player pushes triggers; Animation Engine
reacts.

---

### 6. Practice Engine

**Responsibility:** Given a set of problems (from the current lesson, or from the adaptive
queue), renders one problem at a time, evaluates answers, records attempt results, decides
when the practice set is complete.

**Communicates with:**
- Global store practice slice (reads current problem queue, writes attempt results)
- Global store progress slice (writes updated topic mastery after practice completes)
- Storage Layer (flushes progress to IndexedDB after each attempt)
- Curriculum layer (reads problem definitions by ID)

**Does NOT do:** Audio/animation, parent data reading.

**Adaptive queue logic:** After a lesson's canonical problems are answered, the engine
computes a "struggle score" per topic by counting recent incorrect attempts weighted by
recency. Topics above a threshold generate additional review problems sampled from their
problem pool. This logic lives in a pure function `computeAdaptiveQueue(progressState, curriculum)`
— not inside a component — making it independently testable.

---

### 7. Topic Map / Home Screen

**Responsibility:** Shows the child which topics/lessons are available, their completion
status, and where to go next. Acts as the app's primary navigation hub.

**Communicates with:** Global store progress slice (reads completion and mastery data),
router (navigates to Lesson Player on tap).

**Does NOT do:** Write to progress, manage audio, access parent data.

---

### 8. PIN Gate

**Responsibility:** Renders a numeric PIN entry UI. On correct PIN entry, transitions app
mode to `parent-open`. On failure, shows feedback and stays in `parent-locked`.

**Communicates with:** Global store mode slice (reads stored PIN hash, writes mode).

**PIN storage:** The PIN is stored as a SHA-256 hash in IndexedDB (not plaintext). The gate
component compares `sha256(entered)` against the stored hash. This is adequate security for
a local single-device parent lock — it is not a cryptographic access control system.

**Isolation guarantee:** The PIN Gate is the single chokepoint between `kid` mode and
`parent-open` mode. Parent-specific components are only rendered when mode is `parent-open`.
They are never in the React tree during kid mode — not hidden via CSS, actually absent.

---

### 9. Parent Dashboard

**Responsibility:** Reads progress data and renders summary stats and per-topic drill-downs
highlighting struggle areas.

**Communicates with:** Global store progress slice (read-only), storage layer (initial load).

**Does NOT do:** Modify progress data, control lessons, access audio.

**Computed views (pure functions over progress state):**
- `summarizeProgress(progress)` → overall completion %, sessions count, total time
- `rankTopicsByStruggle(progress)` → sorted list of topics by error rate
- `topicDrilldown(progress, topicId)` → per-problem attempt history for a topic

---

## State Management Approach

**Tool:** Zustand with the slices pattern. One store, four slices.

| Slice | What it holds | Persisted? |
|-------|--------------|------------|
| `modeSlice` | Current app mode (`kid`/`parent-locked`/`parent-open`) | No (resets to `kid` on launch) |
| `lessonSlice` | Active lesson ID, current segment index, player status | No (ephemeral per session) |
| `practiceSlice` | Current problem queue, current problem index, attempt results for active session | No (ephemeral per session) |
| `progressSlice` | Per-topic attempt history, mastery scores, session log | YES — synced to IndexedDB |

**Persistence pattern:** Only `progressSlice` is persisted. It uses a Zustand middleware that
calls `idb.set('progress', state)` after each state mutation. On app startup, the store
initializes from `idb.get('progress')` before the first render (via an async initialization
function called in `main.tsx` before `ReactDOM.render`).

**Why not localStorage for progress:** Progress data will grow over time (attempt history per
problem). IndexedDB has no practical size limit for this use case; localStorage is capped at
5MB per origin and is synchronous (blocks the main thread on writes). IndexedDB is the right
choice. [Source: MDN IndexedDB Basic Terminology — confirmed 2026-05-12]

**Why Zustand over Context API:** Context API re-renders all consumers on every state change.
With animated lessons and frequent practice state updates, this causes unnecessary renders in
unrelated parts of the tree. Zustand's selector-based subscriptions ensure a component only
re-renders when the specific slice it reads changes.

---

## Storage Layer Architecture

**Database:** One IndexedDB database named `math-tutor-v1`.

| Object Store | Key | Value | Purpose |
|-------------|-----|-------|---------|
| `progress` | `"singleton"` | Serialized `progressSlice` state | All attempt history, mastery scores, session log |
| `settings` | `"singleton"` | `{ pinHash: string, setupComplete: boolean }` | Parent PIN hash and first-run flag |
| `audioCache` | segmentId | ArrayBuffer | Optional: pre-cached audio blobs for offline use |

**Access pattern:** The app reads `progress` and `settings` once at startup. All writes go
through the Zustand `progressSlice` middleware immediately after state updates. The `audioCache`
store is written lazily by the Audio Manager after fetch; the Lesson Player reads from cache
first and falls back to network fetch.

**Wrapper library recommendation:** `idb-keyval` (by Jake Archibald) for `progress` and
`settings` stores (simple key-value, no cursor iteration needed). `Dexie.js` only if query
patterns become more complex (e.g., querying attempts by date range for the parent dashboard).
Start with `idb-keyval` — it is 600 bytes and has no boilerplate.

---

## Data Flow

### Kid Flow — Lesson

```
User taps lesson on Topic Map
        │
        ▼
Router navigates to /lesson/:lessonId
        │
        ▼
Lesson Player mounts
  → reads lesson object from Curriculum JSON (static import)
  → dispatches lessonSlice.setActiveLesson(lessonId)
  → calls audioManager.preload(lesson.narrationScript)
        │
        ▼
User taps "Start"
  → audioManager.play(segment[0]) [must be inside tap handler for iOS Safari]
  → Lesson Player sets currentSegmentIndex = 0, status = 'playing'
        │
        ▼
Audio Manager fires onSegmentEnd(segmentId)
  → Lesson Player increments currentSegmentIndex
  → Lesson Player emits animationTrigger(nextSegmentId)
  → Animation Engine advances animation
  → audioManager.play(segment[next])
        │  (loop until all segments done)
        ▼
All segments complete
  → lessonSlice.markLessonComplete(lessonId)
  → Router navigates to /practice/:lessonId
```

### Kid Flow — Practice

```
Practice Engine mounts with lessonId
  → reads problems from Curriculum JSON
  → reads progressSlice to compute adaptive queue
  → practiceSlice.initQueue(problems + adaptiveQueue)
        │
        ▼
User answers problem
  → Practice Engine evaluates answer (pure function, no side effects)
  → practiceSlice.recordAttempt({ problemId, correct, timestamp })
  → progressSlice.updateMastery({ topicId, problemId, correct })
  → Storage Layer writes progressSlice to IndexedDB (automatic via middleware)
        │
        ▼
Queue exhausted
  → Router navigates back to Topic Map
  → Topic Map re-renders with updated completion state from progressSlice
```

### Parent Section Flow

```
Kid taps parent icon
  → modeSlice.setMode('parent-locked')
  → App Shell renders PIN Gate (Kid Flow unmounts entirely)
        │
        ▼
Parent enters PIN
  → PIN Gate computes sha256(input)
  → compares against settings.pinHash from IndexedDB
  → on match: modeSlice.setMode('parent-open')
  → App Shell renders Parent Dashboard
        │
        ▼
Parent Dashboard mounts
  → reads progressSlice (already in memory — no fresh DB read needed)
  → computes derived views via pure functions
  → renders summary + topic drill-downs
        │
        ▼
Parent taps "Done"
  → modeSlice.setMode('kid')
  → App Shell renders Kid Flow (Parent Dashboard unmounts entirely)
```

---

## Suggested Build Order

Dependencies flow upward — each layer must exist before the layer above it can be built.

```
Layer 0 — Curriculum JSON Schema + sample data
  (No code dependencies; unblocks everything else)
        │
        ▼
Layer 1 — Storage Layer + progressSlice
  (idb-keyval setup, Zustand store skeleton, persist middleware)
  Unblocks: Practice Engine, Parent Dashboard
        │
        ▼
Layer 2 — Routing + App Shell + modeSlice
  (React Router setup, mode state machine, shell layout)
  Unblocks: All screens
        │
        ▼
Layer 3a — Audio Manager                Layer 3b — PIN Gate + settings store
  (Web Audio or HTMLAudioElement pool)    (PIN hash, first-run setup flow)
  Unblocks: Lesson Player                 Unblocks: Parent Dashboard
        │                                         │
        ▼                                         ▼
Layer 4a — Lesson Player                Layer 4b — Parent Dashboard
  (narration sequencing, animation        (progress read, derived views,
  trigger protocol)                       topic drill-down)
        │
        ▼
Layer 5 — Practice Engine
  (problem rendering, answer eval,
  adaptive queue computation)
        │
        ▼
Layer 6 — Topic Map / Home Screen
  (completion display, navigation hub)
        │
        ▼
Layer 7 — Animation Engine integration
  (can be stubbed as a no-op in Layers 4-6,
  filled in with real animations here)
```

**Build order rationale:**
- Curriculum JSON schema is Layer 0 because both the Lesson Player and Practice Engine depend
  on knowing what a lesson and problem look like before any component work starts. Schema
  changes are expensive once components are built against it.
- Storage Layer comes before UI because progress state initialization must be async-resolved
  before the first meaningful render.
- Audio Manager is built before Lesson Player because the Player's control flow is driven by
  Audio Manager callbacks — mocking it would create integration debt.
- Animation Engine is deferred to Layer 7 because it can be stubbed (render nothing) while
  all other components are developed and tested. Filling it in last avoids coupling lesson
  content development to animation production timelines.
- PIN Gate and Parent Dashboard are on a parallel track from the kid flow — they share only
  the storage layer and the progress slice.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing curriculum in state
**What:** Putting curriculum JSON into Zustand or React state.
**Why bad:** Curriculum is static read-only data. Putting it in state triggers re-renders on
import, wastes memory with a redundant copy, and makes the curriculum look mutable when it
isn't. Import it directly as a module-level constant or lazy-load it with dynamic `import()`.

### Anti-Pattern 2: Tying animation timing to wall-clock delays
**What:** Using `setTimeout(nextStep, 3000)` to sequence animation with audio.
**Why bad:** Audio load time varies (especially on first load or slow cache). A 3-second timer
fires at the wrong time if the audio took 1.5 seconds to start. Tie animation steps to audio
segment completion events (`audio.onended`) instead.

### Anti-Pattern 3: Writing progress on every render
**What:** Calling `idb.set(progress)` inside a `useEffect` that runs on every state change.
**Why bad:** IndexedDB writes are async and relatively expensive. Batch them via the Zustand
middleware pattern (write after action completion, not on every render cycle). For this app's
data volume, one write per problem attempt is the right granularity.

### Anti-Pattern 4: Hiding parent UI with CSS instead of unmounting
**What:** Rendering the Parent Dashboard but setting `display: none` during kid mode.
**Why bad:** The Parent Dashboard reads sensitive progress data and is part of the React tree.
A curious child inspecting the DOM could find it. More practically, it wastes memory and risks
accidental focus/keyboard events reaching hidden elements. Unmount it entirely.

### Anti-Pattern 5: One monolithic progress object
**What:** Storing all progress as one deeply nested object updated with spread operators.
**Why bad:** Immutable updates to deeply nested structures are verbose and error-prone in
JavaScript. Structure the progress store as flat indexed maps:
`attempts: Record<problemId, Attempt[]>` and `mastery: Record<topicId, MasteryScore>` rather
than nesting attempts inside lessons inside topics inside grades.

---

## Scalability Considerations

| Concern | At v1 (grades 1-3) | If grades 4-6 added later |
|---------|-------------------|--------------------------|
| Curriculum size | All grades bundled (~50KB JSON) | Lazy-load by grade on demand |
| Progress data size | ~500 attempts max, fits in memory | Paginate parent dashboard queries, use Dexie.js cursor queries |
| Audio assets | Lesson-level preload is fine | Add PWA service worker caching manifest |
| Animation complexity | Framer Motion or simple Lottie files | No structural change needed |

---

## Sources

- MDN IndexedDB Basic Terminology (fetched 2026-05-12, HIGH confidence):
  https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology
- Zustand slices pattern and persist middleware: training knowledge (MEDIUM confidence —
  patterns stable since Zustand v4, 2022; verified against published Zustand docs structure)
- iOS Safari audio gesture requirement: well-documented WebKit behavior, unchanged since iOS 9
  (HIGH confidence — affects every audio-in-browser implementation)
- idb-keyval authorship and size: Jake Archibald's library, widely used (MEDIUM confidence
  from training; version numbers not verified against current npm)
- Common Core math scope grades 1-3: training knowledge, MEDIUM confidence
