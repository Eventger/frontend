import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type PageHeaderCreateButtonProps = {
  onClick: () => void
}

export function PageHeaderCreateButton({
  onClick,
}: PageHeaderCreateButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      aria-label="Crear evento"
      className="size-11 shrink-0 rounded-full bg-[#4f46e5] p-0 font-semibold text-white hover:bg-[#4338ca] focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/30 md:h-12 md:w-auto md:rounded-lg md:px-5"
    >
      <Plus
        className="size-5"
        aria-hidden="true"
      />

      <span className="hidden md:inline">
        Crear evento
      </span>
    </Button>
  )
}
