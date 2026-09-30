import { useState } from 'react'
import { useNavigate } from 'react-router'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageFlowSurface } from '@/components/layout/PageFlowSurface'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'
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

type CreateEventDraft = {
  data: CreateEventInput
  subtasks: CreateSubtaskInput[]
}

const createEventDraftKey =
  'eventger:create-event-draft'

function readCreateEventDraft():
  | CreateEventDraft
  | undefined {
  try {
    const storedDraft =
      sessionStorage.getItem(
        createEventDraftKey,
      )

    if (!storedDraft) {
      return undefined
    }

    return JSON.parse(
      storedDraft,
    ) as CreateEventDraft
  } catch {
    sessionStorage.removeItem(
      createEventDraftKey,
    )
    return undefined
  }
}

export function CreateEventPage() {
  const navigate = useNavigate()

  const [initialDraft] =
    useState(readCreateEventDraft)

  const handleCancel = () => {
    sessionStorage.removeItem(
      createEventDraftKey,
    )

    navigate('/eventos', {
      viewTransition: true,
    })
  }

  const {
    authenticatedRequest,
  } = useAuthenticatedApi()

  const [view, setView] =
    useState<CreateEventView>('form')

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    submittedData,
    setSubmittedData,
  ] = useState<CreateEventInput | undefined>(
    initialDraft?.data,
  )

  const [
    submittedSubtasks,
    setSubmittedSubtasks,
  ] =
    useState<CreateSubtaskInput[]>(
      initialDraft?.subtasks ?? [],
    )

  const [
    createdEvent,
    setCreatedEvent,
  ] = useState<Event>()

  const handleSubmit = async (
    data: CreateEventInput,
    subtasks: CreateSubtaskInput[],
  ) => {
    setSubmittedData(data)
    setSubmittedSubtasks(subtasks)
    setIsSubmitting(true)

    try {
      const event =
        await createEvent(
          data,
          authenticatedRequest,
        )

      for (const subtask of subtasks) {
        await createSubtask(
          event.id,
          subtask,
          authenticatedRequest,
        )
      }

      sessionStorage.removeItem(
        createEventDraftKey,
      )
      setCreatedEvent(event)
      setView('success')
    } catch {
      setView('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDraftChange = (
    data: CreateEventInput,
    subtasks: CreateSubtaskInput[],
  ) => {
    sessionStorage.setItem(
      createEventDraftKey,
      JSON.stringify({
        data,
        subtasks,
      } satisfies CreateEventDraft),
    )
  }

  return (
    <PageContainer
      className={
        view === 'form'
          ? 'md:py-6'
          : undefined
      }
    >
      <div
        key={view}
        className="event-flow-view"
      >
        {view === 'form' && (
          <PageFlowSurface>
            <PageHeader
              title="Crear evento"
              description="Completa la información básica de tu evento y agrega las tareas principales para dejarlo listo."
            />

            <div className="mt-4">
              <EventForm
                initialValues={
                  submittedData
                }
                initialSubtasks={
                  submittedSubtasks
                }
                onSubmit={
                  handleSubmit
                }
                onCancel={handleCancel}
                onDraftChange={
                  handleDraftChange
                }
                isSubmitting={
                  isSubmitting
                }
              />
            </div>
          </PageFlowSurface>
        )}

        {view === 'success' &&
          createdEvent && (
            <CreateEventSuccess
              event={createdEvent}
            />
          )}

        {view === 'error' &&
          submittedData && (
            <CreateEventError
              eventName={
                submittedData.name
              }
              onReview={() =>
                setView('form')
              }
            />
          )}
      </div>
    </PageContainer>
  )
}
