import { useReducer, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ConfettiScreen } from '../components/ConfettiScreen'
import { FeedbackSlot } from '../components/FeedbackSlot'
import { MultipleChoiceWidget } from '../components/MultipleChoiceWidget'
import { DigitGridWidget } from '../components/DigitGridWidget'
import { lessons, problems } from '../curriculum/index'
import type { Problem, Topic } from '../curriculum/types'
import { db, toISODateString } from '../db/db'

const MAX_DIGITS = 3

/**
 * Records a completed practice session to IndexedDB and immediately upserts
 * TopicProgress by aggregating all sessions for the topic. Both writes are
 * wrapped in a single Dexie transaction — atomically succeeds or fails together.
 *
 * Exported for testing. Do not call directly outside PracticeScreen.
 */
export async function recordSessionAndUpdateProgress(
  lessonId: string,
  topic: Topic,
  grade: 1 | 2 | 3,
  correctCount: number,
  totalCount: number
): Promise<void> {
  // D-11: Guard — do not write if no problems were answered
  if (totalCount === 0) return

  await db.transaction('rw', [db.sessions, db.topicProgress], async () => {
    // D-12: Write the session record
    await db.sessions.add({
      lessonId,
      topic,
      grade,
      date: toISODateString(new Date()),
      correctCount,
      totalCount,
    })

    // D-13, D-17: Pure aggregate — re-aggregate from all sessions for this topic
    const allSessionsForTopic = await db.sessions
      .where('topic')
      .equals(topic)
      .toArray()

    const totalCorrect = allSessionsForTopic.reduce((sum, s) => sum + s.correctCount, 0)
    const totalAnswered = allSessionsForTopic.reduce((sum, s) => sum + s.totalCount, 0)
    const accuracy = totalAnswered > 0 ? totalCorrect / totalAnswered : 0

    // D-13: Upsert TopicProgress (put() = insert or overwrite by primary key)
    await db.topicProgress.put({
      topic,
      accuracy,
      attemptCount: allSessionsForTopic.length,
      lastPracticed: toISODateString(new Date()),
    })
  })
}

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

  // Resolve lesson metadata (topic, grade) for session write
  const currentLesson = lessons.find(l => l.id === lessonId)

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
  // T-5-P04: hasRecorded guard — prevents duplicate session writes on React re-renders
  // during the celebration phase.
  const hasRecorded = useRef(false)

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

  // D-11, D-12, D-13: Write Session + upsert TopicProgress when celebration is reached.
  // hasRecorded ref prevents duplicate writes if React re-renders during celebration.
  // .catch ensures celebration renders even if the DB write fails (T-5-P03).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.phase !== 'celebration' || !currentLesson || hasRecorded.current) return
    hasRecorded.current = true
    recordSessionAndUpdateProgress(
      lessonId!,
      currentLesson.topic,
      currentLesson.grade,
      state.correctCount,
      state.totalCount
    ).catch(err => {
      console.error('[PracticeScreen] session write failed', err)
    })
    return () => {
      hasRecorded.current = false
    }
  }, [state.phase]) // eslint-disable-line react-hooks/exhaustive-deps

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
