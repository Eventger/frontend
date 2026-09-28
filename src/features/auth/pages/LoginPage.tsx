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

import { useSignIn } from '@clerk/react'

import { AuthBrandPanel } from '@/features/auth/components/AuthBrandPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginPage() {
  const navigate = useNavigate()
  const accountCreated =
    sessionStorage.getItem(
      'accountCreated',
    ) === 'true'
  const {
    signIn,
    errors: clerkErrors,
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
      await signIn.password({
        emailAddress: email.trim(),
        password,
      })

    if (error) {
      const clerkEmailError =
        clerkErrors.fields
          ?.emailAddress?.message

      const clerkPasswordError =
        clerkErrors.fields
          ?.password?.message

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
        !clerkEmailError &&
        !clerkPasswordError
      ) {
        setGeneralError(
          'No pudimos iniciar sesión. Verifica tus datos e inténtalo de nuevo.',
        )
      }

      return
    }

    if (
      signIn.status === 'complete'
    ) {
      await signIn.finalize({
        navigate: ({
          session,
        }) => {
          if (
            session?.currentTask
          ) {
            console.log(
              'Clerk session task:',
              session.currentTask,
            )
            return
          }
          sessionStorage.removeItem(
            'accountCreated',
          )
          navigate('/hoy')
        },
      })

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

  return (
    <main className="flex min-h-screen bg-[#f7f8fc]">
      <AuthBrandPanel />

      <section className="flex min-h-screen flex-1 items-center justify-center px-6 py-10">
        <div className="min-h-[760px] w-full max-w-[516px] rounded-[18px] border border-[#dde2ea] bg-white px-8 py-7 shadow-sm">

          {/* Logo superior */}
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

          <div className="mt-16">
            <h1 className="text-[28px] font-bold text-[#17212b]">
              Bienvenido de nuevo
            </h1>

            <p className="mt-1 text-[13px] text-[#667085]">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/crear-cuenta"
                className="font-medium text-[#4f46e5]"
              >
                Crear cuenta
              </Link>
            </p>

            {/* Mensaje después de crear cuenta */}
            {accountCreated && (
              <div className="mt-5 rounded-[8px] border border-[#abefc6] bg-[#ecfdf3] px-4 py-3">
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
            className="mt-9 space-y-6"
            noValidate
          >
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-[12px] font-medium text-[#17212b]"
              >
                Correo electrónico
              </label>

              <Input
                id="login-email"
                type="email"
                placeholder="nombre@correo.com"
                value={email}
                disabled={isLoading}
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  )

                  setEmailError('')
                  setGeneralError('')
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

            {/* Contraseña */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
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
                  id="login-password"
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
                    setGeneralError('')
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

              {passwordError && (
                <p className="text-[11px] text-[#d92d20]">
                  {passwordError}
                </p>
              )}

              <div className="text-right">
                <button
                  type="button"
                  className="text-[12px] font-medium text-[#4f46e5]"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {/* Error general */}
            {generalError && (
              <div className="rounded-[8px] border border-[#fecdca] bg-[#fef3f2] px-3 py-2">
                <p className="text-[11px] leading-4 text-[#b42318]">
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
                ? 'Iniciando sesión...'
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

            {/* Google todavía visual */}
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-[8px]"
            >
              <span className="mr-3 text-lg font-bold text-[#4285f4]">
                G
              </span>

              Continuar con Google
            </Button>

            <p className="pt-1 text-center text-[10px] leading-4 text-[#667085]">
              Al continuar aceptas nuestros{' '}
              <button
                type="button"
                className="text-[#4f46e5] underline"
              >
                Términos y condiciones
              </button>{' '}
              y la{' '}
              <button
                type="button"
                className="text-[#4f46e5] underline"
              >
                Política de privacidad.
              </button>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}