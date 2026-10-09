export function EventDetailLoadingState() {
  return (
    <div
      className="animate-pulse"
      role="status"
      aria-label="Cargando evento"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="h-9 w-64 max-w-[55%] rounded bg-[#eaecf0]" />

        <div className="flex gap-4">
          <div className="h-11 w-[138px] rounded-lg bg-[#eaecf0]" />
          <div className="h-11 w-[118px] rounded-lg bg-[#eaecf0]" />
        </div>
      </div>

      <div className="mt-8 min-h-[420px] rounded-xl border border-border-subtle bg-white sm:min-h-[330px] lg:min-h-[300px]" />

      <div className="mt-7 flex min-h-12 items-start justify-between gap-5">
        <div>
          <div className="h-6 w-36 rounded bg-[#eaecf0]" />
          <div className="mt-2 h-4 w-56 max-w-full rounded bg-[#eaecf0]" />
        </div>

        <div className="hidden h-11 w-[207px] rounded-lg bg-[#eaecf0] sm:block" />
      </div>

      <div className="mt-2.5 space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="min-h-[86px] rounded-lg border border-border-subtle bg-white sm:min-h-[61px]"
          />
        ))}
      </div>
    </div>
  )
}
