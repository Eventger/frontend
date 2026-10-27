import {
  EyeOff,
  LoaderCircle,
  Mail,
} from 'lucide-react'

import {
  useEffect,
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
  PASSWORD_MIN_LENGTH_HINT,
} from '@/features/auth/auth.constants'

import { AuthBrandPanel } from '@/features/auth/components/AuthBrandPanel'
import { AuthFeedbackModal } from '@/features/auth/components/AuthFeedbackModal'
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark'
import { AuthRouteLink } from '@/features/auth/components/AuthRouteLink'
import { SignInVerificationForm } from '@/features/auth/components/SignInVerificationForm'
import { LegalTermsModal, type LegalTab } from '@/features/auth/components/LegalTermsModal'
import { useDocumentTitle } from '@/components/layout/useDocumentTitle'

import { isValidEmail } from '@/features/auth/utils/isValidEmail'
import { getAuthDestination } from '@/features/auth/utils/getAuthDestination'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { cn } from '@/lib/utils'

import eyeIcon from '@/assets/auth/eye.svg'
import googleLogo from '@/assets/auth/google.svg'
import lockIcon from '@/assets/auth/lock.svg'

type LoginFeedback =
  | 'general-error'
  | 'network-error'
  | 'account-created'
  | null

type LoginAttempt =
  | 'password'
  | 'google'
  | 'finalize'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const destination = getAuthDestination(location.state)

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
    lastAttempt,
    setLastAttempt,
  ] = useState<LoginAttempt>(
    'password',
  )

  const [
    recoveryStep,
    setRecoveryStep,
  ] = useState<
    'code' | 'password' | null
  >(null)

  const [verificationStep, setVerificationStep] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

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

  const [credentialsError, setCredentialsError] = useState('')
  const [recoveryError, setRecoveryError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [legalModalOpen, setLegalModalOpen] = useState(false)
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('terms')

  useDocumentTitle('Iniciar sesión · Eventger')
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [signedOutNotice, setSignedOutNotice] = useState(() => {
    if (typeof window === 'undefined') return false
    const wasSignedOut = sessionStorage.getItem('eventger_signed_out') === 'true'
    if (wasSignedOut) {
      sessionStorage.removeItem('eventger_signed_out')
      return true
    }
    return false
  })
  const recoveryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const emailInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const passwordInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const [busy, setBusy] = useState(false)

  const isLoading =
    busy || fetchStatus === 'fetching' || isCompleting

  useEffect(() => {
    if (isLoading) return
    if (recoveryError) recoveryInputRef.current?.focus()
    else if (credentialsError) passwordInputRef.current?.focus()
  }, [credentialsError, recoveryError, isLoading])

  const showRecoveryFieldError = (message: string) => {
    setRecoveryError(message)
    recoveryInputRef.current?.focus()
  }

  const validate = (targetEmail = email.trim()) => {
    let isValid = true

    setEmailError('')
    setPasswordError('')
    setGeneralError('')
    setFeedback(null)

    if (!targetEmail) {
      setEmailError(
        'Ingresa tu correo electrónico.',
      )

      isValid = false
    } else if (
      !isValidEmail(targetEmail)
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
        !targetEmail ||
        !isValidEmail(targetEmail)

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
      setLastAttempt('finalize')
      setFeedback(null)
      setIsCompleting(true)
      let destinationUrl: string | undefined

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
                return
              }
              destinationUrl = decorateUrl(destination)
            },
          })

        if (result.error || !destinationUrl) {
          setFeedback('general-error')
          return
        }

        sessionStorage.removeItem('accountCreated')
        if (destinationUrl.startsWith('http')) {
          try {
            const parsed = new URL(destinationUrl, window.location.origin)
            if (parsed.origin === window.location.origin) {
              window.location.href = parsed.href
            } else {
              navigate('/hoy', { replace: true })
            }
          } catch {
            navigate('/hoy', { replace: true })
          }
        } else {
          navigate(destinationUrl, { replace: true })
        }
      } catch {
        setFeedback(
          'general-error',
        )

      } finally {
        setIsCompleting(false)
      }
    }

  const performLogin =
    async (targetEmail = email.trim()) => {
      if (isLoading) return
      setCredentialsError('')
      setLastAttempt('password')
      setGeneralError('')
      setFeedback(null)
      setSignedOutNotice(false)

      setBusy(true)
      let error:
        | Error
        | null

      try {
        const result =
          await signIn.password({
            emailAddress:
              targetEmail,
            password,
          })

        error = result.error
      } catch {
        setFeedback(
          'network-error',
        )

        return
      } finally {
        setBusy(false)
      }

      if (error) {
        const errors = 'errors' in error && Array.isArray(error.errors) ? error.errors : []
        if (errors.some(item => ['form_password_incorrect', 'form_identifier_not_found'].includes(item.code))) {
          setCredentialsError('El correo o la contraseña no son correctos. Revisa tus datos e inténtalo de nuevo.')
        } else {
          setFeedback('general-error')
        }

        return
      }

      if (
        (signIn.status as string) ===
        'complete'
      ) {
        await finalizeSuccessfulLogin()

        return
      }

      if (
        signIn.status ===
          'needs_second_factor' ||
        signIn.status ===
          'needs_client_trust'
      ) {
        setVerificationStep(true)

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

    const trimmedEmail = email.trim()
    if (trimmedEmail !== email) {
      setEmail(trimmedEmail)
    }

    if (!validate(trimmedEmail)) {
      return
    }

    await performLogin(trimmedEmail)
  }

  const handleGoogleSignIn =
    async () => {
      if (isLoading) return
      setLastAttempt('google')
      setGeneralError('')
      setFeedback(null)
      setBusy(true)

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
      } finally {
        setBusy(false)
      }
    }

  const handleRetryAuthentication =
    () => {
      if (lastAttempt === 'google') {
        void handleGoogleSignIn()

        return
      }

      if (lastAttempt === 'finalize') {
        void finalizeSuccessfulLogin()

        return
      }

      void performLogin()
    }

  const handleStartPasswordRecovery =
    async () => {
      if (isLoading) return
      setCredentialsError('')
      setRecoveryError('')
      setPasswordError('')
      setEmailError('')
      setGeneralError('')
      setFeedback(null)

      const trimmedEmail = email.trim()
      if (trimmedEmail !== email) {
        setEmail(trimmedEmail)
      }

      if (!trimmedEmail) {
        setEmailError(
          'Ingresa tu correo electrónico.',
        )

        emailInputRef.current
          ?.focus()

        return
      }

      if (
        !isValidEmail(trimmedEmail)
      ) {
        setEmailError(
          'Ingresa una dirección de correo válida.',
        )

        emailInputRef.current
          ?.focus()

        return
      }

      setBusy(true)
      try {
        const createResult =
          await signIn.create({
            identifier:
              trimmedEmail,
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
        setResendSuccess(false)
        setResendCooldown(0)
      } catch {
        setGeneralError(
          'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.',
        )
      } finally {
        setBusy(false)
      }
    }

  const handleResendRecoveryCode = async () => {
    if (isLoading || isResending || resendCooldown > 0) return
    setIsResending(true)
    setRecoveryError('')
    setGeneralError('')
    setResendSuccess(false)
    try {
      const sendResult = await signIn.resetPasswordEmailCode.sendCode()
      if (sendResult.error) {
        setGeneralError('No pudimos reenviar el código de recuperación. Inténtalo de nuevo.')
        return
      }
      setResendSuccess(true)
      setResendCooldown(30)
    } catch {
      setGeneralError('No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setIsResending(false)
    }
  }

  const handlePasswordRecovery =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()
      if (isLoading) return
      setRecoveryError('')
      setGeneralError('')

      if (
        recoveryStep ===
        'code'
      ) {
        if (
          !/^\d{6}$/.test(
            recoveryCode.trim(),
          )
        ) {
          showRecoveryFieldError(
            'Ingresa el código de 6 dígitos que enviamos a tu correo.',
          )

          return
        }

        setBusy(true)
        try {
          const result =
            await signIn
              .resetPasswordEmailCode
              .verifyCode({
                code:
                  recoveryCode.trim(),
              })

          if (result.error) {
            showRecoveryFieldError(
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
        } finally {
          setBusy(false)
        }

        return
      }

      if (
        newPassword.length <
        PASSWORD_MIN_LENGTH
      ) {
        showRecoveryFieldError(
          NEW_PASSWORD_MIN_LENGTH_ERROR,
        )

        return
      }

      setBusy(true)
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

        if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
          setRecoveryStep(null)
          setVerificationStep(true)
          return
        }
        await finalizeSuccessfulLogin()
      } catch {
        setGeneralError(
          'No pudimos actualizar la contraseña. Inténtalo de nuevo.',
        )
      } finally {
        setBusy(false)
      }
    }

  return (
    <main className="auth-page flex min-h-svh bg-[#f7f8fc]">
      <AuthBrandPanel />

      <section className="auth-form-shell flex min-h-svh min-w-0 flex-1 items-center justify-center px-4 py-4 sm:px-6 min-[1360px]:px-[clamp(24px,2.4vw,50px)] min-[1360px]:py-12">
        <div className="auth-card flex w-full max-w-[500px] flex-col rounded-[26px] border border-border-subtle bg-white p-7 shadow-[0_10px_32px_rgba(23,33,43,0.06)] sm:p-9 sm:py-8 md:w-[500px] md:flex-none">

          <div className="flex items-center gap-3">
            <AuthLogoMark
              size="small"
            />

            <span className="text-2xl font-semibold tracking-[-0.02em] text-[#17212b]">
              Eventger
            </span>
          </div>

          <div className="auth-card__content flex flex-1 flex-col">
            <div className="auth-card__intro mt-7 sm:mt-8">
              <h1 className="text-pretty text-[32px] sm:text-[34px] font-bold leading-[1.15] tracking-[-0.03em] text-[#17212b]">
                {verificationStep
                  ? 'Verifica tu acceso'
                  : recoveryStep
                  ? 'Recupera tu cuenta'
                  : 'Bienvenido de nuevo'}
              </h1>

              {(verificationStep || recoveryStep) && (
                <p className="mt-2 text-[13px] text-[#667085]">
                  {verificationStep
                    ? 'Confirma tu identidad para completar el inicio de sesión.'
                    : recoveryStep === 'code'
                    ? `Escribe el código enviado a ${email.trim()}.`
                    : 'Crea una contraseña nueva para continuar.'}
                </p>
              )}
            </div>

            {signedOutNotice && !verificationStep && !recoveryStep && (
              <InlineFeedback variant="info" className="mt-4">
                Has cerrado sesión correctamente.
              </InlineFeedback>
            )}

            {verificationStep ? (
              <SignInVerificationForm
                onVerified={finalizeSuccessfulLogin}
                onBack={() => {
                  setVerificationStep(false)
                  setGeneralError('')
                  setFeedback(null)
                }}
              />
            ) : recoveryStep ? (
              <form
                onSubmit={
                  handlePasswordRecovery
                }
                className="auth-card__form mt-10"
                noValidate
              >
                <label
                  htmlFor="login-recovery"
                  className="type-label text-[#17212b]"
                >
                  {recoveryStep ===
                  'code'
                    ? 'Código de verificación'
                    : 'Nueva contraseña'}
                </label>

                <Input
                  key={recoveryStep}
                  ref={recoveryInputRef}
                  id="login-recovery"
                  aria-invalid={Boolean(recoveryError)}
                  aria-describedby={[recoveryStep === 'password' && 'login-recovery-hint', recoveryError && 'login-recovery-error'].filter(Boolean).join(' ') || undefined}
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

                    setRecoveryError('')
                    setGeneralError('')
                  }}
                  disabled={
                    isLoading
                  }
                  autoFocus
                  className={`mt-2 h-11 rounded-xl px-3.5 text-[13px] ${
                    recoveryError
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />

                {recoveryStep === 'password' && <p id="login-recovery-hint" className="mt-2 text-[12px] text-[#667085]">{PASSWORD_MIN_LENGTH_HINT}</p>}
                {recoveryError && <FieldError id="login-recovery-error" className="mt-2">{recoveryError}</FieldError>}

                {(generalError || feedback === 'general-error') && (
                  <InlineFeedback
                    className="mt-4"
                  >
                    <div className="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>{generalError || 'Ocurrió un problema al iniciar sesión. Conservamos tus datos para que puedas revisarlos e intentarlo nuevamente.'}</span>
                      {feedback === 'general-error' && (
                        <button
                          type="button"
                          onClick={handleRetryAuthentication}
                          className="text-xs font-semibold underline hover:no-underline"
                        >
                          Intentar de nuevo
                        </button>
                      )}
                    </div>
                  </InlineFeedback>
                )}

                <Button
                  type="submit"
                  disabled={
                    isLoading
                  }
                  className="mt-6 h-11 w-full rounded-xl bg-[#4f46e5] text-[13px] font-semibold text-white hover:bg-[#4338ca]"
                >
                  {recoveryStep ===
                  'code'
                    ? 'Verificar código'
                    : 'Actualizar contraseña'}
                </Button>

                {recoveryStep === 'code' && (
                  <button
                    type="button"
                    disabled={isLoading || isResending || resendCooldown > 0}
                    onClick={() => void handleResendRecoveryCode()}
                    className="mt-3 w-full rounded-sm text-[12px] font-semibold text-[#4f46e5] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:opacity-50"
                  >
                    {isResending
                      ? 'Reenviando…'
                      : resendCooldown > 0
                        ? `Reenviar código (${resendCooldown}s)`
                        : 'Reenviar código'}
                  </button>
                )}

                {resendSuccess && recoveryStep === 'code' && (
                  <p className="mt-2 text-center text-[12px] font-medium text-emerald-600">
                    Código reenviado con éxito.
                  </p>
                )}

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    void signIn.reset()
                    setRecoveryError('')
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
                    setResendCooldown(0)
                    setResendSuccess(false)
                    emailInputRef.current
                      ?.focus()
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
                className="auth-card__form mt-7 sm:mt-8"
                aria-busy={isLoading}
                noValidate
              >
                <div>
                  <div className="flex items-center gap-0.5">
                    <label
                      htmlFor="login-email"
                      className="type-label block text-[13px] font-medium text-[#17212b]"
                    >
                      Correo electrónico
                    </label>
                  </div>

                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
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
                          emailError || credentialsError,
                        )
                      }
                      aria-describedby={
                        [emailError && 'login-email-error', credentialsError && 'login-credentials-error'].filter(Boolean).join(' ') || undefined
                      }
                      onBlur={() => {
                        setEmail((current) =>
                          current.trim(),
                        )
                      }}
                      onChange={(
                        event,
                      ) => {
                        setSignedOutNotice(false)
                        setCredentialsError('')
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
                      className={`h-11 rounded-xl pl-10 pr-3.5 text-[13px] ${
                        emailError || credentialsError
                          ? 'border-[#d92d20]'
                          : ''
                      }`}
                    />
                  </div>

                  {emailError && (
                    <FieldError
                      id="login-email-error"
                      className="mt-1.5"
                    >
                      {emailError}
                    </FieldError>
                  )}
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-0.5">
                    <label
                      htmlFor="login-password"
                      className="type-label block text-[13px] font-medium text-[#17212b]"
                    >
                      Contraseña
                    </label>
                  </div>

                  <div className="relative mt-2">
                    <img
                      src={
                        lockIcon
                      }
                      alt=""
                      className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 opacity-70"
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
                      placeholder="Ingresa tu contraseña"
                      required
                      aria-invalid={
                        Boolean(
                          passwordError || credentialsError,
                        )
                      }
                      aria-describedby={
                        [passwordError && 'login-password-error', credentialsError && 'login-credentials-error'].filter(Boolean).join(' ') || undefined
                      }
                      onChange={(
                        event,
                      ) => {
                        setSignedOutNotice(false)
                        setCredentialsError('')
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
                      className={`app-password-input h-11 rounded-xl pl-11 pr-11 text-[13px] ${
                        passwordError || credentialsError
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
                          size={20}
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
                    <FieldError
                      id="login-password-error"
                      className="mt-1.5"
                    >
                      {passwordError}
                    </FieldError>
                  )}

                  {credentialsError && (
                    <InlineFeedback
                      id="login-credentials-error"
                      className="mt-3"
                    >
                      {credentialsError}
                    </InlineFeedback>
                  )}

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={
                        handleStartPasswordRecovery
                      }
                      disabled={isLoading}
                      className="inline-flex min-h-11 items-center rounded-sm px-1 text-[12px] font-semibold text-[#4f46e5] hover:text-[#3730a3] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>

                {generalError && (
                  <InlineFeedback
                    className="mt-4"
                  >
                    {generalError}
                  </InlineFeedback>
                )}

                {feedback === 'network-error' && (
                  <InlineFeedback
                    className="mt-4"
                  >
                    <div className="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Revisa tu conexión a internet e inténtalo nuevamente.</span>
                      <button
                        type="button"
                        onClick={handleRetryAuthentication}
                        className="text-xs font-semibold underline hover:no-underline"
                      >
                        Reintentar
                      </button>
                    </div>
                  </InlineFeedback>
                )}

                {feedback === 'general-error' && (
                  <InlineFeedback
                    className="mt-4"
                  >
                    <div className="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Ocurrió un problema al iniciar sesión. Conservamos tus datos para que puedas revisarlos e intentarlo nuevamente.</span>
                      <button
                        type="button"
                        onClick={handleRetryAuthentication}
                        className="text-xs font-semibold underline hover:no-underline"
                      >
                        Intentar de nuevo
                      </button>
                    </div>
                  </InlineFeedback>
                )}

                <Button
                  type="submit"
                  disabled={
                    isLoading
                  }
                  className={cn(
                    "mt-6 h-11 w-full justify-center gap-2 rounded-xl bg-[#4f46e5] text-[13px] font-semibold text-white shadow-sm hover:bg-[#4338ca] focus-visible:ring-[#4f46e5]/30",
                    isLoading && "disabled:opacity-100 disabled:cursor-wait bg-[#4338ca]"
                  )}
                >
                  {isLoading && (
                    <LoaderCircle
                      className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  )}
                  <span>
                    {isLoading
                      ? 'Iniciando sesión…'
                      : 'Iniciar sesión'}
                  </span>
                </Button>

                <div className="my-5 flex items-center gap-4">
                  <div className="h-px flex-1 bg-border-subtle" />

                  <span className="text-[12px] text-[#667085]">
                    o continúa con
                  </span>

                  <div className="h-px flex-1 bg-border-subtle" />
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
                  className="h-11 w-full rounded-xl border border-border-subtle bg-white text-[13px] font-semibold text-[#17212b] shadow-none hover:border-[#c7d2fe] hover:bg-[#f7f8fc]"
                >
                  <img
                    src={
                      googleLogo
                    }
                    alt=""
                    className="mr-2.5 size-5"
                  />

                  Continuar con Google
                </Button>

                <AuthRouteLink
                  to="/crear-cuenta"
                  direction="forward"
                  className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-[#4f46e5] bg-transparent text-[13px] font-semibold text-[#4f46e5] transition-colors hover:bg-[#eef2ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
                >
                  Crear una cuenta
                </AuthRouteLink>

                <p className="mt-7 flex flex-wrap items-center justify-center gap-x-1 text-center text-[11px] leading-5 text-[#667085]">
                  <span>Al continuar aceptas nuestros</span>{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLegalModalTab('terms')
                      setLegalModalOpen(true)
                    }}
                    className="inline-flex min-h-11 items-center cursor-pointer font-semibold text-[#4f46e5] underline underline-offset-2 hover:text-[#4338ca] focus-visible:outline-2 focus-visible:outline-[#4f46e5] rounded-xs sm:min-h-0"
                  >
                    Términos y condiciones
                  </button>{' '}
                  <span>y la</span>{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLegalModalTab('privacy')
                      setLegalModalOpen(true)
                    }}
                    className="inline-flex min-h-11 items-center cursor-pointer font-semibold text-[#4f46e5] underline underline-offset-2 hover:text-[#4338ca] focus-visible:outline-2 focus-visible:outline-[#4f46e5] rounded-xs sm:min-h-0"
                  >
                    Política de privacidad.
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

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

          setFeedback(null)
        }}
        onPrimary={() => {
          sessionStorage.removeItem(
            'accountCreated',
          )

          setFeedback(null)

          emailInputRef.current
            ?.focus()
        }}
      />

      <LegalTermsModal
        open={legalModalOpen}
        onOpenChange={setLegalModalOpen}
        initialTab={legalModalTab}
      />
    </main>
  )
}
