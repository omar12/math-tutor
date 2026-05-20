# Math Tutor — Kids Edition

## What This Is

An iPad-optimized web app that teaches math to kids in grades 1–3. Kids browse a lesson catalog, work through animated narrated lessons, and answer practice problems. The app tracks each child's accuracy per topic and shows parents exactly where their kid struggles — all without accounts, setup, or internet required.

## Core Value

A kid sits down, does a lesson, practices, and the parent can see exactly what their child understands and what they don't — without any accounts or setup friction.

## Requirements

### Validated

- ✓ App runs in Safari on iPad, touch-optimized — v1.0
- ✓ App uses 100dvh + env(safe-area-inset-bottom) for correct iPad viewport — v1.0
- ✓ Single profile per device, no login for the child — v1.0
- ✓ Progress data persists locally via IndexedDB across sessions — v1.0
- ✓ Covers grades 1–3 addition and subtraction aligned to Common Core — v1.0
- ✓ Includes word problems with narration reading aloud — v1.0
- ✓ Curriculum is data-driven static JSON (no code changes to add content) — v1.0
- ✓ Each lesson has a guided worked example narrated step by step — v1.0
- ✓ Lesson instructions narrated aloud via pre-recorded audio — v1.0 (stubs; production audio deferred)
- ✓ Kid can tap any narrated segment to replay it — v1.0
- ✓ Audio unlocked via first deliberate user tap (iOS Safari gesture) — v1.0
- ✓ Multiple choice practice: 4 large-touch-target options, no keyboard — v1.0
- ✓ Digit grid practice: tappable 0–9, no software keyboard — v1.0
- ✓ Practice follows lesson example immediately — v1.0
- ✓ Hint after 2 wrong attempts — v1.0
- ✓ Correct answer reveal + auto-advance after 3 wrong — v1.0
- ✓ Warm encouragement phrases rotate on wrong answers — v1.0
- ✓ Session-end celebration screen — v1.0
- ✓ Per-topic accuracy tracked across sessions — v1.0
- ✓ Error-adaptive repetition (lower accuracy → more frequent practice) — v1.0
- ✓ Parent section behind 4-digit PIN — v1.0
- ✓ Parent dashboard: accuracy per topic — v1.0
- ✓ PWA installable via "Add to Home Screen" on iPad — v1.0
- ✓ App works fully offline after first load via Service Worker — v1.0

### Active

- [ ] Pre-recorded MP3 narration files (production audio, replacing path stubs) — deferred from v1.0
- [ ] iPad Safari device verification: install, standalone, offline mode — deferred from v1.0
- [ ] Lesson completion tracking with visual curriculum map (PROG-V2-01)
- [ ] Session history view: date, topics, accuracy per session (PROG-V2-02)
- [ ] Struggle spotlight: ranked topic list in parent view (PAR-V2-01)
- [ ] Data export / Safari eviction warning in parent section (PAR-V2-03)

### Out of Scope

- Multi-child accounts / parent login — single device profile is enough; adds auth complexity
- Multiplication, division, fractions, geometry — grades 1–3 addition/subtraction/word problems only in v1
- Teacher dashboard / classroom mode — parent-only in v1; different product
- Weekly email reports — parent section on-device covers the need
- Native iOS/Android app — web app targets iPad browser
- Social features (leaderboards, sharing) — harmful for ages 6–9
- Daily streaks — research shows streaks create anxiety in young children; excluded from all versions
- Animated concept intros (LESS-V2-01) — deferred; CSS/Lottie animation not yet needed
- Stars and badges (FEED-V2-01) — deferred; ConfettiScreen sufficient for v1 motivation

## Context

Shipped v1.0 with ~3,310 LOC TypeScript across 139 files.  
Tech stack: Vite 6 + React 19 + TypeScript 5 + Tailwind v4 + Dexie 4 + Howler.js + vite-plugin-pwa + Workbox.  
326 tests passing (Vitest + Testing Library). 0 TypeScript errors.  
Curriculum: 27 lessons + 135 problems, grades 1–3 addition/subtraction/word problems.  
Audio: narration paths wired; MP3 files are stubs pending production recording.  
PWA: service worker configured; iPad device verification deferred by user.

## Constraints

- **Platform**: iPad web browser (Safari) — touch-first, no mouse assumptions
- **Auth**: None for child; PIN for parent section — no backend accounts in v1
- **Storage**: Local device storage — no server-side data persistence in v1
- **Content scope**: Addition, subtraction, word problems (grades 1–3 only)
- **Audience**: Kids 6–9 — UI must be accessible, joyful, low-frustration

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app (not native) | Faster to build, no App Store friction, still iPad-compatible | ✓ Good |
| Single device profile | Eliminates auth complexity, targets single-family iPad use | ✓ Good |
| Local storage only (Dexie) | No backend = simpler v1, parent data stays on device | ✓ Good |
| Animated + narrated lessons | Kids 6–9 engage better with animation and voice than text | ✓ Good — pending production audio |
| React Router 7 unified import | v7 uses `react-router` not `react-router-dom` | ✓ Good |
| 100dvh inline style (not Tailwind h-screen) | h-screen resolves to 100vh; 100dvh required for iPad Safari | ✓ Good |
| Howler.js audio manager | Handles iOS Safari audio quirks (onloaderror/onplayerror fallback) | ✓ Good |
| Pre-recorded audio (stubs in v1) | Robot TTS kills tone for kids; real audio deferred to production | ⚠️ Deferred — production audio not yet recorded |
| useLessonAudio per-step Howl instance | One Howl per step, unmount cleanup — prevents audio leaks | ✓ Good |
| satisfies (not as) for curriculum.json | Compile-time type safety without runtime overhead | ✓ Good |
| vite-plugin-pwa + Workbox generateSW | Standard PWA pattern; audio globPatterns covers offline audio | ✓ Good |
| Inline catalog JSX (no LessonCard component) | Kept change surface minimal for Phase 7 insertion | ✓ Good |
| TOPICS array as weakest-topic tie-break | Deterministic sort: addition wins equal-accuracy ties | ✓ Good |

---
*Last updated: 2026-05-20 after v1.0 milestone*
