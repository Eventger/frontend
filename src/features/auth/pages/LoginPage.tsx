import {
  EyeOff,
} from 'lucide-react'

import {
  useRef,
  useState,
  type FormEvent,
} from 'react'

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router'

import { useSignIn } from '@clerk/react'

import { AuthBrandPanel } from '@/features/auth/components/AuthBrandPanel'
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import eyeIcon from '@/assets/auth/eye.svg'
import googleLogo from '@/assets/auth/google.svg'
import lockIcon from '@/assets/auth/lock.svg'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const requestedPath = (
    location.state as {
      from?: unknown
    } | null
  )?.from
  const destination =
    typeof requestedPath === 'string' &&
    requestedPath.startsWith('/') &&
    !requestedPath.startsWith('//')
      ? requestedPath
      : '/hoy'
  const accountCreated =
    sessionStorage.getItem(
      'accountCreated',
    ) === 'true'
  const {
    signIn,
    fetchStatus,
  } = useSignIn()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [emailError, setEmailError] =
    useState('')

  const [
    passwordError,
    setPasswordError,
  ] = useState('')

  const [
    generalError,
    setGeneralError,
  ] = useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)
  const emailInputRef =
    useRef<HTMLInputElement>(null)
  const passwordInputRef =
    useRef<HTMLInputElement>(null)

  const isLoading =
    fetchStatus === 'fetching'

  const validate = () => {
    let isValid = true

    setEmailError('')
    setPasswordError('')
    setGeneralError('')

    if (!email.trim()) {
      setEmailError(
        'Ingresa tu correo electrónico.',
      )
      isValid = false
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      setEmailError(
        'Ingresa una dirección de correo válida.',
      )
      isValid = false
    }

    if (!password) {
      setPasswordError(
        'Ingresa tu contraseña.',
      )
      isValid = false
    }

    if (!isValid) {
      const emailIsInvalid =
        !email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email,
        )

      if (emailIsInvalid) {
        emailInputRef.current?.focus()
      } else {
        passwordInputRef.current?.focus()
      }
    }

    return isValid
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    let error: Error | null

    try {
      const result =
        await signIn.password({
          emailAddress: email.trim(),
          password,
        })

      error = result.error
    } catch {
      setGeneralError(
        'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.',
      )
      return
    }

    if (error) {
      setGeneralError(
        'No pudimos iniciar sesión. Verifica tus datos e inténtalo de nuevo.',
      )

      return
    }

    if (
      signIn.status === 'complete'
    ) {
      let finalizeError: Error | null

      try {
        const result =
          await signIn.finalize({
            navigate: ({
              session,
            }) => {
              if (
                session?.currentTask
              ) {
                setGeneralError(
                  'Completa la verificación pendiente para continuar.',
                )
                return
              }
              sessionStorage.removeItem(
                'accountCreated',
              )
              navigate(destination, {
                replace: true,
              })
            },
          })

        finalizeError = result.error
      } catch {
        setGeneralError(
          'La sesión se creó, pero no pudimos activarla. Inténtalo de nuevo.',
        )
        return
      }

      if (finalizeError) {
        setGeneralError(
          'La sesión se creó, pero no pudimos activarla. Inténtalo de nuevo.',
        )
      }

      return
    }

    if (
      signIn.status ===
      'needs_second_factor'
    ) {
      setGeneralError(
        'Tu cuenta requiere una verificación adicional.',
      )
      return
    }

    if (
      signIn.status ===
      'needs_client_trust'
    ) {
      setGeneralError(
        'Clerk requiere verificar este dispositivo antes de continuar.',
      )
      return
    }

    setGeneralError(
      'No fue posible completar el inicio de sesión.',
    )
  }

  const handleGoogleSignIn = async () => {
    setGeneralError('')

    try {
      const { error } = await signIn.sso({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}${destination}`,
        redirectCallbackUrl: `${window.location.origin}/`,
      })

      if (error) {
        setGeneralError(
          'No pudimos iniciar sesión con Google. Inténtalo de nuevo.',
        )
      }
    } catch {
      setGeneralError(
        'No pudimos conectarnos con Google. Revisa tu conexión e inténtalo de nuevo.',
      )
    }
  }

  return (
    <main className="flex min-h-svh bg-[#f7f8fc] sm:h-svh sm:overflow-hidden">
      <AuthBrandPanel />

      <section className="flex min-h-svh min-w-0 flex-1 items-center justify-center px-4 py-2 sm:h-full sm:min-h-0 sm:px-6 sm:py-0">
        <div className="auth-card flex w-full max-w-[500px] flex-col rounded-2xl border border-[#dde2ea] bg-white px-5 py-4 shadow-[0_10px_28px_rgba(23,33,43,0.08)] sm:min-h-[598px] sm:px-8">

          {/* Logo superior */}
          <div className="flex items-center gap-3">
            <AuthLogoMark size="small" />

            <span className="text-2xl font-semibold tracking-[-0.02em] text-[#17212b]">
              Eventger
            </span>
          </div>

          <div className="auth-card__intro mt-4">
            <h1 className="text-pretty text-[28px] font-bold tracking-[-0.025em] text-[#17212b]">
              Bienvenido de nuevo
            </h1>

            <p className="mt-1 text-[13px] text-[#667085]">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/crear-cuenta"
                className="rounded-sm font-medium text-[#4f46e5] hover:text-[#3730a3] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
              >
                Crear cuenta
              </Link>
            </p>

            {/* Mensaje después de crear cuenta */}
            {accountCreated && (
              <div
                className="mt-4 rounded-[8px] border border-[#abefc6] bg-[#ecfdf3] px-4 py-3"
                role="status"
              >
                <p className="text-[12px] font-semibold text-[#067647]">
                  Cuenta creada correctamente.
                </p>

                <p className="mt-1 text-[11px] text-[#475467]">
                  Ya puedes iniciar sesión con tu correo y contraseña.
                </p>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-card__form mt-3 flex flex-1 flex-col gap-4 sm:justify-between"
            noValidate
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-[12px] font-medium text-[#17212b]"
              >
                Correo electrónico
              </label>

              <Input
                ref={emailInputRef}
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="nombre@correo.com…"
                value={email}
                disabled={isLoading}
                required
                aria-invalid={Boolean(emailError)}
                aria-describedby={
                  emailError
                    ? 'login-email-error'
                    : undefined
                }
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  )

                  setEmailError('')
                  setGeneralError('')
                }}
                className={`h-11 rounded-[10px] px-3 text-[13px] sm:h-10 ${
                  emailError
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />

              {emailError && (
                <p
                  id="login-email-error"
                  className="text-xs text-[#b42318]"
                  role="alert"
                >
                  {emailError}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="text-[12px] font-medium text-[#17212b]"
              >
                Contraseña
              </label>

              <div className="relative">
                <img
                  src={lockIcon}
                  alt=""
                  className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                />

                <Input
                  ref={passwordInputRef}
                  id="login-password"
                  name="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(passwordError)}
                  aria-describedby={
                    passwordError
                      ? 'login-password-error'
                      : undefined
                  }
                  onChange={(event) => {
                    setPassword(
                      event.target.value,
                    )

                    setPasswordError('')
                    setGeneralError('')
                  }}
                  className={`h-11 rounded-[10px] pl-10 pr-11 text-[13px] sm:h-10 ${
                    passwordError
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-[#667085] hover:text-[#3730a3] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#4f46e5] sm:size-10"
                  aria-label={
                    showPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff
                      size={20}
                      aria-hidden="true"
                    />
                  ) : (
                    <img
                      src={eyeIcon}
                      alt=""
                      className="size-5"
                    />
                  )}
                </button>
              </div>

              {passwordError && (
                <p
                  id="login-password-error"
                  className="text-xs text-[#b42318]"
                  role="alert"
                >
                  {passwordError}
                </p>
              )}

            </div>

            {/* Error general */}
            {generalError && (
              <div
                className="rounded-[8px] border border-[#fecdca] bg-[#fef3f2] px-3 py-2"
                role="alert"
                aria-live="polite"
              >
                <p className="text-[11px] leading-4 text-[#b42318]">
                  {generalError}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-[10px] bg-[#4f46e5] text-[13px] font-semibold text-white hover:bg-[#4338ca] focus-visible:ring-[#4f46e5]/30 sm:h-10"
            >
              {isLoading
                ? 'Iniciando sesión…'
                : 'Iniciar sesión'}
            </Button>

            {/* divisor */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#dde2ea]" />

              <span className="text-[11px] text-[#667085]">
                o continúa con
              </span>

              <div className="h-px flex-1 bg-[#dde2ea]" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="h-11 w-full rounded-[10px] border-[#dde2ea] text-[13px] font-semibold text-[#17212b] hover:border-[#c7d2fe] hover:bg-[#f7f8fc] sm:h-10"
            >
              <img
                src={googleLogo}
                alt=""
                className="mr-2 size-6"
              />

              Continuar con Google
            </Button>

            <p className="text-center text-[11px] leading-4 text-[#667085]">
              Al continuar aceptas nuestros{' '}
              <span className="font-semibold text-[#4f46e5] underline underline-offset-2">
                Términos y condiciones
              </span>{' '}
              y la{' '}
              <span className="font-semibold text-[#4f46e5] underline underline-offset-2">
                Política de privacidad.
              </span>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
