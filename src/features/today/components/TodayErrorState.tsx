import { LoadErrorState } from '@/components/LoadErrorState'

type TodayErrorStateProps = {
  onRetry: () => void
}

export function TodayErrorState({
  onRetry,
}: TodayErrorStateProps) {
  return (
    <LoadErrorState
      title="No pudimos cargar tus tareas"
      description="Ocurrió un problema al cargar las prioridades de hoy. Intenta nuevamente."
      iconLabel="Error al cargar tareas"
      onRetry={onRetry}
    />
  )
}
