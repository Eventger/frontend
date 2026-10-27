import { useClerk } from '@clerk/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppSidebar } from '../src/components/layout/AppSidebar'

describe('AppSidebar', () => {
  const openUserProfile = vi.fn()
  const signOut = vi.fn()

  beforeEach(() => {
    openUserProfile.mockClear()
    signOut.mockReset()
    signOut.mockResolvedValue(undefined)
    vi.mocked(useClerk).mockReturnValue({
      openUserProfile,
      signOut,
    } as never)
  })

  it('expone Configuración con su finalidad sin abrir la tarjeta del usuario', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/hoy']}>
        <AppSidebar />
        <Routes>
          <Route path="/hoy" element={null} />
          <Route path="/configuracion" element={<h1>Configuración de cuenta</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    const settingsLink = screen.getByRole('link', {
      name: 'Configuración, Perfil y preferencias',
    })

    expect(settingsLink).toBeTruthy()
    expect(settingsLink.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(settingsLink.getAttribute('aria-current')).toBeNull()

    settingsLink.focus()
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('heading', { name: 'Configuración de cuenta' })).toBeTruthy()
    expect(openUserProfile).not.toHaveBeenCalled()
  })

  it('mantiene activo únicamente el enlace visible de Configuración', () => {
    render(
      <MemoryRouter initialEntries={['/configuracion/seguridad']}>
        <AppSidebar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', {
      name: 'Configuración, Perfil y preferencias',
    }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('group', {
      name: 'Sesión actual: Usuario',
    })).toBeTruthy()
    expect(screen.queryByRole('button', {
      name: 'Abrir configuración de cuenta',
    })).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Hoy',
    }).getAttribute('aria-current')).toBeNull()
  })

  it('alinea el icono y el texto de Crear evento con la navegación', () => {
    render(
      <MemoryRouter initialEntries={['/hoy']}>
        <AppSidebar />
      </MemoryRouter>,
    )

    for (const label of ['Hoy', 'Eventos', 'Progreso']) {
      expect(screen.getByRole('link', { name: label }).querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    }

    const createEvent = screen.getByRole('button', { name: '+ Crear evento' })
    const settings = screen.getByRole('link', { name: 'Configuración, Perfil y preferencias' })
    expect(createEvent.textContent).toBe('+ Crear evento')
    expect(createEvent.compareDocumentPosition(settings) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('presenta el perfil únicamente como identificación de la sesión', () => {
    render(
      <MemoryRouter>
        <AppSidebar />
      </MemoryRouter>,
    )

    const sessionIdentity = screen.getByRole('group', { name: 'Sesión actual: Usuario' })
    expect(sessionIdentity.closest('button, a')).toBeNull()
    expect(sessionIdentity.getAttribute('tabindex')).toBeNull()
    expect(sessionIdentity.querySelector('svg')).toBeNull()
    expect(openUserProfile).not.toHaveBeenCalled()
  })

  it('mantiene Eventos activo en las rutas del flujo de eventos', () => {
    render(
      <MemoryRouter
        initialEntries={['/evento/21']}
      >
        <AppSidebar />
      </MemoryRouter>,
    )

    expect(
      screen
        .getByRole('link', {
          name: 'Eventos',
        })
        .getAttribute('aria-current'),
    ).toBe('page')

    expect(
      screen
        .getByRole('link', {
          name: 'Hoy',
        })
        .getAttribute('aria-current'),
    ).toBeNull()
  })

  it('cierra la sesión y maneja un fallo posterior', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <MemoryRouter>
        <AppSidebar />
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Cerrar sesión',
      }),
    )
    expect(signOut).toHaveBeenCalledWith({
      redirectUrl: '/',
    })

    unmount()
    signOut.mockRejectedValueOnce(
      new Error('red'),
    )
    render(
      <MemoryRouter>
        <AppSidebar />
      </MemoryRouter>,
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Cerrar sesión',
      }),
    )
    expect(
      await screen.findByText(
        'No pudimos cerrar la sesión. Inténtalo de nuevo.',
      ),
    ).toBeTruthy()
  })
})
