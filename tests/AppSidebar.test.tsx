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

  it('abre la configuración de Eventger desde la tarjeta del usuario', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <AppSidebar />
        <Routes>
          <Route path="/" element={null} />
          <Route path="/configuracion" element={<h1>Configuración de cuenta</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Abrir configuración de cuenta',
      }),
    )

    expect(await screen.findByRole('heading', { name: 'Configuración de cuenta' })).toBeTruthy()
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
