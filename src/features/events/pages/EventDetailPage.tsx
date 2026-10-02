import {
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageFlowSurface } from '@/components/layout/PageFlowSurface'
import { PageHeader } from '@/components/layout/PageHeader'

import {
  useAuthenticatedApi,
} from '@/features/auth/hooks/useAuthenticatedApi'

import { AddSubtaskDialog } from '@/features/events/components/detail/AddSubtaskDialog'
import { CreateSubtaskError } from '@/features/events/components/detail/CreateSubtaskError'
import { CreateSubtaskSuccess } from '@/features/events/components/detail/CreateSubtaskSuccess'
import { EventDetailContent } from '@/features/events/components/detail/EventDetailContent'
import { EventDetailErrorState } from '@/features/events/components/detail/EventDetailErrorState'
import { EventDetailLoadingState } from '@/features/events/components/detail/EventDetailLoadingState'
import { EventNotFoundState } from '@/features/events/components/detail/EventNotFoundState'

import {
  DeleteEventError,
  DeleteEventSuccess,
  EditEventError,
  EditEventSuccess,
} from '../components/edit/EventOperationFeedback'

import { EditEventForm } from '../components/edit/EditEventForm'
import { DeleteEventDialog } from '../components/detail/DeleteEventDialog'

import { useEventDetail } from '@/features/events/hooks/useEventDetail'
import { useEventSubtasks } from '@/features/events/hooks/useEventSubtasks'

import {
  createSubtask,
  deleteSubtask,
  updateSubtask,
} from '@/features/events/services/subtasks.service'

import {
  updateEvent,
  deleteEvent,
} from '@/features/events/services/event.service'

import type {
  CreateSubtaskInput,
  Subtask,
  UpdateSubtaskInput,
} from '@/features/events/types/subtask.types'

import { useEventTypes } from '../hooks/useEventTypes'

import type {
  Event,
  UpdateEventInput,
} from '../types/event.types'

type DetailFlowView =
  | 'detail'
  | 'create-success'
  | 'create-error'
  | 'event-edit'
  | 'event-edit-success'
  | 'event-edit-error'
  | 'event-delete-success'
  | 'event-delete-error'

export function EventDetailPage() {
  const { id } = useParams()

  const parsedId = Number(id)

  const navigate = useNavigate()

  const {
    authenticatedRequest,
  } = useAuthenticatedApi()

  const eventId =
    Number.isInteger(parsedId) &&
    parsedId > 0
      ? parsedId
      : null

  const {
    eventTypes,
    isLoading: isLoadingEventTypes,
    error: eventTypesError,
    retry: retryEventTypes,
  } = useEventTypes()

  const {
    event,
    isLoading: isLoadingEvent,
    error: eventError,
    retry: retryEvent,
  } = useEventDetail(eventId)

  const {
    subtasks,
    isLoading: isLoadingSubtasks,
    error: subtasksError,
    refresh: refreshSubtasks,
  } = useEventSubtasks(event?.id ?? null)

  const [view, setView] =
    useState<DetailFlowView>('detail')

  const [
    isAddSubtaskOpen,
    setIsAddSubtaskOpen,
  ] = useState(false)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    submittedData,
    setSubmittedData,
  ] =
    useState<CreateSubtaskInput | null>(
      null,
    )

  const [
    createdSubtask,
    setCreatedSubtask,
  ] =
    useState<Subtask | null>(
      null,
    )

  const [
    formVersion,
    setFormVersion,
  ] = useState(0)

  const isLoading =
    isLoadingEvent ||
    (event !== null && isLoadingSubtasks)

  const error =
    eventError ?? (event ? subtasksError : null)

  const retry = async () => {
    await Promise.all([
      retryEvent(),
      refreshSubtasks(),
    ])
  }

  const [
    submittedEventData,
    setSubmittedEventData,
  ] =
    useState<UpdateEventInput | null>(
      null,
    )

  const [
    updatedEvent,
    setUpdatedEvent,
  ] =
    useState<Event | null>(
      null,
    )

  const [
    isUpdatingEvent,
    setIsUpdatingEvent,
  ] = useState(false)

  const [
    isDeleteEventOpen,
    setIsDeleteEventOpen,
  ] = useState(false)

  const [
    isDeletingEvent,
    setIsDeletingEvent,
  ] = useState(false)

  const [
    deletedEventName,
    setDeletedEventName,
  ] =
    useState<string | null>(
      null,
    )

  const currentEvent =
    updatedEvent ?? event

  const currentEventTypeName =
    currentEvent
      ? eventTypes.find(
          (eventType) =>
            eventType.id ===
            currentEvent.typeId,
        )?.name
      : undefined

  const currentEventDescription =
    currentEvent
      ? eventTypes.find(
          (eventType) =>
            eventType.id ===
            currentEvent.typeId,
        )?.description
      : undefined

  const handleCreateSubtask = async (
    data: CreateSubtaskInput,
  ) => {
    if (eventId === null) {
      return
    }

    setSubmittedData(data)
    setIsSubmitting(true)

    try {
      const created =
        await createSubtask(
          eventId,
          data,
          authenticatedRequest,
        )

      setCreatedSubtask(created)

      setIsAddSubtaskOpen(false)
      setView('create-success')

      void refreshSubtasks()
    } catch {
      setIsAddSubtaskOpen(false)
      setView('create-error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetryCreate = async () => {
    if (!submittedData) {
      return
    }

    await handleCreateSubtask(
      submittedData,
    )
  }

  const handleReturnToEvent = () => {
    setView('detail')

    void refreshSubtasks()
  }

  const handleAddAnother = () => {
    setView('detail')

    setFormVersion(
      (current) => current + 1,
    )

    setIsAddSubtaskOpen(true)
  }

  const handleUpdateEvent = async (
    data: UpdateEventInput,
  ) => {
    if (eventId === null) {
      return
    }

    setSubmittedEventData(data)
    setIsUpdatingEvent(true)

    try {
      const updated =
        await updateEvent(
          eventId,
          data,
          authenticatedRequest,
        )

      setUpdatedEvent(updated)

      setView(
        'event-edit-success',
      )
    } catch {
      setView(
        'event-edit-error',
      )
    } finally {
      setIsUpdatingEvent(false)
    }
  }

  const handleRetryUpdateEvent =
    async () => {
      if (!submittedEventData) {
        return
      }

      await handleUpdateEvent(
        submittedEventData,
      )
    }

  const handleCancelEventEdit =
    () => {
      setSubmittedEventData(null)

      setView('detail')
    }

  const handleContinueEditingEvent =
    () => {
      setView('event-edit')
    }

  const handleReturnFromEventEdit =
    () => {
      setSubmittedEventData(null)

      setView('detail')

      void retryEvent()
    }

  const handleCreateSubtaskFromEdit =
    async (
      data: CreateSubtaskInput,
    ) => {
      if (eventId === null) {
        throw new Error(
          'Evento no disponible',
        )
      }

      await createSubtask(
        eventId,
        data,
        authenticatedRequest,
      )

      await refreshSubtasks()
    }

  const handleUpdateSubtaskFromEdit =
    async (
      subtask: Subtask,
      data: UpdateSubtaskInput,
    ) => {
      await updateSubtask(
        subtask.id,
        data,
        authenticatedRequest,
      )

      await refreshSubtasks()
    }

  const handleDeleteSubtaskFromEdit =
    async (subtask: Subtask) => {
      await deleteSubtask(
        subtask.id,
        authenticatedRequest,
      )

      await refreshSubtasks()
    }

  const handleOpenDeleteEvent = () => {
    setIsDeleteEventOpen(true)
  }

  const handleConfirmDeleteEvent =
    async () => {
      if (
        eventId === null ||
        !currentEvent
      ) {
        return
      }

      setIsDeletingEvent(true)

      try {
        const eventName =
          currentEvent.name

        await deleteEvent(
          eventId,
          authenticatedRequest,
        )

        setDeletedEventName(
          eventName,
        )

        setIsDeleteEventOpen(
          false,
        )

        setView(
          'event-delete-success',
        )
      } catch {
        setIsDeleteEventOpen(
          false,
        )

        setView(
          'event-delete-error',
        )
      } finally {
        setIsDeletingEvent(false)
      }
    }

  const handleRetryDeleteEvent =
    async () => {
      await handleConfirmDeleteEvent()
    }

  return (
    <PageContainer
      className={
        view === 'event-edit'
          ? 'md:py-6'
          : undefined
      }
    >
      <div
        key={view}
        className="event-flow-view"
      >
        {view === 'create-success' &&
          event &&
          createdSubtask && (
            <CreateSubtaskSuccess
              subtask={createdSubtask}
              eventName={event.name}
              onAddAnother={
                handleAddAnother
              }
              onReturnToEvent={
                handleReturnToEvent
              }
            />
          )}

        {view === 'create-error' &&
          event &&
          submittedData && (
            <CreateSubtaskError
              subtaskName={
                submittedData.name
              }
              isRetrying={isSubmitting}
              onRetry={
                handleRetryCreate
              }
              onReturnToEvent={
                handleReturnToEvent
              }
            />
          )}

        {view ===
            'event-edit-success' &&
          updatedEvent && (
            <EditEventSuccess
              eventName={
                updatedEvent.name
              }
              onContinueEditing={
                handleContinueEditingEvent
              }
              onReturnToEvent={
                handleReturnFromEventEdit
              }
            />
          )}

        {view ===
          'event-edit-error' && (
          <EditEventError
            isRetrying={
              isUpdatingEvent
            }
            onRetry={
              handleRetryUpdateEvent
            }
            onReturnToEvent={() => {
              setView('event-edit')
            }}
          />
        )}

        {view === 'event-edit' &&
          currentEvent && (
            <PageFlowSurface>
              <PageHeader
                title="Editar evento"
                description="Modifica la información del evento y administra sus tareas principales."
              />

              {isLoadingEventTypes && (
                <div className="mt-4">
                  <EventDetailLoadingState />
                </div>
              )}

              {!isLoadingEventTypes &&
                eventTypesError && (
                  <div className="mt-4">
                    <EventDetailErrorState
                      title="No pudimos cargar los tipos de evento"
                      description="Ocurrió un problema al cargar las opciones del formulario. Intenta nuevamente."
                      onRetry={
                        retryEventTypes
                      }
                    />
                  </div>
                )}

              {!isLoadingEventTypes &&
                !eventTypesError && (
                  <div className="mt-4">
                    <EditEventForm
                      key={
                        currentEvent.id
                      }
                      event={
                        submittedEventData
                          ? { ...currentEvent, ...submittedEventData, typeId: submittedEventData.typeId ?? currentEvent.typeId }
                          : currentEvent
                      }
                      eventTypes={
                        eventTypes
                      }
                      subtasks={subtasks}
                      isSubmitting={
                        isUpdatingEvent
                      }
                      onSubmit={
                        handleUpdateEvent
                      }
                      onCancel={
                        handleCancelEventEdit
                      }
                      onCreateSubtask={
                        handleCreateSubtaskFromEdit
                      }
                      onUpdateSubtask={
                        handleUpdateSubtaskFromEdit
                      }
                      onDeleteSubtask={
                        handleDeleteSubtaskFromEdit
                      }
                    />
                  </div>
                )}
            </PageFlowSurface>
          )}

        {view ===
            'event-delete-success' &&
          deletedEventName && (
            <DeleteEventSuccess
              eventName={
                deletedEventName
              }
              onGoEvents={() =>
                navigate('/eventos', {
                  viewTransition: true,
                })
              }
            />
          )}

        {view ===
            'event-delete-error' &&
          currentEvent && (
            <DeleteEventError
              eventName={
                currentEvent.name
              }
              isRetrying={
                isDeletingEvent
              }
              onRetry={
                handleRetryDeleteEvent
              }
              onReturnToEvent={() =>
                setView('detail')
              }
            />
          )}

        {view === 'detail' && (
          <>
            {isLoading && (
              <EventDetailLoadingState />
            )}

            {!isLoading &&
              error && (
                <EventDetailErrorState
                  onRetry={retry}
                />
              )}

            {!isLoading &&
              !error &&
              !event && (
                <EventNotFoundState />
              )}

            {!isLoading &&
              !error &&
              currentEvent && (
                <>
                  <EventDetailContent
                    event={currentEvent}
                    subtasks={subtasks}
                    eventTypeName={
                      currentEventTypeName
                    }
                    eventDescription={
                      currentEventDescription
                    }
                    onAddTask={() =>
                      setIsAddSubtaskOpen(
                        true,
                      )
                    }
                    onEditEvent={() =>
                      setView('event-edit')
                    }
                    onDeleteEvent={
                      handleOpenDeleteEvent
                    }
                  />

                  <DeleteEventDialog
                    open={
                      isDeleteEventOpen
                    }
                    isDeleting={
                      isDeletingEvent
                    }
                    onOpenChange={
                      setIsDeleteEventOpen
                    }
                    onConfirm={
                      handleConfirmDeleteEvent
                    }
                  />

                  <AddSubtaskDialog
                    key={formVersion}
                    open={
                      isAddSubtaskOpen
                    }
                    eventName={
                      currentEvent.name
                    }
                    eventDate={
                      currentEvent.eventDate
                    }
                    isSubmitting={
                      isSubmitting
                    }
                    onOpenChange={
                      setIsAddSubtaskOpen
                    }
                    onSubmit={
                      handleCreateSubtask
                    }
                  />
                </>
              )}
          </>
        )}
      </div>
    </PageContainer>
  )
}
