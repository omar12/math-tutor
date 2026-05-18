import { useReducer, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ConfettiScreen } from '../components/ConfettiScreen'
import { FeedbackSlot } from '../components/FeedbackSlot'
import { MultipleChoiceWidget } from '../components/MultipleChoiceWidget'
import { DigitGridWidget } from '../components/DigitGridWidget'
import { problems } from '../curriculum/index'
import type { Problem } from '../curriculum/types'

const MAX_DIGITS = 3

type PracticePhase = 'answering' | 'revealing' | 'celebration'

interface PracticeState {
  phase: PracticePhase
  problemIndex: number
  attemptCount: number
  composedDigits: string
  phraseIndex: number
  correctCount: number
  totalCount: number
}

type PracticeAction =
  | { type: 'CORRECT_ANSWER' }
  | { type: 'WRONG_ANSWER' }
  | { type: 'ADVANCE'; totalProblems: number }
  | { type: 'COMPOSE_DIGIT'; digit: string }
  | { type: 'BACKSPACE' }
  | { type: 'BEGIN_REVEAL' }

function practiceReducer(state: PracticeState, action: PracticeAction): PracticeState {
  switch (action.type) {
    case 'CORRECT_ANSWER':
      return { ...state, phase: 'revealing', composedDigits: '', correctCount: state.correctCount + 1, totalCount: state.totalCount + 1 }
    case 'WRONG_ANSWER':
      return { ...state, attemptCount: state.attemptCount + 1, composedDigits: '', phraseIndex: state.phraseIndex + 1 }
    case 'ADVANCE':
      if (state.problemIndex + 1 >= action.totalProblems) {
        return { ...state, phase: 'celebration' }
      }
      return { ...state, phase: 'answering', problemIndex: state.problemIndex + 1, attemptCount: 0, composedDigits: '' }
    case 'COMPOSE_DIGIT':
      if (state.composedDigits.length >= MAX_DIGITS) return state
      return { ...state, composedDigits: state.composedDigits + action.digit }
    case 'BACKSPACE':
      return { ...state, composedDigits: state.composedDigits.slice(0, -1) }
    case 'BEGIN_REVEAL':
      return { ...state, phase: 'revealing', totalCount: state.totalCount + 1 }
    default:
      return state
  }
}

export default function PracticeScreen() {
  const { lessonId } = useParams<{ lessonId?: string }>()
  const navigate = useNavigate()

  const problemPool = useMemo<Problem[]>(() => {
    const pool = problems.filter(p => p.lessonId === lessonId)
    if (pool.length === 0 && import.meta.env.DEV) {
      console.warn('[PracticeScreen] No problems found for lessonId:', lessonId)
    }
    return pool
  }, [lessonId])

  const [state, dispatch] = useReducer(practiceReducer, {
    phase: 'answering',
    problemIndex: 0,
    attemptCount: 0,
    composedDigits: '',
    phraseIndex: 0,
    correctCount: 0,
    totalCount: 0,
  })

  const progressRef = useRef<HTMLDivElement>(null)
  const correctAnswerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentProblem = problemPool[state.problemIndex]

  const shuffledChoices = useMemo(() => {
    if (!currentProblem || currentProblem.type !== 'multiple-choice') return []
    return [...currentProblem.choices].sort(() => Math.random() - 0.5)
  }, [currentProblem?.id])

  function handleCorrectAnswer() {
    if (state.phase !== 'answering') return
    dispatch({ type: 'CORRECT_ANSWER' })
    correctAnswerTimerRef.current = setTimeout(() => {
      dispatch({ type: 'ADVANCE', totalProblems: problemPool.length })
      progressRef.current?.focus()
    }, 200)
  }

  function handleWrongAnswer() {
    if (state.phase !== 'answering') return
    dispatch({ type: 'WRONG_ANSWER' })
    if (state.attemptCount + 1 >= 3) {
      dispatch({ type: 'BEGIN_REVEAL' })
    }
  }

  function handleDigit(digit: string) {
    dispatch({ type: 'COMPOSE_DIGIT', digit })
  }

  function handleBackspace() {
    dispatch({ type: 'BACKSPACE' })
  }

  function handleCheckAnswer() {
    if (state.phase !== 'answering') return
    const isCorrect = Number(state.composedDigits) === currentProblem.answer
    if (isCorrect) {
      handleCorrectAnswer()
    } else {
      handleWrongAnswer()
    }
  }

  // 1.5s reveal timer (for WRONG_ANSWER × 3 → BEGIN_REVEAL path)
  useEffect(() => {
    if (state.phase !== 'revealing') return
    const timer = setTimeout(() => {
      dispatch({ type: 'ADVANCE', totalProblems: problemPool.length })
      progressRef.current?.focus()
    }, 1500)
    return () => clearTimeout(timer)
  }, [state.phase, problemPool.length])

  // Cleanup correct-answer timer on unmount
  useEffect(() => {
    return () => {
      if (correctAnswerTimerRef.current) clearTimeout(correctAnswerTimerRef.current)
    }
  }, [])

  if (problemPool.length === 0) {
    return <ConfettiScreen onStartPractice={() => navigate('/')} />
  }

  if (state.phase === 'celebration') {
    return <ConfettiScreen onStartPractice={() => navigate('/')} buttonLabel="Back to Home" />
  }

  return (
    <div
      className="flex flex-col items-center gap-6 bg-surface w-full"
      style={{ height: '100dvh', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Progress dots */}
      <div
        ref={progressRef}
        tabIndex={-1}
        aria-label={`Problem ${state.problemIndex + 1} of ${problemPool.length}`}
        className="flex gap-2 pt-8"
      >
        {problemPool.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: i === state.problemIndex ? '#FF6B35' : 'rgba(255, 107, 53, 0.2)',
            }}
          />
        ))}
      </div>

      {/* Problem question */}
      <p
        className="text-2xl font-bold text-on-surface text-center px-6"
        style={{ userSelect: 'none' }}
      >
        {currentProblem.question}
      </p>

      {/* Correct-reveal announcement for screen readers — always present so aria-live region is registered */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}
      >
        {state.phase === 'revealing'
          ? `The answer is ${currentProblem.answer}. Moving to the next problem.`
          : ''}
      </div>

      <FeedbackSlot attemptCount={state.attemptCount} phraseIndex={state.phraseIndex} />

      {/* Input widget */}
      {currentProblem.type === 'multiple-choice' ? (
        <MultipleChoiceWidget
          choices={shuffledChoices}
          correctAnswer={currentProblem.answer}
          phase={state.phase === 'celebration' ? 'answering' : state.phase}
          onSubmit={choice => {
            if (choice === currentProblem.answer) {
              handleCorrectAnswer()
            } else {
              handleWrongAnswer()
            }
          }}
        />
      ) : (
        <DigitGridWidget
          composedDigits={state.composedDigits}
          correctAnswer={currentProblem.answer}
          phase={state.phase === 'celebration' ? 'answering' : state.phase}
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onSubmit={handleCheckAnswer}
        />
      )}
    </div>
  )
}

// TODO Phase 5: add hint field to BaseProblem and curriculum.json for per-problem hints
