import { useState } from 'react'
import { useNavigate } from 'react-router'

import { AppLayout } from '@/components/layout/AppLayout'
import { CreateEventError } from '@/features/events/components/CreateEventError'
import { CreateEventSuccess } from '@/features/events/components/CreateEventSuccess'
import { EventForm } from '@/features/events/components/EventForm'
import { createEvent } from '@/features/events/services/event.service'
import { createSubtask } from '@/features/events/services/subtasks.service'
import type {
  CreateEventInput,
  Event,
} from '@/features/events/types/event.types'
import type {
  CreateSubtaskInput,
} from '@/features/events/types/subtask.types'
type CreateEventView =
  | 'form'
  | 'success'
  | 'error'

export function CreateEventPage() {
  const navigate = useNavigate()

  const [view, setView] =
    useState<CreateEventView>('form')

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [submittedData, setSubmittedData] =
    useState<CreateEventInput>()
  const [submittedSubtasks, setSubmittedSubtasks] =
    useState<CreateSubtaskInput[]>([])
  const [createdEvent, setCreatedEvent] =
    useState<Event>()

  const handleSubmit = async (
    data: CreateEventInput,
    subtasks: CreateSubtaskInput[],
  ) => {
    setSubmittedData(data)
    setSubmittedSubtasks(subtasks)
    setIsSubmitting(true)

    try {
      const event = await createEvent(data)
      for (const subtask of subtasks) {
        await createSubtask(event.id, subtask)
    }
      setCreatedEvent(event)
      setView('success')
    } catch {
      setView('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 md:px-8 md:py-12">
        {view === 'form' && (
          <>
            <header>
              <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
                Crear evento
              </h1>

              <p className="mt-2 text-sm text-[#667085] md:text-[15px]">
                Completa la información básica de tu evento y agrega las tareas principales para dejarlo listo.
              </p>
            </header>

            <div className="mt-3 max-w-[1040px]">
              <EventForm
                initialValues={submittedData}
                initialSubtasks={submittedSubtasks}
                onSubmit={handleSubmit}
                onCancel={() =>
                  navigate('/eventos')
                }
                isSubmitting={isSubmitting}
              />
            </div>
          </>
        )}

        {view === 'success' && createdEvent && (
          <CreateEventSuccess
            event={createdEvent}
          />
        )}

        {view === 'error' && submittedData && (
          <CreateEventError
            eventName={submittedData.name}
            onReview={() => setView('form')}
          />
        )}
      </div>
    </AppLayout>
  )
}