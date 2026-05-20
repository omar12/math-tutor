---
phase: 4
slug: practice-engine
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-15
audited: 2026-05-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| **Config file** | `vite.config.ts` (test block: environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts') |
| **Quick run command** | `npx vitest run src/screens/PracticeScreen.test.tsx` |
| **Session tests command** | `npx vitest run src/screens/PracticeScreen.session.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/screens/PracticeScreen.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | PRAC-01, PRAC-02, PRAC-03 | — | N/A | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ✅ | ✅ green |
| 4-01-02 | 01 | 1 | PRAC-01 | T-04-05 | Input lock: phase guard prevents duplicate dispatch | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ✅ | ✅ green |
| 4-01-03 | 01 | 1 | PRAC-02 | T-04-04 | Digit cap at MAX_DIGITS=3; no input element | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ✅ | ✅ green |
| 4-02-01 | 02 | 2 | FEED-01, FEED-02, FEED-03 | T-04-02-04 | FeedbackSlot mutually exclusive branches | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ✅ | ✅ green |
| 4-02-02 | 02 | 2 | FEED-04 | T-04-02-03 | ConfettiScreen buttonLabel prop; navigate('/') | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ✅ | ✅ green |
| 4-02-03 | 02 | 2 | PROG-01 | T-04-02-02 | Session write once; no duplicate; no write on mid-quit | integration | `npx vitest run src/screens/PracticeScreen.session.test.tsx` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/screens/PracticeScreen.test.tsx` — covers PRAC-01, PRAC-02, PRAC-03, FEED-01, FEED-02, FEED-03, FEED-04 (302 passed, 2 todo, 0 failed — full suite as of 2026-05-15)
- [x] `src/screens/PracticeScreen.session.test.tsx` — covers PROG-01 session write (5 tests, real timers, IndexedDB)

**Note:** `vi.useFakeTimers()` used in PracticeScreen.test.tsx for FEED-02 auto-advance (1.5s setTimeout). Session tests use real timers to avoid Dexie promise interference.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No software keyboard appears on digit grid | PRAC-02 | jsdom cannot test iOS Safari keyboard behavior | Open on iPad Safari, tap digit grid — keyboard must not appear |
| Touch targets feel large enough for a 6-year-old | PRAC-01, PRAC-02 | Subjective ergonomics | Test on physical iPad; tap choices and digit keys with thumb |
| Confetti animation renders correctly | FEED-04 | CSS animation not testable in jsdom | Navigate to end of session — verify confetti animates |
| Orange encouragement vs blue hint visually distinct | FEED-01, FEED-03 | Color contrast subjective; jsdom has no CSS rendering | Submit 1 wrong → orange text; submit 2nd wrong → blue text replaces orange |
| aria-live="assertive" fires during reveal | FEED-02 | Screen reader behavior untestable in jsdom | Use VoiceOver on iPad: 3 wrong answers → VoiceOver announces "The answer is N. Moving to the next problem." |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ complete — 302 automated tests passing (full suite 2026-05-19)

---

## Validation Audit 2026-05-19

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated to manual | 0 |
| Bonus coverage (PROG-01 session tests) | 5 tests |
| Full suite status | 302 passed, 2 todo, 0 failed |
