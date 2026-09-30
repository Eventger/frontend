import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { Subtask } from '@/features/events/types/subtask.types'

type EventTaskCardProps = {
  subtask: Subtask
  onEdit: (subtask: Subtask) => void
  onDelete: (subtask: Subtask) => void
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
  const value = new Date(date)

  return `${value.getUTCDate()} ${MONTHS[value.getUTCMonth()]}`
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
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  )
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
  onEdit,
  onDelete,
}: EventTaskCardProps) {
  const [isNoteOpen, setIsNoteOpen] =
    useState(false)

  const visualStatus =
    getVisualStatus(subtask)
  const note = subtask.details.trim()
  const hasNote = note.length > 0
  const noteId = `task-note-${subtask.id}`

  return (
    <article className="event-task-card relative overflow-hidden rounded-[11px] border border-[#d9dee7] bg-white transition-colors hover:border-[#c7d2fe]">
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
              'inline-flex h-[30px] min-w-[116px] items-center justify-center rounded-full px-4 text-[12px] font-medium',
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

          <div className="event-task-actions ml-auto flex gap-1.5 rounded-[9px] bg-white/95 py-1 pl-2 shadow-[-10px_0_16px_4px_rgba(255,255,255,0.96)] transition-opacity">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onEdit(subtask)
              }
              className="event-task-control rounded-[8px] bg-[#f8fafc] px-2.5 text-[12px] font-semibold text-[#17212b]"
            >
              Editar
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onDelete(subtask)
              }
              className="event-task-control rounded-[8px] border-[#c2413a] bg-white px-2.5 text-[12px] font-semibold text-[#c2413a] hover:bg-[#fdf2f1] hover:text-[#c2413a] focus-visible:ring-[#c2413a]/25"
            >
              Eliminar
            </Button>
          </div>
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
