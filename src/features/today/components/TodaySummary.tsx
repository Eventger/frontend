import { Button } from '@/components/ui/button'
import { Clock, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TodaySummaryCard } from './TodaySummaryCard'
import { AvailabilityInfo } from './AvailabilityInfo'

type TodaySummaryProps = {
  overdueCount: number
  todayCount: number
  upcomingCount: number
  plannedHours: number
  dailyLimitHours?: number
  isFiltered?: boolean
  onEditDailyLimit?: () => void
}

function formatHours(hours: number) {
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
  onEditDailyLimit,
}: TodaySummaryProps) {
  const availableHours =
    dailyLimitHours !== undefined
      ? Math.max(dailyLimitHours - plannedHours, 0)
      : null

  const displayHoursValue =
    dailyLimitHours !== undefined
      ? `${formatHours(dailyLimitHours)} h/día`
      : 'Pendiente'

  return (
    <>
      <section className="hidden grid-cols-4 auto-rows-fr gap-4 sm:gap-5 md:grid" aria-label="Resumen de actividades y disponibilidad">
        <TodaySummaryCard
          title="Vencidas"
          value={overdueCount}
          description={
            overdueCount === 0
              ? isFiltered
                ? 'Sin coincidencias'
                : 'Sin pendientes'
              : 'Requieren atención'
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
                : 'Sin tareas'
              : `${formatHours(plannedHours)} h planificadas`
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
                : 'Sin tareas próximas'
              : 'Vencen en 48 h'
          }
          tone="info"
        />

        <div className="relative flex h-full min-h-[148px] flex-col justify-between rounded-xl border border-border-subtle bg-white p-4 sm:p-4.5 shadow-sm transition-colors hover:border-[#c7d2fe]">
          <div
            className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-[#4f46e5]"
            aria-hidden="true"
          />

          <div>
            <div className="flex h-7 items-center justify-between gap-1.5">
              <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f4f3ff]">
                  <Clock className="size-4 shrink-0 text-[#4f46e5]" aria-hidden="true" />
                </span>
                <span
                  className="truncate text-[13px] sm:text-[14px] font-semibold leading-none text-[#4f46e5]"
                  title="Horas disponibles"
                >
                  Horas disponibles
                </span>
                <span className="sr-only">Tus horas disponibles</span>
              </div>
              <div className="shrink-0 pl-1">
                <AvailabilityInfo align="right" />
              </div>
            </div>

            <p className="mt-3.5 text-[32px] font-bold leading-none tracking-tight text-[#17212b]">
              {displayHoursValue}
            </p>

            {dailyLimitHours !== undefined && dailyLimitHours > 0 && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#667085]">
                  <span>{formatHours(plannedHours)} h ocupadas</span>
                  <span className={cn(
                    plannedHours > dailyLimitHours ? 'font-semibold text-[#b42318]' : 'text-[#667085]',
                  )}>
                    {plannedHours > dailyLimitHours
                      ? `+${formatHours(plannedHours - dailyLimitHours)} h sobrecarga`
                      : `${formatHours(Math.max(0, dailyLimitHours - plannedHours))} h libres`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f2f4f7]">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      plannedHours > dailyLimitHours
                        ? 'bg-[#d92d20]'
                        : plannedHours === dailyLimitHours
                          ? 'bg-[#f79009]'
                          : 'bg-[#4f46e5]',
                    )}
                    style={{
                      width: `${Math.min(100, Math.round((plannedHours / dailyLimitHours) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="sr-only">Para organizar las tareas de tus eventos</p>
            {onEditDailyLimit && (
              <Button
                type="button"
                onClick={onEditDailyLimit}
                variant="outline"
                aria-label="Cambiar horas"
                className="mt-2.5 h-8 w-full rounded-lg border-0 bg-[#eef2ff] px-2 text-[12px] sm:text-[13px] font-semibold text-[#4f46e5] shadow-none hover:bg-[#e0e7ff] hover:text-[#4338ca] transition-colors flex items-center justify-center gap-1.5"
              >
                <Pencil className="size-3.5 shrink-0 text-[#4f46e5]" aria-hidden="true" />
                <span>Cambiar horas diarias</span>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3 md:hidden" aria-label="Resumen de actividades y disponibilidad para móvil">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-white p-2.5 text-center shadow-xs">
            <span className="text-[11px] font-semibold text-[#b42318]">Vencidas</span>
            <span className="mt-0.5 text-lg font-bold text-[#b42318]">{overdueCount}</span>
            <span className="max-w-full truncate text-[10px] text-[#667085]">
              {overdueCount === 0 ? 'Al día' : 'Atención'}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-white p-2.5 text-center shadow-xs">
            <span className="text-[11px] font-semibold text-[#c2410c]">Para hoy</span>
            <span className="mt-0.5 text-lg font-bold text-[#c2410c]">{todayCount}</span>
            <span className="max-w-full truncate text-[10px] text-[#667085]">
              {todayCount === 0 ? 'Sin tareas' : 'Por hacer'}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-white p-2.5 text-center shadow-xs">
            <span className="text-[11px] font-semibold text-[#175cd3]">Próximas</span>
            <span className="mt-0.5 text-lg font-bold text-[#175cd3]">{upcomingCount}</span>
            <span className="max-w-full truncate text-[10px] text-[#667085]">
              {upcomingCount === 0 ? 'Sin tareas' : 'Programadas'}
            </span>
          </div>
        </div>

        <div className="min-h-[100px] rounded-xl border border-border-subtle bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold text-[#4f46e5]">
                Tus horas disponibles
              </p>
              <AvailabilityInfo align="left" />
            </div>
            {onEditDailyLimit && (
              <Button
                type="button"
                onClick={onEditDailyLimit}
                variant="outline"
                size="sm"
                aria-label="Cambiar horas"
                className="h-11 shrink-0 rounded-lg border-[#c7d2fe] bg-[#eef2ff] px-3 text-xs font-semibold text-[#3730a3] hover:bg-[#e0e7ff]"
              >
                Cambiar horas
              </Button>
            )}
          </div>

          <div className="mt-2">
            <p className="text-[24px] font-bold leading-none text-[#17212b]">
              {displayHoursValue}
            </p>
            <p className="mt-1 text-xs leading-normal text-[#667085]">
              Para organizar las tareas de tus eventos
            </p>
          </div>

          <div className="mt-3.5 border-t border-[#f2f4f7] pt-2.5">
            <p className="text-[13px] text-[#667085]">
              <span className="font-semibold text-[#17212b]">
                {formatHours(plannedHours)} h planificadas para hoy
              </span>
              {availableHours !== null && !isFiltered && (
                <span className={cn('ml-1 font-medium', availableHours === 0 ? 'text-[#b42318]' : 'text-[#027a48]')}>
                  · {availableHours === 0 ? 'Cupo diario completo' : `${formatHours(availableHours)} h disponibles`}
                </span>
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
