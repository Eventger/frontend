import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { UserResource } from '@clerk/react/types'
import { Camera, Trash2, Undo2 } from 'lucide-react'
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U'

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Limpiamos el valor para permitir seleccionar el mismo archivo si se desea reintentar
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('El archivo seleccionado debe ser una imagen válida (PNG, JPG, WebP o GIF).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen seleccionada supera el límite máximo permitido de 10 MB.')
      return
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }

    setError('')
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setRemoveAvatar(false)
  }

  function handleRemoveAvatar() {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }
    setAvatarFile(null)
    setAvatarPreview(null)
    setRemoveAvatar(true)
    setError('')
  }

  function handleUndoRemove() {
    setRemoveAvatar(false)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError('')
    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    setInvalid(!trimmedFirst || !trimmedLast)

    if (!trimmedFirst || !trimmedLast) {
      event.currentTarget.querySelector<HTMLInputElement>(!trimmedFirst ? '#profile-first-name' : '#profile-last-name')?.focus()
      return
    }

    setBusy(true)
    try {
      // 1. Si se seleccionó una foto nueva, actualizarla en Clerk
      if (avatarFile) {
        await user.setProfileImage({ file: avatarFile })
      } else if (removeAvatar && user.hasImage) {
        // 2. Si se solicitó eliminar la foto existente, removerla en Clerk
        await user.setProfileImage({ file: null })
      }

      // 3. Actualizar nombre y apellido si cambiaron
      if (trimmedFirst !== (user.firstName ?? '') || trimmedLast !== (user.lastName ?? '')) {
        await user.update({ firstName: trimmedFirst, lastName: trimmedLast })
      }

      onSaved()
      onClose()
    } catch {
      setError('No pudimos actualizar tu perfil. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AccountDialog
      title="Actualizar perfil"
      description="Personaliza tu foto de perfil y tus datos personales en Eventger."
      busy={busy}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Sección de personalización de imagen de perfil / logo */}
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border-subtle bg-[#fafbfc] p-4 sm:flex-row">
          <div className="relative">
            <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#4f46e5] text-lg font-bold text-white shadow-sm ring-2 ring-[#e0e7ff]">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Vista previa de foto de perfil" className="size-full object-cover" />
              ) : user.hasImage && !removeAvatar ? (
                <img src={user.imageUrl} alt="Foto de perfil actual" className="size-full object-cover" />
              ) : (
                initials
              )}
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold text-[#17212b]">Foto o logo de perfil</p>
              <p className="text-[11px] text-[#667085]">
                {removeAvatar
                  ? 'La foto se eliminará al guardar los cambios.'
                  : avatarFile
                    ? 'Nueva foto lista para guardar.'
                    : 'JPG, PNG, WebP o GIF (máx. 10 MB).'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                disabled={busy}
                className="sr-only"
                id="profile-avatar-input"
                aria-label="Cargar nueva foto de perfil"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 gap-1.5 rounded-lg border-[#c7d2fe] bg-[#eef2ff] px-2.5 text-xs font-semibold text-[#3730a3] hover:bg-[#e0e7ff]"
              >
                <Camera className="size-3.5" aria-hidden="true" />
                <span>{user.hasImage || avatarPreview ? 'Cambiar foto' : 'Subir foto'}</span>
              </Button>

              {((user.hasImage && !removeAvatar) || avatarFile) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={handleRemoveAvatar}
                  className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[#b42318] hover:bg-[#fef3f2] hover:text-[#912018]"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  <span>Eliminar foto</span>
                </Button>
              )}

              {removeAvatar && user.hasImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={handleUndoRemove}
                  className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[#344054] hover:bg-[#f2f4f7]"
                >
                  <Undo2 className="size-3.5" aria-hidden="true" />
                  <span>Deshacer</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="profile-first-name" className="type-label">Nombre</label>
          <Input
            id="profile-first-name"
            autoComplete="given-name"
            maxLength={100}
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            disabled={busy}
            className={settingsInput}
            aria-invalid={invalid && !firstName.trim()}
            aria-describedby={invalid && !firstName.trim() ? 'profile-first-name-error' : undefined}
          />
          {invalid && !firstName.trim() && <FieldError id="profile-first-name-error">Ingresa tu nombre.</FieldError>}
        </div>

        <div className="space-y-2">
          <label htmlFor="profile-last-name" className="type-label">Apellido</label>
          <Input
            id="profile-last-name"
            autoComplete="family-name"
            maxLength={100}
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            disabled={busy}
            className={settingsInput}
            aria-invalid={invalid && !lastName.trim()}
            aria-describedby={invalid && !lastName.trim() ? 'profile-last-name-error' : undefined}
          />
          {invalid && !lastName.trim() && <FieldError id="profile-last-name-error">Ingresa tu apellido.</FieldError>}
        </div>

        {error && <InlineFeedback>{error}</InlineFeedback>}

        <div className="flex flex-col-reverse justify-center gap-3 pt-2 sm:flex-row">
          <Button type="button" className={settingsSecondaryButton} disabled={busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className={settingsPrimaryButton} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar perfil'}
          </Button>
        </div>
      </form>
    </AccountDialog>
  )
}
