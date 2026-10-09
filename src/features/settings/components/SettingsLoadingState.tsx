import { Skeleton } from '@/components/ui/skeleton'

export function SettingsLoadingState() {
  return (
    <div role="status" aria-label="Cargando configuración de cuenta" className="mt-8 space-y-6">
      <span className="sr-only">Cargando configuración de cuenta…</span>
      <Skeleton className="h-80 w-full rounded-xl" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  )
}
