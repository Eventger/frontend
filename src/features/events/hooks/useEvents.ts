import { useCallback, useEffect, useState } from 'react'

import { getEvents } from '@/features/events/services/event.service'
import type { Event } from '@/features/events/types/event.types'

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getEvents()

      setEvents(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No pudimos cargar los eventos',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  return {
    events,
    isLoading,
    error,
    retry: loadEvents,
  }
}