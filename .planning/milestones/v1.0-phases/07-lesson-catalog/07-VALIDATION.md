---
phase: 07
slug: lesson-catalog
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-19
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for Phase 07: lesson-catalog.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + React Testing Library |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/screens/HomeScreen.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~1s (quick), ~7s (full) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/screens/HomeScreen.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 7 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | CAT-01 | T-07-01 | lesson.id from static curriculum constant — no user-supplied string in navigate() | unit | `npx vitest run src/screens/HomeScreen.test.tsx` | ✅ | ✅ green |
| 07-01-02 | 01 | 1 | CAT-02 | T-07-02 | sessions data is local device only — no PII, no network boundary | unit | `npx vitest run src/screens/HomeScreen.test.tsx` | ✅ | ✅ green |
| 07-01-03 | 01 | 1 | CAT-03 | T-07-02 | topicProgress data is local device only — no PII | unit | `npx vitest run src/screens/HomeScreen.test.tsx` | ✅ | ✅ green |
| 07-01-04 | 01 | 1 | CAT-04 | T-07-01 | navigate('/lesson/' + lesson.id) — lesson.id from static constant, not from DB string | unit | `npx vitest run src/screens/HomeScreen.test.tsx` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

- `src/screens/HomeScreen.test.tsx` — 16 new catalog tests + preserved existing tests (40 total)
- Vitest + React Testing Library + fake-indexeddb already installed from prior phases

---

## Test Coverage Detail

### CAT-01: 3 topic sections, 27 lessons, sort order

| Test | File | Status |
|------|------|--------|
| `renders 3 topic section headers` | HomeScreen.test.tsx | ✅ |
| `renders all 27 lesson titles` | HomeScreen.test.tsx | ✅ |
| `lessons within a topic are sorted by grade then order` | HomeScreen.test.tsx | ✅ |

### CAT-02: Completion ring per lesson (session-driven)

| Test | File | Status |
|------|------|--------|
| `completion ring > shows completion indicator when session exists` | HomeScreen.test.tsx | ✅ |
| `completion ring > no completion indicator when no session exists` | HomeScreen.test.tsx | ✅ |

### CAT-03: Accuracy dot per lesson (topic-level, 3 states) + Needs practice badge

| Test | File | Status |
|------|------|--------|
| `accuracy dot > dot is gray (bg-on-surface/20) when no topicProgress` | HomeScreen.test.tsx | ✅ |
| `accuracy dot > dot is bg-success when topic accuracy >= 0.7` | HomeScreen.test.tsx | ✅ |
| `accuracy dot > dot is bg-accent when topic accuracy < 0.7` | HomeScreen.test.tsx | ✅ |
| `Needs practice badge > no badge shown when topicProgress is empty` | HomeScreen.test.tsx | ✅ |
| `Needs practice badge > badge appears on weakest topic section header` | HomeScreen.test.tsx | ✅ |
| `Needs practice badge > badge does NOT appear on stronger topics` | HomeScreen.test.tsx | ✅ |
| `Needs practice badge > tie-break — addition wins when equal accuracy` | HomeScreen.test.tsx | ✅ |

### CAT-04: Navigate to /lesson/:lessonId

| Test | File | Status |
|------|------|--------|
| `tapping a lesson card navigates to /lesson/:lessonId` | HomeScreen.test.tsx | ✅ |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| iPad Safari portrait (768×1024) scroll behavior — catalog scrolls without breaking layout | CAT-01 | No headless browser with real iOS rubber-band scroll | Open on iPad Safari portrait, scroll lesson catalog end-to-end |
| iPad Safari landscape (1024×768) layout integrity | CAT-01 | Orientation-specific CSS (`height: 100dvh`) not testable in jsdom | Rotate iPad to landscape, confirm catalog renders without overflow |
| Touch target 44px minimum on real device | CAT-01 | CSS pixel rendering differs between desktop browser and iOS | Tap lesson cards on real iPad, confirm no mis-taps |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-19

---

## Validation Audit 2026-05-19

| Metric | Count |
|--------|-------|
| Requirements audited | 4 |
| Gaps found | 0 |
| Resolved | 0 |
| Manual-only | 3 (iPad-specific rendering/scroll behaviors) |
| Full suite tests passing | 326 + 2 todo |
