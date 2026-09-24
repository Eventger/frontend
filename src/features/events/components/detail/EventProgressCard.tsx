import type { Subtask } from '@/features/events/types/subtask.types'

type EventProgressCardProps = {
  subtasks: Subtask[]
}

export function EventProgressCard({
  subtasks,
}: EventProgressCardProps) {
  const totalSubtasks = subtasks.length

  const completedSubtasks =
    subtasks.filter(
      (subtask) =>
        subtask.state === 'completed',
    ).length

  const progress =
    totalSubtasks === 0
      ? null
      : Math.round(
          (completedSubtasks / totalSubtasks) * 100,
        )

  return (
    <div className="rounded-2xl border border-[#dde2ea] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[#17212b]">
          Progreso de preparación
        </p>

        <span className="text-xl font-semibold text-[#17212b]">
          {progress !== null
            ? `${progress} %`
            : '—'}
        </span>
      </div>

      {progress !== null ? (
        <>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5e7eb]">
            <div
              className="h-full rounded-full bg-[#4f46e5]"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="mt-3 text-xs text-[#667085]">
            {completedSubtasks} de {totalSubtasks} tareas completadas
          </p>
        </>
      ) : (
        <p className="mt-3 text-xs text-[#667085]">
          Agrega tareas para comenzar a medir el progreso.
        </p>
      )}
    </div>
  )
}