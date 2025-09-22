export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative min-h-[40vh] w-full flex items-center justify-center overflow-hidden rounded-lg py-16">
        <div className="relative z-20 p-4 max-w-4xl mx-auto w-full">
          <div className="w-full max-w-2xl mx-auto text-left px-4">
            <div className="h-10 w-64 bg-gray-200 rounded mb-3 animate-pulse" />
            <div className="h-7 w-80 bg-gray-100 rounded animate-pulse" />
            <div className="mt-6 flex w-full space-x-3">
              <div className="flex-1 h-14 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-14 w-14 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 lg:gap-8">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 shadow-sm p-4 rounded-lg">
                <div className="h-5 w-2/3 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-100 rounded mb-3 animate-pulse" />
                <div className="h-4 w-full bg-gray-50 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="hidden lg:block space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-6 w-full bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
