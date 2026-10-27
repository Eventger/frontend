import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TodayTaskCard } from './TodayTaskCard'
import type { TodayTaskItem } from '@/features/today/types/today.types'

type TaskGroup = 'overdue' | 'today' | 'upcoming' | 'completed'
type TodayTaskSectionProps = {
  title: string
  description?: string
  tasks: TodayTaskItem[]
  group: TaskGroup
  activeTaskId?: number | null
  onTaskMouseEnter?: (id: number | null) => void
  onTaskFocus?: (id: number) => void
  onTaskClick?: (id: number) => void
  onOpenTask: (task: TodayTaskItem) => void
  onRegisterProgress?: (task: TodayTaskItem) => void
  onRescheduleTask?: (task: TodayTaskItem) => void
  loadingRescheduleId?: number | null
}

const countStyles: Record<TaskGroup, string> = {
  overdue: 'bg-[#b42318] text-white',
  today: 'bg-[#b54708] text-white',
  upcoming: 'bg-[#175cd3] text-white',
  completed: 'bg-[#027a48] text-white',
}

// El módulo permanece vivo al navegar dentro de la aplicación. Mantener este
// estado evita que Volver colapse una lista que el usuario acababa de expandir
// y cambie la altura antes de restaurar el scroll.
const expandedGroups = new Set<TaskGroup>()

export function TodayTaskSection({
  title,
  description,
  tasks,
  group,
  activeTaskId,
  onTaskMouseEnter,
  onTaskFocus,
  onTaskClick,
  onOpenTask,
  onRegisterProgress,
  onRescheduleTask,
  loadingRescheduleId,
}: TodayTaskSectionProps) {
  const [isExpanded, setIsExpanded] = useState(() => expandedGroups.has(group))
  const taskListId = useId()

  if (tasks.length === 0) return null

  const canToggle = tasks.length > 3
  const visibleTasks = canToggle && !isExpanded ? tasks.slice(0, 3) : tasks

  return (
    <section>
      <div className="mb-[7px] flex min-h-11 items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="type-section-title text-[#17212b]">{title}</h2>
          <span className={['inline-flex h-[26px] min-w-[34px] items-center justify-center rounded-full px-2 text-[12px] font-semibold', countStyles[group]].join(' ')}>{tasks.length}</span>
        </div>

        {canToggle && (
          <Button
            type="button"
            variant="secondary"
            aria-expanded={isExpanded}
            aria-controls={taskListId}
            aria-label={isExpanded ? `Ver menos tareas de ${title}` : `Ver todas las tareas de ${title} (${tasks.length})`}
            onClick={() => setIsExpanded(current => {
              const next = !current
              if (next) expandedGroups.add(group)
              else expandedGroups.delete(group)
              return next
            })}
            className="group ml-auto inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-3.5 text-[12px] font-semibold text-[#3730a3] shadow-xs transition-all duration-150 hover:border-[#818cf8] hover:bg-[#e0e7ff] hover:text-[#1e1b4b] hover:shadow-sm active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
          >
            <span>{isExpanded ? 'Ver menos tareas' : `Ver las ${tasks.length} tareas`}</span>
            <ChevronDown
              className={[
                'size-3.5 text-[#4f46e5] transition-transform duration-200 motion-reduce:transition-none group-hover:translate-y-0.5',
                isExpanded ? 'rotate-180 group-hover:-translate-y-0.5' : '',
              ].join(' ')}
              aria-hidden="true"
            />
          </Button>
        )}
      </div>
      {description && <p className="mb-3 text-[12px] text-[#667085]">{description}</p>}
      <div id={taskListId} className="space-y-2">
        {visibleTasks.map(task => (
          <TodayTaskCard
            key={task.id}
            task={task}
            group={group}
            isHighlighted={activeTaskId === task.id}
            onMouseEnter={() => onTaskMouseEnter?.(task.id)}
            onFocus={() => onTaskFocus?.(task.id)}
            onClick={() => onTaskClick?.(task.id)}
            onOpenTask={onOpenTask}
            onRegisterProgress={onRegisterProgress}
            onRescheduleTask={onRescheduleTask}
            loadingRescheduleId={loadingRescheduleId}
          />
        ))}
      </div>
    </section>
  )
}
