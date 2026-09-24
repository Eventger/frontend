import { useState, type FormEvent } from 'react'
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
import type { CreateEventInput } from '@/features/events/types/event.types'



type EventFormProps = {
  initialValues?: CreateEventInput
  onSubmit: (data: CreateEventInput) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

type EventFormErrors = Partial<
  Record<keyof CreateEventInput, string>
>

const emptyValues: CreateEventInput = {
  name: '',
  typeId: null,
  eventDate: '',
  location: '',
}

function getLocalDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function EventForm({
  initialValues = emptyValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EventFormProps) {
  const minimumEventDate = getLocalDateInputValue()

  const {
  eventTypes,
  isLoading: isLoadingEventTypes,
  error: eventTypesError,
} = useEventTypes()

  const [values, setValues] =
    useState<CreateEventInput>(initialValues)

  const [errors, setErrors] =
    useState<EventFormErrors>({})

  const updateField = <K extends keyof CreateEventInput>(
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

  const validate = () => {
    const nextErrors: EventFormErrors = {}

    if (!values.name.trim()) {
      nextErrors.name = 'Ingresa el nombre del evento.'
    }

    if (values.typeId === null) {
      nextErrors.typeId = 'Selecciona un tipo de evento.'
    }

    if (!values.eventDate) {
      nextErrors.eventDate = 'Selecciona la fecha del evento.'
    } else if (values.eventDate < getLocalDateInputValue()) {
      nextErrors.eventDate = 'La fecha del evento no puede estar en el pasado.'
    }

    if (!values.location.trim()) {
      nextErrors.location = 'Ingresa el lugar del evento.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    await onSubmit({
      ...values,
      name: values.name.trim(),
      location: values.location.trim(),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[18px] border border-[#dde2ea] bg-white p-5 sm:p-7"
      noValidate
    >
      <h2 className="text-xl font-semibold text-[#17212b] sm:text-[22px]">
        Datos del evento
      </h2>

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
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={
                errors.name ? 'event-name-error' : undefined
              }
              onChange={(event) =>
                updateField('name', event.target.value)
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
                  ? String(values.typeId)
                  : ''
              }
              disabled={
                isSubmitting ||
                isLoadingEventTypes
              }
              onValueChange={(value) =>
                updateField('typeId', Number(value))
              }
            >
              <SelectTrigger
                id="event-type"
                className="h-11! w-full rounded-[9px]"
                aria-invalid={Boolean(errors.typeId)}
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
                {eventTypes.map((eventType) => (
                  <SelectItem
                    key={eventType.id}
                    value={String(eventType.id)}
                  >
                    {eventType.name}
                  </SelectItem>
                ))}
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
              min={minimumEventDate}
              value={values.eventDate}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.eventDate)}
              aria-describedby={
                errors.eventDate ? 'event-date-error' : undefined
              }
              onChange={(event) =>
                updateField('eventDate', event.target.value)
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
              value={values.location}
              placeholder="Hacienda Las Palmas, Cali"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.location)}
              onChange={(event) =>
                updateField('location', event.target.value)
              }
              className="h-11 rounded-[9px]"
            />

            {errors.location && (
              <p className="text-xs text-destructive">
                {errors.location}
              </p>
            )}
          </div>
        </div>
      </section>

      <p className="mt-4 text-xs text-[#667085]">
        * Campos obligatorios
      </p>

      <aside className="mt-8 rounded-[10px] border border-[#c7d2fe] bg-[#eef2ff] p-4">
        <p className="text-[13px] font-semibold text-[#4f46e5]">
          Capacidad de trabajo
        </p>

        <p className="mt-1 text-xs leading-5 text-[#17212b]">
          El límite diario se configura una sola vez desde tu cuenta y se
          aplica a todos tus eventos.
        </p>
      </aside>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
          className="h-11 rounded-[10px] sm:min-w-[130px]"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-[10px] bg-[#4f46e5] text-white hover:bg-[#4338ca] sm:min-w-[142px]"
        >
          {isSubmitting
            ? 'Guardando...'
            : 'Crear evento'}
        </Button>
      </div>
    </form>
  )
}
