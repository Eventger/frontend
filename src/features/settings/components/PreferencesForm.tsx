import { useState, type FormEvent } from 'react'
import type { UserResource } from '@clerk/react/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { SettingsCard } from './SettingsCard'
import { getDailyLimitHours, isValidDailyLimit } from '../utils/preferences'
import { settingsInput, settingsPrimaryButton } from '../settings.styles'

export function PreferencesForm({ user }: { user: UserResource }) {
  const [draft, setDraft] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const value = draft ?? String(getDailyLimitHours(user.unsafeMetadata))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setSaved(false)
    setError('')
    if (!value.trim() || !isValidDailyLimit(Number(value))) {
      setFieldError('Ingresa entre 0,5 y 24 horas, en intervalos de media hora.')
      event.currentTarget.querySelector<HTMLInputElement>('input')?.focus()
      return
    }
    setFieldError('')
    setBusy(true)
    try {
      await user.updateMetadata({ unsafeMetadata: { eventger: { dailyLimitHours: Number(value) } } })
      setDraft(null)
      setSaved(true)
    } catch {
      setError('No pudimos guardar tus preferencias. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SettingsCard title="Preferencias de Eventger" description="Ajustes de planificación que se aplican a todos tus eventos.">
      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <label htmlFor="daily-limit" className="text-[13px] font-medium text-[#17212b]">Límite diario de trabajo</label>
        <div className="relative mt-2 max-w-[325px]">
          <Input id="daily-limit" type="number" inputMode="decimal" min={0.5} max={24} step={0.5} value={value} disabled={busy} onChange={(event) => { setDraft(event.target.value); setSaved(false); setFieldError(''); setError('') }} className={`${settingsInput} pr-28`} aria-invalid={Boolean(fieldError)} aria-describedby={`daily-limit-hint${fieldError ? ' daily-limit-error' : ''}`} />
          <span aria-hidden="true" className="pointer-events-none absolute right-4 top-3 text-sm text-[#667085]">horas / día</span>
        </div>
        {fieldError && <FieldError id="daily-limit-error" className="mt-2">{fieldError}</FieldError>}
        <p id="daily-limit-hint" className="mt-4 text-xs leading-[18px] text-[#667085]">Se usa para calcular tu capacidad en Hoy y detectar sobrecargas en tus tareas del día.</p>
        {error && <InlineFeedback className="mt-4">{error}</InlineFeedback>}
        {saved && <InlineFeedback variant="success" className="mt-4">Tus preferencias se guardaron correctamente.</InlineFeedback>}
        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={busy} className={`${settingsPrimaryButton} w-full sm:w-auto sm:min-w-[177px]`}>{busy ? 'Guardando…' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </SettingsCard>
  )
}
