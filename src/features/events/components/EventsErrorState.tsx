import { Button } from '@/components/ui/button'

type EventsErrorStateProps = {
  onRetry: () => void
}

export function EventsErrorState({
  onRetry,
}: EventsErrorStateProps) {
  return (
    <section className="flex min-h-[360px] items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[#17212b]">
          No pudimos cargar tus eventos
        </h2>

        <p className="mt-2 text-sm text-[#667085]">
          Intenta nuevamente.
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