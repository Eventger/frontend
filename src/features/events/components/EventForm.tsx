import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  CalendarDays,
  Clock3,
  GripVertical,
  Pencil,
  Trash2,
} from 'lucide-react'

import { focusFirstError } from '@/lib/formFocus'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EventLocationInput } from './EventLocationInput'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useEventTypes } from '@/features/events/hooks/useEventTypes'

import type {
  CreateEventInput,
} from '@/features/events/types/event.types'

import type {
  CreateSubtaskInput,
} from '@/features/events/types/subtask.types'


type EventFormProps = {
  initialValues?: CreateEventInput
  initialSubtasks?: CreateSubtaskInput[]
  onSubmit: (
    data: CreateEventInput,
    subtasks: CreateSubtaskInput[],
  ) => Promise<void>
  onCancel: () => void
  onDraftChange?: (
    data: CreateEventInput,
    subtasks: CreateSubtaskInput[],
  ) => void
  isSubmitting?: boolean
}


type EventFormErrors = Partial<
  Record<
    keyof CreateEventInput,
    string
  >
>


type SubtaskFormValues = {
  name: string
  targetDate: string
  estimatedHours: string
  details: string
}


type SubtaskFormErrors = Partial<
  Record<
    keyof SubtaskFormValues,
    string
  >
>


const emptyValues: CreateEventInput = {
  name: '',
  typeId: null,
  eventDate: '',
  location: '',
  contact: '',
}


const emptySubtaskValues: SubtaskFormValues = {
  name: '',
  targetDate: '',
  estimatedHours: '',
  details: '',
}


function getLocalDateInputValue() {
  const today = new Date()

  const year = today.getFullYear()

  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    today.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}


function formatTaskDate(date: string) {
  return new Intl.DateTimeFormat(
    'es-CO',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    },
  ).format(
    new Date(`${date}T00:00:00Z`),
  )
}


export function EventForm({
  initialValues = emptyValues,
  initialSubtasks = [],
  onSubmit,
  onCancel,
  onDraftChange,
  isSubmitting = false,
}: EventFormProps) {
  const minimumEventDate =
    getLocalDateInputValue()

  const {
    eventTypes,
    isLoading:
      isLoadingEventTypes,
    error: eventTypesError,
    retry: retryEventTypes,
  } = useEventTypes()


  /*
   * DATOS DEL EVENTO
   */

  const [values, setValues] =
    useState<CreateEventInput>(
      initialValues,
    )

  const [errors, setErrors] =
    useState<EventFormErrors>({})


  /*
   * TAREAS TEMPORALES
   */

  const [subtasks, setSubtasks] =
  useState<CreateSubtaskInput[]>(
    initialSubtasks,
  )

  const [
    editingSubtaskIndex,
    setEditingSubtaskIndex,
  ] = useState<number | null>(null)

  const [
    subtaskValues,
    setSubtaskValues,
  ] = useState<SubtaskFormValues>(
    emptySubtaskValues,
  )

  const [
    subtaskErrors,
    setSubtaskErrors,
  ] = useState<SubtaskFormErrors>({})

  useEffect(() => {
    onDraftChange?.(values, subtasks)
  }, [onDraftChange, subtasks, values])


  /*
   * ACTUALIZAR DATOS DEL EVENTO
   */

  const [pendingTaskError, setPendingTaskError] = useState('')

  const updateField = <
    K extends keyof CreateEventInput,
  >(
    field: K,
    value: CreateEventInput[K],
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


  /*
   * ACTUALIZAR FORMULARIO DE TAREA
   */

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
  }


  /*
   * VALIDAR EVENTO
   */

  const validate = () => {
    const nextErrors:
      EventFormErrors = {}

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
    } else if (
      values.eventDate <
      getLocalDateInputValue()
    ) {
      nextErrors.eventDate =
        'La fecha del evento no puede estar en el pasado.'
    }

    if (!values.location.trim()) {
      nextErrors.location =
        'Ingresa el lugar del evento.'
    }

    if (!values.contact.trim()) {
      nextErrors.contact =
        'Ingresa un contacto para el evento.'
    }

    if (!nextErrors.eventDate && values.eventDate && subtasks.some(task => task.targetDate > values.eventDate)) {
      nextErrors.eventDate = 'Hay tareas con fecha posterior al evento. Ajusta sus fechas o la fecha del evento.'
    }
    setErrors(nextErrors)
    focusFirstError(nextErrors, {
      name: 'event-name', typeId: 'event-type', eventDate: 'event-date',
      location: 'event-location', contact: 'event-contact',
    })

    return (
      Object.keys(nextErrors)
        .length === 0
    )
  }


  /*
   * VALIDAR TAREA
   */

  const validateSubtask = () => {
    const nextErrors:
      SubtaskFormErrors = {}

    if (!subtaskValues.name.trim()) {
      nextErrors.name =
        'Ingresa el nombre de la tarea.'
    }

    if (!subtaskValues.targetDate) {
      nextErrors.targetDate =
        'Selecciona una fecha límite.'
    } else if (
      subtaskValues.targetDate <
      getLocalDateInputValue()
    ) {
      nextErrors.targetDate =
        'La fecha límite no puede estar en el pasado.'
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

    const estimatedHours =
      Number(
        subtaskValues.estimatedHours,
      )

    if (
      !subtaskValues.estimatedHours ||
      Number.isNaN(estimatedHours) ||
      estimatedHours <= 0
    ) {
      nextErrors.estimatedHours =
        'Ingresa un tiempo estimado válido.'
    }

    setSubtaskErrors(nextErrors)
    focusFirstError(nextErrors, {
      name: 'subtask-name', targetDate: 'subtask-target-date', estimatedHours: 'subtask-estimated-hours', details: 'subtask-details',
    })

    return (
      Object.keys(nextErrors)
        .length === 0
    )
  }


  /*
   * AGREGAR / GUARDAR TAREA
   */

  const handleSaveSubtask = () => {
    if (!validateSubtask()) {
      return
    }

    const subtask:
      CreateSubtaskInput = {
      name:
        subtaskValues.name.trim(),

      targetDate:
        subtaskValues.targetDate,

      estimatedHours:
        Number(
          subtaskValues.estimatedHours,
        ),

      details:
        subtaskValues.details.trim(),
    }

    if (
      editingSubtaskIndex !== null
    ) {
      setSubtasks((current) =>
        current.map(
          (
            currentSubtask,
            index,
          ) =>
            index ===
            editingSubtaskIndex
              ? subtask
              : currentSubtask,
        ),
      )
    } else {
      setSubtasks((current) => [
        ...current,
        subtask,
      ])
    }

    setEditingSubtaskIndex(null)

    setSubtaskValues(
      emptySubtaskValues,
    )

    setSubtaskErrors({})
    setPendingTaskError('')

  }


  /*
   * EDITAR TAREA
   */

  const handleEditSubtask = (
    index: number,
  ) => {
    const subtask =
      subtasks[index]

    setEditingSubtaskIndex(index)

    setSubtaskValues({
      name: subtask.name,

      targetDate:
        subtask.targetDate,

      estimatedHours: String(
        subtask.estimatedHours,
      ),

      details:
        subtask.details,
    })

    setSubtaskErrors({})
    setPendingTaskError('')

    document.getElementById('subtask-name')?.focus()

  }


  /*
   * ELIMINAR TAREA
   */

  const handleDeleteSubtask = (
    indexToDelete: number,
  ) => {
    setSubtasks((current) =>
      current.filter(
        (_, index) =>
          index !== indexToDelete,
      ),
    )

    if (
      editingSubtaskIndex ===
      indexToDelete
    ) {
      handleCancelSubtask()
    } else if (editingSubtaskIndex !== null && indexToDelete < editingSubtaskIndex) {
      setEditingSubtaskIndex(editingSubtaskIndex - 1)
    }
  }


  /*
   * CANCELAR EDICIÓN DE TAREA
   */

  const handleCancelSubtask = () => {
    setEditingSubtaskIndex(null)

    setSubtaskValues(
      emptySubtaskValues,
    )

    setSubtaskErrors({})
    setPendingTaskError('')

  }


  /*
   * CREAR EVENTO
   */

  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (isSubmitting) return

    if (!validate()) {
      return
    }

    if (editingSubtaskIndex !== null || Object.values(subtaskValues).some(value => value.trim())) {
      setPendingTaskError('Tienes una tarea sin agregar o guardar. Agrégala, guárdala o limpia sus campos antes de continuar.')
      document.getElementById('subtask-name')?.focus()
      return
    }

    await onSubmit(
      {
        ...values,

        name:
          values.name.trim(),

        location:
          values.location.trim(),

        contact:
          values.contact.trim(),
      },

      subtasks,
    )
  }


  return (
    <form
      onSubmit={handleSubmit}
      noValidate
    >

      {/* =========================
          DATOS DEL EVENTO
      ========================== */}

      <section className="rounded-[16px] border border-[#d9dee7] bg-white p-5">

        <h2 className="text-[20px] font-semibold leading-6 text-[#17212b]">
          Datos del evento
        </h2>


        {/* Nombre y tipo */}

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
                onChange={(event) =>
                  updateField(
                    'name',
                    event.target.value,
                  )
                }
                aria-invalid={
                  Boolean(errors.name)
                }
                aria-describedby={
                  errors.name
                    ? 'create-event-name-error'
                    : undefined
                }
                className={`h-[42px] rounded-[8px] ${
                  errors.name
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />

              {errors.name && (
                <FieldError id="create-event-name-error">
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
                  values.typeId !== null
                    ? String(
                        values.typeId,
                      )
                    : ''
                }
                disabled={
                  isSubmitting ||
                  isLoadingEventTypes
                }
                onValueChange={(value) =>
                  updateField(
                    'typeId',
                    Number(value),
                  )
                }
              >

                <SelectTrigger
                  id="event-type"
                  className={`h-[42px]! w-full rounded-[8px] ${
                    errors.typeId
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                  aria-invalid={Boolean(
                    errors.typeId ||
                      eventTypesError,
                  )}
                  aria-describedby={
                    errors.typeId
                      ? 'create-event-type-error'
                      : eventTypesError
                        ? 'event-types-load-error'
                        : undefined
                  }
                >
                  <SelectValue
                    placeholder={
                      isLoadingEventTypes
                        ? 'Cargando tipos…'
                        : 'Selecciona un tipo de evento'
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {eventTypes.map(
                    (eventType) => (
                      <SelectItem
                        key={
                          eventType.id
                        }
                        value={String(
                          eventType.id,
                        )}
                      >
                        {
                          eventType.name
                        }
                      </SelectItem>
                    ),
                  )}
                </SelectContent>

              </Select>

              {errors.typeId && (
                <FieldError id="create-event-type-error">
                  {errors.typeId}
                </FieldError>
              )}

              {eventTypesError && (
                <FieldError id="event-types-load-error">
                  {eventTypesError}
                </FieldError>
              )}
              {eventTypesError && <Button type="button" variant="link" disabled={isSubmitting || isLoadingEventTypes} onClick={() => void retryEventTypes()} className="min-h-11 px-0">Reintentar tipos de evento</Button>}

            </div>

          </div>
        </div>


        {/* Fecha y lugar */}

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
                min={
                  minimumEventDate
                }
                value={
                  values.eventDate
                }
                disabled={
                  isSubmitting
                }
                aria-invalid={Boolean(
                  errors.eventDate,
                )}
                aria-describedby={
                  errors.eventDate
                    ? 'create-event-date-error'
                    : undefined
                }
                onChange={(event) =>
                  updateField(
                    'eventDate',
                    event.target.value,
                  )
                }
                className={`h-[42px] rounded-[8px] ${
                  errors.eventDate
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />

              {errors.eventDate && (
                <FieldError id="create-event-date-error">
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

              <EventLocationInput
                id="event-location"
                value={
                  values.location
                }
                disabled={
                  isSubmitting
                }
                aria-invalid={Boolean(
                  errors.location,
                )}
                aria-describedby={
                  errors.location
                    ? 'create-event-location-error'
                    : undefined
                }
                onChange={(address) =>
                  updateField(
                    'location',
                    address,
                  )
                }
                className={`h-[42px] rounded-[8px] ${
                  errors.location
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />

              {errors.location && (
                <FieldError id="create-event-location-error">
                  {errors.location}
                </FieldError>
              )}

            </div>

          </div>
        </div>


        {/* Contacto */}

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
                  ? 'create-event-contact-error'
                  : undefined
              }
              onChange={(event) =>
                updateField(
                  'contact',
                  event.target.value,
                )
              }
              className={`h-[42px] rounded-[8px] ${
                errors.contact
                  ? 'border-[#d92d20]'
                  : ''
              }`}
            />

            {errors.contact && (
              <FieldError id="create-event-contact-error">
                {errors.contact}
              </FieldError>
            )}

          </div>
        </div>

      </section>


      <section className="mt-2 rounded-[16px] border border-[#d9dee7] bg-white p-5">
        {pendingTaskError && <InlineFeedback id="pending-task-error" className="mb-3">{pendingTaskError}</InlineFeedback>}
        <p className="text-[13px] text-[#667085]">
          Agrega las tareas principales antes de crear el evento.
        </p>

        <div className="mt-5 rounded-[10px] border border-[#d9dee7] bg-[#f7f8fc] p-4">
          <h2 className="text-[13px] font-semibold text-[#17212b]">
            {editingSubtaskIndex !== null
              ? 'Editar tarea'
              : 'Crear tarea'}
          </h2>

          <div className="mt-3 grid gap-4 md:grid-cols-[1.45fr_0.98fr_0.6fr]">
            <div className="space-y-1">
              <label
                htmlFor="subtask-name"
                className="text-[11px] font-medium text-[#17212b]"
              >
                Nombre de la tarea *
              </label>

              <Input
                id="subtask-name"
                value={subtaskValues.name}
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  subtaskErrors.name,
                )}
                aria-describedby={
                  [subtaskErrors.name && 'create-subtask-name-error', pendingTaskError && 'pending-task-error'].filter(Boolean).join(' ') || undefined
                }
                onChange={(event) =>
                  updateSubtaskField(
                    'name',
                    event.target.value,
                  )
                }
                className="h-[42px] rounded-[8px] border-[#d9dee7] bg-white"
              />

              {subtaskErrors.name && (
                <FieldError id="create-subtask-name-error">
                  {subtaskErrors.name}
                </FieldError>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="subtask-target-date"
                className="text-[11px] font-medium text-[#17212b]"
              >
                Fecha límite *
              </label>

              <Input
                id="subtask-target-date"
                type="date"
                min={minimumEventDate}
                max={
                  values.eventDate || undefined
                }
                value={subtaskValues.targetDate}
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  subtaskErrors.targetDate,
                )}
                aria-describedby={
                  subtaskErrors.targetDate
                    ? 'create-subtask-date-error'
                    : undefined
                }
                onChange={(event) =>
                  updateSubtaskField(
                    'targetDate',
                    event.target.value,
                  )
                }
                className="h-[42px] rounded-[8px] border-[#d9dee7] bg-white"
              />

              {subtaskErrors.targetDate && (
                <FieldError id="create-subtask-date-error">
                  {subtaskErrors.targetDate}
                </FieldError>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="subtask-estimated-hours"
                className="text-[11px] font-medium text-[#17212b]"
              >
                Tiempo estimado *
              </label>

              <Input
                id="subtask-estimated-hours"
                type="number"
                min="0.5"
                step="0.5"
                value={
                  subtaskValues.estimatedHours
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  subtaskErrors.estimatedHours,
                )}
                aria-describedby={
                  subtaskErrors.estimatedHours
                    ? 'create-subtask-hours-error'
                    : undefined
                }
                onChange={(event) =>
                  updateSubtaskField(
                    'estimatedHours',
                    event.target.value,
                  )
                }
                className="h-[42px] rounded-[8px] border-[#d9dee7] bg-white"
              />

              {subtaskErrors.estimatedHours && (
                <FieldError id="create-subtask-hours-error">
                  {subtaskErrors.estimatedHours}
                </FieldError>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1 space-y-1">
              <label
                htmlFor="subtask-details"
                className="text-[11px] font-medium text-[#17212b]"
              >
                Nota opcional
              </label>

              <Textarea
                id="subtask-details"
                value={subtaskValues.details}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateSubtaskField(
                    'details',
                    event.target.value,
                  )
                }
                className="min-h-[74px] resize-none rounded-[8px] border-[#d9dee7] bg-white"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleCancelSubtask}
                className="h-11 rounded-[8px] border-[#d9dee7] px-8"
              >
                {editingSubtaskIndex !== null
                  ? 'Cancelar'
                  : 'Limpiar'}
              </Button>

              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveSubtask}
                className="h-11 rounded-[8px] bg-[#4f46e5] px-8 text-white hover:bg-[#4338ca]"
              >
                {editingSubtaskIndex !== null
                  ? 'Guardar tarea'
                  : 'Agregar tarea'}
              </Button>
            </div>
          </div>
        </div>

        {subtasks.length > 0 && (
          <div className="mt-2">
            <h2 className="text-[20px] font-semibold leading-6 text-[#17212b]">
              Tareas agregadas ({subtasks.length})
            </h2>

            <div className="mt-1.5 space-y-1">
              {subtasks.map(
                (subtask, index) => (
                  <div
                    key={`${subtask.name}-${index}`}
                    className="grid min-h-12 grid-cols-[minmax(0,1fr)_44px_44px] items-center gap-x-3 gap-y-2 rounded-[8px] border border-[#d9dee7] bg-white px-3 py-2 md:grid-cols-[15px_minmax(0,1fr)_130px_90px_44px_44px]"
                  >
                    <GripVertical
                      size={15}
                      className="hidden shrink-0 text-[#98a2b3] md:block"
                      aria-hidden="true"
                    />

                    <p title={subtask.name} className="col-span-3 min-w-0 break-words text-[12px] font-medium text-[#17212b] md:col-span-1 md:truncate">
                      {subtask.name}
                    </p>

                    <div className="col-start-1 row-start-2 flex items-center gap-2 text-[11px] text-[#667085] md:col-auto md:row-auto">
                      <CalendarDays
                        size={15}
                        aria-hidden="true"
                      />
                      {formatTaskDate(
                        subtask.targetDate,
                      )}
                    </div>

                    <div className="col-start-1 row-start-3 flex items-center gap-2 text-[11px] text-[#667085] md:col-auto md:row-auto">
                      <Clock3
                        size={15}
                        aria-hidden="true"
                      />
                      {subtask.estimatedHours} h
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleEditSubtask(index)
                      }
                      aria-label={`Editar ${subtask.name}`}
                      className="col-start-2 row-span-2 row-start-2 size-11 text-[#667085] hover:bg-[#eef2ff] hover:text-[#4f46e5] md:col-auto md:row-span-1 md:row-auto"
                    >
                      <Pencil size={15} />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleDeleteSubtask(
                          index,
                        )
                      }
                      aria-label={`Eliminar ${subtask.name}`}
                      className="col-start-3 row-span-2 row-start-2 size-11 text-[#d92d20] hover:bg-[#fef2f2] hover:text-[#b42318] md:col-auto md:row-span-1 md:row-auto"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </section>

      <div className="mt-3 flex flex-col-reverse gap-3 border-t border-[#e4e7ec] pt-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
          className="h-11 rounded-[10px] border-[#d9dee7] sm:w-[124px]"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-[10px] bg-[#4f46e5] px-5 text-white hover:bg-[#4338ca] sm:min-w-[178px]"
        >
          {isSubmitting
            ? 'Guardando…'
            : 'Crear evento'}
        </Button>
      </div>

    </form>
  )
}
