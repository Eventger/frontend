import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import type {
  Event,
} from '@/features/events/types/event.types'

import {
  getEventById,
} from '@/features/events/services/event.service'

import {
  useAuthenticatedApi,
} from '@/features/auth/hooks/useAuthenticatedApi'

export function useEventDetail(
  eventId: number | null,
) {
  const {
    authenticatedRequest,
    isAuthLoaded,
    isSignedIn,
  } = useAuthenticatedApi()

  const [event, setEvent] =
    useState<Event | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const loadEvent =
    useCallback(async () => {
      if (eventId === null) {
        setEvent(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const data =
          await getEventById(
            eventId,
            authenticatedRequest,
          )

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
    }, [
      eventId,
      authenticatedRequest,
    ])

  useEffect(() => {
    if (!isAuthLoaded) {
      return
    }

    if (!isSignedIn) {
      return
    }

    void Promise.resolve().then(
      loadEvent,
    )
  }, [
    isAuthLoaded,
    isSignedIn,
    loadEvent,
  ])

  return {
    event,
    isLoading:
      isAuthLoaded && !isSignedIn
        ? false
        : isLoading,
    error,
    retry: loadEvent,
  }
}
