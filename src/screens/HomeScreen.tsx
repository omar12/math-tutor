import { useNavigate } from 'react-router'
import { useEffect } from 'react'
import RemyFox from '../components/RemyFox'
import { db } from '../db/db'

export default function HomeScreen() {
  const navigate = useNavigate()

  // PLAT-04: Persistence proof — write test record on mount
  useEffect(() => {
    db.appConfig.put({ key: 'onboardingComplete', value: 'false' })
  }, [])

  return (
    <div
      className="flex flex-col items-center justify-center h-full bg-surface gap-8 px-6"
      style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <RemyFox className="w-48 h-48" />
      <h1 className="text-4xl font-extrabold text-on-surface text-center">
        Math Time!
      </h1>
      {/* Primary CTA — large touch target (D-12) */}
      <button
        onClick={() => navigate('/lesson')}
        className="bg-primary text-white text-2xl font-bold rounded-3xl px-10 py-5 min-h-[64px] min-w-[200px] active:opacity-80"
        style={{ touchAction: 'manipulation' }}
      >
        Start Learning
      </button>
      {/* Parent access — unobtrusive (D-03), still meets 44px minimum */}
      <button
        onClick={() => navigate('/parent')}
        className="text-sm text-on-surface/40 underline min-h-[44px] min-w-[44px]"
        style={{ touchAction: 'manipulation' }}
      >
        Parent
      </button>
    </div>
  )
}
