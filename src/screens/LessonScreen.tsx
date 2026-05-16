import { useReducer, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import RemyFox from '../components/RemyFox'
import { StepCard } from '../components/StepCard'
import { ConfettiScreen } from '../components/ConfettiScreen'
import { useLessonAudio } from '../hooks/useLessonAudio'
import { lessons } from '../curriculum/index'

type LessonPhase = 'unlock' | 'playing' | 'between-steps' | 'celebration'

interface LessonState {
  phase: LessonPhase
  stepIndex: number
}

type LessonAction =
  | { type: 'UNLOCK' }
  | { type: 'AUDIO_ENDED' }
  | { type: 'ADVANCE'; totalSteps: number }
  | { type: 'REPLAY' }

function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'UNLOCK':
      return { phase: 'playing', stepIndex: 0 }
    case 'AUDIO_ENDED':
      return { ...state, phase: 'between-steps' }
    case 'ADVANCE':
      if (state.stepIndex + 1 >= action.totalSteps) {
        return { phase: 'celebration', stepIndex: state.stepIndex }
      }
      return { phase: 'playing', stepIndex: state.stepIndex + 1 }
    case 'REPLAY':
      return { ...state, phase: 'playing' }
    default:
      return state
  }
}

export default function LessonScreen() {
  const { lessonId } = useParams<{ lessonId?: string }>()
  const lesson = lessons.find(l => l.id === lessonId) ?? lessons[0]
  const steps = lesson.workedExample.steps

  const navigate = useNavigate()
  const [state, dispatch] = useReducer(lessonReducer, { phase: 'unlock', stepIndex: 0 })
  const howls = useLessonAudio(steps, () => dispatch({ type: 'AUDIO_ENDED' }))

  // Ref guards: set to true by handlers that already called play() synchronously,
  // so the useEffect below skips the duplicate play() call.
  // - justUnlockedRef: handleUnlockTap calls howls[0].play() for iOS AudioContext unlock (LESS-04)
  // - justReplayedRef: handleReplay calls howls[N].play() directly; REPLAY dispatch sets phase='playing'
  const justUnlockedRef = useRef(false)
  const justReplayedRef = useRef(false)

  useEffect(() => {
    if (state.phase === 'playing') {
      if (justUnlockedRef.current) {
        // handleUnlockTap already called howls[0].play() synchronously — skip
        justUnlockedRef.current = false
        return
      }
      if (justReplayedRef.current) {
        // handleReplay already called howls[N].play() directly — skip
        justReplayedRef.current = false
        return
      }
      howls[state.stepIndex]?.play()
    }
  }, [state.phase, state.stepIndex, howls])

  // CRITICAL: howls[0].play() MUST be called synchronously inside the onClick handler
  // to unlock the iOS AudioContext before any React state update. dispatch() comes after.
  // (LESS-04, 03-RESEARCH Pattern 1)
  function handleUnlockTap() {
    justUnlockedRef.current = true
    howls[0]?.play()
    dispatch({ type: 'UNLOCK' })
  }

  // LESS-03: stop() then play() on the current step's Howl instance.
  // justReplayedRef prevents the useEffect from playing it a third time.
  function handleReplay() {
    justReplayedRef.current = true
    howls[state.stepIndex]?.stop()
    howls[state.stepIndex]?.play()
    dispatch({ type: 'REPLAY' })
  }

  // --- Unlock screen ---
  if (state.phase === 'unlock') {
    return (
      <div
        className="flex flex-col items-center justify-center gap-8 bg-surface w-full"
        style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)', touchAction: 'manipulation' }}
        onClick={handleUnlockTap}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleUnlockTap() }}
        aria-label="Tap to start lesson"
      >
        <RemyFox className="w-48 h-48" />
        <h1 className="text-3xl font-bold text-on-surface text-center px-6">{lesson.title}</h1>
        <p className="text-xl text-on-surface/60">Tap anywhere to start</p>
      </div>
    )
  }

  // --- Celebration screen ---
  if (state.phase === 'celebration') {
    return <ConfettiScreen onStartPractice={() => navigate(`/practice/${lesson.id}`)} />
  }

  // --- Step screen (playing | between-steps) ---
  const totalSteps = steps.length
  const step = steps[state.stepIndex]

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 bg-surface w-full"
      style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)', paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Dot progress indicator */}
      <div
        className="flex gap-2"
        aria-label={`Step ${state.stepIndex + 1} of ${totalSteps}`}
      >
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: i === state.stepIndex ? '#FF6B35' : 'rgba(255, 107, 53, 0.2)',
            }}
          />
        ))}
      </div>

      {/* StepCard with entrance animation — key on stepIndex forces remount on step change */}
      <div
        key={state.stepIndex}
        style={{
          opacity: 1,
          transform: 'translateX(0)',
          transition: 'opacity 200ms ease-out, transform 200ms ease-out',
        }}
        className="w-full flex justify-center"
      >
        <StepCard
          text={step.text}
          equation={step.equation}
          onReplay={handleReplay}
        />
      </div>

      {/* Next indicator — visible only in between-steps state */}
      {state.phase === 'between-steps' && (
        <button
          className="bg-primary text-white rounded-full min-h-[64px] min-w-[64px] flex items-center justify-center text-2xl font-bold active:opacity-80"
          style={{ touchAction: 'manipulation' }}
          onClick={() => dispatch({ type: 'ADVANCE', totalSteps })}
          aria-label="Next step"
        >
          →
        </button>
      )}
    </div>
  )
}
