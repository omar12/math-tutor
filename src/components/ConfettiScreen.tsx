interface ConfettiScreenProps {
  onStartPractice: () => void
  buttonLabel?: string
}

const CONFETTI_COLORS = ['#FF6B35', '#FFD23F', '#3B82F6', '#22C55E', '#FF4757'] as const
const PIECE_COUNT = 40

const pieces = Array.from({ length: PIECE_COUNT }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${(i * 2.5 + Math.floor(i / 5) * 3) % 100}%`,
  delay: `${(i * 0.07) % 1.5}s`,
  size: i % 3 === 0 ? 10 : 8,
}))

export function ConfettiScreen({ onStartPractice, buttonLabel }: ConfettiScreenProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-8 bg-surface"
      style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)', position: 'relative', overflow: 'hidden' }}
    >
      <div aria-hidden="true">
        {pieces.map(p => (
          <div
            key={p.id}
            className="confetti-piece"
            style={{ left: p.left, width: p.size, height: p.size, backgroundColor: p.color, animationDelay: p.delay }}
          />
        ))}
      </div>
      <h1 className="text-3xl font-bold text-on-surface relative">You did it!</h1>
      <button
        className="bg-accent text-white text-xl font-bold rounded-3xl px-10 py-5 min-h-[64px] min-w-[200px] active:opacity-80 relative"
        style={{ touchAction: 'manipulation' }}
        aria-label={buttonLabel ?? 'Start Practice'}
        onClick={onStartPractice}
      >
        {buttonLabel ?? 'Start Practice'}
      </button>
    </div>
  )
}
