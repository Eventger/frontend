import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSignUp } from '@clerk/react'
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

import { SignUpPage } from '@/features/auth/pages/SignUpPage'

const password = vi.fn()
const sso = vi.fn()
const sendEmailCode = vi.fn()
const verifyEmailCode = vi.fn()

function mockSignUp(
  status = 'missing_requirements',
) {
  vi.mocked(useSignUp).mockReturnValue({
    fetchStatus: 'idle',
    errors: { fields: {} },
    signUp: {
      status,
      password,
      sso,
      verifications: {
        sendEmailCode,
        verifyEmailCode,
      },
    },
  } as never)
}

function renderSignUp() {
  return render(
    <MemoryRouter
      initialEntries={['/crear-cuenta']}
    >
      <Routes>
        <Route
          path="/crear-cuenta"
          element={<SignUpPage />}
        />
        <Route
          path="/"
          element={<h1>Iniciar sesión</h1>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SignUpPage', () => {
  beforeEach(() => {
    password.mockReset()
    sso.mockReset()
    sendEmailCode.mockReset()
    verifyEmailCode.mockReset()
    sessionStorage.clear()
    mockSignUp()
  })

  it('valida el formulario y enfoca el primer campo inválido', async () => {
    const user = userEvent.setup()
    renderSignUp()

    await user.click(
      screen.getByRole('button', {
        name: 'Crear cuenta',
      }),
    )

    const firstName =
      screen.getByLabelText('Nombre')
    expect(password).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(
      firstName,
    )
    expect(
      firstName.getAttribute('aria-invalid'),
    ).toBe('true')
  })

  it('inicia el registro con Google y registra la aceptación legal', async () => {
    const user = userEvent.setup()
    sso.mockResolvedValue({ error: null })
    renderSignUp()

    await user.click(
      screen.getByRole('button', {
        name: 'Registrarme con Google',
      }),
    )

    expect(sso).toHaveBeenCalledWith({
      strategy: 'oauth_google',
      redirectUrl:
        `${window.location.origin}/hoy`,
      redirectCallbackUrl:
        `${window.location.origin}/crear-cuenta`,
      legalAccepted: true,
    })
  })

  it('crea la cuenta, verifica el código y vuelve al login', async () => {
    const user = userEvent.setup()
    mockSignUp('complete')
    password.mockResolvedValue({ error: null })
    sendEmailCode.mockResolvedValue({
      error: null,
    })
    verifyEmailCode.mockResolvedValue({
      error: null,
    })
    renderSignUp()

    await user.type(
      screen.getByLabelText('Nombre'),
      'Ana',
    )
    await user.type(
      screen.getByLabelText('Apellido'),
      'Rojas',
    )
    await user.type(
      screen.getByLabelText(
        'Correo electrónico',
      ),
      'ana@example.com',
    )
    await user.type(
      screen.getByLabelText('Contraseña'),
      'una-clave-de-15-caracteres',
    )
    await user.click(
      screen.getByRole('checkbox'),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Crear cuenta',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Verifica tu correo',
      }),
    ).toBeTruthy()
    await user.type(
      screen.getByLabelText(
        'Código de verificación',
      ),
      '123456',
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Verificar correo',
      }),
    )

    expect(verifyEmailCode).toHaveBeenCalledWith({
      code: '123456',
    })
    expect(
      await screen.findByRole('heading', {
        name: 'Iniciar sesión',
      }),
    ).toBeTruthy()
    expect(
      sessionStorage.getItem(
        'accountCreated',
      ),
    ).toBe('true')
  })
})
