import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSignIn } from '@clerk/react'
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
  vi,
} from 'vitest'

import { LoginPage } from '@/features/auth/pages/LoginPage'

const password = vi.fn()
const finalize = vi.fn()
const sso = vi.fn()

function renderLogin(
  state?: { from: string },
) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: '/', state },
      ]}
    >
      <Routes>
        <Route
          path="/"
          element={<LoginPage />}
        />
        <Route
          path="/eventos"
          element={<h1>Eventos privados</h1>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    password.mockReset()
    finalize.mockReset()
    sso.mockReset()
    vi.mocked(useSignIn).mockReturnValue({
      fetchStatus: 'idle',
      errors: {
        fields: {
          identifier: null,
          password: null,
          code: null,
        },
      },
      signIn: {
        status: 'needs_identifier',
        password,
        finalize,
        sso,
      },
    } as never)
    sessionStorage.clear()
  })

  it('muestra errores accesibles sin enviar campos vacíos', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    )

    expect(password).not.toHaveBeenCalled()
    expect(
      screen.getByText(
        'Ingresa tu correo electrónico.',
      ).getAttribute('role'),
    ).toBe('alert')
    expect(
      screen.getByLabelText(
        'Correo electrónico',
      ).getAttribute('aria-invalid'),
    ).toBe('true')
  })

  it('activa la sesión y vuelve a la ruta privada solicitada', async () => {
    const user = userEvent.setup()
    password.mockResolvedValue({
      error: null,
    })
    finalize.mockImplementation(
      async ({ navigate }) => {
        navigate({ session: null })
        return { error: null }
      },
    )
    vi.mocked(useSignIn).mockReturnValue({
      fetchStatus: 'idle',
      errors: { fields: {} },
      signIn: {
        status: 'complete',
        password,
        finalize,
        sso,
      },
    } as never)
    renderLogin({ from: '/eventos' })

    await user.type(
      screen.getByLabelText(
        'Correo electrónico',
      ),
      'ana@example.com',
    )
    await user.type(
      screen.getByLabelText('Contraseña'),
      'una-clave-segura',
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    )

    expect(password).toHaveBeenCalledWith({
      emailAddress: 'ana@example.com',
      password: 'una-clave-segura',
    })
    expect(finalize).toHaveBeenCalledOnce()
    expect(
      await screen.findByRole('heading', {
        name: 'Eventos privados',
      }),
    ).toBeTruthy()
  })

  it('inicia el flujo OAuth de Google', async () => {
    const user = userEvent.setup()
    sso.mockResolvedValue({ error: null })
    renderLogin()

    await user.click(
      screen.getByRole('button', {
        name: 'Continuar con Google',
      }),
    )

    expect(sso).toHaveBeenCalledWith({
      strategy: 'oauth_google',
      redirectUrl:
        `${window.location.origin}/hoy`,
      redirectCallbackUrl:
        `${window.location.origin}/`,
    })
  })
})
