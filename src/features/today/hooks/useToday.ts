import {
  useCallback,
  useEffect,
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

  const loadToday =
    useCallback(async () => {
      try {
        setIsLoading(true)
        setError(null)

        const today =
          await getToday(
            authenticatedRequest,
          )

        setData(today)
      } catch {
        setError(
          'No pudimos cargar tus tareas.',
        )
      } finally {
        setIsLoading(false)
      }
    }, [authenticatedRequest])

  useEffect(() => {
    if (!isAuthLoaded) {
      return
    }

    if (!isSignedIn) {
      setIsLoading(false)
      return
    }

    void loadToday()
  }, [
    isAuthLoaded,
    isSignedIn,
    loadToday,
  ])

  return {
    data,
    isLoading,
    error,
    retry: loadToday,
  }
}