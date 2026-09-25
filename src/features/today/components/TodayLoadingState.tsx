import {
  Skeleton,
} from '@/components/ui/skeleton'

export function TodayLoadingState() {
  return (
    <div
      aria-label="Cargando prioridades de hoy"
      className="space-y-8"
    >
      <div className="grid gap-5 md:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-[112px] rounded-[14px]"
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,790px)_228px]">
        <div className="space-y-8">
          {Array.from({
            length: 3,
          }).map((_, section) => (
            <div
              key={section}
              className="space-y-3"
            >
              <Skeleton className="h-6 w-52" />

              <Skeleton className="h-[84px] rounded-[12px]" />

              {section === 1 && (
                <Skeleton className="h-[84px] rounded-[12px]" />
              )}
            </div>
          ))}
        </div>

        <Skeleton className="hidden h-[370px] rounded-[14px] lg:block" />
      </div>
    </div>
  )
}