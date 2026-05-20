import { useNavigate } from 'react-router'
import { useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import RemyFox from '../components/RemyFox'
import { db } from '../db/db'
import type { TopicProgress } from '../db/db'
import type { Topic } from '../curriculum/types'
import { lessons } from '../curriculum/index'

/**
 * Pure function — sorts a spread copy of allLessons by topic accuracy (lowest first).
 * Never mutates allLessons. Topics not in progress are treated as accuracy=1.0
 * (not struggling → fall to the end). Ties broken by lesson.order ascending.
 */
export function sortedLessons(
  allLessons: typeof lessons,
  progress: TopicProgress[]
): typeof lessons {
  const accuracyMap = new Map(progress.map(p => [p.topic, p.accuracy]))
  return [...allLessons].sort((a, b) => {
    const accA = accuracyMap.has(a.topic) ? (accuracyMap.get(a.topic) ?? 1.0) : 1.0
    const accB = accuracyMap.has(b.topic) ? (accuracyMap.get(b.topic) ?? 1.0) : 1.0
    if (accA !== accB) return accA - accB // lower accuracy first
    return a.order - b.order // tie-break by curriculum order
  })
}

const TOPICS: Array<{ key: Topic; label: string }> = [
  { key: 'addition', label: 'Addition' },
  { key: 'subtraction', label: 'Subtraction' },
  { key: 'word-problems', label: 'Word Problems' },
]

export default function HomeScreen() {
  const navigate = useNavigate()
  const topicProgress = useLiveQuery(() => db.topicProgress.toArray())
  const sessions = useLiveQuery(() => db.sessions.toArray())

  // PLAT-04: Persistence proof — write test record on mount
  useEffect(() => {
    db.appConfig.put({ key: 'onboardingComplete', value: 'false' })
  }, [])

  // Set of completed lesson IDs (has at least one session)
  const completedIds = useMemo(
    () => new Set((sessions ?? []).map(s => s.lessonId)),
    [sessions]
  )

  // Map of topic -> accuracy for quick dot color lookup
  const accuracyMap = useMemo(
    () => new Map((topicProgress ?? []).map(p => [p.topic, p.accuracy])),
    [topicProgress]
  )

  // Weakest topic: TOPICS order for tie-break (addition beats subtraction beats word-problems)
  const weakestTopic = useMemo((): Topic | null => {
    if (!topicProgress || topicProgress.length === 0) return null
    let weakest: Topic | null = null
    let lowestAcc = Infinity
    for (const { key } of TOPICS) {
      const acc = accuracyMap.get(key)
      if (acc !== undefined && acc < lowestAcc) {
        lowestAcc = acc
        weakest = key
      }
    }
    return weakest
  }, [topicProgress, accuracyMap])

  // Dual loading guard — wait for both Dexie queries to resolve
  if (sessions === undefined || topicProgress === undefined) {
    return <div style={{ height: '100dvh' }} className="bg-surface" />
  }

  return (
    <div
      className="relative flex flex-col bg-surface"
      style={{ height: '100dvh' }}
    >
      {/* Lock icon — subtle parent access, top-right corner */}
      <button
        className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface/30 active:text-on-surface/60"
        style={{ touchAction: 'manipulation' }}
        aria-label="Parent access"
        onClick={() => navigate('/pin')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </button>

      {/* Header zone — shrinks so catalog gets remaining space */}
      <div className="flex flex-col items-center px-6 pt-6 pb-4 gap-3 shrink-0">
        <RemyFox className="w-32 h-32" />
        <h1 className="text-4xl font-extrabold text-on-surface text-center">
          Math Time!
        </h1>
      </div>

      {/* Scrollable lesson catalog */}
      <div
        className="flex-1 overflow-y-auto px-6"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TOPICS.map(({ key, label }) => {
          const topicLessons = lessons
            .filter(l => l.topic === key)
            .sort((a, b) => a.grade !== b.grade ? a.grade - b.grade : a.order - b.order)
          const isWeakest = weakestTopic === key
          const acc = accuracyMap.get(key)
          const dotColor =
            acc === undefined
              ? 'bg-on-surface/20'
              : acc >= 0.7
              ? 'bg-success'
              : 'bg-accent'

          return (
            <section key={key} className="mb-6">
              {/* Section header */}
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-2xl font-bold text-on-surface">{label}</h2>
                {isWeakest && (
                  <span className="text-sm font-semibold bg-accent/20 text-accent px-3 py-1 rounded-full">
                    Needs practice
                  </span>
                )}
              </div>

              {/* Lesson cards */}
              <div className="flex flex-col gap-2">
                {topicLessons.map(lesson => {
                  const isCompleted = completedIds.has(lesson.id)
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigate('/lesson/' + lesson.id)}
                      className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 min-h-[44px] shadow-sm active:opacity-80"
                      style={{ touchAction: 'manipulation' }}
                      aria-label={isCompleted ? lesson.title + ', completed' : lesson.title}
                    >
                      {/* Completion ring */}
                      <span
                        className={
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ' +
                          (isCompleted ? 'border-success bg-success' : 'border-on-surface/20')
                        }
                      >
                        {isCompleted && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>

                      {/* Lesson title */}
                      <span className="flex-1 text-left text-base font-semibold text-on-surface">
                        {lesson.title}
                      </span>

                      {/* Accuracy dot */}
                      <span
                        data-testid="accuracy-dot"
                        className={'w-3 h-3 rounded-full shrink-0 ' + dotColor}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
