import { TodaySummaryCard } from './TodaySummaryCard'

type TodaySummaryProps = {
  overdueCount: number
  todayCount: number
  upcomingCount: number
  plannedHours: number
  dailyLimitHours?: number
  isFiltered?: boolean
}

function formatHours(
  hours: number,
) {
  if (Number.isInteger(hours)) {
    return String(hours)
  }

  return hours
    .toFixed(2)
    .replace(/\.?0{1,2}$/, '')
}

export function TodaySummary({
  overdueCount,
  todayCount,
  upcomingCount,
  plannedHours,
  dailyLimitHours,
  isFiltered = false,
}: TodaySummaryProps) {
  const availableHours =
    dailyLimitHours !== undefined
      ? Math.max(
          dailyLimitHours -
            plannedHours,
          0,
        )
      : null

  const capacityValue =
    dailyLimitHours !== undefined
      ? `${formatHours(
          plannedHours,
        )} h / ${formatHours(
          dailyLimitHours,
        )} h`
      : `${formatHours(
          plannedHours,
        )} h`

  const capacityDescription =
    isFiltered
      ? `${formatHours(
          plannedHours,
        )} h con estos filtros`
      : availableHours !== null
      ? `${formatHours(
          availableHours,
        )} h disponibles`
      : 'horas planificadas hoy'

  return (
    <>
      <section className="hidden grid-cols-4 gap-5 md:grid">
        <TodaySummaryCard
          title="Vencidas"
          value={overdueCount}
          description={
            overdueCount === 0
              ? isFiltered
                ? 'Sin coincidencias'
                : 'sin pendientes'
              : 'requieren atención'
          }
          tone="danger"
        />

        <TodaySummaryCard
          title="Para hoy"
          value={todayCount}
          description={
            todayCount === 0
              ? isFiltered
                ? 'Sin coincidencias'
                : 'sin tareas'
              : `${formatHours(
                  plannedHours,
                )} h planificadas`
          }
          tone="warning"
        />

        <TodaySummaryCard
          title="Próximas"
          value={upcomingCount}
          description={
            upcomingCount === 0
              ? isFiltered
                ? 'Sin coincidencias'
                : 'sin tareas próximas'
              : 'vencen en 48 h'
          }
          tone="info"
        />

        <TodaySummaryCard
          title="Capacidad de hoy"
          value={capacityValue}
          description={
            capacityDescription
          }
          tone="neutral"
        />
      </section>

      <section className="md:hidden">
        <div className="min-h-[100px] rounded-xl border border-border-subtle bg-white p-4">
          <p className="text-base font-semibold text-[#17212b]">
            {dailyLimitHours !==
            undefined
              ? `${formatHours(
                  plannedHours,
                )} h de ${formatHours(
                  dailyLimitHours,
                )} h planificadas`
              : `${formatHours(
                  plannedHours,
                )} h planificadas`}
          </p>

          <p
            className={[
              'mt-3 text-[13px]',
              availableHours !== null &&
              !isFiltered
                ? 'font-semibold text-[#027a48]'
                : 'text-[#667085]',
            ].join(' ')}
          >
            {availableHours === null &&
            !isFiltered
              ? 'Capacidad diaria pendiente de configuración'
              : capacityDescription}
          </p>
        </div>
      </section>
    </>
  )
}
