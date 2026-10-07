import { useCallback } from 'react'
import { useAuth } from '@clerk/react'

import { apiRequest, type ApiRequestOptions } from '@/lib/api'

export function useAuthenticatedApi({ freshToken = false }: { freshToken?: boolean } = {}) {
  const {
    getToken,
    isLoaded,
    isSignedIn,
  } = useAuth()

  const authenticatedRequest = useCallback(
    async <T>(
      path: string,
      options: ApiRequestOptions = {},
    ): Promise<T> => {
      if (!isLoaded || !isSignedIn) {
        throw new Error(
          'No hay una sesión autenticada disponible',
        )
      }

      const token = freshToken ? await getToken({ skipCache: true }) : await getToken()

      if (!token) {
        throw new Error(
          'No se pudo obtener el token de autenticación',
        )
      }

      const headers =
        new Headers(options.headers)

      headers.set(
        'Authorization',
        `Bearer ${token}`,
      )

      return apiRequest<T>(path, {
        ...options,
        headers,
      })
    },
    [
      getToken,
      isLoaded,
      isSignedIn,
      freshToken,
    ],
  )

  return {
    authenticatedRequest,
    isAuthLoaded: isLoaded,
    isSignedIn,
  }
}
