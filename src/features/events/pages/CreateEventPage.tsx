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
import { Button } from '@/components/ui/button'
import { CreateEventError } from '@/features/events/components/CreateEventError'
import { CreateEventSuccess } from '@/features/events/components/CreateEventSuccess'
import { DestructiveConfirmationDialog } from '@/features/events/components/detail/DestructiveConfirmationDialog'
import { EventForm } from '@/features/events/components/EventForm'
import {
  clearCreateEventDraft,
  readCreateEventDraft,
  saveCreateEventDraft,
} from '@/features/events/utils/createEventDraft'
import { createEvent } from '@/features/events/services/event.service'
import { createSubtask } from '@/features/events/services/subtasks.service'
import { usePlanningPreferences } from '@/features/settings/hooks/usePlanningPreferences'
import { getApiFieldError } from '@/lib/api'

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

  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

  const {
    authenticatedRequest,
  } = useAuthenticatedApi()
  const { dailyLimitHours } = usePlanningPreferences()

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

  const [serverFieldErrors, setServerFieldErrors] = useState<
    Partial<Record<keyof CreateEventInput, string>>
  >({})

  const hasDraftData = Boolean(
    submittedData?.name?.trim() ||
    submittedData?.location?.trim() ||
    submittedData?.contact?.trim() ||
    submittedSubtasks.length > 0
  )

  const handleCancelClick = () => {
    if (hasDraftData) {
      setIsCancelConfirmOpen(true)
    } else {
      handleConfirmCancel()
    }
  }

  const handleConfirmCancel = () => {
    clearCreateEventDraft(userId)
    navigate('/eventos', {
      viewTransition: true,
    })
  }

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
    setServerFieldErrors({})
    setIsSubmitting(true)

    try {
      const event =
        await createEvent(
          data,
          authenticatedRequest,
        )

      setCreatedEvent(event)
      await savePendingSubtasks(event, data, subtasks)
    } catch (error) {
      const dateError = getApiFieldError(error, 'date')
      const nameError = getApiFieldError(error, 'name')
      const locationError = getApiFieldError(error, 'location')
      const contactError = getApiFieldError(error, 'contact')
      const typeError = getApiFieldError(error, 'type')

      if (dateError || nameError || locationError || contactError || typeError) {
        setServerFieldErrors({
          ...(dateError ? { eventDate: dateError } : {}),
          ...(nameError ? { name: nameError } : {}),
          ...(locationError ? { location: locationError } : {}),
          ...(contactError ? { contact: contactError } : {}),
          ...(typeError ? { typeId: typeError } : {}),
        })
        setView('form')
      } else {
        setView('error')
      }
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
                dailyLimitHours={dailyLimitHours}
                onCancel={handleCancelClick}
                onDraftChange={
                  handleDraftChange
                }
                serverErrors={serverFieldErrors}
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
            createdEvent ? (
              <div className="flex flex-col items-center">
                <OperationFeedback
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
                    onClick: () => {
                      clearCreateEventDraft(userId)
                      navigate(`/evento/${createdEvent.id}`)
                    },
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    clearCreateEventDraft(userId)
                    setCreatedEvent(undefined)
                    setSubmittedData(undefined)
                    setSubmittedSubtasks([])
                    setView('form')
                  }}
                  className="mt-4 text-sm text-[#667085] hover:text-[#17212b]"
                >
                  Descartar tareas pendientes y crear otro evento
                </Button>
              </div>
            ) : <CreateEventError
              eventName={
                submittedData.name
              }
              onReview={() =>
                setView('form')
              }
            />
          )}
      </div>

      <DestructiveConfirmationDialog
        open={isCancelConfirmOpen}
        onOpenChange={setIsCancelConfirmOpen}
        title="¿Descartar evento?"
        description="Tienes información o tareas escritas en el borrador. Si sales ahora, se perderán todos los datos ingresados."
        confirmLabel="Descartar borrador"
        isDeleting={false}
        onConfirm={handleConfirmCancel}
      />
    </PageContainer>
  )
}
