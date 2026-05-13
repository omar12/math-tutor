export default function ParentScreen() {
  return (
    <div
      className="w-full flex flex-col items-center justify-center bg-surface text-on-surface gap-4"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <h1 className="text-4xl font-bold">Parent View</h1>
      <p className="text-lg text-on-surface">Progress data will appear here.</p>
      <p className="text-base text-on-surface/40">Coming in Phase 5.</p>
    </div>
  )
}
