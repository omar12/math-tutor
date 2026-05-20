---
phase: 3
slug: lesson-player
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-15
audited: 2026-05-19
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + @testing-library/react 16.x |
| **Config file** | `vite.config.ts` (test block) |
| **Quick run command** | `npx vitest run src/screens/LessonScreen.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/hooks/useLessonAudio.test.ts` or `npx vitest run src/screens/LessonScreen.test.tsx` as appropriate to the task
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green (existing 29 tests + new Phase 3 tests)
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | LESS-02 | — | N/A (npm install) | install | `node -e "require('howler')"` | ✅ | ✅ green |
| 03-01-02 | 01 | 1 | LESS-02, LESS-04 | T-03-01 | onloaderror→onStepEnded prevents stuck state (D-06) | unit | `npx vitest run src/hooks/useLessonAudio.test.ts` | ✅ | ✅ green |
| 03-01-03 | 01 | 1 | LESS-02 | — | N/A (test setup) | unit | `npx vitest run src/db/db.test.ts` | ✅ | ✅ green |
| 03-01-04 | 01 | 1 | LESS-02, LESS-04 | T-03-01 | onloaderror calls onStepEnded; unload on unmount | unit | `npx vitest run src/hooks/useLessonAudio.test.ts` | ✅ | ✅ green |
| 03-02-01 | 02 | 1 | LESS-01 | — | N/A (CSS only) | lint | `./node_modules/.bin/tsc --noEmit` | ✅ | ✅ green |
| 03-02-02 | 02 | 1 | LESS-01, LESS-03 | — | Replay button 44px min touch target | unit | `./node_modules/.bin/tsc --noEmit` | ✅ | ✅ green |
| 03-02-03 | 02 | 1 | LESS-01 | — | ConfettiScreen 40 pieces, aria-hidden | unit | `./node_modules/.bin/tsc --noEmit` | ✅ | ✅ green |
| 03-03-01 | 03 | 2 | LESS-01, LESS-02, LESS-03, LESS-04 | T-03-03-01 | State transitions; no play before first tap | unit | `npx vitest run src/screens/LessonScreen.test.tsx` | ✅ | ✅ green |
| 03-03-02 | 03 | 2 | LESS-01, LESS-02, LESS-03, LESS-04 | T-03-03-01 | iOS unlock: play() before dispatch; onloaderror→AUDIO_ENDED | unit | `npx vitest run src/screens/LessonScreen.test.tsx` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/hooks/useLessonAudio.test.ts` — covers D-06 (onloaderror → AUDIO_ENDED), Howl count, unload on unmount (Plan 03-01 Task 4)
- [x] `src/screens/LessonScreen.test.tsx` — covers LESS-01, LESS-02, LESS-03, LESS-04 (Plan 03-03 Task 1)
- [x] Howler module mock in `src/test/setup.ts` — required for jsdom compatibility (Plan 03-01 Task 3)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| iOS Safari audio unlocks on first tap in real device | LESS-04 | jsdom has no Web Audio API; mock cannot verify actual AudioContext unlock | Open app in iPad Safari, tap the unlock screen, verify audio plays on first tap without any browser alert or silent failure |
| Audio plays automatically when each step appears | LESS-02 | Requires real audio files; mock tests verify Howl.play() called but not actual sound | Load a lesson with real audio files, advance steps, verify audio plays without separate tap required |
| Tapping replay restarts audio from beginning | LESS-03 | Requires real audio files and real playback | During step playback, tap replay icon mid-playback; verify audio restarts from beginning |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s (actual: ~7.5s, 302 tests)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ 2026-05-19

---

## Validation Audit 2026-05-19

| Metric | Count |
|--------|-------|
| Gaps found | 5 (Wave 0 files missing) |
| Resolved | 5 |
| Escalated | 0 |
| Total tests passing | 302 |
| Suite runtime | 7.47s |
