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

function mockSignIn(
  status = 'needs_identifier',
) {
  vi.mocked(useSignIn).mockReturnValue({
    fetchStatus: 'idle',
    errors: { fields: {} },
    signIn: {
      status,
      password,
      finalize,
      sso,
    },
  } as never)
}

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

async function fillLoginForm(
  user: ReturnType<typeof userEvent.setup>,
) {
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
}

describe('LoginPage', () => {
  beforeEach(() => {
    password.mockReset()
    finalize.mockReset()
    sso.mockReset()
    mockSignIn()
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
    mockSignIn('complete')
    renderLogin({ from: '/eventos' })

    await fillLoginForm(user)
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

  it('valida el formato del correo y enfoca la contraseña faltante', async () => {
    const user = userEvent.setup()
    renderLogin()

    const email = screen.getByLabelText(
      'Correo electrónico',
    )
    await user.type(email, 'correo-invalido')
    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    )
    expect(
      screen.getByText(
        'Ingresa una dirección de correo válida.',
      ),
    ).toBeTruthy()
    expect(document.activeElement).toBe(email)

    await user.clear(email)
    await user.type(email, 'ana@example.com')
    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    )
    expect(document.activeElement).toBe(
      screen.getByLabelText('Contraseña'),
    )
  })

  it.each([
    [
      'needs_second_factor',
      'Tu cuenta requiere una verificación adicional.',
    ],
    [
      'needs_client_trust',
      'Clerk requiere verificar este dispositivo antes de continuar.',
    ],
    [
      'needs_identifier',
      'No fue posible completar el inicio de sesión.',
    ],
  ])('informa el estado pendiente %s', async (status, message) => {
    const user = userEvent.setup()
    password.mockResolvedValue({ error: null })
    mockSignIn(status)
    renderLogin()
    await fillLoginForm(user)
    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    )

    expect(
      await screen.findByText(message),
    ).toBeTruthy()
  })

  it('muestra los errores de contraseña y conexión', async () => {
    const user = userEvent.setup()
    password.mockResolvedValueOnce({
      error: new Error('credenciales'),
    })
    renderLogin()
    await fillLoginForm(user)
    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    )
    expect(
      await screen.findByText(
        'No pudimos iniciar sesión. Verifica tus datos e inténtalo de nuevo.',
      ),
    ).toBeTruthy()

    password.mockRejectedValueOnce(
      new Error('red'),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    )
    expect(
      await screen.findByText(
        'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.',
      ),
    ).toBeTruthy()
  })

  it('mantiene la sesión pendiente y permite mostrar la contraseña', async () => {
    const user = userEvent.setup()
    password.mockResolvedValue({ error: null })
    finalize.mockImplementation(
      async ({ navigate }) => {
        navigate({
          session: {
            currentTask: { key: 'verify' },
          },
        })
        return { error: null }
      },
    )
    mockSignIn('complete')
    renderLogin()
    await fillLoginForm(user)

    await user.click(
      screen.getByRole('button', {
        name: 'Mostrar contraseña',
      }),
    )
    expect(
      screen.getByRole('button', {
        name: 'Ocultar contraseña',
      }),
    ).toBeTruthy()
    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    )
    expect(
      await screen.findByText(
        'Completa la verificación pendiente para continuar.',
      ),
    ).toBeTruthy()
  })

  it('muestra errores del flujo de Google', async () => {
    const user = userEvent.setup()
    sso.mockResolvedValueOnce({
      error: new Error('oauth'),
    })
    renderLogin()
    const googleButton = screen.getByRole(
      'button',
      { name: 'Continuar con Google' },
    )
    await user.click(googleButton)
    expect(
      await screen.findByText(
        'No pudimos iniciar sesión con Google. Inténtalo de nuevo.',
      ),
    ).toBeTruthy()

    sso.mockRejectedValueOnce(new Error('red'))
    await user.click(googleButton)
    expect(
      await screen.findByText(
        'No pudimos conectarnos con Google. Revisa tu conexión e inténtalo de nuevo.',
      ),
    ).toBeTruthy()
  })
})
