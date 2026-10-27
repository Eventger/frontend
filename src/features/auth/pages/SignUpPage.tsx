import {
  Check,
  EyeOff,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react'

import {
  useRef,
  useState,
  type FormEvent,
} from 'react'

import {
  useNavigate,
} from 'react-router'

import {
  useClerk,
  useSignUp,
} from '@clerk/react'

import { isClerkAPIResponseError } from '@clerk/react/errors'

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_HINT,
} from '@/features/auth/auth.constants'

import { AuthBrandPanel } from '@/features/auth/components/AuthBrandPanel'
import { AuthFeedbackModal } from '@/features/auth/components/AuthFeedbackModal'
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark'
import { AuthRouteLink } from '@/features/auth/components/AuthRouteLink'
import { LegalTermsModal, type LegalTab } from '@/features/auth/components/LegalTermsModal'
import { useDocumentTitle } from '@/components/layout/useDocumentTitle'

import { isValidEmail } from '@/features/auth/utils/isValidEmail'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'

import eyeIcon from '@/assets/auth/eye.svg'
import googleLogo from '@/assets/auth/google.svg'
import lockIcon from '@/assets/auth/lock.svg'

type SignUpFeedback =
  | 'general-error'
  | 'network-error'
  | 'email-registered'
  | null

type SignUpAttempt =
  | 'password'
  | 'verify-code'
  | 'resend-code'
  | 'google'

function looksLikeEmailAlreadyExists(
  error: unknown,
) {
  if (!error) {
    return false
  }

  const value =
    typeof error === 'object'
      ? JSON.stringify(error)
      : String(error)

  return /already.*(registered|exists)|identifier_already|email_address_exists|form_identifier_exists|form_email_address_exists/i.test(
    value,
  )
}

type SignUpErrorTarget =
  | 'email'
  | 'password'
  | 'general'

type SignUpErrorDetails = {
  target: SignUpErrorTarget
  message: string
}

function getSignUpErrorDetails(
  error: unknown,
): SignUpErrorDetails {
  const apiError =
    isClerkAPIResponseError(error)
      ? error.errors[0]
      : error

  const code =
    typeof apiError === 'object' &&
    apiError !== null &&
    'code' in apiError &&
    typeof apiError.code === 'string'
      ? apiError.code
      : ''

  if (
    code ===
      'form_identifier_exists' ||
    code ===
      'form_email_address_exists'
  ) {
    return {
      target: 'email',
      message:
        'Ya existe una cuenta con este correo electrónico.',
    }
  }

  if (
    code ===
      'form_password_pwned' ||
    code ===
      'form_password_compromised'
  ) {
    return {
      target: 'password',
      message:
        'Esta contraseña apareció en una filtración de datos. Usa otra.',
    }
  }

  if (
    code ===
      'form_password_length_too_short' ||
    code ===
      'form_password_too_short'
  ) {
    return {
      target: 'password',
      message:
        PASSWORD_MIN_LENGTH_HINT,
    }
  }

  if (
    code.startsWith(
      'form_password_',
    )
  ) {
    return {
      target: 'password',
      message:
        'La contraseña no cumple los requisitos de seguridad. Usa otra.',
    }
  }

  return {
    target: 'general',
    message:
      'No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo.',
  }
}

export function SignUpPage() {
  const navigate = useNavigate()

  const {
    signOut,
  } = useClerk()

  const {
    signUp,
    fetchStatus,
  } = useSignUp()

  const [
    firstName,
    setFirstName,
  ] = useState('')

  const [
    lastName,
    setLastName,
  ] = useState('')

  const [
    email,
    setEmail,
  ] = useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false)

  const [legalModalOpen, setLegalModalOpen] = useState(false)
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('terms')

  useDocumentTitle('Crear cuenta · Eventger')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    isPasswordFocused,
    setIsPasswordFocused,
  ] = useState(false)

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [
    verificationCode,
    setVerificationCode,
  ] = useState('')

  const [
    isVerifying,
    setIsVerifying,
  ] = useState(false)

  const [
    firstNameError,
    setFirstNameError,
  ] = useState('')

  const [
    lastNameError,
    setLastNameError,
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
    confirmPasswordError,
    setConfirmPasswordError,
  ] = useState('')

  const [
    termsError,
    setTermsError,
  ] = useState('')

  const [
    codeError,
    setCodeError,
  ] = useState('')

  const [
    generalError,
    setGeneralError,
  ] = useState('')

  const [
    feedback,
    setFeedback,
  ] =
    useState<SignUpFeedback>(
      null,
    )

  const [
    lastAttempt,
    setLastAttempt,
  ] = useState<SignUpAttempt>(
    'password',
  )

  const firstNameInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const lastNameInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const emailInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const passwordInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const termsInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const codeInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const isLoading =
    fetchStatus === 'fetching'

  const validate = () => {
    let isValid = true

    setFirstNameError('')
    setLastNameError('')
    setEmailError('')
    setPasswordError('')
    setTermsError('')
    setGeneralError('')
    setFeedback(null)

    if (
      !firstName.trim()
    ) {
      setFirstNameError(
        'Ingresa tu nombre.',
      )

      isValid = false
    }

    if (
      !lastName.trim()
    ) {
      setLastNameError(
        'Ingresa tu apellido.',
      )

      isValid = false
    }

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
        'Ingresa una contraseña.',
      )

      isValid = false
    } else if (
      password.length <
      PASSWORD_MIN_LENGTH
    ) {
      setPasswordError(
        PASSWORD_MIN_LENGTH_HINT,
      )

      isValid = false
    }

    setConfirmPasswordError('')
    if (confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError('Las contraseñas no coinciden.')
      isValid = false
    }

    if (
      !acceptedTerms
    ) {
      setTermsError(
        'Debes aceptar los Términos y condiciones y la Política de privacidad.',
      )

      isValid = false
    }

    if (!isValid) {
      if (
        !firstName.trim()
      ) {
        firstNameInputRef.current
          ?.focus()
      } else if (
        !lastName.trim()
      ) {
        lastNameInputRef.current
          ?.focus()
      } else if (
        !email.trim() ||
        !isValidEmail(email)
      ) {
        emailInputRef.current
          ?.focus()
      } else if (
        !password ||
        password.length <
          PASSWORD_MIN_LENGTH
      ) {
        passwordInputRef.current
          ?.focus()
      } else {
        termsInputRef.current
          ?.focus()
      }
    }

    return isValid
  }

  const completeSignUp = async () => {
    sessionStorage.setItem(
      'accountCreated',
      'true',
    )

    try {
      await signOut()
    } catch {
      try {
        await signOut()
      } catch {
        // La cuenta ya fue creada; se procede a la redirección
      }
    }

    navigate('/', {
      replace: true,
    })
  }

  const performSignUp =
    async () => {
      setLastAttempt('password')
      setGeneralError('')
      setFeedback(null)

      let error:
        | Error
        | null

      try {
        const result =
          await signUp.password({
            emailAddress:
              email.trim(),
            password,
            firstName:
              firstName.trim(),
            lastName:
              lastName.trim(),
            legalAccepted:
              acceptedTerms,
          })

        error = result.error
      } catch {
        setFeedback(
          'network-error',
        )

        return
      }

      if (error) {
        const details =
          getSignUpErrorDetails(
            error,
          )

        if (
          looksLikeEmailAlreadyExists(
            error,
          )
        ) {
          setFeedback(
            'email-registered',
          )

          return
        }

        if (
          details.target ===
          'email'
        ) {
          setEmailError(
            details.message,
          )

          emailInputRef.current
            ?.focus()

          return
        }

        if (
          details.target ===
          'password'
        ) {
          setPasswordError(
            details.message,
          )

          passwordInputRef.current
            ?.focus()

          return
        }

        setFeedback(
          'general-error',
        )

        return
      }

      if (signUp.status === 'complete') {
        await completeSignUp()

        return
      }

      let verificationError:
        | Error
        | null

      setLastAttempt(
        'resend-code',
      )

      try {
        const result =
          await signUp
            .verifications
            .sendEmailCode()

        verificationError =
          result.error
      } catch {
        setFeedback(
          'network-error',
        )

        return
      }

      if (
        verificationError
      ) {
        setFeedback(
          'general-error',
        )

        return
      }

      setIsVerifying(
        true,
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

    await performSignUp()
  }

  const verifyEmailCode =
    async () => {
      setLastAttempt(
        'verify-code',
      )
      setCodeError('')
      setGeneralError('')
      setFeedback(null)

      if (
        !/^\d{6}$/.test(
          verificationCode.trim(),
        )
      ) {
        setCodeError(
          'Ingresa el código de 6 dígitos.',
        )

        codeInputRef.current
          ?.focus()

        return
      }

      let error:
        | Error
        | null

      try {
        const result =
          await signUp
            .verifications
            .verifyEmailCode({
              code:
                verificationCode.trim(),
            })

        error = result.error
      } catch {
        setFeedback(
          'network-error',
        )

        return
      }

      if (error) {
        setCodeError(
          'El código no es válido. Inténtalo de nuevo.',
        )

        return
      }

      if (
        signUp.status ===
        'complete'
      ) {
        await completeSignUp()

        return
      }

      setFeedback(
        'general-error',
      )
    }

  const handleVerify = async (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    await verifyEmailCode()
  }

  const handleResendCode =
    async () => {
      setLastAttempt(
        'resend-code',
      )
      setCodeError('')
      setGeneralError('')
      setFeedback(null)

      let error:
        | Error
        | null

      try {
        const result =
          await signUp
            .verifications
            .sendEmailCode()

        error = result.error
      } catch {
        setFeedback(
          'network-error',
        )

        return
      }

      if (error) {
        setFeedback(
          'general-error',
        )

        return
      }

      setIsVerifying(true)
    }

  const handleGoogleSignUp =
    async () => {
      setLastAttempt('google')
      setGeneralError('')
      setFeedback(null)

      try {
        const { error } =
          await signUp.sso({
            strategy:
              'oauth_google',

            redirectUrl:
              `${window.location.origin}/hoy`,

            redirectCallbackUrl:
              `${window.location.origin}/crear-cuenta`,

            legalAccepted:
              true,
          })

        if (error) {
          if (
            looksLikeEmailAlreadyExists(
              error,
            )
          ) {
            setFeedback(
              'email-registered',
            )
          } else {
            setFeedback(
              'general-error',
            )
          }
        }
      } catch {
        setFeedback(
          'network-error',
        )
      }
    }

  const handleRetrySignUp =
    () => {
      if (
        lastAttempt === 'google'
      ) {
        void handleGoogleSignUp()

        return
      }

      if (
        lastAttempt ===
        'verify-code'
      ) {
        void verifyEmailCode()

        return
      }

      if (
        lastAttempt ===
        'resend-code'
      ) {
        void handleResendCode()

        return
      }

      void performSignUp()
    }

  const sharedFeedbackModals = (
    <>
      <AuthFeedbackModal
        open={
          feedback ===
          'general-error'
        }
        variant="error"
        title="No pudimos crear tu cuenta"
        description="Conservamos la información que ingresaste para que puedas revisarla e intentarlo nuevamente."
        secondaryLabel="Cerrar"
        primaryLabel="Volver y revisar"
        onSecondary={() =>
          setFeedback(null)
        }
        onPrimary={() =>
          setFeedback(null)
        }
      />

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
        onPrimary={
          handleRetrySignUp
        }
      />
    </>
  )

  if (isVerifying) {
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
                  Verifica tu correo
                </h1>

                <p className="mt-2 text-[13px] leading-5 text-[#667085]">
                  Enviamos un código de verificación a{' '}

                  <span className="font-medium text-[#17212b]">
                    {email}
                  </span>
                  .
                </p>
              </div>

              <form
                onSubmit={
                  handleVerify
                }
                className="auth-card__form mt-10 flex flex-col gap-4"
                noValidate
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="verification-code"
                    className="type-label text-[#17212b]"
                  >
                    Código de verificación
                  </label>

                  <Input
                    ref={
                      codeInputRef
                    }
                    id="verification-code"
                    name="verification-code"
                    value={
                      verificationCode
                    }
                    disabled={
                      isLoading
                    }
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456…"
                    required
                    aria-invalid={
                      Boolean(
                        codeError,
                      )
                    }
                    aria-describedby={
                      codeError
                        ? 'verification-code-error'
                        : undefined
                    }
                    onChange={(
                      event,
                    ) => {
                      setVerificationCode(
                        event.target.value.replace(
                          /\D/g,
                          '',
                        ),
                      )

                      setCodeError(
                        '',
                      )

                      setFeedback(
                        null,
                      )
                    }}
                    className={`h-11 rounded-lg px-3 text-[13px] tracking-[0.14em] sm:h-10 ${
                      codeError
                        ? 'border-[#d92d20]'
                        : ''
                    }`}
                  />

                  {codeError && (
                    <FieldError
                      id="verification-code-error"
                    >
                      {codeError}
                    </FieldError>
                  )}
                </div>

                {generalError && (
                  <InlineFeedback>
                    {generalError}
                  </InlineFeedback>
                )}

                <Button
                  type="submit"
                  disabled={
                    isLoading
                  }
                  className="h-11 w-full rounded-lg bg-[#4f46e5] text-[13px] font-semibold text-white hover:bg-[#4338ca] focus-visible:ring-[#4f46e5]/30 sm:h-10"
                >
                  {isLoading
                    ? 'Verificando…'
                    : 'Verificar correo'}
                </Button>

                <button
                  type="button"
                  disabled={
                    isLoading
                  }
                  onClick={
                    handleResendCode
                  }
                  className="min-h-11 w-full rounded-lg text-center text-[12px] font-semibold text-[#4f46e5] hover:bg-[#eef2ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:opacity-50 sm:min-h-10"
                >
                  Reenviar código
                </button>
              </form>
            </div>
          </div>
        </section>

        {sharedFeedbackModals}
      </main>
    )
  }

  const hasMinLength = password.length >= PASSWORD_MIN_LENGTH
  const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password)
  const hasNumberOrSymbol = /[\d\W]/.test(password)

  let strengthScore = 0
  if (password.length > 0) strengthScore = 1
  if (password.length >= 8) strengthScore = 2
  if (hasMinLength && (hasUpperAndLower || hasNumberOrSymbol)) strengthScore = 3
  if (hasMinLength && hasUpperAndLower && hasNumberOrSymbol) strengthScore = 4

  const strengthLabel =
    password.length === 0
      ? 'Baja'
      : strengthScore <= 1
      ? 'Baja'
      : strengthScore === 2
      ? 'Media'
      : strengthScore === 3
      ? 'Buena'
      : 'Fuerte'

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
                Crear tu cuenta
              </h1>

              <p className="mt-2 text-[13px] text-[#667085]">
                ¿Ya tienes una cuenta?{' '}

                <AuthRouteLink
                  to="/"
                  direction="backward"
                  className="rounded-sm font-semibold text-[#4f46e5] hover:text-[#3730a3] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
                >
                  Iniciar sesión
                </AuthRouteLink>
              </p>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="auth-card__form mt-6 sm:mt-7"
              noValidate
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-0.5">
                    <label
                      htmlFor="signup-first-name"
                      className="type-label block text-[13px] font-medium text-[#17212b]"
                    >
                      Nombre
                    </label>
                    <span aria-hidden="true" className="text-[13px] font-medium text-[#4f46e5]">*</span>
                  </div>

                  <div className="relative mt-2">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
                    <Input
                      ref={
                        firstNameInputRef
                      }
                      id="signup-first-name"
                      name="given-name"
                      value={
                        firstName
                      }
                      placeholder="Tu nombre"
                      disabled={
                        isLoading
                      }
                      autoComplete="given-name"
                      required
                      aria-invalid={
                        Boolean(
                          firstNameError,
                        )
                      }
                      aria-describedby={
                        firstNameError
                          ? 'signup-first-name-error'
                          : undefined
                      }
                      onChange={(
                        event,
                      ) => {
                        setFirstName(
                          event.target.value,
                        )

                        setFirstNameError(
                          '',
                        )

                        setFeedback(
                          null,
                        )
                      }}
                      className={`h-11 rounded-xl pl-10 pr-3.5 text-[13px] ${
                        firstNameError
                          ? 'border-[#d92d20]'
                          : ''
                      }`}
                    />
                  </div>

                  {firstNameError && (
                    <FieldError
                      id="signup-first-name-error"
                      className="mt-1.5"
                    >
                      {firstNameError}
                    </FieldError>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-0.5">
                    <label
                      htmlFor="signup-last-name"
                      className="type-label block text-[13px] font-medium text-[#17212b]"
                    >
                      Apellido
                    </label>
                    <span aria-hidden="true" className="text-[13px] font-medium text-[#4f46e5]">*</span>
                  </div>

                  <div className="relative mt-2">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
                    <Input
                      ref={
                        lastNameInputRef
                      }
                      id="signup-last-name"
                      name="family-name"
                      value={
                        lastName
                      }
                      placeholder="Tu apellido"
                      disabled={
                        isLoading
                      }
                      autoComplete="family-name"
                      required
                      aria-invalid={
                        Boolean(
                          lastNameError,
                        )
                      }
                      aria-describedby={
                        lastNameError
                          ? 'signup-last-name-error'
                          : undefined
                      }
                      onChange={(
                        event,
                      ) => {
                        setLastName(
                          event.target.value,
                        )

                        setLastNameError(
                          '',
                        )

                        setFeedback(
                          null,
                        )
                      }}
                      className={`h-11 rounded-xl pl-10 pr-3.5 text-[13px] ${
                        lastNameError
                          ? 'border-[#d92d20]'
                          : ''
                      }`}
                    />
                  </div>

                  {lastNameError && (
                    <FieldError
                      id="signup-last-name-error"
                      className="mt-1.5"
                    >
                      {lastNameError}
                    </FieldError>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-0.5">
                  <label
                    htmlFor="signup-email"
                    className="type-label block text-[13px] font-medium text-[#17212b]"
                  >
                    Correo electrónico
                  </label>
                  <span aria-hidden="true" className="text-[13px] font-medium text-[#4f46e5]">*</span>
                </div>

                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
                  <Input
                    ref={
                      emailInputRef
                    }
                    id="signup-email"
                    name="email"
                    type="email"
                    value={email}
                    disabled={
                      isLoading
                    }
                    autoComplete="email"
                    spellCheck={
                      false
                    }
                    placeholder="nombre@correo.com"
                    required
                    aria-invalid={
                      Boolean(
                        emailError,
                      )
                    }
                    aria-describedby={
                      emailError
                        ? 'signup-email-error'
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

                      setFeedback(
                        null,
                      )
                    }}
                    className={`h-11 rounded-xl pl-10 pr-3.5 text-[13px] ${
                      emailError
                        ? 'border-[#d92d20]'
                        : ''
                    }`}
                  />
                </div>

                {emailError && (
                  <FieldError
                    id="signup-email-error"
                    className="mt-1.5"
                  >
                    {emailError}
                  </FieldError>
                )}
              </div>

              <div className="relative mt-4">
                <div className="flex items-center gap-0.5">
                  <label
                    htmlFor="signup-password"
                    className="type-label block text-[13px] font-medium text-[#17212b]"
                  >
                    Contraseña
                  </label>
                  <span aria-hidden="true" className="text-[13px] font-medium text-[#4f46e5]">*</span>
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
                    id="signup-password"
                    name="new-password"
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
                    autoComplete="new-password"
                    placeholder="Ingresa tu contraseña"
                    required
                    minLength={
                      PASSWORD_MIN_LENGTH
                    }
                    aria-invalid={
                      Boolean(
                        passwordError,
                      )
                    }
                    aria-describedby={
                      passwordError
                        ? 'signup-password-error'
                        : 'signup-password-hint'
                    }
                    onFocus={() =>
                      setIsPasswordFocused(true)
                    }
                    onBlur={() =>
                      setIsPasswordFocused(false)
                    }
                    onChange={(
                      event,
                    ) => {
                      const nextPassword =
                        event.target.value

                      setPassword(nextPassword)

                      setPasswordError(
                        '',
                      )

                      setConfirmPasswordError(
                        confirmPassword &&
                          confirmPassword !== nextPassword
                          ? 'Las contraseñas no coinciden.'
                          : '',
                      )

                      setFeedback(
                        null,
                      )
                    }}
                    className={`app-password-input h-11 rounded-xl pl-11 pr-11 text-[13px] ${
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
                    className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-[#667085] hover:text-[#3730a3] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#4f46e5]"
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

                {password && isPasswordFocused && (
                  <div
                    role="status"
                    className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-[#e0e7ff] bg-[#f8faff] p-3.5 shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-1 items-center gap-1.5">
                        {[1, 2, 3, 4].map((seg) => (
                          <div
                            key={seg}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              strengthScore >= seg
                                ? 'bg-[#10b981]'
                                : 'bg-[#e5e7eb]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-[#667085]">
                        Fuerza de la contraseña: <span className="font-semibold text-[#17212b]">{strengthLabel}</span>
                      </span>
                    </div>

                    <div className="mt-3 flex items-start gap-2.5">
                      <ShieldCheck className="size-5 shrink-0 text-[#4f46e5]" />
                      <ul className="space-y-1 text-[11px] text-[#4b5563]">
                        <li className={`flex items-center gap-1.5 ${hasMinLength ? 'font-medium text-[#16a34a]' : ''}`}>
                          <span className="size-1 rounded-full bg-current" />
                          Mínimo {PASSWORD_MIN_LENGTH} caracteres
                        </li>
                        <li className={`flex items-center gap-1.5 ${hasUpperAndLower ? 'font-medium text-[#16a34a]' : ''}`}>
                          <span className="size-1 rounded-full bg-current" />
                          Debe incluir mayúsculas y minúsculas
                        </li>
                        <li className={`flex items-center gap-1.5 ${hasNumberOrSymbol ? 'font-medium text-[#16a34a]' : ''}`}>
                          <span className="size-1 rounded-full bg-current" />
                          Debe incluir al menos un número o símbolo
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {passwordError ? (
                  <FieldError
                    id="signup-password-error"
                    className="mt-2"
                  >
                    {passwordError}
                  </FieldError>
                ) : (
                  <p
                    id="signup-password-hint"
                    className="sr-only"
                  >
                    {PASSWORD_MIN_LENGTH_HINT}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-0.5">
                  <label
                    htmlFor="signup-confirm-password"
                    className="type-label block text-[13px] font-medium text-[#17212b]"
                  >
                    Confirmar contraseña
                  </label>
                  <span aria-hidden="true" className="text-[13px] font-medium text-[#4f46e5]">*</span>
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
                    id="signup-confirm-password"
                    name="confirm-password"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    value={confirmPassword}
                    disabled={
                      isLoading
                    }
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    aria-invalid={
                      Boolean(
                        confirmPasswordError,
                      )
                    }
                    aria-describedby={
                      confirmPasswordError
                        ? 'signup-confirm-password-error'
                        : undefined
                    }
                    onChange={(
                      event,
                    ) => {
                      const nextConfirmPassword =
                        event.target.value

                      setConfirmPassword(nextConfirmPassword)
                      setConfirmPasswordError(
                        nextConfirmPassword &&
                          nextConfirmPassword !== password
                          ? 'Las contraseñas no coinciden.'
                          : '',
                      )
                    }}
                    className={`app-password-input h-11 rounded-xl pl-11 pr-11 text-[13px] ${
                      confirmPasswordError
                        ? 'border-[#d92d20]'
                        : ''
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (
                          current,
                        ) =>
                          !current,
                      )
                    }
                    className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-[#667085] hover:text-[#3730a3] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#4f46e5]"
                    aria-label={
                      showConfirmPassword
                        ? 'Ocultar confirmación de contraseña'
                        : 'Mostrar confirmación de contraseña'
                    }
                    aria-pressed={
                      showConfirmPassword
                    }
                  >
                    {showConfirmPassword ? (
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

                {confirmPasswordError && (
                  <FieldError
                    id="signup-confirm-password-error"
                    className="mt-1.5"
                  >
                    {confirmPasswordError}
                  </FieldError>
                )}
              </div>

              <div className="mt-4">
                <label className="type-caption flex cursor-pointer items-start gap-3 text-[#17212b]">
                  <input
                    ref={
                      termsInputRef
                    }
                    id="signup-terms"
                    name="terms"
                    type="checkbox"
                    checked={
                      acceptedTerms
                    }
                    disabled={
                      isLoading
                    }
                    onChange={(
                      event,
                    ) => {
                      setAcceptedTerms(
                        event.target.checked,
                      )

                      setTermsError(
                        '',
                      )

                      setFeedback(
                        null,
                      )
                    }}
                    className="peer sr-only"
                    required
                    aria-invalid={
                      Boolean(
                        termsError,
                      )
                    }
                    aria-describedby={
                      termsError
                        ? 'signup-terms-error'
                        : undefined
                    }
                  />

                  <span
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[6px] border border-border-subtle bg-white text-white transition-colors peer-checked:border-[#4f46e5] peer-checked:bg-[#4f46e5] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#4f46e5]"
                    aria-hidden="true"
                  >
                    <Check
                      className="size-4"
                      strokeWidth={
                        2.5
                      }
                    />
                  </span>

                  <span className="flex flex-wrap items-center gap-x-1 text-[12px] text-[#4b5563]">
                    <span>Acepto los</span>{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
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
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setLegalModalTab('privacy')
                        setLegalModalOpen(true)
                      }}
                      className="inline-flex min-h-11 items-center cursor-pointer font-semibold text-[#4f46e5] underline underline-offset-2 hover:text-[#4338ca] focus-visible:outline-2 focus-visible:outline-[#4f46e5] rounded-xs sm:min-h-0"
                    >
                      Política de privacidad
                    </button>.
                  </span>
                </label>

                {termsError && (
                  <FieldError
                    id="signup-terms-error"
                    className="ml-8 mt-1.5"
                  >
                    {termsError}
                  </FieldError>
                )}
              </div>

              {generalError && (
                <InlineFeedback
                  className="mt-4"
                >
                  {generalError}
                </InlineFeedback>
              )}

              <div
                id="clerk-captcha"
                data-cl-theme="light"
                data-cl-size="flexible"
                data-cl-language="es-es"
              />

              <Button
                type="submit"
                disabled={
                  isLoading
                }
                className="mt-6 h-11 w-full rounded-xl bg-[#4f46e5] text-[13px] font-semibold text-white shadow-sm hover:bg-[#4338ca] focus-visible:ring-[#4f46e5]/30"
              >
                {isLoading
                  ? 'Creando cuenta…'
                  : 'Crear cuenta'}
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
                  handleGoogleSignUp
                }
                aria-label="Registrarme con Google"
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
            </form>
          </div>
        </div>
      </section>

      {sharedFeedbackModals}

      <AuthFeedbackModal
        open={
          feedback ===
          'email-registered'
        }
        variant="error"
        title="Este correo ya está registrado"
        description="Puedes iniciar sesión con este correo o volver al formulario para utilizar otro."
        secondaryLabel="Usar otro correo"
        primaryLabel="Iniciar sesión"
        onSecondary={() => {
          setFeedback(null)
          setEmail('')

          emailInputRef.current
            ?.focus()
        }}
        onPrimary={() => {
          setFeedback(null)

          navigate('/', {
            replace: true,
          })
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
