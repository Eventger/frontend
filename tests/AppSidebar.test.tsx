import { useClerk } from '@clerk/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppSidebar } from '../src/components/layout/AppSidebar'

describe('AppSidebar', () => {
  const openUserProfile = vi.fn()
  const signOut = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    openUserProfile.mockClear()
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
})
