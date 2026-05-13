export default function LessonScreen() {
  return (
    <div
      className="w-full flex flex-col items-center justify-center bg-surface text-on-surface gap-6"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <h1 className="text-4xl font-bold">Lesson</h1>
      <p className="text-xl font-bold text-on-surface/60">
        Coming soon — real lessons in Phase 2.
      </p>
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <p className="text-4xl font-bold text-center text-on-surface">3 + 4 = ?</p>
      </div>
    </div>
  )
}
