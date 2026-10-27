import { useUser } from '@clerk/react'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { settingsUserFixture } from './settings.fixtures'
import { deferred } from '../../deferred'
import { getPlanningPreferences, savePlanningPreferences } from '@/features/settings/services/planningPreferences.service'
import { getToday } from '@/features/today/services/today.service'
import { buildTodayTask } from '../today/today.fixtures'

vi.mock('@/features/settings/services/planningPreferences.service', () => ({ getPlanningPreferences: vi.fn(), savePlanningPreferences: vi.fn() }))
vi.mock('@/features/today/services/today.service', () => ({ getToday: vi.fn() }))

let fixture: ReturnType<typeof settingsUserFixture>

function PageRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SettingsPage />} />
      <Route path="/configuracion/seguridad" element={<h1>Destino de seguridad</h1>} />
      <Route path="/hoy" element={<h1>Destino Hoy</h1>} />
    </Routes>
  )
}

function renderPage() {
  return render(<MemoryRouter><PageRoutes /></MemoryRouter>)
}

async function readyPreferences() {
  await waitFor(() => expect((screen.getByLabelText('Límite diario de trabajo') as HTMLInputElement).disabled).toBe(false))
}

describe('SettingsPage', () => {
  beforeEach(() => {
    fixture = settingsUserFixture()
    vi.mocked(useUser).mockReturnValue({ isLoaded: true, isSignedIn: true, user: fixture.resource })
    vi.mocked(getPlanningPreferences).mockReset().mockResolvedValue({ dailyLimitHours: 6, configured: true })
    vi.mocked(savePlanningPreferences).mockReset().mockImplementation(async hours => ({ dailyLimitHours: hours, configured: true }))
    vi.mocked(getToday).mockReset().mockResolvedValue({ overdue: [], today: [], upcoming: [], completed: [] })
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

  it('guarda una preferencia en la API sin reemplazar metadatos de Clerk', async () => {
    const user = userEvent.setup()
    renderPage()
    await readyPreferences()
    await user.clear(screen.getByLabelText('Límite diario de trabajo'))
    await user.type(screen.getByLabelText('Límite diario de trabajo'), '7.5')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(savePlanningPreferences).toHaveBeenCalledWith(7.5, expect.any(Function))
    expect(fixture.user.updateMetadata).not.toHaveBeenCalled()
    expect(fixture.user.unsafeMetadata.otherApp).toEqual({ theme: 'dark' })
    expect(fixture.user.unsafeMetadata.eventger.calendar).toBe('week')
    expect(await screen.findByText('Tus preferencias se guardaron correctamente.')).toBeTruthy()
    expect((screen.getByLabelText('Límite diario de trabajo') as HTMLInputElement).value).toBe('7.5')
  })

  it.each(['', '0', '0.5', '16.01', '25', '2.001'])('rechaza el límite inválido %s y enfoca el campo', async (value) => {
    const user = userEvent.setup()
    renderPage()
    await readyPreferences()
    const input = screen.getByLabelText('Límite diario de trabajo')
    await user.clear(input)
    if (value) await user.type(input, value)
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(savePlanningPreferences).not.toHaveBeenCalled()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(input)
  })

  it('bloquea una reducción que sobrecarga un día entre varios eventos y permite corregirla', async () => {
    vi.mocked(getToday).mockResolvedValue({
      overdue: [], today: [], completed: [],
      upcoming: [
        buildTodayTask({ id: 1, estimatedHours: 1, targetDate: '2026-10-11T04:59:59Z' }),
        buildTodayTask({ id: 2, eventId: 22, estimatedHours: 1, targetDate: '2026-10-10T23:59:59-05:00' }),
      ],
    })
    const user = userEvent.setup()
    const view = renderPage()
    await readyPreferences()
    const input = screen.getByLabelText('Límite diario de trabajo')
    await user.clear(input)
    await user.type(input, '1')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('2 h'))
    expect(screen.getByRole('alert').textContent).toContain('10 de octubre de 2026')
    expect(savePlanningPreferences).not.toHaveBeenCalled()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(input)
    expect(screen.queryByText('Tus preferencias se guardaron correctamente.')).toBeNull()

    // El rechazo conserva el valor guardado, aunque se vuelva a abrir el formulario.
    view.unmount()
    renderPage()
    await readyPreferences()
    expect((screen.getByLabelText('Límite diario de trabajo') as HTMLInputElement).value).toBe('6')
    await user.clear(screen.getByLabelText('Límite diario de trabajo'))
    await user.type(screen.getByLabelText('Límite diario de trabajo'), '2')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('Tus preferencias se guardaron correctamente.')).toBeTruthy()
    expect(savePlanningPreferences).toHaveBeenCalledWith(2, expect.any(Function))
  })

  it('permite navegar a Hoy desde el mensaje de conflicto de límite diario', async () => {
    vi.mocked(getToday).mockResolvedValue({
      overdue: [], today: [], completed: [],
      upcoming: [buildTodayTask({ id: 1, estimatedHours: 5, targetDate: '2026-10-11T04:59:59Z' })],
    })
    const user = userEvent.setup()
    renderPage()
    await readyPreferences()
    const input = screen.getByLabelText('Límite diario de trabajo')
    await user.clear(input)
    await user.type(input, '2')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    const navButton = await screen.findByRole('button', { name: 'Ver tareas en Hoy' })
    await user.click(navButton)
    expect(screen.getByRole('heading', { name: 'Destino Hoy' })).toBeTruthy()
  })

  it('conserva el borrador tras un fallo y bloquea envíos simultáneos', async () => {
    const pending = deferred<never>()
    vi.mocked(savePlanningPreferences).mockReturnValueOnce(pending.promise)
    const user = userEvent.setup()
    renderPage()
    await readyPreferences()
    await user.clear(screen.getByLabelText('Límite diario de trabajo'))
    await user.type(screen.getByLabelText('Límite diario de trabajo'), '8')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect((screen.getByRole('button', { name: 'Guardando…' }) as HTMLButtonElement).disabled).toBe(true)
    pending.reject(new Error('network'))
    expect(await screen.findByText('No pudimos guardar tus preferencias. Inténtalo de nuevo.')).toBeTruthy()
    expect((screen.getByLabelText('Límite diario de trabajo') as HTMLInputElement).value).toBe('8')
    expect(screen.queryByText('Tus preferencias se guardaron correctamente.')).toBeNull()
  })

  it('no guarda una reducción si falla la consulta de carga y permite reintentar con datos nuevos', async () => {
    vi.mocked(getToday).mockRejectedValueOnce(new Error('network'))
    const user = userEvent.setup()
    renderPage()
    await readyPreferences()
    const input = screen.getByLabelText('Límite diario de trabajo')
    await user.clear(input)
    await user.type(input, '1')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('No pudimos guardar tus preferencias. Inténtalo de nuevo.')).toBeTruthy()
    expect(savePlanningPreferences).not.toHaveBeenCalled()
    expect((input as HTMLInputElement).value).toBe('1')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('Tus preferencias se guardaron correctamente.')).toBeTruthy()
    expect(getToday).toHaveBeenCalledTimes(2)
    expect(savePlanningPreferences).toHaveBeenCalledWith(1, expect.any(Function))
  })

  it.each([6, 8])('permite mantener o aumentar el límite a %s h aunque haya una sobrecarga previa', async (hours) => {
    vi.mocked(getToday).mockRejectedValue(new Error('No debe consultar tareas'))
    const user = userEvent.setup()
    renderPage()
    await readyPreferences()
    await user.clear(screen.getByLabelText('Límite diario de trabajo'))
    await user.type(screen.getByLabelText('Límite diario de trabajo'), String(hours))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('Tus preferencias se guardaron correctamente.')).toBeTruthy()
    expect(getToday).not.toHaveBeenCalled()
    expect(savePlanningPreferences).toHaveBeenCalledWith(hours, expect.any(Function))
  })

  it('reinicia el borrador al cambiar de usuario', async () => {
    const user = userEvent.setup()
    const view = renderPage()
    await readyPreferences()
    await user.clear(screen.getByLabelText('Límite diario de trabajo'))
    await user.type(screen.getByLabelText('Límite diario de trabajo'), '9')
    const second = settingsUserFixture()
    second.user.id = 'another-user'
    second.user.unsafeMetadata.eventger.dailyLimitHours = 4
    vi.mocked(useUser).mockReturnValue({ isLoaded: true, isSignedIn: true, user: second.resource })
    vi.mocked(getPlanningPreferences).mockResolvedValueOnce({ dailyLimitHours: 4, configured: true })
    view.rerender(<MemoryRouter><PageRoutes /></MemoryRouter>)
    await waitFor(() => expect((screen.getByLabelText('Límite diario de trabajo') as HTMLInputElement).value).toBe('4'))
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

  it('permite cambiar la foto de perfil subiendo un archivo a Clerk', async () => {
    // Mock global URL methods for jsdom
    const originalCreate = URL.createObjectURL
    const originalRevoke = URL.revokeObjectURL
    URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-preview')
    URL.revokeObjectURL = vi.fn()

    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Actualizar perfil' }))
    const dialog = within(screen.getByRole('dialog', { name: 'Actualizar perfil' }))

    const fileInput = screen.getByLabelText('Cargar nueva foto de perfil') as HTMLInputElement
    const file = new File(['mock-image-bytes'], 'avatar.png', { type: 'image/png' })
    await user.upload(fileInput, file)

    expect(dialog.getByAltText('Vista previa de foto de perfil')).toBeTruthy()
    expect(dialog.getByText('Nueva foto lista para guardar.')).toBeTruthy()

    await user.click(dialog.getByRole('button', { name: 'Guardar perfil' }))
    expect(fixture.user.setProfileImage).toHaveBeenCalledWith({ file })
    expect(await screen.findByText('Tu perfil se actualizó correctamente.')).toBeTruthy()

    URL.createObjectURL = originalCreate
    URL.revokeObjectURL = originalRevoke
  })

  it('permite eliminar la foto de perfil existente a través de Clerk', async () => {
    fixture.user.hasImage = true
    fixture.user.imageUrl = 'https://example.com/existing-photo.jpg'

    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Actualizar perfil' }))
    const dialog = within(screen.getByRole('dialog', { name: 'Actualizar perfil' }))

    expect(dialog.getByAltText('Foto de perfil actual')).toBeTruthy()
    const removeButton = dialog.getByRole('button', { name: 'Eliminar foto' })
    await user.click(removeButton)

    expect(dialog.getByText('La foto se eliminará al guardar los cambios.')).toBeTruthy()
    expect(dialog.getByRole('button', { name: 'Deshacer' })).toBeTruthy()

    await user.click(dialog.getByRole('button', { name: 'Guardar perfil' }))
    expect(fixture.user.setProfileImage).toHaveBeenCalledWith({ file: null })
    expect(await screen.findByText('Tu perfil se actualizó correctamente.')).toBeTruthy()
  })

  it('permite abrir el diálogo de perfil al hacer clic sobre el avatar de la cuenta', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Cambiar foto de perfil' }))
    expect(screen.getByRole('dialog', { name: 'Actualizar perfil' })).toBeTruthy()
  })

  it('permite aumentar y disminuir el límite con los botones del stepper', async () => {
    const user = userEvent.setup()
    renderPage()
    await readyPreferences()
    const input = screen.getByLabelText('Límite diario de trabajo') as HTMLInputElement
    const incButton = screen.getByRole('button', { name: 'Aumentar horas' })
    const decButton = screen.getByRole('button', { name: 'Disminuir horas' })

    expect(input.value).toBe('6')
    await user.click(incButton)
    expect(input.value).toBe('7')
    await user.click(decButton)
    expect(input.value).toBe('6')
    await user.click(decButton)
    expect(input.value).toBe('5')
  })

  it('deshabilita los botones de incremento y decremento en los extremos 1 y 16', async () => {
    const user = userEvent.setup()
    renderPage()
    await readyPreferences()
    const input = screen.getByLabelText('Límite diario de trabajo')
    const incButton = screen.getByRole('button', { name: 'Aumentar horas' }) as HTMLButtonElement
    const decButton = screen.getByRole('button', { name: 'Disminuir horas' }) as HTMLButtonElement

    await user.clear(input)
    await user.type(input, '1')
    expect(decButton.disabled).toBe(true)
    expect(incButton.disabled).toBe(false)

    await user.clear(input)
    await user.type(input, '16')
    expect(incButton.disabled).toBe(true)
    expect(decButton.disabled).toBe(false)
  })
})
