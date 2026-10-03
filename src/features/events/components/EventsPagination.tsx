import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { EventPagination } from '@/features/events/types/event.types'

type EventsPaginationProps = {
  pagination: EventPagination
  onPageChange: (page: number) => void
}

export function EventsPagination({ pagination, onPageChange }: EventsPaginationProps) {
  const { page, pageSize, total, totalPages } = pagination
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  if (totalPages <= 1) {
    return (
      <div className="mt-5 text-[13px] leading-5 text-[#667085]" role="status" aria-label="Resumen de eventos" aria-live="polite" aria-atomic="true">
        {total} {total === 1 ? 'evento' : 'eventos'}
      </div>
    )
  }

  return (
    <nav
      aria-label="Paginación de eventos"
      className="mt-6 flex flex-col gap-3 border-t border-[#dde2ea] pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <p className="text-[13px] leading-5 text-[#667085]" role="status" aria-live="polite" aria-atomic="true">
        {first}–{last} de {total} eventos
      </p>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Button
          variant="outline"
          className="h-11 w-11 border-[#dde2ea] bg-white p-0 text-[#667085] hover:border-[#c7d2fe] hover:bg-[#eef2ff] hover:text-[#3730a3] sm:w-auto sm:px-3"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Anterior</span>
        </Button>
        <p className="rounded-[8px] bg-[#eef2ff] px-3 py-2 text-[12px] font-semibold leading-5 text-[#3730a3]" aria-current="page">
          Página {page} de {totalPages}
        </p>
        <Button
          variant="outline"
          className="h-11 w-11 border-[#dde2ea] bg-white p-0 text-[#3730a3] hover:border-[#c7d2fe] hover:bg-[#eef2ff] sm:w-auto sm:px-3"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="sr-only sm:not-sr-only">Siguiente</span>
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
