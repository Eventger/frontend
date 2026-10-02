import { useState, type FormEvent } from 'react'
import { useReverification } from '@clerk/react'
import type { UserResource } from '@clerk/react/types'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { AccountDialog } from './AccountDialog'
import { getAccountError } from '../utils/accountErrors'
import { settingsInput, settingsSecondaryButton } from '../settings.styles'

export function DeleteAccountDialog({ user, onClose }: { user: UserResource; onClose: () => void }) {
  const navigate = useNavigate()
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const deleteAccount = useReverification(() => user.delete())

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (confirmation !== 'ELIMINAR' || !user.deleteSelfEnabled || busy) return
    setBusy(true)
    setError('')
    try {
      await deleteAccount()
      navigate('/', { replace: true })
    } catch (cause) {
      setError(getAccountError(cause, 'No pudimos eliminar tu cuenta. Inténtalo de nuevo.'))
      setBusy(false)
    }
  }

  return (
    <AccountDialog title="¿Eliminar tu cuenta?" description="Tu perfil y acceso en Clerk se eliminarán de forma permanente. Esta acción no se puede deshacer." busy={busy} onClose={onClose}>
      <InlineFeedback variant="warning">Los eventos y tareas de Eventger no se eliminan con esta acción. Perderás el acceso a ellos.</InlineFeedback>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="delete-account-confirmation" className="text-sm font-medium">Escribe ELIMINAR para confirmar</label>
          <Input id="delete-account-confirmation" value={confirmation} autoComplete="off" spellCheck={false} onChange={(event) => setConfirmation(event.target.value)} disabled={busy} className={settingsInput} />
        </div>
        {error && <InlineFeedback>{error}</InlineFeedback>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" className={settingsSecondaryButton} disabled={busy} onClick={onClose}>Conservar mi cuenta</Button>
          <Button type="submit" disabled={confirmation !== 'ELIMINAR' || !user.deleteSelfEnabled || busy} className="min-h-11 h-auto whitespace-normal rounded-[10px] bg-[#b42318] px-4 py-3 font-semibold text-white hover:bg-[#912018] focus-visible:ring-[#b42318]">{busy ? 'Eliminando…' : 'Eliminar definitivamente'}</Button>
        </div>
      </form>
    </AccountDialog>
  )
}
