export default function PracticeScreen() {
  return (
    <div
      className="w-full flex flex-col items-center justify-center bg-surface text-on-surface gap-6"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <h1 className="text-4xl font-bold">Practice</h1>
      <p className="text-xl font-bold text-on-surface/60">
        Coming soon — practice problems in Phase 4.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="min-h-[120px] min-w-[120px] bg-white rounded-2xl border border-on-surface/10" />
        <div className="min-h-[120px] min-w-[120px] bg-white rounded-2xl border border-on-surface/10" />
        <div className="min-h-[120px] min-w-[120px] bg-white rounded-2xl border border-on-surface/10" />
        <div className="min-h-[120px] min-w-[120px] bg-white rounded-2xl border border-on-surface/10" />
      </div>
    </div>
  )
}
