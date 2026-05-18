import { useNavigate } from 'react-router'
import { useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import RemyFox from '../components/RemyFox'
import { db } from '../db/db'
import type { TopicProgress } from '../db/db'
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

export default function HomeScreen() {
  const navigate = useNavigate()
  const topicProgress = useLiveQuery(() => db.topicProgress.toArray())

  // PLAT-04: Persistence proof — write test record on mount
  useEffect(() => {
    db.appConfig.put({ key: 'onboardingComplete', value: 'false' })
  }, [])

  // Memoized adaptive lesson ordering — only recomputed when topicProgress changes
  const orderedLessons = useMemo(
    () => sortedLessons(lessons, topicProgress ?? []),
    [topicProgress]
  )

  // While Dexie query is loading, show a minimal loading state
  if (topicProgress === undefined) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full bg-surface gap-8 px-6"
        style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
      />
    )
  }

  const targetLesson = orderedLessons[0]

  return (
    <div
      className="relative flex flex-col items-center justify-center h-full bg-surface gap-8 px-6"
      style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
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

      <RemyFox className="w-48 h-48" />
      <h1 className="text-4xl font-extrabold text-on-surface text-center">
        Math Time!
      </h1>
      {/* Primary CTA — large touch target (D-12) */}
      <button
        onClick={() => navigate(`/lesson/${targetLesson.id}`)}
        className="bg-primary text-white text-2xl font-bold rounded-3xl px-10 py-5 min-h-[64px] min-w-[200px] active:opacity-80"
        style={{ touchAction: 'manipulation' }}
      >
        Start Learning
      </button>
    </div>
  )
}
