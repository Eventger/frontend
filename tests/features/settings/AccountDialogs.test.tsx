import { ClerkAPIResponseError } from '@clerk/react/errors'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EmailDialog } from '@/features/settings/components/EmailDialog'
import { PasswordDialog } from '@/features/settings/components/PasswordDialog'
import { settingsUserFixture } from './settings.fixtures'

let fixture: ReturnType<typeof settingsUserFixture>
const onSaved = vi.fn()
const onClose = vi.fn()

beforeEach(() => { fixture = settingsUserFixture(); onSaved.mockClear(); onClose.mockClear() })

describe('EmailDialog', () => {
  function renderDialog() { render(<EmailDialog user={fixture.resource} onSaved={onSaved} onClose={onClose} />) }

  it('no cambia el correo principal hasta verificar el código', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.type(screen.getByLabelText('Nuevo correo electrónico'), 'nuevo@eventger.test')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(fixture.user.createEmailAddress).toHaveBeenCalledWith({ email: 'nuevo@eventger.test' })
    expect(fixture.added.email.prepareVerification).toHaveBeenCalledWith({ strategy: 'email_code' })
    expect(fixture.user.update).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText('Código de verificación'), '123456')
    await user.click(screen.getByRole('button', { name: 'Verificar y guardar' }))
    expect(fixture.added.email.attemptVerification).toHaveBeenCalledWith({ code: '123456' })
    expect(fixture.user.update).toHaveBeenCalledWith({ primaryEmailAddressId: 'email-added' })
    expect(onSaved).toHaveBeenCalledOnce()
  })

  it('conserva el correo anterior ante un código rechazado y permite reenviarlo', async () => {
    fixture.added.email.attemptVerification.mockRejectedValueOnce(new ClerkAPIResponseError('Invalid code', { status: 422, data: [{ code: 'form_code_incorrect', message: 'Invalid code' }] }))
    const user = userEvent.setup()
    renderDialog()
    await user.type(screen.getByLabelText('Nuevo correo electrónico'), 'nuevo@eventger.test')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.type(screen.getByLabelText('Código de verificación'), '000000')
    await user.click(screen.getByRole('button', { name: 'Verificar y guardar' }))
    expect(await screen.findByText('El código no es válido o ya expiró.')).toBeTruthy()
    expect(fixture.user.update).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Reenviar código' }))
    expect(fixture.added.email.prepareVerification).toHaveBeenCalledTimes(2)
    expect(onSaved).not.toHaveBeenCalled()
  })

  it('reanuda la verificación de un correo existente sin crearlo otra vez', async () => {
    fixture.user.emailAddresses.push(fixture.added.resource)
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: 'Verificar' }))
    expect(fixture.user.createEmailAddress).not.toHaveBeenCalled()
    expect(fixture.added.email.prepareVerification).toHaveBeenCalledOnce()
    expect(screen.getByLabelText('Código de verificación')).toBeTruthy()
  })

  it('valida correos y códigos antes de contactar Clerk', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.type(screen.getByLabelText('Nuevo correo electrónico'), 'invalid')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText('Ingresa una dirección de correo válida.')).toBeTruthy()
    expect(fixture.user.createEmailAddress).not.toHaveBeenCalled()
  })
})

describe('PasswordDialog', () => {
  function renderDialog() { render(<PasswordDialog user={fixture.resource} onSaved={onSaved} onClose={onClose} />) }

  it('establece una contraseña alternativa para una cuenta de Google', async () => {
    const user = userEvent.setup()
    renderDialog()
    expect(screen.queryByLabelText('Contraseña actual')).toBeNull()
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Mi nueva clave segura 2026')
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'Mi nueva clave segura 2026')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
    expect(fixture.user.updatePassword).toHaveBeenCalledWith({ newPassword: 'Mi nueva clave segura 2026', signOutOfOtherSessions: true })
    expect(onSaved).toHaveBeenCalledOnce()
  })

  it('exige la contraseña actual cuando ya existe y respeta la opción de sesiones', async () => {
    fixture.user.passwordEnabled = true
    const user = userEvent.setup()
    renderDialog()
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Mi nueva clave segura 2026')
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'Mi nueva clave segura 2026')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
    expect(screen.getByText('Ingresa tu contraseña.')).toBeTruthy()
    expect(fixture.user.updatePassword).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText('Contraseña actual'), 'Anterior clave segura')
    await user.click(screen.getByLabelText('Cerrar las demás sesiones al guardar'))
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
    expect(fixture.user.updatePassword).toHaveBeenCalledWith({ currentPassword: 'Anterior clave segura', newPassword: 'Mi nueva clave segura 2026', signOutOfOtherSessions: false })
  })

  it('aplica el mínimo de 15 caracteres y confirma la contraseña', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.type(screen.getByLabelText('Nueva contraseña'), 'corta')
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'distinta')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('Las contraseñas deben coincidir.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('Nueva contraseña'))
    expect(fixture.user.updatePassword).not.toHaveBeenCalled()
  })

  it('explica el rechazo de Clerk sin anunciar un cambio exitoso', async () => {
    fixture.user.updatePassword.mockRejectedValueOnce(new ClerkAPIResponseError('Password rejected', { status: 422, data: [{ code: 'form_password_pwned', message: 'Compromised' }] }))
    const user = userEvent.setup()
    renderDialog()
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Mi nueva clave segura 2026')
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'Mi nueva clave segura 2026')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
    expect(await screen.findByText('Esta contraseña aparece en una filtración de datos. Elige otra.')).toBeTruthy()
    expect(onSaved).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
