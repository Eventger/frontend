import { renderHook } from '@testing-library/react'
import { useAuth } from '@clerk/react'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'
import { apiRequest } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn(),
}))

const getToken = vi.fn()

describe('useAuthenticatedApi', () => {
  beforeEach(() => {
    getToken.mockReset()
    getToken.mockResolvedValue('token-seguro')
    vi.mocked(apiRequest).mockReset()
    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken,
    } as never)
  })

  it('añade el bearer token y conserva los encabezados existentes', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      success: true,
    })
    const { result } = renderHook(() =>
      useAuthenticatedApi(),
    )

    await expect(
      result.current.authenticatedRequest(
        '/events/',
        {
          headers: {
            'X-Request-Id': 'req-1',
          },
        },
      ),
    ).resolves.toEqual({ success: true })

    expect(getToken).toHaveBeenCalledOnce()
    const options = vi.mocked(apiRequest)
      .mock.calls[0][1]
    const headers = new Headers(
      options?.headers,
    )

    expect(
      headers.get('Authorization'),
    ).toBe('Bearer token-seguro')
    expect(headers.get('X-Request-Id')).toBe(
      'req-1',
    )
  })

  it('no llama la API cuando no hay una sesión autenticada', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      getToken,
    } as never)
    const { result } = renderHook(() =>
      useAuthenticatedApi(),
    )

    await expect(
      result.current.authenticatedRequest(
        '/events/',
      ),
    ).rejects.toThrow(
      'No hay una sesión autenticada disponible',
    )
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('rechaza la petición cuando Clerk no entrega un token', async () => {
    getToken.mockResolvedValue(null)
    const { result } = renderHook(() =>
      useAuthenticatedApi(),
    )

    await expect(
      result.current.authenticatedRequest(
        '/events/',
      ),
    ).rejects.toThrow(
      'No se pudo obtener el token de autenticación',
    )
    expect(apiRequest).not.toHaveBeenCalled()
  })
})
