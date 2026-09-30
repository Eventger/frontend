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
}

const countStyles: Record<
  TaskGroup,
  string
> = {
  overdue:
    'bg-[#fef3f2] text-[#b42318]',

  today:
    'bg-[#fffaeb] text-[#b54708]',

  upcoming:
    'bg-[#eff8ff] text-[#175cd3]',
}

export function TodayTaskSection({
  title,
  description,
  tasks,
  group,
  onOpenTask,
}: TodayTaskSectionProps) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <section>
      <div className="mb-[7px] flex items-center gap-2">
        <h2 className="text-[18px] font-semibold leading-[25px] text-[#17212b]">
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
          />
        ))}
      </div>
    </section>
  )
}