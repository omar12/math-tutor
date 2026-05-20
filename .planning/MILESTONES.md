# Milestones — Math Tutor Kids Edition

## v1.0 MVP

**Shipped:** 2026-05-20  
**Phases:** 1–7 (7 phases, 15 plans)  
**Timeline:** 2026-05-12 → 2026-05-20 (8 days)  
**Tests:** 326 passing, 0 failing  
**LOC:** ~3,310 TypeScript, 139 files

### Delivered

A fully functional iPad-optimized math tutor app for kids grades 1–3: kids browse a lesson catalog, work through narrated guided lessons with tap-to-replay audio, answer multiple-choice and digit-grid practice problems with warm feedback escalation, finish to a celebration screen, and parents can view per-topic accuracy through a PIN-gated dashboard — all offline-capable and installable from Safari.

### Key Accomplishments

1. Vite 6 + React 19 + TypeScript + Tailwind v4 + Dexie 4 scaffold with iPad viewport (100dvh, safe-area-inset) and React Router 7
2. Data-driven curriculum: 27 lessons + 135 problems across grades 1–3 as static JSON — no code changes to add content
3. Narrated lesson player: Howler.js audio hook (useLessonAudio), iOS Safari unlock pattern, per-step tap-to-replay
4. Practice engine: useReducer state machine, MultipleChoiceWidget + DigitGridWidget, feedback escalation (hint → reveal → advance), ConfettiScreen
5. Progress tracking + PIN-gated parent dashboard: atomic Dexie session writes, adaptive lesson ordering, per-topic accuracy visualization
6. PWA: vite-plugin-pwa + Workbox generateSW, offline-first with audio precache, installable from Safari
7. Lesson catalog: HomeScreen topic sections with completion rings, accuracy dots, and weakest-topic "Needs practice" badge

### Known Gaps at Close

| Category | Item |
|----------|------|
| docs | VERIFICATION.md missing for phases 01, 03, 04, 06 — functional evidence via named tests |
| docs | REQUIREMENTS.md traceability stale (16/24 checkboxes not updated to reflect completion) |
| docs | CAT-01-04 not in REQUIREMENTS.md traceability (Phase 7 added post-freeze) |
| deferred | iPad Safari install + offline verification — not yet performed on device |
| deferred | Pre-recorded MP3 narration files — stubs on disk; production audio not yet recorded |

Known deferred items at close: 5 (see above)

### Archive

- `.planning/milestones/v1.0-ROADMAP.md` — full phase details
- `.planning/milestones/v1.0-REQUIREMENTS.md` — requirements with final status
- `.planning/milestones/v1.0-MILESTONE-AUDIT.md` — audit report
