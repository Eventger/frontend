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
}: EventDetailContentProps) {
  const hasTasks = subtasks.length > 0

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
          {event.name}
        </h1>

        <p className="mt-2 text-sm text-[#667085] md:text-[15px]">
          {formatEventDate(event.eventDate)}
          {' · '}
          {event.location}
        </p>
      </header>

      <div className="mt-8 max-w-[460px]">
        <EventProgressCard
          subtasks={subtasks}
        />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[#17212b]">
            Plan logístico
          </h2>

          {hasTasks && (
            <Button
              type="button"
              variant="outline"
              onClick={onAddTask}
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
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}