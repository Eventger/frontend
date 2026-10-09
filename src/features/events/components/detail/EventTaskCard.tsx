import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getCalendarDate } from '@/lib/calendar'

import type { Subtask } from '@/features/events/types/subtask.types'

type EventTaskCardProps = {
  subtask: Subtask
}

type VisualTaskStatus =
  | 'completed'
  | 'inProgress'
  | 'overdue'
  | 'today'
  | 'pending'

const STATUS_LABELS: Record<
  VisualTaskStatus,
  string
> = {
  completed: 'Completada',
  inProgress: 'En progreso',
  overdue: 'Vencida',
  today: 'Hoy',
  pending: 'Pendiente',
}

const STATUS_STYLES: Record<
  VisualTaskStatus,
  string
> = {
  completed: 'bg-[#ecfdf3] text-[#027a48]',
  inProgress: 'bg-[#eef2ff] text-[#4338ca]',
  overdue: 'bg-[#feeeec] text-[#b42318]',
  today: 'bg-[#fff7e6] text-[#c2410c]',
  pending: 'bg-[#eff8ff] text-[#175cd3]',
}

const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

function formatTaskDate(date: string) {
  const [, month, day] = getCalendarDate(date).split('-')
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`
}

function formatEstimatedHours(
  hours: number,
) {
  return new Intl.NumberFormat(
    'es-CO',
    {
      maximumFractionDigits: 2,
    },
  ).format(hours)
}

function getDateOnly(date: Date) {
  return getCalendarDate(date)
}

function getVisualStatus(
  subtask: Subtask,
): VisualTaskStatus {
  if (subtask.state === 'completed') {
    return 'completed'
  }

  if (subtask.state === 'in_progress') {
    return 'inProgress'
  }

  const targetDate = getDateOnly(
    new Date(subtask.targetDate),
  )
  const today = getDateOnly(new Date())

  if (targetDate < today) {
    return 'overdue'
  }

  if (targetDate === today) {
    return 'today'
  }

  return 'pending'
}

export function EventTaskCard({
  subtask,
}: EventTaskCardProps) {
  const [isNoteOpen, setIsNoteOpen] =
    useState(false)

  const visualStatus =
    getVisualStatus(subtask)
  const note = subtask.details.trim()
  const hasNote = note.length > 0
  const noteId = `task-note-${subtask.id}`

  return (
    <article className="event-task-card relative overflow-hidden rounded-lg border border-border-subtle bg-white transition-colors hover:border-[#c7d2fe]">
      <div className="flex min-h-[61px] flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-[15px] font-semibold leading-5 text-[#17212b]">
            {subtask.name}
          </h3>

          <p className="mt-1 text-[12px] leading-4 text-[#667085]">
            {formatTaskDate(
              subtask.targetDate,
            )}
            {' · '}
            {formatEstimatedHours(
              subtask.estimatedHours,
            )}{' '}
            h
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 sm:ml-4 sm:w-auto sm:shrink-0 sm:flex-nowrap">
          <span
            className={cn(
              'inline-flex min-w-[88px] items-center justify-center rounded-full px-3 py-[6px] text-[12px] font-medium leading-[15px]',
              STATUS_STYLES[
                visualStatus
              ],
            )}
          >
            {
              STATUS_LABELS[
                visualStatus
              ]
            }
          </span>

          {hasNote && (
            <Button
              type="button"
              variant="outline"
              aria-expanded={
                isNoteOpen
              }
              aria-controls={noteId}
              onClick={() =>
                setIsNoteOpen(
                  (current) =>
                    !current,
                )
              }
              className="event-task-control min-w-[118px] rounded-[8px] border-[#b9c5ff] bg-[#f6f7ff] px-3 text-[12px] font-medium text-[#4f46e5] hover:bg-[#eef2ff] hover:text-[#4338ca]"
            >
              <FileText
                className="size-3.5"
                aria-hidden="true"
              />
              {isNoteOpen
                ? 'Ocultar'
                : 'Nota'}
              {isNoteOpen ? (
                <ChevronUp
                  className="ml-auto size-3.5"
                  aria-hidden="true"
                />
              ) : (
                <ChevronDown
                  className="ml-auto size-3.5"
                  aria-hidden="true"
                />
              )}
            </Button>
          )}

        </div>
      </div>

      {hasNote && isNoteOpen && (
        <div
          id={noteId}
          className="flex items-start gap-3 border-t border-[#eaecf0] px-4 py-3"
        >
          <FileText
            className="mt-0.5 size-4 shrink-0 text-[#4f46e5]"
            aria-hidden="true"
          />

          <p className="min-w-0 text-[12px] leading-5 text-[#667085]">
            <span className="mr-4 font-semibold text-[#17212b]">
              Nota
            </span>
            {note}
          </p>
        </div>
      )}
    </article>
  )
}
