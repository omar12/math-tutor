# Roadmap: Math Tutor — Kids Edition

## Overview

Six phases take this project from a bare Vite+React scaffold to a fully offline-capable, iPad-optimized math tutor. Phases are ordered by strict dependency: the app shell and storage layer must exist before curriculum can run, audio architecture must land before lesson narration, and parent-facing progress data must exist before the parent dashboard. PWA/offline ships last so it never interferes with development iteration.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [~] **Phase 1: Foundation** - App shell, routing, IndexedDB storage, iPad viewport, PWA scaffold *(2 plans — Ready to execute)*
- [ ] **Phase 2: Curriculum & Content** - JSON-driven curriculum schema and grade 1–3 lesson content
- [ ] **Phase 3: Lesson Player** - Audio manager, narration playback, guided worked example, tap-to-replay
- [ ] **Phase 4: Practice Engine** - Multiple choice, digit grid input, feedback escalation, session celebration
- [ ] **Phase 5: Progress & Parent Section** - Per-topic accuracy tracking, adaptive repetition, PIN-gated parent dashboard
- [ ] **Phase 6: PWA & Offline** - Web App Manifest, Service Worker, full offline capability

## Phase Details

### Phase 1: Foundation
**Goal**: A working app shell runs on iPad Safari with correct viewport handling, persistent local storage, and all tooling wired up — every subsequent phase builds on this without revisiting plumbing.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: PLAT-01, PLAT-02, PLAT-03, PLAT-04
**Success Criteria** (what must be TRUE):
  1. App opens in iPad Safari, fills the screen correctly using `100dvh` and `env(safe-area-inset-bottom)`, with no layout overflow or dead space
  2. Navigating between stub routes (home, lesson, practice, parent) works without page reload
  3. A test record written to IndexedDB via Dexie persists after the browser tab is closed and reopened
  4. Child can open the app and reach the home screen with zero login or setup prompts
**Plans**: 2 plans

**Wave 1** — 01-01: Scaffold, Tailwind v4, Dexie singleton, React Router wiring, Vitest + fake-indexeddb

**Wave 2** *(blocked on Wave 1 completion)* — 01-02: HomeScreen + Remy, styled stub screens, routing tests, human verification checkpoint

**Cross-cutting constraints:** `100dvh` (not `100vh`) on all screen containers; `db` singleton in `src/db/db.ts` is the only Dexie instantiation; imports from `react-router` not `react-router-dom`

Plans:
- [ ] 01-01-PLAN.md — Scaffold, Tailwind v4, Dexie singleton, React Router wiring, and Vitest test infrastructure
- [ ] 01-02-PLAN.md — HomeScreen with Remy the Fox, styled stub screens, routing tests, and human verification checkpoint

### Phase 2: Curriculum & Content
**Goal**: All grade 1–3 math content exists as static JSON that the app can load, so lesson and practice phases have real data to render without any code changes to add new topics.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CURR-01, CURR-02, CURR-03
**Success Criteria** (what must be TRUE):
  1. A defined JSON schema covers lessons, problems, and narration cues for addition, subtraction, and word problems across grades 1–3
  2. Adding a new lesson requires only a new JSON entry — no TypeScript changes needed
  3. Word problem entries include a narration field that the lesson player will later read aloud
  4. All Common Core standard identifiers for grade 1–3 addition and subtraction are represented in the curriculum data
**Plans**: TBD

### Phase 3: Lesson Player
**Goal**: A child can work through a narrated, guided lesson from start to finish — audio plays automatically after the first tap, narrated steps advance in sequence, and the child can replay any segment by tapping it.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: LESS-01, LESS-02, LESS-03, LESS-04
**Success Criteria** (what must be TRUE):
  1. Tapping anywhere on the lesson start screen unlocks audio for the session (iOS Safari gesture requirement satisfied — no silent playback thereafter)
  2. A guided worked example steps through a sample problem with each step narrated aloud via pre-recorded audio
  3. Tapping any narrated segment replays only that segment's audio from the beginning
  4. Lesson narration plays without requiring the child to find or press a separate play button after the initial unlock tap
**Plans**: TBD
**UI hint**: yes

### Phase 4: Practice Engine
**Goal**: After a lesson, a child can answer practice problems using large touch targets, receives warm feedback that escalates appropriately on repeated wrong answers, and finishes with a celebration screen.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: PRAC-01, PRAC-02, PRAC-03, FEED-01, FEED-02, FEED-03, FEED-04
**Success Criteria** (what must be TRUE):
  1. Multiple-choice problems display 4 answer options as large touch targets; the child can answer without a keyboard
  2. Fill-in-the-blank problems display a tappable digit grid (0–9); tapping digits composes the answer with no software keyboard appearing
  3. After 2 wrong attempts on the same problem, a hint appears automatically
  4. After 3 wrong attempts, the correct answer is revealed and the app advances — the child is never stuck in an infinite retry loop
  5. A completion celebration screen (visual reward) appears when the practice session ends
**Plans**: TBD
**UI hint**: yes

### Phase 5: Progress & Parent Section
**Goal**: The app records per-topic accuracy across sessions and uses it to surface struggling topics more often in practice; a PIN-protected parent dashboard makes this data visible to adults.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: PROG-01, PROG-02, PAR-01, PAR-02
**Success Criteria** (what must be TRUE):
  1. After completing multiple practice sessions, per-topic accuracy (addition, subtraction, word problems) is stored in IndexedDB and survives app restarts
  2. Topics where the child has lower accuracy appear more frequently in subsequent practice sessions (adaptive repetition is observable over 2+ sessions)
  3. Entering a 4-digit PIN from the home screen opens the parent dashboard; wrong PIN shows an error and stays locked
  4. Parent dashboard displays accuracy percentage for each topic (addition, subtraction, word problems) drawn from stored session data
**Plans**: TBD
**UI hint**: yes

### Phase 6: PWA & Offline
**Goal**: The app can be installed to the iPad home screen and works fully offline after the first load — no network required for any feature.
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: PWA-01, PWA-02
**Success Criteria** (what must be TRUE):
  1. Safari shows the "Add to Home Screen" option and the installed app launches with no browser chrome (standalone mode)
  2. After first load, toggling the device to Airplane Mode and relaunching the app from the home screen shows the full app with no network errors
  3. Offline mode supports the full lesson and practice flow — no features are degraded or hidden when offline
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Ready to execute | - |
| 2. Curriculum & Content | 0/TBD | Not started | - |
| 3. Lesson Player | 0/TBD | Not started | - |
| 4. Practice Engine | 0/TBD | Not started | - |
| 5. Progress & Parent Section | 0/TBD | Not started | - |
| 6. PWA & Offline | 0/TBD | Not started | - |
