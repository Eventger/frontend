type TodayEmptyStateProps = {
  onCreateEvent: () => void
}

export function TodayEmptyState({
  onCreateEvent,
}: TodayEmptyStateProps) {
  return (
    <section className="flex min-h-[340px] w-full max-w-[790px] flex-col items-center justify-center rounded-[12px] border border-[#dde2ea] bg-white px-6 text-center">
      <div className="flex h-[56px] items-center justify-center text-[42px] font-bold leading-none text-[#027a48]">
        ✓
      </div>

      <h2 className="mt-6 text-[24px] font-semibold leading-[29px] text-[#17212b]">
        Hoy no tienes subtareas
      </h2>

      <p className="mt-4 max-w-[550px] text-[14px] leading-5 text-[#667085]">
        No tienes subtareas pendientes para hoy. ¿Quieres crear una actividad?
      </p>

      <button
        type="button"
        onClick={onCreateEvent}
        className="mt-[50px] h-11 w-[150px] rounded-[8px] border border-[#dde2ea] bg-white text-[13px] font-semibold text-[#17212b] transition-colors hover:bg-[#f9fafb]"
      >
        Crear actividad
      </button>
    </section>
  )
}