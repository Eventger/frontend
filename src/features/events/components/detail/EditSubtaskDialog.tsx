import {
  useState,
  type FormEvent,
} from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type {
  CreateSubtaskInput,
  Subtask,
} from '@/features/events/types/subtask.types'

type EditSubtaskDialogProps = {
  subtask: Subtask
  eventDate: string
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (
    data: CreateSubtaskInput,
  ) => Promise<void> | void
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

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat(
    'es-CO',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    },
  ).format(new Date(date))
}

export function EditSubtaskDialog({
  subtask,
  eventDate,
  isSubmitting = false,
  onClose,
  onSubmit,
}: EditSubtaskDialogProps) {
  const [values, setValues] =
    useState<FormValues>({
      name: subtask.name,
      targetDate:
        subtask.targetDate.slice(
          0,
          10,
        ),
      estimatedHours:
        String(
          subtask.estimatedHours,
        ),
      details: subtask.details,
    })

  const [errors, setErrors] =
    useState<FormErrors>({})

  const eventDateOnly =
    eventDate.slice(0, 10)

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
      values.targetDate >
      eventDateOnly
    ) {
      nextErrors.targetDate =
        'La fecha límite debe ser anterior a la fecha del evento.'
    }

    const hours = Number(
      values.estimatedHours,
    )

    if (
      !values.estimatedHours ||
      Number.isNaN(hours) ||
      hours <= 0
    ) {
      nextErrors.estimatedHours =
        'Ingresa un tiempo estimado válido.'
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
      name: values.name.trim(),
      targetDate:
        values.targetDate,
      estimatedHours: Number(
        values.estimatedHours,
      ),
      details:
        values.details.trim(),
    })
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (
          !open &&
          !isSubmitting
        ) {
          onClose()
        }
      }}
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
            Editar tarea
          </DialogTitle>

          <DialogDescription className="mt-2 text-[14px] leading-[22px] text-[#667085]">
            Modifica la información de{' '}
            {subtask.name}.
          </DialogDescription>

          <section className="mt-2">
            <h3 className="text-[13px] font-semibold text-[#17212b]">
              ¿Qué necesitas hacer?
            </h3>

            <div className="mt-4 space-y-2">
              <label
                htmlFor="edit-subtask-name"
                className="text-[13px] font-medium text-[#17212b]"
              >
                Nombre de la tarea *
              </label>

              <Input
                id="edit-subtask-name"
                value={values.name}
                disabled={
                  isSubmitting
                }
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
                <p className="text-xs text-[#b42318]">
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
                  htmlFor="edit-subtask-date"
                  className="text-[13px] font-medium text-[#17212b]"
                >
                  Fecha límite *
                </label>

                <Input
                  id="edit-subtask-date"
                  type="date"
                  max={eventDateOnly}
                  value={
                    values.targetDate
                  }
                  disabled={
                    isSubmitting
                  }
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
                  Debe completarse antes
                  del{' '}
                  {formatEventDate(
                    eventDate,
                  )}
                  .
                </p>

                {errors.targetDate && (
                  <p className="text-xs text-[#b42318]">
                    {
                      errors.targetDate
                    }
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-subtask-hours"
                  className="text-[13px] font-medium text-[#17212b]"
                >
                  Tiempo estimado *
                </label>

                <Input
                  id="edit-subtask-hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={
                    values.estimatedHours
                  }
                  disabled={
                    isSubmitting
                  }
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
                  <p className="text-xs text-[#b42318]">
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
              ¿Quieres añadir algún
              detalle?
            </h3>

            <div className="mt-4 space-y-2">
              <label
                htmlFor="edit-subtask-details"
                className="text-[13px] font-medium text-[#17212b]"
              >
                Nota (opcional)
              </label>

              <Textarea
                id="edit-subtask-details"
                value={values.details}
                disabled={
                  isSubmitting
                }
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
              disabled={
                isSubmitting
              }
              onClick={onClose}
              className="h-11 rounded-[10px] sm:w-[140px]"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting
              }
              className="h-11 rounded-[10px] bg-[#4f46e5] text-white hover:bg-[#4338ca] sm:w-[170px]"
            >
              {isSubmitting
                ? 'Guardando...'
                : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}