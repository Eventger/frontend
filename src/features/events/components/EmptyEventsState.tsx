import { useNavigate } from 'react-router'
import { CalendarPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type EmptyEventsStateProps = {
  filtered?: boolean
  search?: string
  onClearFilter?: () => void
}

export function EmptyEventsState({ filtered = false, search, onClearFilter }: EmptyEventsStateProps) {
  const navigate = useNavigate()
  const trimmedSearch = search?.trim()

  return (
    <section className="flex min-h-[460px] w-full items-center justify-center py-5 sm:min-h-[576px]">
      <div className="flex min-h-[340px] w-full flex-col items-center rounded-xl border border-border-subtle bg-white px-6 py-10 text-center sm:min-h-[400px] sm:pb-[76px] sm:pt-[54px]">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4f46e5] shadow-xs">
          <CalendarPlus className="size-7 text-[#4f46e5]" aria-hidden="true" />
        </div>

        <h2 className="type-dialog-title mt-6 text-[#17212b]">
          {filtered
            ? (trimmedSearch ? 'No se encontraron eventos' : 'No hay eventos de este tipo')
            : 'Aún no tienes eventos'}
        </h2>

        <p className="mt-[18px] w-full max-w-[540px] text-sm leading-5 text-[#667085] sm:text-[15px]">
          {filtered
            ? (trimmedSearch
                ? `No encontramos eventos que coincidan con "${trimmedSearch}". Prueba con otro término o limpia los filtros.`
                : 'Prueba otro tipo o limpia el filtro para ver todos tus eventos.')
            : 'Crea tu primer evento para organizar sus tareas y hacer seguimiento a su preparación.'}
        </p>

        <Button
          type="button"
          className="mt-[30px] h-11 min-w-[167px] rounded-lg bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca]"
          onClick={() =>
            filtered ? onClearFilter?.() : navigate('/crear', {
              viewTransition: true,
            })
          }
        >
          {!filtered && <span aria-hidden="true">+</span>}
          {filtered ? 'Ver todos los eventos' : 'Crear evento'}
        </Button>
      </div>
    </section>
  )
}
