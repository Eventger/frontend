type TodayEmptyStateProps = {
  onViewUpcoming: () => void
  onCreateEvent: () => void
}

export function TodayEmptyState({
  onViewUpcoming,
  onCreateEvent,
}: TodayEmptyStateProps) {
  return (
    <section className="mx-auto flex min-h-[400px] w-full max-w-[780px] flex-col items-center rounded-[12px] border border-[#dde2ea] bg-white px-6 pb-8 pt-[53px] text-center">
      <div className="flex h-[56px] items-center justify-center text-[52px] font-bold leading-none text-[#027a48]">
        ✓
      </div>

      <h2 className="mt-[30px] text-[24px] font-bold leading-[29px] text-[#17212b]">
        No tienes gestiones pendientes para hoy
      </h2>

      <p className="mt-4 min-h-[60px] max-w-[540px] text-[15px] leading-5 text-[#667085]">
        Buen trabajo. Puedes revisar próximas tareas o avanzar en otro evento.
      </p>

      <div className="mt-[30px] flex w-full flex-col justify-center gap-3 sm:flex-row sm:gap-5">
        <button
          type="button"
          onClick={onViewUpcoming}
          className="h-11 w-full rounded-[10px] bg-[#eef2ff] px-4 text-[14px] font-semibold text-[#4f46e5] transition-colors hover:bg-[#e0e7ff] sm:w-[190px]"
        >
          Ver próximos días
        </button>

        <button
          type="button"
          onClick={onCreateEvent}
          className="h-11 w-full rounded-[10px] bg-[#4f46e5] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#4338ca] sm:w-[170px]"
        >
          + Crear evento
        </button>
      </div>
    </section>
  )
}
