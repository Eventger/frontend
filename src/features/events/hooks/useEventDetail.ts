import { useCallback, useEffect, useState } from 'react'

import type { Event } from '@/features/events/types/event.types'
import { getEventById } from '../services/event.service'

export function useEventDetail(
  eventId: number | null,
) {
  const [event, setEvent] =
    useState<Event | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const loadEvent = useCallback(async () => {
    if (eventId === null) {
      setEvent(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await getEventById(eventId)

      setEvent(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el evento',
      )
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    void loadEvent()
  }, [loadEvent])

  return {
    event,
    isLoading,
    error,
    retry: loadEvent,
  }
}