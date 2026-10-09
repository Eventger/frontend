import { useState, type FormEvent } from 'react'
import { useClerk, useReverification } from '@clerk/react'
import type { UserResource } from '@clerk/react/types'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { AccountDialog } from './AccountDialog'
import { getAccountError } from '../utils/accountErrors'
import { settingsInput, settingsSecondaryButton } from '../settings.styles'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'
import { clearCreateEventDraft } from '@/features/events/utils/createEventDraft'
import { deleteOwnAccount } from '../services/deleteAccount.service'

export function DeleteAccountDialog({ user, onClose }: { user: UserResource; onClose: () => void }) {
  const navigate = useNavigate()
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [deleted, setDeleted] = useState(false)
  const { signOut } = useClerk()
  const { authenticatedRequest } = useAuthenticatedApi({ freshToken: true })
  const deleteAccount = useReverification(() => deleteOwnAccount(confirmation, authenticatedRequest))

  async function closeSession() {
    await signOut()
    navigate('/', { replace: true })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (confirmation !== 'ELIMINAR' || !user.deleteSelfEnabled || busy) return
    setBusy(true)
    setError('')
    try {
      if (!deleted) {
        const result = await deleteAccount()
        if (!result || !('deleted' in result) || !result.deleted) throw new Error('La eliminación no se pudo confirmar.')
        setDeleted(true)
        clearCreateEventDraft(user.id)
      }
    } catch (cause) {
      setError(getAccountError(cause, 'No pudimos eliminar tu cuenta. Inténtalo de nuevo.'))
      setBusy(false)
      return
    }
    try {
      await closeSession()
    } catch {
      setError('Tu cuenta se eliminó. No pudimos cerrar la sesión en este dispositivo. Inténtalo de nuevo.')
      setBusy(false)
    }
  }

  return (
    <AccountDialog title="¿Eliminar tu cuenta?" description="Tu cuenta, eventos y tareas se eliminarán de forma permanente. Esta acción no se puede deshacer." busy={busy || deleted} onClose={onClose}>
      <InlineFeedback variant="warning">Se eliminarán tu perfil y acceso en Clerk, además de tus eventos, tareas y preferencias de Eventger.</InlineFeedback>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="delete-account-confirmation" className="text-sm font-medium">Escribe ELIMINAR para confirmar</label>
          <Input id="delete-account-confirmation" value={confirmation} autoComplete="off" spellCheck={false} onChange={(event) => setConfirmation(event.target.value)} disabled={busy || deleted} className={settingsInput} />
        </div>
        {error && <InlineFeedback>{error}</InlineFeedback>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {!deleted && <Button type="button" className={settingsSecondaryButton} disabled={busy} onClick={onClose}>Conservar mi cuenta</Button>}
          <Button type="submit" disabled={confirmation !== 'ELIMINAR' || !user.deleteSelfEnabled || busy} className="min-h-11 h-auto whitespace-normal rounded-lg bg-[#b42318] px-4 py-3 font-semibold text-white hover:bg-[#912018] focus-visible:ring-[#b42318]">{busy ? (deleted ? 'Cerrando sesión…' : 'Eliminando…') : (deleted ? 'Cerrar sesión' : 'Eliminar definitivamente')}</Button>
        </div>
      </form>
    </AccountDialog>
  )
}
