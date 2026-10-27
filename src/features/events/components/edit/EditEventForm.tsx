import { getApiFieldError } from '@/lib/api'
import {
  useRef,
  useState,
  useEffect,
  type FormEvent,
} from 'react'

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GripVertical,
  ListTodo,
  MapPin,
  Minus,
  PauseCircle,
  Pencil,
  Phone,
  Plus,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'

import { focusFirstError } from '@/lib/formFocus'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/DateInput'
import { Input } from '@/components/ui/input'
import { EventLocationInput } from '../EventLocationInput'
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
  initialSubtaskId?: number
  onDirtyChange?: (isDirty: boolean) => void
  dailyLimitHours?: number
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

type VisualSubtaskStatus = 'completed' | 'in_progress' | 'pending'
type DatePriority = 'overdue' | 'today' | 'upcoming'

function getVisualSubtaskStatus(subtask: Subtask): VisualSubtaskStatus {
  if (subtask.state === 'completed') return 'completed'
  if (subtask.state === 'in_progress') return 'in_progress'
  return 'pending'
}

function getDatePriority(subtask: Subtask, today: string): DatePriority {
  if (!subtask.targetDate || !subtask.targetDate.trim() || Number.isNaN(new Date(subtask.targetDate).getTime())) {
    return 'upcoming'
  }
  const targetDate = getCalendarDate(subtask.targetDate)
  if (targetDate < today) return 'overdue'
  if (targetDate === today) return 'today'

  return 'upcoming'
}

function renderDatePriorityBadge(priority: DatePriority) {
  if (priority === 'overdue') {
    return (
      <span aria-label="Prioridad de fecha: Vencida" className="inline-flex items-center gap-1.5 rounded-full bg-[#feeeec] px-2.5 py-0.5 text-[12px] font-medium text-[#b42318]">
        <AlertCircle className="size-3.5 shrink-0 fill-[#b42318] text-white" aria-hidden="true" />
        <span>Vencida</span>
      </span>
    )
  }

  if (priority === 'today') {
    return (
      <span aria-label="Prioridad de fecha: Hoy" className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7e6] px-2.5 py-0.5 text-[12px] font-medium text-[#c2410c]">
        <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
        <span>Hoy</span>
      </span>
    )
  }

  return (
    <span aria-label="Prioridad de fecha: Próxima" className="inline-flex items-center gap-1.5 rounded-full bg-[#eff8ff] px-2.5 py-0.5 text-[12px] font-medium text-[#175cd3]">
      <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
      <span>Próxima</span>
    </span>
  )
}

function renderStatusBadge(subtask: Subtask) {
  const status = getVisualSubtaskStatus(subtask)

  if (status === 'completed') {
    return (
      <span aria-label="Estado: Completada" className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf3] px-2.5 py-0.5 text-[12px] font-medium text-[#027a48]">
        <CheckCircle2 className="size-3.5 shrink-0 fill-[#027a48] text-white" aria-hidden="true" />
        <span>Completada</span>
      </span>
    )
  }

  if (status === 'in_progress') {
    return (
      <span aria-label="Estado: En progreso" className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f3ff] px-2.5 py-0.5 text-[12px] font-medium text-[#4f46e5]">
        <Clock3 className="size-3.5 shrink-0 text-[#4f46e5]" aria-hidden="true" />
        <span>En progreso</span>
      </span>
    )
  }

  return (
    <span aria-label={`Estado: ${subtask.state === 'postponed' ? 'Pospuesta' : 'Pendiente'}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#f2f4f7] px-2.5 py-0.5 text-[12px] font-medium text-[#475467]">
      <span className="size-2 rounded-full bg-[#475467] shrink-0" aria-hidden="true" />
      <span>{subtask.state === 'postponed' ? 'Pospuesta' : 'Pendiente'}</span>
    </span>
  )
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
  initialSubtaskId,
  onDirtyChange,
  dailyLimitHours = 6,
}: EditEventFormProps) {
  const today = getCalendarDate(new Date())
  const [values, setValues] =
    useState<FormValues>({
      name: event.name,
      typeId: event.typeId,
      eventDate:
        getCalendarDate(event.eventDate),
      location: event.location,
      contact: event.contact,
    })

  const [contactPhone, setContactPhone] = useState('')

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

  useEffect(() => {
    const initialDate = getCalendarDate(event.eventDate)
    const isDirty = (
      values.name !== event.name ||
      values.typeId !== event.typeId ||
      values.eventDate !== initialDate ||
      values.location !== event.location ||
      values.contact !== event.contact ||
      contactPhone.trim() !== '' ||
      editingSubtask !== null ||
      Object.values(subtaskValues).some((v) => typeof v === 'string' && v.trim() !== '')
    )
    onDirtyChange?.(isDirty)
  }, [values, contactPhone, editingSubtask, subtaskValues, event, onDirtyChange])

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
  const taskListHeading = useRef<HTMLHeadingElement>(null)

  const [pendingTaskError, setPendingTaskError] = useState('')
  const [submitError, setSubmitError] = useState('')

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
    } else if (values.eventDate < today) {
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

    if (!nextErrors.eventDate && values.eventDate && subtasks.some(task => task.state !== 'postponed' && getCalendarDate(task.targetDate) > values.eventDate)) {
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

    if (subtaskValues.state !== 'postponed' && !subtaskValues.targetDate) {
      nextErrors.targetDate =
        'Selecciona la fecha límite.'
    } else if (
      subtaskValues.state !== 'postponed' &&
      subtaskValues.targetDate < today &&
      (!editingSubtask || subtaskValues.targetDate !== getCalendarDate(editingSubtask.targetDate))
    ) {
      nextErrors.targetDate = 'No puedes programar una tarea para una fecha anterior a hoy.'
    } else if (
      subtaskValues.state !== 'postponed' &&
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
      hours < 0.01
    ) {
      nextErrors.estimatedHours =
        'Ingresa un tiempo estimado válido.'
    } else if (hours > dailyLimitHours) {
      nextErrors.estimatedHours =
        `El tiempo estimado no puede superar tu límite diario de ${dailyLimitHours} h.`
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
      targetDate: subtask.state === 'postponed' ? '' : getCalendarDate(subtask.targetDate),
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

  useEffect(() => {
    if (initialSubtaskId === undefined || editingSubtask?.id === initialSubtaskId) return
    const task = subtasks.find((subtask) => subtask.id === initialSubtaskId)
    if (task) handleEditSubtask(task)
  }, [initialSubtaskId, subtasks])

  useEffect(() => {
    if (!editingSubtask) return
    const nameInput = document.getElementById('edit-event-task-name')
    nameInput?.focus()
    nameInput?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [editingSubtask?.id])

  const handleSaveSubtask = async () => {
    if (!validateSubtask()) {
      return
    }

    const data: CreateSubtaskInput = {
      name: subtaskValues.name.trim(),
      targetDate: subtaskValues.state === 'postponed' && editingSubtask
        ? getCalendarDate(editingSubtask.targetDate)
        : subtaskValues.targetDate,
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

    setSubmitError('')
    const phone = contactPhone.trim()
    const rawContact = values.contact.trim()
    const combinedContact = phone && !rawContact.includes(phone)
      ? (rawContact ? `${rawContact} ${phone}` : phone)
      : rawContact

    try {
      await onSubmit({
        name: values.name.trim(),
        typeId: values.typeId,
        eventDate: values.eventDate,
        location: values.location.trim(),
        contact: combinedContact,
      })
    } catch (error) {
      const message = getApiFieldError(error, 'date')
      if (message) {
        setErrors((current) => ({ ...current, eventDate: message }))
        requestAnimationFrame(() => document.getElementById('event-date')?.focus())
      } else {
        setSubmitError('No pudimos guardar el evento. Conservamos tus cambios para que puedas intentarlo de nuevo.')
      }
    }
  }

  const isTaskBusy =
    taskAction !== null || isSubmitting

  return (
    <>
      {submitError && <InlineFeedback>{submitError}</InlineFeedback>}
      <form
        onSubmit={handleSubmit}
        noValidate
      >
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
                  placeholder="Ej. Boda Laura & Daniel"
                  className={`min-h-[44px] rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b] placeholder:text-[#98a2b3] ${
                    errors.name
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />
              </div>

              {errors.name && (
                <FieldError id="edit-event-name-error">
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
                    className={`min-h-[44px]! w-full rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b] ${
                      errors.typeId
                        ? 'border-[#d92d20]'
                        : ''
                    }`}
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

                  <SelectContent position="popper">
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
              </div>

              {errors.typeId && (
                <FieldError id="edit-event-type-error">
                  {errors.typeId}
                </FieldError>
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
                  min={today}
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
                <FieldError id="edit-event-date-error">
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
                <FieldError id="edit-event-location-error">
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
                        ? 'event-contact-error'
                        : undefined
                    }
                    onChange={(inputEvent) =>
                      updateField(
                        'contact',
                        inputEvent.target.value,
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
                  <FieldError
                    id="event-contact-error"
                  >
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
                    onChange={(inputEvent) =>
                      setContactPhone(inputEvent.target.value)
                    }
                    className="min-h-[44px] rounded-lg border-border-subtle bg-white pl-[98px] text-[14px] text-[#17212b] placeholder:text-[#98a2b3]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border-subtle/70 bg-[#fcfcfd] p-5 sm:p-6 shadow-xs">
          {pendingTaskError && (
            <InlineFeedback id="pending-task-error" className="mb-4">
              {pendingTaskError}
            </InlineFeedback>
          )}

          <div
            id="edit-task-form"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4f46e5]">
                <CheckCircle2 className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="type-section-title text-[#17212b]">
                  {editingSubtask
                    ? 'Editar tarea'
                    : 'Crear tarea'}
                </h2>
                <p className="text-[13px] text-[#667085] mt-0.5">
                  Añade una tarea al evento. Las tareas te ayudan a organizar y hacer seguimiento.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1.5fr_1.1fr_auto] items-start">
              <div className="space-y-1">
                <label
                  htmlFor="edit-event-task-name"
                  className="type-label text-[#17212b]"
                >
                  Nombre de la tarea *
                </label>

                <div className="relative">
                  <ListTodo className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#98a2b3]" aria-hidden="true" />
                  <Input
                    id="edit-event-task-name"
                    placeholder="Ej. Confirmar catering"
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
                    className="min-h-[44px] rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b] placeholder:text-[#98a2b3]"
                  />
                </div>

                {subtaskErrors.name && (
                  <FieldError id="edit-event-task-name-error">
                    {subtaskErrors.name}
                  </FieldError>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="edit-event-task-date"
                  className="type-label text-[#17212b]"
                >
                  Fecha límite{subtaskValues.state !== 'postponed' ? ' *' : ''}
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#98a2b3] z-10" aria-hidden="true" />
                  <DateInput
                    id="edit-event-task-date"
                    min={today}
                    max={
                      values.eventDate || undefined
                    }
                    value={subtaskValues.state === 'postponed' ? '' : subtaskValues.targetDate}
                    disabled={isTaskBusy || subtaskValues.state === 'postponed'}
                    aria-invalid={subtaskValues.state !== 'postponed' && Boolean(subtaskErrors.targetDate)}
                    aria-describedby={
                      subtaskValues.state === 'postponed'
                        ? undefined
                        : subtaskErrors.targetDate
                        ? 'edit-event-task-date-error'
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
                  <FieldError id="edit-event-task-date-error">
                    {subtaskErrors.targetDate}
                  </FieldError>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="edit-event-task-hours"
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
                      disabled={isTaskBusy || Number(subtaskValues.estimatedHours || 0) <= 0.5}
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
                      id="edit-event-task-hours"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={
                        subtaskValues.estimatedHours
                      }
                      disabled={isTaskBusy}
                      aria-label="Tiempo estimado *"
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
                      className="h-8 w-14 border-0 p-0 text-center font-medium text-[14px] text-[#17212b] shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      disabled={isTaskBusy}
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
                  <FieldError id="edit-event-task-hours-error">
                    {subtaskErrors.estimatedHours}
                  </FieldError>
                )}
              </div>
            </div>

            {editingSubtask && (
              <div className="mt-4 space-y-1">
                <label htmlFor="edit-event-task-state" className="type-label text-[#17212b]">Estado de la tarea</label>
                <Select value={subtaskValues.state} disabled={isTaskBusy} onValueChange={value => {
                  if (value === 'pending' || value === 'in_progress' || value === 'completed' || value === 'postponed') updateSubtaskField('state', value)
                }}>
                  <SelectTrigger id="edit-event-task-state" className="h-11 w-full rounded-lg border-border-subtle bg-white sm:max-w-[260px]"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En progreso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="postponed">Pospuesta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1">
                <label
                  htmlFor="edit-event-task-details"
                  className="type-label text-[#17212b]"
                >
                  Nota opcional
                </label>

                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3.5 top-3 size-4 text-[#98a2b3]" aria-hidden="true" />
                  <Textarea
                    id="edit-event-task-details"
                    placeholder="Ej. Detalles, observaciones o instrucciones..."
                    value={subtaskValues.details}
                    disabled={isTaskBusy}
                    onChange={(inputEvent) =>
                      updateSubtaskField(
                        'details',
                        inputEvent.target.value,
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
                  disabled={isTaskBusy}
                  onClick={resetSubtaskForm}
                  aria-label={
                    editingSubtask
                      ? 'Cancelar edición de tarea'
                      : 'Limpiar tarea'
                  }
                  className="h-11 rounded-lg border-border-subtle px-8"
                >
                  {editingSubtask
                    ? 'Cancelar'
                    : 'Limpiar'}
                </Button>

                <Button
                  type="button"
                  disabled={isTaskBusy}
                  onClick={handleSaveSubtask}
                  className="h-11 rounded-lg bg-[#4f46e5] px-8 text-white hover:bg-[#4338ca]"
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

          <div className="mt-8 border-t border-border-subtle pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] text-[#4f46e5]">
                <ListTodo className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 ref={taskListHeading} tabIndex={-1} className="type-section-title text-[#17212b]">
                  Tareas agregadas ({subtasks.length})
                </h2>
                <p className="text-[12px] text-[#667085] mt-0.5">
                  Gestiona las tareas del evento. Puedes editar, cambiar fechas o eliminar.
                </p>
              </div>
            </div>

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
              <ul className="mt-4 space-y-2.5" aria-label="Tareas agregadas">
                {subtasks.map((subtask) => {
                  const datePriority = getDatePriority(subtask, today)
                  const dateTone = datePriority === 'overdue'
                    ? 'text-[#b42318]'
                    : datePriority === 'today'
                      ? 'text-[#c2410c]'
                      : 'text-[#175cd3]'

                  return (
                    <li
                      key={subtask.id}
                      className="grid min-h-12 grid-cols-[16px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-lg border border-border-subtle bg-white px-3 py-2 md:grid-cols-[16px_minmax(0,1fr)_120px_72px_110px_40px_auto_40px] lg:grid-cols-[16px_minmax(0,1fr)_130px_90px_110px_132px_auto_40px]"
                    >
                    {/* Grip */}
                    <GripVertical
                      size={16}
                      className="shrink-0 text-[#98a2b3] self-start md:self-center pt-1 md:pt-0"
                      aria-hidden="true"
                    />

                    {/* Nombre de tarea */}
                    <p
                      title={subtask.name}
                      className="min-w-0 break-words md:truncate text-[13px] sm:text-[14px] font-semibold text-[#17212b]"
                    >
                      {subtask.name}
                    </p>

                    {/* Metadatos (Fecha, Horas y Estado) */}
                    <div className="col-start-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 md:contents">
                      <div className="flex flex-col items-start gap-1 text-[12px] sm:text-[13px] whitespace-nowrap">
                        {subtask.state === 'postponed' ? (
                          <span className="flex items-center gap-1.5 text-[#667085]">
                            <PauseCircle className="size-3.5 shrink-0" aria-hidden="true" />
                            <span>Sin fecha</span>
                          </span>
                        ) : (
                          <>
                            <span className={`flex items-center gap-1.5 ${dateTone}`}>
                              <CalendarDays
                                size={14}
                                className="shrink-0"
                                aria-hidden="true"
                              />
                              <time dateTime={getCalendarDate(subtask.targetDate)}>
                                {formatTaskDate(subtask.targetDate)}
                              </time>
                            </span>
                            {renderDatePriorityBadge(datePriority)}
                          </>
                        )}
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
                        {renderStatusBadge(subtask)}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="col-start-2 flex items-center justify-end gap-2 pt-1 md:contents">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center lg:w-[132px] lg:justify-start">
                        {subtask.state !== 'completed' && subtask.state !== 'postponed' ? (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isTaskBusy}
                            aria-label={`Reprogramar ${subtask.name}`}
                            className="h-11 w-full px-2 text-[#3730a3] lg:justify-start"
                            onClick={() => {
                              setRescheduleSaved(false)
                              setRescheduling({ task: subtask })
                            }}
                          >
                            <CalendarDays className="size-3.5 shrink-0 text-[#4f46e5]" aria-hidden="true" />
                            <span className="hidden lg:inline">Cambiar fecha</span>
                          </Button>
                        ) : (
                          <div className="h-11 w-11 shrink-0 lg:w-[132px]" aria-hidden="true" />
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={isTaskBusy}
                        onClick={() => handleEditSubtask(subtask)}
                        aria-label={`Editar ${subtask.name}`}
                        className="size-11 shrink-0 text-[#667085] hover:bg-[#eef2ff] hover:text-[#4f46e5]"
                      >
                        <Pencil size={15} />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isTaskBusy}
                        onClick={() => setDeletingSubtask(subtask)}
                        aria-label={`Eliminar ${subtask.name}`}
                        className="size-11 shrink-0 text-[#d92d20] hover:bg-[#fef2f2] hover:text-[#b42318]"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-border-subtle px-4 py-3 text-[13px] text-[#667085]">
                Aún no hay tareas. Completa el formulario superior para agregar la primera.
              </p>
            )}
          </div>
        </section>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#e4e7ec] pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isTaskBusy}
            onClick={onCancel}
            className="h-11 rounded-lg border-border-subtle sm:w-[124px]"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isTaskBusy}
            className="h-11 rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] sm:w-[178px]"
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
          getFocusFallback={() => taskListHeading.current}
          preferFocusFallback={rescheduleSaved}
          onSaved={async (task) => {
            setRescheduleSaved(true)
            if (editingSubtask?.id === rescheduling.task.id) {
              resetSubtaskForm()
            }
            await onSubtasksChanged?.(task)
          }}
          onClose={() => {
            setRescheduling(null)
          }}
        />
      )}
    </>
  )
}
