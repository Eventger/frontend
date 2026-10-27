import { ListTodo } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

interface ProgressEmptyStateProps {
  eventId: number
  eventName: string
}

export function ProgressEmptyState({ eventId, eventName }: ProgressEmptyStateProps) {
  return (
    <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-dashed border-[#d0d5dd] bg-[#fcfcfd] px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#667085]">
          <ListTodo className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#17212b]">
            Aún no tienes subtareas. Crea un plan inicial.
          </p>
          <p className="mt-1 text-sm text-[#667085]">
            Agrega la primera actividad para seguir el avance de {eventName}.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" className="h-11 shrink-0 rounded-lg border-[#d0d5dd] px-4 text-[#3730a3]">
        <Link to={`/evento/${eventId}`} viewTransition>
          Agregar subtarea <span aria-hidden="true" className="ml-1">→</span>
        </Link>
      </Button>
    </div>
  )
}
