import { TodayTaskCard } from './TodayTaskCard'

import type {
  TodayTaskItem,
} from '@/features/today/types/today.types'

type TaskGroup =
  | 'overdue'
  | 'today'
  | 'upcoming'

type TodayTaskSectionProps = {
  title: string
  description?: string
  tasks: TodayTaskItem[]
  group: TaskGroup
  onOpenTask: (
    task: TodayTaskItem,
  ) => void
  onRescheduleTask?: (task: TodayTaskItem) => void
}

const countStyles: Record<
  TaskGroup,
  string
> = {
  overdue:
    'bg-[#b42318] text-white',

  today:
    'bg-[#b54708] text-white',

  upcoming:
    'bg-[#175cd3] text-white',
}

export function TodayTaskSection({
  title,
  description,
  tasks,
  group,
  onOpenTask,
  onRescheduleTask,
}: TodayTaskSectionProps) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <section>
      <div className="mb-[7px] flex items-center gap-2">
        <h2 className="text-[21px] font-semibold leading-[25px] text-[#17212b]">
          {title}
        </h2>

        <span
          className={[
            'inline-flex h-[26px] min-w-[34px] items-center justify-center rounded-full px-2 text-[12px] font-semibold',
            countStyles[group],
          ].join(' ')}
        >
          {tasks.length}
        </span>
      </div>

      {description && (
        <p className="mb-3 text-[12px] text-[#667085]">
          {description}
        </p>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <TodayTaskCard
            key={task.id}
            task={task}
            group={group}
            onOpenTask={
              onOpenTask
            }
            onRescheduleTask={onRescheduleTask}
          />
        ))}
      </div>
    </section>
  )
}
