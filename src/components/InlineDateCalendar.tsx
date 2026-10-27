import { useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getCalendarDate } from '@/lib/calendar'

export type InlineDateCalendarProps = {
  value: string
  min?: string
  max?: string
  disabled?: boolean
  onValueChange: (value: string) => void
  className?: string
}

const weekdays = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

function toUtcDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function toDateValue(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function monthStart(value: string): string {
  return `${value.slice(0, 7)}-01`
}

function shiftDate(value: string, days: number): string {
  const date = toUtcDate(value)
  date.setUTCDate(date.getUTCDate() + days)
  return toDateValue(date)
}

function shiftMonth(value: string, months: number): string {
  const date = toUtcDate(value)
  date.setUTCMonth(date.getUTCMonth() + months, 1)
  return toDateValue(date)
}

function clampDate(value: string, min?: string, max?: string): string {
  if (min && value < min) return min
  if (max && value > max) return max
  return value
}

function fullDateLabel(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(toUtcDate(value))
}

export function InlineDateCalendar({ value, min, max, disabled, onValueChange, className }: InlineDateCalendarProps) {
  const todayInBogota = getCalendarDate(new Date())
  const initialDate = clampDate(value || (min || todayInBogota), min, max)
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(initialDate))
  const [focusedDate, setFocusedDate] = useState(initialDate)
  const monthDate = toUtcDate(visibleMonth)
  const calendarStart = shiftDate(visibleMonth, -monthDate.getUTCDay())
  const lastDayOfMonth = shiftDate(shiftMonth(visibleMonth, 1), -1)
  const occupiedCells = monthDate.getUTCDay() + toUtcDate(lastDayOfMonth).getUTCDate()
  const calendarCellCount = occupiedCells <= 35 ? 35 : 42
  const days = Array.from({ length: calendarCellCount }, (_, index) => shiftDate(calendarStart, index))
  const rawMonthLabel = new Intl.DateTimeFormat('es-CO', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(monthDate)
  const monthLabel = rawMonthLabel.charAt(0).toUpperCase() + rawMonthLabel.slice(1)
  const previousMonth = shiftMonth(visibleMonth, -1)
  const nextMonth = shiftMonth(visibleMonth, 1)
  const canGoPrevious = !min || previousMonth.slice(0, 7) >= min.slice(0, 7)
  const canGoNext = !max || nextMonth.slice(0, 7) <= max.slice(0, 7)

  const moveFocus = (nextDate: string) => {
    const clampedDate = clampDate(nextDate, min, max)
    setFocusedDate(clampedDate)
    setVisibleMonth(monthStart(clampedDate))
    requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(`[data-calendar-date="${clampedDate}"]`)?.focus()
    })
  }

  const handleDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, day: string) => {
    const movements: Partial<Record<string, number>> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    }
    const movement = movements[event.key]
    if (movement) {
      event.preventDefault()
      moveFocus(shiftDate(day, movement))
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const weekday = toUtcDate(day).getUTCDay()
      moveFocus(shiftDate(day, event.key === 'Home' ? -weekday : 6 - weekday))
      return
    }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault()
      moveFocus(shiftMonth(day, event.key === 'PageUp' ? -1 : 1))
    }
  }

  const changeMonth = (next: string) => {
    setVisibleMonth(next)
    setFocusedDate(clampDate(next, min, max))
  }

  return (
    <div
      role="group"
      aria-label="Seleccionar una fecha en el calendario"
      className={cn(
        'mx-auto w-full max-w-[520px] rounded-2xl border border-border-subtle bg-white p-3 shadow-xl sm:p-4',
        className,
      )}
    >
      <div className="grid grid-cols-[38px_minmax(0,1fr)_38px] sm:grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Mes anterior"
          disabled={disabled || !canGoPrevious}
          onClick={() => changeMonth(previousMonth)}
          className="size-9 sm:size-10 rounded-xl border-border-subtle bg-white text-[#344054] shadow-none hover:bg-gray-50 hover:text-[#17212b] transition-colors"
        >
          <ChevronLeft className="size-4.5 sm:size-5" aria-hidden="true" />
        </Button>
        <p aria-live="polite" className="text-center text-[15px] sm:text-[16px] font-bold text-[#101828]">
          {monthLabel}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Mes siguiente"
          disabled={disabled || !canGoNext}
          onClick={() => changeMonth(nextMonth)}
          className="size-9 sm:size-10 rounded-xl border-border-subtle bg-white text-[#344054] shadow-none hover:bg-gray-50 hover:text-[#17212b] transition-colors"
        >
          <ChevronRight className="size-4.5 sm:size-5" aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-2.5 sm:mt-3 grid grid-cols-7 gap-0 sm:gap-1" aria-hidden="true">
        {weekdays.map(weekday => (
          <span key={weekday} className="py-0.5 text-center text-[11px] sm:text-[12px] font-semibold text-[#475467] tracking-wider">
            {weekday}
          </span>
        ))}
      </div>

      <div role="grid" aria-label={`Calendario de ${rawMonthLabel}`} className="mt-1 sm:mt-1.5 grid grid-cols-7 gap-0 sm:gap-0.5">
        {days.map(day => {
          const outsideMonth = day.slice(0, 7) !== visibleMonth.slice(0, 7)
          const unavailable = Boolean(min && day < min) || Boolean(max && day > max)
          const selected = day === value
          const isToday = day === todayInBogota
          return (
            <div key={day} role="gridcell" aria-selected={selected} className="flex justify-center p-0.5">
              <button
                type="button"
                data-calendar-date={day}
                aria-label={fullDateLabel(day)}
                aria-current={isToday ? 'date' : undefined}
                disabled={disabled || unavailable || outsideMonth}
                tabIndex={day === focusedDate ? 0 : -1}
                onKeyDown={event => handleDayKeyDown(event, day)}
                onClick={() => {
                  setFocusedDate(day)
                  onValueChange(day)
                }}
                className={cn(
                  'flex aspect-square w-full max-w-9 sm:max-w-10 items-center justify-center rounded-xl text-[13px] sm:text-[14px] font-medium tabular-nums text-[#344054]',
                  'transition-all hover:bg-[#eef2ff] hover:text-[#4f46e5] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#4f46e5]',
                  outsideMonth && 'text-[#d0d5dd] opacity-40',
                  unavailable && 'cursor-not-allowed text-[#d0d5dd] opacity-40',
                  isToday && !selected && 'bg-[#eef2ff] font-bold text-[#4f46e5]',
                  selected && 'bg-[#4f46e5] font-bold text-white shadow-xs hover:bg-[#4338ca] hover:text-white',
                )}
              >
                {toUtcDate(day).getUTCDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
