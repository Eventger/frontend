import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyTasksState } from '@/features/events/components/detail/EmptyTasksState'
import { EventProgressCard } from '@/features/events/components/detail/EventProgressCard'
import { EventTaskCard } from '@/features/events/components/detail/EventTaskCard'

import type { Event } from '@/features/events/types/event.types'
import type { Subtask } from '@/features/events/types/subtask.types'

type EventDetailContentProps = {
  event: Event
  subtasks: Subtask[]
  onAddTask: () => void
  onEditTask: (
    subtask: Subtask,
  ) => void
  onDeleteTask: (
    subtask: Subtask,
  ) => void

  onEditEvent: () => void
  onDeleteEvent?: () => void
}

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date))
}

export function EventDetailContent({
  event,
  subtasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditEvent,
  onDeleteEvent,
}: EventDetailContentProps) {
  const hasTasks = subtasks.length > 0

  return (
    <>
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
            {event.name}
          </h1>

          <p className="mt-2 text-sm text-[#667085] md:text-[15px]">
            {formatEventDate(
              event.eventDate,
            )}
            {' · '}
            {event.location}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onEditEvent}
            className="h-11 rounded-[10px] sm:w-[140px]"
          >
            Editar evento
          </Button>

          <Button
            type="button"
            onClick={onDeleteEvent}
            className="h-11 rounded-[10px] bg-[#b42318] text-white hover:bg-[#912018] sm:w-[120px]"
          >
            Eliminar
          </Button>
        </div>
      </header>

      <div className="mt-8 max-w-[460px]">
        <EventProgressCard
          subtasks={subtasks}
        />
      </div>

      <section className="mt-10">
        <div className="flex max-w-[820px] items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[#17212b]">
            Plan logístico
          </h2>

          {hasTasks && (
            <Button
              type="button"
              onClick={onAddTask}
              className="h-11 w-40 rounded-[10px] bg-[#4f46e5] text-[14px] font-semibold text-white hover:bg-[#4338ca]"
            >
              <Plus />
              Agregar tarea
            </Button>
          )}
        </div>

        <div className="mt-5">
          {!hasTasks ? (
            <EmptyTasksState
              eventName={event.name}
              onAddTask={onAddTask}
            />
          ) : (
            <div className="max-w-[820px] space-y-4">
              {subtasks.map((subtask) => (
                <EventTaskCard
                  key={subtask.id}
                  subtask={subtask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
