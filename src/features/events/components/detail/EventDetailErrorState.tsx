import { Button } from '@/components/ui/button'

type EventDetailErrorStateProps = {
  onRetry: () => void
}

export function EventDetailErrorState({
  onRetry,
}: EventDetailErrorStateProps) {
  return (
    <section className="flex min-h-[500px] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#17212b]">
          No pudimos cargar el evento
        </h1>

        <p className="mt-3 text-sm text-[#667085]">
          Ocurrió un problema al consultar la información.
        </p>

        <Button
          type="button"
          className="mt-6"
          onClick={onRetry}
        >
          Reintentar
        </Button>
      </div>
    </section>
  )
}