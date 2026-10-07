import { useAuth, useClerk, useReverification, useSession, useUser } from '@clerk/react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SecurityPage } from '@/features/settings/pages/SecurityPage'
import { settingsUserFixture } from './settings.fixtures'
import { deferred } from '../../deferred'

let fixture: ReturnType<typeof settingsUserFixture>

function renderPage() {
  return render(<MemoryRouter initialEntries={['/configuracion/seguridad']}><Routes>
    <Route path="/configuracion/seguridad" element={<SecurityPage />} />
    <Route path="/configuracion" element={<h1>Configuración destino</h1>} />
    <Route path="/" element={<h1>Acceso destino</h1>} />
  </Routes></MemoryRouter>)
}

describe('SecurityPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    vi.mocked(useClerk().signOut).mockReset().mockResolvedValue(undefined)
    vi.mocked(useReverification).mockImplementation(fetcher => (async (...args: unknown[]) => fetcher(...args)) as never)
    fixture = settingsUserFixture()
    vi.mocked(useUser).mockReturnValue({ isLoaded: true, isSignedIn: true, user: fixture.resource })
    vi.mocked(useSession).mockReturnValue({ isLoaded: true, isSignedIn: true, session: { id: 'session-current' } } as never)
  })

  it('regresa a configuración mediante la miga de pan usando el teclado', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('2 sesiones')
    const breadcrumbs = within(screen.getByRole('navigation', { name: 'Miga de pan' }))
    expect(breadcrumbs.getByText('Seguridad').getAttribute('aria-current')).toBe('page')
    await user.tab()
    await user.tab()
    expect(document.activeElement).toBe(breadcrumbs.getByRole('link', { name: 'Configuración' }))
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: 'Configuración destino' })).toBeTruthy()
    expect(fixture.other.session.revoke).not.toHaveBeenCalled()
  })

  it('muestra los dispositivos reales y sólo permite cerrar las otras sesiones', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('2 sesiones')).toBeTruthy()
    expect(screen.getByText('Este dispositivo')).toBeTruthy()
    const close = screen.getByRole('button', { name: /Cerrar sesión: Android/ })
    expect(screen.queryByRole('button', { name: /Cerrar sesión: X11/ })).toBeNull()
    await user.click(close)
    expect(fixture.other.session.revoke).toHaveBeenCalledOnce()
    expect(fixture.current.session.revoke).not.toHaveBeenCalled()
    expect(await screen.findByText('1 sesión')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Cerrar sesión: Android/ })).toBeNull()
    expect(screen.getByText('La sesión se cerró correctamente.')).toBeTruthy()
  })

  it('permite reintentar una carga fallida sin mostrar un vacío engañoso', async () => {
    fixture.user.getSessions.mockRejectedValueOnce(new Error('network'))
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('No pudimos cargar tus dispositivos activos. Inténtalo de nuevo.')).toBeTruthy()
    expect(screen.queryByText('No hay dispositivos activos para mostrar.')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('2 sesiones')).toBeTruthy()
  })

  it('mantiene visible la sesión que no se pudo revocar', async () => {
    fixture.other.session.revoke.mockRejectedValueOnce(new Error('network'))
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: /Cerrar sesión: Android/ }))
    expect(await screen.findByText('No pudimos cerrar esa sesión. Inténtalo de nuevo.')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Cerrar sesión: Android/ })).toBeTruthy()
  })

  it('no interpreta una respuesta vacía de Clerk como ausencia de sesiones', async () => {
    fixture.user.getSessions.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('No pudimos cargar tus dispositivos activos. Inténtalo de nuevo.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Recargar página' })).toBeTruthy()
    expect(screen.queryByText('No hay dispositivos activos para mostrar.')).toBeNull()
  })

  it('no restaura sesiones cerradas al cambiar la contraseña y volver a esta pantalla', async () => {
    const user = userEvent.setup()
    const page = renderPage()
    await screen.findByText('2 sesiones')
    await user.click(screen.getByRole('button', { name: 'Establecer contraseña' }))
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Una clave segura de 2026')
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'Una clave segura de 2026')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
    expect(await screen.findByText('Tu contraseña se guardó correctamente.')).toBeTruthy()
    expect(screen.getByText('1 sesión')).toBeTruthy()
    page.unmount()
    renderPage()
    expect(await screen.findByText('1 sesión')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Cerrar sesión: Android/ })).toBeNull()
  })

  it('espera a identificar la sesión actual antes de permitir revocaciones', async () => {
    vi.mocked(useSession).mockReturnValue({ isLoaded: false, isSignedIn: undefined, session: undefined })
    const user = userEvent.setup()
    renderPage()
    const close = await screen.findByRole('button', { name: /Cerrar sesión: Android/ })
    expect((close as HTMLButtonElement).disabled).toBe(true)
    await user.click(close)
    expect(fixture.other.session.revoke).not.toHaveBeenCalled()
  })

  it('muestra el estado de carga mientras obtiene dispositivos', () => {
    fixture.user.getSessions.mockReturnValue(deferred<never>().promise)
    renderPage()
    expect(screen.getByRole('status', { name: 'Cargando dispositivos activos' })).toBeTruthy()
    expect(screen.queryByText('No hay dispositivos activos para mostrar.')).toBeNull()
  })

  it('respeta la eliminación deshabilitada en Clerk', async () => {
    fixture.user.deleteSelfEnabled = false
    const user = userEvent.setup()
    renderPage()
    const button = screen.getByRole('button', { name: 'Eliminar cuenta' })
    expect((button as HTMLButtonElement).disabled).toBe(true)
    await user.click(button)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(fixture.user.delete).not.toHaveBeenCalled()
  })

  it('exige confirmar la eliminación y explica el alcance sobre los datos de Eventger', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))
    const dialog = within(screen.getByRole('dialog', { name: '¿Eliminar tu cuenta?' }))
    expect(dialog.getByText('Se eliminarán tu perfil y acceso en Clerk, además de tus eventos, tareas y preferencias de Eventger.')).toBeTruthy()
    await user.click(dialog.getByRole('button', { name: 'Eliminar definitivamente' }))
    expect(fixture.user.delete).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
    sessionStorage.setItem(`eventger:create-event-draft:${fixture.user.id}`, 'borrador propio')
    sessionStorage.setItem('eventger:create-event-draft:user-other', 'borrador ajeno')
    await user.type(dialog.getByLabelText('Escribe ELIMINAR para confirmar'), 'ELIMINAR')
    await user.click(dialog.getByRole('button', { name: 'Eliminar definitivamente' }))
    expect(fetch).toHaveBeenCalledOnce()
    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('https://api.eventger.test/api/auth/me/')
    expect(options?.method).toBe('DELETE')
    expect(new Headers(options?.headers).get('X-Account-Deletion-Confirmation')).toBe('ELIMINAR')
    expect(options?.body).toBeUndefined()
    expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer test-token')
    expect(useAuth().getToken).toHaveBeenCalledWith({ skipCache: true })
    expect(fixture.user.delete).not.toHaveBeenCalled()
    expect(useClerk().signOut).toHaveBeenCalledOnce()
    expect(sessionStorage.getItem(`eventger:create-event-draft:${fixture.user.id}`)).toBeNull()
    expect(sessionStorage.getItem('eventger:create-event-draft:user-other')).toBe('borrador ajeno')
    expect(await screen.findByRole('heading', { name: 'Acceso destino' })).toBeTruthy()
  })

  it('conserva la cuenta al cancelar y permite reintentar tras un rechazo', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))
    await user.click(screen.getByRole('button', { name: 'Conservar mi cuenta' }))
    expect(fixture.user.delete).not.toHaveBeenCalled()
    vi.mocked(fetch).mockRejectedValueOnce(new Error('network'))
    await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))
    await user.type(screen.getByLabelText('Escribe ELIMINAR para confirmar'), 'ELIMINAR')
    await user.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }))
    expect(await screen.findByText('No pudimos eliminar tu cuenta. Inténtalo de nuevo.')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Eliminar definitivamente' }) as HTMLButtonElement).disabled).toBe(false)
    expect(screen.queryByRole('heading', { name: 'Acceso destino' })).toBeNull()
    expect(useClerk().signOut).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }))
    expect(await screen.findByRole('heading', { name: 'Acceso destino' })).toBeTruthy()
  })

  it('cancelar la reverificación conserva la cuenta y los datos', async () => {
    vi.mocked(useReverification).mockImplementation(() => (async () => {
      throw { code: 'reverification_cancelled' }
    }) as never)
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))
    await user.type(screen.getByLabelText('Escribe ELIMINAR para confirmar'), 'ELIMINAR')
    await user.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }))
    expect(fetch).not.toHaveBeenCalled()
    expect(useClerk().signOut).not.toHaveBeenCalled()
    expect(screen.queryByRole('heading', { name: 'Acceso destino' })).toBeNull()
  })

  it('espera la confirmación del backend antes de cerrar sesión y bloquea otro envío', async () => {
    const pending = deferred<Response>()
    vi.mocked(fetch).mockReturnValueOnce(pending.promise)
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))
    await user.type(screen.getByLabelText('Escribe ELIMINAR para confirmar'), 'ELIMINAR')
    await user.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }))
    expect((screen.getByRole('button', { name: 'Eliminando…' }) as HTMLButtonElement).disabled).toBe(true)
    expect(useClerk().signOut).not.toHaveBeenCalled()
    pending.resolve(new Response(null, { status: 204 }))
    expect(await screen.findByRole('heading', { name: 'Acceso destino' })).toBeTruthy()
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('reintenta sólo cerrar sesión si la cuenta ya se eliminó', async () => {
    vi.mocked(useClerk().signOut).mockRejectedValueOnce(new Error('network'))
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))
    await user.type(screen.getByLabelText('Escribe ELIMINAR para confirmar'), 'ELIMINAR')
    await user.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }))
    expect(await screen.findByText('Tu cuenta se eliminó. No pudimos cerrar la sesión en este dispositivo. Inténtalo de nuevo.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /^Cerrar sesión$/ }))
    expect(await screen.findByRole('heading', { name: 'Acceso destino' })).toBeTruthy()
    expect(fetch).toHaveBeenCalledOnce()
    expect(useClerk().signOut).toHaveBeenCalledTimes(2)
  })

  it('vuelve a configuración sin abrir el perfil estándar', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('link', { name: 'Volver a configuración' }))
    expect(screen.getByRole('heading', { name: 'Configuración destino' })).toBeTruthy()
  })
})
