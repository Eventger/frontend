import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@clerk/react'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageFlowSurface } from '@/components/layout/PageFlowSurface'
import { usePageFlowNavigation } from '@/components/layout/usePageFlowNavigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'
import { AuthLoadingState } from '@/features/auth/components/AuthLoadingState'
import { OperationFeedback } from '@/components/OperationFeedback'
import { CreateEventError } from '@/features/events/components/CreateEventError'
import { CreateEventSuccess } from '@/features/events/components/CreateEventSuccess'
import { EventForm } from '@/features/events/components/EventForm'
import {
  clearCreateEventDraft,
  readCreateEventDraft,
  saveCreateEventDraft,
} from '@/features/events/utils/createEventDraft'
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
  const { userId } = useAuth()

  return userId
    ? <CreateEventContent key={userId} userId={userId} />
    : <AuthLoadingState />
}

function CreateEventContent({ userId }: { userId: string }) {
  const navigate = useNavigate()

  const [initialDraft] =
    useState(() => readCreateEventDraft(userId))

  const handleCancel = () => {
    clearCreateEventDraft(userId)

    navigate('/eventos', {
      viewTransition: true,
    })
  }

  const {
    authenticatedRequest,
  } = useAuthenticatedApi()

  const [view, setView] =
    useState<CreateEventView>(initialDraft?.createdEvent ? 'error' : 'form')

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
  ] = useState<Event | undefined>(initialDraft?.createdEvent)

  const pendingTasksLabel = `${submittedSubtasks.length} ${
    submittedSubtasks.length === 1 ? 'tarea pendiente' : 'tareas pendientes'
  }`

  const savePendingSubtasks = async (
    event: Event,
    data: CreateEventInput,
    subtasks: CreateSubtaskInput[],
  ) => {
    const remaining = [...subtasks]
    saveCreateEventDraft(userId, { data, subtasks: remaining, createdEvent: event })
    for (const subtask of subtasks) {
      await createSubtask(event.id, subtask, authenticatedRequest)
      remaining.shift()
      setSubmittedSubtasks([...remaining])
      saveCreateEventDraft(userId, { data, subtasks: [...remaining], createdEvent: event })
    }
    clearCreateEventDraft(userId)
    setView('success')
  }

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

      setCreatedEvent(event)
      await savePendingSubtasks(event, data, subtasks)
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
    if (createdEvent) return
    saveCreateEventDraft(userId, { data, subtasks })
  }

  const retryPendingSubtasks = async () => {
    if (!createdEvent || !submittedData || isSubmitting) return
    setIsSubmitting(true)
    try {
      await savePendingSubtasks(createdEvent, submittedData, submittedSubtasks)
    } catch {
      setView('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const flowContentRef = usePageFlowNavigation(view)

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'Hoy', to: '/hoy' },
        { label: 'Eventos', to: '/eventos' },
        { label: view === 'success' ? 'Evento creado' : createdEvent ? 'Tareas pendientes' : 'Crear evento' },
      ]}
    >
      <div
        ref={flowContentRef}
        key={view}
        className={view === 'form' ? undefined : 'event-flow-view'}
      >
        {view === 'form' && (
          <>
            <PageHeader
              title="Crear evento"
              description="Completa la información básica de tu evento y agrega las tareas principales para dejarlo listo."
            />

            <PageFlowSurface className="mt-4">
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
            </PageFlowSurface>
          </>
        )}

        {view === 'success' &&
          createdEvent && (
            <CreateEventSuccess
              event={createdEvent}
            />
          )}

        {view === 'error' &&
          submittedData && (
            createdEvent ? <OperationFeedback
              pageTitle="Evento creado con tareas pendientes"
              status="error"
              title="No pudimos guardar todas las tareas"
              description={`${createdEvent.name} ya se creó. Conservamos ${pendingTasksLabel} para que puedas reintentar sin crear otro evento.`}
              primaryAction={{
                label: 'Reintentar tareas',
                onClick: () => void retryPendingSubtasks(),
                loading: isSubmitting,
              }}
              secondaryAction={{
                label: 'Ver detalle del evento',
                onClick: () => navigate(`/evento/${createdEvent.id}`),
              }}
            /> : <CreateEventError
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
