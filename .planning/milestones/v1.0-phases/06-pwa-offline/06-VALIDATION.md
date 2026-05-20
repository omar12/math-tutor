---
phase: 06
slug: pwa-offline
status: complete
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-19
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for PWA offline infrastructure.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vite.config.ts` (test section) |
| **Quick run command** | `npx vitest run src/test/pwa.test.ts src/test/pwa-assets.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/test/pwa.test.ts src/test/pwa-assets.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | PWA-01 | T-06-01 | SW scope limited to `/`; no cross-origin caching | integration | `npx vitest run src/test/pwa.test.ts src/test/pwa-assets.test.ts` | ✅ | ✅ green |
| 06-01-02 | 01 | 1 | PWA-01, PWA-02 | T-06-02 | cleanupOutdatedCaches + autoUpdate force immediate SW activation | integration | `npx vitest run src/test/pwa.test.ts src/test/pwa-assets.test.ts` | ✅ | ✅ green |
| 06-02-01 | 02 | 2 | PWA-01, PWA-02 | T-06-04 | Build artifact correctness checked before device deploy | manual | `npx vite build && find dist/ -name manifest.webmanifest` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Safari "Add to Home Screen" appears in share sheet | PWA-01 | Requires physical iPad + Safari — no headless equivalent | Open app on iPad Safari, tap Share, confirm "Add to Home Screen" option present |
| App launches in standalone mode (no browser chrome) | PWA-01 | Requires device install + relaunch | Install from share sheet, tap home screen icon, confirm no address/tab bar |
| App loads fully in Airplane Mode after first online load | PWA-02 | Requires network toggle + SW cache warm-up | Load once online, enable Airplane Mode, close + reopen, confirm full app load |

*Deferred by user decision during Phase 6 Plan 02 (see 06-02-SUMMARY.md).*

---

## Per-Task Coverage

### Plan 01 — PWA Infrastructure

| UAT | Requirement | Test File | Tests | Status |
|-----|-------------|-----------|-------|--------|
| #1 — PWA config values | PWA-01 | `src/test/pwa.test.ts` | Tests 1–3 (registerType, manifest name/display/theme, icons) | ✅ COVERED |
| #2 — Icon PNGs in public/icons/ | PWA-01 | `src/test/pwa-assets.test.ts` | Gap 1 (12 tests: exists, >500B, dimensions per icon) | ✅ COVERED |
| #3 — Apple meta tags in index.html | PWA-01 | `src/test/pwa-assets.test.ts` | Gap 2 (7 tests: 5 tags + no manual manifest) | ✅ COVERED |
| #4 — registerSW in main.tsx | PWA-02 | `src/test/pwa-assets.test.ts` | Gap 3 (3 tests: line 1 import, call exists, ordering) | ✅ COVERED |
| #4 — Workbox config | PWA-02 | `src/test/pwa.test.ts` | Tests 4–6 (audio glob, navigateFallback, cleanupOutdatedCaches) | ✅ COVERED |

### Plan 02 — Build Verification

| UAT | Requirement | Test File | Tests | Status |
|-----|-------------|-----------|-------|--------|
| #5 — Build artifacts in dist/ | PWA-01/02 | manual | `npx vite build && find dist/ -name manifest.webmanifest -name sw.js` | ✅ COVERED (manual — run & verified in 06-02-SUMMARY) |
| #6 — generate-icons in package.json | PWA-01 | `src/test/pwa-assets.test.ts` | Gap 4 (2 tests: scripts field exists, value exact) | ✅ COVERED |
| #7 — Full suite no regressions | All | full suite | `npx vitest run` — 326 tests, 0 failures | ✅ COVERED |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or manual justification
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 not needed — existing infrastructure sufficient
- [x] No watch-mode flags
- [x] Feedback latency < 2s (quick command)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-19

---

## Validation Audit 2026-05-19

| Metric | Count |
|--------|-------|
| Gaps found | 4 |
| Resolved | 4 |
| Escalated | 0 |
| Manual-only | 3 (iPad Safari device tests — deferred) |
| Total tests after audit | 326 (34 files) |
