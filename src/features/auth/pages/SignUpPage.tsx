import {
  CalendarDays,
  Eye,
  EyeOff,
  LockKeyhole,
} from 'lucide-react'

import {
  useState,
  type FormEvent,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router'

import {
  useClerk,
  useSignUp,
} from '@clerk/react'

import { AuthBrandPanel } from '@/features/auth/components/AuthBrandPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SignUpPage() {
  const navigate = useNavigate()

  const { signOut } = useClerk()

  const {
    signUp,
    errors: clerkErrors,
    fetchStatus,
  } = useSignUp()

  const [firstName, setFirstName] =
    useState('')

  const [lastName, setLastName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [acceptedTerms, setAcceptedTerms] =
    useState(false)

  const [showPassword, setShowPassword] =
    useState(false)

  const [
    verificationCode,
    setVerificationCode,
  ] = useState('')

  const [isVerifying, setIsVerifying] =
    useState(false)

  const [
    firstNameError,
    setFirstNameError,
  ] = useState('')

  const [
    lastNameError,
    setLastNameError,
  ] = useState('')

  const [emailError, setEmailError] =
    useState('')

  const [
    passwordError,
    setPasswordError,
  ] = useState('')

  const [termsError, setTermsError] =
    useState('')

  const [codeError, setCodeError] =
    useState('')

  const [
    generalError,
    setGeneralError,
  ] = useState('')

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

    if (!firstName.trim()) {
      setFirstNameError(
        'Ingresa tu nombre.',
      )
      isValid = false
    }

    if (!lastName.trim()) {
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
        'Ingresa una contraseña.',
      )
      isValid = false
    } else if (password.length < 15) {
      setPasswordError(
        'Usa al menos 15 caracteres.',
      )
      isValid = false
    }

    if (!acceptedTerms) {
      setTermsError(
        'Debes aceptar los Términos y condiciones y la Política de privacidad.',
      )
      isValid = false
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

    const { error } =
      await signUp.password({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        legalAccepted: true,
      })

    if (error) {
      const clerkFirstNameError =
        clerkErrors.fields
          ?.firstName?.message

      const clerkLastNameError =
        clerkErrors.fields
          ?.lastName?.message

      const clerkEmailError =
        clerkErrors.fields
          ?.emailAddress?.message

      const clerkPasswordError =
        clerkErrors.fields
          ?.password?.message

      if (clerkFirstNameError) {
        setFirstNameError(
          clerkFirstNameError,
        )
      }

      if (clerkLastNameError) {
        setLastNameError(
          clerkLastNameError,
        )
      }

      if (clerkEmailError) {
        setEmailError(
          clerkEmailError,
        )
      }

      if (clerkPasswordError) {
        setPasswordError(
          clerkPasswordError,
        )
      }

      if (
        !clerkFirstNameError &&
        !clerkLastNameError &&
        !clerkEmailError &&
        !clerkPasswordError
      ) {
        setGeneralError(
          'No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo.',
        )
      }

      return
    }

    await signUp.verifications
      .sendEmailCode()

    setIsVerifying(true)
  }

  const handleVerify = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setCodeError('')
    setGeneralError('')

    if (!verificationCode.trim()) {
      setCodeError(
        'Ingresa el código de verificación.',
      )
      return
    }

    const { error } =
      await signUp.verifications
        .verifyEmailCode({
          code: verificationCode.trim(),
        })

    if (error) {
      const clerkCodeError =
        clerkErrors.fields
          ?.code?.message

      setCodeError(
        clerkCodeError ||
          'El código no es válido. Inténtalo de nuevo.',
      )

      return
    }

    if (signUp.status === 'complete') {
      sessionStorage.setItem(
        'accountCreated',
        'true',
      )

      await signOut({
        redirectUrl: '/',
      })

      return
    }

    setGeneralError(
      'La cuenta aún no pudo completarse.',
    )
  }

  const handleResendCode =
    async () => {
      setCodeError('')
      setGeneralError('')

      const { error } =
        await signUp.verifications
          .sendEmailCode()

      if (error) {
        setGeneralError(
          'No pudimos reenviar el código.',
        )
      }
    }

  if (isVerifying) {
    return (
      <main className="flex min-h-screen bg-[#f7f8fc]">
        <AuthBrandPanel />

        <section className="flex min-h-screen flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-[516px] rounded-[18px] border border-[#dde2ea] bg-white px-8 py-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#4f46e5]">
                <CalendarDays
                  size={26}
                  className="text-white"
                />
              </div>

              <span className="text-[22px] font-semibold text-[#17212b]">
                Eventger
              </span>
            </div>

            <div className="mt-14">
              <h1 className="text-[28px] font-bold text-[#17212b]">
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
              onSubmit={handleVerify}
              className="mt-8 space-y-5"
              noValidate
            >
              <div className="space-y-2">
                <label
                  htmlFor="verification-code"
                  className="text-[12px] font-medium text-[#17212b]"
                >
                  Código de verificación
                </label>

                <Input
                  id="verification-code"
                  value={
                    verificationCode
                  }
                  disabled={isLoading}
                  placeholder="123456"
                  onChange={(event) => {
                    setVerificationCode(
                      event.target.value,
                    )

                    setCodeError('')
                  }}
                  className={`h-11 rounded-[8px] ${
                    codeError
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />

                {codeError && (
                  <p className="text-[11px] text-[#d92d20]">
                    {codeError}
                  </p>
                )}
              </div>

              {generalError && (
                <div className="rounded-[8px] border border-[#fecdca] bg-[#fef3f2] px-3 py-2">
                  <p className="text-[11px] text-[#b42318]">
                    {generalError}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-[8px] bg-[#4f46e5] text-white hover:bg-[#4338ca]"
              >
                {isLoading
                  ? 'Verificando...'
                  : 'Verificar correo'}
              </Button>

              <button
                type="button"
                disabled={isLoading}
                onClick={
                  handleResendCode
                }
                className="w-full text-center text-[12px] font-medium text-[#4f46e5]"
              >
                Reenviar código
              </button>
            </form>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen bg-[#f7f8fc]">
      <AuthBrandPanel />

      <section className="flex min-h-screen flex-1 items-center justify-center px-6 py-10">
        <div className="min-h-[760px] w-full max-w-[516px] rounded-[18px] border border-[#dde2ea] bg-white px-8 py-7 shadow-sm">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#4f46e5]">
              <CalendarDays
                size={26}
                className="text-white"
              />
            </div>

            <span className="text-[22px] font-semibold text-[#17212b]">
              Eventger
            </span>
          </div>

          <div className="mt-12">
            <h1 className="text-[28px] font-bold text-[#17212b]">
              Crear tu cuenta
            </h1>

            <p className="mt-1 text-[13px] text-[#667085]">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/"
                className="font-medium text-[#4f46e5]"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-5"
            noValidate
          >
            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-[8px]"
            >
              <span className="mr-3 text-lg font-bold text-[#4285f4]">
                G
              </span>

              Registrarme con Google
            </Button>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#dde2ea]" />

              <span className="text-[11px] text-[#667085]">
                o continúa con
              </span>

              <div className="h-px flex-1 bg-[#dde2ea]" />
            </div>

            {/* Nombre y apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="signup-first-name"
                  className="text-[12px] font-medium text-[#17212b]"
                >
                  Nombre
                </label>

                <Input
                  id="signup-first-name"
                  value={firstName}
                  disabled={isLoading}
                  onChange={(event) => {
                    setFirstName(
                      event.target.value,
                    )
                    setFirstNameError('')
                  }}
                  className={`h-11 rounded-[8px] ${
                    firstNameError
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />

                {firstNameError && (
                  <p className="text-[11px] text-[#d92d20]">
                    {firstNameError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="signup-last-name"
                  className="text-[12px] font-medium text-[#17212b]"
                >
                  Apellido
                </label>

                <Input
                  id="signup-last-name"
                  value={lastName}
                  disabled={isLoading}
                  onChange={(event) => {
                    setLastName(
                      event.target.value,
                    )
                    setLastNameError('')
                  }}
                  className={`h-11 rounded-[8px] ${
                    lastNameError
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />

                {lastNameError && (
                  <p className="text-[11px] text-[#d92d20]">
                    {lastNameError}
                  </p>
                )}
              </div>
            </div>

            {/* correo */}
            <div className="space-y-2">
              <label
                htmlFor="signup-email"
                className="text-[12px] font-medium text-[#17212b]"
              >
                Correo electrónico
              </label>

              <Input
                id="signup-email"
                type="email"
                value={email}
                disabled={isLoading}
                placeholder="nombre@correo.com"
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  )
                  setEmailError('')
                }}
                className={`h-11 rounded-[8px] ${
                  emailError
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />

              {emailError && (
                <p className="text-[11px] text-[#d92d20]">
                  {emailError}
                </p>
              )}
            </div>

            {/* contraseña */}
            <div className="space-y-2">
              <label
                htmlFor="signup-password"
                className="text-[12px] font-medium text-[#17212b]"
              >
                Contraseña
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]"
                />

                <Input
                  id="signup-password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  disabled={isLoading}
                  onChange={(event) => {
                    setPassword(
                      event.target.value,
                    )
                    setPasswordError('')
                  }}
                  className={`h-11 rounded-[8px] pl-10 pr-10 ${
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
                  aria-label={
                    showPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={17}
                    />
                  ) : (
                    <Eye
                      size={17}
                    />
                  )}
                </button>
              </div>

              <p
                className={`text-[11px] ${
                  passwordError
                    ? 'text-[#d92d20]'
                    : 'text-[#667085]'
                }`}
              >
                {passwordError ||
                  'Usa al menos 15 caracteres.'}
              </p>
            </div>

            {/* términos */}
            <div>
              <label className="flex items-start gap-3 text-[11px] text-[#17212b]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  disabled={isLoading}
                  onChange={(event) => {
                    setAcceptedTerms(
                      event.target.checked,
                    )
                    setTermsError('')
                  }}
                  className="mt-0.5 h-4 w-4 rounded accent-[#4f46e5]"
                />

                <span>
                  Acepto los Términos y condiciones y la Política de privacidad.
                </span>
              </label>

              {termsError && (
                <p className="ml-7 mt-2 text-[11px] text-[#d92d20]">
                  {termsError}
                </p>
              )}
            </div>

            {generalError && (
              <div className="rounded-[8px] border border-[#fecdca] bg-[#fef3f2] px-3 py-2">
                <p className="text-[11px] leading-4 text-[#b42318]">
                  {generalError}
                </p>
              </div>
            )}

            {/* CAPTCHA de Clerk */}
            <div
              id="clerk-captcha"
              data-cl-theme="light"
              data-cl-size="flexible"
              data-cl-language="es-es"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-[8px] bg-[#4f46e5] text-white hover:bg-[#4338ca]"
            >
              {isLoading
                ? 'Creando cuenta...'
                : 'Crear cuenta'}
            </Button>

            <p className="text-center text-[10px] leading-4 text-[#667085]">
              Al crear tu cuenta aceptas nuestros Términos y condiciones y la Política de privacidad.
            </p>

            <div className="rounded-[9px] border border-[#c7d2fe] bg-[#eef2ff] p-3">
              <p className="text-[11px] font-semibold text-[#3730a3]">
                Puedes registrarte con Google o con tu correo.
              </p>

              <p className="mt-1 text-[10px] text-[#667085]">
                Después podrás configurar tus preferencias desde tu cuenta.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}