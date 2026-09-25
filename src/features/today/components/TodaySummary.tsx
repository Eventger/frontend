import { TodaySummaryCard } from './TodaySummaryCard'

type TodaySummaryProps = {
  overdueCount: number
  todayCount: number
  upcomingCount: number
  plannedHours: number
  dailyLimitHours?: number
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
    availableHours !== null
      ? `${formatHours(
          availableHours,
        )} h disponibles`
      : 'horas planificadas hoy'

  return (
    <>
      {/* Desktop */}
      <section className="hidden grid-cols-4 gap-5 md:grid">
        <TodaySummaryCard
          title="Vencidas"
          value={overdueCount}
          description="requieren atención"
          tone="danger"
        />

        <TodaySummaryCard
          title="Para hoy"
          value={todayCount}
          description={`${formatHours(
            plannedHours,
          )} h planificadas`}
          tone="warning"
        />

        <TodaySummaryCard
          title="Próximas"
          value={upcomingCount}
          description="vencen pronto"
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

      {/* Mobile según Figma */}
      <section className="md:hidden">
        <div className="rounded-[14px] border border-[#dde2ea] bg-white p-4">
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

          <p className="mt-3 text-[13px] font-semibold text-[#027a48]">
            {availableHours !== null
              ? `${formatHours(
                  availableHours,
                )} h disponibles`
              : 'Capacidad diaria pendiente de configuración'}
          </p>
        </div>
      </section>
    </>
  )
}
