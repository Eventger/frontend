export function EventDetailLoadingState() {
  return (
    <div
      className="animate-pulse"
      aria-label="Cargando evento"
    >
      <div className="h-9 w-64 rounded bg-[#eaecf0]" />
      <div className="mt-3 h-5 w-80 max-w-full rounded bg-[#eaecf0]" />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="h-[132px] rounded-[14px] bg-white" />
        <div className="h-[132px] rounded-[14px] bg-white" />
      </div>

      <div className="mt-10 h-6 w-36 rounded bg-[#eaecf0]" />

      <div className="mt-5 max-w-[820px] space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[92px] rounded-xl bg-white"
          />
        ))}
      </div>
    </div>
  )
}