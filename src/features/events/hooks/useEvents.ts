import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { getEvents } from '@/features/events/services/event.service'
import type { EventsPageData } from '@/features/events/types/event.types'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'

export function useEvents(page = 1, typeId: number | null = null) {
  const requestKey = `${page}:${typeId ?? 'all'}`
  const {
    authenticatedRequest,
    isAuthLoaded,
    isSignedIn,
  } = useAuthenticatedApi()

  const [data, setData] =
    useState<EventsPageData | null>(null)
  const [settledRequest, setSettledRequest] = useState<string | null>(null)

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
            page,
            authenticatedRequest,
            typeId,
          )

        if (version === requestVersion.current) {
          setData(data)
        }
      } catch {
        if (version === requestVersion.current) {
          setError(
            'No pudimos cargar los eventos',
          )
        }
      } finally {
        if (version === requestVersion.current) {
          setIsLoading(false)
          setSettledRequest(requestKey)
        }
      }
    },
    [authenticatedRequest, page, typeId, requestKey],
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
    events: data?.events ?? [],
    pagination: data?.pagination ?? null,
    isLoading:
      isAuthLoaded && !isSignedIn
        ? false
        : isLoading || settledRequest !== requestKey,
    error,
    retry: loadEvents,
  }
}
