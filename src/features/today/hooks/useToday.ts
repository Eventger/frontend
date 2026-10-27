import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
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

export type UseTodayResult = {
  data: TodayData | null
  setData?: Dispatch<SetStateAction<TodayData | null>>
  isLoading: boolean
  isRefetching?: boolean
  error: string | null
  retry: () => Promise<void>
}

export function useToday(date?: string): UseTodayResult {
  const {
    authenticatedRequest,
    isAuthLoaded,
    isSignedIn,
  } = useAuthenticatedApi()

  const [data, setData] =
    useState<TodayData | null>(
      null,
    )

  const dataRef = useRef<TodayData | null>(null)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isRefetching,
    setIsRefetching,
  ] = useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const requestVersion = useRef(0)

  const loadToday =
    useCallback(async () => {
      const version = ++requestVersion.current

      try {
        if (dataRef.current === null) {
          setIsLoading(true)
        } else {
          setIsRefetching(true)
        }
        setError(null)

        const today =
          await getToday(
            authenticatedRequest,
            date,
          )

        if (version === requestVersion.current) {
          dataRef.current = today
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
          setIsRefetching(false)
        }
      }
    }, [authenticatedRequest, date])

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
    setData,
    isLoading:
      isAuthLoaded && !isSignedIn
        ? false
        : isLoading,
    isRefetching,
    error,
    retry: loadToday,
  }
}
