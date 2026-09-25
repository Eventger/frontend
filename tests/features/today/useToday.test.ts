import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useToday } from '@/features/today/hooks/useToday'
import { getToday } from '@/features/today/services/today.service'
import { todayDataFixture } from './today.fixtures'

vi.mock('@/features/today/services/today.service', () => ({
  getToday: vi.fn(),
}))

describe('useToday', () => {
  beforeEach(() => {
    vi.mocked(getToday).mockReset()
  })

  it('comienza cargando y expone los datos obtenidos', async () => {
    vi.mocked(getToday).mockResolvedValue(todayDataFixture)

    const { result } = renderHook(() => useToday())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(getToday).toHaveBeenCalledOnce()
    expect(result.current.data).toEqual(todayDataFixture)
    expect(result.current.error).toBeNull()
  })

  it('expone el error de carga', async () => {
    vi.mocked(getToday).mockRejectedValue(new Error('Error de red'))

    const { result } = renderHook(() => useToday())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('No pudimos cargar tus tareas.')
  })

  it('retry vuelve a cargar y limpia el error después de un éxito', async () => {
    vi.mocked(getToday)
      .mockRejectedValueOnce(new Error('Error de red'))
      .mockResolvedValueOnce(todayDataFixture)

    const { result } = renderHook(() => useToday())

    await waitFor(() => {
      expect(result.current.error).toBe('No pudimos cargar tus tareas.')
    })

    await act(async () => {
      await result.current.retry()
    })

    expect(getToday).toHaveBeenCalledTimes(2)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual(todayDataFixture)
  })
})
