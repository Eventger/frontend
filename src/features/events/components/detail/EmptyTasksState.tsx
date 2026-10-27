import { ListTodo, Plus } from 'lucide-react'

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
    <section className="relative flex min-h-[300px] w-full flex-col items-center justify-center rounded-xl border border-border-subtle bg-white px-5 py-10 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4f46e5] shadow-xs">
        <ListTodo className="size-7 text-[#4f46e5]" aria-hidden="true" />
      </div>

      <h2 className="type-dialog-title text-[#17212b]">
        Aún no tienes tareas para este evento
      </h2>

      <p className="mt-4 w-full max-w-[660px] text-[15px] leading-6 text-[#667085] sm:mt-[21px]">
        Agrega tareas para organizar el plan logístico o gestiona los detalles generales desde Editar evento.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-9">
        <Button
          type="button"
          className="h-11 min-w-[160px] rounded-lg bg-[#4f46e5] px-5 font-semibold text-white hover:bg-[#4338ca]"
          onClick={onAddTask}
        >
          <Plus className="mr-1.5 size-4" />
          Agregar tarea
        </Button>

        <Button
          type="button"
          variant="outline"
          aria-label="Gestionar tareas del evento"
          className="h-11 min-w-[160px] rounded-lg border-[#dde2ea] bg-white px-5 font-semibold text-[#344054] hover:bg-[#f9fafb]"
          onClick={onEditEvent}
        >
          Editar evento
        </Button>
      </div>
    </section>
  )
}
