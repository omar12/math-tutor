---
phase: 2
slug: curriculum-content
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vite.config.ts` (inline `test:` block) |
| **Quick run command** | `./node_modules/.bin/vitest run src/curriculum/curriculum.test.ts` |
| **Full suite command** | `./node_modules/.bin/vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `./node_modules/.bin/vitest run src/curriculum/curriculum.test.ts`
- **After every plan wave:** Run `./node_modules/.bin/vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | CURR-01 | — | N/A | unit | `./node_modules/.bin/vitest run src/curriculum/curriculum.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | CURR-02 | — | N/A | unit | `./node_modules/.bin/vitest run src/curriculum/curriculum.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 1 | CURR-03 | — | N/A | unit | `./node_modules/.bin/vitest run src/curriculum/curriculum.test.ts` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 2 | CURR-03 | — | N/A | file+grep | `test -f src/curriculum/index.ts && grep "satisfies CurriculumData" src/curriculum/index.ts` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 2 | CURR-01, CURR-02, CURR-03 | — | N/A | unit | `./node_modules/.bin/tsc --noEmit 2>&1 \| head -10 && ./node_modules/.bin/vitest run src/curriculum/curriculum.test.ts 2>&1 \| tail -10` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/curriculum/types.ts` — created by Plan 01 Task 1 (Wave 1) before test imports run
- [ ] `src/curriculum/curriculum.test.ts` — created by Plan 01 Task 3 (Wave 1); expected RED until Wave 2
- [ ] `src/curriculum/index.ts` — created by Plan 02 Task 1 (Wave 2); turns tests GREEN
- [ ] `src/curriculum/curriculum.json` — created by Plan 02 Task 2 (Wave 2); satisfies all 18 test assertions

*No framework install needed — Vitest already configured and passing 11 tests.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (all files created in Wave 1 before Wave 2 depends on them)
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
