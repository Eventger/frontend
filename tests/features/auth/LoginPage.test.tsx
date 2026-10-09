import { act, render, screen, waitFor } from '@testing-library/react'
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
const create = vi.fn()
const sendRecoveryCode = vi.fn()
const verifyRecoveryCode = vi.fn()
const submitRecoveryPassword = vi.fn()
const sendEmailCode = vi.fn()
const verifyEmailCode = vi.fn()
const sendPhoneCode = vi.fn()
const verifyPhoneCode = vi.fn()
const verifyTOTP = vi.fn()
const verifyBackupCode = vi.fn()
const reset = vi.fn()
let signInStatus = 'needs_identifier'
const decorateUrl = vi.fn(
  (url: string) => url,
)

function mockSignIn(
  status = 'needs_identifier',
  methods = ['email_code'],
) {
  signInStatus = status
  vi.mocked(useSignIn).mockReturnValue({
    fetchStatus: 'idle',
    errors: { fields: {} },
    signIn: {
      get status() { return signInStatus },
      supportedSecondFactors: methods.map(strategy => ({ strategy })),
      password,
      finalize,
      sso,
      create,
      reset,
      mfa: { sendEmailCode, verifyEmailCode, sendPhoneCode, verifyPhoneCode, verifyTOTP, verifyBackupCode },
      resetPasswordEmailCode: {
        sendCode: sendRecoveryCode,
        verifyCode: verifyRecoveryCode,
        submitPassword: submitRecoveryPassword,
      },
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
        <Route
          path="/crear-cuenta"
          element={<h1>Crear cuenta destino</h1>}
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
    create.mockReset()
    sendRecoveryCode.mockReset()
    verifyRecoveryCode.mockReset()
    submitRecoveryPassword.mockReset()
    for (const fn of [sendEmailCode, verifyEmailCode, sendPhoneCode, verifyPhoneCode, verifyTOTP, verifyBackupCode, reset]) {
      fn.mockReset()
      fn.mockResolvedValue({ error: null })
    }
    decorateUrl.mockReset()
    decorateUrl.mockImplementation(
      (url: string) => url,
    )
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
        navigate({
          session: null,
          decorateUrl,
        })
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
    expect(decorateUrl).toHaveBeenCalledWith(
      '/eventos',
    )
    expect(
      await screen.findByRole('heading', {
        name: 'Eventos privados',
      }),
    ).toBeTruthy()
  })

  it('aplica trim al correo y conserva la contraseña exactamente como fue ingresada', async () => {
    const user = userEvent.setup()
    password.mockResolvedValue({
      error: null,
    })
    finalize.mockImplementation(
      async ({ navigate }) => {
        navigate({
          session: null,
          decorateUrl,
        })
        return { error: null }
      },
    )
    mockSignIn('complete')
    renderLogin({ from: '/eventos' })

    const emailInput = screen.getByLabelText('Correo electrónico')
    const passwordInput = screen.getByLabelText('Contraseña')

    await user.type(emailInput, '   ana@example.com   ')
    await user.type(passwordInput, '  una clave con espacios  ')

    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    )

    expect(password).toHaveBeenCalledWith({
      emailAddress: 'ana@example.com',
      password: '  una clave con espacios  ',
    })
    expect((emailInput as HTMLInputElement).value).toBe('ana@example.com')
  })

  it('aplica trim al correo al desenfocar el campo (onBlur)', async () => {
    const user = userEvent.setup()
    renderLogin()

    const emailInput = screen.getByLabelText('Correo electrónico')
    await user.type(emailInput, '   ana@example.com   ')
    await user.tab()

    expect((emailInput as HTMLInputElement).value).toBe('ana@example.com')
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

  it('informa un estado de acceso inesperado', async () => {
    const user = userEvent.setup()
    password.mockResolvedValue({ error: null })
    mockSignIn('needs_identifier')
    renderLogin()
    await fillLoginForm(user)
    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    )

    expect(
      await screen.findByRole('alertdialog', {
        name: 'No pudimos iniciar sesión',
      }),
    ).toBeTruthy()
  })

  it.each(['needs_client_trust', 'needs_second_factor'])('permite verificar el correo cuando Clerk devuelve %s', async (status) => {
    const user = userEvent.setup()
    password.mockResolvedValue({ error: null })
    verifyEmailCode.mockImplementation(async () => {
      signInStatus = 'complete'
      return { error: null }
    })
    finalize.mockImplementation(async ({ navigate }) => {
      navigate({ session: null, decorateUrl })
      return { error: null }
    })
    mockSignIn(status)
    renderLogin({ from: '/eventos' })
    await fillLoginForm(user)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByRole('heading', { name: 'Verifica tu acceso' })).toBeTruthy()
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(finalize).not.toHaveBeenCalled()
    const input = screen.getByLabelText('Código de verificación')
    expect(input.getAttribute('autocomplete')).toBe('one-time-code')
    expect(input.hasAttribute('disabled')).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))
    expect(document.activeElement).toBe(input)
    expect(sendEmailCode).toHaveBeenCalledOnce()
    await user.type(input, '123456')
    await user.click(screen.getByRole('button', { name: 'Verificar y continuar' }))
    expect(verifyEmailCode).toHaveBeenCalledWith({ code: '123456' })
    expect(finalize).toHaveBeenCalledOnce()
    expect(await screen.findByRole('heading', { name: 'Eventos privados' })).toBeTruthy()
    expect(password).toHaveBeenCalledOnce()
  })

  it('permite reintentar el envío y corregir un código inválido sin activar la sesión', async () => {
    const user = userEvent.setup()
    password.mockResolvedValue({ error: null })
    sendEmailCode.mockResolvedValueOnce({ error: new Error('envío') })
    verifyEmailCode.mockResolvedValueOnce({ error: { errors: [{ code: 'form_code_incorrect' }] } })
    mockSignIn('needs_client_trust')
    renderLogin()
    await fillLoginForm(user)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))
    expect(await screen.findByText('No pudimos enviar el código. Inténtalo de nuevo.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))
    const input = screen.getByLabelText('Código de verificación')
    await user.type(input, '123')
    await user.click(screen.getByRole('button', { name: 'Verificar y continuar' }))
    expect(screen.getByText('Ingresa el código de 6 dígitos.')).toBeTruthy()
    expect(document.activeElement).toBe(input)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(verifyEmailCode).not.toHaveBeenCalled()
    await user.type(input, '456')
    await user.click(screen.getByRole('button', { name: 'Verificar y continuar' }))
    expect(await screen.findByText('El código no es válido o ya expiró.')).toBeTruthy()
    expect(finalize).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Reenviar código' }))
    expect(sendEmailCode).toHaveBeenCalledTimes(3)
    expect((input as HTMLInputElement).value).toBe('')
    expect(screen.queryByText('El código no es válido o ya expiró.')).toBeNull()
  })

  it.each([
    ['phone_code', '123456', verifyPhoneCode],
    ['totp', '123456', verifyTOTP],
    ['backup_code', 'respaldo-123', verifyBackupCode],
  ] as const)('respeta el segundo factor %s que admite la cuenta', async (method, code, verify) => {
    const user = userEvent.setup()
    password.mockResolvedValue({ error: null })
    verify.mockImplementation(async () => {
      signInStatus = 'complete'
      return { error: null }
    })
    finalize.mockImplementation(async ({ navigate }) => {
      navigate({ session: null, decorateUrl })
      return { error: null }
    })
    mockSignIn('needs_second_factor', [method])
    renderLogin({ from: '/eventos' })
    await fillLoginForm(user)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    if (method === 'phone_code') {
      await user.click(screen.getByRole('button', { name: 'Enviar código' }))
      expect(sendPhoneCode).toHaveBeenCalledOnce()
    }
    await user.type(screen.getByLabelText(method === 'backup_code' ? 'Código de respaldo' : 'Código de verificación'), code)
    await user.click(screen.getByRole('button', { name: 'Verificar y continuar' }))
    expect(verify).toHaveBeenCalledWith({ code })
    expect(await screen.findByRole('heading', { name: 'Eventos privados' })).toBeTruthy()
    expect(sendEmailCode).not.toHaveBeenCalled()
  })

  it('conserva el código ante un fallo de red y no finaliza una verificación pendiente', async () => {
    const user = userEvent.setup()
    password.mockResolvedValue({ error: null })
    verifyEmailCode.mockRejectedValueOnce(new Error('red'))
    mockSignIn('needs_client_trust')
    renderLogin()
    await fillLoginForm(user)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))
    const input = screen.getByLabelText('Código de verificación')
    await user.type(input, '123456')
    await user.click(screen.getByRole('button', { name: 'Verificar y continuar' }))
    expect(await screen.findByText('No pudimos conectarnos para verificar el código. Inténtalo de nuevo.')).toBeTruthy()
    expect((input as HTMLInputElement).value).toBe('123456')
    await user.click(screen.getByRole('button', { name: 'Verificar y continuar' }))
    expect(await screen.findByText('La verificación aún no está completa. Inténtalo de nuevo.')).toBeTruthy()
    expect(finalize).not.toHaveBeenCalled()
  })

  it('reinicia la verificación y conserva los datos al volver al acceso', async () => {
    const user = userEvent.setup()
    password.mockResolvedValue({ error: null })
    mockSignIn('needs_client_trust')
    renderLogin()
    await fillLoginForm(user)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    await user.click(screen.getByRole('button', { name: 'Volver al inicio de sesión' }))
    expect(reset).toHaveBeenCalledOnce()
    expect((screen.getByLabelText('Correo electrónico') as HTMLInputElement).value).toBe('ana@example.com')
    expect((screen.getByLabelText('Contraseña') as HTMLInputElement).value).toBe('una-clave-segura')
  })

  it('espera a activar la sesión antes de navegar y permite reintentar si falla', async () => {
    const user = userEvent.setup()
    let finish: (value: { error: Error | null }) => void = () => {}
    password.mockResolvedValue({ error: null })
    finalize.mockImplementationOnce(({ navigate }) => {
      navigate({ session: null, decorateUrl })
      return new Promise(resolve => { finish = resolve })
    })
    mockSignIn('complete')
    renderLogin({ from: '/eventos' })
    await fillLoginForm(user)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(screen.queryByRole('heading', { name: 'Eventos privados' })).toBeNull()
    expect(screen.queryByText('Sesión iniciada correctamente')).toBeNull()
    await act(async () => { finish({ error: new Error('activación') }) })
    expect(await screen.findByRole('alertdialog', { name: 'No pudimos iniciar sesión' })).toBeTruthy()
    finalize.mockImplementationOnce(async ({ navigate }) => {
      navigate({ session: null, decorateUrl })
      return { error: null }
    })
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Eventos privados' })).toBeTruthy())
    expect(password).toHaveBeenCalledOnce()
    expect(finalize).toHaveBeenCalledTimes(2)
  })

  it('muestra los errores de contraseña y conexión', async () => {
    const user = userEvent.setup()
    password.mockResolvedValueOnce({
      error: { errors: [{ code: 'form_password_incorrect' }] },
    })
    renderLogin()
    await fillLoginForm(user)
    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    )
    expect(
      await screen.findByText('El correo o la contraseña no son correctos. Revisa tus datos e inténtalo de nuevo.'),
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
      await screen.findByRole('alertdialog', {
        name: 'Sin conexión',
      }),
    ).toBeTruthy()
  })

  it.each(['form_password_incorrect', 'form_identifier_not_found'])('permite corregir %s sin afirmar que la cuenta no existe', async code => {
    const user = userEvent.setup()
    password.mockResolvedValue({ error: { errors: [{ code }] } })
    renderLogin()
    await fillLoginForm(user)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByText('El correo o la contraseña no son correctos. Revisa tus datos e inténtalo de nuevo.')).toBeTruthy()
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(document.activeElement).toBe(screen.getByLabelText('Contraseña'))
    expect((screen.getByLabelText('Correo electrónico') as HTMLInputElement).value).toBe('ana@example.com')
  })

  it.each(['too_many_requests', 'internal_clerk_error'])('no atribuye %s a las credenciales', async code => {
    const user = userEvent.setup()
    password.mockResolvedValue({ error: { errors: [{ code }] } })
    renderLogin()
    await fillLoginForm(user)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByRole('alertdialog', { name: 'No pudimos iniciar sesión' })).toBeTruthy()
    expect(screen.queryByText('No encontramos tu cuenta')).toBeNull()
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
          decorateUrl,
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
      await screen.findByRole('alertdialog', {
        name: 'No pudimos iniciar sesión',
      }),
    ).toBeTruthy()
  })

  it('muestra errores del flujo de Google', async () => {
    const user = userEvent.setup()
    sso.mockResolvedValueOnce({
      error: new Error('oauth'),
    }).mockResolvedValueOnce({
      error: null,
    })
    renderLogin()
    const googleButton = screen.getByRole(
      'button',
      { name: 'Continuar con Google' },
    )
    await user.click(googleButton)
    expect(
      await screen.findByRole('alertdialog', {
        name: 'No pudimos iniciar sesión',
      }),
    ).toBeTruthy()

    await user.click(
      screen.getByRole('button', {
        name: 'Intentar de nuevo',
      }),
    )

    expect(sso).toHaveBeenCalledTimes(2)
    expect(password).not.toHaveBeenCalled()

    sso.mockResolvedValueOnce({
      error: new Error('oauth'),
    })
    await user.click(googleButton)
    await user.click(
      screen.getByRole('button', {
        name: 'Cerrar',
      }),
    )

    sso.mockRejectedValueOnce(new Error('red'))
    await user.click(googleButton)
    expect(
      await screen.findByRole('alertdialog', {
        name: 'Sin conexión',
      }),
    ).toBeTruthy()
  })

  it('inicia la recuperación de contraseña con el correo escrito', async () => {
    const user = userEvent.setup()
    create.mockResolvedValue({
      error: null,
    })
    sendRecoveryCode.mockResolvedValue({
      error: null,
    })
    renderLogin()

    await user.type(
      screen.getByLabelText(
        'Correo electrónico',
      ),
      'ana@example.com',
    )
    await user.click(
      screen.getByRole('button', {
        name: '¿Olvidaste tu contraseña?',
      }),
    )

    expect(create).toHaveBeenCalledWith({
      identifier: 'ana@example.com',
    })
    expect(
      sendRecoveryCode,
    ).toHaveBeenCalledOnce()
    expect(
      await screen.findByLabelText(
        'Código de verificación',
      ),
    ).toBeTruthy()

    await user.click(
      screen.getByRole('button', {
        name: 'Volver al inicio de sesión',
      }),
    )
    expect(
      screen.getByRole('button', {
        name: 'Iniciar sesión',
      }),
    ).toBeTruthy()
  })

  it('valida el correo y los errores al iniciar la recuperación', async () => {
    const user = userEvent.setup()
    create
      .mockResolvedValueOnce({
        error: new Error('identificador'),
      })
      .mockResolvedValueOnce({ error: null })
      .mockRejectedValueOnce(new Error('red'))
    sendRecoveryCode.mockResolvedValueOnce({
      error: new Error('envío'),
    })
    renderLogin()

    const email = screen.getByLabelText(
      'Correo electrónico',
    )
    const recoveryButton = screen.getByRole(
      'button',
      { name: '¿Olvidaste tu contraseña?' },
    )

    await user.click(recoveryButton)
    expect(
      screen.getByText(
        'Ingresa tu correo electrónico.',
      ),
    ).toBeTruthy()
    expect(document.activeElement).toBe(email)

    await user.type(email, 'correo-invalido')
    await user.click(recoveryButton)
    expect(
      screen.getByText(
        'Ingresa una dirección de correo válida.',
      ),
    ).toBeTruthy()

    await user.clear(email)
    await user.type(email, 'ana@example.com')
    await user.click(recoveryButton)
    expect(
      await screen.findByText(
        'No pudimos iniciar la recuperación. Verifica el correo e inténtalo de nuevo.',
      ),
    ).toBeTruthy()

    await user.click(recoveryButton)
    expect(
      await screen.findByText(
        'No pudimos enviar el código de recuperación. Inténtalo de nuevo.',
      ),
    ).toBeTruthy()

    await user.click(recoveryButton)
    expect(
      await screen.findByText(
        'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.',
      ),
    ).toBeTruthy()
  })

  it('verifica el código y actualiza la contraseña', async () => {
    const user = userEvent.setup()
    create.mockResolvedValue({ error: null })
    sendRecoveryCode.mockResolvedValue({ error: null })
    verifyRecoveryCode.mockResolvedValue({ error: null })
    submitRecoveryPassword.mockResolvedValue({ error: null })
    finalize.mockImplementation(
      async ({ navigate }) => {
        navigate({
          session: null,
          decorateUrl,
        })
        return { error: null }
      },
    )
    renderLogin({ from: '/eventos' })

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'ana@example.com',
    )
    await user.click(
      screen.getByRole('button', {
        name: '¿Olvidaste tu contraseña?',
      }),
    )

    const codeInput = await screen.findByLabelText(
      'Código de verificación',
    )
    await user.type(codeInput, '123')
    await user.click(
      screen.getByRole('button', {
        name: 'Verificar código',
      }),
    )
    expect(
      screen.getByText(
        'Ingresa el código de 6 dígitos que enviamos a tu correo.',
      ),
    ).toBeTruthy()

    expect(codeInput.getAttribute('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(codeInput)
    expect(codeInput.getAttribute('aria-describedby')).toContain('login-recovery-error')
    await user.click(screen.getByRole('button', { name: 'Verificar código' }))
    expect(document.activeElement).toBe(codeInput)
    await user.clear(codeInput)
    await user.type(codeInput, '123456')
    await user.click(
      screen.getByRole('button', {
        name: 'Verificar código',
      }),
    )
    expect(verifyRecoveryCode).toHaveBeenCalledWith({
      code: '123456',
    })

    const newPassword =
      await screen.findByLabelText(
        'Nueva contraseña',
      )
    expect(
      newPassword.getAttribute('minlength'),
    ).toBe('15')
    await user.type(newPassword, 'corta')
    await user.click(
      screen.getByRole('button', {
        name: 'Actualizar contraseña',
      }),
    )
    expect(
      screen.getByText(
        'La nueva contraseña debe tener al menos 15 caracteres.',
      ),
    ).toBeTruthy()

    expect(newPassword.getAttribute('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(newPassword)
    await user.clear(newPassword)
    await user.type(
      newPassword,
      '123456789012345',
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Actualizar contraseña',
      }),
    )

    expect(
      submitRecoveryPassword,
    ).toHaveBeenCalledWith({
      password: '123456789012345',
      signOutOfOtherSessions: true,
    })
    expect(finalize).toHaveBeenCalledOnce()
    expect(decorateUrl).toHaveBeenCalledWith(
      '/eventos',
    )
    expect(
      await screen.findByRole('heading', {
        name: 'Eventos privados',
      }),
    ).toBeTruthy()
  })

  it('informa errores al verificar y actualizar la contraseña', async () => {
    const user = userEvent.setup()
    create.mockResolvedValue({ error: null })
    sendRecoveryCode.mockResolvedValue({ error: null })
    verifyRecoveryCode
      .mockResolvedValueOnce({
        error: new Error('código'),
      })
      .mockRejectedValueOnce(new Error('red'))
      .mockResolvedValueOnce({ error: null })
    submitRecoveryPassword
      .mockResolvedValueOnce({
        error: new Error('contraseña'),
      })
      .mockRejectedValueOnce(new Error('red'))
      .mockResolvedValueOnce({ error: null })
    finalize.mockResolvedValue({
      error: new Error('sesión'),
    })
    renderLogin()

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'ana@example.com',
    )
    await user.click(
      screen.getByRole('button', {
        name: '¿Olvidaste tu contraseña?',
      }),
    )
    const codeInput = await screen.findByLabelText(
      'Código de verificación',
    )
    await user.type(codeInput, '123456')
    const verifyButton = screen.getByRole(
      'button',
      { name: 'Verificar código' },
    )

    await user.click(verifyButton)
    expect(
      await screen.findByText(
        'El código no es válido o ya expiró.',
      ),
    ).toBeTruthy()

    await user.click(verifyButton)
    expect(
      await screen.findByText(
        'No pudimos verificar el código. Inténtalo de nuevo.',
      ),
    ).toBeTruthy()

    await user.click(verifyButton)
    const newPassword =
      await screen.findByLabelText(
        'Nueva contraseña',
      )
    await user.type(
      newPassword,
      'nueva-clave-segura',
    )
    const updateButton = screen.getByRole(
      'button',
      { name: 'Actualizar contraseña' },
    )

    await user.click(updateButton)
    expect(
      await screen.findByText(
        'No pudimos actualizar la contraseña. Revisa los requisitos e inténtalo de nuevo.',
      ),
    ).toBeTruthy()

    await user.click(updateButton)
    expect(
      await screen.findByText(
        'No pudimos actualizar la contraseña. Inténtalo de nuevo.',
      ),
    ).toBeTruthy()

    await user.click(updateButton)
    expect(
      await screen.findByRole('alertdialog', { name: 'No pudimos iniciar sesión' }),
    ).toBeTruthy()
  })
  it('espera la activación tras recuperar y reintenta solo la sesión si falla', async () => {
    const user = userEvent.setup()
    create.mockResolvedValue({ error: null })
    sendRecoveryCode.mockResolvedValue({ error: null })
    verifyRecoveryCode.mockResolvedValue({ error: null })
    submitRecoveryPassword.mockResolvedValue({ error: null })
    let finish!: (result: { error: Error | null }) => void
    finalize.mockImplementationOnce(({ navigate }) => {
      navigate({ session: null, decorateUrl })
      return new Promise(resolve => { finish = resolve })
    })
    renderLogin({ from: '/eventos' })
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }))
    await user.type(await screen.findByLabelText('Código de verificación'), '123456')
    await user.click(screen.getByRole('button', { name: 'Verificar código' }))
    await user.type(await screen.findByLabelText('Nueva contraseña'), 'Una contraseña segura 2026')
    await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }))
    expect(screen.queryByRole('heading', { name: 'Eventos privados' })).toBeNull()
    await act(async () => finish({ error: new Error('sesión') }))
    expect(await screen.findByRole('alertdialog', { name: 'No pudimos iniciar sesión' })).toBeTruthy()
    finalize.mockImplementationOnce(async ({ navigate }) => {
      navigate({ session: null, decorateUrl })
      return { error: null }
    })
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByRole('heading', { name: 'Eventos privados' })).toBeTruthy()
    expect(submitRecoveryPassword).toHaveBeenCalledOnce()
    expect(finalize).toHaveBeenCalledTimes(2)
  })

  it.each(['needs_second_factor', 'needs_client_trust'])('respeta %s después de recuperar la contraseña', async status => {
    const user = userEvent.setup()
    create.mockResolvedValue({ error: null })
    sendRecoveryCode.mockResolvedValue({ error: null })
    verifyRecoveryCode.mockResolvedValue({ error: null })
    submitRecoveryPassword.mockImplementation(async () => {
      signInStatus = status
      return { error: null }
    })
    renderLogin()
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }))
    await user.type(await screen.findByLabelText('Código de verificación'), '123456')
    await user.click(screen.getByRole('button', { name: 'Verificar código' }))
    await user.type(await screen.findByLabelText('Nueva contraseña'), 'Una contraseña segura 2026')
    await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }))
    expect(await screen.findByRole('heading', { name: 'Verifica tu acceso' })).toBeTruthy()
    expect(finalize).not.toHaveBeenCalled()
    expect(screen.queryByRole('heading', { name: 'Eventos privados' })).toBeNull()
  })

})
