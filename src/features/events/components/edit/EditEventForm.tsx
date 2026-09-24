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

import type {
  Event,
  EventType,
  UpdateEventInput,
} from '@/features/events/types/event.types'

type EditEventFormProps = {
  event: Event
  eventTypes: EventType[]
  isSubmitting: boolean
  onSubmit: (
    data: UpdateEventInput,
  ) => Promise<void>
  onCancel: () => void
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

export function EditEventForm({
  event,
  eventTypes,
  isSubmitting,
  onSubmit,
  onCancel,
}: EditEventFormProps) {
  const [values, setValues] =
    useState<FormValues>({
      name: event.name,
      typeId: event.typeId,
      eventDate:
        event.eventDate.slice(0, 10),
      location: event.location,
      contact: event.contact,
    })

  const [errors, setErrors] =
    useState<FormErrors>({})

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
        'Selecciona la fecha del evento.'
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
    submitEvent:
      FormEvent<HTMLFormElement>,
  ) => {
    submitEvent.preventDefault()

    if (!validate()) {
      return
    }

    await onSubmit({
      name: values.name.trim(),
      typeId: values.typeId,
      eventDate:
        values.eventDate,
      location:
        values.location.trim(),
      contact:
        values.contact.trim(),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-[820px] rounded-[18px] border border-[#dde2ea] bg-white p-6 md:min-h-[650px] md:p-7"
    >
      <h2 className="text-[22px] font-semibold text-[#17212b]">
        Datos del evento
      </h2>

      <section className="mt-5">
        <h3 className="text-[13px] font-semibold text-[#17212b]">
          Información general
        </h3>

        <div className="mt-4 grid gap-6 md:grid-cols-2 md:gap-10">
          <div className="space-y-2">
            <label
              htmlFor="event-name"
              className="text-[13px] font-medium text-[#17212b]"
            >
              Nombre del evento *
            </label>

            <Input
              id="event-name"
              value={values.name}
              disabled={
                isSubmitting
              }
              aria-invalid={Boolean(
                errors.name,
              )}
              onChange={(e) =>
                updateField(
                  'name',
                  e.target.value,
                )
              }
              className="h-11 rounded-[9px]"
            />

            {errors.name && (
              <p className="text-xs text-[#b42318]">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-[#17212b]">
              Tipo de evento *
            </label>

            <Select
              value={
                values.typeId === null
                  ? undefined
                  : String(
                      values.typeId,
                    )
              }
              disabled={
                isSubmitting
              }
              onValueChange={(value) =>
                updateField(
                  'typeId',
                  Number(value),
                )
              }
            >
              <SelectTrigger
                className="h-11 w-full rounded-[9px]"
                aria-invalid={Boolean(
                  errors.typeId,
                )}
              >
                <SelectValue placeholder="Selecciona un tipo de evento" />
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
              <p className="text-xs text-[#b42318]">
                {errors.typeId}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-[13px] font-semibold text-[#17212b]">
          Fecha y ubicación
        </h3>

        <div className="mt-4 grid gap-6 md:grid-cols-2 md:gap-10">
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
              value={
                values.eventDate
              }
              disabled={
                isSubmitting
              }
              aria-invalid={Boolean(
                errors.eventDate,
              )}
              onChange={(e) =>
                updateField(
                  'eventDate',
                  e.target.value,
                )
              }
              className="h-11 rounded-[9px]"
            />

            {errors.eventDate && (
              <p className="text-xs text-[#b42318]">
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
              value={
                values.location
              }
              disabled={
                isSubmitting
              }
              aria-invalid={Boolean(
                errors.location,
              )}
              onChange={(e) =>
                updateField(
                  'location',
                  e.target.value,
                )
              }
              className="h-11 rounded-[9px]"
            />

            {errors.location && (
              <p className="text-xs text-[#b42318]">
                {errors.location}
              </p>
            )}
          </div>
        </div>
      </section>

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
            value={values.contact}
            placeholder="Nombre o teléfono de contacto"
            disabled={isSubmitting}
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
              className="text-xs text-[#b42318]"
            >
              {errors.contact}
            </p>
          )}
        </div>
      </section>

      <p className="mt-4 text-[12px] text-[#667085]">
        * Campos obligatorios
      </p>

      <div className="mt-16 rounded-[10px] border border-[#c7d2fe] bg-[#eef2ff] px-4 py-3">
        <p className="text-[13px] font-semibold text-[#4f46e5]">
          Capacidad de trabajo
        </p>

        <p className="mt-1 text-[12px] text-[#17212b]">
          La capacidad de trabajo
          pertenece a tu cuenta y no
          cambia al editar este evento.
        </p>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
          className="h-11 rounded-[10px] sm:w-[130px]"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-[10px] bg-[#4f46e5] text-white hover:bg-[#4338ca] sm:w-[170px]"
        >
          {isSubmitting
            ? 'Guardando...'
            : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
