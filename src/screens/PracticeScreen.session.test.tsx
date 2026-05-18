/**
 * PROG-01: Session write tests — in a separate file to avoid fake-timer
 * interference with async IndexedDB operations. This file does NOT use
 * vi.useFakeTimers() globally so Dexie promises resolve without timeout issues.
 *
 * Real timers are used throughout. The 200ms ADVANCE timer in PracticeScreen
 * is awaited via `act(async () => { await new Promise(r => setTimeout(r, 250)) })`.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import PracticeScreen from './PracticeScreen'
import { problems } from '../curriculum/index'
import type { MultipleChoiceProblem } from '../curriculum/types'
import { db } from '../db/db'

const MC_LESSON_ID = 'addition-grade1-01'

const mcProblems = problems.filter(
  (p): p is MultipleChoiceProblem => p.lessonId === MC_LESSON_ID && p.type === 'multiple-choice'
)

function renderWithRoute(lessonId: string) {
  return render(
    <MemoryRouter initialEntries={[`/practice/${lessonId}`]}>
      <Routes>
        <Route path="/practice/:lessonId" element={<PracticeScreen />} />
      </Routes>
    </MemoryRouter>
  )
}

/**
 * Click the correct answer button for the current problem and wait for the
 * 200ms ADVANCE timer to fire and React to re-render.
 */
async function clickCorrectAndAdvance(problem: MultipleChoiceProblem) {
  fireEvent.click(screen.getByLabelText(`Answer ${problem.answer}`))
  // Wait for the 200ms correctAnswerTimerRef to dispatch ADVANCE and React to re-render
  await act(async () => {
    await new Promise(r => setTimeout(r, 250))
  })
}

/**
 * Complete all 5 grade-1 problems by answering correctly.
 * After this, state.phase === 'celebration' and ConfettiScreen is rendered.
 */
async function completeAllProblemsCorrectly() {
  for (const problem of mcProblems) {
    await clickCorrectAndAdvance(problem)
  }
}

beforeEach(async () => {
  await db.sessions.clear()
  await db.topicProgress.clear()
})

afterEach(async () => {
  await db.sessions.clear()
  await db.topicProgress.clear()
})

describe('PROG-01: Session write on celebration', () => {
  it('writes exactly 1 Session record when all 5 problems are answered correctly', async () => {
    renderWithRoute(MC_LESSON_ID)
    await completeAllProblemsCorrectly()

    // ConfettiScreen should now be visible
    expect(screen.getByText('You did it!')).toBeInTheDocument()

    await waitFor(async () => {
      const sessions = await db.sessions.toArray()
      expect(sessions).toHaveLength(1)
    }, { timeout: 3000 })
  })

  it('session record has correct lessonId, topic, grade, correctCount, totalCount', async () => {
    renderWithRoute(MC_LESSON_ID)
    await completeAllProblemsCorrectly()

    await waitFor(async () => {
      const sessions = await db.sessions.toArray()
      expect(sessions).toHaveLength(1)
      const s = sessions[0]
      expect(s.lessonId).toBe(MC_LESSON_ID)
      expect(s.topic).toBe('addition')
      expect(s.grade).toBe(1)
      expect(s.correctCount).toBe(5)
      expect(s.totalCount).toBe(5)
    }, { timeout: 3000 })
  })

  it('TopicProgress is upserted for the lesson topic after session write', async () => {
    renderWithRoute(MC_LESSON_ID)
    await completeAllProblemsCorrectly()

    await waitFor(async () => {
      const progress = await db.topicProgress.get('addition')
      expect(progress).toBeDefined()
      expect(progress!.accuracy).toBe(1)
      expect(progress!.attemptCount).toBe(1)
    }, { timeout: 3000 })
  })

  it('does NOT write a Session when navigating away before celebration (mid-session quit)', async () => {
    const { unmount } = renderWithRoute(MC_LESSON_ID)

    // Answer only the first problem — component is on problem 2 (phase: 'answering')
    await clickCorrectAndAdvance(mcProblems[0])

    // Unmount before celebration (simulates navigation away)
    unmount()

    await new Promise(r => setTimeout(r, 200))
    const sessions = await db.sessions.toArray()
    expect(sessions).toHaveLength(0)
  })

  it('does NOT write a duplicate Session when component re-renders during celebration', async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={[`/practice/${MC_LESSON_ID}`]}>
        <Routes>
          <Route path="/practice/:lessonId" element={<PracticeScreen />} />
        </Routes>
      </MemoryRouter>
    )

    await completeAllProblemsCorrectly()
    expect(screen.getByText('You did it!')).toBeInTheDocument()

    // Wait for first write
    await waitFor(async () => {
      const sessions = await db.sessions.toArray()
      expect(sessions).toHaveLength(1)
    }, { timeout: 3000 })

    // Force a re-render of the MemoryRouter wrapper — PracticeScreen component instance
    // stays mounted (same DOM node), so state.phase remains 'celebration'.
    // The useEffect will re-run but hasRecorded.current === true, preventing a second write.
    await act(async () => {
      rerender(
        <MemoryRouter initialEntries={[`/practice/${MC_LESSON_ID}`]}>
          <Routes>
            <Route path="/practice/:lessonId" element={<PracticeScreen />} />
          </Routes>
        </MemoryRouter>
      )
    })

    await new Promise(r => setTimeout(r, 300))

    // Still exactly 1 session — hasRecorded ref guard worked
    const sessions = await db.sessions.toArray()
    expect(sessions).toHaveLength(1)
  })

  it('does NOT write a Session when totalCount is 0 (no problems in pool)', async () => {
    // A nonexistent lessonId → empty problem pool → PracticeScreen renders ConfettiScreen
    // via the early-return branch (before state.phase can ever reach 'celebration').
    // The session write useEffect never fires because phase never changes to 'celebration'.
    renderWithRoute('nonexistent-lesson-id')
    expect(screen.getByRole('button')).toBeInTheDocument()

    await new Promise(r => setTimeout(r, 300))
    const sessions = await db.sessions.toArray()
    expect(sessions).toHaveLength(0)
  })
})
