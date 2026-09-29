import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { getEvents } from '@/features/events/services/event.service'
import type { Event } from '@/features/events/types/event.types'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'

export function useEvents() {
  const {
    authenticatedRequest,
    isAuthLoaded,
    isSignedIn,
  } = useAuthenticatedApi()

  const [events, setEvents] =
    useState<Event[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const loadEvents = useCallback(
    async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data =
          await getEvents(
            authenticatedRequest,
          )

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
    },
    [authenticatedRequest],
  )

  useEffect(() => {
    if (!isAuthLoaded) {
      return
    }

    if (!isSignedIn) {
      setIsLoading(false)
      return
    }

    void loadEvents()
  }, [
    isAuthLoaded,
    isSignedIn,
    loadEvents,
  ])

  return {
    events,
    isLoading,
    error,
    retry: loadEvents,
  }
}