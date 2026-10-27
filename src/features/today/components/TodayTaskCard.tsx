import { useId, useState } from 'react'
import { Calendar, Clock, ListTodo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TodayTaskActionsMenu } from './TodayTaskActionsMenu'
import type { TodayTaskItem } from '@/features/today/types/today.types'
import { formatCalendarDate } from '@/lib/calendar'
import { cn } from '@/lib/utils'

type TaskGroup = 'overdue' | 'today' | 'upcoming' | 'completed'

type TodayTaskCardProps = {
  task: TodayTaskItem
  group: TaskGroup
  isHighlighted?: boolean
  onMouseEnter?: () => void
  onFocus?: () => void
  onClick?: () => void
  onOpenTask: (task: TodayTaskItem) => void
  onRegisterProgress?: (task: TodayTaskItem) => void
  onRescheduleTask?: (task: TodayTaskItem) => void
  loadingRescheduleId?: number | null
}

const groupStyles: Record<TaskGroup, { accent: string; badgeBackground: string; badgeText: string; badgeLabel: string; metadataText: string; metadataIcon: string; separator: string }> = {
  overdue: { accent: 'bg-[#b42318]', badgeBackground: 'bg-[#feeeec]', badgeText: 'text-[#b42318]', badgeLabel: 'Vencida', metadataText: 'font-medium text-[#b42318]', metadataIcon: 'text-[#b42318]', separator: 'text-[#475467]' },
  today: { accent: 'bg-[#c2410c]', badgeBackground: 'bg-[#fff7e6]', badgeText: 'text-[#c2410c]', badgeLabel: 'Hoy', metadataText: 'font-medium text-[#c2410c]', metadataIcon: 'text-[#c2410c]', separator: 'text-[#475467]' },
  upcoming: { accent: 'bg-[#175cd3]', badgeBackground: 'bg-[#eff8ff]', badgeText: 'text-[#175cd3]', badgeLabel: 'Próxima', metadataText: 'font-medium text-[#175cd3]', metadataIcon: 'text-[#175cd3]', separator: 'text-[#475467]' },
  completed: { accent: 'bg-[#027a48]', badgeBackground: 'bg-[#ecfdf3]', badgeText: 'text-[#027a48]', badgeLabel: 'Completada', metadataText: 'font-medium text-[#475467]', metadataIcon: 'text-[#027a48]', separator: 'text-[#475467]' },
}

function formatTaskDate(date: string) {
  if (!date || !date.trim()) return 'Sin fecha'
  return formatCalendarDate(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatHours(hours: number) {
  if (Number.isInteger(hours)) return String(hours)
  return hours.toFixed(2).replace(/\.?0{1,2}$/, '')
}

export function TodayTaskCard({
  task,
  group,
  isHighlighted = false,
  onMouseEnter,
  onFocus,
  onClick,
  onOpenTask,
  onRegisterProgress,
  onRescheduleTask,
  loadingRescheduleId,
}: TodayTaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const styles = groupStyles[group]
  const detailsId = useId()

  const openDetails = () => {
    setIsDetailsOpen(prev => !prev)
  }

  return (
    <article
      id={`today-task-${task.id}`}
      onPointerEnter={onMouseEnter}
      onFocusCapture={onFocus}
      onClick={onClick}
      className={cn(
        'today-task-card relative flex w-full flex-col overflow-hidden rounded-xl border transition-all duration-300',
        isHighlighted
          ? 'border-[#4f46e5] bg-[#fafaff] ring-2 ring-[#4f46e5]/30 shadow-[0_4px_16px_rgba(79,70,229,0.08)]'
          : 'border-border-subtle bg-white shadow-sm hover:border-[#c7d2fe]',
      )}
    >
      <div
        className={cn('absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full transition-colors', styles.accent)}
        aria-hidden="true"
      />
      
      <div className="flex min-h-[104px] w-full flex-col gap-3 py-3 pl-4 pr-4 sm:min-h-[60px] sm:flex-row sm:items-center sm:py-2.5 sm:pl-5 sm:pr-4">
        <div className="min-w-0 flex-1">
          <h3 className="type-card-title line-clamp-2 text-wrap tracking-tight text-[#17212b]">
            <button
              type="button"
              aria-label={`Ver tarea: ${task.name}`}
              onClick={() => onOpenTask(task)}
              className="group inline-flex min-h-11 items-center rounded text-left focus-visible:outline-2 focus-visible:outline-[#4f46e5] sm:min-h-0"
            >
              <span className={cn(
                'transition-colors group-hover:text-[#4f46e5]',
                task.state === 'completed' || group === 'completed'
                  ? 'line-through text-[#667085]'
                  : 'text-[#17212b]',
              )}>
                {task.name}
              </span>
            </button>
          </h3>
          <div className={cn(
            'mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm leading-5',
            styles.metadataText,
          )}>
            <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap sm:w-[145px]">
              <Calendar className={cn('size-4 shrink-0', styles.metadataIcon)} aria-hidden="true" />
              <time dateTime={task.targetDate}>{formatTaskDate(task.targetDate)}</time>
            </span>
            <span aria-hidden="true" className={cn('shrink-0', styles.separator)}>•</span>
            <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap sm:w-[72px]">
              <Clock className={cn('size-4 shrink-0', styles.metadataIcon)} aria-hidden="true" />
              <span className="tabular-nums">{formatHours(task.estimatedHours)} h</span>
            </span>
            <span aria-hidden="true" className={cn('hidden sm:inline shrink-0', styles.separator)}>•</span>
            <button
              type="button"
              onClick={() => onOpenTask(task)}
              className="inline-flex min-h-7 max-w-[200px] truncate items-center rounded-md bg-[#f2f4f7] px-2 py-0.5 text-left text-xs font-semibold text-[#344054] transition-colors hover:bg-[#e4e7ec] hover:text-[#17212b] focus-visible:outline-2 focus-visible:outline-[#4f46e5] sm:max-w-[240px] sm:shrink-0"
              title={`${task.eventName} — Ver evento`}
            >
              {task.eventName}
            </button>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 sm:ml-4 sm:w-auto sm:shrink-0 sm:flex-nowrap">
          <span className={cn('inline-flex min-w-[80px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium leading-[15px] sm:min-w-[88px] sm:px-3', styles.badgeBackground, styles.badgeText)}>
            {styles.badgeLabel}
          </span>

          {onRegisterProgress && (
            <Button
              type="button"
              onClick={() => onRegisterProgress(task)}
              aria-label={`Registrar avance de ${task.name}`}
              className="h-11 rounded-lg bg-[#4f46e5] px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] sm:h-9"
            >
              <ListTodo className="size-4 shrink-0" aria-hidden="true" />
              <span>Registrar avance</span>
            </Button>
          )}

          <TodayTaskActionsMenu
            task={task}
            disabled={loadingRescheduleId !== null && loadingRescheduleId !== undefined}
            isDetailsOpen={isDetailsOpen}
            onRegisterProgress={t => onRegisterProgress?.(t)}
            onReschedule={t => onRescheduleTask?.(t)}
            onViewDetails={() => openDetails()}
          />
        </div>
      </div>

      {isDetailsOpen && (
        <div id={detailsId} className="border-t border-[#eaecf0] bg-[#fcfcfd] px-4 py-3 text-left">
          <p className="text-xs font-semibold text-[#17212b]">Detalles de la tarea</p>
          <p className="mt-1 break-words text-xs leading-5 text-[#667085]">{task.details || 'Esta tarea no tiene notas adicionales.'}</p>
        </div>
      )}
    </article>
  )
}
