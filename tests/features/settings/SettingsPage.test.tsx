import { useUser } from '@clerk/react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { settingsUserFixture } from './settings.fixtures'
import { deferred } from '../../deferred'

let fixture: ReturnType<typeof settingsUserFixture>

function PageRoutes() {
  return <Routes><Route path="/" element={<SettingsPage />} /><Route path="/configuracion/seguridad" element={<h1>Destino de seguridad</h1>} /></Routes>
}

function renderPage() {
  return render(<MemoryRouter><PageRoutes /></MemoryRouter>)
}

describe('SettingsPage', () => {
  beforeEach(() => {
    fixture = settingsUserFixture()
    vi.mocked(useUser).mockReturnValue({ isLoaded: true, isSignedIn: true, user: fixture.resource })
  })

  it('muestra el perfil real, correo y Google y navega a seguridad', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.getByText('Juan Carlos Cruz')).toBeTruthy()
    expect(screen.getAllByText('juan@eventger.test')).toHaveLength(2)
    expect(screen.getByText('Google')).toBeTruthy()
    await user.click(screen.getByRole('link', { name: 'Administrar seguridad' }))
    expect(screen.getByRole('heading', { name: 'Destino de seguridad' })).toBeTruthy()
  })

  it('no inventa cuentas conectadas y espera a que cargue Clerk', () => {
    fixture.user.externalAccounts = []
    const { unmount } = renderPage()
    expect(screen.getByText('No tienes cuentas conectadas.')).toBeTruthy()
    unmount()
    vi.mocked(useUser).mockReturnValue({ isLoaded: false, isSignedIn: undefined, user: undefined })
    renderPage()
    expect(screen.getByRole('status', { name: 'Cargando configuración de cuenta' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull()
  })

  it('guarda una preferencia en la cuenta sin reemplazar otros metadatos', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.clear(screen.getByLabelText('Límite diario de trabajo'))
    await user.type(screen.getByLabelText('Límite diario de trabajo'), '7.5')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(fixture.user.updateMetadata).toHaveBeenCalledWith({ unsafeMetadata: { eventger: { dailyLimitHours: 7.5 } } })
    expect(fixture.user.unsafeMetadata.otherApp).toEqual({ theme: 'dark' })
    expect(fixture.user.unsafeMetadata.eventger.calendar).toBe('week')
    expect(await screen.findByText('Tus preferencias se guardaron correctamente.')).toBeTruthy()
    expect((screen.getByLabelText('Límite diario de trabajo') as HTMLInputElement).value).toBe('7.5')
  })

  it.each(['', '0', '25', '2.25'])('rechaza el límite inválido %s y enfoca el campo', async (value) => {
    const user = userEvent.setup()
    renderPage()
    const input = screen.getByLabelText('Límite diario de trabajo')
    await user.clear(input)
    if (value) await user.type(input, value)
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(fixture.user.updateMetadata).not.toHaveBeenCalled()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(input)
  })

  it('conserva el borrador tras un fallo y bloquea envíos simultáneos', async () => {
    const pending = deferred<never>()
    fixture.user.updateMetadata.mockReturnValueOnce(pending.promise)
    const user = userEvent.setup()
    renderPage()
    await user.clear(screen.getByLabelText('Límite diario de trabajo'))
    await user.type(screen.getByLabelText('Límite diario de trabajo'), '8')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect((screen.getByRole('button', { name: 'Guardando…' }) as HTMLButtonElement).disabled).toBe(true)
    pending.reject(new Error('network'))
    expect(await screen.findByText('No pudimos guardar tus preferencias. Inténtalo de nuevo.')).toBeTruthy()
    expect((screen.getByLabelText('Límite diario de trabajo') as HTMLInputElement).value).toBe('8')
    expect(screen.queryByText('Tus preferencias se guardaron correctamente.')).toBeNull()
  })

  it('reinicia el borrador al cambiar de usuario', async () => {
    const user = userEvent.setup()
    const view = renderPage()
    await user.clear(screen.getByLabelText('Límite diario de trabajo'))
    await user.type(screen.getByLabelText('Límite diario de trabajo'), '9')
    const second = settingsUserFixture()
    second.user.id = 'another-user'
    second.user.unsafeMetadata.eventger.dailyLimitHours = 4
    vi.mocked(useUser).mockReturnValue({ isLoaded: true, isSignedIn: true, user: second.resource })
    view.rerender(<MemoryRouter><PageRoutes /></MemoryRouter>)
    expect((screen.getByLabelText('Límite diario de trabajo') as HTMLInputElement).value).toBe('4')
    expect(fixture.user.updateMetadata).not.toHaveBeenCalled()
  })

  it('actualiza el nombre a través de Clerk y permite corregir campos vacíos', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Actualizar perfil' }))
    const dialog = within(screen.getByRole('dialog', { name: 'Actualizar perfil' }))
    await user.clear(dialog.getByLabelText('Nombre'))
    await user.click(dialog.getByRole('button', { name: 'Guardar perfil' }))
    expect(dialog.getByText('Ingresa tu nombre.')).toBeTruthy()
    expect(fixture.user.update).not.toHaveBeenCalled()
    await user.type(dialog.getByLabelText('Nombre'), 'Carlos')
    await user.click(dialog.getByRole('button', { name: 'Guardar perfil' }))
    expect(fixture.user.update).toHaveBeenCalledWith({ firstName: 'Carlos', lastName: 'Cruz' })
    expect(await screen.findByText('Tu perfil se actualizó correctamente.')).toBeTruthy()
  })
})
