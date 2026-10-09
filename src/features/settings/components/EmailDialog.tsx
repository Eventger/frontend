import { useState, type FormEvent } from 'react'
import { useReverification } from '@clerk/react'
import type { EmailAddressResource, UserResource } from '@clerk/react/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { isValidEmail } from '@/features/auth/utils/isValidEmail'
import { AccountDialog } from './AccountDialog'
import { getAccountError } from '../utils/accountErrors'
import { settingsInput, settingsPrimaryButton, settingsSecondaryButton } from '../settings.styles'

type EmailDialogProps = { user: UserResource; onClose: () => void; onSaved: () => void }

export function EmailDialog({ user, onClose, onSaved }: EmailDialogProps) {
  const [email, setEmail] = useState('')
  const [pendingEmail, setPendingEmail] = useState<EmailAddressResource | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [sent, setSent] = useState(false)
  const createEmail = useReverification((address: string) => user.createEmailAddress({ email: address }))
  const makePrimary = useReverification((id: string) => user.update({ primaryEmailAddressId: id }))
  const prepareEmail = useReverification((address: EmailAddressResource) => address.prepareVerification({ strategy: 'email_code' }))

  async function changePrimary(address: EmailAddressResource) {
    if (busy || address.verification.status !== 'verified' || address.id === user.primaryEmailAddressId) return
    setBusy(true)
    setError('')
    try {
      await makePrimary(address.id)
      onSaved()
      onClose()
    } catch (cause) {
      setError(getAccountError(cause, 'No pudimos actualizar tu correo principal. Inténtalo de nuevo.'))
    } finally {
      setBusy(false)
    }
  }

  async function sendCode(address: EmailAddressResource) {
    setPendingEmail(address)
    setCode('')
    setFieldError('')
    await prepareEmail(address)
    setSent(true)
  }

  async function startVerification(address: EmailAddressResource) {
    if (busy) return
    setBusy(true)
    setError('')
    setSent(false)
    try {
      await sendCode(address)
    } catch (cause) {
      setError(getAccountError(cause, 'No pudimos enviar el código. Inténtalo de nuevo.'))
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError('')
    setFieldError('')
    if (pendingEmail ? !/^\d{6}$/.test(code.trim()) : !isValidEmail(email.trim())) {
      setFieldError(pendingEmail ? 'Ingresa el código de 6 dígitos.' : email.trim() ? 'Ingresa una dirección de correo válida.' : 'Ingresa tu correo electrónico.')
      event.currentTarget.querySelector<HTMLInputElement>('input')?.focus()
      return
    }
    setBusy(true)
    try {
      if (pendingEmail) {
        const verified = await pendingEmail.attemptVerification({ code: code.trim() })
        if (verified.verification.status !== 'verified') {
          setFieldError('El código no es válido o ya expiró.')
          return
        }
        // A verified email can be made primary later if session reverification is cancelled.
        setPendingEmail(null)
        setSent(false)
        await makePrimary(verified.id)
        onSaved()
        onClose()
      } else {
        const existing = user.emailAddresses.find((address) => address.emailAddress.toLowerCase() === email.trim().toLowerCase())
        if (existing?.id === user.primaryEmailAddressId) {
          setFieldError('Este ya es tu correo principal.')
          return
        }
        if (existing?.verification.status === 'verified') {
          await makePrimary(existing.id)
          onSaved()
          onClose()
        } else {
          const address = existing ?? await createEmail(email.trim())
          await sendCode(address)
        }
      }
    } catch (cause) {
      setError(getAccountError(cause, pendingEmail ? 'No pudimos verificar el correo. Inténtalo de nuevo.' : 'No pudimos actualizar tu correo. Inténtalo de nuevo.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AccountDialog title="Administrar correo" description="Verifica un correo antes de usarlo como principal para iniciar sesión y recibir avisos." busy={busy} onClose={onClose}>
      <ul className="space-y-3">
        {user.emailAddresses.map((address) => (
          <li key={address.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-subtle p-3">
            <span className="min-w-0 break-all text-sm">{address.emailAddress}</span>
            {address.id === user.primaryEmailAddressId
              ? <span className="rounded-lg bg-[#eef2ff] px-2 py-1 text-xs text-[#4f46e5]">Principal</span>
              : <Button type="button" className={settingsSecondaryButton} disabled={busy} onClick={() => address.verification.status === 'verified' ? void changePrimary(address) : void startVerification(address)}>{address.verification.status === 'verified' ? 'Usar como principal' : 'Verificar'}</Button>}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} noValidate className="space-y-4 border-t border-border-subtle pt-4">
        <div className="space-y-2">
          <label htmlFor="account-email-input" className="text-sm font-medium">{pendingEmail ? 'Código de verificación' : 'Nuevo correo electrónico'}</label>
          {pendingEmail && <p className="break-all text-xs text-[#667085]">{sent ? 'Enviamos un código a' : 'Verifica'} {pendingEmail.emailAddress}.</p>}
          <Input id="account-email-input" type={pendingEmail ? 'text' : 'email'} autoComplete={pendingEmail ? 'one-time-code' : 'email'} inputMode={pendingEmail ? 'numeric' : 'email'} maxLength={pendingEmail ? 6 : 254} value={pendingEmail ? code : email} onChange={(event) => { if (pendingEmail) setCode(event.target.value); else setEmail(event.target.value); setFieldError('') }} disabled={busy} className={settingsInput} aria-invalid={Boolean(fieldError)} aria-describedby={fieldError ? 'account-email-error' : undefined} />
          {fieldError && <FieldError id="account-email-error">{fieldError}</FieldError>}
        </div>
        {error && <InlineFeedback>{error}</InlineFeedback>}
        {pendingEmail && <Button type="button" className={settingsSecondaryButton} disabled={busy} onClick={() => void startVerification(pendingEmail)}>Reenviar código</Button>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" className={settingsSecondaryButton} disabled={busy} onClick={onClose}>Cancelar</Button>
          <Button type="submit" className={settingsPrimaryButton} disabled={busy}>{busy ? 'Guardando…' : pendingEmail ? 'Verificar y guardar' : 'Continuar'}</Button>
        </div>
      </form>
    </AccountDialog>
  )
}
