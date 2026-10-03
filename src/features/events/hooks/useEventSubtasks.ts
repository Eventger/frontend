import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { getEventSubtasks } from '@/features/events/services/subtasks.service'
import type { Subtask } from '@/features/events/types/subtask.types'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'

export function useEventSubtasks(
  eventId: number | null,
) {
  const {
    authenticatedRequest,
    isAuthLoaded,
    isSignedIn,
  } = useAuthenticatedApi()

  const [subtasks, setSubtasks] =
    useState<Subtask[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [loadedEventId, setLoadedEventId] =
    useState<number | null>(null)

  const requestVersion = useRef(0)

  const loadSubtasks = useCallback(
    async () => {
      const version = ++requestVersion.current

      if (eventId === null) {
        setSubtasks([])
        setError(null)
        setLoadedEventId(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const data =
          await getEventSubtasks(
            eventId,
            authenticatedRequest,
          )

        if (version === requestVersion.current) {
          setSubtasks(data)
        }
      } catch (error) {
        if (version === requestVersion.current) {
          setError(
            error instanceof Error
              ? error.message
              : 'No se pudieron cargar las subtareas',
          )
        }
      } finally {
        if (version === requestVersion.current) {
          setLoadedEventId(eventId)
          setIsLoading(false)
        }
      }
    },
    [
      eventId,
      authenticatedRequest,
    ],
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
      if (active) void loadSubtasks()
    })

    return () => {
      active = false
      requests.current++
    }
  }, [
    isAuthLoaded,
    isSignedIn,
    loadSubtasks,
  ])

  return {
    subtasks,
    isLoading:
      isAuthLoaded && !isSignedIn
        ? false
        : isLoading ||
          (eventId !== null && loadedEventId !== eventId),
    error,
    refresh: loadSubtasks,
  }
}
