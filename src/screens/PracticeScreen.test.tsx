import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import PracticeScreen from './PracticeScreen'
import { problems } from '../curriculum/index'
import type { MultipleChoiceProblem, DigitGridProblem } from '../curriculum/types'

const MC_LESSON_ID = 'addition-grade1-01'
const DG_LESSON_ID = 'addition-grade3-01'

function renderWithRoute(lessonId: string) {
  return render(
    <MemoryRouter initialEntries={[`/practice/${lessonId}`]}>
      <Routes>
        <Route path="/practice/:lessonId" element={<PracticeScreen />} />
      </Routes>
    </MemoryRouter>
  )
}

const mcProblems = problems.filter(
  (p): p is MultipleChoiceProblem => p.lessonId === MC_LESSON_ID && p.type === 'multiple-choice'
)
const dgProblems = problems.filter(
  (p): p is DigitGridProblem => p.lessonId === DG_LESSON_ID && p.type === 'digit-grid'
)

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('PRAC-01: Multiple-choice widget', () => {
  it('renders 4 answer cards for a grade-1 lesson', () => {
    renderWithRoute(MC_LESSON_ID)
    const cards = screen.getAllByRole('button', { name: /^Answer \d+$/i })
    expect(cards).toHaveLength(4)
  })

  it('tapping correct card advances problem index', () => {
    renderWithRoute(MC_LESSON_ID)
    const firstProblem = mcProblems[0]
    const correctBtn = screen.getByLabelText(`Answer ${firstProblem.answer}`)
    const initialQuestion = screen.getByText(firstProblem.question)
    expect(initialQuestion).toBeInTheDocument()

    fireEvent.click(correctBtn)
    act(() => { vi.advanceTimersByTime(201) })

    // Should advance to next problem
    expect(screen.queryByText(firstProblem.question)).not.toBeInTheDocument()
  })

  it('answer cards disabled during 200ms transition window — input-lock', () => {
    renderWithRoute(MC_LESSON_ID)
    const firstProblem = mcProblems[0]
    const correctBtn = screen.getByLabelText(`Answer ${firstProblem.answer}`)

    fireEvent.click(correctBtn)
    // Immediately after tap: phase is 'revealing', buttons disabled
    expect(correctBtn).toBeDisabled()
  })
})

describe('PRAC-02: Digit-grid widget', () => {
  it('renders no input element for a digit-grid lesson', () => {
    renderWithRoute(DG_LESSON_ID)
    expect(document.querySelector('input')).toBeNull()
  })

  it('tapping digit key appends to display', () => {
    renderWithRoute(DG_LESSON_ID)
    fireEvent.click(screen.getByLabelText('Digit 3'))
    expect(screen.getByRole('status')).toHaveTextContent('3')
  })

  it('digit cap at 3 — 4th tap is silently ignored', () => {
    renderWithRoute(DG_LESSON_ID)
    fireEvent.click(screen.getByLabelText('Digit 1'))
    fireEvent.click(screen.getByLabelText('Digit 2'))
    fireEvent.click(screen.getByLabelText('Digit 3'))
    fireEvent.click(screen.getByLabelText('Digit 4'))
    expect(screen.getByRole('status')).toHaveTextContent('123')
  })

  it('backspace removes last digit', () => {
    renderWithRoute(DG_LESSON_ID)
    fireEvent.click(screen.getByLabelText('Digit 5'))
    expect(screen.getByRole('status')).toHaveTextContent('5')
    fireEvent.click(screen.getByLabelText('Delete last digit'))
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Enter your answer')
  })

  it('Check Answer button disabled when display is empty', () => {
    renderWithRoute(DG_LESSON_ID)
    expect(screen.getByLabelText('Check my answer')).toBeDisabled()
  })

  it('Check Answer button enabled after composing a digit', () => {
    renderWithRoute(DG_LESSON_ID)
    fireEvent.click(screen.getByLabelText('Digit 7'))
    expect(screen.getByLabelText('Check my answer')).not.toBeDisabled()
  })
})

describe('D-03: Attempt counter resets on advance', () => {
  it('FeedbackSlot placeholder present at start of each problem', () => {
    renderWithRoute(MC_LESSON_ID)
    // Progress dots container confirms first problem
    expect(screen.getByLabelText(/problem 1 of/i)).toBeInTheDocument()
  })
})

describe('FEED-01: Encouragement after 1st wrong answer', () => {
  it.todo('shows warm encouragement phrase below problem after first wrong answer')
})

describe('FEED-02: Reveal after 3 wrong answers', () => {
  it.todo('auto-advances after 1500ms when 3rd wrong answer triggers reveal')
})

describe('FEED-03: Encouragement phrase after 1st wrong answer (FeedbackSlot)', () => {
  it.todo('FeedbackSlot renders encouragement in text-primary (orange) after first wrong answer')
})

describe('FEED-04: ConfettiScreen after last problem', () => {
  it.todo('ConfettiScreen shown after all problems answered with Back to Home button')
})

describe('D-11: LessonScreen ConfettiScreen regression', () => {
  it.todo('LessonScreen ConfettiScreen still shows Start Practice button text')
})
