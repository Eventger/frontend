// Hoy en el backend y las fechas de eventos usan el calendario de Bogotá.
export const CALENDAR_TIME_ZONE = 'America/Bogota'

export function getCalendarDate(value: string | Date): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CALENDAR_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function getCalendarDay(value: string | Date): number {
  return Date.parse(`${getCalendarDate(value)}T00:00:00Z`) / 86_400_000
}

export function formatCalendarDate(value: string, options: Intl.DateTimeFormatOptions): string {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00-05:00` : value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-CO', { ...options, timeZone: CALENDAR_TIME_ZONE }).format(date)
}

export function formatDateInput(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : ''
}

export function parseDateInput(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null

  const [, day, month, year] = match
  const monthNumber = Number(month)
  const dayNumber = Number(day)
  if (monthNumber < 1 || monthNumber > 12) return null

  const daysInMonth = new Date(Date.UTC(Number(year), monthNumber, 0)).getUTCDate()
  if (dayNumber < 1 || dayNumber > daysInMonth) return null

  return `${year}-${month}-${day}`
}
