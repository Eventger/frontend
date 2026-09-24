import {
  useState,
  type FormEvent,
} from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { CreateSubtaskInput } from '@/features/events/types/subtask.types'

type AddSubtaskDialogProps = {
  open: boolean
  eventName: string
  eventDate: string
  isSubmitting?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (
    data: CreateSubtaskInput,
  ) => Promise<void>
}

type FormValues = {
  name: string
  targetDate: string
  estimatedHours: string
  details: string
}

type FormErrors = Partial<
  Record<keyof FormValues, string>
>

const emptyValues: FormValues = {
  name: '',
  targetDate: '',
  estimatedHours: '',
  details: '',
}

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date))
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

export function AddSubtaskDialog({
  open,
  eventName,
  eventDate,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: AddSubtaskDialogProps) {
  const [values, setValues] =
    useState<FormValues>(emptyValues)

  const [errors, setErrors] =
    useState<FormErrors>({})

  const eventDateOnly =
    eventDate.slice(0, 10)
  const minimumTargetDate =
    getLocalDateInputValue()

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
        'Ingresa el nombre de la tarea.'
    }

    if (!values.targetDate) {
      nextErrors.targetDate =
        'Selecciona la fecha límite.'
    } else if (
      values.targetDate <
      getLocalDateInputValue()
    ) {
      nextErrors.targetDate =
        'La fecha límite no puede estar en el pasado.'
    } else if (
      values.targetDate > eventDateOnly
    ) {
      nextErrors.targetDate =
        'La tarea debe completarse antes del evento.'
    }

    const estimatedHours =
      Number(values.estimatedHours)

    if (!values.estimatedHours) {
      nextErrors.estimatedHours =
        'Ingresa el tiempo estimado.'
    } else if (
      Number.isNaN(estimatedHours) ||
      estimatedHours <= 0
    ) {
      nextErrors.estimatedHours =
        'Ingresa un tiempo mayor que cero.'
    }

    setErrors(nextErrors)

    return (
      Object.keys(nextErrors).length === 0
    )
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    await onSubmit({
      name: values.name.trim(),
      targetDate: values.targetDate,
      estimatedHours: Number(
        values.estimatedHours,
      ),
      details: values.details.trim(),
    })
  }

  const handleOpenChange = (
    nextOpen: boolean,
  ) => {
    if (isSubmitting) {
      return
    }

    if (!nextOpen) {
      setValues(emptyValues)
      setErrors({})
    }

    onOpenChange(nextOpen)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto rounded-[18px] border-[#d9dee7] p-0 sm:max-w-[620px]"
        showCloseButton={false}
      >
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-7"
          noValidate
        >
          <DialogTitle className="text-[28px] font-bold text-[#17212b]">
            Agregar tarea
          </DialogTitle>

          <DialogDescription className="mt-2 max-w-[550px] text-[14px] leading-[22px] text-[#667085]">
            Define qué necesitas hacer y
            cuándo debe quedar listo para{' '}
            {eventName}.
          </DialogDescription>

          <section className="mt-2">
            <h3 className="text-[13px] font-semibold text-[#17212b]">
              ¿Qué necesitas hacer?
            </h3>

            <div className="mt-4 space-y-2">
              <label
                htmlFor="subtask-name"
                className="text-[13px] font-medium text-[#17212b]"
              >
                Nombre de la tarea *
              </label>

              <Input
                id="subtask-name"
                value={values.name}
                disabled={isSubmitting}
                placeholder="Coordinar transporte"
                aria-invalid={Boolean(
                  errors.name,
                )}
                onChange={(event) =>
                  updateField(
                    'name',
                    event.target.value,
                  )
                }
                className="h-11 rounded-[9px]"
              />

              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name}
                </p>
              )}
            </div>
          </section>

          <section className="mt-4">
            <h3 className="text-[13px] font-semibold text-[#17212b]">
              ¿Cuándo y cuánto tiempo
              necesitarás?
            </h3>

            <div className="mt-4 grid gap-5 sm:grid-cols-2 sm:gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="subtask-date"
                  className="text-[13px] font-medium text-[#17212b]"
                >
                  Fecha límite *
                </label>

                <Input
                  id="subtask-date"
                  type="date"
                  min={minimumTargetDate}
                  value={values.targetDate}
                  max={eventDateOnly}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    errors.targetDate,
                  )}
                  onChange={(event) =>
                    updateField(
                      'targetDate',
                      event.target.value,
                    )
                  }
                  className="h-11 rounded-[9px]"
                />

                <p className="text-[12px] leading-[15px] text-[#667085]">
                  Debe completarse antes del{' '}
                  {formatEventDate(eventDate)}.
                </p>

                {errors.targetDate && (
                  <p className="text-xs text-destructive">
                    {errors.targetDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="subtask-hours"
                  className="text-[13px] font-medium text-[#17212b]"
                >
                  Tiempo estimado *
                </label>

                <Input
                  id="subtask-hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={
                    values.estimatedHours
                  }
                  placeholder="1.5"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    errors.estimatedHours,
                  )}
                  onChange={(event) =>
                    updateField(
                      'estimatedHours',
                      event.target.value,
                    )
                  }
                  className="h-11 rounded-[9px]"
                />

                <p className="text-[12px] text-[#667085]">
                  Se usa para calcular tu
                  carga diaria.
                </p>

                {errors.estimatedHours && (
                  <p className="text-xs text-destructive">
                    {
                      errors.estimatedHours
                    }
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="mt-4">
            <h3 className="text-[13px] font-semibold text-[#17212b]">
              ¿Quieres añadir algún detalle?
            </h3>

            <div className="mt-4 space-y-2">
              <label
                htmlFor="subtask-details"
                className="text-[13px] font-medium text-[#17212b]"
              >
                Nota (opcional)
              </label>

              <Textarea
                id="subtask-details"
                value={values.details}
                disabled={isSubmitting}
                placeholder="Confirmar disponibilidad de transporte para invitados."
                onChange={(event) =>
                  updateField(
                    'details',
                    event.target.value,
                  )
                }
                className="min-h-[92px] resize-none rounded-[9px]"
              />
            </div>
          </section>

          <p className="mt-3 text-[12px] text-[#667085]">
            * Campos obligatorios
          </p>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() =>
                handleOpenChange(false)
              }
              className="h-11 rounded-[10px] sm:w-[140px]"
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
                : 'Agregar tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
