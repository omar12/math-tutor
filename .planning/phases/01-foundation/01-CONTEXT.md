# Phase 1: Foundation - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a working app shell on iPad Safari: correct viewport handling, client-side routing with stub screens, IndexedDB storage via Dexie with full v1 schema, and a designed home screen with Remy the Fox mascot. All tooling wired up — every subsequent phase builds on this without revisiting plumbing.

Requirements in scope: PLAT-01, PLAT-02, PLAT-03, PLAT-04

</domain>

<decisions>
## Implementation Decisions

### App Shell Layout
- **D-01:** Full-screen, no persistent chrome. Each screen owns 100% of the viewport. No bottom nav bar, no persistent header.
- **D-02:** Forward-only navigation for child flow. No back button mid-lesson. App advances through Lesson → Practice → Celebration → Home programmatically.
- **D-03:** Parent section entry point is a small, unobtrusive button on the home screen only. Not accessible from any other screen. Kids don't encounter it mid-flow.

### Home Screen Content
- **D-04:** Home screen shows Remy the Fox mascot + single large "Start Learning" button. One tap target, zero decisions for the child. No topic picker, no grade selector.
- **D-05:** Phase 1 stub: tapping "Start Learning" navigates to a hardcoded sample lesson screen (fake content, real visual). Gives Phase 2 a clear render target and validates routing end-to-end.
- **D-06:** Mascot: Remy the Fox — cute, kid-like. Warm orange fox character. Personality: encouraging, friendly, matches kids ages 6–9.

### IndexedDB Schema
- **D-07:** Design full v1 schema now, stub the data. Avoids Dexie version migrations mid-project.
- **D-08:** Tables strictly from v1 requirements (REQUIREMENTS.md): `sessions`, `topicProgress`, `appConfig`. No extras.
  - `sessions` — practice session records (topic, date, correctCount, totalCount)
  - `topicProgress` — per-topic accuracy (topic, accuracy, attemptCount, lastPracticed)
  - `appConfig` — key/value store (PIN hash, lastLessonId, onboardingComplete)
- **D-09:** Phase 1 writes one test record to `appConfig` to prove IndexedDB persistence works (PLAT-04 success criterion).

### Design Baseline
- **D-10:** Color palette: warm, vibrant primaries — classic kids app energy. Bright orange/yellow/blue. Duolingo-level vibrancy, warmer tone.
- **D-11:** Typography: Nunito (Google Fonts). Rounded, friendly, excellent legibility for ages 6–9. Applied globally via Tailwind config.
- **D-12:** All interactive elements minimum 44×44px touch targets (Apple HIG). `touch-action: manipulation` on all tappable elements. `user-select: none` on lesson content.

### Claude's Discretion
- Specific Tailwind color token values (exact hex for primary/secondary/accent) — Claude defines these consistent with "warm vibrant primaries"
- Remy's visual representation in Phase 1 — can be a simple SVG placeholder fox shape; detailed Lottie animation is Phase 3+ work
- Route path naming (`/lesson`, `/practice`, `/parent`) — Claude picks clean, obvious paths

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — All v1 requirements; Phase 1 implements PLAT-01, PLAT-02, PLAT-03, PLAT-04
- `.planning/ROADMAP.md` — Phase 1 success criteria (§ Phase 1: Foundation)

### Project Constraints
- `.planning/PROJECT.md` — Core value, constraints, key decisions, out-of-scope items
- `CLAUDE.md` — Tech stack decisions, Safari/iPadOS gotchas (critical), minimum touch target rules, Tailwind 4 + Vite 6 setup notes

No external ADRs or specs — all decisions captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — project is a blank slate. Phase 1 creates the foundation all other phases reference.

### Established Patterns
- None yet — conventions will emerge during Phase 1 execution and be documented in CLAUDE.md §Conventions.

### Integration Points
- Dexie schema defined in Phase 1 must be the single source of truth for all phases. All subsequent phases import and use the same `db` instance — no re-initialization.
- Tailwind config established in Phase 1 (colors, font, safe-area utilities) is the design token source for all phases.

</code_context>

<specifics>
## Specific Ideas

- Remy the Fox: kid-like, cute, warm orange — mentioned by name in the home screen component
- "Start Learning" as the primary CTA label (not "Begin", "Go", or "Play")
- Hardcoded sample lesson in Phase 1 stub should feel visually intentional, not just placeholder text — gives confidence the design direction works

</specifics>

<deferred>
## Deferred Ideas

- Remy animation sequences (wave, celebrate, think) — Phase 3 Lottie work
- Grade picker / topic selector on home screen — not needed; app picks next lesson automatically
- Lesson completion tracking table (`lessonCompletions`) — not in v1 requirements; defer to v2 if needed

</deferred>

---

*Phase: 1-Foundation*
*Context gathered: 2026-05-12*
