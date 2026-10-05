import { useState, type FormEvent } from 'react'
import { useReverification } from '@clerk/react'
import type { UserResource } from '@clerk/react/types'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_HINT } from '@/features/auth/auth.constants'
import { AccountDialog } from './AccountDialog'
import { getAccountError } from '../utils/accountErrors'
import { settingsInput, settingsPrimaryButton, settingsSecondaryButton } from '../settings.styles'

type PasswordDialogProps = { user: UserResource; onClose: () => void; onSaved: (otherSessionsClosed: boolean) => void }

export function PasswordDialog({ user, onClose, onSaved }: PasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [visible, setVisible] = useState(false)
  const [signOutOthers, setSignOutOthers] = useState(true)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const updatePassword = useReverification((params: Parameters<UserResource['updatePassword']>[0]) => user.updatePassword(params))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const nextErrors: Record<string, string> = {}
    if (user.passwordEnabled && !currentPassword) nextErrors.current = 'Ingresa tu contraseña.'
    if (!newPassword) nextErrors.new = 'Ingresa una contraseña.'
    else if (newPassword.length < PASSWORD_MIN_LENGTH) nextErrors.new = PASSWORD_MIN_LENGTH_HINT
    if (confirmation !== newPassword || !confirmation) nextErrors.confirmation = 'Las contraseñas deben coincidir.'
    setErrors(nextErrors)
    setError('')
    if (Object.keys(nextErrors).length) {
      const field = nextErrors.current ? 'current' : nextErrors.new ? 'new' : 'confirmation'
      event.currentTarget.querySelector<HTMLInputElement>(`#account-password-${field}`)?.focus()
      return
    }
    setBusy(true)
    try {
      await updatePassword({ newPassword, ...(user.passwordEnabled ? { currentPassword } : {}), signOutOfOtherSessions: signOutOthers })
      onSaved(signOutOthers)
      onClose()
    } catch (cause) {
      setError(getAccountError(cause, 'No pudimos guardar tu contraseña. Revisa los requisitos e inténtalo de nuevo.'))
    } finally {
      setBusy(false)
    }
  }

  const fields = [
    ...(user.passwordEnabled ? [{ key: 'current', label: 'Contraseña actual', value: currentPassword, setValue: setCurrentPassword, autoComplete: 'current-password' }] : []),
    { key: 'new', label: 'Nueva contraseña', value: newPassword, setValue: setNewPassword, autoComplete: 'new-password' },
    { key: 'confirmation', label: 'Confirmar nueva contraseña', value: confirmation, setValue: setConfirmation, autoComplete: 'new-password' },
  ]

  return (
    <AccountDialog title={user.passwordEnabled ? 'Cambiar contraseña' : 'Establecer contraseña'} description="Clerk protege tu contraseña y verifica los cambios sensibles de tu cuenta." busy={busy} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label htmlFor={`account-password-${field.key}`} className="text-sm font-medium">{field.label}</label>
            <Input id={`account-password-${field.key}`} type={visible ? 'text' : 'password'} autoComplete={field.autoComplete} value={field.value} onChange={(event) => field.setValue(event.target.value)} disabled={busy} className={`${settingsInput} app-password-input`} aria-invalid={Boolean(errors[field.key])} aria-describedby={`${field.key === 'new' ? 'account-password-hint ' : ''}${errors[field.key] ? `account-password-${field.key}-error` : ''}`.trim() || undefined} />
            {field.key === 'new' && <p id="account-password-hint" className="text-xs text-[#667085]">{PASSWORD_MIN_LENGTH_HINT}</p>}
            {errors[field.key] && <FieldError id={`account-password-${field.key}-error`}>{errors[field.key]}</FieldError>}
          </div>
        ))}
        <Button type="button" className={settingsSecondaryButton} disabled={busy} aria-pressed={visible} onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}{visible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
        </Button>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[13px]">
          <input type="checkbox" className="size-4 accent-[#4f46e5]" checked={signOutOthers} onChange={(event) => setSignOutOthers(event.target.checked)} disabled={busy} />Cerrar las demás sesiones al guardar
        </label>
        {error && <InlineFeedback>{error}</InlineFeedback>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" className={settingsSecondaryButton} disabled={busy} onClick={onClose}>Cancelar</Button>
          <Button type="submit" className={settingsPrimaryButton} disabled={busy}>{busy ? 'Guardando…' : 'Guardar contraseña'}</Button>
        </div>
      </form>
    </AccountDialog>
  )
}
