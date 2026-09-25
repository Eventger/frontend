import { TodayTaskCard } from './TodayTaskCard'

import type {
  TodayTaskGroup,
  TodayTaskItem,
} from '@/features/today/types/today.types'

type TodayTaskSectionProps = {
  title: string
  description: string
  tasks: TodayTaskItem[]
  group: TodayTaskGroup
  onOpenTask: (
    task: TodayTaskItem,
  ) => void
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
      <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3">
        <h2 className="text-lg font-bold text-[#17212b]">
          {title}
        </h2>

        <p className="text-xs text-[#667085]">
          {description}
        </p>
      </div>

      <div className="mt-3 space-y-3">
        {tasks.map((task) => (
          <TodayTaskCard
            key={task.id}
            task={task}
            group={group}
            onOpen={() =>
              onOpenTask(task)
            }
          />
        ))}
      </div>
    </section>
  )
}