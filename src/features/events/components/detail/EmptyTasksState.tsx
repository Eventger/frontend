import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type EmptyTasksStateProps = {
  onAddTask: () => void
  onEditEvent: () => void
}

export function EmptyTasksState({
  onAddTask,
  onEditEvent,
}: EmptyTasksStateProps) {
  return (
    <section className="relative flex min-h-[300px] w-full max-w-[1022px] flex-col items-center rounded-[12px] border border-[#d9dee7] bg-white px-5 py-10 text-center sm:pb-[54px] sm:pt-[90px]">
      <h2 className="text-[22px] font-bold leading-7 text-[#17212b] sm:text-[24px] sm:leading-[29px]">
        Aún no tienes tareas para este evento
      </h2>

      <p className="mt-4 w-full max-w-[660px] text-[15px] leading-6 text-[#667085] sm:mt-[21px]">
        Usa “Editar evento” para agregar o modificar las tareas del plan logístico.
      </p>

      <Button
        type="button"
        aria-label="Gestionar tareas del evento"
        className="mt-10 h-11 min-w-[180px] rounded-[10px] bg-[#4f46e5] px-5 font-semibold text-white hover:bg-[#4338ca] sm:mt-[38px]"
        onClick={onEditEvent}
      >
        Editar evento
      </Button>

      <Button
        type="button"
        variant="outline"
        className="pointer-events-none absolute right-5 top-5 h-11 translate-y-1 rounded-[8px] border-[#c7d2fe] bg-white px-3 text-[12px] font-semibold text-[#4f46e5] opacity-0 transition-[opacity,transform] focus-visible:pointer-events-auto focus-visible:translate-y-0 focus-visible:opacity-100"
        onClick={onAddTask}
      >
        <Plus className="size-3.5" />
        Agregar tarea
      </Button>
    </section>
  )
}
