import {
  EyeOff,
} from 'lucide-react'

import {
  useRef,
  useState,
  type FormEvent,
} from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router'

import { useSignIn } from '@clerk/react'

import {
  NEW_PASSWORD_MIN_LENGTH_ERROR,
  PASSWORD_MIN_LENGTH,
} from '@/features/auth/auth.constants'

import { AuthBrandPanel } from '@/features/auth/components/AuthBrandPanel'
import { AuthFeedbackModal } from '@/features/auth/components/AuthFeedbackModal'
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark'
import { AuthRouteLink } from '@/features/auth/components/AuthRouteLink'

import { isValidEmail } from '@/features/auth/utils/isValidEmail'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import eyeIcon from '@/assets/auth/eye.svg'
import googleLogo from '@/assets/auth/google.svg'
import lockIcon from '@/assets/auth/lock.svg'

type LoginFeedback =
  | 'general-error'
  | 'network-error'
  | 'invalid-credentials'
  | 'success'
  | 'account-created'
  | null

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

  const [
    email,
    setEmail,
  ] = useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    emailError,
    setEmailError,
  ] = useState('')

  const [
    passwordError,
    setPasswordError,
  ] = useState('')

  const [
    generalError,
    setGeneralError,
  ] = useState('')

  const [
    feedback,
    setFeedback,
  ] =
    useState<LoginFeedback>(
      accountCreated
        ? 'account-created'
        : null,
    )

  const [
    recoveryStep,
    setRecoveryStep,
  ] = useState<
    'code' | 'password' | null
  >(null)

  const [
    recoveryCode,
    setRecoveryCode,
  ] = useState('')

  const [
    newPassword,
    setNewPassword,
  ] = useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const emailInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const passwordInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const isLoading =
    fetchStatus === 'fetching'

  const validate = () => {
    let isValid = true

    setEmailError('')
    setPasswordError('')
    setGeneralError('')
    setFeedback(null)

    if (!email.trim()) {
      setEmailError(
        'Ingresa tu correo electrónico.',
      )

      isValid = false
    } else if (
      !isValidEmail(email)
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
        !isValidEmail(email)

      if (emailIsInvalid) {
        emailInputRef.current
          ?.focus()
      } else {
        passwordInputRef.current
          ?.focus()
      }
    }

    return isValid
  }

  const finalizeSuccessfulLogin =
    async () => {
      setFeedback(null)

      let finalizeError:
        | Error
        | null

      try {
        const result =
          await signIn.finalize({
            navigate: ({
              session,
              decorateUrl,
            }) => {
              if (
                session?.currentTask
              ) {
                setFeedback(
                  'general-error',
                )

                return
              }

              sessionStorage.removeItem(
                'accountCreated',
              )

              const url =
                decorateUrl(
                  destination,
                )

              if (
                url.startsWith(
                  'http',
                )
              ) {
                window.location.href =
                  url

                return
              }

              navigate(
                url,
                {
                  replace: true,
                },
              )
            },
          })

        finalizeError =
          result.error
      } catch {
        setFeedback(
          'general-error',
        )

        return
      }

      if (finalizeError) {
        setFeedback(
          'general-error',
        )
      }
    }

  const performLogin =
    async () => {
      setGeneralError('')
      setFeedback(null)

      let error:
        | Error
        | null

      try {
        const result =
          await signIn.password({
            emailAddress:
              email.trim(),
            password,
          })

        error = result.error
      } catch {
        setFeedback(
          'network-error',
        )

        return
      }

      if (error) {
        setFeedback(
          'invalid-credentials',
        )

        return
      }

      if (
        signIn.status ===
        'complete'
      ) {
        setFeedback(
          'success',
        )

        return
      }

      if (
        signIn.status ===
        'needs_second_factor'
      ) {
        setFeedback(
          'general-error',
        )

        return
      }

      if (
        signIn.status ===
        'needs_client_trust'
      ) {
        setFeedback(
          'general-error',
        )

        return
      }

      setFeedback(
        'general-error',
      )
    }

  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    await performLogin()
  }

  const handleGoogleSignIn =
    async () => {
      setGeneralError('')
      setFeedback(null)

      try {
        const { error } =
          await signIn.sso({
            strategy:
              'oauth_google',

            redirectUrl:
              `${window.location.origin}${destination}`,

            redirectCallbackUrl:
              `${window.location.origin}/`,
          })

        if (error) {
          setFeedback(
            'general-error',
          )
        }
      } catch {
        setFeedback(
          'network-error',
        )
      }
    }

  const handleStartPasswordRecovery =
    async () => {
      setEmailError('')
      setGeneralError('')
      setFeedback(null)

      if (!email.trim()) {
        setEmailError(
          'Ingresa tu correo electrónico.',
        )

        emailInputRef.current
          ?.focus()

        return
      }

      if (
        !isValidEmail(email)
      ) {
        setEmailError(
          'Ingresa una dirección de correo válida.',
        )

        emailInputRef.current
          ?.focus()

        return
      }

      try {
        const createResult =
          await signIn.create({
            identifier:
              email.trim(),
          })

        if (
          createResult.error
        ) {
          setGeneralError(
            'No pudimos iniciar la recuperación. Verifica el correo e inténtalo de nuevo.',
          )

          return
        }

        const sendResult =
          await signIn
            .resetPasswordEmailCode
            .sendCode()

        if (
          sendResult.error
        ) {
          setGeneralError(
            'No pudimos enviar el código de recuperación. Inténtalo de nuevo.',
          )

          return
        }

        setRecoveryStep(
          'code',
        )
      } catch {
        setGeneralError(
          'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.',
        )
      }
    }

  const handlePasswordRecovery =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      setGeneralError('')

      if (
        recoveryStep === 'code'
      ) {
        if (
          !/^\d{6}$/.test(
            recoveryCode.trim(),
          )
        ) {
          setGeneralError(
            'Ingresa el código de 6 dígitos que enviamos a tu correo.',
          )

          return
        }

        try {
          const result =
            await signIn
              .resetPasswordEmailCode
              .verifyCode({
                code:
                  recoveryCode.trim(),
              })

          if (result.error) {
            setGeneralError(
              'El código no es válido o ya expiró.',
            )

            return
          }

          setRecoveryStep(
            'password',
          )
        } catch {
          setGeneralError(
            'No pudimos verificar el código. Inténtalo de nuevo.',
          )
        }

        return
      }

      if (
        newPassword.length <
        PASSWORD_MIN_LENGTH
      ) {
        setGeneralError(
          NEW_PASSWORD_MIN_LENGTH_ERROR,
        )

        return
      }

      try {
        const result =
          await signIn
            .resetPasswordEmailCode
            .submitPassword({
              password:
                newPassword,

              signOutOfOtherSessions:
                true,
            })

        if (result.error) {
          setGeneralError(
            'No pudimos actualizar la contraseña. Revisa los requisitos e inténtalo de nuevo.',
          )

          return
        }

        const finalizeResult =
          await signIn.finalize({
            navigate: ({
              decorateUrl,
            }) => {
              const url =
                decorateUrl(
                  destination,
                )

              if (
                url.startsWith(
                  'http',
                )
              ) {
                window.location.href =
                  url

                return
              }

              navigate(
                url,
                {
                  replace: true,
                },
              )
            },
          })

        if (
          finalizeResult.error
        ) {
          setGeneralError(
            'La contraseña se actualizó, pero no pudimos activar la sesión.',
          )
        }
      } catch {
        setGeneralError(
          'No pudimos actualizar la contraseña. Inténtalo de nuevo.',
        )
      }
    }

  return (
    <main className="auth-page flex min-h-svh bg-[#f7f8fc]">
      <AuthBrandPanel />

      <section className="auth-form-shell flex min-h-svh min-w-0 flex-1 items-center justify-center px-4 py-4 sm:px-6 min-[1360px]:px-[clamp(24px,2.4vw,50px)] min-[1360px]:py-12">
        <div className="auth-card flex w-full max-w-[516px] flex-col rounded-[22px] border border-[#dde2ea] bg-white px-5 pb-5 pt-[23px] shadow-[0_10px_28px_rgba(23,33,43,0.08)] sm:px-[38px] md:w-[516px] md:flex-none">

          {/* Logo superior */}
          <div className="flex items-center gap-3">
            <AuthLogoMark
              size="small"
            />

            <span className="text-2xl font-semibold tracking-[-0.02em] text-[#17212b]">
              Eventger
            </span>
          </div>

          <div className="auth-card__content flex flex-1 flex-col">
            <div className="auth-card__intro mt-[60px]">
              <h1 className="text-pretty text-[34px] font-bold leading-[1.15] tracking-[-0.03em] text-[#17212b]">
                {recoveryStep
                  ? 'Recupera tu cuenta'
                  : 'Bienvenido de nuevo'}
              </h1>

              <p className="mt-2 text-[13px] text-[#667085]">
                {recoveryStep ? (
                  recoveryStep ===
                  'code'
                    ? `Escribe el código enviado a ${email.trim()}.`
                    : 'Crea una contraseña nueva para continuar.'
                ) : (
                  <>
                    ¿No tienes una cuenta?{' '}

                    <AuthRouteLink
                      to="/crear-cuenta"
                      direction="forward"
                      className="rounded-sm font-semibold text-[#4f46e5] hover:text-[#3730a3] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
                    >
                      Crear cuenta
                    </AuthRouteLink>
                  </>
                )}
              </p>
            </div>

            {recoveryStep ? (
              <form
                onSubmit={
                  handlePasswordRecovery
                }
                className="auth-card__form mt-10"
                noValidate
              >
                <label
                  htmlFor="login-recovery"
                  className="text-[12px] font-medium text-[#17212b]"
                >
                  {recoveryStep ===
                  'code'
                    ? 'Código de verificación'
                    : 'Nueva contraseña'}
                </label>

                <Input
                  id="login-recovery"
                  type={
                    recoveryStep ===
                    'code'
                      ? 'text'
                      : 'password'
                  }
                  inputMode={
                    recoveryStep ===
                    'code'
                      ? 'numeric'
                      : undefined
                  }
                  autoComplete={
                    recoveryStep ===
                    'code'
                      ? 'one-time-code'
                      : 'new-password'
                  }
                  maxLength={
                    recoveryStep ===
                    'code'
                      ? 6
                      : undefined
                  }
                  minLength={
                    recoveryStep ===
                    'password'
                      ? PASSWORD_MIN_LENGTH
                      : undefined
                  }
                  value={
                    recoveryStep ===
                    'code'
                      ? recoveryCode
                      : newPassword
                  }
                  onChange={(
                    event,
                  ) => {
                    if (
                      recoveryStep ===
                      'code'
                    ) {
                      setRecoveryCode(
                        event.target.value.replace(
                          /\D/g,
                          '',
                        ),
                      )
                    } else {
                      setNewPassword(
                        event.target.value,
                      )
                    }

                    setGeneralError(
                      '',
                    )
                  }}
                  disabled={
                    isLoading
                  }
                  autoFocus
                  className="mt-2 h-11 rounded-[10px] px-3 text-[13px]"
                />

                {generalError && (
                  <div
                    className="mt-4 rounded-[8px] border border-[#fecdca] bg-[#fef3f2] px-3 py-2"
                    role="alert"
                  >
                    <p className="text-[11px] leading-4 text-[#b42318]">
                      {generalError}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={
                    isLoading
                  }
                  className="mt-6 h-11 w-full rounded-[10px] bg-[#4f46e5] text-[13px] font-semibold text-white hover:bg-[#4338ca]"
                >
                  {recoveryStep ===
                  'code'
                    ? 'Verificar código'
                    : 'Actualizar contraseña'}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setRecoveryStep(
                      null,
                    )

                    setRecoveryCode(
                      '',
                    )

                    setNewPassword(
                      '',
                    )

                    setGeneralError(
                      '',
                    )
                  }}
                  className="mt-5 w-full rounded-sm text-[12px] font-semibold text-[#4f46e5] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
                >
                  Volver al inicio de sesión
                </button>
              </form>
            ) : (
              <form
                onSubmit={
                  handleSubmit
                }
                className="auth-card__form mt-10"
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
                    ref={
                      emailInputRef
                    }
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    spellCheck={
                      false
                    }
                    placeholder="nombre@correo.com"
                    value={email}
                    disabled={
                      isLoading
                    }
                    required
                    aria-invalid={
                      Boolean(
                        emailError,
                      )
                    }
                    aria-describedby={
                      emailError
                        ? 'login-email-error'
                        : undefined
                    }
                    onChange={(
                      event,
                    ) => {
                      setEmail(
                        event.target.value,
                      )

                      setEmailError(
                        '',
                      )

                      setGeneralError(
                        '',
                      )

                      setFeedback(
                        null,
                      )
                    }}
                    className={`mt-2 h-11 rounded-[10px] px-3 text-[13px] ${
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
                <div className="mt-7">
                  <label
                    htmlFor="login-password"
                    className="text-[12px] font-medium text-[#17212b]"
                  >
                    Contraseña
                  </label>

                  <div className="relative mt-2">
                    <img
                      src={
                        lockIcon
                      }
                      alt=""
                      className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                    />

                    <Input
                      ref={
                        passwordInputRef
                      }
                      id="login-password"
                      name="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={
                        password
                      }
                      disabled={
                        isLoading
                      }
                      autoComplete="current-password"
                      required
                      aria-invalid={
                        Boolean(
                          passwordError,
                        )
                      }
                      aria-describedby={
                        passwordError
                          ? 'login-password-error'
                          : undefined
                      }
                      onChange={(
                        event,
                      ) => {
                        setPassword(
                          event.target.value,
                        )

                        setPasswordError(
                          '',
                        )

                        setGeneralError(
                          '',
                        )

                        setFeedback(
                          null,
                        )
                      }}
                      className={`h-11 rounded-[10px] pl-10 pr-11 text-[13px] ${
                        passwordError
                          ? 'border-[#d92d20]'
                          : ''
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            current,
                          ) =>
                            !current,
                        )
                      }
                      className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-[#667085] hover:text-[#3730a3] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#4f46e5] sm:size-10"
                      aria-label={
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                      aria-pressed={
                        showPassword
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={
                            20
                          }
                          aria-hidden="true"
                        />
                      ) : (
                        <img
                          src={
                            eyeIcon
                          }
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

                  <div className="mt-[9px] flex justify-end">
                    <button
                      type="button"
                      onClick={
                        handleStartPasswordRecovery
                      }
                      className="inline-flex min-h-11 items-center rounded-sm px-1 text-[12px] font-semibold text-[#4f46e5] hover:text-[#3730a3] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading
                  }
                  className="mt-[29px] h-11 w-full rounded-[10px] bg-[#4f46e5] text-[13px] font-semibold text-white hover:bg-[#4338ca] focus-visible:ring-[#4f46e5]/30"
                >
                  {isLoading
                    ? 'Iniciando sesión…'
                    : 'Iniciar sesión'}
                </Button>

                <div className="mt-[29px] flex items-center gap-4">
                  <div className="h-px flex-1 bg-[#dde2ea]" />

                  <span className="text-[11px] text-[#667085]">
                    o continúa con
                  </span>

                  <div className="h-px flex-1 bg-[#dde2ea]" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    isLoading
                  }
                  onClick={
                    handleGoogleSignIn
                  }
                  className="mt-5 h-11 w-full rounded-[10px] border-[#dde2ea] text-[13px] font-semibold text-[#17212b] hover:border-[#c7d2fe] hover:bg-[#f7f8fc]"
                >
                  <img
                    src={
                      googleLogo
                    }
                    alt=""
                    className="mr-2 size-6"
                  />

                  Continuar con Google
                </Button>

                <p className="mt-8 text-left text-[11px] leading-4 text-[#667085]">
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
            )}
          </div>
        </div>
      </section>

      {/* Cuenta creada correctamente */}
      <AuthFeedbackModal
        open={
          feedback ===
          'account-created'
        }
        variant="success"
        title="Cuenta creada correctamente"
        description="Tu cuenta está lista. Ya puedes iniciar sesión con tu correo y contraseña."
        secondaryLabel="Cerrar"
        primaryLabel="Iniciar sesión"
        onSecondary={() => {
          sessionStorage.removeItem(
            'accountCreated',
          )

          setFeedback(
            null,
          )
        }}
        onPrimary={() => {
          sessionStorage.removeItem(
            'accountCreated',
          )

          setFeedback(
            null,
          )

          emailInputRef.current
            ?.focus()
        }}
      />

      {/* Error general */}
      <AuthFeedbackModal
        open={
          feedback ===
          'general-error'
        }
        variant="error"
        title="No pudimos iniciar sesión"
        description="Ocurrió un problema al iniciar sesión. Conservamos tus datos para que puedas revisarlos e intentarlo nuevamente."
        secondaryLabel="Cerrar"
        primaryLabel="Intentar de nuevo"
        onSecondary={() =>
          setFeedback(null)
        }
        onPrimary={() => {
          void performLogin()
        }}
      />

      {/* Sin conexión */}
      <AuthFeedbackModal
        open={
          feedback ===
          'network-error'
        }
        variant="error"
        title="Sin conexión"
        description="Revisa tu conexión a internet e inténtalo nuevamente."
        secondaryLabel="Cerrar"
        primaryLabel="Reintentar"
        onSecondary={() =>
          setFeedback(null)
        }
        onPrimary={() => {
          void performLogin()
        }}
      />

      {/* Credenciales inválidas */}
      <AuthFeedbackModal
        open={
          feedback ===
          'invalid-credentials'
        }
        variant="error"
        title="Credenciales inválidas"
        description="No pudimos iniciar sesión con las credenciales ingresadas. Verifica tu correo y contraseña e inténtalo nuevamente."
        secondaryLabel="Cerrar"
        primaryLabel="Intentar de nuevo"
        onSecondary={() =>
          setFeedback(null)
        }
        onPrimary={() => {
          setFeedback(null)

          passwordInputRef.current
            ?.focus()
        }}
      />

      {/* Login exitoso */}
      <AuthFeedbackModal
        open={
          feedback ===
          'success'
        }
        variant="success"
        title="Sesión iniciada correctamente"
        description="Todo está listo. Puedes continuar al organizador de eventos."
        secondaryLabel="Cerrar"
        primaryLabel="Continuar"
        onSecondary={() =>
          setFeedback(null)
        }
        onPrimary={() => {
          void finalizeSuccessfulLogin()
        }}
      />
    </main>
  )
}