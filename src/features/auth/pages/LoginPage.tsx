import {
  CalendarDays,
  Eye,
  LockKeyhole,
} from 'lucide-react'

import { Link } from 'react-router'

import { AuthBrandPanel } from '@/features/auth/components/AuthBrandPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'


type LoginPageProps = {
  showErrors?: boolean
}


export function LoginPage({
  showErrors = false,
}: LoginPageProps) {
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

          </div>


          <div className="mt-9 space-y-6">

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
                defaultValue={
                  showErrors
                    ? 'juan@'
                    : ''
                }
                className={`h-11 rounded-[8px] ${
                  showErrors
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />

              {showErrors && (
                <p className="text-[11px] text-[#d92d20]">
                  Ingresa una dirección de correo válida.
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
                  type="password"
                  defaultValue={
                    showErrors
                      ? '12345678'
                      : ''
                  }
                  className={`h-11 rounded-[8px] pl-10 pr-10 ${
                    showErrors
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />

                <Eye
                  size={17}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
                />
              </div>

              {showErrors && (
                <p className="text-[11px] text-[#d92d20]">
                  Ingresa tu contraseña.
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


            <Button
              type="button"
              className="h-11 w-full rounded-[8px] bg-[#4f46e5] text-white hover:bg-[#4338ca]"
            >
              Iniciar sesión
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
              className="h-11 w-full rounded-[8px]"
            >
              <span className="mr-3 text-lg font-bold text-[#4285f4]">
                G
              </span>

              Continuar con Google
            </Button>


            <p className="pt-1 text-center text-[10px] leading-4 text-[#667085]">
              Al continuar aceptas nuestros{' '}
              <button className="text-[#4f46e5] underline">
                Términos y condiciones
              </button>{' '}
              y la{' '}
              <button className="text-[#4f46e5] underline">
                Política de privacidad.
              </button>
            </p>

          </div>

        </div>

      </section>

    </main>
  )
}