import {
  useState,
  type FormEvent,
} from 'react'

import {
  CalendarDays,
  FileText,
  ListTodo,
  Minus,
  Plus,
} from 'lucide-react'

import { focusFirstError } from '@/lib/formFocus'
import { formatCalendarDate, getCalendarDate } from '@/lib/calendar'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/DateInput'
import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { DestructiveConfirmationDialog } from '@/features/events/components/detail/DestructiveConfirmationDialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'
import { updateSubtask } from '@/features/events/services/subtasks.service'

import type {
  CreateSubtaskInput,
  Subtask,
  SubtaskState,
  UpdateSubtaskInput,
} from '@/features/events/types/subtask.types'

type EditSubtaskDialogProps = {
  subtask: Subtask
  eventDate: string
  isSubmitting?: boolean
  dailyLimitHours?: number
  onClose: () => void
  onSubmit?: (
    data: CreateSubtaskInput | UpdateSubtaskInput,
  ) => Promise<void> | void
  onSaved?: (
    task: Subtask,
  ) => Promise<void> | void
}
type FormValues = {
  name: string
  targetDate: string
  estimatedHours: string
  details: string
  state: SubtaskState
}

type FormErrors = Partial<
  Record<keyof FormValues, string>
>

function formatEventDate(date: string) {
  return formatCalendarDate(date, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function EditSubtaskDialog({
  subtask,
  eventDate,
  isSubmitting = false,
  dailyLimitHours = 6,
  onClose,
  onSubmit,
  onSaved,
}: EditSubtaskDialogProps) {
  const { authenticatedRequest } = useAuthenticatedApi()
  const [internalSubmitting, setInternalSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const busy = isSubmitting || internalSubmitting

  const [values, setValues] = useState<FormValues>({
    name: subtask.name,
    targetDate: getCalendarDate(subtask.targetDate),
    estimatedHours: String(subtask.estimatedHours),
    details: subtask.details,
    state: subtask.state,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isConfirmDiscardOpen, setIsConfirmDiscardOpen] = useState(false)

  const today = getCalendarDate(new Date())
  const eventDateOnly = getCalendarDate(eventDate)
  const originalTargetDate = getCalendarDate(subtask.targetDate)

  const updateField = <K extends keyof FormValues>(
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
      nextErrors.name = 'Ingresa el nombre de la tarea.'
    }

    if (values.state !== 'postponed') {
      if (!values.targetDate) {
        nextErrors.targetDate = 'Selecciona la fecha límite.'
      } else if (values.targetDate > eventDateOnly) {
        nextErrors.targetDate =
          'La fecha límite debe ser anterior a la fecha del evento.'
      } else if (
        values.targetDate < today &&
        values.targetDate !== originalTargetDate
      ) {
        nextErrors.targetDate =
          'No puedes programar una tarea para una fecha anterior a hoy.'
      }
    }

    const hours = Number(values.estimatedHours)

    if (
      !values.estimatedHours ||
      Number.isNaN(hours) ||
      hours < 0.01
    ) {
      nextErrors.estimatedHours = 'Ingresa un tiempo estimado válido.'
    } else if (hours > dailyLimitHours) {
      nextErrors.estimatedHours = `El tiempo estimado no puede superar tu límite diario de ${dailyLimitHours} h.`
    }

    setErrors(nextErrors)
    focusFirstError(nextErrors, {
      name: 'edit-subtask-name',
      targetDate: 'edit-subtask-date',
      estimatedHours: 'edit-subtask-hours',
      state: 'edit-subtask-state',
      details: 'edit-subtask-details',
    })

    return Object.keys(nextErrors).length === 0
  }

  const isDirty = (
    values.name !== subtask.name ||
    values.targetDate !== originalTargetDate ||
    values.estimatedHours !== String(subtask.estimatedHours) ||
    values.details !== subtask.details ||
    values.state !== subtask.state
  )

  const handleCloseRequest = () => {
    if (isDirty) {
      setIsConfirmDiscardOpen(true)
    } else {
      onClose()
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setSubmitError(null)

    const payload: UpdateSubtaskInput = {
      name: values.name.trim(),
      targetDate: values.targetDate,
      estimatedHours: Number(values.estimatedHours),
      details: values.details.trim(),
    }
    if (values.state !== subtask.state) {
      payload.state = values.state
    }

    if (onSubmit) {
      await onSubmit(payload)
      return
    }

    if (onSaved) {
      setInternalSubmitting(true)
      try {
        const updated = await updateSubtask(
          subtask.id,
          payload,
          authenticatedRequest,
        )
        await onSaved(updated)
      } catch {
        setSubmitError(
          'No pudimos guardar los cambios de la tarea. Inténtalo de nuevo.',
        )
      } finally {
        setInternalSubmitting(false)
      }
    }
  }

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open && !busy) {
            handleCloseRequest()
          }
        }}
      >
      <DialogContent
        className="max-h-[calc(100svh-2rem)] overflow-y-auto rounded-2xl border-border-subtle bg-white p-0 sm:max-w-[640px]"
      >
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-7"
          noValidate
        >
          <div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4f46e5]">
                <ListTodo className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="type-dialog-title text-[#17212b]">Editar tarea</DialogTitle>
                <DialogDescription className="type-body mt-1 text-[#667085]">
                  Modifica la información de esta tarea.
                </DialogDescription>
              </div>
            </div>

            {submitError && (
              <div className="mt-3">
                <InlineFeedback>{submitError}</InlineFeedback>
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="space-y-1 sm:col-span-2">
                <label
                  htmlFor="edit-subtask-name"
                  className="type-label text-[#17212b]"
                >
                  Nombre de la tarea *
                </label>

                <div className="relative">
                  <ListTodo className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-[#98a2b3]" aria-hidden="true" />
                  <Input
                    id="edit-subtask-name"
                    value={values.name}
                    disabled={busy}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? 'edit-subtask-name-error' : undefined
                    }
                    onChange={(event) =>
                      updateField('name', event.target.value)
                    }
                    className="min-h-[44px] rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b]"
                  />
                </div>

                {errors.name && (
                  <FieldError id="edit-subtask-name-error">
                    {errors.name}
                  </FieldError>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="edit-subtask-date"
                  className="type-label text-[#17212b]"
                >
                  Fecha límite{values.state !== 'postponed' ? ' *' : ''}
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-[#98a2b3]" aria-hidden="true" />
                  <DateInput
                    id="edit-subtask-date"
                    min={today}
                    max={eventDateOnly}
                    value={values.state === 'postponed' ? '' : values.targetDate}
                    disabled={busy || values.state === 'postponed'}
                    aria-invalid={values.state !== 'postponed' && Boolean(errors.targetDate)}
                    aria-describedby={
                      values.state === 'postponed'
                        ? 'edit-subtask-date-hint'
                        : errors.targetDate
                          ? 'edit-subtask-date-hint edit-subtask-date-error'
                          : 'edit-subtask-date-hint'
                    }
                    onValueChange={(value) =>
                      updateField('targetDate', value)
                    }
                    calendarLabel="Abrir calendario de la fecha límite"
                    className="min-h-[44px] rounded-lg border-border-subtle bg-white pl-10 text-[14px] text-[#17212b]"
                  />
                </div>

                <p
                  id="edit-subtask-date-hint"
                  className="type-caption text-[#667085]"
                >
                  {values.state === 'postponed'
                    ? 'Sin fecha definida mientras esté pospuesta.'
                    : `Debe completarse antes del ${formatEventDate(eventDate)}.`}
                </p>

                {values.state !== 'postponed' && errors.targetDate && (
                  <FieldError id="edit-subtask-date-error">
                    {errors.targetDate}
                  </FieldError>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="edit-subtask-hours"
                  className="type-label text-[#17212b]"
                >
                  Duración estimada (horas) *
                </label>

                <div className="flex items-center gap-2">
                  <div className={`flex h-11 items-center rounded-lg border bg-white px-1.5 shadow-xs transition-colors focus-within:border-[#4f46e5] focus-within:ring-1 focus-within:ring-[#4f46e5] ${errors.estimatedHours ? 'border-[#d92d20]' : 'border-border-subtle'}`}>
                    <button
                      type="button"
                      disabled={busy || Number(values.estimatedHours || 0) <= 0.5}
                      onClick={() => updateField('estimatedHours', String(Math.max(0.5, (Number(values.estimatedHours) || 1) - 0.5)))}
                      aria-label="Disminuir tiempo estimado"
                      className="flex size-7 items-center justify-center rounded-full text-[#4f46e5] transition-colors hover:bg-[#eef2ff] disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Minus className="size-3.5" aria-hidden="true" />
                    </button>
                    <Input
                      id="edit-subtask-hours"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={values.estimatedHours}
                      disabled={busy}
                      aria-label="Tiempo estimado *"
                      aria-invalid={Boolean(errors.estimatedHours)}
                      aria-describedby={
                        errors.estimatedHours
                          ? 'edit-subtask-hours-hint edit-subtask-hours-error'
                          : 'edit-subtask-hours-hint'
                      }
                      onChange={(event) =>
                        updateField('estimatedHours', event.target.value)
                      }
                      className="h-8 w-14 border-0 p-0 text-center font-medium text-[14px] text-[#17212b] shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => updateField('estimatedHours', String((Number(values.estimatedHours) || 0) + 0.5))}
                      aria-label="Aumentar tiempo estimado"
                      className="flex size-7 items-center justify-center rounded-full text-[#4f46e5] transition-colors hover:bg-[#eef2ff] disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <span className="select-none text-[13px] font-medium text-[#667085]">horas</span>
                </div>

                <p
                  id="edit-subtask-hours-hint"
                  className="type-caption text-[#667085]"
                >
                  Se usa para calcular tu carga diaria.
                </p>

                {errors.estimatedHours && (
                  <FieldError id="edit-subtask-hours-error">
                    {errors.estimatedHours}
                  </FieldError>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <label
                htmlFor="edit-subtask-state"
                className="type-label text-[#17212b]"
              >
                Estado de la tarea
              </label>

              <Select
                value={values.state}
                disabled={busy}
                onValueChange={(val) =>
                  updateField('state', val as SubtaskState)
                }
              >
                <SelectTrigger
                  id="edit-subtask-state"
                  className="h-11 w-full rounded-lg border-border-subtle bg-white sm:max-w-[260px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  {values.state === 'postponed' && (
                    <SelectItem value="postponed">Pospuesta</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-5 space-y-4">
              <div className="min-w-0 space-y-1">
                <label
                  htmlFor="edit-subtask-details"
                  className="type-label text-[#17212b]"
                >
                  Nota (opcional)
                </label>

                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3.5 top-3 z-10 size-4 text-[#98a2b3]" aria-hidden="true" />
                  <Textarea
                    id="edit-subtask-details"
                    value={values.details}
                    disabled={busy}
                    onChange={(event) =>
                      updateField('details', event.target.value)
                    }
                    className="h-[74px] min-h-[74px] resize-none rounded-lg border-border-subtle bg-white py-2.5 pl-10 text-[14px] leading-5 text-[#17212b]"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={handleCloseRequest}
                  className="h-11 rounded-lg border-border-subtle px-8"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={busy}
                  aria-label={busy ? 'Guardando…' : 'Guardar cambios'}
                  className="h-11 rounded-lg bg-[#4f46e5] px-8 text-white hover:bg-[#4338ca]"
                >
                  {busy ? 'Guardando…' : 'Guardar tarea'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <DestructiveConfirmationDialog
      open={isConfirmDiscardOpen}
      onOpenChange={setIsConfirmDiscardOpen}
      title="¿Descartar cambios?"
      description="Tienes cambios sin guardar en esta tarea. Si sales ahora, se perderán las modificaciones."
      confirmLabel="Descartar cambios"
      isDeleting={false}
      onConfirm={() => {
        setIsConfirmDiscardOpen(false)
        onClose()
      }}
    />
  </>
)
}
