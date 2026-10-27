import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

import { focusFirstError } from '@/lib/formFocus'
import { formatCalendarDate, getCalendarDate } from '@/lib/calendar'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/DateInput'
import { FieldError } from '@/components/feedback/FieldError'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ListTodo } from 'lucide-react'
import { DestructiveConfirmationDialog } from '@/features/events/components/detail/DestructiveConfirmationDialog'

import type { CreateSubtaskInput } from '@/features/events/types/subtask.types'

type AddSubtaskDialogProps = {
  open: boolean
  eventName: string
  eventDate: string
  initialValues?: CreateSubtaskInput
  isSubmitting?: boolean
  dailyLimitHours?: number
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
  return formatCalendarDate(date, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function AddSubtaskDialog({
  open,
  eventName,
  eventDate,
  initialValues,
  isSubmitting = false,
  dailyLimitHours = 6,
  onOpenChange,
  onSubmit,
}: AddSubtaskDialogProps) {
  const [values, setValues] =
    useState<FormValues>(emptyValues)

  const [errors, setErrors] =
    useState<FormErrors>({})

  const [isConfirmDiscardOpen, setIsConfirmDiscardOpen] = useState(false)

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (!open) {
      return
    }

    if (initialValues) {
      setValues({
        name: initialValues.name,
        targetDate: initialValues.targetDate,
        estimatedHours: String(
          initialValues.estimatedHours,
        ),
        details: initialValues.details,
      })
    } else {
      setValues(emptyValues)
    }

    setErrors({})
  }, [open, initialValues])

  const eventDateOnly =
    getCalendarDate(eventDate)
  const minimumTargetDate =
    getCalendarDate(new Date())

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
      getCalendarDate(new Date())
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
      estimatedHours < 0.01
    ) {
      nextErrors.estimatedHours =
        'Ingresa un tiempo mayor que cero.'
    } else if (estimatedHours > dailyLimitHours) {
      nextErrors.estimatedHours =
        `El tiempo estimado no puede superar tu límite diario de ${dailyLimitHours} h.`
    }

    setErrors(nextErrors)
    focusFirstError(nextErrors, { name: 'subtask-name', targetDate: 'subtask-date', estimatedHours: 'subtask-hours', details: 'subtask-details' })

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

  const isDirty = Boolean(
    values.name.trim() ||
    values.targetDate.trim() ||
    values.estimatedHours.trim() ||
    values.details.trim()
  )

  const handleOpenChange = (
    nextOpen: boolean,
  ) => {
    if (isSubmitting) {
      return
    }

    if (!nextOpen) {
      if (isDirty) {
        setIsConfirmDiscardOpen(true)
        return
      }
      setValues(emptyValues)
      setErrors({})
    }

    onOpenChange(nextOpen)
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
      <DialogContent
        className="max-h-[calc(100svh-2rem)] overflow-y-auto rounded-2xl border-border-subtle bg-white p-0 sm:max-w-[640px]"
      >
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-7"
          noValidate
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4f46e5]">
              <ListTodo className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="type-dialog-title text-[#17212b]">
                Agregar tarea
              </DialogTitle>
              <DialogDescription className="type-body mt-1 text-[#667085]">
                Define qué necesitas hacer y cuándo debe quedar listo para {eventName}.
              </DialogDescription>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="subtask-name"
                className="type-label text-[#17212b]"
              >
                Nombre de la tarea *
              </label>

              <Input
                id="subtask-name"
                value={values.name}
                disabled={isSubmitting}
                placeholder="Coordinar transporte"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? 'add-subtask-name-error' : undefined
                }
                onChange={(event) =>
                  updateField('name', event.target.value)
                }
                className="h-11 rounded-lg"
              />

              {errors.name && (
                <FieldError id="add-subtask-name-error">
                  {errors.name}
                </FieldError>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="subtask-date"
                className="type-label text-[#17212b]"
              >
                Fecha límite *
              </label>

              <DateInput
                id="subtask-date"
                min={minimumTargetDate}
                value={values.targetDate}
                max={eventDateOnly}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.targetDate)}
                aria-describedby={
                  errors.targetDate
                    ? 'add-subtask-date-hint add-subtask-date-error'
                    : 'add-subtask-date-hint'
                }
                onValueChange={(value) =>
                  updateField('targetDate', value)
                }
                calendarLabel="Abrir calendario de la fecha límite"
                className="h-11 rounded-lg"
              />

              <p
                id="add-subtask-date-hint"
                className="type-caption text-[#667085]"
              >
                Debe completarse antes del {formatEventDate(eventDate)}.
              </p>

              {errors.targetDate && (
                <FieldError id="add-subtask-date-error">
                  {errors.targetDate}
                </FieldError>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="subtask-hours"
                className="type-label text-[#17212b]"
              >
                Duración estimada (horas) *
              </label>

              <Input
                id="subtask-hours"
                type="number"
                min="0.5"
                step="0.5"
                value={values.estimatedHours}
                placeholder="ej. 1,5"
                disabled={isSubmitting}
                aria-label="Tiempo estimado *"
                aria-invalid={Boolean(errors.estimatedHours)}
                aria-describedby={
                  errors.estimatedHours
                    ? 'add-subtask-hours-hint add-subtask-hours-error'
                    : 'add-subtask-hours-hint'
                }
                onChange={(event) =>
                  updateField('estimatedHours', event.target.value)
                }
                className="h-11 rounded-lg"
              />

              <p
                id="add-subtask-hours-hint"
                className="type-caption text-[#667085]"
              >
                Se usa para calcular tu carga diaria.
              </p>

              {errors.estimatedHours && (
                <FieldError id="add-subtask-hours-error">
                  {errors.estimatedHours}
                </FieldError>
              )}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="subtask-details"
                className="type-label text-[#17212b]"
              >
                Nota (opcional)
              </label>

              <Textarea
                id="subtask-details"
                value={values.details}
                disabled={isSubmitting}
                placeholder="Confirmar disponibilidad de transporte para invitados."
                onChange={(event) =>
                  updateField('details', event.target.value)
                }
                className="min-h-[92px] resize-none rounded-lg"
              />
            </div>
          </div>

          <p className="type-caption mt-3 text-[#667085]">
            * Campos obligatorios
          </p>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
              className="h-11 rounded-lg sm:w-[140px]"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] sm:w-[170px]"
            >
              {isSubmitting ? 'Guardando…' : 'Agregar tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <DestructiveConfirmationDialog
      open={isConfirmDiscardOpen}
      onOpenChange={setIsConfirmDiscardOpen}
      title="¿Descartar tarea?"
      description="Tienes datos ingresados en la tarea. Si sales ahora, se perderá la información escrita."
      confirmLabel="Descartar tarea"
      isDeleting={false}
      onConfirm={() => {
        setIsConfirmDiscardOpen(false)
        setValues(emptyValues)
        setErrors({})
        onOpenChange(false)
      }}
    />
  </>
)
}
