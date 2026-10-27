import { ApiError, getApiFieldError } from '@/lib/api'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageFlowSurface } from '@/components/layout/PageFlowSurface'
import { usePageFlowNavigation } from '@/components/layout/usePageFlowNavigation'
import { PageHeader } from '@/components/layout/PageHeader'
import type { BreadcrumbItem } from '@/components/layout/PageBreadcrumbs'
import { useDocumentTitle } from '@/components/layout/useDocumentTitle'

import {
  useAuthenticatedApi,
} from '@/features/auth/hooks/useAuthenticatedApi'

import { AddSubtaskDialog } from '@/features/events/components/detail/AddSubtaskDialog'
import { DeleteSubtaskDialog } from '@/features/events/components/detail/DeleteSubtaskDialog'
import { CreateSubtaskError } from '@/features/events/components/detail/CreateSubtaskError'
import { CreateSubtaskSuccess } from '@/features/events/components/detail/CreateSubtaskSuccess'
import { EventDetailContent } from '@/features/events/components/detail/EventDetailContent'
import { EventDetailErrorState } from '@/features/events/components/detail/EventDetailErrorState'
import { EventDetailLoadingState } from '@/features/events/components/detail/EventDetailLoadingState'
import { EventNotFoundState } from '@/features/events/components/detail/EventNotFoundState'
import { DestructiveConfirmationDialog } from '@/features/events/components/detail/DestructiveConfirmationDialog'

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
import { usePlanningPreferences } from '@/features/settings/hooks/usePlanningPreferences'

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

const flowBreadcrumbLabels: Record<Exclude<DetailFlowView, 'detail'>, string> = {
  'create-success': 'Tarea agregada',
  'create-error': 'Tarea no agregada',
  'event-edit': 'Editar evento',
  'event-edit-success': 'Evento actualizado',
  'event-edit-error': 'Cambios no guardados',
  'event-delete-success': 'Evento eliminado',
  'event-delete-error': 'No se pudo eliminar',
}

export function EventDetailPage() {
  const { id } = useParams()

  const parsedId = Number(id)

  const navigate = useNavigate()

  const {
    authenticatedRequest,
  } = useAuthenticatedApi()
  const { dailyLimitHours } = usePlanningPreferences()

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

  useDocumentTitle(event?.name ? `${event.name} · Eventger` : 'Detalle de evento · Eventger')

  const {
    subtasks,
    isLoading: isLoadingSubtasks,
    error: subtasksError,
    refresh: refreshSubtasks,
  } = useEventSubtasks(event?.id ?? null)

  const [searchParams, setSearchParams] = useSearchParams()
  const isEditModeInUrl = searchParams.get('modo') === 'editar'
  const highlightedSubtaskId = searchParams.get('tarea') ? Number(searchParams.get('tarea')) : null

  const [view, setView] =
    useState<DetailFlowView>(isEditModeInUrl ? 'event-edit' : 'detail')

  useEffect(() => {
    const isEdit = searchParams.get('modo') === 'editar'
    if (isEdit && view === 'detail') {
      setView('event-edit')
    } else if (!isEdit && view === 'event-edit') {
      setView('detail')
    }
  }, [searchParams, view])

  const clearEditModeFromUrl = () => {
    if (searchParams.get('modo') === 'editar') {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('modo')
        return next
      })
    }
  }

  const handleOpenEditEvent = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('modo', 'editar')
      return next
    })
    setView('event-edit')
  }


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

  const hasLoadedInitialData = useRef(false)
  const [previousEventId, setPreviousEventId] = useState(eventId)

  if (previousEventId !== eventId) {
    setPreviousEventId(eventId)
    hasLoadedInitialData.current = false
  }

  useEffect(() => {
    if (event !== null && !isLoadingEvent && !isLoadingSubtasks) {
      hasLoadedInitialData.current = true
    }
  }, [event, isLoadingEvent, isLoadingSubtasks])

  const isLoading =
    !hasLoadedInitialData.current &&
    (isLoadingEvent || (event !== null && isLoadingSubtasks))

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

  const [subtaskToDelete, setSubtaskToDelete] = useState<Subtask | null>(null)
  const [isDeletingSubtask, setIsDeletingSubtask] = useState(false)

  const handleConfirmDeleteSubtask = async () => {
    if (!subtaskToDelete) return
    setIsDeletingSubtask(true)
    try {
      await deleteSubtask(subtaskToDelete.id, authenticatedRequest)
      setSubtaskToDelete(null)
      await Promise.all([refreshSubtasks(), retryEvent()])
    } finally {
      setIsDeletingSubtask(false)
    }
  }

  const [
    deletedEventName,
    setDeletedEventName,
  ] =
    useState<string | null>(
      null,
    )

  const [isEditDirty, setIsEditDirty] = useState(false)
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false)
  const pendingNavigationRef = useRef<(() => void) | null>(null)

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

    void Promise.all([
      retryEvent(),
      refreshSubtasks(),
    ])
  }

  const handleAddAnother = () => {
    setView('detail')

    setFormVersion(
      (current) => current + 1,
    )

    setIsAddSubtaskOpen(true)
  }

  const [eventRetryError, setEventRetryError] = useState('')

  const handleUpdateEvent = async (
    data: UpdateEventInput,
  ) => {
    if (eventId === null) {
      return
    }

    setEventRetryError('')
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
      clearEditModeFromUrl()
      setIsEditDirty(false)

      setView(
        'event-edit-success',
      )
    } catch (error) {
      if (getApiFieldError(error, 'date')) throw error
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

      try {
        await handleUpdateEvent(submittedEventData)
      } catch (error) {
        setEventRetryError(getApiFieldError(error, 'date') ?? 'No pudimos guardar el evento. Revisa los datos e inténtalo de nuevo.')
        setView('event-edit')
      }
    }

  const confirmOrExecute = (action: () => void) => {
    if (isEditDirty) {
      pendingNavigationRef.current = action
      setIsDiscardConfirmOpen(true)
    } else {
      action()
    }
  }

  const handleCancelEventEdit =
    () => {
      confirmOrExecute(() => {
        setIsEditDirty(false)
        clearEditModeFromUrl()
        setSubmittedEventData(null)
        setView('detail')
      })
    }

  const handleContinueEditingEvent =
    () => {
      handleOpenEditEvent()
    }

  const handleReturnFromEventEdit =
    () => {
      confirmOrExecute(() => {
        setIsEditDirty(false)
        clearEditModeFromUrl()
        setSubmittedEventData(null)
        setView('detail')
        void retryEvent()
      })
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

      await Promise.all([
        refreshSubtasks(),
        retryEvent(),
      ])
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

      await Promise.all([
        refreshSubtasks(),
        retryEvent(),
      ])
    }

  const handleDeleteSubtaskFromEdit =
    async (subtask: Subtask) => {
      await deleteSubtask(
        subtask.id,
        authenticatedRequest,
      )

      await Promise.all([
        refreshSubtasks(),
        retryEvent(),
      ])
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
      } catch (err: unknown) {
        const is404 =
          (err instanceof ApiError && err.status === 404) ||
          (typeof err === 'object' && err !== null && 'status' in err && (err as { status: unknown }).status === 404) ||
          (err instanceof Error && (err.message.includes('404') || err.message.toLowerCase().includes('not found')))

        if (is404) {
          setDeletedEventName(currentEvent.name)
          setIsDeleteEventOpen(false)
          setView('event-delete-success')
          return
        }

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

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hoy', to: '/hoy' },
    { label: 'Eventos', to: '/eventos' },
  ]

  if (view === 'event-delete-success') {
    breadcrumbs.push({ label: flowBreadcrumbLabels[view] })
  } else {
    breadcrumbs.push({
      label: currentEvent?.name ?? 'Detalle del evento',
      ...(view !== 'detail' && currentEvent ? {
        to: `/evento/${currentEvent.id}`,
        onNavigate: view.startsWith('event-edit')
          ? handleReturnFromEventEdit
          : handleReturnToEvent,
      } : {}),
    })
    if (view !== 'detail') breadcrumbs.push({ label: flowBreadcrumbLabels[view] })
  }

  const flowContentRef = usePageFlowNavigation(view)

  return (
    <PageContainer
      breadcrumbs={breadcrumbs}
    >
      <div
        ref={flowContentRef}
        key={view}
        className={view === 'detail' ? undefined : 'event-flow-view'}
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
                handleReturnToEvent
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
            <>
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
                  <PageFlowSurface className="mt-4">
                    {eventRetryError && <InlineFeedback className="mb-4">{eventRetryError}</InlineFeedback>}
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
                      dailyLimitHours={dailyLimitHours}
                      subtasks={subtasks}
                      subtasksError={subtasksError}
                      isRefreshingSubtasks={isLoadingSubtasks}
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
                      onSubtasksChanged={refreshSubtasks}
                      onRetrySubtasks={refreshSubtasks}
                      onDirtyChange={setIsEditDirty}
                    />
                  </PageFlowSurface>
                )}
            </>
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
                    dailyLimitHours={dailyLimitHours}
                    eventTypeName={
                      currentEventTypeName
                    }
                    highlightedSubtaskId={
                      highlightedSubtaskId
                    }
                    onAddTask={() =>
                      setIsAddSubtaskOpen(
                        true,
                      )
                    }
                    onEditEvent={
                      handleOpenEditEvent
                    }
                    onDeleteEvent={
                      handleOpenDeleteEvent
                    }
                    onDeleteTask={setSubtaskToDelete}
                    onSubtaskUpdated={refreshSubtasks}
                    onViewProgress={() => navigate('/progreso', { viewTransition: true })}
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

                  {subtaskToDelete && (
                    <DeleteSubtaskDialog
                      subtask={subtaskToDelete}
                      isDeleting={isDeletingSubtask}
                      onClose={() => setSubtaskToDelete(null)}
                      onConfirm={handleConfirmDeleteSubtask}
                    />
                  )}

                  <AddSubtaskDialog
                    key={formVersion}
                    open={
                      isAddSubtaskOpen
                    }
                    dailyLimitHours={dailyLimitHours}
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

      <DestructiveConfirmationDialog
        open={isDiscardConfirmOpen}
        onOpenChange={setIsDiscardConfirmOpen}
        title="¿Descartar cambios?"
        description="Tienes cambios sin guardar en el evento. Si sales ahora, se perderán las modificaciones realizadas."
        confirmLabel="Descartar cambios"
        isDeleting={false}
        onConfirm={() => {
          setIsDiscardConfirmOpen(false)
          setIsEditDirty(false)
          pendingNavigationRef.current?.()
          pendingNavigationRef.current = null
        }}
      />
    </PageContainer>
  )
}
