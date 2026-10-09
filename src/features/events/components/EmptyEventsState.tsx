import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'

type EmptyEventsStateProps = {
  filtered?: boolean
  onClearFilter?: () => void
}

export function EmptyEventsState({ filtered = false, onClearFilter }: EmptyEventsStateProps) {
  const navigate = useNavigate()

  return (
    <section className="flex min-h-[460px] w-full items-center justify-center py-5 sm:min-h-[576px]">
      <div className="flex min-h-[340px] w-full max-w-[780px] flex-col items-center rounded-xl border border-border-subtle bg-white px-6 py-10 text-center sm:min-h-[400px] sm:pb-[76px] sm:pt-[54px]">
        <span
          className="text-[52px] leading-[63px] text-[#17212b]"
          aria-hidden="true"
        >
          ＋
        </span>

        <h2 className="mt-[23px] text-[22px] font-bold leading-7 tracking-[-0.015em] text-[#17212b] sm:text-2xl sm:leading-8">
          {filtered ? 'No hay eventos de este tipo' : 'Aún no tienes eventos'}
        </h2>

        <p className="mt-[18px] w-full max-w-[540px] text-sm leading-5 text-[#667085] sm:text-[15px]">
          {filtered
            ? 'Prueba otro tipo o limpia el filtro para ver todos tus eventos.'
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
