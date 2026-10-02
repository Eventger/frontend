import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  getToday,
} from '@/features/today/services/today.service'

import type {
  TodayData,
} from '@/features/today/types/today.types'

import {
  useAuthenticatedApi,
} from '@/features/auth/hooks/useAuthenticatedApi'

export function useToday() {
  const {
    authenticatedRequest,
    isAuthLoaded,
    isSignedIn,
  } = useAuthenticatedApi()

  const [data, setData] =
    useState<TodayData | null>(
      null,
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const requestVersion = useRef(0)

  const loadToday =
    useCallback(async () => {
      const version = ++requestVersion.current

      try {
        setIsLoading(true)
        setError(null)

        const today =
          await getToday(
            authenticatedRequest,
          )

        if (version === requestVersion.current) {
          setData(today)
        }
      } catch {
        if (version === requestVersion.current) {
          setError(
            'No pudimos cargar tus tareas.',
          )
        }
      } finally {
        if (version === requestVersion.current) {
          setIsLoading(false)
        }
      }
    }, [authenticatedRequest])

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
      if (active) void loadToday()
    })

    return () => {
      active = false
      requests.current++
    }
  }, [
    isAuthLoaded,
    isSignedIn,
    loadToday,
  ])

  return {
    data,
    isLoading:
      isAuthLoaded && !isSignedIn
        ? false
        : isLoading,
    error,
    retry: loadToday,
  }
}
