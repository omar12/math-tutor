---
phase: 4
slug: practice-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-15
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
| 4-01-01 | 01 | 1 | PRAC-01, PRAC-02, PRAC-03 | — | N/A | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 4-01-02 | 01 | 1 | PRAC-01 | — | N/A | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 4-01-03 | 01 | 1 | PRAC-02 | — | N/A | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 4-02-01 | 02 | 2 | FEED-01, FEED-02, FEED-03 | — | N/A | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 4-02-02 | 02 | 2 | FEED-04 | — | N/A | unit | `npx vitest run src/screens/PracticeScreen.test.tsx` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/screens/PracticeScreen.test.tsx` — stubs for PRAC-01, PRAC-02, PRAC-03, FEED-01, FEED-02, FEED-03, FEED-04

**Note:** `vi.useFakeTimers()` required for FEED-02 auto-advance test (1.5s setTimeout). Use `vi.advanceTimersByTime(1500)` pattern.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No software keyboard appears on digit grid | PRAC-02 | jsdom cannot test iOS Safari keyboard behavior | Open on iPad Safari, tap digit grid — keyboard must not appear |
| Touch targets feel large enough for a 6-year-old | PRAC-01, PRAC-02 | Subjective ergonomics | Test on physical iPad; tap choices and digit keys with thumb |
| Confetti animation renders correctly | FEED-04 | CSS animation not testable in jsdom | Navigate to end of session — verify confetti animates |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
