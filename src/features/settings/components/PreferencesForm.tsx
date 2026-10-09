import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { SettingsCard } from './SettingsCard'
import { DailyLimitConflictError, isValidDailyLimit } from '../utils/preferences'
import { usePlanningPreferences } from '../hooks/usePlanningPreferences'
import { settingsInput, settingsPrimaryButton } from '../settings.styles'

export function PreferencesForm() {
  const preferences = usePlanningPreferences()
  const [draft, setDraft] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const value = draft ?? String(preferences.dailyLimitHours)

  useEffect(() => {
    if (fieldError && !busy) inputRef.current?.focus()
  }, [fieldError, busy])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setSaved(false)
    setError('')
    if (!value.trim() || !isValidDailyLimit(Number(value))) {
      setFieldError('Ingresa entre 1 y 16 horas al día, con un máximo de dos decimales.')
      inputRef.current?.focus()
      return
    }
    setFieldError('')
    setBusy(true)
    try {
      await preferences.save(Number(value))
      setDraft(null)
      setSaved(true)
    } catch (cause) {
      if (cause instanceof DailyLimitConflictError) {
        setFieldError(cause.message)
      } else {
        setError('No pudimos guardar tus preferencias. Inténtalo de nuevo.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <SettingsCard title="Preferencias de Eventger" description="Ajustes de planificación que se aplican a todos tus eventos.">
      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <label htmlFor="daily-limit" className="text-[13px] font-medium text-[#17212b]">Límite diario de trabajo</label>
        <div className="relative mt-2 max-w-[325px]">
          <Input ref={inputRef} id="daily-limit" type="number" inputMode="decimal" min={1} max={16} step={0.01} value={value} disabled={busy || preferences.isLoading || Boolean(preferences.error)} onChange={(event) => { setDraft(event.target.value); setSaved(false); setFieldError(''); setError('') }} className={`${settingsInput} pr-28`} aria-invalid={Boolean(fieldError)} aria-describedby={`daily-limit-hint${fieldError ? ' daily-limit-error' : ''}`} />
          <span aria-hidden="true" className="pointer-events-none absolute right-4 top-3 text-sm text-[#667085]">horas / día</span>
        </div>
        {fieldError && <FieldError id="daily-limit-error" className="mt-2">{fieldError}</FieldError>}
        <p id="daily-limit-hint" className="mt-4 text-xs leading-[18px] text-[#667085]">De 1 a 16 horas al día. Se usa para calcular tu capacidad en Hoy y detectar sobrecargas al reprogramar tareas.</p>
        {preferences.isLoading && <p role="status" className="mt-4 text-sm text-[#667085]">Cargando tu límite diario…</p>}
        {preferences.error && <InlineFeedback className="mt-4">{preferences.error} <Button type="button" variant="link" onClick={() => { void preferences.refresh() }}>Reintentar</Button></InlineFeedback>}
        {error && <InlineFeedback className="mt-4">{error}</InlineFeedback>}
        {saved && <InlineFeedback variant="success" className="mt-4">Tus preferencias se guardaron correctamente.</InlineFeedback>}
        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={busy || preferences.isLoading || Boolean(preferences.error)} className={`${settingsPrimaryButton} w-full sm:w-auto sm:min-w-[177px]`}>{busy ? 'Guardando…' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </SettingsCard>
  )
}
