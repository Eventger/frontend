import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'

export function EmptyEventsState() {
  const navigate = useNavigate()

  return (
    <section className="flex min-h-[420px] items-center justify-center">
      <div className="flex w-full max-w-3xl flex-col items-center rounded-2xl border border-[#dde2ea] bg-white px-6 py-14 text-center sm:px-10">
        <Plus className="size-10 text-[#4f46e5]" />

        <h2 className="mt-5 text-lg font-semibold text-[#17212b]">
          Aún no tienes eventos
        </h2>

        <p className="mt-3 max-w-md text-sm text-[#667085]">
          Crea tu primer evento para comenzar a organizarlo.
        </p>

        <Button
          type="button"
          className="mt-8 bg-[#4f46e5] hover:bg-[#4338ca]"
          onClick={() => navigate('/crear')}
        >
          <Plus />
          Crear evento
        </Button>
      </div>
    </section>
  )
}
