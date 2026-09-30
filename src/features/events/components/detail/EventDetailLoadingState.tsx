export function EventDetailLoadingState() {
  return (
    <div
      className="animate-pulse"
      role="status"
      aria-label="Cargando evento"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="h-9 w-64 max-w-[55%] rounded bg-[#eaecf0]" />

        <div className="hidden gap-4 sm:flex">
          <div className="h-11 w-[138px] rounded-[10px] bg-[#eaecf0]" />
          <div className="h-11 w-[118px] rounded-[10px] bg-[#eaecf0]" />
        </div>
      </div>

      <div className="mt-8 h-[420px] rounded-[14px] border border-[#d9dee7] bg-white sm:h-[330px] lg:h-[300px]" />

      <div className="mt-7 flex min-h-12 items-start justify-between gap-5">
        <div>
          <div className="h-6 w-36 rounded bg-[#eaecf0]" />
          <div className="mt-2 h-4 w-56 max-w-full rounded bg-[#eaecf0]" />
        </div>

        <div className="hidden h-11 w-[207px] rounded-[10px] bg-[#eaecf0] sm:block" />
      </div>

      <div className="mt-2.5 space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[86px] rounded-[11px] border border-[#d9dee7] bg-white sm:h-[61px]"
          />
        ))}
      </div>
    </div>
  )
}
