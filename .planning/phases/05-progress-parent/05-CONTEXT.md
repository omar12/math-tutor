# Phase 5: Progress & Parent Section — Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Record per-topic accuracy from practice sessions into IndexedDB. Implement adaptive repetition that surfaces struggling topics more often. Gate the parent dashboard behind a 4-digit PIN. Display per-topic accuracy (addition, subtraction, word-problems) as progress bars to the parent.

Requirements in scope: PROG-01, PROG-02, PAR-01, PAR-02

**NOT in scope:** Session history view, struggle spotlight ranking, data export, multi-child support — those are v2 (REQUIREMENTS.md).
</domain>

<decisions>
## Implementation Decisions

### PIN Entry Point
- **D-01:** A small lock icon sits in the corner of HomeScreen (top-right or bottom-right — Claude's discretion on placement). Subtle enough that kids won't notice it; discoverable by adults. No "Parent" label.
- **D-02:** PIN input uses the same digit-grid style as `DigitGridWidget` — 4 digits, display dots (not characters), no software keyboard. The existing `DigitGridWidget` component or its pattern should be reused/adapted.
- **D-03:** First-time flow (no PIN stored in `appConfig`): tap lock → prompt to CREATE a PIN (enter 4 digits, confirm 4 digits). Both entries must match before PIN is stored via `storePinHash`. If they don't match, show an error and ask again.
- **D-04:** Subsequent visits: tap lock → enter existing PIN → verified via `verifyPin()`. Wrong PIN shows an inline error message, clears the display, lets parent try again. No lockout/timeout in v1.
- **D-05:** PIN entry lives in a dedicated screen (not a modal), navigated to from the lock icon tap. After verification, navigate to ParentScreen.

### Parent Dashboard Layout
- **D-06:** ParentScreen shows per-topic accuracy as **progress bars with percentage**. One row per topic: topic label, filled bar, percentage number. Example: `Addition  ████████░░  78%`
- **D-07:** Three topics displayed: addition, subtraction, word-problems. Always show all three even if some have no data.
- **D-08:** **Empty state** (no sessions recorded yet): show a friendly message — "No practice sessions yet. Come back after your child completes a lesson!" — instead of bars. Hide the progress section entirely; don't show bars at 0%.
- **D-09:** Exit via a **"Done" button** that navigates to HomeScreen (`'/'`). Explicit handoff — parent consciously returns the device to child mode.
- **D-10:** No re-lock mechanism needed (no "lock" button in dashboard). Parent navigates out via Done; a child who finds the dashboard can only tap Done to go back to Home — no harm done.

### Session Recording
- **D-11:** Write a `Session` record to Dexie when the practice session **celebration screen is reached** (all problems answered or revealed). If the child quits mid-session, no record is written — partial sessions don't count.
- **D-12:** Session record fields (from existing `Session` interface): `lessonId`, `topic` (from lesson), `grade` (from lesson), `date` (today as ISODateString), `correctCount` (problems answered correctly on first attempt), `totalCount` (all problems in session).
- **D-13:** After writing the `Session`, immediately recalculate and upsert the corresponding `TopicProgress` record: aggregate all sessions for that topic, compute `accuracy = totalCorrect / totalAnswered`, update `attemptCount` and `lastPracticed`. Recalculate from raw sessions (not incremental) — simpler and correct at v1 scale.

### Adaptive Repetition
- **D-14:** Adaptive repetition affects **which lesson is highlighted/suggested on HomeScreen** — not problem-level selection within a session. When `TopicProgress` shows accuracy < 70% for a topic, the HomeScreen surfaces a lesson from that struggling topic more prominently (or first in the list if lessons are ordered).
- **D-15:** Specific adaptation mechanic (Claude's discretion): rank lessons by topic accuracy, lowest first. The first lesson shown on HomeScreen is from the weakest topic. If accuracy is equal across topics, use curriculum order.
- **D-16:** Problem-level session composition stays as Phase 4 defined it (lesson-specific pool, all problems shuffled). Adaptive repetition works at the lesson selection level, not the problem level.

### TopicProgress Update
- **D-17:** `topicProgress` table is updated via a pure aggregate query after each session: `sessions.where('topic').equals(topic)` → sum all `correctCount` and `totalCount` → write new accuracy float and updated `lastPracticed`. This runs in the `PracticeScreen` `onSessionComplete` path.

### Claude's Discretion
- Lock icon design (size, position, icon style) — keep subtle
- PIN screen layout and visual style — mirror the digit-grid aesthetic (clean, touch-friendly)
- Progress bar component design (height, color, label placement) — use `--color-accent` or `--color-success` for filled portion
- Error messaging copy for wrong PIN
- Exact threshold for "struggling" topic (70% accuracy recommended)
- HomeScreen lesson list ordering logic (how to display lessons when sorted by topic weakness)
- Loading/async states for Dexie queries in ParentScreen

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — PROG-01 (per-topic accuracy tracking), PROG-02 (adaptive repetition), PAR-01 (PIN-gated parent section), PAR-02 (parent dashboard shows accuracy per topic)
- `.planning/ROADMAP.md` — Phase 5 goal and success criteria

### Project Constraints
- `.planning/PROJECT.md` — iPad Safari, no backend, local-only storage, kids 6–9 audience, PIN hashing required (CR-01)
- `CLAUDE.md` — 44px touch targets, touch-action: manipulation, Tailwind 4, 100dvh containers

### Existing Infrastructure (already built — read before implementing)
- `src/db/db.ts` — Dexie DB with `Session`, `TopicProgress`, `AppConfig` tables; `hashPin`, `storePinHash`, `verifyPin`, `setConfig` helpers. **Do not redefine these.**
- `src/db/db.test.ts` — existing tests for DB utilities
- `src/screens/ParentScreen.tsx` — stub to replace
- `src/components/DigitGridWidget.tsx` — digit-grid pattern to reuse/adapt for PIN entry (4-digit, display box, no keyboard)
- `src/screens/HomeScreen.tsx` — entry point for lock icon; reads current lesson list; needs adaptive ordering added
- `.planning/phases/04-practice-engine/04-CONTEXT.md` — Phase 4 decisions (session structure, celebration screen, navigation to '/')

### Design Tokens (from src/index.css @theme)
- `--color-primary: #FF6B35` (orange — encouragement, dots, active)
- `--color-accent: #3B82F6` (blue — buttons, progress bar fill candidate)
- `--color-success: #22C55E` (green — correct, high-accuracy indicator)
- `--color-surface: #FFF8F0` (background)
- `--color-on-surface: #1C1917` (text)
</canonical_refs>
