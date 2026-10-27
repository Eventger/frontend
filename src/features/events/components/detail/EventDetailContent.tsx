import { useState, useEffect, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/layout/PageTitle'
import { EmptyTasksState } from '@/features/events/components/detail/EmptyTasksState'
import { EventInfoCard } from '@/features/events/components/detail/EventInfoCard'
import { EventTaskCard } from '@/features/events/components/detail/EventTaskCard'
import { EditSubtaskDialog } from '@/features/events/components/detail/EditSubtaskDialog'
import { RegisterProgressDialog } from '@/features/events/components/detail/RegisterProgressDialog'
import { RescheduleTaskDialog } from '@/features/events/components/detail/RescheduleTaskDialog'
import { sortSubtasksForEventDetail } from '@/features/events/utils/taskSort'

import type { Event } from '@/features/events/types/event.types'
import type { Subtask } from '@/features/events/types/subtask.types'

type EventDetailContentProps = {
  event: Event
  subtasks: Subtask[]
  eventTypeName?: string
  highlightedSubtaskId?: number | null
  dailyLimitHours?: number
  onAddTask: () => void
  onEditEvent: () => void
  onDeleteEvent?: () => void
  onDeleteTask?: (subtask: Subtask) => void
  onSubtaskUpdated?: (subtask: Subtask) => Promise<void> | void
  onEditTask?: (subtask: Subtask) => void
  onViewProgress?: () => void
}

export function EventDetailContent({
  event,
  subtasks,
  eventTypeName,
  highlightedSubtaskId,
  dailyLimitHours,
  onAddTask,
  onEditEvent,
  onDeleteEvent,
  onDeleteTask,
  onSubtaskUpdated,
  onEditTask,
  onViewProgress,
}: EventDetailContentProps) {
  const [progressTask, setProgressTask] = useState<Subtask | null>(null)
  const [reschedulingTask, setReschedulingTask] = useState<Subtask | null>(null)
  const [editingTask, setEditingTask] = useState<Subtask | null>(null)
  
  // 1. Creamos un estado local para las subtareas para poder modificarlas en tiempo real
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>(subtasks)

  // Sincronizar si las props cambian desde afuera
  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    setLocalSubtasks(subtasks)
  }, [subtasks])

  const hasTasks = localSubtasks.length > 0

  const orderedSubtasks = useMemo(
    () => sortSubtasksForEventDetail(localSubtasks),
    [localSubtasks],
  )

  const handleViewProgress = () => {
    if (onViewProgress) {
      onViewProgress()
    } else {
      document.getElementById('event-progress')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      document.getElementById('event-progress')?.focus()
    }
  }

  const [selectedSubtaskId, setSelectedSubtaskId] = useState<number | null>(highlightedSubtaskId ?? null)
  const [hoveredSubtaskId, setHoveredSubtaskId] = useState<number | null>(null)

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    setSelectedSubtaskId(highlightedSubtaskId ?? null)
  }, [highlightedSubtaskId])

  const activeSubtaskId = hoveredSubtaskId ?? selectedSubtaskId

  useEffect(() => {
    if (!highlightedSubtaskId) return
    const el = document.getElementById(`task-${highlightedSubtaskId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightedSubtaskId, orderedSubtasks])

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
      <header className="flex flex-col justify-between gap-5 sm:min-h-16 sm:flex-row sm:items-start">
        <PageTitle>{event.name}</PageTitle>
        <div className="flex shrink-0 items-center gap-3">
          <Button type="button" variant="outline" onClick={onEditEvent} className="h-11 rounded-lg border-border-subtle bg-white px-5 font-semibold text-[#17212b] hover:bg-[#f8fafc] sm:w-auto">Editar evento</Button>
          <Button type="button" onClick={onDeleteEvent} className="h-11 rounded-lg bg-[#c1241b] px-5 font-semibold text-white hover:bg-[#a81f18] focus-visible:ring-[#c1241b]/30 sm:w-auto">Eliminar</Button>
        </div>
      </header>

      <div className="mt-8">
        <EventInfoCard
          eventDate={event.eventDate}
          location={event.location}
          contact={event.contact}
          subtasks={localSubtasks}
          eventTypeName={eventTypeName}
        />
      </div>

      <section className="w-full mt-7 pb-24 sm:pb-32">
        <div className="flex min-h-12 w-full flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="type-section-title text-[#17212b]">Plan logístico</h2>
            <p className="mt-0.5 text-xs text-[#667085]">Actividades y tareas programadas para este evento.</p>
          </div>
          {hasTasks && (
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={handleViewProgress}
                className="h-11 rounded-lg bg-[#eef2ff] px-5 text-sm font-semibold text-[#3730a3] hover:bg-[#e0e7ff]"
              >
                Ver progreso detallado
              </Button>
            </div>
          )}
        </div>

        <div className="w-full mt-2.5">
          {!hasTasks ? (
            <EmptyTasksState onAddTask={onAddTask} onEditEvent={onEditEvent} />
          ) : (
            <div
              role="region"
              aria-label="Lista de tareas del evento"
              onMouseLeave={() => setHoveredSubtaskId(null)}
              className="event-task-list w-full space-y-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
            >
              {orderedSubtasks.map((subtask) => (
                <EventTaskCard
                  key={subtask.id}
                  subtask={subtask}
                  isHighlighted={activeSubtaskId === subtask.id}
                  onMouseEnter={() => setHoveredSubtaskId(subtask.id)}
                  onFocus={() => {
                    setHoveredSubtaskId(subtask.id)
                    setSelectedSubtaskId(subtask.id)
                  }}
                  onClick={() => setSelectedSubtaskId(subtask.id)}
                  onRegisterProgress={setProgressTask}
                  onReschedule={setReschedulingTask}
                  onDelete={onDeleteTask}
                  onEdit={(task) => {
                    if (onEditTask) onEditTask(task)
                    else setEditingTask(task)
                  }}
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
          }}
        />
      )}

      {!onEditTask && editingTask && (
        <EditSubtaskDialog
          key={editingTask.id}
          subtask={editingTask}
          eventDate={event.eventDate}
          dailyLimitHours={dailyLimitHours}
          onClose={() => setEditingTask(null)}
          onSaved={async (updatedTask) => {
            await handleSaveSubtask(updatedTask)
            setEditingTask(null)
          }}
        />
      )}

    </>
  )
}
