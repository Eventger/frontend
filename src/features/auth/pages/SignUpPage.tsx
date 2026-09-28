import {
  CalendarDays,
  Eye,
  LockKeyhole,
} from 'lucide-react'

import { Link } from 'react-router'

import { AuthBrandPanel } from '@/features/auth/components/AuthBrandPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'


type SignUpPageProps = {
  showErrors?: boolean
}


export function SignUpPage({
  showErrors = false,
}: SignUpPageProps) {
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


          <div className="mt-5 space-y-5">

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
                <label className="text-[12px] font-medium text-[#17212b]">
                  Nombre
                </label>

                <Input
                  defaultValue={
                    showErrors
                      ? ''
                      : 'Mateo'
                  }
                  className={`h-11 rounded-[8px] ${
                    showErrors
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />

                {showErrors && (
                  <p className="text-[11px] text-[#d92d20]">
                    Ingresa tu nombre.
                  </p>
                )}
              </div>


              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#17212b]">
                  Apellido
                </label>

                <Input
                  defaultValue={
                    showErrors
                      ? ''
                      : 'Noguera'
                  }
                  className={`h-11 rounded-[8px] ${
                    showErrors
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />

                {showErrors && (
                  <p className="text-[11px] text-[#d92d20]">
                    Ingresa tu apellido.
                  </p>
                )}
              </div>

            </div>


            {/* correo */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-[#17212b]">
                Correo electrónico
              </label>

              <Input
                type="email"
                defaultValue={
                  showErrors
                    ? 'mateo@'
                    : ''
                }
                placeholder="nombre@correo.com"
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


            {/* contraseña */}
            <div className="space-y-2">

              <label className="text-[12px] font-medium text-[#17212b]">
                Contraseña
              </label>

              <div className="relative">

                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]"
                />

                <Input
                  type="password"
                  defaultValue="1234"
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

              <p
                className={`text-[11px] ${
                  showErrors
                    ? 'text-[#d92d20]'
                    : 'text-[#667085]'
                }`}
              >
                Usa al menos 8 caracteres.
              </p>

            </div>


            {/* términos */}
            <div>

              <label className="flex items-start gap-3 text-[11px] text-[#17212b]">
                <input
                  type="checkbox"
                  className={`mt-0.5 h-4 w-4 rounded ${
                    showErrors
                      ? 'accent-[#d92d20]'
                      : ''
                  }`}
                />

                <span>
                  Acepto los Términos y condiciones y la Política de privacidad.
                </span>
              </label>

              {showErrors && (
                <p className="ml-7 mt-2 text-[11px] text-[#d92d20]">
                  Debes aceptar los Términos y condiciones y la Política de privacidad.
                </p>
              )}

            </div>


            <Button
              type="button"
              disabled={showErrors}
              className="h-11 w-full rounded-[8px] bg-[#4f46e5] text-white hover:bg-[#4338ca]"
            >
              Crear cuenta
            </Button>


            <p className="text-center text-[10px] leading-4 text-[#667085]">
              Al crear tu cuenta aceptas nuestros Términos y condiciones y la Política de privacidad.
            </p>


            {!showErrors && (
              <div className="rounded-[9px] border border-[#c7d2fe] bg-[#eef2ff] p-3">

                <p className="text-[11px] font-semibold text-[#3730a3]">
                  Puedes registrarte con Google o con tu correo.
                </p>

                <p className="mt-1 text-[10px] text-[#667085]">
                  Después podrás configurar tus preferencias desde tu cuenta.
                </p>

              </div>
            )}

          </div>

        </div>

      </section>

    </main>
  )
}