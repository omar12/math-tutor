import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Howl } from 'howler'
import LessonScreen from './LessonScreen'
import { lessons } from '../curriculum/index'

describe('LessonScreen', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows unlock screen with Remy, lesson title, and tap instruction before first tap', () => {
    render(<MemoryRouter><LessonScreen /></MemoryRouter>)
    expect(screen.getByText('Tap anywhere to start')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /remy/i })).toBeInTheDocument()
  })

  it('calls howls[0].play() synchronously on unlock tap — LESS-04', () => {
    render(<MemoryRouter><LessonScreen /></MemoryRouter>)
    const unlockDiv = screen.getByRole('button', { name: /tap to start lesson/i })
    fireEvent.click(unlockDiv)
    const HowlMock = Howl as ReturnType<typeof vi.fn>
    const firstHowlInstance = HowlMock.mock.results[0].value
    expect(firstHowlInstance.play).toHaveBeenCalledTimes(1)
  })

  it('shows step 0 content after unlock tap — LESS-01', () => {
    render(<MemoryRouter><LessonScreen /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /tap to start lesson/i }))
    const step0 = lessons[0].workedExample.steps[0]
    expect(screen.getByText(step0.text)).toBeInTheDocument()
  })

  it('advances to next step when Next is tapped in between-steps state', () => {
    render(<MemoryRouter><LessonScreen /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /tap to start lesson/i }))
    const HowlMock = Howl as ReturnType<typeof vi.fn>
    // Simulate audio ended for step 0
    HowlMock.mock.calls[0][0].onend()
    // Now in between-steps — Next button visible
    const nextBtn = screen.getByRole('button', { name: /next step/i })
    expect(nextBtn).toBeInTheDocument()
    fireEvent.click(nextBtn)
    const step1 = lessons[0].workedExample.steps[1]
    expect(screen.getByText(step1.text)).toBeInTheDocument()
  })

  it('shows celebration screen after last step is advanced', () => {
    render(<MemoryRouter><LessonScreen /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /tap to start lesson/i }))
    const HowlMock = Howl as ReturnType<typeof vi.fn>
    const steps = lessons[0].workedExample.steps
    // Advance through all steps
    for (let i = 0; i < steps.length; i++) {
      HowlMock.mock.calls[i][0].onend()
      fireEvent.click(screen.getByRole('button', { name: /next step/i }))
    }
    expect(screen.getByText('You did it!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start practice/i })).toBeInTheDocument()
  })

  it('taps replay icon stops and replays current step audio — LESS-03', () => {
    render(<MemoryRouter><LessonScreen /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /tap to start lesson/i }))
    const HowlMock = Howl as ReturnType<typeof vi.fn>
    // Trigger onend to enter between-steps
    HowlMock.mock.calls[0][0].onend()
    // Click replay
    fireEvent.click(screen.getByRole('button', { name: /replay this step/i }))
    const firstHowl = HowlMock.mock.results[0].value
    expect(firstHowl.stop).toHaveBeenCalledTimes(1)
    expect(firstHowl.play).toHaveBeenCalledTimes(2) // once on unlock, once on replay
  })

  it('no Howl.play() called before first tap — LESS-04', () => {
    render(<MemoryRouter><LessonScreen /></MemoryRouter>)
    const HowlMock = Howl as ReturnType<typeof vi.fn>
    HowlMock.mock.results.forEach(r => expect(r.value.play).not.toHaveBeenCalled())
  })
})
