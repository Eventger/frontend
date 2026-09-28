import {
  useState,
  type FormEvent,
} from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

import { AddSubtaskDialog } from '@/features/events/components/detail/AddSubtaskDialog'

import type {
  CreateSubtaskInput,
} from '@/features/events/types/subtask.types'

type EventFormProps = {
  initialValues?: CreateEventInput
  onSubmit: (
    data: CreateEventInput,
    subtasks: CreateSubtaskInput[],
  ) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

type EventFormErrors = Partial<
  Record<
    keyof CreateEventInput,
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

function getLocalDateInputValue() {
  const today = new Date()

  const year =
    today.getFullYear()

  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    today.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function EventForm({
  initialValues = emptyValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EventFormProps) {
  const minimumEventDate =
    getLocalDateInputValue()

  const {
    eventTypes,
    isLoading:
      isLoadingEventTypes,
    error: eventTypesError,
  } = useEventTypes()

  const [values, setValues] =
    useState<CreateEventInput>(
      initialValues,
    )

  const [errors, setErrors] =
    useState<EventFormErrors>({})

  const [subtasks, setSubtasks] =
    useState<CreateSubtaskInput[]>([])

  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] =
    useState(false)

  const [editingSubtaskIndex, setEditingSubtaskIndex] =
    useState<number | null>(null)
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
  const handleAddSubtask = async (
    subtask: CreateSubtaskInput,
    ) => {
      if (editingSubtaskIndex !== null) {
        setSubtasks((current) =>
          current.map((currentSubtask, index) =>
            index === editingSubtaskIndex
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
  setIsSubtaskDialogOpen(false)
}

  const handleEditSubtask = (
      index: number,
    ) => {
      setEditingSubtaskIndex(index)
      setIsSubtaskDialogOpen(true)
    }
  const handleDeleteSubtask = (
    indexToDelete: number,
 ) => {
  setSubtasks((current) =>
    current.filter(
      (_, index) => index !== indexToDelete,
    ),
  )
}
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
        'Selecciona la fecha del evento.'
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

    setErrors(nextErrors)

    return (
      Object.keys(nextErrors)
        .length === 0
    )
  }

  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    await onSubmit({
      ...values,
      name: values.name.trim(),
      location:
        values.location.trim(),
      contact:
        values.contact.trim(),
    }, subtasks
    )
  }

  return (
    <>
    <form
      onSubmit={handleSubmit}
      className="rounded-[18px] border border-[#dde2ea] bg-white p-5 sm:p-7 md:min-h-[720px]"
      noValidate
    >
      <h2 className="text-xl font-semibold text-[#17212b] sm:text-[22px]">
        Datos del evento
      </h2>

      {/* Información general */}
      <section className="mt-6">
        <h3 className="text-[13px] font-semibold text-[#17212b]">
          ¿Qué vas a organizar?
        </h3>

        <div className="mt-4 grid gap-5 md:grid-cols-2 md:gap-10">
          <div className="space-y-2">
            <label
              htmlFor="event-name"
              className="text-[13px] font-medium text-[#17212b]"
            >
              Nombre del evento *
            </label>

            <Input
              id="event-name"
              type="text"
              value={values.name}
              placeholder="Boda Laura & Daniel"
              disabled={
                isSubmitting
              }
              aria-invalid={Boolean(
                errors.name,
              )}
              aria-describedby={
                errors.name
                  ? 'event-name-error'
                  : undefined
              }
              onChange={(event) =>
                updateField(
                  'name',
                  event.target.value,
                )
              }
              className="h-11 rounded-[9px]"
            />

            {errors.name && (
              <p
                id="event-name-error"
                className="text-xs text-destructive"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="event-type"
              className="text-[13px] font-medium text-[#17212b]"
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
                className="h-11! w-full rounded-[9px]"
                aria-invalid={Boolean(
                  errors.typeId,
                )}
              >
                <SelectValue
                  placeholder={
                    isLoadingEventTypes
                      ? 'Cargando tipos...'
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
              <p className="text-xs text-destructive">
                {errors.typeId}
              </p>
            )}

            {eventTypesError && (
              <p className="text-xs text-destructive">
                {eventTypesError}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Fecha y lugar */}
      <section className="mt-8">
        <h3 className="text-[13px] font-semibold text-[#17212b]">
          ¿Cuándo y dónde será?
        </h3>

        <div className="mt-4 grid gap-5 md:grid-cols-2 md:gap-10">
          <div className="space-y-2">
            <label
              htmlFor="event-date"
              className="text-[13px] font-medium text-[#17212b]"
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
                  ? 'event-date-error'
                  : undefined
              }
              onChange={(event) =>
                updateField(
                  'eventDate',
                  event.target.value,
                )
              }
              className="h-11 rounded-[9px]"
            />

            {errors.eventDate && (
              <p
                id="event-date-error"
                className="text-xs text-destructive"
              >
                {errors.eventDate}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="event-location"
              className="text-[13px] font-medium text-[#17212b]"
            >
              Lugar *
            </label>

            <Input
              id="event-location"
              type="text"
              value={
                values.location
              }
              placeholder="Hacienda Las Palmas, Cali"
              disabled={
                isSubmitting
              }
              aria-invalid={Boolean(
                errors.location,
              )}
              aria-describedby={
                errors.location
                  ? 'event-location-error'
                  : undefined
              }
              onChange={(event) =>
                updateField(
                  'location',
                  event.target.value,
                )
              }
              className="h-11 rounded-[9px]"
            />

            {errors.location && (
              <p
                id="event-location-error"
                className="text-xs text-destructive"
              >
                {errors.location}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="mt-8">
        <h3 className="text-[13px] font-semibold text-[#17212b]">
          ¿A quién podemos contactar?
        </h3>

        <div className="mt-4 space-y-2">
          <label
            htmlFor="event-contact"
            className="text-[13px] font-medium text-[#17212b]"
          >
            Contacto *
          </label>

          <Input
            id="event-contact"
            type="text"
            value={values.contact}
            placeholder="Nombre o teléfono de contacto"
            disabled={
              isSubmitting
            }
            aria-invalid={Boolean(
              errors.contact,
            )}
            aria-describedby={
              errors.contact
                ? 'event-contact-error'
                : undefined
            }
            onChange={(event) =>
              updateField(
                'contact',
                event.target.value,
              )
            }
            className="h-11 w-full rounded-[9px]"
          />

          {errors.contact && (
            <p
              id="event-contact-error"
              className="text-xs text-[#f04438]"
            >
              {errors.contact}
            </p>
          )}
        </div>
      </section>
      {/* Plan logístico */}
    <section className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[13px] font-semibold text-[#17212b]">
            Plan logístico
          </h3>

          <p className="mt-1 text-xs text-[#667085]">
            Añade las tareas necesarias para preparar este evento.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={
            isSubmitting ||
            !values.name.trim() ||
            !values.eventDate
          }
          onClick={() => {
              setEditingSubtaskIndex(null)
              setIsSubtaskDialogOpen(true)
          }}
          className="rounded-[9px]"
        >
          + Agregar tarea
        </Button>
      </div>

      {subtasks.length > 0 && (
        <div className="mt-4 space-y-3">
          {subtasks.map((subtask, index) => (
            <div
              key={`${subtask.name}-${index}`}
              className="rounded-[10px] border border-[#dde2ea] p-4"
            >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-[#17212b]">
                {subtask.name}
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  handleEditSubtask(index)
                }
                className="h-auto px-2 py-1 text-xs text-[#4f46e5]"
              >
                Editar
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  handleDeleteSubtask(index)
                }
                className="h-auto px-2 py-1 text-xs text-[#f04438]"
              >
                Eliminar
              </Button>
            </div>

              <p className="mt-1 text-xs text-[#667085]">
                {subtask.targetDate}
                {' · '}
                {subtask.estimatedHours} h
              </p>

              {subtask.details && (
                <p className="mt-2 text-xs text-[#667085]">
                  {subtask.details}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
      <p className="mt-4 text-xs text-[#667085]">
        * Campos obligatorios
      </p>

      <aside className="mt-5 rounded-[10px] border border-[#c7d2fe] bg-[#eef2ff] p-4">
        <p className="text-[13px] font-semibold text-[#4f46e5]">
          Capacidad de trabajo
        </p>

        <p className="mt-1 text-xs leading-5 text-[#17212b]">
          El límite diario se
          configura una sola vez
          desde tu cuenta y se aplica
          a todos tus eventos.
        </p>
      </aside>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={
            isSubmitting
          }
          onClick={onCancel}
          className="h-11 rounded-[10px] sm:w-[130px]"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={
            isSubmitting
          }
          className="h-11 rounded-[10px] bg-[#4f46e5] text-white hover:bg-[#4338ca] sm:w-[142px]"
        >
          {isSubmitting
            ? 'Guardando...'
            : 'Crear evento'}
        </Button>
      </div>
    </form>
        {values.name.trim() && values.eventDate && (
          <AddSubtaskDialog
            open={isSubtaskDialogOpen}
            eventName={values.name}
            eventDate={values.eventDate}
            initialValues={
                editingSubtaskIndex !== null
                  ? subtasks[editingSubtaskIndex]
                  : undefined
              }
            isSubmitting={false}
            onOpenChange={setIsSubtaskDialogOpen}
            onSubmit={handleAddSubtask}
          />
        )}
    </>
  )
}