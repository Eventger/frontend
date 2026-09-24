import {
  useState,
} from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'

import { AddSubtaskDialog } from '@/features/events/components/detail/AddSubtaskDialog'
import { CreateSubtaskError } from '@/features/events/components/detail/CreateSubtaskError'
import { CreateSubtaskSuccess } from '@/features/events/components/detail/CreateSubtaskSuccess'
import { EventDetailContent } from '@/features/events/components/detail/EventDetailContent'
import { EventDetailErrorState } from '@/features/events/components/detail/EventDetailErrorState'
import { EventDetailLoadingState } from '@/features/events/components/detail/EventDetailLoadingState'
import { EventNotFoundState } from '@/features/events/components/detail/EventNotFoundState'
import { EditEventForm } from '../components/edit/EditEventForm'
import { DeleteEventDialog } from '../components/detail/DeleteEventDialog'

import { useEventDetail } from '@/features/events/hooks/useEventDetail'
import { useEventSubtasks } from '@/features/events/hooks/useEventSubtasks'

import {
  DeleteSubtaskError,
  DeleteSubtaskSuccess,
  EditSubtaskError,
  EditSubtaskSuccess,
} from '@/features/events/components/detail/SubtaskOperationFeedback'

import {
  DeleteEventError,
  DeleteEventSuccess,
  EditEventError,
  EditEventSuccess,
} from '../components/edit/EventOperationFeedback'

import { createSubtask, deleteSubtask, updateSubtask } from '@/features/events/services/subtasks.service'
import {
  updateEvent,
  deleteEvent,

} from '@/features/events/services/event.service'


import type {
  CreateSubtaskInput,
  Subtask,
  UpdateSubtaskInput,
} from '@/features/events/types/subtask.types'
import { DeleteSubtaskDialog } from '../components/detail/DeleteSubtaskDialog'
import { EditSubtaskDialog } from '../components/detail/EditSubtaskDialog'
import { useEventTypes } from '../hooks/useEventTypes'
import type {
  Event,
  UpdateEventInput,
} from '../types/event.types'


type DetailFlowView =
  | 'detail'
  | 'create-success'
  | 'create-error'
  | 'edit-success'
  | 'edit-error'
  | 'delete-success'
  | 'delete-error'
  | 'event-edit'
  | 'event-edit-success'
  | 'event-edit-error'
  | 'event-delete-success'
  | 'event-delete-error'
  
export function EventDetailPage() {
  const { id } = useParams()

  const parsedId = Number(id)
  
  const navigate = useNavigate()

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
  } = useEventSubtasks(eventId)

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
    useState<Subtask | null>(null)

  const [formVersion, setFormVersion] =
    useState(0)

  const isLoading =
    isLoadingEvent ||
    isLoadingSubtasks

  const error =
    eventError ?? subtasksError

  const retry = async () => {
    await Promise.all([
      retryEvent(),
      refreshSubtasks(),
    ])
  }

  const [
  submittedEditData,
  setSubmittedEditData,
] =
  useState<UpdateSubtaskInput | null>(
    null,
  )

const [
  updatedSubtask,
  setUpdatedSubtask,
] =
  useState<Subtask | null>(null)

const [
  deletedSubtaskName,
  setDeletedSubtaskName,
] =
  useState<string | null>(null)

const [
  isUpdating,
  setIsUpdating,
] = useState(false)

const [
  isDeleting,
  setIsDeleting,
] = useState(false)

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
  useState<Event | null>(null)

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
] = useState<string | null>(null)

const currentEvent =
  updatedEvent ?? event

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

  setSubtaskAction(null)
  setSelectedSubtask(null)

  setSubmittedEditData(null)
  setUpdatedSubtask(null)
  setDeletedSubtaskName(null)

  void refreshSubtasks()
}

const handleAddAnother = () => {
  setView('detail')

  setFormVersion(
    (current) => current + 1,
  )

  setIsAddSubtaskOpen(true)
}

  const [
  selectedSubtask,
  setSelectedSubtask,
] = useState<Subtask | null>(
  null,
)

const [
  subtaskAction,
  setSubtaskAction,
] = useState<
  'edit' | 'delete' | null
>(null)

const handleEditTask = (
  subtask: Subtask,
) => {
  setSelectedSubtask(subtask)
  setSubtaskAction('edit')
}

const closeSubtaskAction = () => {
  setSelectedSubtask(null)
  setSubtaskAction(null)
}

const handleUpdateSubtask = async (
  data: UpdateSubtaskInput,
) => {
  if (!selectedSubtask) {
    return
  }

  setSubmittedEditData(data)
  setIsUpdating(true)

  try {
    const updated =
      await updateSubtask(
        selectedSubtask.id,
        data,
      )

    setUpdatedSubtask(updated)
    setSelectedSubtask(updated)

    setSubtaskAction(null)
    setView('edit-success')

    void refreshSubtasks()
  } catch {
    setSubtaskAction(null)
    setView('edit-error')
  } finally {
    setIsUpdating(false)
  }
}

const handleRetryUpdate = async () => {
  if (
    !selectedSubtask ||
    !submittedEditData
  ) {
    return
  }

  await handleUpdateSubtask(
    submittedEditData,
  )
}

const handleContinueEditing = () => {
  if (!updatedSubtask) {
    return
  }

  setSelectedSubtask(
    updatedSubtask,
  )

  setView('detail')
  setSubtaskAction('edit')
}

const handleDeleteTask = (
  subtask: Subtask,
) => {
  setSelectedSubtask(subtask)
  setSubtaskAction('delete')
}

const handleConfirmDelete =
  async () => {
    if (!selectedSubtask) {
      return
    }

    setIsDeleting(true)

    try {
      const name =
        selectedSubtask.name

      await deleteSubtask(
        selectedSubtask.id,
      )

      setDeletedSubtaskName(name)

      setSubtaskAction(null)
      setView('delete-success')

      void refreshSubtasks()
    } catch {
      setSubtaskAction(null)
      setView('delete-error')
    } finally {
      setIsDeleting(false)
    }
  }

const handleRetryDelete =
  async () => {
    await handleConfirmDelete()
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

      await deleteEvent(eventId)

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
    <AppLayout>
      <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 md:px-8 md:py-12">
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

        {view === 'edit-success' &&
          updatedSubtask && (
            <EditSubtaskSuccess
              subtaskName={
                updatedSubtask.name
              }
              onContinueEditing={
                handleContinueEditing
              }
              onReturnToEvent={
                handleReturnToEvent
              }
            />
          )}

        {view === 'edit-error' && (
          <EditSubtaskError
            isRetrying={isUpdating}
            onRetry={
              handleRetryUpdate
            }
            onReturnToEvent={
              handleReturnToEvent
            }
          />
        )}

        {view === 'delete-success' &&
          deletedSubtaskName && (
            <DeleteSubtaskSuccess
              subtaskName={
                deletedSubtaskName
              }
              onReturnToEvent={
                handleReturnToEvent
              }
            />
          )}

        {view === 'delete-error' &&
          selectedSubtask && (
            <DeleteSubtaskError
              subtaskName={
                selectedSubtask.name
              }
              isRetrying={isDeleting}
              onRetry={
                handleRetryDelete
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
              setSubmittedEventData(
                null,
              )

              setView('detail')
            }}
          />
        )}

        {view === 'event-edit' &&
          currentEvent && (
            <>
              <header>
                <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
                  Editar evento
                </h1>

                <p className="mt-2 text-[15px] text-[#667085]">
                  Modifica la información de{' '}
                  {currentEvent.name}.
                </p>
              </header>

              {isLoadingEventTypes && (
                <div className="mt-8">
                  <EventDetailLoadingState />
                </div>
              )}

              {!isLoadingEventTypes &&
                eventTypesError && (
                  <div className="mt-8">
                    <EventDetailErrorState
                      onRetry={
                        retryEventTypes
                      }
                    />
                  </div>
                )}

              {!isLoadingEventTypes &&
                !eventTypesError && (
                  <div className="mt-[30px]">
                    <EditEventForm
                      key={
                        currentEvent.id
                      }
                      event={
                        currentEvent
                      }
                      eventTypes={
                        eventTypes
                      }
                      isSubmitting={
                        isUpdatingEvent
                      }
                      onSubmit={
                        handleUpdateEvent
                      }
                      onCancel={
                        handleCancelEventEdit
                      }
                    />
                  </div>
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
              navigate('/eventos')
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
                    onAddTask={() =>
                      setIsAddSubtaskOpen(true)
                    }
                    onEditTask={
                      handleEditTask
                    }
                    onDeleteTask={
                      handleDeleteTask
                    }
                    onEditEvent={() =>
                      setView('event-edit')
                    }
                    onDeleteEvent={
                      handleOpenDeleteEvent
                    }
                  />

                  {selectedSubtask &&
                    subtaskAction === 'edit' && (
                      <EditSubtaskDialog
                        key={selectedSubtask.id}
                        subtask={selectedSubtask}
                        eventDate={
                          currentEvent.eventDate
                        }
                        isSubmitting={
                          isUpdating
                        }
                        onClose={closeSubtaskAction}
                        onSubmit={
                          handleUpdateSubtask
                        }
                      />
                    )}

                  {selectedSubtask &&
                    subtaskAction === 'delete' && (
                      <DeleteSubtaskDialog
                        subtask={selectedSubtask}
                        isDeleting={isDeleting}
                        onClose={closeSubtaskAction}
                        onConfirm={
                          handleConfirmDelete
                        }
                      />
                    )}

                  <DeleteEventDialog
                    open={isDeleteEventOpen}
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
                    eventName={currentEvent.name}
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
    </AppLayout>
  )
}