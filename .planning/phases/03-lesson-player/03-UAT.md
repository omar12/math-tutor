---
status: complete
phase: 03-lesson-player
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md]
started: 2026-05-16T00:00:00Z
updated: 2026-05-16T00:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 6
name: Start Practice navigates to practice
expected: |
  Tapping "Start Practice" on the lesson celebration screen navigates to
  the practice screen for that lesson (e.g. /practice/addition-grade1-01)
  — not to a 404 or the home screen.
awaiting: done

## Tests

### 1. Unlock screen tap
expected: |
  Navigate to http://localhost:5173/lesson. You see Remy the fox, the lesson
  title, and "Tap anywhere to start". Nothing else is clickable yet. Tap
  anywhere on the screen. The unlock screen disappears and you see step 1
  content: a text instruction and optionally an equation (e.g. "3 + 4 = ?").
result: pass

### 2. Next button appears after step
expected: |
  After the unlock tap, the "→" (Next) button appears below the step card.
  Since there are no audio files in dev, the D-06 fallback fires immediately
  and the Next button should be visible within a second or two without waiting
  for real audio to finish.
result: pass
note: "Fixed: Vite was serving index.html (200) for missing audio — Howler's decodeAudioData didn't fire error callback. Root fix: Vite plugin returns 404 for non-existent audio. Also removed audio-gate on Next button so it's always visible."

### 3. Progress dots advance
expected: |
  The dots at the top show the current step filled in (orange) and the rest
  dimmed. After tapping Next, the next dot fills in.
result: pass

### 4. Replay button visible and tappable
expected: |
  On the step card, a circular arrow (↺) replay button is visible. Tapping it
  does not crash or navigate away. In dev (no audio files), it may silently
  do nothing, which is acceptable.
result: pass

### 5. All steps advance to celebration
expected: |
  Tapping Next through all lesson steps eventually shows the celebration
  screen: "You did it!" heading and a "Start Practice" button.
result: pass

### 6. Start Practice navigates to practice
expected: |
  Tapping "Start Practice" on the lesson celebration screen navigates to
  the practice screen for that lesson (e.g. /practice/addition-grade1-01)
  — not to a 404 or the home screen.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
