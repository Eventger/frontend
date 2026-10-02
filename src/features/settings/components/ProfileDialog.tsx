import { useState, type FormEvent } from 'react'
import type { UserResource } from '@clerk/react/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { AccountDialog } from './AccountDialog'
import { settingsInput, settingsPrimaryButton, settingsSecondaryButton } from '../settings.styles'

type ProfileDialogProps = { user: UserResource; onClose: () => void; onSaved: () => void }

export function ProfileDialog({ user, onClose, onSaved }: ProfileDialogProps) {
  const [firstName, setFirstName] = useState(user.firstName ?? '')
  const [lastName, setLastName] = useState(user.lastName ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError('')
    setInvalid(!firstName.trim() || !lastName.trim())
    if (!firstName.trim() || !lastName.trim()) {
      event.currentTarget.querySelector<HTMLInputElement>(!firstName.trim() ? '#profile-first-name' : '#profile-last-name')?.focus()
      return
    }
    setBusy(true)
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() })
      onSaved()
      onClose()
    } catch {
      setError('No pudimos actualizar tu perfil. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AccountDialog title="Actualizar perfil" description="Tu nombre se actualizará en tu cuenta de Clerk y en Eventger." busy={busy} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="profile-first-name" className="text-sm font-medium">Nombre</label>
          <Input id="profile-first-name" autoComplete="given-name" maxLength={100} value={firstName} onChange={(event) => setFirstName(event.target.value)} disabled={busy} className={settingsInput} aria-invalid={invalid && !firstName.trim()} aria-describedby={invalid && !firstName.trim() ? 'profile-first-name-error' : undefined} />
          {invalid && !firstName.trim() && <FieldError id="profile-first-name-error">Ingresa tu nombre.</FieldError>}
        </div>
        <div className="space-y-2">
          <label htmlFor="profile-last-name" className="text-sm font-medium">Apellido</label>
          <Input id="profile-last-name" autoComplete="family-name" maxLength={100} value={lastName} onChange={(event) => setLastName(event.target.value)} disabled={busy} className={settingsInput} aria-invalid={invalid && !lastName.trim()} aria-describedby={invalid && !lastName.trim() ? 'profile-last-name-error' : undefined} />
          {invalid && !lastName.trim() && <FieldError id="profile-last-name-error">Ingresa tu apellido.</FieldError>}
        </div>
        {error && <InlineFeedback>{error}</InlineFeedback>}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" className={settingsSecondaryButton} disabled={busy} onClick={onClose}>Cancelar</Button>
          <Button type="submit" className={settingsPrimaryButton} disabled={busy}>{busy ? 'Guardando…' : 'Guardar perfil'}</Button>
        </div>
      </form>
    </AccountDialog>
  )
}
