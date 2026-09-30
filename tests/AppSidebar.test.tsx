import { useClerk } from '@clerk/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
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

  it('abre el perfil de Clerk desde la tarjeta del usuario', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <AppSidebar />
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Abrir perfil de usuario',
      }),
    )

    expect(openUserProfile).toHaveBeenCalledOnce()
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
