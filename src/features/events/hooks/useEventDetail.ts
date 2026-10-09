import {
  useCallback,
  useEffect,
  useRef,
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
import { ApiError } from '@/lib/api'

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

  const requestVersion = useRef(0)

  const loadEvent =
    useCallback(async () => {
      const version = ++requestVersion.current

      if (eventId === null) {
        setEvent(null)
        setError(null)
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

        if (version === requestVersion.current) {
          setEvent(data)
        }
      } catch (error) {
        if (version === requestVersion.current) {
          setEvent(null)

          if (error instanceof ApiError && error.status === 404) {
            setError(null)
          } else {
            setError(
              'No se pudo cargar el evento',
            )
          }
        }
      } finally {
        if (version === requestVersion.current) {
          setIsLoading(false)
        }
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

    const requests = requestVersion
    let active = true
    void Promise.resolve().then(() => {
      if (active) void loadEvent()
    })

    return () => {
      active = false
      requests.current++
    }
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
