import {
  RefreshCw,
  TriangleAlert,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

type TodayErrorStateProps = {
  onRetry: () => void
}

export function TodayErrorState({
  onRetry,
}: TodayErrorStateProps) {
  return (
    <div className="mx-auto flex min-h-[320px] max-w-[780px] flex-col items-center justify-center rounded-[18px] border border-[#dde2ea] bg-white px-6 text-center">
      <TriangleAlert
        aria-label="Error al cargar tareas"
        className="size-12 text-[#b42318]"
      />

      <h2 className="mt-5 text-xl font-bold text-[#17212b]">
        No pudimos cargar tus tareas
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">
        Ocurrió un problema al cargar
        las prioridades de hoy. Intenta
        nuevamente.
      </p>

      <Button
        type="button"
        onClick={onRetry}
        className="mt-6 h-11 rounded-[10px] bg-[#4f46e5] px-5 text-white hover:bg-[#4338ca]"
      >
        <RefreshCw />
        Reintentar
      </Button>
    </div>
  )
}