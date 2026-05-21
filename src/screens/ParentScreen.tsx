import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router'
import { db } from '../db/db'
import { ProgressBar } from '../components/ProgressBar'
import type { Topic } from '../curriculum/types'

const TOPICS: Array<{ key: Topic; label: string }> = [
  { key: 'addition', label: 'Addition' },
  { key: 'subtraction', label: 'Subtraction' },
  { key: 'word-problems', label: 'Word Problems' },
]

export default function ParentScreen() {
  const navigate = useNavigate()
  const progress = useLiveQuery(() => db.topicProgress.toArray())

  if (progress === undefined) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center bg-surface text-on-surface"
        style={{
          height: '100dvh',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <p className="text-lg text-on-surface/40">Loading…</p>
      </div>
    )
  }

  const hasAnyData = progress.length > 0

  const topicBars = TOPICS.map(({ key, label }) => {
    const found = progress.find(p => p.topic === key)
    return (
      <ProgressBar
        key={key}
        label={label}
        accuracy={found?.accuracy ?? 0}
        hasData={Boolean(found)}
      />
    )
  })

  return (
    <div
      className="w-full flex flex-col items-center bg-surface text-on-surface px-6 py-8 gap-6"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <h1 className="text-4xl font-bold text-on-surface">Parent Dashboard</h1>

      {!hasAnyData ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-xl text-center text-on-surface/60 max-w-sm">
            No practice sessions yet. Come back after your child completes a lesson!
          </p>
          <div className="w-full max-w-sm flex flex-col gap-4 mt-4">
            {topicBars}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-6 flex-1">
          {topicBars}
        </div>
      )}

      <button
        className="bg-accent text-white text-xl font-bold rounded-3xl px-10 py-4 min-h-[56px]"
        style={{ touchAction: 'manipulation' }}
        onClick={() => navigate('/')}
      >
        Done
      </button>
    </div>
  )
}
