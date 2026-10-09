import { formatCalendarDate, getCalendarDate } from '@/lib/calendar'
import type { TodayData } from '@/features/today/types/today.types'

export const DEFAULT_DAILY_LIMIT_HOURS = 6

export function isValidDailyLimit(value: number) {
  return Number.isFinite(value) && value >= 1 && value <= 16 && Math.abs(value * 100 - Math.round(value * 100)) < 1e-8
}

export class DailyLimitConflictError extends Error {
  constructor(date: string, hours: number) {
    const dateLabel = formatCalendarDate(date, { day: 'numeric', month: 'long', year: 'numeric' })
    const hoursLabel = `${hours.toLocaleString('es-CO')} h`
    super(`Tienes ${hoursLabel} programadas para el ${dateLabel}. Usa al menos ${hoursLabel} o reprograma.`)
    this.name = 'DailyLimitConflictError'
  }
}

export function validateDailyLimitForTasks(hours: number, tasks: TodayData): void {
  const dailyHours = new Map<string, number>()
  // La API incluye todas las fechas y eventos propios, sin filtros; las completadas no aportan carga.
  for (const task of [...tasks.overdue, ...tasks.today, ...tasks.upcoming]) {
    if (!Number.isFinite(task.estimatedHours) || task.estimatedHours < 0) {
      throw new Error('No pudimos comprobar la carga de tus tareas.')
    }
    const date = getCalendarDate(task.targetDate)
    // El contrato usa dos decimales. Sumar centésimas evita falsos conflictos por precisión numérica.
    dailyHours.set(date, (dailyHours.get(date) ?? 0) + Math.round(task.estimatedHours * 100))
  }

  const busiestDay = [...dailyHours].sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))[0]
  if (busiestDay && busiestDay[1] > Math.round(hours * 100)) {
    throw new DailyLimitConflictError(busiestDay[0], busiestDay[1] / 100)
  }
}

// These are planning preferences, never authorization or account permissions.
export function getDailyLimitHours(metadata: Record<string, unknown> | undefined) {
  const preferences = metadata?.eventger
  if (typeof preferences !== 'object' || preferences === null) {
    return DEFAULT_DAILY_LIMIT_HOURS
  }
  const value = 'dailyLimitHours' in preferences ? preferences.dailyLimitHours : undefined
  return typeof value === 'number' && isValidDailyLimit(value)
    ? value
    : DEFAULT_DAILY_LIMIT_HOURS
}
