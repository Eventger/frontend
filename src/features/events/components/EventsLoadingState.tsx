export function EventsLoadingState() {
  return (
    <div
      className="grid gap-5 lg:grid-cols-2"
      aria-label="Cargando eventos"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-[190px] animate-pulse rounded-2xl border border-[#dde2ea] bg-white p-5"
        >
          <div className="h-6 w-1/2 rounded bg-[#eaecf0]" />
          <div className="mt-3 h-4 w-1/4 rounded bg-[#eaecf0]" />

          <div className="mt-8 h-4 w-1/3 rounded bg-[#eaecf0]" />

          <div className="mt-5 h-2 w-full rounded bg-[#eaecf0]" />
        </div>
      ))}
    </div>
  )
}