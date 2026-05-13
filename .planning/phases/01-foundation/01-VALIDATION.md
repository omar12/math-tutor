---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | vite.config.ts (vitest config inline) |
| **Quick run command** | `npx vitest run --reporter=dot` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=dot`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | PLAT-01 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | PLAT-02 | — | N/A | manual | Browser check on iPad | — | ⬜ pending |
| 1-01-03 | 01 | 1 | PLAT-03 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | PLAT-04 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/db/db.test.ts` — stubs for PLAT-04 (IndexedDB round-trip)
- [ ] `src/router/routes.test.ts` — stubs for PLAT-01 routing
- [ ] `fake-indexeddb` — install for jsdom Dexie testing (see RESEARCH.md open question A1)
- [ ] Vitest + jsdom config wired in `vite.config.ts`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App fills iPad screen with no overflow using `100dvh` + safe-area insets | PLAT-02 | Requires physical device or Safari Simulator — jsdom cannot test viewport units | Open in iPad Safari (or Simulator), rotate portrait/landscape, verify no dead space or overflow |
| All interactive elements ≥ 44×44px touch targets | PLAT-01 | Visual/layout check, not automatable in jsdom | Inspect "Start Learning" button and parent entry point in browser DevTools |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
