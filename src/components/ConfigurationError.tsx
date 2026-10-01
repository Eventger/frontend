import {
  CalendarDays,
} from 'lucide-react'

import { FeedbackIcon } from '@/components/feedback/FeedbackIcon'

type ConfigurationErrorProps = {
  missingVariables: string[]
}

export function ConfigurationError({
  missingVariables,
}: ConfigurationErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-5 py-10">
      <section
        className="w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-[0_16px_45px_rgba(23,33,43,0.12)] sm:p-9"
        role="alert"
        aria-labelledby="configuration-title"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-[10px] bg-[#4f46e5]">
            <CalendarDays
              className="size-6 text-white"
              aria-hidden="true"
            />
          </span>
          <span className="text-xl font-semibold text-[#17212b]">
            Eventger
          </span>
        </div>

        <div className="mt-10 flex items-start gap-3">
          <FeedbackIcon
            variant="warning"
            size="small"
          />
          <div className="min-w-0">
            <h1
              id="configuration-title"
              className="text-pretty text-2xl font-bold text-[#17212b]"
            >
              Falta configurar el entorno local
            </h1>
            <p className="mt-2 text-pretty text-sm leading-6 text-[#475467]">
              Crea un archivo <code>.env</code> en la raíz del frontend y configura estas variables:
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-2" aria-label="Variables faltantes">
          {missingVariables.map(
            (variable) => (
              <li
                key={variable}
                className="break-all rounded-lg bg-[#f2f4f7] px-4 py-3 font-mono text-sm font-medium text-[#344054]"
              >
                {variable}
              </li>
            ),
          )}
        </ul>

        <p className="mt-6 text-sm leading-6 text-[#475467]">
          Puedes partir de <code>.env.example</code>. Después de guardar el archivo, reinicia el servidor de desarrollo.
        </p>
      </section>
    </main>
  )
}
