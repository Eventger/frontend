import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { CircleCheck, Minus, OctagonX, Plus, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SettingsCard } from './SettingsCard'
import { DailyLimitConflictError, isValidDailyLimit } from '../utils/preferences'
import { usePlanningPreferences } from '../hooks/usePlanningPreferences'
import { settingsPrimaryButton } from '../settings.styles'

export function PreferencesForm() {
  const navigate = useNavigate()
  const preferences = usePlanningPreferences()
  const [draft, setDraft] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [conflictInfo, setConflictInfo] = useState<{ date: string; hours: number; message: string } | null>(null)
  const [toastFeedback, setToastFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const value = draft ?? String(preferences.dailyLimitHours)

  useEffect(() => {
    if (fieldError && !busy) inputRef.current?.focus()
  }, [fieldError, busy])

  useEffect(() => {
    if (!toastFeedback) return
    const timer = setTimeout(() => setToastFeedback(null), 4000)
    return () => clearTimeout(timer)
  }, [toastFeedback])

  function handleDecrement() {
    if (busy || preferences.isLoading || Boolean(preferences.error)) return
    const num = Number(value)
    const current = Number.isFinite(num) && value.trim() ? num : preferences.dailyLimitHours
    const next = Math.max(1, Math.min(16, Math.round((current - 1) * 100) / 100))
    setDraft(String(next))
    setFieldError('')
    setConflictInfo(null)
    setToastFeedback(null)
  }

  function handleIncrement() {
    if (busy || preferences.isLoading || Boolean(preferences.error)) return
    const num = Number(value)
    const current = Number.isFinite(num) && value.trim() ? num : preferences.dailyLimitHours
    const next = Math.min(16, Math.max(1, Math.round((current + 1) * 100) / 100))
    setDraft(String(next))
    setFieldError('')
    setConflictInfo(null)
    setToastFeedback(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setToastFeedback(null)
    if (!value.trim() || !isValidDailyLimit(Number(value))) {
      const msg = 'Ingresa entre 1 y 16 horas al día, con un máximo de dos decimales.'
      setFieldError(msg)
      setToastFeedback({ type: 'error', message: msg })
      inputRef.current?.focus()
      return
    }
    setFieldError('')
    setConflictInfo(null)
    setBusy(true)
    try {
      await preferences.save(Number(value))
      setDraft(null)
      setToastFeedback({ type: 'success', message: 'Tus preferencias se guardaron correctamente.' })
    } catch (cause) {
      if (cause instanceof DailyLimitConflictError) {
        setFieldError(cause.message)
        setConflictInfo({
          date: cause.conflictDate,
          hours: cause.conflictHours,
          message: cause.message,
        })
      } else {
        setToastFeedback({ type: 'error', message: 'No pudimos guardar tus preferencias. Inténtalo de nuevo.' })
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SettingsCard title="Preferencias de Eventger" description="Ajustes de planificación que se aplican a todos tus eventos.">
        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label htmlFor="daily-limit" className="type-label block text-[#17212b]">
                Límite diario de trabajo
              </label>
              <div className="mt-2 flex w-full max-w-[260px] items-center justify-between rounded-2xl border border-[#dde2ea] bg-white p-2">
                <button
                  type="button"
                  aria-label="Disminuir horas"
                  disabled={busy || preferences.isLoading || Boolean(preferences.error) || (Number(value) <= 1 && value.trim() !== '')}
                  onClick={handleDecrement}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f2f4f7] text-[#475467] transition-all active:scale-95 hover:bg-[#e4e7ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="size-4 stroke-[3]" aria-hidden="true" />
                </button>

                <div
                  className="flex flex-1 cursor-text flex-col items-center justify-center px-1"
                >
                  <input
                    ref={inputRef}
                    id="daily-limit"
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={16}
                    step={0.01}
                    value={value}
                    disabled={busy || preferences.isLoading || Boolean(preferences.error)}
                    onChange={(event) => {
                      setDraft(event.target.value)
                      setFieldError('')
                      setConflictInfo(null)
                      setToastFeedback(null)
                    }}
                    className="w-full text-center text-[26px] font-bold leading-none text-[#17212b] bg-transparent p-0 border-0 outline-none focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby="daily-limit-hint"
                  />
                  <span className="mt-1 text-[12px] font-normal leading-none text-[#667085]">
                    horas / día
                  </span>
                </div>

                <button
                  type="button"
                  aria-label="Aumentar horas"
                  disabled={busy || preferences.isLoading || Boolean(preferences.error) || (Number(value) >= 16 && value.trim() !== '')}
                  onClick={handleIncrement}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-white transition-all active:scale-95 hover:bg-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="size-4 stroke-[3]" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="shrink-0">
              <Button
                type="submit"
                disabled={busy || preferences.isLoading || Boolean(preferences.error)}
                className={`${settingsPrimaryButton} w-full sm:w-auto sm:min-w-[177px]`}
              >
                {busy ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </div>

          <p id="daily-limit-hint" className="mt-3 text-xs leading-[18px] text-[#667085]">
            De 1 a 16 horas al día. Se usa para calcular tu capacidad en Hoy y detectar sobrecargas al reprogramar tareas.
          </p>
        </form>
      </SettingsCard>

      <Dialog
        open={Boolean(conflictInfo)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setConflictInfo(null)
          }
        }}
      >
        <DialogContent
          onOpenAutoFocus={(event) => event.preventDefault()}
          aria-describedby="conflict-dialog-description"
          className="rounded-2xl border border-[#dde2ea] bg-white p-6 shadow-xl sm:max-w-[460px]"
        >
          <div role="alert">
            <DialogHeader className="gap-1 pr-8">
              <div className="flex items-center gap-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fef0c7] text-[#b54708]">
                  <TriangleAlert className="size-5 stroke-[2.5]" aria-hidden="true" />
                </span>
                <DialogTitle className="type-dialog-title text-[#17212b]">
                  Conflicto de límite diario
                </DialogTitle>
              </div>
              <DialogDescription id="conflict-dialog-description" className="mt-2 text-sm text-[#475467]">
                {conflictInfo?.message}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-3 rounded-xl border border-[#fedf89] bg-[#fffcf5] p-3 text-xs text-[#92400e]">
              Revisa o reprograma las tareas asignadas para ese día en tu agenda antes de reducir tu límite diario.
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConflictInfo(null)}
              className="h-10 border-[#d5dbea] text-[#344054] hover:bg-[#f9fafb]"
            >
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={() => {
                setConflictInfo(null)
                navigate('/hoy')
              }}
              className="h-10 bg-[#4f46e5] font-semibold text-white hover:bg-[#4338ca]"
            >
              Ver tareas en Hoy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {typeof document !== 'undefined' && toastFeedback && createPortal(
        <div
          role={toastFeedback.type === 'error' ? 'alert' : 'status'}
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border bg-white px-4 py-3 shadow-[0_10px_28px_rgba(23,33,43,0.12)] text-[13px] font-medium transition-all ${
            toastFeedback.type === 'success'
              ? 'border-[#abefc6] text-[#027a48]'
              : 'border-[#fecdca] text-[#b42318]'
          }`}
        >
          {toastFeedback.type === 'success' ? (
            <CircleCheck className="size-4 shrink-0 text-[#027a48]" />
          ) : (
            <OctagonX className="size-4 shrink-0 text-[#b42318]" />
          )}
          <span>{toastFeedback.message}</span>
        </div>,
        document.body
      )}
    </>
  )
}
