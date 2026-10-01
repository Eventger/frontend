import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyTasksState } from '@/features/events/components/detail/EmptyTasksState'
import { EventInfoCard } from '@/features/events/components/detail/EventInfoCard'
import { EventTaskCard } from '@/features/events/components/detail/EventTaskCard'

import type { Event } from '@/features/events/types/event.types'
import type { Subtask } from '@/features/events/types/subtask.types'

type EventDetailContentProps = {
  event: Event
  subtasks: Subtask[]

  eventTypeName?: string
  eventDescription?: string

  onAddTask: () => void
  onEditEvent: () => void
  onDeleteEvent?: () => void
}

export function EventDetailContent({
  event,
  subtasks,
  eventTypeName,
  eventDescription,
  onAddTask,
  onEditEvent,
  onDeleteEvent,
}: EventDetailContentProps) {
  const hasTasks =
    subtasks.length > 0

  const today = new Date()
  const todayValue = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  )

  const getTaskRank = (
    subtask: Subtask,
  ) => {
    if (subtask.state === 'completed') {
      return 0
    }

    if (subtask.state === 'in_progress') {
      return 1
    }

    const targetDate = new Date(
      subtask.targetDate,
    )
    const targetValue = Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
    )

    if (targetValue > todayValue) {
      return 2
    }

    if (targetValue === todayValue) {
      return 3
    }

    return 4
  }

  const orderedSubtasks = [
    ...subtasks,
  ].sort(
    (left, right) =>
      getTaskRank(left) -
      getTaskRank(right),
  )

  const focusProgress = () => {
    document
      .getElementById(
        'event-progress',
      )
      ?.focus()
  }

  return (
    <>
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <h1 className="text-[28px] font-bold leading-9 tracking-[-0.02em] text-[#17212b] md:text-[30px]">
          {event.name}
        </h1>

        <div className="flex shrink-0 items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onEditEvent}
            className="h-11 rounded-[10px] border-[#d9dee7] bg-white px-5 font-semibold text-[#17212b] hover:bg-[#f8fafc] sm:w-[138px]"
          >
            Editar evento
          </Button>

          <Button
            type="button"
            onClick={
              onDeleteEvent
            }
            className="h-11 rounded-[10px] bg-[#c9413b] px-5 font-semibold text-white hover:bg-[#ad3530] focus-visible:ring-[#c2413a]/30 sm:w-[118px]"
          >
            Eliminar
          </Button>
        </div>
      </header>

      <div className="mt-8">
        <EventInfoCard
          eventDate={
            event.eventDate
          }
          location={
            event.location
          }
          contact={
            event.contact
          }
          subtasks={subtasks}
          eventTypeName={
            eventTypeName
          }
          description={
            eventDescription
          }
        />
      </div>

      <section className="mt-7">
        <div className="flex min-h-12 flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-[20px] font-semibold leading-6 text-[#17212b]">
              Plan logístico
            </h2>

            <p className="mt-0.5 text-[12px] text-[#667085]">
              Las tareas se gestionan desde Editar evento.
            </p>
          </div>

          {hasTasks && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onAddTask}
                className="pointer-events-none h-11 translate-y-1 rounded-[10px] border-[#c7d2fe] bg-white px-4 text-[13px] font-semibold text-[#4f46e5] opacity-0 transition-[opacity,transform] focus-visible:pointer-events-auto focus-visible:translate-y-0 focus-visible:opacity-100"
              >
                <Plus className="size-4" />
                Agregar tarea
              </Button>

              <Button
                type="button"
                onClick={focusProgress}
                className="h-11 rounded-[10px] bg-[#eef2ff] px-5 text-[14px] font-semibold text-[#3730a3] hover:bg-[#e0e7ff] sm:min-w-[207px]"
              >
                Ver progreso detallado
              </Button>
            </div>
          )}
        </div>

        <div className="mt-2.5">
          {!hasTasks ? (
            <EmptyTasksState
              onAddTask={onAddTask}
              onEditEvent={
                onEditEvent
              }
            />
          ) : (
            <div
              role="region"
              aria-label="Lista de tareas del evento"
              tabIndex={0}
              className="event-task-list space-y-2 rounded-[12px] pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
            >
              {orderedSubtasks.map(
                (subtask) => (
                  <EventTaskCard
                    key={
                      subtask.id
                    }
                    subtask={
                      subtask
                    }
                  />
                ),
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
