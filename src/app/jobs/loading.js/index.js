export default function Loading() {
  // Route-level loading UI to avoid white flash
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6 animate-pulse">
        <div className="h-10 w-56 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 shadow-sm p-4 rounded-lg">
                <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-100 rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-4 hidden lg:block">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-6 w-full bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
