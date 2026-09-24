import { useEffect, useState } from 'react'

import { getEventTypes } from '@/features/events/services/event.service'
import type { EventType } from '@/features/events/types/event.types'

export function useEventTypes() {
  const [eventTypes, setEventTypes] =
    useState<EventType[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    async function loadEventTypes() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getEventTypes()

        setEventTypes(data)
      } catch {
        setError(
          'No pudimos cargar los tipos de evento.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadEventTypes()
  }, [])

  return {
    eventTypes,
    isLoading,
    error,
  }
}