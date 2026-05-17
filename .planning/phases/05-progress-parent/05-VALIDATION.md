---
phase: 5
slug: progress-parent
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | PROG-01 | — | Session write only on celebration (not mid-session) | unit | `npx vitest run src/db/db.test.ts` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | PROG-01 | — | TopicProgress recalculated from raw sessions | unit | `npx vitest run src/db/db.test.ts` | ✅ | ⬜ pending |
| 05-01-03 | 01 | 1 | PAR-01 | T-5-01 | PIN hash stored, never plaintext | unit | `npx vitest run src/db/db.test.ts` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 2 | PAR-01 | T-5-01 | Wrong PIN shows error, stays locked | unit | `npx vitest run src/screens/PinScreen.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | PAR-02 | — | Empty state shown when no sessions | unit | `npx vitest run src/screens/ParentScreen.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 2 | PROG-02 | — | Weakest topic lesson surfaced first on HomeScreen | unit | `npx vitest run src/screens/HomeScreen.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/screens/PinScreen.test.tsx` — stubs for PAR-01 PIN entry flows (create, verify, wrong PIN)
- [ ] `src/screens/ParentScreen.test.tsx` — stubs for PAR-02 dashboard (empty state, accuracy display)
- [ ] `src/screens/HomeScreen.test.tsx` — stubs for PROG-02 adaptive ordering

*Existing infrastructure (Vitest + `@testing-library/react` + fake-indexeddb) covers all phase requirements — no new packages needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 44px touch targets on PIN digit grid | PLAT-02 | Requires device or browser devtools | Open Safari devtools, inspect PinScreen digit buttons — confirm `min-height: 44px` |
| PIN entry feels natural on iPad | PAR-01 | Subjective touch UX | Tap through PIN creation and verification on iPad/simulator |
| Progress bars render correctly in Safari | PAR-02 | CSS rendering | Open ParentScreen on iPad Safari, confirm bars fill proportionally |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
