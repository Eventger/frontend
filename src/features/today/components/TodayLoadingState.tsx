import {
  Skeleton,
} from '@/components/ui/skeleton'

export function TodayLoadingState() {
  return (
    <div
      role="status"
      aria-label="Cargando prioridades de hoy"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mt-6 hidden grid-cols-4 gap-5 md:grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[148px] rounded-xl" />
        ))}
      </div>

      <div className="mt-6 md:hidden">
        <Skeleton className="h-[100px] w-full rounded-xl" />
      </div>

      <div className="mt-4">
        <Skeleton className="h-[44px] w-full max-w-[500px] rounded-lg" />
      </div>

      <div className="mt-6 space-y-8">
        {Array.from({ length: 3 }).map((_, section) => (
          <div key={section} className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-[104px] w-full rounded-xl sm:h-[60px]" />
            {section === 1 && <Skeleton className="h-[104px] w-full rounded-xl sm:h-[60px]" />}
          </div>
        ))}
      </div>
    </div>
  )
}
