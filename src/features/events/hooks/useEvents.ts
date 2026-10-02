import {
  useCallback,
  useEffect,
  useRef,
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

  const requestVersion = useRef(0)

  const loadEvents = useCallback(
    async () => {
      const version = ++requestVersion.current

      try {
        setIsLoading(true)
        setError(null)

        const data =
          await getEvents(
            authenticatedRequest,
          )

        if (version === requestVersion.current) {
          setEvents(data)
        }
      } catch (error) {
        if (version === requestVersion.current) {
          setError(
            error instanceof Error
              ? error.message
              : 'No pudimos cargar los eventos',
          )
        }
      } finally {
        if (version === requestVersion.current) {
          setIsLoading(false)
        }
      }
    },
    [authenticatedRequest],
  )

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
      if (active) void loadEvents()
    })

    return () => {
      active = false
      requests.current++
    }
  }, [
    isAuthLoaded,
    isSignedIn,
    loadEvents,
  ])

  return {
    events,
    isLoading:
      isAuthLoaded && !isSignedIn
        ? false
        : isLoading,
    error,
    retry: loadEvents,
  }
}
