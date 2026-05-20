# Retrospective — Math Tutor Kids Edition

## Milestone: v1.0 — MVP

**Shipped:** 2026-05-20  
**Phases:** 7 | **Plans:** 15

### What Was Built

1. Vite + React + TypeScript + Tailwind v4 + Dexie 4 + React Router 7 scaffold with iPad viewport
2. 27-lesson, 135-problem curriculum JSON (grades 1–3, Common Core aligned)
3. Narrated lesson player with Howler.js, iOS audio unlock, per-step tap-to-replay
4. Practice engine with MC + digit-grid widgets, feedback escalation, ConfettiScreen
5. Per-topic accuracy tracking + PIN-gated parent dashboard with adaptive ordering
6. PWA with Service Worker (Workbox) + offline-first audio precache
7. Lesson catalog on HomeScreen with completion rings, accuracy dots, weakest-topic badge

### What Worked

- **GSD wave-based planning** caught real dependencies early (audio unlock must land in Phase 3 before narration)
- **TDD rhythm** (red → green → summary) made each plan's scope clear and completion verifiable
- **Dexie singleton pattern** (one import point) prevented schema drift across phases
- **satisfies (not as) for curriculum.json** — zero-runtime type safety that saved catching bad data early
- **Inline JSX for catalog** — avoided unnecessary component extraction in Phase 7; clean and minimal

### What Was Inefficient

- **No VERIFICATION.md for phases 01, 03, 04, 06** — executed before the verify-work step was enforced; required retroactive Nyquist audit pass
- **REQUIREMENTS.md traceability never updated** — checkboxes stayed stale for 16/24 requirements; required audit to reconcile
- **Phase 7 added post-requirements-freeze** — CAT-01-04 never added to REQUIREMENTS.md traceability; small tracking gap

### Patterns Established

- iOS Safari audio unlock: first user tap must unlock audio context; load-bearing for all narration
- useLessonAudio: one Howl per step, unmount cleanup, onloaderror → onStepEnded silent fallback
- justReplayedRef guard: prevents double-play when REPLAY dispatch re-enters playing phase
- act() wrapper: required when calling Howl onend() in Vitest (React state update outside event handler)
- useLiveQuery + .then(r => r ?? null): disambiguates "loading" from "not found" in PIN verification
- useRef boolean guard (hasRecorded): prevents duplicate session writes on StrictMode re-render
- Separate *.session.test.tsx: isolates IndexedDB async tests from vi.useFakeTimers() suite
- 100dvh via inline style (not Tailwind h-screen): Tailwind resolves to 100vh; inline style required for iPad

### Key Lessons

1. **Enforce VERIFICATION.md from Phase 1** — retroactive Nyquist audits cost more than the verify-work step
2. **Update REQUIREMENTS.md traceability in-flight** — stale checkboxes create audit confusion at milestone close
3. **Add post-freeze phases to REQUIREMENTS.md** — Phase 7 shows the tracking gap that occurs when phases are inserted after requirements freeze
4. **Deferred audio stubs are fine** — path-based stubs (audio/lesson-01/step-01.mp3) let all tests pass without real files; just document the deferral explicitly
5. **GSD works well at this scale** — 8-day, 7-phase build delivered 100% requirement coverage with 326 passing tests and 0 TS errors

### Cost Observations

- Sessions: ~8–10 working sessions across 8 days
- Notable: Phase 5 (progress tracking) was the most complex plan (~213–265 min for P02/P03 due to Dexie + UI combination)
- Phase 7 fastest: 4 min execution (leveraged existing patterns, minimal new surface area)

---

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 7 |
| Plans | 15 |
| Days | 8 |
| Tests | 326 passing |
| LOC (TS) | ~3,310 |
| TS errors | 0 |
| Req coverage | 24/24 functional |
| VERIFICATION.md coverage | 3/7 phases |
