import { useState, useRef } from 'react'
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  MoreHorizontal,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getCalendarDate } from '@/lib/calendar'
import type { Subtask } from '@/features/events/types/subtask.types'

type EventTaskCardProps = {
  subtask: Subtask
  onRegisterProgress?: (subtask: Subtask) => void
  onReschedule?: (subtask: Subtask) => void
}

type VisualTaskStatus = 'completed' | 'inProgress' | 'overdue' | 'today' | 'pending' | 'postponed'

const STATUS_LABELS: Record<VisualTaskStatus, string> = {
  completed: 'Completada',
  inProgress: 'En progreso',
  overdue: 'Vencida',
  today: 'Hoy',
  pending: 'Pendiente',
  postponed: 'Pospuesta',
}

const STATUS_STYLES: Record<VisualTaskStatus, string> = {
  completed: 'bg-[#ecfdf3] text-[#027a48]',
  inProgress: 'bg-[#eef2ff] text-[#4338ca]',
  overdue: 'bg-[#feeeec] text-[#b42318]',
  today: 'bg-[#fff7e6] text-[#c2410c]',
  pending: 'bg-[#eff8ff] text-[#175cd3]',
  postponed: 'bg-[#f2f4f7] text-[#475467]',
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatTaskDate(date: string) {
  const [, month, day] = getCalendarDate(date).split('-')
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`
}

function formatEstimatedHours(hours: number) {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(hours)
}

function getVisualStatus(subtask: Subtask): VisualTaskStatus {
  if (subtask.state === 'completed') return 'completed'
  if (subtask.state === 'postponed') return 'postponed'
  if (subtask.state === 'in_progress') return 'inProgress'
  const targetDate = getCalendarDate(new Date(subtask.targetDate))
  const today = getCalendarDate(new Date())
  if (targetDate < today) return 'overdue'
  if (targetDate === today) return 'today'
  return 'pending'
}

export function EventTaskCard({ subtask, onRegisterProgress, onReschedule }: EventTaskCardProps) {
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  
  // Referencia para medir la posición exacta del botón en la pantalla
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })

  const visualStatus = getVisualStatus(subtask)
  const note = subtask.details.trim()
  const hasNote = note.length > 0
  const noteId = `task-note-${subtask.id}`
  const detailsId = `task-details-${subtask.id}`
  const canChangeProgress = subtask.state !== 'completed'

  function openDetails() {
    setIsDetailsOpen((current) => !current)
    setIsActionsOpen(false)
  }

  function handleToggleActions() {
    if (!isActionsOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // Calculamos la posición fija basada en dónde está el botón en la ventana del navegador
      setMenuPosition({
        top: rect.bottom + 6, // 6px abajito del botón
        right: window.innerWidth - rect.right, // Alineado al borde derecho del botón
      })
    }
    setIsActionsOpen((current) => !current)
  }

  return (
    <article className="event-task-card relative rounded-lg border border-border-subtle bg-white transition-colors hover:border-[#c7d2fe]">
      <div className="flex min-h-[61px] flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-[15px] font-semibold leading-5 text-[#17212b]">{subtask.name}</h3>
          <p className="mt-1 text-[12px] leading-4 text-[#667085]">{formatTaskDate(subtask.targetDate)} · {formatEstimatedHours(subtask.estimatedHours)} h</p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 sm:ml-4 sm:w-auto sm:shrink-0 sm:flex-nowrap">
          <span className={cn('inline-flex min-w-[88px] items-center justify-center rounded-full px-3 py-[6px] text-[12px] font-medium leading-[15px]', STATUS_STYLES[visualStatus])}>
            {STATUS_LABELS[visualStatus]}
          </span>

          {hasNote && (
            <Button type="button" variant="outline" aria-expanded={isNoteOpen} aria-controls={noteId} onClick={() => setIsNoteOpen((current) => !current)} className="event-task-control min-w-[118px] rounded-[8px] border-[#b9c5ff] bg-[#f6f7ff] px-3 text-[12px] font-medium text-[#4f46e5] hover:bg-[#eef2ff] hover:text-[#4338ca]">
              <FileText className="size-3.5" aria-hidden="true" />
              {isNoteOpen ? 'Ocultar' : 'Nota'}
              {isNoteOpen ? <ChevronUp className="ml-auto size-3.5" aria-hidden="true" /> : <ChevronDown className="ml-auto size-3.5" aria-hidden="true" />}
            </Button>
          )}

          {canChangeProgress && (
            <div className="relative">
              <Button
                ref={buttonRef}
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Más acciones para ${subtask.name}`}
                aria-haspopup="menu"
                aria-expanded={isActionsOpen}
                aria-controls={`task-actions-${subtask.id}`}
                onClick={handleToggleActions}
                className="size-9 rounded-[9px] border-[#dde2ea] bg-white text-[#667085] hover:bg-[#f9fafb] hover:text-[#17212b]"
              >
                <MoreHorizontal className="size-5" aria-hidden="true" />
              </Button>

              {isActionsOpen && (
                <>
                  {/* Backdrop invisible para cerrar el menú al hacer clic afuera */}
                  <button type="button" aria-label="Cerrar menú de acciones" className="fixed inset-0 z-40 cursor-default bg-transparent" onClick={() => setIsActionsOpen(false)} />
                  
                  {/* Menú flotante posicionado de forma fija en la ventana */}
                  <div 
                    id={`task-actions-${subtask.id}`} 
                    role="menu" 
                    aria-label={`Acciones para ${subtask.name}`} 
                    style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
                    className="fixed z-50 w-[184px] rounded-xl border border-[#dde2ea] bg-white p-1.5 shadow-[0_8px_24px_rgba(16,24,40,0.14)]"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      aria-label={`Registrar avance de ${subtask.name}`}
                      onClick={() => {
                        setIsActionsOpen(false)
                        onRegisterProgress?.(subtask)
                      }}
                      className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[13px] font-medium text-[#17212b] hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-[#4f46e5]"
                    >
                      <CheckCircle2 className="size-4 text-[#4f46e5]" aria-hidden="true" />
                      Registrar avance
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      aria-label={`Reprogramar ${subtask.name}`}
                      onClick={() => {
                        setIsActionsOpen(false)
                        onReschedule?.(subtask)
                      }}
                      className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[13px] font-medium text-[#17212b] hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-[#4f46e5]"
                    >
                      <CalendarClock className="size-4 text-[#667085]" aria-hidden="true" />
                      Reprogramar
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      aria-label={`${isDetailsOpen ? 'Ocultar' : 'Ver'} detalles de ${subtask.name}`}
                      onClick={openDetails}
                      className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[13px] font-medium text-[#17212b] hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-[#4f46e5]"
                    >
                      <FileText className="size-4 text-[#667085]" aria-hidden="true" />
                      {isDetailsOpen ? 'Ocultar detalles' : 'Ver detalles'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {hasNote && isNoteOpen && (
        <div id={noteId} className="flex items-start gap-3 border-t border-[#eaecf0] px-4 py-3">
          <FileText className="mt-0.5 size-4 shrink-0 text-[#4f46e5]" aria-hidden="true" />
          <p className="min-w-0 text-[12px] leading-5 text-[#667085]"><span className="mr-4 font-semibold text-[#17212b]">Nota</span>{note}</p>
        </div>
      )}

      {isDetailsOpen && (
        <div id={detailsId} className="border-t border-[#eaecf0] bg-[#fcfcfd] px-4 py-3">
          <p className="text-[12px] font-semibold text-[#17212b]">Detalles de la tarea</p>
          <p className="mt-1 break-words text-[12px] leading-5 text-[#667085]">{note || 'Esta tarea no tiene notas adicionales.'}</p>
        </div>
      )}
    </article>
  )
}