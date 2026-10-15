import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProgressErrorStateProps {
  onRetry: () => void
  isRetrying?: boolean
}

export function ProgressErrorState({ onRetry, isRetrying = false }: ProgressErrorStateProps) {
  return (
    <section
      role="alert"
      className="mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center"
    >
      <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#fef3f2] text-[#b42318]">
        <AlertCircle className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-[#17212b]">
        No pudimos cargar el progreso
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">
        Ocurrió un problema al calcular el avance de tus actividades.
      </p>
      <Button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-6 bg-[#4f46e5] text-white hover:bg-[#4338ca]"
      >
        {isRetrying ? 'Reintentando…' : 'Reintentar'}
      </Button>
    </section>
  )
}