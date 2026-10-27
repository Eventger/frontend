import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Minus, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { DailyLimitConflictError, isValidDailyLimit } from '@/features/settings/utils/preferences'

type DailyLimitDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentHours?: number
  onSave: (hours: number) => Promise<void>
  onNavigateToHoy?: () => void
}

export function DailyLimitDialog({
  open,
  onOpenChange,
  currentHours = 6,
  onSave,
  onNavigateToHoy,
}: DailyLimitDialogProps) {
  const [value, setValue] = useState(String(currentHours))
  const [busy, setBusy] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [conflictInfo, setConflictInfo] = useState<{ date: string; hours: number; message: string } | null>(null)
  const [generalError, setGeneralError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (open) {
      setValue(String(currentHours))
      setFieldError('')
      setConflictInfo(null)
      setGeneralError('')
      setBusy(false)
    }
  }, [open, currentHours])

  function handleDecrement() {
    if (busy) return
    const num = Number(value)
    const current = Number.isFinite(num) && value.trim() ? num : currentHours
    const next = Math.max(1, Math.min(16, Math.round((current - 1) * 100) / 100))
    setValue(String(next))
    setFieldError('')
    setConflictInfo(null)
    setGeneralError('')
  }

  function handleIncrement() {
    if (busy) return
    const num = Number(value)
    const current = Number.isFinite(num) && value.trim() ? num : currentHours
    const next = Math.min(16, Math.max(1, Math.round((current + 1) * 100) / 100))
    setValue(String(next))
    setFieldError('')
    setConflictInfo(null)
    setGeneralError('')
  }

  function handleResolveConflict() {
    onOpenChange(false)
    if (onNavigateToHoy) {
      onNavigateToHoy()
    } else {
      const tasksSection = document.getElementById('prioritized-tasks')
      if (tasksSection) {
        tasksSection.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.assign('/hoy')
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    setFieldError('')
    setConflictInfo(null)
    setGeneralError('')

    const numericValue = Number(value)
    if (!value.trim() || !isValidDailyLimit(numericValue)) {
      setFieldError('Ingresa entre 1 y 16 horas al día, con un máximo de dos decimales.')
      inputRef.current?.focus()
      return
    }

    setBusy(true)
    try {
      await onSave(numericValue)
      onOpenChange(false)
    } catch (cause) {
      if (cause instanceof DailyLimitConflictError) {
        setFieldError(cause.message)
        setConflictInfo({
          date: cause.conflictDate,
          hours: cause.conflictHours,
          message: cause.message,
        })
      } else if (cause instanceof Error && cause.message) {
        setGeneralError(cause.message)
      } else {
        setGeneralError('No pudimos guardar tus horas disponibles. Inténtalo de nuevo.')
      }
      inputRef.current?.focus()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !busy && onOpenChange(isOpen)}>
      <DialogContent
        showCloseButton={!busy}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          inputRef.current?.focus()
        }}
        className="max-h-[calc(100svh-2rem)] overflow-y-auto overflow-x-hidden rounded-2xl border border-[#dde2ea] bg-white p-6 shadow-xl sm:max-w-[420px]"
      >
        <DialogHeader className="items-center gap-1 px-6 text-center">
          <DialogTitle className="type-dialog-title text-[#17212b]">
            Tus horas disponibles
          </DialogTitle>
          <DialogDescription className="type-body text-[#667085]">
            Para organizar las tareas de tus eventos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <label htmlFor="daily-hours-field" className="type-label block text-center text-[#17212b]">
            ¿Cuántas horas al día puedes dedicar a tus tareas?
          </label>

          <div className="mx-auto mt-4 flex w-full max-w-[260px] items-center justify-between rounded-2xl border border-[#dde2ea] bg-white p-2">
            <button
              type="button"
              aria-label="Disminuir horas"
              disabled={busy || (Number(value) <= 1 && value.trim() !== '')}
              onClick={handleDecrement}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f2f4f7] text-[#475467] transition-all active:scale-95 hover:bg-[#e4e7ec] focus-visible:outline-2 focus-visible:outline-[#4f46e5] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="size-4 stroke-[3]" aria-hidden="true" />
            </button>

            <label
              htmlFor="daily-hours-field"
              className="flex flex-1 cursor-text flex-col items-center justify-center px-1"
            >
              <input
                ref={inputRef}
                id="daily-hours-field"
                type="number"
                inputMode="decimal"
                min={1}
                max={16}
                step={0.01}
                value={value}
                disabled={busy}
                onChange={(e) => {
                  setValue(e.target.value)
                  setFieldError('')
                  setConflictInfo(null)
                  setGeneralError('')
                }}
                className="w-full text-center text-[26px] font-bold leading-none text-[#17212b] bg-transparent p-0 border-0 outline-none focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-invalid={Boolean(fieldError)}
                aria-describedby={`daily-hours-hint${fieldError ? ' daily-hours-error' : ''}`}
              />
              <span className="mt-1 text-[12px] font-normal leading-none text-[#667085]">
                horas / día
              </span>
            </label>

            <button
              type="button"
              aria-label="Aumentar horas"
              disabled={busy || (Number(value) >= 16 && value.trim() !== '')}
              onClick={handleIncrement}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5] transition-all active:scale-95 hover:bg-[#e0e7ff] focus-visible:outline-2 focus-visible:outline-[#4f46e5] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-4 stroke-[3]" aria-hidden="true" />
            </button>
          </div>

          <p id="daily-hours-hint" className="mt-2.5 text-center text-xs text-[#667085]">
            De 1 a 16 horas al día.
          </p>

          {fieldError && (
            <FieldError id="daily-hours-error" className="mt-2 text-center text-xs">
              {fieldError}
            </FieldError>
          )}

          {conflictInfo && (
            <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-[#fedf89] bg-[#fffcf5] p-3 text-center text-xs text-[#92400e]">
              <p className="font-medium">
                Revisa las tareas de ese día para reprogramarlas o reducir sus horas.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResolveConflict}
                className="h-8 border-[#f59e0b] bg-white font-medium text-[#b45309] hover:bg-[#fffbeb]"
              >
                Ver tareas en Hoy
              </Button>
            </div>
          )}

          {generalError && (
            <InlineFeedback variant="error" className="mt-3">
              {generalError}
            </InlineFeedback>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-lg border-[#d5dbea] px-4 text-[#344054] hover:bg-[#f9fafb]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="h-11 rounded-lg bg-[#4f46e5] px-5 font-semibold text-white hover:bg-[#4338ca]"
            >
              {busy ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
