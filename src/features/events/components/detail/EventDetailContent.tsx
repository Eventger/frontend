import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/layout/PageTitle'
import { getCalendarDate } from '@/lib/calendar'
import { EmptyTasksState } from '@/features/events/components/detail/EmptyTasksState'
import { EventInfoCard } from '@/features/events/components/detail/EventInfoCard'
import { EventTaskCard } from '@/features/events/components/detail/EventTaskCard'
import { RegisterProgressDialog } from '@/features/events/components/detail/RegisterProgressDialog'
import { RescheduleTaskDialog } from '@/features/events/components/detail/RescheduleTaskDialog'

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
  onSubtaskUpdated?: (subtask: Subtask) => Promise<void> | void
}

export function EventDetailContent({
  event,
  subtasks,
  eventTypeName,
  eventDescription,
  onAddTask,
  onEditEvent,
  onDeleteEvent,
  onSubtaskUpdated,
}: EventDetailContentProps) {
  const [progressTask, setProgressTask] = useState<Subtask | null>(null)
  const [reschedulingTask, setReschedulingTask] = useState<Subtask | null>(null)
  
  // 1. Creamos un estado local para las subtareas para poder modificarlas en tiempo real
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>(subtasks)

  // Sincronizar si las props cambian desde afuera
  useEffect(() => {
    setLocalSubtasks(subtasks)
  }, [subtasks])

  const hasTasks = localSubtasks.length > 0
  const todayValue = getCalendarDate(new Date())

  const getTaskRank = (subtask: Subtask) => {
    if (subtask.state === 'completed') return 0
    if (subtask.state === 'in_progress') return 1
    if (subtask.state === 'postponed') return 5
    const targetValue = getCalendarDate(subtask.targetDate)
    if (targetValue > todayValue) return 2
    if (targetValue === todayValue) return 3
    return 4
  }

  const orderedSubtasks = [...localSubtasks].sort((left, right) => getTaskRank(left) - getTaskRank(right))

  const focusProgress = () => {
    document.getElementById('event-progress')?.focus()
  }

  // Función común para actualizar la subtarea tanto en el backend como en el estado local
  const handleSaveSubtask = async (updatedTask: Subtask) => {
    // 2. Actualizamos el estado local inmediatamente (cambio visual instantáneo)
    setLocalSubtasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    )

    // 3. Notificamos al componente padre/backend
    if (onSubtaskUpdated) {
      await onSubtaskUpdated(updatedTask)
    }
  }

  return (
    <>
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <PageTitle>{event.name}</PageTitle>
        <div className="flex shrink-0 items-center gap-4">
          <Button type="button" variant="outline" onClick={onEditEvent} className="h-11 rounded-lg border-border-subtle bg-white px-5 font-semibold text-[#17212b] hover:bg-[#f8fafc] sm:w-[138px]">Editar evento</Button>
          <Button type="button" onClick={onDeleteEvent} className="h-11 rounded-lg bg-[#c9413b] px-5 font-semibold text-white hover:bg-[#ad3530] focus-visible:ring-[#c2413a]/30 sm:w-[118px]">Eliminar</Button>
        </div>
      </header>

      <div className="mt-8">
        <EventInfoCard eventDate={event.eventDate} location={event.location} contact={event.contact} subtasks={localSubtasks} eventTypeName={eventTypeName} description={eventDescription} />
      </div>

      <section className="mt-7">
        <div className="flex min-h-12 flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-[20px] font-semibold leading-6 text-[#17212b]">Plan logístico</h2>
            <p className="mt-0.5 text-[12px] text-[#667085]">Las tareas se gestionan desde Editar evento.</p>
          </div>
          {hasTasks && (
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Button type="button" onClick={focusProgress} className="h-11 rounded-lg bg-[#eef2ff] px-5 text-[14px] font-semibold text-[#3730a3] hover:bg-[#e0e7ff] sm:min-w-[207px]">Ver progreso detallado</Button>
            </div>
          )}
        </div>

        <div className="mt-2.5">
          {!hasTasks ? (
            <EmptyTasksState onAddTask={onAddTask} onEditEvent={onEditEvent} />
          ) : (
            <div role="region" aria-label="Lista de tareas del evento" className="event-task-list space-y-2 rounded-xl pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2">
              {orderedSubtasks.map((subtask) => (
                <EventTaskCard
                  key={subtask.id}
                  subtask={subtask}
                  onRegisterProgress={setProgressTask}
                  onReschedule={setReschedulingTask}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {progressTask && (
        <RegisterProgressDialog
          key={progressTask.id}
          task={progressTask}
          onClose={() => setProgressTask(null)}
          onSaved={async (updatedTask) => {
            await handleSaveSubtask(updatedTask)
            setProgressTask(null)
          }}
        />
      )}

      {reschedulingTask && (
        <RescheduleTaskDialog
          key={reschedulingTask.id}
          task={reschedulingTask}
          eventDate={event.eventDate}
          onClose={() => setReschedulingTask(null)}
          onSaved={async (updatedTask) => {
            await handleSaveSubtask(updatedTask)
            setReschedulingTask(null)
          }}
        />
      )}
    </>
  )
}