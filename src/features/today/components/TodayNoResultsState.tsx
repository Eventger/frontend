type TodayNoResultsStateProps = {
  eventName?: string
  stateLabel?: string
  onClearFilters: () => void
}

export function TodayNoResultsState({
  eventName,
  stateLabel,
  onClearFilters,
}: TodayNoResultsStateProps) {
  const description =
    eventName && stateLabel
      ? `No encontramos subtareas de ${eventName} con estado ${stateLabel}. Ajusta los filtros o límpialos para volver a ver todas las subtareas.`
      : 'No encontramos subtareas que coincidan con los filtros aplicados. Ajusta los filtros o límpialos para volver a ver todas las subtareas.'

  return (
    <section className="flex min-h-[250px] flex-col items-center justify-center rounded-[12px] border border-[#dde2ea] bg-white px-6 text-center">
      <h2 className="text-[24px] font-semibold text-[#17212b]">
        No hay subtareas para estos filtros
      </h2>

      <p className="mt-4 max-w-[680px] text-[14px] leading-5 text-[#667085]">
        {description}
      </p>

      <button
        type="button"
        onClick={
          onClearFilters
        }
        className="mt-6 h-11 w-[190px] rounded-[8px] bg-[#4f46e5] text-[13px] font-semibold text-white hover:bg-[#4338ca]"
      >
        Limpiar filtros
      </button>
    </section>
  )
}