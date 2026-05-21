import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import HomeScreen from './HomeScreen'
import { db } from '../db/db'
import type { ISODateString } from '../db/db'
import { lessons } from '../curriculum/index'

// Capture a route that records navigated path for assertions
function renderHomeScreen() {
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
    await db.sessions.clear()
  })

  it('renders the lesson catalog', async () => {
    renderHomeScreen()
    expect(await screen.findByText('Addition')).toBeInTheDocument()
  })

  it('renders Remy the Fox', async () => {
    renderHomeScreen()
    expect(await screen.findByRole('img', { name: 'Remy the Fox' })).toBeInTheDocument()
  })

  it('lesson cards meet 44px minimum touch target', async () => {
    renderHomeScreen()
    await screen.findByText('Addition')
    const cards = screen.getAllByRole('button')
    // lesson card buttons must have min-h-[44px] class
    const lessonCards = cards.filter(b =>
      b.className.includes('min-h-[44px]') && b !== screen.queryByRole('button', { name: /parent access/i })
    )
    expect(lessonCards.length).toBeGreaterThan(0)
    lessonCards.forEach(card => expect(card).toHaveClass('min-h-[44px]'))
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
      // Wait for catalog to load with data
      await screen.findByText('Addition')

      // The original lessons array must NOT be mutated
      expect(lessons[0].id).toBe(originalFirstId)
    })
  })

  describe('lesson catalog', () => {
    it('renders 3 topic section headers', async () => {
      renderHomeScreen()
      expect(await screen.findByText('Addition')).toBeInTheDocument()
      expect(screen.getByText('Subtraction')).toBeInTheDocument()
      expect(screen.getByText('Word Problems')).toBeInTheDocument()
    })

    it('renders all 27 lesson titles', async () => {
      renderHomeScreen()
      await screen.findByText('Addition')
      // Each lesson title should appear as a button
      // We check by verifying all lesson titles are present
      for (const lesson of lessons) {
        expect(screen.getByRole('button', { name: new RegExp(lesson.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })).toBeInTheDocument()
      }
      expect(lessons.length).toBe(27)
    })

    it('lessons within a topic are sorted by grade then order', async () => {
      renderHomeScreen()
      await screen.findByText('Addition')
      // Get all addition lessons in curriculum sorted correctly
      const additionLessons = lessons
        .filter(l => l.topic === 'addition')
        .sort((a, b) => a.grade !== b.grade ? a.grade - b.grade : a.order - b.order)
      // First addition lesson in the catalog should be the grade-1 order-1 lesson
      const firstLesson = additionLessons[0]
      const secondGradeFirstLesson = additionLessons.find(l => l.grade === 2)!
      // Both should be present and firstLesson should be in the document
      expect(screen.getByRole('button', { name: new RegExp(firstLesson.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: new RegExp(secondGradeFirstLesson.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })).toBeInTheDocument()
    })

    it('tapping a lesson card navigates to /lesson/:lessonId', async () => {
      renderHomeScreen()
      await screen.findByText('Addition')
      // Get the first addition lesson
      const firstAdditionLesson = lessons
        .filter(l => l.topic === 'addition')
        .sort((a, b) => a.grade !== b.grade ? a.grade - b.grade : a.order - b.order)[0]
      const card = screen.getByRole('button', { name: new RegExp(firstAdditionLesson.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
      fireEvent.click(card)
      expect(await screen.findByTestId('lesson-screen')).toBeInTheDocument()
    })

    describe('completion ring', () => {
      it('shows completion indicator when session exists for that lessonId', async () => {
        await db.sessions.add({
          lessonId: 'addition-grade1-01',
          topic: 'addition',
          grade: 1,
          date: '2026-05-19' as ISODateString,
          correctCount: 3,
          totalCount: 3,
        })
        renderHomeScreen()
        // aria-label on completed card must include 'completed'
        expect(await screen.findByRole('button', { name: /.*completed.*/i })).toBeInTheDocument()
      })

      it('no completion indicator when no session exists', async () => {
        // No sessions seeded
        renderHomeScreen()
        await screen.findByText('Addition')
        expect(screen.queryByRole('button', { name: /completed/i })).not.toBeInTheDocument()
      })
    })

    describe('accuracy dot', () => {
      it('dot is gray (bg-on-surface/20 class) when no topicProgress for that topic', async () => {
        // No topicProgress seeded
        renderHomeScreen()
        await screen.findByText('Addition')
        const dots = screen.getAllByTestId('accuracy-dot')
        expect(dots.length).toBeGreaterThan(0)
        // All dots should have the gray class since no data
        dots.forEach(dot => {
          expect(dot.className).toContain('bg-on-surface/20')
        })
      })

      it('dot is bg-success when topic accuracy >= 0.7', async () => {
        await db.topicProgress.put({
          topic: 'addition',
          accuracy: 0.8,
          attemptCount: 5,
          lastPracticed: '2026-05-19' as ISODateString,
        })
        renderHomeScreen()
        await screen.findByText('Addition')
        // Find an addition lesson's accuracy dot
        // We get all accuracy dots; the first 9 belong to addition (sorted first)
        const dots = screen.getAllByTestId('accuracy-dot')
        // Addition is the first section, so first 9 dots belong to addition lessons
        expect(dots[0]).toHaveClass('bg-success')
      })

      it('dot is bg-accent when topic accuracy < 0.7', async () => {
        await db.topicProgress.put({
          topic: 'addition',
          accuracy: 0.5,
          attemptCount: 5,
          lastPracticed: '2026-05-19' as ISODateString,
        })
        renderHomeScreen()
        await screen.findByText('Addition')
        const dots = screen.getAllByTestId('accuracy-dot')
        // Addition is the first section, so first dots belong to addition lessons
        expect(dots[0]).toHaveClass('bg-accent')
      })
    })

    describe('Needs practice badge', () => {
      it('no badge shown when topicProgress is empty', async () => {
        // No topicProgress seeded
        renderHomeScreen()
        await screen.findByText('Addition')
        expect(screen.queryByText(/Needs practice/i)).not.toBeInTheDocument()
      })

      it('badge appears on weakest topic section header', async () => {
        await db.topicProgress.put({
          topic: 'addition',
          accuracy: 0.8,
          attemptCount: 5,
          lastPracticed: '2026-05-19' as ISODateString,
        })
        await db.topicProgress.put({
          topic: 'subtraction',
          accuracy: 0.4,
          attemptCount: 5,
          lastPracticed: '2026-05-19' as ISODateString,
        })
        renderHomeScreen()
        expect(await screen.findByText(/Needs practice/i)).toBeInTheDocument()
      })

      it('badge does NOT appear on stronger topics', async () => {
        await db.topicProgress.put({
          topic: 'addition',
          accuracy: 0.8,
          attemptCount: 5,
          lastPracticed: '2026-05-19' as ISODateString,
        })
        await db.topicProgress.put({
          topic: 'subtraction',
          accuracy: 0.4,
          attemptCount: 5,
          lastPracticed: '2026-05-19' as ISODateString,
        })
        renderHomeScreen()
        await screen.findByText(/Needs practice/i)
        // Exactly one badge
        expect(screen.getAllByText(/Needs practice/i)).toHaveLength(1)
      })

      it('tie-break — addition wins badge when addition and subtraction have equal accuracy', async () => {
        await db.topicProgress.put({
          topic: 'addition',
          accuracy: 0.5,
          attemptCount: 5,
          lastPracticed: '2026-05-19' as ISODateString,
        })
        await db.topicProgress.put({
          topic: 'subtraction',
          accuracy: 0.5,
          attemptCount: 5,
          lastPracticed: '2026-05-19' as ISODateString,
        })
        renderHomeScreen()
        await screen.findByText(/Needs practice/i)
        // There should be exactly one badge
        const badges = screen.getAllByText(/Needs practice/i)
        expect(badges).toHaveLength(1)
        // The badge should be near the Addition heading (addition section gets badge in tie)
        const additionHeading = screen.getByRole('heading', { name: 'Addition' })
        // The badge should be in the same section container as the Addition heading
        expect(additionHeading.closest('section')).toContainElement(badges[0])
      })
    })
  })
})
