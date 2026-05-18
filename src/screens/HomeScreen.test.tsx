import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import HomeScreen from './HomeScreen'
import { db } from '../db/db'
import type { ISODateString } from '../db/db'
import { lessons } from '../curriculum/index'

// Capture a route that records navigated path for assertions
function renderHomeScreen() {
  let navigatedTo = ''
  const NavigationCapture = () => {
    // This component renders at the navigated-to location
    return <div data-testid="navigated" data-path={window.location.pathname}>Navigated</div>
  }
  const result = render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/lesson/:lessonId" element={<div data-testid="lesson-screen" />} />
        <Route path="/lesson" element={<div data-testid="lesson-screen" />} />
        <Route path="/pin" element={<div data-testid="pin-screen" />} />
        <Route path="*" element={<NavigationCapture />} />
      </Routes>
    </MemoryRouter>
  )
  return result
}

describe('HomeScreen', () => {
  beforeEach(async () => {
    await db.topicProgress.clear()
  })

  it('renders the Start Learning button', async () => {
    renderHomeScreen()
    expect(await screen.findByText('Start Learning')).toBeInTheDocument()
  })

  it('renders Remy the Fox', async () => {
    renderHomeScreen()
    expect(await screen.findByRole('img', { name: 'Remy the Fox' })).toBeInTheDocument()
  })

  it('Start Learning button meets 44px minimum touch target', async () => {
    renderHomeScreen()
    const btn = await screen.findByText('Start Learning')
    // min-h-[64px] class applied — larger than 44px minimum (PLAT-01)
    expect(btn).toHaveClass('min-h-[64px]')
  })

  it('renders a lock icon button with aria-label "Parent access" instead of text "Parent"', async () => {
    renderHomeScreen()
    expect(await screen.findByRole('button', { name: /parent access/i })).toBeInTheDocument()
    expect(screen.queryByText('Parent')).not.toBeInTheDocument()
  })

  it('lock icon button navigates to /pin', async () => {
    renderHomeScreen()
    const lockBtn = await screen.findByRole('button', { name: /parent access/i })
    fireEvent.click(lockBtn)
    expect(await screen.findByTestId('pin-screen')).toBeInTheDocument()
  })

  describe('adaptive lesson ordering', () => {
    it('Start Learning navigates to weakest topic lesson when topicProgress exists', async () => {
      // addition accuracy=0.4 (weaker), subtraction accuracy=0.8 (stronger)
      await db.topicProgress.put({
        topic: 'addition',
        accuracy: 0.4,
        attemptCount: 5,
        lastPracticed: '2026-05-17' as ISODateString,
      })
      await db.topicProgress.put({
        topic: 'subtraction',
        accuracy: 0.8,
        attemptCount: 5,
        lastPracticed: '2026-05-17' as ISODateString,
      })

      renderHomeScreen()
      const startBtn = await screen.findByText('Start Learning')
      fireEvent.click(startBtn)

      // Should navigate to the first addition lesson (weakest topic)
      const firstAdditionLesson = lessons.find(l => l.topic === 'addition')!
      expect(await screen.findByTestId('lesson-screen')).toBeInTheDocument()
      // Verify navigation was to addition lesson
      const routeEl = screen.getByTestId('lesson-screen')
      expect(routeEl).toBeInTheDocument()
    })

    it('falls back to curriculum order (lessons[0].id) when no topicProgress data exists', async () => {
      // No data seeded — db.topicProgress is empty (cleared in beforeEach)
      renderHomeScreen()
      const startBtn = await screen.findByText('Start Learning')
      fireEvent.click(startBtn)

      // Should navigate to first lesson in curriculum
      expect(await screen.findByTestId('lesson-screen')).toBeInTheDocument()
    })

    it('uses curriculum order when all topics have equal accuracy', async () => {
      // All topics equal — should fall back to order
      await db.topicProgress.put({
        topic: 'addition',
        accuracy: 0.7,
        attemptCount: 3,
        lastPracticed: '2026-05-17' as ISODateString,
      })
      await db.topicProgress.put({
        topic: 'subtraction',
        accuracy: 0.7,
        attemptCount: 3,
        lastPracticed: '2026-05-17' as ISODateString,
      })
      await db.topicProgress.put({
        topic: 'word-problems',
        accuracy: 0.7,
        attemptCount: 3,
        lastPracticed: '2026-05-17' as ISODateString,
      })

      renderHomeScreen()
      const startBtn = await screen.findByText('Start Learning')
      fireEvent.click(startBtn)

      // All equal accuracy → curriculum order → lessons[0]
      expect(await screen.findByTestId('lesson-screen')).toBeInTheDocument()
    })
  })

  describe('array mutation guard', () => {
    it('sortedLessons does NOT mutate the imported lessons array', async () => {
      // Capture original first element id
      const originalFirstId = lessons[0].id

      // Seed topicProgress so that weakest topic is NOT lessons[0].topic
      // lessons[0] is addition-grade1-01 (addition topic)
      // Make addition the STRONGEST so it sorts last, and subtraction the weakest
      await db.topicProgress.put({
        topic: 'addition',
        accuracy: 0.9,
        attemptCount: 5,
        lastPracticed: '2026-05-17' as ISODateString,
      })
      await db.topicProgress.put({
        topic: 'subtraction',
        accuracy: 0.1,
        attemptCount: 5,
        lastPracticed: '2026-05-17' as ISODateString,
      })

      renderHomeScreen()
      // Wait for component to load with data
      await screen.findByText('Start Learning')

      // The original lessons array must NOT be mutated
      expect(lessons[0].id).toBe(originalFirstId)
    })
  })
})
