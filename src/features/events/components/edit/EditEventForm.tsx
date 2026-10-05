import {
  useState,
  type FormEvent,
} from 'react'

import {
  CalendarDays,
  Check,
  Clock3,
  GripVertical,
  Pencil,
  Trash2,
} from 'lucide-react'

import { focusFirstError } from '@/lib/formFocus'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { DeleteSubtaskDialog } from '@/features/events/components/detail/DeleteSubtaskDialog'
import { formatCalendarDate, getCalendarDate } from '@/lib/calendar'
import { RescheduleTaskDialog } from '../detail/RescheduleTaskDialog'
import { getSchedulingConflict } from '../../services/planning.service'
import type { DayPlan } from '../../types/planning.types'

import type {
  Event,
  EventType,
  UpdateEventInput,
} from '@/features/events/types/event.types'

import type {
  CreateSubtaskInput,
  Subtask,
  SubtaskState,
  UpdateSubtaskInput,
} from '@/features/events/types/subtask.types'

type EditEventFormProps = {
  event: Event
  eventTypes: EventType[]
  subtasks?: Subtask[]
  subtasksError?: string | null
  isRefreshingSubtasks?: boolean
  isSubmitting: boolean
  onSubmit: (
    data: UpdateEventInput,
  ) => Promise<void>
  onCancel: () => void
  onCreateSubtask?: (
    data: CreateSubtaskInput,
  ) => Promise<void>
  onUpdateSubtask?: (
    subtask: Subtask,
    data: UpdateSubtaskInput,
  ) => Promise<void>
  onDeleteSubtask?: (
    subtask: Subtask,
  ) => Promise<void>
  onSubtasksChanged?: (task: Subtask) => Promise<void> | void
  onRetrySubtasks?: () => Promise<void> | void
}

type FormValues = {
  name: string
  typeId: number | null
  eventDate: string
  location: string
  contact: string
}

type FormErrors = Partial<
  Record<keyof FormValues, string>
>

type SubtaskFormValues = {
  state: SubtaskState
  name: string
  targetDate: string
  estimatedHours: string
  details: string
}

type SubtaskFormErrors = Partial<
  Record<keyof SubtaskFormValues, string>
>

const emptySubtaskValues: SubtaskFormValues = {
  state: 'pending',
  name: '',
  targetDate: '',
  estimatedHours: '',
  details: '',
}

function formatTaskDate(date: string) {
  return formatCalendarDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function EditEventForm({
  event,
  eventTypes,
  subtasks = [],
  subtasksError,
  isRefreshingSubtasks = false,
  isSubmitting,
  onSubmit,
  onCancel,
  onCreateSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onSubtasksChanged,
  onRetrySubtasks,
}: EditEventFormProps) {
  const [values, setValues] =
    useState<FormValues>({
      name: event.name,
      typeId: event.typeId,
      eventDate:
        getCalendarDate(event.eventDate),
      location: event.location,
      contact: event.contact,
    })

  const [errors, setErrors] =
    useState<FormErrors>({})

  const [subtaskValues, setSubtaskValues] =
    useState<SubtaskFormValues>(
      emptySubtaskValues,
    )

  const [subtaskErrors, setSubtaskErrors] =
    useState<SubtaskFormErrors>({})

  const [editingSubtask, setEditingSubtask] =
    useState<Subtask | null>(null)

  const [deletingSubtask, setDeletingSubtask] =
    useState<Subtask | null>(null)

  const [taskAction, setTaskAction] =
    useState<'saving' | 'deleting' | null>(
      null,
    )

  const [taskActionError, setTaskActionError] =
    useState('')
  const [rescheduling, setRescheduling] = useState<{ task: Subtask; input?: UpdateSubtaskInput; conflict?: DayPlan } | null>(null)
  const [rescheduleSaved, setRescheduleSaved] = useState(false)

  const [pendingTaskError, setPendingTaskError] = useState('')

  const updateField = <
    K extends keyof FormValues,
  >(
    field: K,
    value: FormValues[K],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }))
  }

  const updateSubtaskField = <
    K extends keyof SubtaskFormValues,
  >(
    field: K,
    value: SubtaskFormValues[K],
  ) => {
    setSubtaskValues((current) => ({
      ...current,
      [field]: value,
    }))

    setSubtaskErrors((current) => ({
      ...current,
      [field]: undefined,
    }))
    setTaskActionError('')
  }

  const validate = () => {
    const nextErrors: FormErrors = {}

    if (!values.name.trim()) {
      nextErrors.name =
        'Ingresa el nombre del evento.'
    }

    if (values.typeId === null) {
      nextErrors.typeId =
        'Selecciona un tipo de evento.'
    }

    if (!values.eventDate) {
      nextErrors.eventDate =
        'Selecciona una fecha válida.'
    }

    if (!values.location.trim()) {
      nextErrors.location =
        'Ingresa el lugar del evento.'
    }

    if (!values.contact.trim()) {
      nextErrors.contact =
        'Ingresa un contacto para el evento.'
    }

    if (!nextErrors.eventDate && values.eventDate && subtasks.some(task => getCalendarDate(task.targetDate) > values.eventDate)) {
      nextErrors.eventDate = 'Hay tareas con fecha posterior al evento. Ajusta sus fechas o la fecha del evento.'
    }
    setErrors(nextErrors)
    focusFirstError(nextErrors, {
      name: 'event-name', typeId: 'event-type', eventDate: 'event-date',
      location: 'event-location', contact: 'event-contact',
    })

    return (
      Object.keys(nextErrors).length === 0
    )
  }

  const validateSubtask = () => {
    const nextErrors: SubtaskFormErrors = {}
    const hours = Number(
      subtaskValues.estimatedHours,
    )

    if (!subtaskValues.name.trim()) {
      nextErrors.name =
        'Ingresa el nombre de la tarea.'
    }

    if (!subtaskValues.targetDate) {
      nextErrors.targetDate =
        'Selecciona la fecha límite.'
    } else if (
      values.eventDate &&
      subtaskValues.targetDate >
        values.eventDate
    ) {
      nextErrors.targetDate =
        `La fecha límite debe ser anterior al ${formatTaskDate(
          values.eventDate,
        )}.`
    }

    if (
      !subtaskValues.estimatedHours ||
      Number.isNaN(hours) ||
      hours <= 0
    ) {
      nextErrors.estimatedHours =
        'Ingresa un tiempo estimado válido.'
    }

    setSubtaskErrors(nextErrors)
    focusFirstError(nextErrors, {
      name: 'edit-event-task-name', targetDate: 'edit-event-task-date', estimatedHours: 'edit-event-task-hours', details: 'edit-event-task-details', state: 'edit-event-task-state',
    })

    return (
      Object.keys(nextErrors).length === 0
    )
  }

  const resetSubtaskForm = () => {
    setEditingSubtask(null)
    setSubtaskValues(emptySubtaskValues)
    setSubtaskErrors({})
    setPendingTaskError('')
    setTaskActionError('')
  }

  const handleEditSubtask = (
    subtask: Subtask,
  ) => {
    setEditingSubtask(subtask)
    setSubtaskValues({
      state: subtask.state,
      name: subtask.name,
      targetDate:
        getCalendarDate(subtask.targetDate),
      estimatedHours: String(
        subtask.estimatedHours,
      ),
      details: subtask.details,
    })
    setSubtaskErrors({})
    setPendingTaskError('')
    setTaskActionError('')

    document.getElementById('edit-event-task-name')?.focus()

  }

  const handleSaveSubtask = async () => {
    if (!validateSubtask()) {
      return
    }

    const data: CreateSubtaskInput = {
      name: subtaskValues.name.trim(),
      targetDate:
        subtaskValues.targetDate,
      estimatedHours: Number(
        subtaskValues.estimatedHours,
      ),
      details:
        subtaskValues.details.trim(),
    }

    setTaskAction('saving')
    setTaskActionError('')

    try {
      if (editingSubtask) {
        await onUpdateSubtask?.(
          editingSubtask,
          { ...data, state: subtaskValues.state },
        )
      } else {
        await onCreateSubtask?.(data)
      }

      resetSubtaskForm()
    } catch (error) {
      const conflict = getSchedulingConflict(error)
      if (conflict && editingSubtask) {
        setRescheduleSaved(false)
        setRescheduling({ task: editingSubtask, input: { ...data, state: subtaskValues.state }, conflict })
      } else setTaskActionError('No pudimos guardar la tarea. Inténtalo de nuevo.')
    } finally {
      setTaskAction(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingSubtask) {
      return
    }

    setTaskAction('deleting')
    setTaskActionError('')

    try {
      await onDeleteSubtask?.(
        deletingSubtask,
      )

      if (
        editingSubtask?.id ===
        deletingSubtask.id
      ) {
        resetSubtaskForm()
      }

      setDeletingSubtask(null)
    } catch {
      setDeletingSubtask(null)
      setTaskActionError(
        'No pudimos eliminar la tarea. Inténtalo de nuevo.',
      )
    } finally {
      setTaskAction(null)
    }
  }

  const handleSubmit = async (
    submitEvent:
      FormEvent<HTMLFormElement>,
  ) => {
    submitEvent.preventDefault()
    if (isTaskBusy) return

    if (!validate()) {
      return
    }

    if (editingSubtask !== null || Object.entries(subtaskValues).some(([key, value]) => key !== 'state' && value.trim())) {
      setPendingTaskError('Tienes una tarea sin agregar o guardar. Agrégala, guárdala o limpia sus campos antes de continuar.')
      document.getElementById('edit-event-task-name')?.focus()
      return
    }

    await onSubmit({
      name: values.name.trim(),
      typeId: values.typeId,
      eventDate: values.eventDate,
      location: values.location.trim(),
      contact: values.contact.trim(),
    })
  }

  const isTaskBusy =
    taskAction !== null || isSubmitting

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
      >
        <section className="rounded-[16px] border border-[#d9dee7] bg-white p-5">
          <h2 className="text-[20px] font-semibold leading-6 text-[#17212b]">
            Datos del evento
          </h2>

          <div className="mt-1">
            <p className="text-[12px] font-semibold text-[#17212b]">
              ¿Qué vas a organizar?
            </p>

            <div className="mt-0.5 grid gap-4 md:grid-cols-2 md:gap-6">
              <div className="space-y-1">
                <label
                  htmlFor="event-name"
                  className="text-[12px] font-medium text-[#17212b]"
                >
                  Nombre del evento *
                </label>

                <Input
                  id="event-name"
                  value={values.name}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    errors.name,
                  )}
                  aria-describedby={
                    errors.name
                      ? 'edit-event-name-error'
                      : undefined
                  }
                  onChange={(inputEvent) =>
                    updateField(
                      'name',
                      inputEvent.target.value,
                    )
                  }
                  className="h-[42px] rounded-[8px] border-[#d9dee7]"
                />

                {errors.name && (
                  <FieldError id="edit-event-name-error">
                    {errors.name}
                  </FieldError>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="event-type"
                  className="text-[12px] font-medium text-[#17212b]"
                >
                  Tipo de evento *
                </label>

                <Select
                  value={
                    values.typeId === null
                      ? undefined
                      : String(values.typeId)
                  }
                  disabled={isSubmitting}
                  onValueChange={(value) =>
                    updateField(
                      'typeId',
                      Number(value),
                    )
                  }
                >
                  <SelectTrigger
                    id="event-type"
                    className="h-[42px]! w-full rounded-[8px] border-[#d9dee7]"
                    aria-invalid={Boolean(
                      errors.typeId,
                    )}
                    aria-describedby={
                      errors.typeId
                        ? 'edit-event-type-error'
                        : undefined
                    }
                  >
                    <SelectValue placeholder="Selecciona un tipo de evento" />
                  </SelectTrigger>

                  <SelectContent>
                    {eventTypes.map(
                      (eventType) => (
                        <SelectItem
                          key={eventType.id}
                          value={String(
                            eventType.id,
                          )}
                        >
                          {eventType.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>

                {errors.typeId && (
                  <FieldError id="edit-event-type-error">
                    {errors.typeId}
                  </FieldError>
                )}
              </div>
            </div>
          </div>

          <div className="mt-1">
            <p className="text-[12px] font-semibold text-[#17212b]">
              ¿Cuándo y dónde será?
            </p>

            <div className="mt-0.5 grid gap-4 md:grid-cols-2 md:gap-6">
              <div className="space-y-1">
                <label
                  htmlFor="event-date"
                  className="text-[12px] font-medium text-[#17212b]"
                >
                  Fecha del evento *
                </label>

                <Input
                  id="event-date"
                  type="date"
                  value={values.eventDate}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    errors.eventDate,
                  )}
                  aria-describedby={
                    errors.eventDate
                      ? 'edit-event-date-error'
                      : undefined
                  }
                  onChange={(inputEvent) =>
                    updateField(
                      'eventDate',
                      inputEvent.target.value,
                    )
                  }
                  className="h-[42px] rounded-[8px] border-[#d9dee7]"
                />

                {errors.eventDate && (
                  <FieldError id="edit-event-date-error">
                    {errors.eventDate}
                  </FieldError>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="event-location"
                  className="text-[12px] font-medium text-[#17212b]"
                >
                  Lugar *
                </label>

                <Input
                  id="event-location"
                  value={values.location}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    errors.location,
                  )}
                  aria-describedby={
                    errors.location
                      ? 'edit-event-location-error'
                      : undefined
                  }
                  onChange={(inputEvent) =>
                    updateField(
                      'location',
                      inputEvent.target.value,
                    )
                  }
                  className="h-[42px] rounded-[8px] border-[#d9dee7]"
                />

                {errors.location && (
                  <FieldError id="edit-event-location-error">
                    {errors.location}
                  </FieldError>
                )}
              </div>
            </div>
          </div>

          <div className="mt-1">
            <p className="text-[12px] font-semibold text-[#17212b]">
              ¿A quién podemos contactar?
            </p>

            <div className="mt-0.5 space-y-1">
              <label
                htmlFor="event-contact"
                className="text-[12px] font-medium text-[#17212b]"
              >
                Contacto *
              </label>

              <Input
                id="event-contact"
                value={values.contact}
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  errors.contact,
                )}
                aria-describedby={
                  errors.contact
                    ? 'event-contact-error'
                    : undefined
                }
                onChange={(inputEvent) =>
                  updateField(
                    'contact',
                    inputEvent.target.value,
                  )
                }
                className="h-[42px] w-full rounded-[8px] border-[#d9dee7]"
              />

              {errors.contact && (
                <FieldError
                  id="event-contact-error"
                >
                  {errors.contact}
                </FieldError>
              )}
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-[16px] border border-[#d9dee7] bg-white p-5">
          <p className="text-[13px] text-[#667085]">
            Las tareas se guardan por separado. Cancelar el formulario solo descarta los cambios del evento.
          </p>

          {pendingTaskError && <InlineFeedback id="pending-task-error" className="mt-3">{pendingTaskError}</InlineFeedback>}

          <div
            id="edit-task-form"
            className="mt-5 rounded-[10px] border border-[#d9dee7] bg-[#f7f8fc] p-4"
          >
            <h3 className="text-[13px] font-semibold text-[#17212b]">
              {editingSubtask
                ? 'Editar tarea'
                : 'Crear tarea'}
            </h3>

            <div className="mt-3 grid gap-4 md:grid-cols-[1.45fr_0.98fr_0.6fr]">
              <div className="space-y-1">
                <label
                  htmlFor="edit-event-task-name"
                  className="text-[11px] font-medium text-[#17212b]"
                >
                  Nombre de la tarea *
                </label>

                <Input
                  id="edit-event-task-name"
                  value={subtaskValues.name}
                  disabled={isTaskBusy}
                  aria-invalid={Boolean(
                    subtaskErrors.name,
                  )}
                  aria-describedby={
                    [subtaskErrors.name && 'edit-event-task-name-error', pendingTaskError && 'pending-task-error'].filter(Boolean).join(' ') || undefined
                  }
                  onChange={(inputEvent) =>
                    updateSubtaskField(
                      'name',
                      inputEvent.target.value,
                    )
                  }
                  className="h-[42px] rounded-[8px] border-[#d9dee7] bg-white"
                />

                {subtaskErrors.name && (
                  <FieldError id="edit-event-task-name-error">
                    {subtaskErrors.name}
                  </FieldError>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="edit-event-task-date"
                  className="text-[11px] font-medium text-[#17212b]"
                >
                  Fecha límite *
                </label>

                <Input
                  id="edit-event-task-date"
                  type="date"
                  max={
                    values.eventDate || undefined
                  }
                  value={
                    subtaskValues.targetDate
                  }
                  disabled={isTaskBusy}
                  aria-invalid={Boolean(
                    subtaskErrors.targetDate,
                  )}
                  aria-describedby={
                    subtaskErrors.targetDate
                      ? 'edit-event-task-date-error'
                      : undefined
                  }
                  onChange={(inputEvent) =>
                    updateSubtaskField(
                      'targetDate',
                      inputEvent.target.value,
                    )
                  }
                  className="h-[42px] rounded-[8px] border-[#d9dee7] bg-white"
                />

                {subtaskErrors.targetDate && (
                  <FieldError id="edit-event-task-date-error">
                    {subtaskErrors.targetDate}
                  </FieldError>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="edit-event-task-hours"
                  className="text-[11px] font-medium text-[#17212b]"
                >
                  Tiempo estimado *
                </label>

                <Input
                  id="edit-event-task-hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={
                    subtaskValues.estimatedHours
                  }
                  disabled={isTaskBusy}
                  aria-invalid={Boolean(
                    subtaskErrors.estimatedHours,
                  )}
                  aria-describedby={
                    subtaskErrors.estimatedHours
                      ? 'edit-event-task-hours-error'
                      : undefined
                  }
                  onChange={(inputEvent) =>
                    updateSubtaskField(
                      'estimatedHours',
                      inputEvent.target.value,
                    )
                  }
                  className="h-[42px] rounded-[8px] border-[#d9dee7] bg-white"
                />

                {subtaskErrors.estimatedHours && (
                  <FieldError id="edit-event-task-hours-error">
                    {subtaskErrors.estimatedHours}
                  </FieldError>
                )}
              </div>
            </div>

            {editingSubtask && (
              <div className="mt-3 space-y-1">
                <label htmlFor="edit-event-task-state" className="text-[11px] font-medium text-[#17212b]">Estado de la tarea</label>
                <Select value={subtaskValues.state} disabled={isTaskBusy} onValueChange={value => {
                  if (value === 'pending' || value === 'in_progress' || value === 'completed') updateSubtaskField('state', value)
                }}>
                  <SelectTrigger id="edit-event-task-state" className="h-11 w-full rounded-[8px] border-[#d9dee7] bg-white sm:max-w-[260px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En progreso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1 space-y-1">
                <label
                  htmlFor="edit-event-task-details"
                  className="text-[11px] font-medium text-[#17212b]"
                >
                  Nota opcional
                </label>

                <Textarea
                  id="edit-event-task-details"
                  value={subtaskValues.details}
                  disabled={isTaskBusy}
                  onChange={(inputEvent) =>
                    updateSubtaskField(
                      'details',
                      inputEvent.target.value,
                    )
                  }
                  className="min-h-[74px] resize-none rounded-[8px] border-[#d9dee7] bg-white"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isTaskBusy}
                  onClick={resetSubtaskForm}
                  aria-label={
                    editingSubtask
                      ? 'Cancelar edición de tarea'
                      : 'Limpiar tarea'
                  }
                  className="h-11 rounded-[8px] border-[#d9dee7] px-8"
                >
                  {editingSubtask
                    ? 'Cancelar'
                    : 'Limpiar'}
                </Button>

                <Button
                  type="button"
                  disabled={isTaskBusy}
                  onClick={handleSaveSubtask}
                  className="h-11 rounded-[8px] bg-[#4f46e5] px-8 text-white hover:bg-[#4338ca]"
                >
                  {taskAction === 'saving'
                    ? 'Guardando…'
                    : editingSubtask
                      ? 'Guardar tarea'
                      : 'Agregar tarea'}
                </Button>
              </div>
            </div>

            {taskActionError && (
              <InlineFeedback
                className="mt-3"
              >
                {taskActionError}
              </InlineFeedback>
            )}
          </div>

          <h2 className="mt-2 text-[20px] font-semibold leading-6 text-[#17212b]">
            Tareas agregadas ({subtasks.length})
          </h2>

          {subtasksError && (
            <InlineFeedback variant="warning" className="mt-3">
              No pudimos actualizar la lista de tareas. Los cambios guardados se conservan.
              {onRetrySubtasks && (
                <Button
                  type="button"
                  variant="link"
                  className="h-11"
                  disabled={isTaskBusy || isRefreshingSubtasks}
                  onClick={() => { void onRetrySubtasks() }}
                >
                  Reintentar
                </Button>
              )}
            </InlineFeedback>
          )}
          {isRefreshingSubtasks && (
            <p role="status" className="mt-3 text-sm text-[#667085]">
              Actualizando la lista de tareas…
            </p>
          )}

          {subtasks.length > 0 ? (
            <ul className="mt-1.5 space-y-1" aria-label="Tareas agregadas">
              {subtasks.map((subtask) => (
                <li
                  key={subtask.id}
                  className="grid min-h-12 grid-cols-[15px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-[8px] border border-[#d9dee7] bg-white px-3 py-2 md:grid-cols-[15px_minmax(0,1fr)_120px_72px_44px_44px_44px] lg:grid-cols-[15px_minmax(0,1fr)_130px_90px_132px_44px_44px]"
                >
                  <GripVertical
                    size={15}
                    className="shrink-0 self-start text-[#98a2b3] md:self-center"
                    aria-hidden="true"
                  />

                  <p title={subtask.name} className="min-w-0 break-words text-[12px] font-medium text-[#17212b] md:truncate">
                    {subtask.name}
                  </p>

                  <div className="col-start-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1 md:contents">
                    <div className="flex items-center gap-2 whitespace-nowrap text-[11px] text-[#667085]">
                      <CalendarDays
                        size={15}
                        aria-hidden="true"
                      />
                      <time dateTime={getCalendarDate(subtask.targetDate)}>
                        {formatTaskDate(subtask.targetDate)}
                      </time>
                    </div>

                    <div className="flex items-center gap-2 whitespace-nowrap text-[11px] text-[#667085]">
                      <Clock3
                        size={15}
                        aria-hidden="true"
                      />
                      {subtask.estimatedHours} h
                    </div>
                  </div>

                  <div className="col-start-2 flex items-center justify-end gap-3 md:contents">
                    <div className="flex h-11 w-11 items-center justify-center lg:w-[132px] lg:justify-start">
                      {subtask.state === 'completed' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#ecfdf3] px-2 py-1 text-[11px] font-medium text-[#027a48]" title="Tarea completada">
                          <Check size={15} aria-hidden="true" />
                          <span className="sr-only lg:not-sr-only">Completada</span>
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={isTaskBusy}
                          aria-label={`Reprogramar ${subtask.name}`}
                          className="h-11 w-full px-2 text-[#3730a3] lg:justify-start"
                          onClick={() => { setRescheduleSaved(false); setRescheduling({ task: subtask }) }}
                        >
                          <CalendarDays size={15} aria-hidden="true" />
                          <span className="hidden lg:inline">Reprogramar</span>
                        </Button>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isTaskBusy}
                      onClick={() =>
                        handleEditSubtask(
                          subtask,
                        )
                      }
                      aria-label={`Editar ${subtask.name}`}
                      className="size-11 text-[#667085] hover:bg-[#eef2ff] hover:text-[#4f46e5]"
                    >
                      <Pencil size={15} />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isTaskBusy}
                      onClick={() =>
                        setDeletingSubtask(
                          subtask,
                        )
                      }
                      aria-label={`Eliminar ${subtask.name}`}
                      className="size-11 text-[#d92d20] hover:bg-[#fef2f2] hover:text-[#b42318]"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 rounded-[8px] border border-dashed border-[#d9dee7] px-4 py-3 text-[12px] text-[#667085]">
              Aún no hay tareas. Completa el formulario superior para agregar la primera.
            </p>
          )}
        </section>

        <div className="mt-3 flex flex-col-reverse gap-3 border-t border-[#e4e7ec] pt-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isTaskBusy}
            onClick={onCancel}
            className="h-11 rounded-[10px] border-[#d9dee7] sm:w-[124px]"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isTaskBusy}
            className="h-11 rounded-[10px] bg-[#4f46e5] text-white hover:bg-[#4338ca] sm:w-[178px]"
          >
            {isSubmitting
              ? 'Guardando…'
              : 'Guardar cambios'}
          </Button>
        </div>
      </form>

      {deletingSubtask && (
        <DeleteSubtaskDialog
          subtask={deletingSubtask}
          isDeleting={
            taskAction === 'deleting'
          }
          onClose={() =>
            setDeletingSubtask(null)
          }
          onConfirm={handleConfirmDelete}
        />
      )}
      {rescheduling && (
        <RescheduleTaskDialog
          key={rescheduling.task.id}
          task={rescheduling.task}
          eventDate={event.eventDate}
          initialInput={rescheduling.input}
          initialConflict={rescheduling.conflict}
          onSaved={async (task) => {
            setRescheduleSaved(true)
            await onSubtasksChanged?.(task)
          }}
          onClose={() => {
            setRescheduling(null)
            if (rescheduleSaved && editingSubtask?.id === rescheduling.task.id) {
              resetSubtaskForm()
            }
          }}
        />
      )}
    </>
  )
}
