import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Calendar,
  CalendarClock,
  ChevronDown,
  CircleAlert,
  Clock,
  Eye,
  EyeOff,
  ListTodo,
  Pause,
  SlidersHorizontal,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getCalendarDate } from '@/lib/calendar'
import type { Subtask } from '@/features/events/types/subtask.types'

type EventTaskCardProps = {
  subtask: Subtask
  onRegisterProgress?: (subtask: Subtask) => void
  onReschedule?: (subtask: Subtask) => void
  onEdit?: (subtask: Subtask) => void
  onDelete?: (subtask: Subtask) => void
  isHighlighted?: boolean
  onMouseEnter?: () => void
  onFocus?: () => void
  onClick?: () => void
}

type VisualTaskStatus = 'completed' | 'inProgress' | 'overdue' | 'today' | 'upcoming' | 'pending' | 'postponed'
type TaskStateStatus = 'completed' | 'inProgress' | 'pending' | 'postponed'
type ScheduleStatus = 'overdue' | 'today' | 'upcoming'

const STATUS_LABELS: Record<VisualTaskStatus, string> = {
  completed: 'Completada',
  inProgress: 'En progreso',
  overdue: 'Vencida',
  today: 'Hoy',
  upcoming: 'Próxima',
  pending: 'Pendiente',
  postponed: 'Pospuesta',
}

const STATUS_STYLES: Record<VisualTaskStatus, string> = {
  completed: 'bg-[#ecfdf3] text-[#027a48]',
  inProgress: 'bg-[#eef2ff] text-[#4338ca]',
  overdue: 'bg-[#feeeec] text-[#b42318]',
  today: 'bg-[#fff7e6] text-[#c2410c]',
  upcoming: 'bg-[#eff8ff] text-[#175cd3]',
  pending: 'bg-[#fffaeb] text-[#b54708]',
  postponed: 'bg-[#f2f4f7] text-[#475467]',
}

const STATUS_ACCENTS: Record<VisualTaskStatus, string> = {
  overdue: 'bg-[#b42318]',
  today: 'bg-[#c2410c]',
  upcoming: 'bg-[#175cd3]',
  inProgress: 'bg-[#4338ca]',
  completed: 'bg-[#027a48]',
  pending: 'bg-[#f79009]',
  postponed: 'bg-[#667085]',
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatTaskDate(date?: string | null) {
  if (!date || !date.trim()) return 'Sin fecha'
  try {
    const calendarDate = getCalendarDate(date)
    const [year, month, day] = calendarDate.split('-')
    if (year && month && day) {
      return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`
    }
    return `${Number(day)} ${MONTHS[Number(month) - 1]}`
  } catch {
    return 'Sin fecha'
  }
}

function formatEstimatedHours(hours: number) {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(hours)
}

function getTaskStateStatus(subtask: Subtask): TaskStateStatus {
  if (subtask.state === 'completed') return 'completed'
  if (subtask.state === 'postponed') return 'postponed'
  if (subtask.state === 'in_progress') return 'inProgress'
  return 'pending'
}

function getScheduleStatus(subtask: Subtask): ScheduleStatus | null {
  if (subtask.state === 'postponed') return null
  if (!subtask.targetDate || !subtask.targetDate.trim() || Number.isNaN(new Date(subtask.targetDate).getTime())) {
    return null
  }
  const targetDate = getCalendarDate(subtask.targetDate)
  const today = getCalendarDate(new Date())
  if (targetDate < today) return 'overdue'
  if (targetDate === today) return 'today'

  return 'upcoming'
}

export function EventTaskCard({
  subtask,
  onRegisterProgress,
  onReschedule,
  onEdit: _onEdit,
  onDelete: _onDelete,
  isHighlighted,
  onMouseEnter,
  onFocus,
  onClick,
}: EventTaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null)

  const taskStateStatus = getTaskStateStatus(subtask)
  const scheduleStatus = getScheduleStatus(subtask)
  const isPostponed = taskStateStatus === 'postponed'
  const scheduleTextTone = scheduleStatus === 'overdue'
    ? 'font-medium text-[#b42318]'
    : scheduleStatus === 'today'
      ? 'font-medium text-[#c2410c]'
      : scheduleStatus === 'upcoming'
        ? 'font-medium text-[#175cd3]'
        : 'text-[#667085]'
  const scheduleIconTone = scheduleStatus === 'overdue'
    ? 'text-[#b42318]'
    : scheduleStatus === 'today'
      ? 'text-[#c2410c]'
      : scheduleStatus === 'upcoming'
        ? 'text-[#175cd3]'
        : 'text-[#667085]'
  const accentStatus: VisualTaskStatus = subtask.state === 'postponed'
    ? 'postponed'
    : (scheduleStatus ?? taskStateStatus)
  const note = subtask.details.trim()
  const detailsId = `task-details-${subtask.id}`
  const canChangeProgress = true
  const canReschedule = subtask.state === 'pending' || subtask.state === 'in_progress'

  function calculatePosition() {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return null
    const menuWidth = 190
    const measuredHeight = menuRef.current?.offsetHeight
    const menuHeight = measuredHeight && measuredHeight > 0 ? measuredHeight : (canReschedule ? 84 : 48)
    const right = Math.max(8, Math.min(window.innerWidth - menuWidth - 8, window.innerWidth - rect.right))
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const openUpward = spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow
    const top = openUpward
      ? Math.max(8, rect.top - menuHeight - 6)
      : Math.min(window.innerHeight - menuHeight - 8, rect.bottom + 6)
    return { top, right }
  }

  function openDetails() {
    setIsDetailsOpen((current) => !current)
    setIsActionsOpen(false)
  }

  function handleToggleActions() {
    if (!isActionsOpen) {
      const pos = calculatePosition()
      if (pos) {
        setMenuPosition(pos)
      }
    }
    setIsActionsOpen((current) => !current)
  }

  useEffect(() => {
    if (!isActionsOpen) return

    const updatePosition = () => {
      const pos = calculatePosition()
      if (pos) {
        setMenuPosition(pos)
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsActionsOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsActionsOpen(false)
        buttonRef.current?.focus()
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (!menuRef.current) return
        const items = Array.from(menuRef.current.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not([disabled])'))
        if (items.length === 0) return
        const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement)
        if (event.key === 'ArrowDown') {
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
          items[nextIndex]?.focus()
        } else {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
          items[prevIndex]?.focus()
        }
      }
    }

    updatePosition()
    requestAnimationFrame(() => {
      if (menuRef.current) {
        const firstItem = menuRef.current.querySelector<HTMLButtonElement>('button[role="menuitem"]:not([disabled])')
        firstItem?.focus()
      }
    })
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isActionsOpen, canReschedule])

  return (
    <article
      id={`task-${subtask.id}`}
      onPointerEnter={onMouseEnter}
      onFocusCapture={onFocus}
      onClick={onClick}
      className={cn(
        'event-task-card relative w-full overflow-hidden rounded-xl border transition-all duration-300',
        isHighlighted
          ? 'border-[#4f46e5] bg-[#fafaff] ring-2 ring-[#4f46e5]/30 shadow-[0_4px_16px_rgba(79,70,229,0.08)]'
          : 'border-border-subtle bg-white shadow-sm hover:border-[#c7d2fe]',
      )}
    >
      <div className={cn('absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full transition-colors', STATUS_ACCENTS[accentStatus])} aria-hidden="true" />
      <div className="flex min-h-[104px] w-full flex-col gap-3 py-3 pl-4 pr-4 sm:min-h-[60px] sm:flex-row sm:items-center sm:py-2.5 sm:pl-5 sm:pr-4">
        <div className="min-w-0 flex-1">
          <h3 className="type-card-title line-clamp-2 text-wrap tracking-tight text-[#17212b]">
            <button
              type="button"
              onClick={openDetails}
              aria-expanded={isDetailsOpen}
              aria-controls={detailsId}
              aria-label={subtask.name}
              className="group inline-flex items-center gap-1.5 rounded text-left focus-visible:outline-2 focus-visible:outline-[#4f46e5]"
            >
              <span className="transition-colors group-hover:text-[#4f46e5] text-[#17212b]">
                {subtask.name}
              </span>
              <ChevronDown
                className={cn(
                  'size-3.5 text-[#98a2b3] transition-transform duration-200 group-hover:text-[#4f46e5]',
                  isDetailsOpen && 'rotate-180 text-[#4f46e5]',
                )}
                aria-hidden="true"
              />
            </button>
          </h3>
          {isPostponed ? (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-sm leading-5 text-[#667085]">
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap sm:w-[145px]">
                <Pause className="size-4 shrink-0 text-[#667085]" aria-hidden="true" />
                Sin fecha
              </span>
              <span aria-hidden="true" className="shrink-0 text-[#98a2b3]">•</span>
              <span>No cuenta en la carga planificada</span>
            </p>
          ) : (
            <div className={cn(
              'mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm leading-5',
              scheduleTextTone,
            )}>
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap sm:w-[145px]">
                <Calendar className={cn('size-4 shrink-0', scheduleIconTone)} aria-hidden="true" />
                <time dateTime={subtask.targetDate ?? undefined}>{formatTaskDate(subtask.targetDate)}</time>
              </span>
              <span aria-hidden="true" className={cn('shrink-0', scheduleStatus === 'overdue' ? 'text-[#fda29b]' : 'text-[#98a2b3]')}>•</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap sm:w-[72px]">
                <Clock className={cn('size-4 shrink-0', scheduleIconTone)} aria-hidden="true" />
                <span className="tabular-nums">{formatEstimatedHours(subtask.estimatedHours)} h</span>
              </span>
              {scheduleStatus && (
                <>
                  <span aria-hidden="true" className={cn('hidden sm:inline shrink-0', scheduleStatus === 'overdue' ? 'text-[#fda29b]' : 'text-[#98a2b3]')}>•</span>
                  <span
                    data-task-schedule-status
                    className={cn('inline-flex shrink-0 items-center justify-start gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium leading-[15px]', STATUS_STYLES[scheduleStatus])}
                  >
                    {scheduleStatus === 'overdue' && <CircleAlert className="size-3.5" aria-hidden="true" />}
                    {scheduleStatus === 'today' && <Calendar className="size-3.5" aria-hidden="true" />}
                    {scheduleStatus === 'upcoming' && <Clock className="size-3.5" aria-hidden="true" />}
                    {STATUS_LABELS[scheduleStatus]}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 sm:ml-4 sm:w-auto sm:shrink-0 sm:flex-nowrap">
          <span
            data-task-state-status
            className={cn('inline-flex min-w-[80px] shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium leading-[15px] sm:min-w-[88px] sm:px-3', STATUS_STYLES[taskStateStatus])}
          >
            {isPostponed && <Pause className="mr-1 size-3.5 shrink-0" aria-hidden="true" />}
            {STATUS_LABELS[taskStateStatus]}
          </span>

          {canChangeProgress && (
            <Button
              type="button"
              onClick={() => onRegisterProgress?.(subtask)}
              aria-label={`Registrar avance de ${subtask.name}`}
              className="h-11 rounded-lg bg-[#4f46e5] px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] sm:h-9"
            >
              <ListTodo className="size-4 shrink-0 text-white" aria-hidden="true" />
              <span>Registrar avance</span>
            </Button>
          )}

          <div className="relative">
            <Button
              ref={buttonRef}
              type="button"
              variant="outline"
              aria-label={`Más acciones para ${subtask.name}`}
              aria-haspopup="menu"
              aria-expanded={isActionsOpen}
              aria-controls={`task-actions-${subtask.id}`}
              onClick={handleToggleActions}
              className="h-11 rounded-lg border-[#dde2ea] bg-white px-3 text-sm font-medium text-[#344054] shadow-sm hover:bg-[#f9fafb] hover:text-[#17212b] sm:h-9 sm:w-[108px] sm:justify-center"
            >
              <SlidersHorizontal className="size-4 text-[#667085]" aria-hidden="true" />
              <span>Acciones</span>
              <ChevronDown
                className={cn(
                  'size-3.5 text-[#667085] transition-transform duration-200',
                  isActionsOpen && 'rotate-180'
                )}
                aria-hidden="true"
              />
            </Button>

            {isActionsOpen && menuPosition && createPortal(
              <>
                {/* Backdrop invisible para cerrar el menú al hacer clic afuera */}
                <button
                  type="button"
                  aria-label="Cerrar menú de acciones"
                  className="fixed inset-0 z-[9998] cursor-default bg-transparent"
                  onClick={() => setIsActionsOpen(false)}
                />

                {/* Menú flotante posicionado de forma fija en el body */}
                <div
                  ref={menuRef}
                  id={`task-actions-${subtask.id}`}
                  role="menu"
                  aria-label={`Acciones para ${subtask.name}`}
                  style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
                  className="fixed z-[9999] w-[190px] rounded-xl border border-[#dde2ea] bg-white p-1.5 shadow-[0_8px_24px_rgba(16,24,40,0.14)]"
                >
                  {canReschedule && (
                    <button
                      type="button"
                      role="menuitem"
                      aria-label={`Reprogramar ${subtask.name}`}
                      onClick={() => {
                        setIsActionsOpen(false)
                        onReschedule?.(subtask)
                      }}
                      className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium text-[#17212b] hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-[#4f46e5]"
                    >
                      <CalendarClock className="size-4 text-[#667085]" aria-hidden="true" />
                      Reprogramar
                    </button>
                  )}

                  <button
                    type="button"
                    role="menuitem"
                    aria-label={`${isDetailsOpen ? 'Ocultar' : 'Ver'} detalle de ${subtask.name}`}
                    onClick={openDetails}
                    className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium text-[#17212b] hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-[#4f46e5]"
                  >
                    {isDetailsOpen
                      ? <EyeOff className="size-4 text-[#667085]" aria-hidden="true" />
                      : <Eye className="size-4 text-[#667085]" aria-hidden="true" />}
                    {isDetailsOpen ? 'Ocultar detalle' : 'Ver detalle'}
                  </button>
                </div>
              </>,
              document.body,
            )}
          </div>
        </div>
      </div>


      {isDetailsOpen && (
        <div id={detailsId} className="border-t border-[#eaecf0] bg-[#fcfcfd] px-4 py-3">
          <p className="text-xs font-semibold text-[#17212b]">Detalles de la tarea</p>
          <p className="mt-1 break-words text-xs leading-5 text-[#667085]">{note || 'Esta tarea no tiene notas adicionales.'}</p>
        </div>
      )}
    </article>
  )
}
