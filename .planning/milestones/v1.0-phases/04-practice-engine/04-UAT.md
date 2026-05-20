---
status: complete
phase: 04-practice-engine
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md]
started: 2026-05-15T23:50:00Z
updated: 2026-05-15T23:50:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 9
name: LessonScreen still says "Start Practice" (regression)
expected: |
  Complete a lesson again and reach the lesson's celebration screen. The button
  reads "Start Practice" — not "Back to Home". Tapping it navigates to the
  practice screen for that lesson.
awaiting: done

## Tests

### 1. Navigate from lesson to practice
expected: |
  Tap through a lesson to the celebration screen ("You did it!"). The button
  says "Start Practice". Tap it. You land on a practice screen showing a real
  problem (a question, 4 answer cards or a digit grid) — not the old "Coming
  soon" stub. The progress dots at the top show "1 of N".
result: pass

### 2. Multiple-choice: tap correct answer advances problem
expected: |
  On a multiple-choice problem (4 cards), tap the correct answer. The cards
  briefly disable (you can't tap again). After ~200ms the next problem appears
  and progress dots advance by 1.
result: pass

### 3. Multiple-choice: tap wrong answer shows encouragement
expected: |
  Tap a wrong answer card. Below the question, an orange encouragement phrase
  appears (e.g. "Almost! You can do it." or similar). The same problem stays
  on screen — no advance.
result: pass

### 4. Two wrong answers shows hint text
expected: |
  On the same problem, tap a wrong answer a second time. The orange
  encouragement phrase is replaced by blue hint text: "Think about what number
  makes the equation balance." No orange text is visible alongside it — only
  the blue hint.
result: pass

### 5. Three wrong answers reveals correct answer and auto-advances
expected: |
  On the same problem, tap a wrong answer a third time. The correct answer is
  highlighted green in the widget. After about 1.5 seconds the next problem
  appears automatically — you didn't tap anything.
result: pass

### 6. Digit-grid: no software keyboard appears
expected: |
  On a digit-grid problem (a display box + number pad below), tap any digit
  key. The digit appears in the display box. No iOS software keyboard slides
  up from the bottom of the screen.
result: pass

### 7. Digit-grid: backspace and 3-digit cap
expected: |
  Compose a 3-digit number by tapping three digit keys. Tapping a fourth key
  is silently ignored — display stays at 3 digits. Tap backspace (the ← icon)
  — the last digit disappears. "Check" button is disabled when the display is
  empty.
result: pass

### 8. Session end: ConfettiScreen with "Back to Home"
expected: |
  Answer all problems in a session (correctly or via 3-wrong auto-advance).
  The "You did it!" celebration screen appears. The button says "Back to Home"
  (not "Start Practice"). Tapping it takes you to the home screen.
result: pass

### 9. LessonScreen still says "Start Practice" (regression)
expected: |
  Complete a lesson again and reach the lesson's celebration screen. The button
  reads "Start Practice" — not "Back to Home". Tapping it navigates to the
  practice screen for that lesson.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
