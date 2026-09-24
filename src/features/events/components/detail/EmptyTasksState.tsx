import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type EmptyTasksStateProps = {
  eventName: string
  onAddTask: () => void
}

export function EmptyTasksState({
  eventName,
  onAddTask,
}: EmptyTasksStateProps) {
  return (
    <section className="flex min-h-[400px] flex-col items-center justify-center rounded-[18px] border border-[#dde2ea] bg-white px-5 py-10 text-center">
      <Plus
        className="size-12 text-[#4f46e5]"
        strokeWidth={2}
      />

      <h2 className="mt-6 text-xl font-bold text-[#17212b] sm:text-2xl">
        Aún no tienes tareas para este evento
      </h2>

      <p className="mt-4 max-w-[540px] text-sm leading-6 text-[#667085] sm:text-[15px]">
        Añade las actividades que necesitas realizar para preparar{' '}
        {eventName}.
      </p>

      <Button
        type="button"
        className="mt-7 bg-[#4f46e5] hover:bg-[#4338ca]"
        onClick={onAddTask}
      >
        <Plus />
        Agregar tarea
      </Button>
    </section>
  )
}