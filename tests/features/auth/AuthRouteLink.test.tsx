import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import { AuthRouteLink } from '@/features/auth/components/AuthRouteLink'

function renderLink() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route
          path="/"
          element={(
            <AuthRouteLink
              to="/crear-cuenta"
              direction="forward"
            >
              Crear cuenta
            </AuthRouteLink>
          )}
        />
        <Route
          path="/crear-cuenta"
          element={<h1>Registro</h1>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AuthRouteLink', () => {
  beforeEach(() => {
    delete document.documentElement.dataset
      .authDirection
  })

  it('registra la dirección en una navegación primaria', async () => {
    const user = userEvent.setup()
    renderLink()

    await user.click(
      screen.getByRole('link', {
        name: 'Crear cuenta',
      }),
    )

    expect(
      document.documentElement.dataset
        .authDirection,
    ).toBe('forward')
    expect(
      screen.getByRole('heading', {
        name: 'Registro',
      }),
    ).toBeTruthy()
  })

  it.each([
    { button: 1 },
    { metaKey: true },
    { ctrlKey: true },
    { shiftKey: true },
    { altKey: true },
  ])(
    'ignora navegaciones modificadas: %o',
    (eventInit) => {
      renderLink()
      const link = screen.getByRole('link', {
        name: 'Crear cuenta',
      })
      link.addEventListener(
        'click',
        (event) => event.preventDefault(),
        { once: true },
      )

      fireEvent.click(link, eventInit)

      expect(
        document.documentElement.dataset
          .authDirection,
      ).toBeUndefined()
    },
  )
})
