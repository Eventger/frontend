import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GripVertical,
  ListTodo,
  MapPin,
  Minus,
  Pencil,
  Phone,
  Plus,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'

import { focusFirstError } from '@/lib/formFocus'
import { formatCalendarDate, getCalendarDate } from '@/lib/calendar'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/DateInput'
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
  dailyLimitHours?: number
  serverErrors?: EventFormErrors
}

let nextDraftId = 0

function generateSafeId(): string {
  nextDraftId += 1
  return `draft-${nextDraftId}`
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


function formatTaskDate(date: string) {
  return formatCalendarDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}


export function EventForm({
  initialValues = emptyValues,
  initialSubtasks = [],
  onSubmit,
  onCancel,
  onDraftChange,
  isSubmitting = false,
  dailyLimitHours = 6,
  serverErrors,
}: EventFormProps) {
  const minimumEventDate =
    getCalendarDate(new Date())

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

  const [contactPhone, setContactPhone] = useState('')

  const [errors, setErrors] =
    useState<EventFormErrors>({})

  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setErrors((current) => ({ ...current, ...serverErrors }))
      focusFirstError(serverErrors, {
        name: 'event-name',
        typeId: 'event-type',
        eventDate: 'event-date',
        location: 'event-location',
        contact: 'event-contact',
      })
    }
  }, [serverErrors])


  /*
   * TAREAS TEMPORALES
   */

  const [subtaskDrafts, setSubtaskDrafts] = useState(() =>
    initialSubtasks.map(data => ({ id: generateSafeId(), data })),
  )
  const subtasks = useMemo(() => subtaskDrafts.map(draft => draft.data), [subtaskDrafts])

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
    const phone = contactPhone.trim()
    const rawContact = values.contact.trim()
    const combinedContact = phone && !rawContact.includes(phone)
      ? (rawContact ? `${rawContact} ${phone}` : phone)
      : values.contact
    onDraftChange?.({ ...values, contact: combinedContact }, subtasks)
  }, [onDraftChange, subtasks, values, contactPhone])


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
      getCalendarDate(new Date())
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
      getCalendarDate(new Date())
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
      estimatedHours < 0.01
    ) {
      nextErrors.estimatedHours =
        'Ingresa un tiempo estimado válido.'
    } else if (estimatedHours > dailyLimitHours) {
      nextErrors.estimatedHours =
        `El tiempo estimado no puede superar tu límite diario de ${dailyLimitHours} h.`
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
      setSubtaskDrafts((current) =>
        current.map(
          (
            currentSubtask,
            index,
          ) =>
            index ===
            editingSubtaskIndex
              ? { ...currentSubtask, data: subtask }
              : currentSubtask,
        ),
      )
    } else {
      const draft = { id: generateSafeId(), data: subtask }
      setSubtaskDrafts((current) => [
        ...current,
        draft,
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
    setSubtaskDrafts((current) =>
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

    const phone = contactPhone.trim()
    const rawContact = values.contact.trim()
    const combinedContact = phone && !rawContact.includes(phone)
      ? (rawContact ? `${rawContact} ${phone}` : phone)
      : rawContact

    await onSubmit(
      {
        ...values,

        name:
          values.name.trim(),

        location:
          values.location.trim(),

        contact:
          combinedContact,
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

      <section className="rounded-2xl border border-border-subtle/70 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4f46e5]">
            <CalendarDays className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="type-section-title text-[#17212b]">
              Datos del evento
            </h2>
            <p className="text-[13px] text-[#667085] mt-0.5">
              Información general para identificar tu evento.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5">
          {/* Nombre del evento */}
          <div className="space-y-1">
            <label
              htmlFor="event-name"
              className="type-label text-[#17212b]"
            >
              Nombre del evento *
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#98a2b3]" aria-hidden="true" />
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
                placeholder="Ej. Boda Laura & Daniel"
                className={`min-h-[44px] rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b] placeholder:text-[#98a2b3] ${
                  errors.name
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />
            </div>

            {errors.name && (
              <FieldError id="create-event-name-error">
                {errors.name}
              </FieldError>
            )}
          </div>

          {/* Tipo de evento */}
          <div className="space-y-1">
            <label
              htmlFor="event-type"
              className="type-label text-[#17212b]"
            >
              Tipo de evento *
            </label>

            <div className="relative">
              <Sparkles className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#98a2b3] z-10" aria-hidden="true" />
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
                  className={`min-h-[44px]! w-full rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b] ${
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

                <SelectContent position="popper">
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
            </div>

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
            {eventTypesError && (
              <Button
                type="button"
                variant="link"
                disabled={isSubmitting || isLoadingEventTypes}
                onClick={() => void retryEventTypes()}
                className="min-h-11 px-0"
              >
                Reintentar tipos de evento
              </Button>
            )}
          </div>

          {/* Fecha del evento */}
          <div className="space-y-1">
            <label
              htmlFor="event-date"
              className="type-label text-[#17212b]"
            >
              Fecha del evento *
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#98a2b3] z-10" aria-hidden="true" />
              <DateInput
                id="event-date"
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
                onValueChange={(value) =>
                  updateField(
                    'eventDate',
                    value,
                  )
                }
                calendarLabel="Abrir calendario de la fecha del evento"
                className={`min-h-[44px] rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b] ${
                  errors.eventDate
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />
            </div>

            {errors.eventDate && (
              <FieldError id="create-event-date-error">
                {errors.eventDate}
              </FieldError>
            )}
          </div>

          {/* Lugar */}
          <div className="space-y-1">
            <label
              htmlFor="event-location"
              className="type-label text-[#17212b]"
            >
              Lugar *
            </label>

            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#98a2b3] z-10" aria-hidden="true" />
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
                className={`min-h-[44px] rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b] ${
                  errors.location
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />
            </div>

            {errors.location && (
              <FieldError id="create-event-location-error">
                {errors.location}
              </FieldError>
            )}
          </div>
        </div>

        {/* Contacto del cliente sub-card */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] text-[#4f46e5]">
              <User className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[#17212b] leading-tight">
                Contacto del cliente
              </h3>
              <p className="text-[12px] text-[#667085] mt-0.5">
                Persona responsable del evento para coordinar detalles.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 md:gap-5">
            {/* Subcampo 1: Nombre del contacto / cliente */}
            <div className="space-y-1">
              <label
                htmlFor="event-contact"
                className="type-label text-[#17212b]"
              >
                Nombre del contacto *
              </label>

              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#98a2b3]" aria-hidden="true" />
                <Input
                  id="event-contact"
                  aria-label="Contacto *"
                  placeholder="Ej. María Fernanda López"
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
                  className={`min-h-[44px] rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b] placeholder:text-[#98a2b3] ${
                    errors.contact
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />
              </div>

              {errors.contact && (
                <FieldError id="create-event-contact-error">
                  {errors.contact}
                </FieldError>
              )}
            </div>

            {/* Subcampo 2: Número de teléfono del cliente */}
            <div className="space-y-1">
              <label
                htmlFor="event-contact-phone"
                className="type-label text-[#17212b]"
              >
                Número de teléfono *
              </label>

              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center gap-1.5 text-[#475467]">
                  <Phone className="size-4 text-[#4f46e5]" aria-hidden="true" />
                  <span className="text-[13px] select-none" aria-hidden="true">🇨🇴</span>
                  <span className="text-[13px] font-medium text-[#344054] select-none">+57</span>
                </div>
                <Input
                  id="event-contact-phone"
                  type="tel"
                  placeholder="300 123 4567"
                  value={contactPhone}
                  disabled={isSubmitting}
                  onChange={(event) => setContactPhone(event.target.value)}
                  className="min-h-[44px] rounded-lg border-border-subtle bg-white pl-[98px] text-[14px] text-[#17212b] placeholder:text-[#98a2b3]"
                />
              </div>
            </div>
          </div>
        </div>

      </section>


      {/* =========================
          TAREAS DEL EVENTO
      ========================== */}

      <section className="mt-6 rounded-2xl border border-border-subtle/70 bg-[#fcfcfd] p-5 sm:p-6 shadow-xs">
        {pendingTaskError && (
          <InlineFeedback id="pending-task-error" className="mb-4">
            {pendingTaskError}
          </InlineFeedback>
        )}

        <div className="flex items-center gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4f46e5]">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="type-section-title text-[#17212b]">
              {editingSubtaskIndex !== null ? 'Editar tarea' : 'Crear tarea'}
              {editingSubtaskIndex === null && (
                <span className="ml-2 inline-flex items-center rounded-full bg-[#f2f4f7] px-2.5 py-0.5 text-xs font-medium text-[#475467]">
                  Opcional
                </span>
              )}
            </h2>
            <p className="text-[13px] text-[#667085] mt-0.5">
              Plan logístico opcional. Puedes añadir tareas ahora o más tarde desde el evento.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1.5fr_1.1fr_auto] items-start">
          <div className="space-y-1">
            <label
              htmlFor="subtask-name"
              className="type-label text-[#17212b]"
            >
              Nombre de la tarea *
            </label>

            <div className="relative">
              <ListTodo className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#98a2b3]" aria-hidden="true" />
              <Input
                id="subtask-name"
                placeholder="Ej. Confirmar catering"
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
                className="min-h-[44px] rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b] placeholder:text-[#98a2b3]"
              />
            </div>

            {subtaskErrors.name && (
              <FieldError id="create-subtask-name-error">
                {subtaskErrors.name}
              </FieldError>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="subtask-target-date"
              className="type-label text-[#17212b]"
            >
              Fecha límite *
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#98a2b3] z-10" aria-hidden="true" />
              <DateInput
                id="subtask-target-date"
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
                onValueChange={(value) =>
                  updateSubtaskField(
                    'targetDate',
                    value,
                  )
                }
                calendarLabel="Abrir calendario de la fecha límite"
                className="min-h-[44px] rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b]"
              />
            </div>

            {subtaskErrors.targetDate && (
              <FieldError id="create-subtask-date-error">
                {subtaskErrors.targetDate}
              </FieldError>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="subtask-estimated-hours"
              className="type-label text-[#17212b]"
            >
              Duración estimada (horas) *
            </label>

            <div className="flex items-center gap-2">
              <div
                className={`flex h-11 items-center rounded-lg border bg-white px-1.5 shadow-xs transition-colors focus-within:border-[#4f46e5] focus-within:ring-1 focus-within:ring-[#4f46e5] ${
                  subtaskErrors.estimatedHours ? 'border-[#d92d20]' : 'border-border-subtle'
                }`}
              >
                <button
                  type="button"
                  disabled={isSubmitting || Number(subtaskValues.estimatedHours || 0) <= 0.5}
                  onClick={() => {
                    const current = Number(subtaskValues.estimatedHours) || 1
                    const next = Math.max(0.5, current - 0.5)
                    updateSubtaskField('estimatedHours', String(next))
                  }}
                  aria-label="Disminuir tiempo estimado"
                  className="flex size-7 items-center justify-center rounded-full text-[#4f46e5] hover:bg-[#eef2ff] disabled:pointer-events-none disabled:opacity-40 transition-colors"
                >
                  <Minus className="size-3.5" aria-hidden="true" />
                </button>
                <Input
                  id="subtask-estimated-hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={
                    subtaskValues.estimatedHours
                  }
                  disabled={isSubmitting}
                  aria-label="Tiempo estimado *"
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
                  className="h-8 w-14 border-0 p-0 text-center font-medium text-[14px] text-[#17212b] shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    const current = Number(subtaskValues.estimatedHours) || 0
                    const next = current + 0.5
                    updateSubtaskField('estimatedHours', String(next))
                  }}
                  aria-label="Aumentar tiempo estimado"
                  className="flex size-7 items-center justify-center rounded-full text-[#4f46e5] hover:bg-[#eef2ff] disabled:pointer-events-none disabled:opacity-40 transition-colors"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                </button>
              </div>
              <span className="text-[13px] font-medium text-[#667085] select-none">horas</span>
            </div>

            {subtaskErrors.estimatedHours && (
              <FieldError id="create-subtask-hours-error">
                {subtaskErrors.estimatedHours}
              </FieldError>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1">
            <label
              htmlFor="subtask-details"
              className="type-label text-[#17212b]"
            >
              Nota opcional
            </label>

            <div className="relative">
              <FileText className="pointer-events-none absolute left-3.5 top-3 size-4 text-[#98a2b3]" aria-hidden="true" />
              <Textarea
                id="subtask-details"
                placeholder="Ej. Detalles, observaciones o instrucciones..."
                value={subtaskValues.details}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateSubtaskField(
                    'details',
                    event.target.value,
                  )
                }
                className="min-h-[44px] h-[44px] resize-none rounded-lg border-border-subtle bg-white pl-10 py-2.5 text-[14px] text-[#17212b] placeholder:text-[#98a2b3]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleCancelSubtask}
              className="h-11 rounded-lg border-border-subtle px-8"
            >
              {editingSubtaskIndex !== null
                ? 'Cancelar'
                : 'Limpiar'}
            </Button>

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveSubtask}
              className="h-11 rounded-lg bg-[#4f46e5] px-8 text-white hover:bg-[#4338ca]"
            >
              {editingSubtaskIndex !== null
                ? 'Guardar tarea'
                : 'Agregar tarea'}
            </Button>
          </div>
        </div>

        {subtasks.length > 0 && (
          <div className="mt-8 border-t border-border-subtle pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] text-[#4f46e5]">
                <ListTodo className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="type-section-title text-[#17212b]">
                  Tareas agregadas ({subtasks.length})
                </h3>
                <p className="text-[12px] text-[#667085] mt-0.5">
                  Gestiona las tareas del evento. Puedes editar, cambiar fechas o eliminar.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {subtasks.map((subtask, index) => {
                const today = getCalendarDate(new Date())
                const isOverdue = subtask.targetDate < today
                const isToday = subtask.targetDate === today
                return (
                  <div
                    key={subtaskDrafts[index].id}
                    className="grid min-h-12 grid-cols-[16px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-lg border border-border-subtle bg-white px-3 py-2 md:grid-cols-[16px_minmax(0,1fr)_120px_72px_110px_auto_40px] lg:grid-cols-[16px_minmax(0,1fr)_130px_90px_110px_auto_40px]"
                  >
                    <GripVertical
                      size={16}
                      className="shrink-0 text-[#98a2b3] self-start md:self-center pt-1 md:pt-0"
                      aria-hidden="true"
                    />

                    <p
                      title={subtask.name}
                      className="min-w-0 break-words md:truncate text-[13px] sm:text-[14px] font-semibold text-[#17212b]"
                    >
                      {subtask.name}
                    </p>

                    <div className="col-start-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 md:contents">
                      <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-[#667085] whitespace-nowrap">
                        <CalendarDays
                          size={14}
                          className="shrink-0 text-[#98a2b3]"
                          aria-hidden="true"
                        />
                        <span>{formatTaskDate(subtask.targetDate)}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-[#667085] whitespace-nowrap">
                        <Clock3
                          size={14}
                          className="shrink-0 text-[#98a2b3]"
                          aria-hidden="true"
                        />
                        <span>{subtask.estimatedHours} h</span>
                      </div>

                      <div className="flex shrink-0">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3f2] px-2.5 py-0.5 text-[12px] font-medium text-[#b42318]">
                            <span className="size-2 rounded-full bg-[#b42318] shrink-0" aria-hidden="true" />
                            <span>Vencida</span>
                          </span>
                        ) : isToday ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffaeb] px-2.5 py-0.5 text-[12px] font-medium text-[#b54708] border border-[#fedf89]">
                            <CalendarDays className="size-3.5 shrink-0 text-[#b54708]" aria-hidden="true" />
                            <span>Hoy</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff8ff] px-2.5 py-0.5 text-[12px] font-medium text-[#175cd3]">
                            <Clock3 className="size-3.5 shrink-0 text-[#175cd3]" aria-hidden="true" />
                            <span>Próxima</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-start-2 flex items-center justify-end gap-2 pt-1 md:contents">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => handleEditSubtask(index)}
                        aria-label={`Editar ${subtask.name}`}
                        className="size-11 shrink-0 text-[#667085] hover:bg-[#eef2ff] hover:text-[#4f46e5]"
                      >
                        <Pencil size={15} />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isSubmitting}
                        onClick={() => handleDeleteSubtask(index)}
                        aria-label={`Eliminar ${subtask.name}`}
                        className="size-11 shrink-0 text-[#d92d20] hover:bg-[#fef2f2] hover:text-[#b42318]"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#e4e7ec] pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
          className="h-11 rounded-lg border-border-subtle sm:w-[124px]"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-lg bg-[#4f46e5] px-5 text-white hover:bg-[#4338ca] sm:min-w-[178px]"
        >
          {isSubmitting
            ? 'Guardando…'
            : 'Crear evento'}
        </Button>
      </div>

    </form>
  )
}
